import { can, canAccessMeeting, type AuthUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MeetingSchema } from "@/lib/meeting-validation";
import { getElectionRules } from "@/lib/election";

async function handleGET(req: Request, _context: unknown, actor: AuthUser) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const take = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("take") ?? "10"))
  );
  const skip = (page - 1) * take;

  const where: any = {};
  if (!actor.superAdmin) {
    where.userAssignments = { some: { userId: actor.id } };
  }

  if (q) {
    where.title = { contains: q }; // simple case-sensitive search; can adapt for insensitive if needed
  }

  if (status) {
    where.status = status;
  }

  try {
    // Fetch total count and paginated meetings
    const total = await prisma.meeting.count({ where });
    const items = await prisma.meeting.findMany({
      where,
      skip,
      take,
      orderBy: { date: "desc" }, // latest meetings first
    });

    return NextResponse.json({ total, items, page, take });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unknown error" },
      { status: 500 }
    );
  }
}

async function handlePOST(req: Request, _context: unknown, actor: AuthUser) {
  try {
    const body = await req.json();
    const parsed = MeetingSchema.parse(body);
    const rules = getElectionRules(parsed);

    const created = await prisma.meeting.create({
      data: {
        title: parsed.title,
        date: new Date(parsed.date),
        location: parsed.location,
        quorumPct: parsed.quorum,
        firstPassers: parsed.firstPassers,
        secondPassers: parsed.secondPassers,
        winnerCount: rules.mode === "STANDARD" ? rules.winnerCount : null,
        ...(!actor.superAdmin ? {
          userAssignments: { create: { userId: actor.id } },
        } : {}),
      },
    });

    await prisma.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "meeting.created", resource: created.id, meetingId: created.id, status: "SUCCEEDED" } });
    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      // Zod errors
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 400 }
    );
  }
}

export const GET = withPermission("meetings.view", handleGET);

export const POST = withPermission("meetings.create", handlePOST);
