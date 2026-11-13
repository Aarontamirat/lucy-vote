import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
export function loadTypescript(path, prisma = {}, overrides = {}, cache = new Map()) {
  const absolutePath = resolve(path);
  if (cache.has(absolutePath)) return cache.get(absolutePath).exports;
  const loadedModule = { exports: {} };
  cache.set(absolutePath, loadedModule);
  const source = ts.transpileModule(readFileSync(resolve(path), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const execute = vm.runInThisContext(
    `(function(module, exports, require) {\n${source}\n})`,
    { filename: path },
  );
  const localRequire = createRequire(resolve(path));
  execute(loadedModule, loadedModule.exports, (id) =>
    Object.hasOwn(overrides, id) ? overrides[id] : id === "@/lib/prisma"
      ? { prisma }
      : id.startsWith("@/lib/")
        ? loadTypescript(`${id.slice(2)}.ts`, prisma, overrides, cache)
        : localRequire(id),
  );
  return loadedModule.exports;
}

// Existing business tests explicitly isolate authorization. Security tests use
// loadTypescript above and exercise the real guards with session/database doubles.
export function loadAuthenticatedRoute(path, prisma = {}) {
  const actor = { id: "test-admin", name: "Test Admin", email: "test@example.test", roleId: "super-admin", roleName: "Super Admin", superAdmin: true, accessScope: "ALL", mustChangePassword: false, permissions: [], meetingIds: [], sessionId: "test-session", verifiedAt: Date.now() };
  const auditLog = { create: async () => ({ id: "test-audit" }), update: async () => ({}) };
  function decorate(db) {
    return new Proxy(db, { get(target, key) {
      if (key === "auditLog") return target.auditLog ?? auditLog;
      if (key === "$queryRaw") return target.$queryRaw ?? (async () => []);
      if (key === "$transaction" && !target.$transaction) return (operation) => operation(decorate(target));
      if (key === "$transaction" && target.$transaction) return (operation, ...args) =>
        target.$transaction(typeof operation === "function" ? (tx) => operation(decorate(tx)) : operation, ...args);
      return target[key];
    } });
  }
  return loadTypescript(path, decorate(prisma), { "@/lib/access": { withPermission: (_requirement, handler) => (req, context) => handler(req, context, actor) } });
}
