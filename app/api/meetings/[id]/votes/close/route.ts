import { withPermission } from "@/lib/access";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { legacyBallots, LEGACY_BALLOT_ERROR } from '@/lib/legacy-ballots';

async function handlePATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meetingId = id;
  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Meeting WHERE id = ${meetingId} FOR UPDATE`;
      const meeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) throw new Error('Meeting not found');
      if (meeting.status === 'CLOSED') throw new Error('Meeting already closed');

      // Mark meeting as CLOSED
      if ((await legacyBallots(tx, meetingId)).length) throw new Error(LEGACY_BALLOT_ERROR);
      const u = await tx.meeting.update({ where: { id: meetingId }, data: { status: 'CLOSED' } });
      return u;
    });

    return NextResponse.json({ ok: true, meeting: updated });
  } catch (err: any) {
    if (err?.message === LEGACY_BALLOT_ERROR) return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: 'Failed to close voting' }, { status: 500 });
  }
}

export const PATCH = withPermission("meetings.close", handlePATCH, { meeting: true });
