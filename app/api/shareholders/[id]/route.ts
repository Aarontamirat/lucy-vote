import { withPermission } from "@/lib/access";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const UpdateShareholderSchema = z.object({
name: z.string().min(1).optional(),
nameAm: z.string().min(1).optional(),
phone: z.string().optional().nullable(),
address: z.string().optional().nullable(),
shareValue: z.union([z.string(), z.number()]).optional(),
});


async function handleGET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const item = await prisma.shareholder.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ item: { ...item, shareValue: item.shareValue.toString() } });
    } catch (err: any) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}


async function handlePUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const parsed = UpdateShareholderSchema.parse(body);


        // Prevent empty update
        if (Object.keys(parsed).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }


        const data: any = {};
        if (parsed.name !== undefined) data.name = parsed.name;
        if (parsed.nameAm !== undefined) data.nameAm = parsed.nameAm;
        if (parsed.phone !== undefined) data.phone = parsed.phone;
        if (parsed.address !== undefined) data.address = parsed.address;
        if (parsed.shareValue !== undefined) data.shareValue = parsed.shareValue.toString();


        const updated = await prisma.shareholder.update({ where: { id }, data });


        return NextResponse.json({ ok: true, item: { ...updated, shareValue: updated.shareValue.toString() } });
    } catch (err: any) {
        if (err?.issues) return NextResponse.json({ error: err.issues }, { status: 400 });
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
    }
}


async function handleDELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const deleted = await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM Shareholder WHERE id = ${id} FOR UPDATE`;
            const shareholder = await tx.shareholder.findUnique({ where: { id }, select: { _count: { select: { attendances: true, representedIn: true, shareholderID: true, nomineeID: true } } } });
            if (!shareholder) return "missing";
            if (Object.values(shareholder._count).some((count) => count > 0)) return "in-use";
            await tx.shareholder.delete({ where: { id } });
            return "deleted";
        });
        if (deleted === "missing") return NextResponse.json({ error: "Shareholder not found." }, { status: 404 });
        if (deleted === "in-use") return NextResponse.json({ error: "This shareholder is referenced by meeting records and cannot be deleted." }, { status: 409 });
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
    }
}
export const GET = withPermission("shareholders.view", handleGET);

export const PUT = withPermission("shareholders.edit", handlePUT);

export const DELETE = withPermission("shareholders.delete", handleDELETE);
