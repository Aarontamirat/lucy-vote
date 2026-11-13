import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SUPER_ADMIN_ROLE_ID } from "@/lib/permissions";
import { SESSION_IDLE_MS, type AuthUser } from "@/lib/auth";

export class AdminError extends Error {
  constructor(message: string, public status = 400, public code?: string) { super(message); }
}

export async function securityTransaction<T>(actor: AuthUser, operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    const lock = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM SecurityLock WHERE id = 1 FOR UPDATE`;
    if (lock.length !== 1) throw new Error("The security lock has not been initialized.");
    // Recheck the actor after obtaining the lock; a concurrent demotion wins first.
    const current = await tx.user.findUnique({ where: { id: actor.id } });
    if (!current?.active || current.mustChangePassword || current.roleId !== SUPER_ADMIN_ROLE_ID) {
      throw new AdminError("Super Admin access is required.", 403);
    }
    const session = await tx.session.findUnique({ where: { id: actor.sessionId } });
    const now = Date.now();
    if (!session || session.userId !== actor.id || session.expiresAt.getTime() <= now ||
        session.lastSeenAt.getTime() + SESSION_IDLE_MS <= now) {
      throw new AdminError("Sign in to continue.", 401);
    }
    if (session.verifiedAt.getTime() + 10 * 60_000 <= now) {
      throw new AdminError("Confirm your password before changing security settings.", 403, "REAUTH_REQUIRED");
    }
    return operation(tx);
  }, { maxWait: 5000, timeout: 15000 });
}

export async function ensureAdminRemains(tx: Prisma.TransactionClient, id: string, next: { active?: boolean; roleId?: string }) {
  const current = await tx.user.findUnique({ where: { id } });
  if (!current) throw new AdminError("User not found.", 404);
  if (current.active && current.roleId === SUPER_ADMIN_ROLE_ID &&
      (next.active === false || (next.roleId !== undefined && next.roleId !== SUPER_ADMIN_ROLE_ID))) {
    const count = await tx.user.count({ where: { id: { not: id }, active: true, roleId: SUPER_ADMIN_ROLE_ID, mustChangePassword: false } });
    if (count === 0) throw new AdminError("The last active Super Admin cannot be disabled or demoted before another Super Admin has completed account setup.", 409);
  }
  return current;
}
