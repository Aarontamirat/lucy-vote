import { withPermission } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getElectionRules } from "@/lib/election";
import { NextResponse } from "next/server";

async function handleGET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      select: { id: true, title: true, date: true, firstPassers: true, secondPassers: true, winnerCount: true },
    });
    if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    let votingRules;
    try {
      votingRules = getElectionRules(meeting);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid election rules" }, { status: 400 });
    }

    // One batch for the complete registry. Printing does not register attendance.
    const shareholders = await prisma.shareholder.findMany({
      select: { id: true, name: true, nameAm: true, shareValue: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    return NextResponse.json({
      meeting,
      votingRules,
      shareholders: shareholders.map((s) => ({ ...s, shareValue: s.shareValue.toString() })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load voting cards" }, { status: 500 });
  }
}

export const GET = withPermission("cards.print", handleGET, { meeting: true });
