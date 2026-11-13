import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";

export const GET = withPermission("audit.view", async (req, _context, actor) => {
  const url = new URL(req.url);
  const page = Math.max(1, Math.min(100_000, Math.floor(Number(url.searchParams.get("page")) || 1)));
  const where = actor.superAdmin ? {} : { OR: [
    { meetingId: { in: actor.meetingIds } },
    { actorId: actor.id, action: { startsWith: "auth." } },
  ] };
  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50, skip: (page - 1) * 50 }),
    prisma.auditLog.count({ where }),
  ]);
  return NextResponse.json({ entries, total, page });
});
