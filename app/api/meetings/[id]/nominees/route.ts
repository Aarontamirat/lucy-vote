import { meetingTransaction } from "@/lib/meeting-transaction";
import { can, type AuthUser } from "@/lib/auth";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getElectionRules, type ElectionRules } from "@/lib/election";

const CreateNomineeSchema = z.object({
  shareholderId: z.string().min(1, "shareholderId is required"),
  type: z.string().min(1, "type is required"),
  description: z.string().optional().nullable(),
});

async function handleGET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
  actor: AuthUser,
) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const nominees = await prisma.nominee.findMany({
      where: { meetingId: id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const shareholders = can(actor, "shareholders.lookup") && can(actor, "nominees.manage") ? await prisma.shareholder.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameAm: true },
    }) : [];

    let electionRules: ElectionRules | null = null;
    let electionRulesError: string | null = null;
    try {
      electionRules = getElectionRules(meeting);
    } catch (error) {
      electionRulesError = error instanceof Error
        ? error.message
        : "The election rules have not been configured.";
    }

    return NextResponse.json({
      meetingStatus: meeting.status,
      items: nominees,
      shareholders,
      meetingName: meeting.title,
      electionRules,
      electionRulesError,
      electionConfig: {
        firstPassers: meeting.firstPassers ?? null,
        secondPassers: meeting.secondPassers ?? null,
        winnerCount: meeting.winnerCount ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get nominees" },
      { status: 500 }
    );
  }
}

async function handlePOST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const body = await req.json();
      const parsed = CreateNomineeSchema.parse(body);

      // 1. Validate meeting
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Cannot add nominee to closed meeting" },
          { status: 400 }
        );

      if (meeting.status === "VOTINGOPEN") {
        return NextResponse.json({ error: "Nominees cannot be added after voting opens." }, { status: 400 });
      }

      const hasGroupedVoting =
        meeting.firstPassers != null &&
        meeting.secondPassers != null &&
        meeting.firstPassers > 0 &&
        meeting.secondPassers > 0;
      if (hasGroupedVoting && !["first", "second"].includes(parsed.type)) {
        return NextResponse.json(
          { error: "Grouped voting nominees must be assigned to Group 1 or Group 2." },
          { status: 400 },
        );
      }

      // 2. Validate shareholder
      const shareholder = await tx.shareholder.findUnique({
        where: { id: parsed.shareholderId },
    });
    if (!shareholder)
      return NextResponse.json(
        { error: "Shareholder not found" },
        { status: 404 }
      );

    // 3. Prevent duplicate nomination for the same shareholder in same meeting
    const existing = await tx.nominee.findFirst({
      where: { meetingId: id, shareholderId: shareholder.id },
    });

    //const existingID = await tx.nominee.findFirst({
    //  where: { meetingId: id, shareholderId: shareholder.id },
    //});

    if (existing)
      return NextResponse.json(
        { error: "This shareholder is already nominated" },
        { status: 400 }
      );

    // 4. Create nominee
    const created = await tx.nominee.create({
      data: {
        name: shareholder.name,
        type: parsed.type,
        description: parsed.description ?? null,
        meetingId: id,
        shareholderId: shareholder.id,
        nameAm: shareholder.nameAm ?? null,
      },
    });

    return NextResponse.json({ ok: true, nominee: created }, { status: 201 });
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to create nominee" },
      { status: 400 }
    );
  }
}

export const GET = withPermission(["nominees.view", "nominees.manage", "votes.lookup"], handleGET, { meeting: true });

export const POST = withPermission("nominees.manage", handlePOST, { meeting: true });
