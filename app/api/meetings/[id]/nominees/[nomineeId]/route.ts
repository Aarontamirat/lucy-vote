import { meetingTransaction } from "@/lib/meeting-transaction";
import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateNomineeSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1),
  description: z.string().optional().nullable(),
});

async function handlePUT(
  req: Request,
  { params }: { params: Promise<{ id: string; nomineeId: string }> }
) {
  const { id, nomineeId } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const body = await req.json();
      const parsed = UpdateNomineeSchema.parse(body);

      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Cannot edit nominee in closed meeting" },
          { status: 400 }
        );
      if (meeting.status === "VOTINGOPEN")
        return NextResponse.json(
          { error: "Cannot edit nominee in voting opened meeting" },
          { status: 400 }
        );

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

      const updated = await tx.nominee.update({
        where: { id: nomineeId, meetingId: id },
        data: {
          ...(parsed.name !== undefined && { name: parsed.name }),
          ...(parsed.type !== undefined && { type: parsed.type }),
          ...(parsed.description !== undefined && {
            description: parsed.description,
          }),
        },
    });

    return NextResponse.json({ ok: true, nominee: updated });
    });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update nominee" },
      { status: 400 }
    );
  }
}

async function handleDELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; nomineeId: string }> }
) {
  const { id, nomineeId } = await params;
  try {
    return await meetingTransaction(id, async (tx) => {
      const meeting = await tx.meeting.findUnique({ where: { id } });
      if (!meeting)
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
      if (meeting.status === "CLOSED")
        return NextResponse.json(
          { error: "Cannot delete nominee from closed meeting" },
          { status: 400 }
        );

      if (meeting.status === "VOTINGOPEN") {
        return NextResponse.json({ error: "Nominees cannot be removed after voting opens." }, { status: 400 });
      }
      const deleted = await tx.nominee.delete({ where: { id: nomineeId, meetingId: id } });
      return NextResponse.json({ ok: true, deleted });
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete nominee" },
      { status: 400 }
    );
  }
}

export const PUT = withPermission("nominees.manage", handlePUT, { meeting: true });

export const DELETE = withPermission("nominees.manage", handleDELETE, { meeting: true });
