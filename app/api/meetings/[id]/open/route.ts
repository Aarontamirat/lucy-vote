import { meetingTransaction } from "@/lib/meeting-transaction";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
      if (meeting.status !== "DRAFT")
        return NextResponse.json(
          { error: "Only draft meetings can be opened" },
          { status: 400 }
        );


      const totalSharesAgg = await tx.shareholder.aggregate({
        _sum: { shareValue: true },
    });

    // Set status to OPEN
    await tx.meeting.update({
      where: { id },
      data: {
        status: "OPEN",
        snapshotTotalShares: totalSharesAgg._sum.shareValue ?? 0,
        snapshotTotalHolders: await tx.shareholder.count(),
      },
    });

    return NextResponse.json({ ok: true });
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to open meeting" },
      { status: 500 }
    );
  }
}

export const POST = withPermission("meetings.open", handlePOST, { meeting: true });
