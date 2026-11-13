import { NextResponse } from "next/server";
import { withPermission } from "@/lib/access";
import { SUPER_ADMIN_ROLE_ID } from "@/lib/permissions";
import { securityTransaction, AdminError } from "@/lib/security-admin";
import { adminErrorResponse } from "@/lib/admin-response";
import { readJson } from "@/lib/request-json";
import { RoleSchema } from "@/lib/role-management";

type Context = { params: Promise<{ id: string }> };
export const PUT = withPermission(null, async (req, context: Context, actor) => {
  try {
    const { id } = await context.params;
    if (id === SUPER_ADMIN_ROLE_ID) throw new AdminError("The built-in Super Admin role cannot be modified.", 403);
    const body = RoleSchema.parse(await readJson(req));
    const role = await securityTransaction(actor, async (tx) => {
      const before = await tx.role.findUnique({ where: { id }, include: { permissions: true } });
      if (!before) throw new AdminError("Role not found.", 404);
      const updated = await tx.role.update({ where: { id }, data: { name: body.name, description: body.description } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.rolePermission.createMany({ data: body.permissions.map((permission) => ({ roleId: id, permission })) });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "role.updated", resource: id, status: "SUCCEEDED", details: {
        before: { name: before.name, permissions: before.permissions.map((item) => item.permission) },
        after: { name: body.name, permissions: body.permissions },
      } } });
      return updated;
    });
    return NextResponse.json({ role });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });

export const DELETE = withPermission(null, async (_req, context: Context, actor) => {
  try {
    const { id } = await context.params;
    if (id === SUPER_ADMIN_ROLE_ID) throw new AdminError("The built-in Super Admin role cannot be deleted.", 403);
    await securityTransaction(actor, async (tx) => {
      if (await tx.user.count({ where: { roleId: id } })) throw new AdminError("Assign this role's users to another role before deleting it.", 409);
      const deleted = await tx.role.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: actor.id, actorName: actor.name, action: "role.deleted", resource: id, status: "SUCCEEDED", details: { name: deleted.name } } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return adminErrorResponse(error); }
}, { superAdmin: true });
