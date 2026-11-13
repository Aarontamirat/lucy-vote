import { can, canAccessMeeting, type AuthUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { voterIdentity } from "@/lib/voter-identity";
import { voterAttendance } from "@/lib/voter-attendance";
import { legacyBallots, LEGACY_BALLOT_ERROR } from "@/lib/legacy-ballots";
import { representativeMeetingFilter } from "@/lib/representative-access";
import { readJson } from "@/lib/request-json";
import { AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";

const BulkAddAttendanceSchema = z.object({
  shareholderIds: z.array(z.string().trim().min(1).max(191)).min(1).max(1000).optional(),
  shareholderId: z.string().trim().min(1).max(191).optional(),
  representativeId: z.string().trim().min(1).max(191).optional(),
  representativeShareholderId: z.string().trim().min(1).max(191).optional(),
  representativeName: z.string().trim().min(1).max(191).optional(),
}).strict().refine((value) => !(value.representativeId && value.representativeShareholderId), "Choose one representative type.")
  .refine((value) => !value.representativeName || !!value.representativeId, "A representative ID is required with the name.");

async function handleGET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const voterId = new URL(req.url).searchParams.get("voterId");
    if (new URL(req.url).searchParams.has("voterId")) {
      if (!voterId || voterId.length > 191) return NextResponse.json({ error: "A valid voter ID is required." }, { status: 400 });
      const identity = await voterIdentity(prisma, id, voterId);
      const attendance = await voterAttendance(prisma, id, identity);
      return NextResponse.json({ attendance: attendance.map((item) => ({
        shareholderId: item.shareholderId, shareholderName: item.snapshotName,
        representedById: item.representedById,
        representedByName: item.representativeName ?? item.representedBy?.name ?? null,
        shareValue: item.snapshotShareValue.toString(),
      })) });
    }
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const attendanceList = await prisma.attendance.findMany({
      where: { meetingId: id },
      include: {
        representedBy: true,
        shareholder: true, // still included, but no longer trusted for display
      },
      orderBy: { createdAt: "asc" },
    });

    const attendeesCount = attendanceList.length;

    // total shareholders for stats only
    const totalShareholdersCount = await prisma.shareholder.count();

    // total shares in system (live value used only for quorum requirement)
    const totalSharesAgg = await prisma.meeting.aggregate({
      where: { id: id },
      _sum: { snapshotTotalShares: true },
    });
    const totalShares = Number(totalSharesAgg._sum.snapshotTotalShares ?? 0);

    // attendedShares is now based on SNAPSHOT shareValue only
    const attendedShares = attendanceList.reduce(
      (sum, a) => sum + Number(a.snapshotShareValue),
      0
    );

    const quorumPct = meeting.quorumPct ?? 0;
    const required = (totalShares * quorumPct) / 100;
    const quorumMet = totalShares > 0 && attendedShares >= required;

    // We now return snapshot data instead of live shareholder values
    const formatted = attendanceList.map((a) => ({
      id: a.id,
      shareholderId: a.shareholderId,

      shareholderName: a.snapshotName,
      shareholderNameAm: a.snapshotNameAm ?? null,
      shareValue: a.snapshotShareValue.toString(),

      representedById: a.representedById,
      representedByName: a.representedBy?.name ?? a.representativeName ?? null,
      representativeName: a.representativeName,

      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      meetingStatus: meeting.status,
      quorumPct,
      totalShares,
      attendedShares,
      quorumMet,
      attendance: formatted,
      attendeesCount,
      totalShareholdersCount,
      required,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to get attendance" },
      { status: 500 }
    );
  }
}

async function handlePOST(req: Request, context: { params: Promise<{ id: string }> }, actor: AuthUser) {
  const { id: meetingId } = await context.params;
  try {
    const parsed = BulkAddAttendanceSchema.parse(await readJson(req, 128_000));
    const shareholderIds = parsed.shareholderIds ?? (parsed.shareholderId ? [parsed.shareholderId] : []);
    if (!shareholderIds.length || new Set(shareholderIds).size !== shareholderIds.length) throw new AdminError("Select distinct shareholder IDs.");
    const created = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
      const meeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) throw new AdminError("Meeting not found.", 404);
      if (!["OPEN", "VOTINGOPEN"].includes(meeting.status)) throw new AdminError("Open this meeting before registering attendance. Closed meetings cannot be changed.");
      if (await tx.attendance.count({ where: { meetingId, shareholderId: { in: shareholderIds } } })) throw new AdminError("One or more shareholders already attended this meeting.", 409);
      const shareholders = await tx.shareholder.findMany({ where: { id: { in: shareholderIds } } });
      if (shareholders.length !== shareholderIds.length) throw new AdminError("One or more shareholder IDs do not exist.", 404);
      let representative = null;
      if (parsed.representativeShareholderId) {
        const sh = await tx.shareholder.findUnique({ where: { id: parsed.representativeShareholderId } });
        if (!sh) throw new AdminError("Representative shareholder not found.", 404);
        representative = await tx.representative.findFirst({ where: { shareholderId: sh.id } });
        if (!representative) representative = await tx.representative.create({ data: { name: sh.name, phone: sh.phone, shareholderId: sh.id, registeredForMeetingId: meetingId } });
      } else if (parsed.representativeId) {
        representative = await tx.representative.findUnique({ where: { id: parsed.representativeId } });
        if (representative) {
          if (!actor.superAdmin && !await tx.representative.findFirst({ where: { id: representative.id, ...representativeMeetingFilter(meetingId) } })) throw new AdminError("This representative ID is unavailable for this meeting.", 403);
          if (parsed.representativeName && parsed.representativeName !== representative.name) throw new AdminError("This representative ID already exists. Select an existing representative.", 409);
        } else {
          if (!parsed.representativeName) throw new AdminError("Representative not found.", 404);
          if (await tx.shareholder.findUnique({ where: { id: parsed.representativeId } })) throw new AdminError("An external representative ID cannot be a shareholder ID.", 409);
          representative = await tx.representative.create({ data: { id: parsed.representativeId, name: parsed.representativeName, registeredForMeetingId: meetingId } });
        }
      }
      if (await tx.vote.count({ where: { meetingId, voterId: { in: shareholderIds } } })) throw new AdminError("Attendance cannot change the weight of an already recorded shareholder ballot. Reverse that shareholder's votes first.", 409);
      if ((await legacyBallots(tx, meetingId, { shareholderIds, representativeIds: representative ? [representative.id] : [] })).length) throw new AdminError(LEGACY_BALLOT_ERROR, 409);
      const rows = [];
      for (const sh of shareholders) {
        const attendance = await tx.attendance.create({ data: {
          meetingId, shareholderId: sh.id, representedById: representative?.id ?? null,
          representativeName: representative?.name ?? null,
          snapshotName: sh.name, snapshotNameAm: sh.nameAm, snapshotPhone: sh.phone,
          snapshotAddress: sh.address, snapshotShareValue: sh.shareValue,
        } });
        if (representative) await tx.representation.create({ data: { meetingId, representativeId: representative.id, shareholderId: sh.id } });
        rows.push({ id: attendance.id, shareholderId: sh.id, shareholderName: sh.name, shareValue: sh.shareValue.toString(), representedById: representative?.id ?? null, representedByName: representative?.name ?? null, createdAt: attendance.createdAt });
      }
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "attendance.registered", resource: meetingId, meetingId, status: "SUCCEEDED", details: { shareholderIds, representativeId: representative?.id ?? null } } });
      return rows;
    }, { timeout: 15000 });
    return NextResponse.json({ ok: true, created, skipped: [] });
  } catch (error) { return adminErrorResponse(error); }
}

export const GET = withPermission((req) => new URL(req.url).searchParams.has("voterId") ? "votes.lookup" : ["attendance.view", "reports.attendance"], handleGET, { meeting: true });

export const POST = withPermission("attendance.register", handlePOST, { meeting: true });
