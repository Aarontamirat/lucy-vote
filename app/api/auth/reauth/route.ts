import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { verifyPassword } from "@/lib/password";
import { reserveAuthAttempt, AuthThrottled } from "@/lib/auth-throttle";
import { readJson } from "@/lib/request-json";

const Schema = z.object({ password: z.string().min(1).max(128) }).strict();
export const POST = withPermission(null, async (req, _context, actor) => {
  try {
    const { password } = Schema.parse(await readJson(req));
    const key = await reserveAuthAttempt(`password:${actor.id}`);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: actor.id } });
    if (!await verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: "Password is incorrect." }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${actor.id} FOR UPDATE`;
      const current = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
      if (!current.active || current.passwordHash !== user.passwordHash) throw new Error("Account changed during password verification.");
      await tx.session.update({ where: { id: actor.sessionId }, data: { verifiedAt: new Date() } });
      await tx.loginThrottle.deleteMany({ where: { key } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "Enter your current password." }, { status: 400 });
    if (error instanceof AuthThrottled) return NextResponse.json({ error: "Too many password attempts. Try again in 15 minutes." }, { status: 429 });
    throw error;
  }
});
