import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { loadTypescript } from "./helpers/load-typescript.mjs";

const token = "a".repeat(64);
const context = { params: Promise.resolve({ id: "meeting-a" }) };
function request(method = "GET", path = "/api/meetings/meeting-a", cookie = true, origin = "http://localhost") {
  return new Request(`http://localhost${path}`, { method, headers: {
    ...(cookie ? { cookie: `voting-session=${token}` } : {}),
    ...(method !== "GET" ? { origin, "content-type": "application/json" } : {}),
  }, ...(method !== "GET" ? { body: "{}" } : {}) });
}
function database({ roleId = "vote-operator", permissions = ["meetings.view", "votes.lookup", "votes.record"], overrides = [], active = true, mustChangePassword = false } = {}) {
  const user = { id: "user-a", email: "user@example.test", name: "User A", roleId, active, mustChangePassword,
    accessScope: "ASSIGNED", role: { name: roleId, permissions: permissions.map((permission) => ({ permission })) },
    overrides, meetingAssignments: [{ meetingId: "meeting-a" }] };
  const session = { id: "session-a", userId: user.id, user, expiresAt: new Date(Date.now() + 3600_000), lastSeenAt: new Date(), verifiedAt: new Date() };
  const audits = [];
  const db = { session: { findUnique: async () => session, updateMany: async () => ({ count: 1 }) },
    auditLog: { create: async ({ data }) => { audits.push(data); return { id: "audit-a" }; }, update: async ({ data }) => { audits.push(data); } } };
  return { db, user, session, audits };
}

async function withAuthEnvironment(nodeEnv, origin, run) {
  const previous = { NODE_ENV: process.env.NODE_ENV, AUTH_ORIGIN: process.env.AUTH_ORIGIN };
  try {
    process.env.NODE_ENV = nodeEnv;
    if (origin === undefined) delete process.env.AUTH_ORIGIN;
    else process.env.AUTH_ORIGIN = origin;
    await run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function cookieResponse() {
  const response = { cookies: { set: (...args) => { response.args = args; } } };
  return response;
}

test("every private API method rejects unauthenticated direct requests", async () => {
  const paths = readdirSync("app/api", { recursive: true }).filter((path) => path.endsWith("route.ts") && !path.startsWith(`public${process.platform === "win32" ? "\\" : "/"}`) && !path.includes(join("auth", "login")));
  let checked = 0;
  for (const path of paths) {
    const route = loadTypescript(join("app/api", path));
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      if (!route[method]) continue;
      const response = await route[method](request(method, "/api/test", false), context);
      assert.equal(response.status, 401, `${path} ${method}`);
      checked++;
    }
  }
  assert.ok(checked >= 40, `Covered ${checked} protected methods`);
});

test("the seven default roles follow the approved sensitive-action policy", () => {
  const { DEFAULT_ROLES } = loadTypescript("lib/default-roles.ts");
  const { isPermission, isReservedPermission } = loadTypescript("lib/permissions.ts");
  assert.equal(DEFAULT_ROLES.length, 7);
  for (const role of DEFAULT_ROLES) {
    assert.ok(role.permissions.every(isPermission));
    if (role.id !== "super-admin") assert.ok(!role.permissions.some(isReservedPermission), role.name);
  }
});

test("individual denials override roles, unknown grants fail closed, and sensitive grants never apply", () => {
  const { effectivePermissions } = loadTypescript("lib/permissions.ts");
  const { user } = database({ permissions: ["votes.record", "votes.reverse"], overrides: [
    { permission: "votes.record", effect: "DENY" }, { permission: "results.view", effect: "GRANT" },
    { permission: "attendance.remove", effect: "GRANT" }, { permission: "security.manage", effect: "GRANT" },
  ] });
  assert.deepEqual(effectivePermissions(user), ["results.view"]);
});

test("roles and user overrides reject unknown, duplicate and Super Admin-only grants", () => {
  const { RoleSchema } = loadTypescript("lib/role-management.ts");
  const { OverridesSchema } = loadTypescript("lib/auth-validation.ts");
  const role = { name: "Custom", description: "Custom role", permissions: ["meetings.view"] };
  assert.ok(RoleSchema.safeParse(role).success);
  for (const permissions of [["security.manage"], ["votes.reverse"], ["meetings.view", "meetings.view"]]) assert.equal(RoleSchema.safeParse({ ...role, permissions }).success, false);
  assert.equal(OverridesSchema.safeParse([{ permission: "shareholders.delete", effect: "GRANT" }]).success, false);
  assert.equal(OverridesSchema.safeParse([{ permission: "results.view", effect: "GRANT" }, { permission: "results.view", effect: "DENY" }]).success, false);
});

test("meeting access fails closed even for a stale ALL scope on a staff account", () => {
  const { canAccessMeeting } = loadTypescript("lib/auth.ts");
  assert.equal(canAccessMeeting({ superAdmin: false, accessScope: "ALL", meetingIds: ["a"] }, "b"), false);
  assert.equal(canAccessMeeting({ superAdmin: false, meetingIds: ["a"] }, "a"), true);
  assert.equal(canAccessMeeting({ superAdmin: true, meetingIds: [] }, "b"), true);
});

test("expired, idle, disabled and ambiguous-cookie sessions cannot authenticate", async () => {
  for (const kind of ["expired", "idle", "disabled", "ambiguous"]) {
    const { db, user, session } = database();
    if (kind === "expired") session.expiresAt = new Date(0);
    if (kind === "idle") session.lastSeenAt = new Date(Date.now() - 31 * 60_000);
    if (kind === "disabled") user.active = false;
    const req = request();
    if (kind === "ambiguous") req.headers.set("cookie", `voting-session=${token}; voting-session=${token}`);
    assert.equal(await loadTypescript("lib/auth.ts", db).currentUser(req), null, kind);
  }
});

test("the real authorization wrapper enforces actions, assignments, CSRF and password setup", async () => {
  const { db, user, audits } = database();
  const { withPermission } = loadTypescript("lib/access.ts", db);
  let calls = 0;
  const handler = () => { calls++; return Response.json({ ok: true }); };
  assert.equal((await withPermission("votes.reverse", handler, { meeting: true })(request("DELETE"), context)).status, 403);
  assert.equal((await withPermission("votes.record", handler, { meeting: true })(request("POST"), { params: Promise.resolve({ id: "other" }) })).status, 403);
  assert.equal((await withPermission("votes.record", handler)(request("POST", undefined, true, "https://evil.test"), context)).status, 403);
  user.mustChangePassword = true;
  assert.equal((await withPermission("votes.record", handler)(request("POST"), context)).status, 403);
  user.mustChangePassword = false;
  const allowed = await withPermission("votes.record", handler, { meeting: true })(request("POST"), context);
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("Cache-Control"), "private, no-store");
  assert.equal(calls, 1);
  assert.equal(audits[0].meetingId, "meeting-a");
  assert.equal(audits[1].status, "SUCCEEDED");
});

test("security administration requires Super Admin and recent password verification", async () => {
  const { db, user, session } = database();
  const { withPermission } = loadTypescript("lib/access.ts", db);
  const route = withPermission(null, () => Response.json({ ok: true }), { superAdmin: true });
  assert.equal((await route(request("POST"), context)).status, 403);
  user.roleId = "super-admin";
  session.verifiedAt = new Date(Date.now() - 11 * 60_000);
  const rejected = await route(request("POST"), context);
  assert.equal((await rejected.json()).code, "REAUTH_REQUIRED");
});

test("production rejects missing or invalid origins and defaults to secure session cookies", async () => {
  for (const origin of [undefined, "not a valid origin"]) await withAuthEnvironment("production", origin, () => {
    const { checkOrigin, setSessionCookie, SESSION_COOKIE } = loadTypescript("lib/auth.ts");
    assert.equal(checkOrigin(request("POST")).status, 503);
    const response = cookieResponse();
    setSessionCookie(response, token, new Date(Date.now() + 1000));
    assert.equal(SESSION_COOKIE, "__Host-voting-session");
    assert.equal(response.args[2].secure, true);
  });
});

test("production HTTP LAN sessions use a browser-compatible cookie for API and server-page authentication", async () => {
  const origin = "http://192.168.50.10:3000";
  await withAuthEnvironment("production", origin, async () => {
    const { db, user } = database();
    const cookieReads = [];
    const { checkOrigin, setSessionCookie, currentUser, SESSION_COOKIE } = loadTypescript("lib/auth.ts", db, {
      "next/headers": { cookies: async () => ({ get: (name) => {
        cookieReads.push(name);
        return name === "voting-session" ? { value: token } : undefined;
      } }) },
    });
    const response = cookieResponse();
    const expires = new Date(Date.now() + 3600_000);
    setSessionCookie(response, token, expires);
    assert.equal(SESSION_COOKIE, "voting-session");
    assert.equal(response.args[0], "voting-session");
    assert.equal(response.args[1], token);
    assert.deepEqual(response.args[2], { httpOnly: true, secure: false, sameSite: "strict", path: "/", expires });

    const req = new Request(`${origin}/api/auth/me`, { headers: { cookie: `${response.args[0]}=${response.args[1]}` } });
    assert.equal((await currentUser(req)).id, user.id);
    assert.equal((await currentUser()).id, user.id);
    assert.deepEqual(cookieReads, ["voting-session"]);
    const mutation = new Request(`${origin}/api/auth/login`, { method: "POST", headers: { origin, "sec-fetch-site": "same-origin" } });
    assert.equal(checkOrigin(mutation), null);
    mutation.headers.set("origin", "http://localhost:3000");
    assert.equal(checkOrigin(mutation).status, 403);
    mutation.headers.delete("origin");
    assert.equal(checkOrigin(mutation).status, 403);
  });
});

test("production HTTP LAN logout revokes the session and expires the same non-Secure cookie", async () => {
  const origin = "http://192.168.50.10:3000";
  await withAuthEnvironment("production", origin, async () => {
    const { db, session } = database();
    let revokedSession;
    db.session.deleteMany = async ({ where }) => { revokedSession = where.id; return { count: 1 }; };
    const { POST } = loadTypescript("app/api/auth/logout/route.ts", db);
    const response = await POST(new Request(`${origin}/api/auth/logout`, {
      method: "POST", headers: { origin, cookie: `voting-session=${token}` },
    }), context);
    assert.equal(response.status, 200);
    assert.equal(revokedSession, session.id);
    const cleared = response.cookies.get("voting-session");
    assert.equal(cleared.value, "");
    assert.equal(cleared.expires.getTime(), 0);
    assert.equal(cleared.secure, false);
    assert.equal(cleared.httpOnly, true);
    assert.equal(cleared.sameSite, "strict");
    assert.equal(cleared.path, "/");
  });
});

test("configured HTTPS uses a secure host-only cookie and rejects ordinary or duplicate session cookies", async () => {
  const origin = "https://voting.example.test";
  for (const nodeEnv of ["production", "development"]) await withAuthEnvironment(nodeEnv, origin, async () => {
    const { db, user } = database();
    const { checkOrigin, setSessionCookie, currentUser, SESSION_COOKIE } = loadTypescript("lib/auth.ts", db);
    assert.equal(checkOrigin(request("POST")).status, 403);
    assert.equal(checkOrigin(new Request("http://127.0.0.1:3000/api/auth/login", {
      method: "POST", headers: { origin, "sec-fetch-site": "same-origin" },
    })), null);
    const response = cookieResponse();
    setSessionCookie(response, token, new Date(Date.now() + 1000));
    assert.equal(SESSION_COOKIE, "__Host-voting-session");
    assert.equal(response.args[0], "__Host-voting-session");
    assert.equal(response.args[2].httpOnly, true);
    assert.equal(response.args[2].secure, true);
    assert.equal(response.args[2].sameSite, "strict");
    assert.equal(response.args[2].path, "/");
    assert.equal(response.args[2].domain, undefined);
    const req = new Request(`${origin}/api/auth/me`, { headers: { cookie: `voting-session=${token}` } });
    assert.equal(await currentUser(req), null);
    req.headers.set("cookie", `voting-session=${token}; __Host-voting-session=${token}`);
    assert.equal((await currentUser(req)).id, user.id);
    req.headers.set("cookie", `__Host-voting-session=${token}; __Host-voting-session=${token}`);
    assert.equal(await currentUser(req), null);
  });
});

test("passwords use randomized scrypt hashes and verify without plaintext storage", async () => {
  const { hashPassword, verifyPassword, validPassword } = loadTypescript("lib/password.ts");
  const hash = await hashPassword("a secure test password");
  assert.ok(hash.startsWith("scrypt$32768$8$1$"));
  assert.equal(await verifyPassword("a secure test password", hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
  assert.equal(await verifyPassword("wrong password"), false);
  assert.equal(validPassword("short"), false);
  assert.equal(validPassword("x".repeat(129)), false);
});

test("last-admin protection requires another administrator who has finished password setup", async () => {
  let remaining = 0;
  const db = { user: { findUnique: async () => ({ active: true, roleId: "super-admin" }), count: async ({ where }) => {
    assert.equal(where.mustChangePassword, false);
    return remaining;
  } } };
  const { ensureAdminRemains } = loadTypescript("lib/security-admin.ts", db);
  await assert.rejects(ensureAdminRemains(db, "admin", { active: false }), /last active Super Admin/);
  await assert.rejects(ensureAdminRemains(db, "admin", { roleId: "auditor" }), /last active Super Admin/);
  remaining = 1;
  await ensureAdminRemains(db, "admin", { active: false });
});

test("security transactions recheck a revoked session after acquiring the security lock", async () => {
  const { db, user } = database({ roleId: "super-admin" });
  db.user = { findUnique: async () => user };
  db.$queryRaw = async () => [{ id: 1 }];
  db.$transaction = async (operation) => operation(db);
  db.session.findUnique = async () => null;
  const { securityTransaction } = loadTypescript("lib/security-admin.ts", db);
  let executed = false;
  await assert.rejects(securityTransaction({ id: user.id, sessionId: "revoked" }, () => { executed = true; }), /Sign in/);
  assert.equal(executed, false);
});
