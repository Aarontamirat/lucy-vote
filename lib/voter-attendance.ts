import type { Prisma } from "@prisma/client";
import type { voterIdentity } from "@/lib/voter-identity";

export async function voterAttendance(
  db: Pick<Prisma.TransactionClient, "attendance">,
  meetingId: string,
  identity: Awaited<ReturnType<typeof voterIdentity>>,
) {
  return db.attendance.findMany({ where: {
    meetingId,
    shareholderId: identity.voterId,
  }, include: { representedBy: { select: { id: true, name: true } } } });
}
