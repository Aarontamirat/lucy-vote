import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";

export const GET = withPermission(null, async () => {
  const meetings = await prisma.meeting.findMany({ select: { id: true, title: true, date: true, status: true }, orderBy: { date: "desc" } });
  return NextResponse.json({ meetings });
}, { superAdmin: true });
