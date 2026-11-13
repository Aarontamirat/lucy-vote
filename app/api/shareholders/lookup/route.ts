import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { canAccessMeeting } from "@/lib/auth";

export const GET = withPermission("shareholders.lookup", async (req, _context, actor) => {
  const url = new URL(req.url);
  const meetingId = url.searchParams.get("meetingId");
  if (!meetingId || !canAccessMeeting(actor, meetingId)) return NextResponse.json({ error: "An accessible meeting is required." }, { status: 403 });
  if (!await prisma.meeting.findUnique({ where: { id: meetingId }, select: { id: true } })) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  const q = (url.searchParams.get("q") ?? "").slice(0, 191);
  const items = await prisma.shareholder.findMany({
    where: q ? { OR: [{ id: { contains: q } }, { name: { contains: q } }, { nameAm: { contains: q } }] } : {},
    select: { id: true, name: true, nameAm: true, shareValue: true }, orderBy: { name: "asc" },
  });
  return NextResponse.json({ items: items.map((item) => ({ ...item, shareValue: item.shareValue.toString() })) });
});
