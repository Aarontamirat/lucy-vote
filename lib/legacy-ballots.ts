import type { Prisma } from "@prisma/client";

export const LEGACY_BALLOT_ERROR = "An older combined representative ballot affects this shareholder. A Super Admin must reverse all its recorded choices while voting is open, then enter each shareholder's original card separately.";

// Never infer separate shareholders' instructions from an old combined ballot.
// Keep historical records intact and prevent double counting until corrected.
export async function legacyBallots(
  db: Pick<Prisma.TransactionClient, "representative" | "attendance" | "vote">,
  meetingId: string,
  scope?: { shareholderIds?: string[]; representativeIds?: string[] },
) {
  const shareholderIds = scope?.shareholderIds ?? [];
  const representativeIds = scope?.representativeIds ?? [];
  if (scope && !shareholderIds.length && !representativeIds.length) return [];
  const representatives = await db.representative.findMany({
    where: scope ? { OR: [
      { id: { in: [...representativeIds, ...shareholderIds] } },
      { shareholderId: { in: shareholderIds } },
      { representedBy: { some: { meetingId, shareholderId: { in: shareholderIds } } } },
    ] } : { OR: [{ registeredForMeetingId: meetingId }, { representedBy: { some: { meetingId } } }] },
    select: { id: true, name: true, shareholderId: true },
  });
  if (!representatives.length) return [];
  const ownIds = representatives.flatMap((rep) => rep.shareholderId ? [rep.shareholderId] : []);
  const [votes, ownAttendance] = await Promise.all([
    db.vote.findMany({ where: { meetingId, voterId: { in: [...representatives.map((rep) => rep.id), ...ownIds] } },
      select: { voterId: true, nomineeId: true, weight: true, snapshotVoterName: true } }),
    db.attendance.findMany({ where: { meetingId, shareholderId: { in: ownIds } },
      select: { shareholderId: true, snapshotShareValue: true } }),
  ]);
  const ownWeight = new Map(ownAttendance.map((row) => [row.shareholderId, Number(row.snapshotShareValue)]));
  const groups = new Map<string, { voterId: string; voterName: string; nomineeIds: string[]; weight: number }>();
  for (const vote of votes) {
    const rep = representatives.find((item) => item.id === vote.voterId || item.shareholderId === vote.voterId);
    if (!rep) continue;
    if (vote.voterId !== rep.id && ownWeight.get(vote.voterId) === Number(vote.weight)) continue;
    const group = groups.get(vote.voterId) ?? { voterId: vote.voterId,
      voterName: vote.snapshotVoterName || rep.name, nomineeIds: [], weight: Number(vote.weight) };
    group.nomineeIds.push(vote.nomineeId);
    groups.set(vote.voterId, group);
  }
  return [...groups.values()];
}
