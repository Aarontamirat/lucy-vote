import type { AuthUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { voterIdentity } from "@/lib/voter-identity";
import { voterAttendance } from "@/lib/voter-attendance";
import { legacyBallots, LEGACY_BALLOT_ERROR } from "@/lib/legacy-ballots";
import { ballotLimitError, getElectionRules, rankElectionResults, type ElectionRules } from "@/lib/election";

const SubmitVotesSchema = z.object({
  voterId: z.string().trim().min(1).max(191),
  nomineeIds: z.array(z.string().min(1)).min(1).max(400).refine(
    (ids) => new Set(ids).size === ids.length,
    "Each nominee can only be selected once.",
  ),
});

const ReverseVotesSchema = SubmitVotesSchema.extend({ reason: z.string().trim().min(5).max(500) }).strict();

async function handlePOST(
  req: Request,
  context: { params: Promise<{ id: string }> },
  actor: AuthUser,
) {
  const { id } = await context.params;
  const meetingId = id;

  try {
    const body = await req.json();
    const parsed = SubmitVotesSchema.parse(body);

    // Check if meeting exists and is open for voting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    if (meeting.status !== "VOTINGOPEN") {
      return NextResponse.json(
        { error: "Meeting not open for voting" },
        { status: 400 }
      );
    }

    const selectedNominees = await prisma.nominee.findMany({
      where: { meetingId, id: { in: parsed.nomineeIds } },
      select: { id: true, type: true },
    });
    if (selectedNominees.length !== parsed.nomineeIds.length) {
      return NextResponse.json(
        { error: "One or more selected nominees do not belong to this meeting." },
        { status: 400 },
      );
    }

    let votingRules: ElectionRules;
    try {
      votingRules = getElectionRules(meeting);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid election rules" }, { status: 400 });
    }

    const enteredIdentity = await voterIdentity(prisma, meetingId, parsed.voterId);
    const attendance = await voterAttendance(prisma, meetingId, enteredIdentity);
    if (!attendance.length) {
      return NextResponse.json({ error: "This shareholder is not registered attending. Register direct or represented attendance and use the shareholder ID printed on that card." }, { status: 403 });
    }
    // MySQL IDs are case-insensitive. Persist the actual shareholder ID from
    // attendance so casing at entry cannot lose representation in reports.
    const shareholderId = attendance[0].shareholderId ?? enteredIdentity.voterId;
    const identity = { voterId: shareholderId, aliases: [shareholderId] };
    const weight = Number(attendance[0].snapshotShareValue);
    const attendedData = {
      snapshotVoterName: attendance[0].snapshotName,
      snapshotVoterShareValue: weight,
    };

    // Reject zero-weight votes
    if (weight <= 0) {
      return NextResponse.json(
        { error: "Vote weight is zero; cannot submit vote." },
        { status: 400 }
      );
    }

    // Transaction: Prevent duplicate votes, create only new ones
    const nomineeIds = parsed.nomineeIds;
    const result = await prisma.$transaction(async (tx) => {
      // Serialize ballot submissions so simultaneous requests cannot exceed the limits.
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
      const currentMeeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (currentMeeting?.status !== "VOTINGOPEN") throw new Error("Meeting not open for voting");
      // Attendance changes use this same meeting lock. Recheck eligibility and
      // weight after acquiring it so a removal cannot race a ballot submission.
      const currentAttendance = await voterAttendance(tx, meetingId, identity);
      if (!currentAttendance.length || Number(currentAttendance[0].snapshotShareValue) !== weight || currentAttendance[0].snapshotName !== attendedData.snapshotVoterName || currentAttendance[0].representedById !== attendance[0].representedById) {
        throw new Error("Voter attendance changed. Look up the voter again before recording votes.");
      }
      if ((await legacyBallots(tx, meetingId, { shareholderIds: [identity.voterId] })).length) throw new Error(LEGACY_BALLOT_ERROR);
      const existing = await tx.vote.findMany({
        where: {
          meetingId,
          voterId: { in: identity.aliases },
        },
        select: { nomineeId: true, nominee: { select: { type: true } } },
      });

      const alreadyVotedSet = new Set(existing.map((e) => e.nomineeId));
      const toCreate = nomineeIds.filter((id) => !alreadyVotedSet.has(id));

      if (toCreate.length === 0) {
        return { created: [], already: nomineeIds };
      }

      const limitError = ballotLimitError([
        ...existing.map((vote) => vote.nominee),
        ...selectedNominees.filter((nominee) => toCreate.includes(nominee.id)),
      ], getElectionRules(currentMeeting));
      if (limitError) throw new Error(limitError);

      const created = [];
      for (const nomineeId of toCreate) {
        const c = await tx.vote.create({
          data: {
            meetingId,
            nomineeId,
            voterId: identity.voterId,
            weight,
            snapshotVoterName: attendedData.snapshotVoterName ?? "",
            snapshotVoterShareValue: attendedData.snapshotVoterShareValue ?? 0,
          },
        });
        created.push(c);
      }

      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "votes.recorded", resource: meetingId, meetingId, status: "SUCCEEDED", details: { voterId: identity.voterId, enteredVoterId: parsed.voterId, representedById: currentAttendance[0].representedById ?? null, nomineeIds: toCreate, weight, createdCount: created.length } } });
      return { created, already: existing.map((e) => e.nomineeId) };
    });

    return NextResponse.json({
      ok: true,
      created: result.created,
      already: result.already,
    });
  } catch (err: any) {
    if (err?.message === LEGACY_BALLOT_ERROR) return NextResponse.json({ error: err.message }, { status: 409 });
    if (err?.issues) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    if (err?.message?.startsWith("This ballot allows up to") || err?.message === "Meeting not open for voting" || err?.message === "Voter attendance changed. Look up the voter again before recording votes.") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to submit votes" },
      { status: 500 }
    );
  }
}

async function handleDELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
  actor: AuthUser,
) {
  const { id: meetingId } = await context.params;
  try {
    const parsed = ReverseVotesSchema.parse(await req.json());
    const result = await prisma.$transaction(async (tx) => {
      // Use the submission lock so a correction cannot race another ballot write.
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
      const meeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) throw new Error("Meeting not found");
      if (meeting.status !== "VOTINGOPEN") {
        throw new Error("Votes can only be reversed while voting is open.");
      }

      // Scope every deletion to this meeting, voter and the explicit choices.
      // Repeated requests are harmless if a choice has already been reversed.
      const identity = await voterIdentity(tx, meetingId, parsed.voterId);
      const previous = await tx.vote.findMany({ where: { meetingId, voterId: { in: identity.aliases }, nomineeId: { in: parsed.nomineeIds } }, select: { nomineeId: true, weight: true } });
      const reversed = await tx.vote.deleteMany({
        where: { meetingId, voterId: { in: identity.aliases }, nomineeId: { in: parsed.nomineeIds } },
      });
      const remaining = await tx.vote.findMany({
        where: { meetingId, voterId: { in: identity.aliases } },
        select: { nomineeId: true },
      });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "votes.reversed", resource: meetingId, meetingId, status: "SUCCEEDED", details: { voterId: parsed.voterId, nomineeIds: parsed.nomineeIds, previousChoices: previous, reason: parsed.reason, reversedCount: reversed.count } } });
      return { reversedCount: reversed.count, voted: remaining.map((vote) => vote.nomineeId) };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to reverse votes";
    const status = message === "Meeting not found" ? 404
      : message === "Votes can only be reversed while voting is open." ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function handleGET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const meetingId = id;
  try {
    // parse optional voterId query param
    const url = new URL(req.url);
    const voterId = url.searchParams.get("voterId");

    // If caller requests votes for a particular voter, return those nomineeIds
    if (url.searchParams.has("voterId")) {
      if (!voterId || voterId.length > 191) return NextResponse.json({ error: "A valid voter ID is required." }, { status: 400 });
      // ensure meeting exists
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });
      if (!meeting)
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );

      const identity = await voterIdentity(prisma, meetingId, voterId);
      // fetch votes by this voter for the meeting
      const votes = await prisma.vote.findMany({
        where: { meetingId, voterId: { in: identity.aliases } },
        select: { nomineeId: true, weight: true },
      });

      const votedNomineeIds = votes.map((v) => v.nomineeId);
      const voterWeight = votes.length ? Number(votes[0].weight) : undefined;
      const olderBallots = await legacyBallots(prisma, meetingId, { shareholderIds: [voterId] });
      let rules: ElectionRules;
      try { rules = getElectionRules(meeting); }
      catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid election rules" }, { status: 400 }); }

      return NextResponse.json({
        meetingStatus: meeting.status,
        voterId,
        voted: votedNomineeIds,
        voterWeight,
        legacyBallots: olderBallots,
        correctionRequired: olderBallots.length > 0,
        maxVotes: rules.winnerCount,
        votingRules: rules.mode === "GROUPED"
          ? {
              mode: "GROUPED",
              firstPassers: meeting.firstPassers,
              secondPassers: meeting.secondPassers,
            }
          : { mode: "STANDARD", winnerCount: rules.winnerCount },
      });
    }

    // Default behavior: aggregated results + total attended shares (unchanged)
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const [nominees, grouped, attendance, voterGroups] = await Promise.all([
      prisma.nominee.findMany({ where: { meetingId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.vote.groupBy({ by: ["nomineeId"], where: { meetingId }, _sum: { weight: true } }),
      prisma.attendance.aggregate({ where: { meetingId }, _sum: { snapshotShareValue: true }, _count: { _all: true } }),
      prisma.vote.groupBy({ by: ["voterId"], where: { meetingId } }),
    ]);
    const weightByNominee = new Map(grouped.map((g) => [g.nomineeId, Number(g._sum.weight ?? 0)]));

    const results = nominees.map((n, index) => {
      return {
        nomineeId: n.id,
        name: n.name,
        nameAm: n.nameAm,
        type: n.type,
        description: n.description,
        totalWeight: weightByNominee.get(n.id) ?? 0,
        registrationOrder: index + 1,
      };
    });

    let rules: ElectionRules | null = null;
    let configurationError: string | null = null;
    try { rules = getElectionRules(meeting); }
    catch (error) { configurationError = error instanceof Error ? error.message : "Invalid election rules"; }

    return NextResponse.json({
      meetingStatus: meeting.status,
      meetingTitle: meeting.title,
      results: rankElectionResults(results, rules, meeting.status === "CLOSED"),
      totalSharesAttended: Number(attendance._sum.snapshotShareValue ?? 0),
      attendeesCount: attendance._count._all,
      ballotsCast: voterGroups.length,
      winnerCount: rules?.winnerCount ?? null,
      configurationError,
      meetingFirstPassers: meeting.firstPassers,
      meetingSecondPassers: meeting.secondPassers,
      votingMode:
        meeting.firstPassers != null &&
        meeting.secondPassers != null &&
        meeting.firstPassers > 0 &&
        meeting.secondPassers > 0
          ? "GROUPED"
          : "STANDARD",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

export const GET = withPermission((req) => new URL(req.url).searchParams.has("voterId") ? "votes.lookup" : ["results.view", "projection.view"], handleGET, { meeting: true });

export const POST = withPermission("votes.record", handlePOST, { meeting: true });

export const DELETE = withPermission("votes.reverse", handleDELETE, { meeting: true });
