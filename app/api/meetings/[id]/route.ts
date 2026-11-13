import { meetingTransaction } from "@/lib/meeting-transaction";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateMeetingSchema } from "@/lib/meeting-validation";
import { getElectionRules } from "@/lib/election";

async function handleGET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // aggregate totals for convenience
    const totalSharesAgg = await prisma.shareholder.aggregate({
      _sum: { shareValue: true },
    });
    const totalShares = totalSharesAgg._sum.shareValue ?? 0;

    // sum shares of attendees for this meeting
    const attendedSharesAgg = await prisma.shareholder.aggregate({
      where: { attendances: { some: { meetingId: id } } },
      _sum: { shareValue: true },
    });
    const attendedShares = attendedSharesAgg._sum.shareValue ?? 0;

    // nominees count
    const nomineesCount = await prisma.nominee.count({
      where: { meetingId: id },
    });

    return NextResponse.json({
      meeting,
      totalShares: totalShares.toString(),
      attendedShares: attendedShares.toString(),
      nomineesCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error" },
      { status: 500 }
    );
  }
}

async function handlePUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const body = await req.json();
      const parsed = UpdateMeetingSchema.parse(body);

      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Cannot edit closed meeting" },
          { status: 400 }
        );
      // Older standard meetings can configure their missing count before the first vote.
      const canConfigureLegacyMeeting = meeting.status === "VOTINGOPEN" &&
        meeting.firstPassers == null && meeting.secondPassers == null &&
        meeting.winnerCount == null && parsed.winnerCount != null &&
        parsed.firstPassers == null && parsed.secondPassers == null &&
        await tx.vote.count({ where: { meetingId: id } }) === 0;
      if (canConfigureLegacyMeeting) {
        const rules = getElectionRules({ winnerCount: parsed.winnerCount });
        const updated = await tx.meeting.update({ where: { id }, data: { winnerCount: rules.winnerCount } });
        return NextResponse.json({ ok: true, item: updated });
      }
      if (meeting.status === "VOTINGOPEN")
        return NextResponse.json(
          { error: "Cannot edit voting open meeting" },
          { status: 400 }
        );
      if (parsed.quorum !== undefined && parsed.quorum > 100)
        return NextResponse.json(
          { error: "Quorum must be between 0 and 100" },
          { status: 400 }
        );
      if (parsed.quorum !== undefined && parsed.quorum < 0)
        return NextResponse.json(
          { error: "Quorum must be between 0 and 100" },
          { status: 400 }
        );
      const nextFirstPassers =
        parsed.firstPassers !== undefined ? parsed.firstPassers : meeting.firstPassers;
      const nextSecondPassers =
        parsed.secondPassers !== undefined ? parsed.secondPassers : meeting.secondPassers;
      const nextWinnerCount = parsed.winnerCount !== undefined ? parsed.winnerCount : meeting.winnerCount;
      const rules = getElectionRules({ firstPassers: nextFirstPassers, secondPassers: nextSecondPassers, winnerCount: nextWinnerCount });

      const data: any = {};
      if (parsed.title !== undefined) data.title = parsed.title;
      if (parsed.date !== undefined) data.date = new Date(parsed.date);
      if (parsed.location !== undefined) data.location = parsed.location;
      if (parsed.quorum !== undefined) data.quorumPct = parsed.quorum;
      if (parsed.firstPassers !== undefined)
        data.firstPassers = parsed.firstPassers;
      if (parsed.secondPassers !== undefined)
        data.secondPassers = parsed.secondPassers;
      data.winnerCount = rules.mode === "STANDARD" ? rules.winnerCount : null;

      const updated = await tx.meeting.update({ where: { id }, data });
      return NextResponse.json({ ok: true, item: updated });
    });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 400 }
    );
  }
}

async function handleDELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Cannot delete closed meeting" },
          { status: 400 }
        );
      if (meeting.status === "VOTINGOPEN")
        return NextResponse.json(
          { error: "Cannot delete voting open meeting" },
          { status: 400 }
        );
      if (meeting.status === "OPEN")
        return NextResponse.json(
          { error: "Cannot delete open meeting" },
          { status: 400 }
        );

      await tx.meeting.delete({ where: { id } });

      return NextResponse.json({ ok: true });
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 400 }
    );
  }
}

export const GET = withPermission("meetings.view", handleGET, { meeting: true });

export const PUT = withPermission("meetings.edit", handlePUT, { meeting: true });

export const DELETE = withPermission("meetings.delete", handleDELETE, { meeting: true });
