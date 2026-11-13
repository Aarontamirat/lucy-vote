import { NextResponse } from "next/server";
import { withPermission } from "@/lib/access";
import { UpdateUserSchema, USER_SELECT } from "@/lib/user-management";
import { SUPER_ADMIN_ROLE_ID } from "@/lib/permissions";
import { securityTransaction, ensureAdminRemains, AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";
import { readJson } from "@/lib/request-json";

type Context = { params: Promise<{ id: string }> };
export const PUT = withPermission(null, async (req, context: Context, actor) => {
  try {
    const { id } = await context.params;
    const body = UpdateUserSchema.parse(await readJson(req, 128_000));
    if (body.roleId !== SUPER_ADMIN_ROLE_ID && body.accessScope !== "ASSIGNED") throw new AdminError("Users must be assigned to specific meetings.");
    if (body.roleId === SUPER_ADMIN_ROLE_ID && body.overrides.length) throw new AdminError("Super Admin permissions cannot be overridden.");
    const user = await securityTransaction(actor, async (tx) => {
      const previous = await ensureAdminRemains(tx, id, body);
      const before = await tx.user.findUniqueOrThrow({ where: { id }, select: USER_SELECT });
      if (!await tx.role.findUnique({ where: { id: body.roleId } })) throw new AdminError("Role not found.", 404);
      await tx.userPermission.deleteMany({ where: { userId: id } });
      await tx.meetingAssignment.deleteMany({ where: { userId: id } });
      const updated = await tx.user.update({ where: { id }, data: {
        name: body.name, email: body.email, roleId: body.roleId, active: body.active,
        accessScope: body.roleId === SUPER_ADMIN_ROLE_ID ? "ALL" : body.accessScope,
        overrides: { create: body.overrides }, meetingAssignments: { create: body.meetingIds.map((meetingId) => ({ meetingId })) },
      }, select: USER_SELECT });
      if (!body.active || previous.roleId !== body.roleId || previous.email !== body.email) {
        await tx.session.deleteMany({ where: { userId: id } });
      }
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "user.updated", resource: id, status: "SUCCEEDED", details: {
        before: { roleId: before.roleId, active: before.active, accessScope: before.accessScope, overrides: before.overrides, meetingIds: before.meetingAssignments.map((item) => item.meetingId) },
        after: { roleId: updated.roleId, active: updated.active, accessScope: updated.accessScope, overrides: body.overrides, meetingIds: body.meetingIds },
      } } });
      return updated;
    });
    return NextResponse.json({ user });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });
