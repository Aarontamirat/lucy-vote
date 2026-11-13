import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getElectionRules, rankElectionResults, type ElectionRules } from "@/lib/election";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Ignore query parameters and never return individual ballot records.
    const meeting = await prisma.meeting.findUnique({ where: { id }, select: {
      title: true, status: true, winnerCount: true, firstPassers: true, secondPassers: true,
    } });
    if (!meeting) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    const [nominees, totals, attendance, ballots] = await Promise.all([
      prisma.nominee.findMany({ where: { meetingId: id }, select: { id: true, name: true, nameAm: true, type: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.vote.groupBy({ by: ["nomineeId"], where: { meetingId: id }, _sum: { weight: true } }),
      prisma.attendance.aggregate({ where: { meetingId: id }, _sum: { snapshotShareValue: true }, _count: { _all: true } }),
      prisma.vote.groupBy({ by: ["voterId"], where: { meetingId: id } }),
    ]);
    const weights = new Map(totals.map((item) => [item.nomineeId, Number(item._sum.weight ?? 0)]));
    const rows = nominees.map((item, index) => ({
      nomineeId: item.id, name: item.name, nameAm: item.nameAm, type: item.type,
      totalWeight: weights.get(item.id) ?? 0, registrationOrder: index + 1,
    }));
    let rules: ElectionRules | null = null;
    let configurationError: string | null = null;
    try { rules = getElectionRules(meeting); } catch (error) { configurationError = error instanceof Error ? error.message : "Invalid election rules."; }
    return NextResponse.json({
      meetingTitle: meeting.title, meetingStatus: meeting.status, results: rankElectionResults(rows, rules, meeting.status === "CLOSED"),
      totalSharesAttended: Number(attendance._sum.snapshotShareValue ?? 0), attendeesCount: attendance._count._all,
      ballotsCast: ballots.length, winnerCount: rules?.winnerCount ?? null, configurationError,
      meetingFirstPassers: meeting.firstPassers, meetingSecondPassers: meeting.secondPassers,
      votingMode: rules?.mode ?? "STANDARD",
    }, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Election projection failed", error);
    return NextResponse.json({ error: "Projection is temporarily unavailable." }, { status: 503 });
  }
}
