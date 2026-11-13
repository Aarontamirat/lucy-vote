import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function handleGET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const attendanceList = await prisma.attendance.findMany({
      where: { meetingId: id },
      include: {
        representedBy: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalShares = Number(meeting.snapshotTotalShares ?? 0);

    const attendedShares = attendanceList.reduce(
      (sum, a) => sum + Number(a.snapshotShareValue),
      0
    );

    const quorumPct = meeting.quorumPct ?? 0;
    const required = (totalShares * quorumPct) / 100;
    const quorumMet = totalShares > 0 && attendedShares >= required;

    const formatted = attendanceList.map((a) => ({
      id: a.id,
      shareholderId: a.shareholderId,
      shareholderName: a.snapshotName,
      shareholderNameAm: a.snapshotNameAm,
      shareValue: a.snapshotShareValue.toString(),
      representedById: a.representedById,
      representedByName: a.representedBy?.name ?? a.representativeName ?? null,
      representativeName: a.representativeName,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      meetingTitle: meeting.title,
      meetingStatus: meeting.status,
      quorumPct,
      totalShares,
      attendedShares,
      quorumMet,
      attendance: formatted,
      attendeesCount: attendanceList.length,
      totalShareholdersCount: meeting.snapshotTotalHolders ?? 0,
      required,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to get attendance" },
      { status: 500 }
    );
  }
}

export const GET = withPermission("reports.attendance", handleGET, { meeting: true });
