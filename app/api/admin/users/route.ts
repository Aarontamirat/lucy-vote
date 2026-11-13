import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/access";
import { hashPassword } from "@/lib/password";
import { CreateUserSchema, USER_SELECT } from "@/lib/user-management";
import { SUPER_ADMIN_ROLE_ID } from "@/lib/permissions";
import { securityTransaction, AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";
import { readJson } from "@/lib/request-json";

export const GET = withPermission(null, async (req) => {
  const url = new URL(req.url);
  const page = Math.max(1, Math.min(100_000, Number(url.searchParams.get("page")) || 1));
  const q = (url.searchParams.get("q") ?? "").slice(0, 191);
  const where = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: USER_SELECT, orderBy: { createdAt: "desc" }, take: 50, skip: (Math.floor(page) - 1) * 50 }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ users, total });
}, { superAdmin: true });

export const POST = withPermission(null, async (req, _context, actor) => {
  try {
    const body = CreateUserSchema.parse(await readJson(req, 128_000));
    if (body.roleId !== SUPER_ADMIN_ROLE_ID && body.accessScope !== "ASSIGNED") throw new AdminError("Users must be assigned to specific meetings.");
    if (body.roleId === SUPER_ADMIN_ROLE_ID && body.overrides.length) throw new AdminError("Super Admin permissions cannot be overridden.");
    const temporaryPassword = body.password ?? randomBytes(24).toString("base64url");
    const passwordHash = await hashPassword(temporaryPassword);
    const user = await securityTransaction(actor, async (tx) => {
      if (!await tx.role.findUnique({ where: { id: body.roleId } })) throw new AdminError("Role not found.", 404);
      const created = await tx.user.create({ data: {
        name: body.name, email: body.email, roleId: body.roleId, active: body.active,
        accessScope: body.roleId === SUPER_ADMIN_ROLE_ID ? "ALL" : body.accessScope, passwordHash,
        overrides: { create: body.overrides },
        meetingAssignments: { create: body.meetingIds.map((meetingId) => ({ meetingId })) },
      }, select: USER_SELECT });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "user.created", resource: created.id, status: "SUCCEEDED", details: {
        roleId: body.roleId, active: body.active, accessScope: created.accessScope, overrides: body.overrides, meetingIds: body.meetingIds,
      } } });
      return created;
    });
    return NextResponse.json({ user, temporaryPassword }, { status: 201 });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });
