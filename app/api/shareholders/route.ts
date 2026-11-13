import { withPermission } from "@/lib/access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating a shareholder
const CreateShareholderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameAm: z.string().min(1),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  shareValue: z.union([z.string(), z.number()]),
});

async function handleGET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const take = Math.min(
    10000,
    Math.max(1, Number(url.searchParams.get("take") ?? "10"))
  );

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nameAm: { contains: q } },
      { phone: { contains: q } },
      { id: { contains: q } },
    ];
  }

  const skip = (page - 1) * take;

  try {
    const [total, items, totalShareSum] = await prisma.$transaction([
      prisma.shareholder.count({ where }),
      prisma.shareholder.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.shareholder.aggregate({ _sum: { shareValue: true } }),
    ]);

    const totalShares = totalShareSum._sum.shareValue ?? 0;

    // Return shareValue as string to avoid Decimal JSON issues
    const itemsSafe = items.map((s) => ({
      ...s,
      shareValue: s.shareValue.toString(),
    }));

    return NextResponse.json({
      total,
      page,
      take,
      items: itemsSafe,
      totalShares: totalShares.toString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unknown error" },
      { status: 500 }
    );
  }
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateShareholderSchema.parse(body);

    // Check if shareholder already exists
    const existing = await prisma.shareholder.findUnique({
      where: { id: parsed.id },
    });
    if (existing)
      return NextResponse.json(
        { error: "Shareholder already exists" },
        { status: 400 }
      );

    // Prisma expects Decimal; string/number is OK if format correct
    const created = await prisma.shareholder.create({
      data: {
        id: parsed.id,
        name: parsed.name,
        nameAm: parsed.nameAm,
        phone: parsed.phone ?? null,
        address: parsed.address ?? null,
        shareValue: parsed.shareValue.toString(),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        item: { ...created, shareValue: created.shareValue.toString() },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.issues) {
      // Zod errors
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 400 }
    );
  }
}

async function handleDELETE(req: Request) {
  try {
    // Check if there are any shareholders in the database
    const count = await prisma.shareholder.count();
    if (count === 0) {
      return NextResponse.json(
        { error: "No shareholders to delete" },
        { status: 400 }
      );
    }

    const deleted = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Shareholder FOR UPDATE`;
      const used = await tx.shareholder.findFirst({ where: { OR: [
        { attendances: { some: {} } }, { representedIn: { some: {} } }, { shareholderID: { some: {} } }, { nomineeID: { some: {} } },
      ] }, select: { id: true } });
      if (used) return false;
      await tx.shareholder.deleteMany({});
      return true;
    });
    if (!deleted) return NextResponse.json({ error: "The registry is referenced by meeting records and cannot be deleted." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete all shareholders" },
      { status: 400 }
    );
  }
}

export const GET = withPermission("shareholders.view", handleGET);

export const POST = withPermission("shareholders.create", handlePOST);

export const DELETE = withPermission("shareholders.deleteAll", handleDELETE);
