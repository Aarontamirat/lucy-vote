import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";
import { legacyBallots, LEGACY_BALLOT_ERROR } from "@/lib/legacy-ballots";

type Context = { params: Promise<{ id: string; attendanceId: string }> };
export const DELETE = withPermission("attendance.remove", async (_req, context: Context, actor) => {
  const { id: meetingId, attendanceId } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
      const meeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) throw new AdminError("Meeting not found.", 404);
      if (meeting.status === "CLOSED") throw new AdminError("Closed meetings cannot be changed.");
      const attendance = await tx.attendance.findUnique({ where: { id: attendanceId } });
      if (!attendance || attendance.meetingId !== meetingId) throw new AdminError("Attendance not found in this meeting.", 404);
      if (await tx.vote.count({ where: { meetingId, voterId: attendance.shareholderId } })) throw new AdminError("Reverse this shareholder's votes before removing their attendance.", 409);
      if ((await legacyBallots(tx, meetingId, { shareholderIds: [attendance.shareholderId] })).length) throw new AdminError(LEGACY_BALLOT_ERROR, 409);
      await tx.attendance.delete({ where: { id: attendanceId } });
      await tx.representation.deleteMany({ where: { meetingId, shareholderId: attendance.shareholderId } });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "attendance.removed", resource: meetingId, meetingId, status: "SUCCEEDED", details: { attendanceId, shareholderId: attendance.shareholderId, representativeId: attendance.representedById } } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return adminErrorResponse(error); }
}, { meeting: true });
