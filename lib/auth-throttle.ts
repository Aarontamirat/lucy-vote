import { prisma } from "@/lib/prisma";
import { createHash } from "node:crypto";

export class AuthThrottled extends Error {}
export const throttleKey = (scope: string) => createHash("sha256").update(scope).digest("hex");
export async function reserveAuthAttempt(scope: string) {
  const key = throttleKey(scope);
  await prisma.$transaction(async (tx) => {
    const resetAt = new Date(Date.now() + 15 * 60_000);
    // Prisma can emulate an upsert with separate reads and inserts on MySQL.
    // Native SQL serializes simultaneous first attempts without a duplicate-key race.
    await tx.$executeRaw`INSERT INTO LoginThrottle (\`key\`, attempts, resetAt)
      VALUES (${key}, 0, ${resetAt})
      ON DUPLICATE KEY UPDATE attempts = LoginThrottle.attempts`;
    await tx.$queryRaw`SELECT attempts FROM LoginThrottle WHERE LoginThrottle.key = ${key} FOR UPDATE`;
    const record = await tx.loginThrottle.findUniqueOrThrow({ where: { key } });
    const attempts = record.resetAt.getTime() <= Date.now() ? 0 : record.attempts;
    if (attempts >= 5) throw new AuthThrottled();
    await tx.loginThrottle.update({ where: { key }, data: { attempts: attempts + 1, ...(attempts === 0 ? { resetAt } : {}) } });
    await tx.loginThrottle.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } });
  });
  return key;
}
