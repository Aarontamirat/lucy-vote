import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meeting = await prisma.meeting.findUnique({ where: { id }, select: {
      title: true, status: true, quorumPct: true, snapshotTotalShares: true, snapshotTotalHolders: true,
    } });
    if (!meeting) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    const attendance = await prisma.attendance.aggregate({ where: { meetingId: id }, _sum: { snapshotShareValue: true }, _count: { _all: true } });
    const totalShares = Number(meeting.snapshotTotalShares ?? 0);
    const attendedShares = Number(attendance._sum.snapshotShareValue ?? 0);
    const quorumPct = meeting.quorumPct ?? 0;
    const required = totalShares * quorumPct / 100;
    return NextResponse.json({
      meetingTitle: meeting.title, meetingStatus: meeting.status, quorumPct, totalShares, attendedShares,
      quorumMet: totalShares > 0 && attendedShares >= required, required, attendeesCount: attendance._count._all,
      totalShareholdersCount: meeting.snapshotTotalHolders ?? 0,
    }, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Attendance projection failed", error);
    return NextResponse.json({ error: "Projection is temporarily unavailable." }, { status: 503 });
  }
}
