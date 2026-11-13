import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { legacyBallots, LEGACY_BALLOT_ERROR } from "@/lib/legacy-ballots";

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${id} FOR UPDATE`;
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting) throw new Error("Meeting not found");

      if (meeting.status === "CLOSED")
        throw new Error("Meeting already closed");

      // Allow closing if status is OPEN or VOTINGOPEN
      if (meeting.status !== "OPEN" && meeting.status !== "VOTINGOPEN")
        throw new Error("Meeting is not open or in voting");

      // total registered shares
      const totalSharesAgg = await tx.shareholder.aggregate({
        _sum: { shareValue: true },
      });
      const totalShares = Number(totalSharesAgg._sum.shareValue ?? 0);

      // sum of shares for shareholders who have an attendance row in this meeting
      const attendedSharesAgg = await tx.shareholder.aggregate({
        where: { attendances: { some: { meetingId: id } } },
        _sum: { shareValue: true },
      });
      const attendedShares = Number(attendedSharesAgg._sum.shareValue ?? 0);

      const quorumPct = meeting.quorumPct ?? 0; // stored as percentage e.g. 25 for 25%
      const required = (totalShares * quorumPct) / 100;

      if (attendedShares < required) {
        throw new Error(
          `Quorum not met: attended ${attendedShares} < required ${required}`,
        );
      }

      // All good: mark meeting CLOSED
      if ((await legacyBallots(tx, id)).length) throw new Error(LEGACY_BALLOT_ERROR);
      await tx.meeting.update({ where: { id }, data: { status: "CLOSED" } });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.message === LEGACY_BALLOT_ERROR) return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json(
      { error: "Failed to close meeting" },
      { status: 400 },
    );
  }
}

export const POST = withPermission("meetings.close", handlePOST, { meeting: true });
