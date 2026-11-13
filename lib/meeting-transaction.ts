import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// The same lock is used by ballot writes, corrections, attendance changes,
// nominee changes and lifecycle transitions.
export function meetingTransaction<T>(meetingId: string, operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
    return operation(tx);
  }, { timeout: 15000 });
}
