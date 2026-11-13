import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { legacyBallots } from "@/lib/legacy-ballots";

const QuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(500).default(25),
    nomineeId: z.string().min(1).optional(),
    nomineeType: z.enum(["first", "second"]).optional(),
    voterKind: z.enum(["direct", "represented", "legacy", "shareholder", "representative"]).optional(),
    search: z.string().trim().max(100).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    minWeight: z.coerce.number().min(0).optional(),
    maxWeight: z.coerce.number().min(0).optional(),
    sortBy: z.enum(["createdAt", "weight", "nominee"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (query) =>
      query.from === undefined || query.to === undefined || query.from <= query.to,
    { message: "The start date must be before the end date." },
  )
  .refine(
    (query) =>
      query.minWeight === undefined ||
      query.maxWeight === undefined ||
      query.minWeight <= query.maxWeight,
    { message: "The minimum weight cannot exceed the maximum weight." },
  );

async function handleGET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: meetingId } = await params;

  try {
    const query = QuerySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams.entries()),
    );
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        firstPassers: true,
        secondPassers: true,
        winnerCount: true,
      },
    });
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const [representatives, attendances] = await Promise.all([
      prisma.representative.findMany({
        where: { OR: [{ registeredForMeetingId: meetingId }, { representedBy: { some: { meetingId } } }] },
        select: { id: true, name: true, shareholderId: true },
      }),
      prisma.attendance.findMany({ where: { meetingId }, select: {
        shareholderId: true, snapshotName: true, representedById: true, representativeName: true,
      } }),
    ]);
    const olderBallots = await legacyBallots(prisma, meetingId, { representativeIds: representatives.map((rep) => rep.id) });
    const legacyIds = new Set(olderBallots.map((ballot) => ballot.voterId));
    const attendanceById = new Map(attendances.map((row) => [row.shareholderId, row]));
    const validIds = attendances.filter((row) => !legacyIds.has(row.shareholderId)).map((row) => row.shareholderId);

    const where: any = { meetingId };
    if (query.nomineeId) where.nomineeId = query.nomineeId;
    if (query.nomineeType) where.nominee = { is: { type: query.nomineeType } };
    if (query.voterKind === "represented" || query.voterKind === "representative") where.voterId = { in: attendances.filter((row) => row.representedById && !legacyIds.has(row.shareholderId)).map((row) => row.shareholderId) };
    if (query.voterKind === "direct" || query.voterKind === "shareholder") where.voterId = { in: attendances.filter((row) => !row.representedById && !legacyIds.has(row.shareholderId)).map((row) => row.shareholderId) };
    if (query.voterKind === "legacy") where.voterId = { notIn: validIds };
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    if (query.minWeight !== undefined || query.maxWeight !== undefined) {
      where.weight = {
        ...(query.minWeight !== undefined ? { gte: query.minWeight } : {}),
        ...(query.maxWeight !== undefined ? { lte: query.maxWeight } : {}),
      };
    }
    if (query.search) {
      const matchingRepresentativeIds = representatives
        .filter(
          (representative) =>
            representative.id.toLowerCase().includes(query.search!.toLowerCase()) ||
            representative.name.toLowerCase().includes(query.search!.toLowerCase()),
        )
        .map((representative) => representative.id);
      const matchingHolderIds = attendances.filter((row) =>
        (row.representedById && matchingRepresentativeIds.includes(row.representedById)) ||
        row.representativeName?.toLowerCase().includes(query.search!.toLowerCase()),
      ).map((row) => row.shareholderId);
      where.OR = [
        { voterId: { contains: query.search } },
        { snapshotVoterName: { contains: query.search } },
        ...((matchingRepresentativeIds.length || matchingHolderIds.length)
          ? [{ voterId: { in: [...matchingRepresentativeIds, ...matchingHolderIds] } }]
          : []),
      ];
    }

    const orderBy: any =
      query.sortBy === "nominee"
        ? { nominee: { name: query.sortDirection } }
        : { [query.sortBy]: query.sortDirection };
    const [total, votes, voterGroups, nomineeGroups, allNominees, attendanceMetrics] = await Promise.all([
      prisma.vote.count({ where }),
      prisma.vote.findMany({
        where,
        include: { nominee: { select: { id: true, name: true, nameAm: true, type: true } } },
        orderBy: [orderBy, { id: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.vote.groupBy({ by: ["voterId"], where }),
      prisma.vote.groupBy({
        by: ["nomineeId"],
        where,
        _count: { _all: true },
        _sum: { weight: true },
      }),
      prisma.nominee.findMany({
        where: { meetingId },
        select: { id: true, name: true, nameAm: true, type: true },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.aggregate({
        where: { meetingId },
        _count: { _all: true },
        _sum: { snapshotShareValue: true },
      }),
    ]);

    const voterIds = [...new Set(votes.map((vote) => vote.voterId))];
    const shareholders = await prisma.shareholder.findMany({
      where: { id: { in: voterIds } },
      select: { id: true, name: true },
    });
    const representativeById = new Map(representatives.map((item) => [item.id, item]));
    const shareholderById = new Map(shareholders.map((item) => [item.id, item]));
    const nomineeById = new Map(allNominees.map((item) => [item.id, item]));

    const rows = votes.map((vote) => {
      const representative = representativeById.get(vote.voterId);
      const shareholder = shareholderById.get(vote.voterId);
      const attended = attendanceById.get(vote.voterId);
      const legacy = legacyIds.has(vote.voterId) || !attended;
      const representedBy = attended?.representedById ? representativeById.get(attended.representedById) : null;
      return {
        id: vote.id,
        createdAt: vote.createdAt,
        voterId: vote.voterId,
        voterName:
          vote.snapshotVoterName || attended?.snapshotName || representative?.name || shareholder?.name || "Unknown voter",
        voterKind: legacy ? "legacy" : attended?.representedById ? "represented" : "direct",
        representedById: attended?.representedById ?? null,
        representedByName: attended?.representativeName ?? representedBy?.name ?? null,
        legacyCombined: legacy,
        voterShareValue: Number(vote.snapshotVoterShareValue),
        nomineeId: vote.nomineeId,
        nomineeName: vote.nominee.name,
        nomineeNameAm: vote.nominee.nameAm,
        nomineeType: vote.nominee.type,
        weight: Number(vote.weight),
      };
    });
    const nomineeSummary = nomineeGroups
      .map((group) => {
        const nominee = nomineeById.get(group.nomineeId);
        return {
          nomineeId: group.nomineeId,
          nomineeName: nominee?.name ?? "Deleted nominee",
          nomineeType: nominee?.type ?? "unknown",
          voteCount: group._count._all,
          totalWeight: Number(group._sum.weight ?? 0),
        };
      })
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    const totalWeight = nomineeSummary.reduce((sum, item) => sum + item.totalWeight, 0);

    return NextResponse.json({
      meeting,
      votingMode:
        meeting.firstPassers != null && meeting.secondPassers != null
          ? "GROUPED"
          : "STANDARD",
      filters: query,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
      metrics: {
        voteCount: total,
        uniqueVoters: voterGroups.length,
        totalWeight,
        nomineesReceivingVotes: nomineeSummary.length,
        attendees: attendanceMetrics._count._all,
        attendedShareValue: Number(attendanceMetrics._sum.snapshotShareValue ?? 0),
      },
      rows,
      nomineeSummary,
      filterOptions: { nominees: allNominees },
    });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message ?? "Failed to generate voting report" },
      { status: 500 },
    );
  }
}

export const GET = withPermission("reports.voting", handleGET, { meeting: true });
