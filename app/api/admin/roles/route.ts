import { NextResponse } from "next/server";
import { RoleSchema } from "@/lib/role-management";
import { adminErrorResponse } from "@/lib/admin-response";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { PERMISSIONS } from "@/lib/permissions";
import { securityTransaction } from "@/lib/security-admin";
import { readJson } from "@/lib/request-json";

export const GET = withPermission(null, async () => {
  const roles = await prisma.role.findMany({ include: { permissions: true, _count: { select: { users: true } } }, orderBy: { name: "asc" } });
  return NextResponse.json({ roles, permissions: PERMISSIONS });
}, { superAdmin: true });

export const POST = withPermission(null, async (req, _context, actor) => {
  try {
    const body = RoleSchema.parse(await readJson(req));
    const role = await securityTransaction(actor, async (tx) => {
      const created = await tx.role.create({ data: {
        name: body.name, description: body.description,
        permissions: { create: body.permissions.map((permission) => ({ permission })) },
      } });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "role.created", resource: created.id, status: "SUCCEEDED", details: { name: body.name, permissions: body.permissions } } });
      return created;
    });
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });

