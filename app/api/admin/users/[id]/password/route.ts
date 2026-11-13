import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { withPermission } from "@/lib/access";
import { hashPassword } from "@/lib/password";
import { securityTransaction, AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";

type Context = { params: Promise<{ id: string }> };
export const POST = withPermission(null, async (_req, context: Context, actor) => {
  try {
    const { id } = await context.params;
    if (id === actor.id) throw new AdminError("Change your own password from your account settings.");
    const temporaryPassword = randomBytes(24).toString("base64url");
    const passwordHash = await hashPassword(temporaryPassword);
    await securityTransaction(actor, async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${id} FOR UPDATE`;
      await tx.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "user.password.reset", resource: id, status: "SUCCEEDED" } });
    });
    return NextResponse.json({ temporaryPassword });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });
