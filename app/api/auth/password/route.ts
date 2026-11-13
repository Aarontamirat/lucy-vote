import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { setSessionCookie, SESSION_DURATION_MS, tokenHash } from "@/lib/auth";
import { PasswordSchema } from "@/lib/auth-validation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { reserveAuthAttempt, AuthThrottled } from "@/lib/auth-throttle";
import { readJson } from "@/lib/request-json";

const ChangeSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: PasswordSchema }).strict();

export const POST = withPermission(null, async (req, _context, actor) => {
  try {
    const body = ChangeSchema.parse(await readJson(req));
    const key = await reserveAuthAttempt(`password:${actor.id}`);
    const current = await prisma.user.findUniqueOrThrow({ where: { id: actor.id } });
    if (!await verifyPassword(body.currentPassword, current.passwordHash)) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    if (body.currentPassword === body.newPassword) return NextResponse.json({ error: "Choose a different password." }, { status: 400 });
    const passwordHash = await hashPassword(body.newPassword);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${actor.id} FOR UPDATE`;
      const locked = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
      const session = await tx.session.findUnique({ where: { id: actor.sessionId } });
      if (!locked.active || !session || locked.passwordHash !== current.passwordHash) throw new Error("Credentials changed during password update.");
      await tx.loginThrottle.deleteMany({ where: { key } });
      await tx.user.update({ where: { id: actor.id }, data: { passwordHash, mustChangePassword: false } });
      await tx.session.deleteMany({ where: { userId: actor.id } });
      await tx.session.create({ data: { userId: actor.id, tokenHash: tokenHash(token), expiresAt } });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "auth.password.changed", resource: actor.id, status: "SUCCEEDED" } });
    });
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "Use a password between 12 and 128 characters." }, { status: 400 });
    if (error instanceof AuthThrottled) return NextResponse.json({ error: "Too many password attempts. Try again in 15 minutes." }, { status: 429 });
    throw error;
  }
}, { allowPasswordChange: true });
