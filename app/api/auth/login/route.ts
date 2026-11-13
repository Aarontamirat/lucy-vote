import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  checkOrigin,
  setSessionCookie,
  SESSION_DURATION_MS,
  tokenHash,
} from "@/lib/auth";
import { EmailSchema } from "@/lib/auth-validation";
import { verifyPassword } from "@/lib/password";
import { reserveAuthAttempt, AuthThrottled } from "@/lib/auth-throttle";
import { readJson } from "@/lib/request-json";

const LoginSchema = z
  .object({ email: EmailSchema, password: z.string().min(1).max(128) })
  .strict();
class InvalidCredentials extends Error {}

export async function POST(req: Request) {
  const originError = checkOrigin(req);
  if (originError) return originError;
  try {
    const { email, password } = LoginSchema.parse(await readJson(req));
    const key = await reserveAuthAttempt(`login:${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash);
    if (!user || !valid || !user.active) {
      await prisma.auditLog.create({
        data: {
          actorId: null,
          action: "auth.login",
          resource: key,
          status: "REJECTED",
        },
      });
      throw new InvalidCredentials();
    }
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: user.id } });
      if (!current?.active || current.passwordHash !== user.passwordHash)
        throw new InvalidCredentials();
      await tx.session.create({
        data: { userId: user.id, tokenHash: tokenHash(token), expiresAt },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "auth.login",
          resource: user.id,
          status: "SUCCEEDED",
        },
      });
      await tx.loginThrottle.deleteMany({ where: { key } });
      // Bound stale session and throttle records without relying on a scheduler.
      await tx.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      await tx.loginThrottle.deleteMany({
        where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } },
      });
    });
    const response = NextResponse.json(
      { ok: true, mustChangePassword: user.mustChangePassword },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    if (error instanceof AuthThrottled)
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again in 15 minutes." },
        {
          status: 429,
          headers: { "Retry-After": "900", "Cache-Control": "no-store" },
        },
      );
    if (error instanceof InvalidCredentials)
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return NextResponse.json(
        { error: "Enter a valid email and password." },
        { status: 400 },
      );
    console.error("Sign-in failed", error);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
