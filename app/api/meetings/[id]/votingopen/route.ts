import { meetingTransaction } from "@/lib/meeting-transaction";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { getElectionRules } from "@/lib/election";

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

      // Check if meeting is in DRAFT status
      if (meeting.status === "DRAFT")
        return NextResponse.json(
          {
            error:
              "Meeting is not open yet. Meeting must be open before opening voting.",
          },
          { status: 400 },
        );

      // Check if meeting is already voting open
      if (meeting.status === "VOTINGOPEN")
        return NextResponse.json(
          { error: "Voting is already opened" },
          { status: 400 },
        );

      // Check if meeting is already closed
      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Meeting is already closed" },
          { status: 400 },
        );

      try {
        getElectionRules(meeting);
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid election rules" }, { status: 400 });
      }

      const totalSharesAgg = await tx.shareholder.aggregate({
        _sum: { shareValue: true },
    });

    // Set status to OPEN
    await tx.meeting.update({
      where: { id },
      data: {
        status: "VOTINGOPEN",
        snapshotTotalShares: totalSharesAgg._sum.shareValue ?? 0,
        snapshotTotalHolders: await tx.shareholder.count(),
      },
    });

    return NextResponse.json({ ok: true });
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to open meeting" },
      { status: 500 },
    );
  }
}

export const POST = withPermission("meetings.openVoting", handlePOST, { meeting: true });
