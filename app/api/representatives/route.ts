import { can, canAccessMeeting, type AuthUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";
// app/api/representatives/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { representativeMeetingFilter } from "@/lib/representative-access";
import { readJson } from "@/lib/request-json";

const CreateRepSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  shareholderId: z.string().optional().nullable(),
});

async function handleGET(req: Request, _context: unknown, actor: AuthUser) {
  try {
    const meetingId = new URL(req.url).searchParams.get("meetingId");
    if (!meetingId || !canAccessMeeting(actor, meetingId)) return NextResponse.json({ error: "An accessible meeting is required." }, { status: 403 });
    if (!await prisma.meeting.findUnique({ where: { id: meetingId }, select: { id: true } })) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
    const items = await prisma.representative.findMany({ where: actor.superAdmin ? {} : representativeMeetingFilter(meetingId), orderBy: { createdAt: 'desc' }, select: { id: true, name: true, shareholderId: true } });
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

async function handlePOST(req: Request, _context: unknown, actor: AuthUser) {
  try {
    const meetingId = new URL(req.url).searchParams.get("meetingId");
    if (!meetingId || !canAccessMeeting(actor, meetingId)) return NextResponse.json({ error: "An accessible meeting is required." }, { status: 403 });
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }, select: { status: true } });
    if (!meeting || !["OPEN", "VOTINGOPEN"].includes(meeting.status)) return NextResponse.json({ error: "Attendance is not open for this meeting." }, { status: 400 });
    const body = await readJson(req);
    const parsed = CreateRepSchema.parse(body);
    const created = await prisma.representative.create({
      data: {
        name: parsed.name,
        phone: parsed.phone ?? null,
        shareholderId: parsed.shareholderId ?? null,
        registeredForMeetingId: meetingId,
      },
    });
    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}

export const GET = withPermission(["attendance.view", "attendance.register"], handleGET);

export const POST = withPermission("attendance.register", handlePOST);
