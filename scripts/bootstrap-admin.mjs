import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const definitions = JSON.parse(readFileSync(new URL("../config/default-roles.json", import.meta.url), "utf8"));
const derive = promisify(scrypt);

export async function bootstrapAdmin(db, email, name, { recoverPending = false } = {}) {
  email = email.trim().toLowerCase(); name = name.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191 || !name || name.length > 191) throw new Error("Provide a valid email and display name.");
  const temporaryPassword = randomBytes(24).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  const key = await derive(temporaryPassword, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const passwordHash = `scrypt$32768$8$1$${salt}$${key.toString("hex")}`;
  const user = await db.$transaction(async (tx) => {
    const lock = await tx.$queryRaw`SELECT id FROM SecurityLock WHERE id = 1 FOR UPDATE`;
    if (lock.length !== 1) throw new Error("Apply the RBAC migration before creating the first administrator.");
    const count = await tx.user.count();
    if (count) {
      if (!recoverPending || count !== 1) throw new Error("Bootstrap is disabled after the first account is created. Use an existing Super Admin to manage users.");
      const pending = await tx.user.findUnique({ where: { email } });
      if (!pending?.active || pending.name !== name || pending.roleId !== "super-admin" || !pending.mustChangePassword ||
          await tx.session.count({ where: { userId: pending.id } }) ||
          await tx.auditLog.findFirst({ where: { actorId: pending.id, action: "auth.login", status: "SUCCEEDED" } }) ||
          !await tx.auditLog.findFirst({ where: { actorId: pending.id, action: "user.bootstrapped", status: "SUCCEEDED" } })) {
        throw new Error("Only the original, unused Super Admin bootstrap account can have its temporary password reissued.");
      }
      const recovered = await tx.user.update({ where: { id: pending.id }, data: { passwordHash }, select: { id: true, email: true, name: true } });
      await tx.auditLog.create({ data: { actorId: pending.id, actorName: name, action: "user.bootstrap.password.reissued", resource: pending.id, status: "SUCCEEDED" } });
      return recovered;
    }
    for (const role of definitions) {
      await tx.role.create({ data: { id: role.id, name: role.name, description: role.description, permissions: { create: role.permissions.map((permission) => ({ permission })) } } });
    }
    const created = await tx.user.create({ data: { email, name, passwordHash, roleId: "super-admin", accessScope: "ALL", mustChangePassword: true }, select: { id: true, email: true, name: true } });
    await tx.auditLog.create({ data: { actorId: created.id, actorName: name, action: "user.bootstrapped", resource: created.id, status: "SUCCEEDED" } });
    return created;
  }, { timeout: 15000 });
  return { user, temporaryPassword, mustChangePassword: true };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const db = new PrismaClient();
  try {
    const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" }, "recover-pending": { type: "boolean", default: false }, "credentials-file": { type: "string" } } });
    if (!values.email || !values.name) throw new Error("Usage: npm run setup:admin -- --email admin@example.com --name \"Display Name\"");
    const result = await bootstrapAdmin(db, values.email, values.name, { recoverPending: values["recover-pending"] });
    if (values["credentials-file"]) {
      const credentialsPath = resolve(values["credentials-file"]);
      await mkdir(dirname(credentialsPath), { recursive: true });
      await writeFile(credentialsPath, `Lucy Voting System — initial sign-in\n\nEmail: ${result.user.email}\nDisplay name: ${result.user.name}\nTemporary password: ${result.temporaryPassword}\n\nSign in at /login and replace this password when prompted.\nRemove this file after the password has been changed.\n`, { mode: 0o600 });
      console.log(`Super Admin ready. Temporary credentials saved to ${credentialsPath}`);
    } else console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  } finally { await db.$disconnect(); }
}
