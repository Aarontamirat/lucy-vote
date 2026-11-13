import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { createServer, isIP } from "node:net";
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
import { bootstrapAdmin } from "./bootstrap-admin.mjs";
import { verifyUI } from "./verify-ui.mjs";
import { verifyShareholderBallots } from "./verify-shareholder-ballots.mjs";

// All fixtures live in a database created by this run. Never migrate, seed or
// reset the configured application database while running integration tests.
const source = new URL(process.env.DATABASE_URL);
const databaseName = `voting_rbac_verify_${Date.now()}_${randomBytes(4).toString("hex")}`;
assert.match(databaseName, /^voting_rbac_verify_\d+_[a-f0-9]{8}$/);
const testUrl = new URL(source);
testUrl.pathname = `/${databaseName}`;
const connection = await mysql.createConnection({ host: source.hostname, port: Number(source.port || 3306), user: decodeURIComponent(source.username), password: decodeURIComponent(source.password) });
const listener = createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const port = listener.address().port;
await new Promise((resolve) => listener.close(resolve));
const verificationHost = process.env.VOTING_VERIFY_HOST || "localhost";
assert.ok(verificationHost === "localhost" || isIP(verificationHost) === 4, "Use localhost or a LAN IPv4 address for verification.");
const origin = `http://${verificationHost}:${port}`;
const env = { ...process.env, DATABASE_URL: testUrl.href, AUTH_ORIGIN: origin, VOTING_BUILD_DIR: ".next-rbac-verify", NEXT_TELEMETRY_DISABLED: "1" };
const db = new PrismaClient({ datasources: { db: { url: testUrl.href } } });
let server, browser;
let serverLog = "";
let checks = 0;
const check = (description) => { checks++; console.log(`PASS ${description}`); };
async function command(script, args) {
  const child = spawn(process.execPath, [script, ...args], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const [code] = await once(child, "exit");
  if (code) throw new Error(`Verification setup failed (${code}): ${output.replaceAll(testUrl.href, "[test database]")}`);
}
function client() {
  let cookie = "";
  return { get cookie() { return cookie; }, async call(path, method = "GET", body, expected = 200, extraHeaders = {}) {
    const response = await fetch(`${origin}${path}`, { method, headers: {
      ...(cookie ? { cookie } : {}), ...(method === "GET" ? {} : { origin }),
      ...(body === undefined ? {} : { "content-type": "application/json" }), ...extraHeaders,
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return data;
  } };
}
const userBody = (name, roleId, meetingIds = []) => ({ name, email: `${name.toLowerCase()}@example.test`, roleId, active: true, accessScope: "ASSIGNED", overrides: [], meetingIds });
async function signIn(account, credentials) {
  await account.call("/api/auth/login", "POST", { email: credentials.email, password: credentials.password });
}
try {
  await connection.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await command("node_modules/prisma/build/index.js", ["migrate", "deploy"]);
  let bootstrap = await bootstrapAdmin(db, "admin@example.test", "Test Admin");
  await assert.rejects(bootstrapAdmin(db, "another@example.test", "Another"), /Bootstrap is disabled/);
  const firstPassword = bootstrap.temporaryPassword;
  bootstrap = await bootstrapAdmin(db, "admin@example.test", "Test Admin", { recoverPending: true });
  assert.notEqual(bootstrap.temporaryPassword, firstPassword);
  check("migration, default roles, bootstrap and second-bootstrap rejection");
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--turbopack", "--hostname", "0.0.0.0", "--port", String(port)], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-24000); });
  server.stderr.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-24000); });
  const deadline = Date.now() + 120_000;
  while (true) {
    if (server.exitCode !== null) throw new Error("Verification server stopped unexpectedly.");
    try { if ((await fetch(`${origin}/api/auth/me`)).status === 401) break; } catch { /* Startup in progress. */ }
    if (Date.now() > deadline) throw new Error("Verification server did not start.");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const admin = client();
  await signIn(admin, { email: bootstrap.user.email, password: bootstrap.temporaryPassword });
  assert.equal((await admin.call("/api/auth/me")).user.mustChangePassword, true);
  await admin.call("/api/admin/users", "GET", undefined, 403);
  await admin.call("/api/auth/password", "POST", { currentPassword: bootstrap.temporaryPassword, newPassword: "Admin test password 123" });
  assert.equal((await admin.call("/api/auth/me")).user.mustChangePassword, false);
  await assert.rejects(bootstrapAdmin(db, "admin@example.test", "Test Admin", { recoverPending: true }), /Only the original/);
  check("real login, mandatory password change and rotated sessions");

  const meeting = (await admin.call("/api/meetings", "POST", { title: "Assigned Election", date: "2026-11-10T09:00:00Z", location: "Test Hall", quorum: 50, winnerCount: 1 }, 201)).item;
  const other = (await admin.call("/api/meetings", "POST", { title: "Private Other Election", date: "2026-11-11T09:00:00Z", location: "Test Hall", quorum: 50, winnerCount: 1 }, 201)).item;
  const prefix = `/api/meetings/${meeting.id}`;
  const otherPrefix = `/api/meetings/${other.id}`;
  for (const id of ["holder", "delegate", "extra", "nominee"]) await admin.call("/api/shareholders", "POST", { id, name: `${id} private identity`, nameAm: id, phone: "secret phone", address: "secret address", shareValue: "100" }, 201);
  const nominee = (await admin.call(`${prefix}/nominees`, "POST", { shareholderId: "nominee", type: "standard" }, 201)).nominee;
  const otherNominee = (await admin.call(`${otherPrefix}/nominees`, "POST", { shareholderId: "nominee", type: "standard" }, 201)).nominee;
  const operatorDraft = userBody("Operator", "vote-operator", [meeting.id]);
  const operatorUser = await admin.call("/api/admin/users", "POST", operatorDraft, 201);
  const officerDraft = userBody("Officer", "attendance-officer", [meeting.id]);
  const officerUser = await admin.call("/api/admin/users", "POST", officerDraft, 201);
  const managerUser = await admin.call("/api/admin/users", "POST", userBody("Manager", "election-manager", [meeting.id]), 201);
  const auditorUser = await admin.call("/api/admin/users", "POST", userBody("Auditor", "auditor", [meeting.id]), 201);
  const clerkUser = await admin.call("/api/admin/users", "POST", userBody("Clerk", "registry-clerk"), 201);
  const viewerUser = await admin.call("/api/admin/users", "POST", userBody("Viewer", "projection-viewer", [meeting.id]), 201);
  const accounts = {};
  for (const created of [operatorUser, officerUser, managerUser, auditorUser, clerkUser, viewerUser]) {
    const account = client();
    await signIn(account, { email: created.user.email, password: created.temporaryPassword });
    await account.call("/api/auth/password", "POST", { currentPassword: created.temporaryPassword, newPassword: "Staff test password 123" });
    accounts[created.user.roleId] = account;
  }
  const operator = accounts["vote-operator"], officer = accounts["attendance-officer"], manager = accounts["election-manager"], auditor = accounts.auditor;
  for (const roleId of ["vote-operator", "attendance-officer", "election-manager", "auditor", "projection-viewer"]) {
    const account = accounts[roleId];
    assert.equal((await account.call("/api/meetings")).items.length, 1);
    await account.call(otherPrefix, "GET", undefined, 403);
    await account.call("/api/admin/users", "GET", undefined, 403);
  }
  await accounts["registry-clerk"].call("/api/shareholders");
  await accounts["registry-clerk"].call("/api/meetings", "GET", undefined, 403);
  check("all six staff roles, assigned meeting isolation and protected administration");

  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["holder"] }, 400);
  await officer.call(`${prefix}/open`, "POST", undefined, 403);
  await manager.call(`${prefix}/open`, "POST");
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["holder", "missing"] }, 404);
  assert.equal(await db.attendance.count(), 0);
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["holder"], representativeShareholderId: "delegate" });
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["delegate"] });
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["extra"], representativeId: "nominee", representativeName: "ID collision" }, 409);
  const rep = await db.representative.findFirst({ where: { shareholderId: "delegate" } });
  await admin.call(`${otherPrefix}/open`, "POST");
  await admin.call(`${otherPrefix}/attendance`, "POST", { shareholderIds: ["extra"], representativeId: "private-rep", representativeName: "Private other representative" });
  const reps = await officer.call(`/api/representatives?meetingId=${meeting.id}`);
  assert.ok(reps.items.every((item) => item.id !== "private-rep"));
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["extra"], representativeId: "private-rep" }, 403);
  await manager.call(`${prefix}/nominees/${otherNominee.id}`, "PUT", { type: "standard", name: "Tampered" }, 400);
  assert.equal((await db.nominee.findUnique({ where: { id: otherNominee.id } })).name, otherNominee.name);
  check("attendance opening cannot be bypassed, atomic registration, ID collisions and cross-meeting nominee/representative attacks");

  await manager.call(`${prefix}/votingopen`, "POST");
  await operator.call(`${prefix}/votes`, "POST", { voterId: rep.id, nomineeIds: [nominee.id] }, 403);
  await operator.call(`${prefix}/votes`, "POST", { voterId: "holder", nomineeIds: [nominee.id] });
  assert.equal((await operator.call(`${prefix}/votes?voterId=delegate`)).voted.length, 0);
  await operator.call(`${prefix}/votes`, "POST", { voterId: "delegate", nomineeIds: [nominee.id] });
  await operator.call(`${prefix}/votes`, "POST", { voterId: "holder", nomineeIds: [nominee.id] });
  assert.equal(await db.vote.count({ where: { meetingId: meeting.id } }), 2);
  assert.equal((await db.vote.findFirst({ where: { meetingId: meeting.id } })).weight, 100);
  await operator.call(`${prefix}/votes`, "DELETE", { voterId: rep.id, nomineeIds: [nominee.id], reason: "Correction test" }, 403);
  const attendance = await db.attendance.findFirst({ where: { meetingId: meeting.id, shareholderId: "holder" } });
  await officer.call(`${prefix}/attendance/${attendance.id}`, "DELETE", undefined, 403);
  await admin.call(`${prefix}/attendance/${attendance.id}`, "DELETE", undefined, 409);
  await officer.call(`${prefix}/attendance`, "POST", { shareholderIds: ["extra"], representativeId: rep.id });
  const extraAttendance = await db.attendance.findFirst({ where: { meetingId: meeting.id, shareholderId: "extra" } });
  await admin.call(`${prefix}/attendance/${extraAttendance.id}`, "DELETE");
  check("independent shareholder ballots, own weights, duplicate prevention and independently scoped attendance/removal");

  const publicClient = client();
  const results = await publicClient.call(`/api/public/meetings/${meeting.id}/results?voterId=delegate`);
  const attendanceStats = await publicClient.call(`/api/public/meetings/${meeting.id}/attendance`);
  const publicText = JSON.stringify([results, attendanceStats]);
  for (const privateValue of ["holder private identity", "delegate private identity", "secret phone", "secret address", "snapshotVoterName", "voterId", "representedById"]) assert.ok(!publicText.includes(privateValue), privateValue);
  assert.equal(results.results[0].totalWeight, 200);
  await publicClient.call(`${prefix}/attendance`, "GET", undefined, 401);
  await publicClient.call("/api/shareholders", "GET", undefined, 401);
  await operator.call(`${prefix}/votes`, "POST", { voterId: rep.id, nomineeIds: [nominee.id] }, 403, { origin: "https://evil.test" });
  check("anonymous aggregate projections, private-data protection and cross-origin rejection");

  assert.equal((await manager.call(`${prefix}/voting-cards`)).shareholders.length, 4);
  await manager.call(`${prefix}/reports/attendance`);
  await manager.call(`${prefix}/reports/voting`);
  await auditor.call(`${prefix}/reports/voting`);
  await operator.call(`${prefix}/attendance`, "GET", undefined, 403);
  await accounts["registry-clerk"].call("/api/shareholders/extra", "DELETE", undefined, 403);
  await accounts["projection-viewer"].call(`${prefix}/reports/attendance`, "GET", undefined, 403);
  await admin.call(`${prefix}/votes`, "DELETE", { voterId: "holder", nomineeIds: [nominee.id], reason: "Testing authorized correction" });
  assert.equal((await operator.call(`${prefix}/votes?voterId=delegate`)).voted.length, 1);
  await operator.call(`${prefix}/votes`, "POST", { voterId: "holder", nomineeIds: [nominee.id] });
  check("authorized cards/reports, private read permissions and successful Super Admin ballot corrections");

  await admin.call(`/api/admin/users/${operatorUser.user.id}`, "PUT", { ...operatorDraft, overrides: [{ permission: "votes.record", effect: "DENY" }] });
  await operator.call(`${prefix}/votes`, "POST", { voterId: rep.id, nomineeIds: [nominee.id] }, 403);
  await admin.call(`/api/admin/users/${operatorUser.user.id}`, "PUT", { ...operatorDraft, overrides: [{ permission: "results.view", effect: "GRANT" }], meetingIds: [] });
  assert.equal((await operator.call("/api/meetings")).items.length, 0);
  await operator.call(`${prefix}/votes`, "GET", undefined, 403);
  await admin.call(`/api/admin/users/${operatorUser.user.id}`, "PUT", { ...operatorDraft, overrides: [{ permission: "results.view", effect: "GRANT" }] });
  await operator.call(`${prefix}/votes`);
  const customRole = await admin.call("/api/admin/roles", "POST", { name: "Custom Test", description: "Test", permissions: ["meetings.view"] }, 201);
  await admin.call(`/api/admin/roles/${customRole.role.id}`, "PUT", { name: "Custom Test", description: "Updated", permissions: ["meetings.view", "results.view"] });
  await admin.call(`/api/admin/roles/${customRole.role.id}`, "DELETE");
  await admin.call("/api/admin/roles", "POST", { name: "Sensitive", description: "Test", permissions: ["votes.reverse"] }, 400);
  const roleBefore = await db.role.findUnique({ where: { id: "vote-operator" }, include: { permissions: true } });
  await admin.call("/api/admin/roles/vote-operator", "PUT", { name: roleBefore.name, description: roleBefore.description, permissions: ["meetings.view", "votes.lookup"] });
  assert.equal((await operator.call("/api/auth/me")).user.permissions.includes("votes.record"), false);
  await admin.call(`/api/admin/users/${operatorUser.user.id}`, "PUT", { ...operatorDraft, active: false });
  await operator.call("/api/auth/me", "GET", undefined, 401);
  await admin.call(`/api/admin/users/${officerUser.user.id}/password`, "POST");
  await officer.call("/api/auth/me", "GET", undefined, 401);
  const audit = await auditor.call("/api/audit");
  assert.ok(audit.entries.some((entry) => entry.action === "votes.recorded"));
  assert.ok(audit.entries.every((entry) => entry.meetingId === meeting.id || (entry.actorId === auditorUser.user.id && entry.action.startsWith("auth."))));
  check("per-user denials, role edits, role deletion, session revocation and scoped audit history");

  const authUser = (await admin.call("/api/auth/me")).user;
  const adminSession = await db.session.findFirst({ where: { userId: authUser.id } });
  await db.session.update({ where: { id: adminSession.id }, data: { verifiedAt: new Date(Date.now() - 11 * 60_000) } });
  assert.equal((await admin.call("/api/admin/roles", "POST", { name: "Reauth", description: "", permissions: [] }, 403)).code, "REAUTH_REQUIRED");
  await admin.call("/api/auth/reauth", "POST", { password: "Admin test password 123" });
  await admin.call(`/api/admin/users/${authUser.id}`, "PUT", { ...userBody("Test Admin", "super-admin"), email: authUser.email, accessScope: "ALL", active: false }, 409);
  const missing = client();
  const attempts = await Promise.all(Array.from({ length: 6 }, () => missing.call("/api/auth/login", "POST", { email: "missing@example.test", password: "wrong password" }, 401).then(() => 401).catch((error) => { if (error.actual === 429) return 429; throw error; })));
  assert.equal(attempts.filter((status) => status === 429).length, 1);
  check("recent password confirmation, last-admin protection and concurrent login throttling");

  browser = await chromium.launch({ headless: true, executablePath: chromium.executablePath() });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(60_000);
  const browserErrors = [];
  const hydrationWarnings = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (/hydration|hydrated|didn.t match|server rendered HTML|In HTML,|validateDOMNesting/i.test(message.text())) hydrationWarnings.push(message.text()); });
  await page.goto(`${origin}/admin`);
  await page.waitForURL(/\/login/);
  await page.getByLabel("Email", { exact: true }).fill(bootstrap.user.email);
  await page.getByLabel("Password", { exact: true }).fill("Admin test password 123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "/admin");
  await page.goto(`${origin}/admin`);
  await page.getByRole("heading", { name: "Users & Roles", exact: true }).waitFor();
  await page.getByRole("button", { name: "Add user", exact: true }).click();
  await page.getByLabel("Display name", { exact: true }).fill("Browser User");
  await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
  await page.getByLabel("Role", { exact: true }).selectOption("projection-viewer");
  await page.getByLabel("Assigned Election", { exact: false }).check();
  await page.getByRole("button", { name: "Save user", exact: true }).click();
  await page.getByRole("heading", { name: "Temporary sign-in details" }).waitFor();
  const browserUserPassword = await page.getByLabel("Temporary password", { exact: true }).inputValue();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  assert.equal(await db.user.count({ where: { email: "browser@example.test" } }), 1);
  await mkdir(".local/rbac-verification", { recursive: true });
  await page.screenshot({ path: ".local/rbac-verification/admin.png", fullPage: true });
  await page.getByRole("button", { name: "Roles & permissions", exact: true }).click();
  await page.getByRole("button", { name: "Add role", exact: true }).click();
  await page.getByLabel("Role name", { exact: true }).fill("Browser Role");
  await page.getByLabel("View meetings", { exact: true }).check();
  await page.getByRole("button", { name: "Save role", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Role permissions saved" }).waitFor();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(/\/login/);
  await page.getByLabel("Email", { exact: true }).fill("browser@example.test");
  await page.getByLabel("Password", { exact: true }).fill(browserUserPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/account\/password/);
  await page.getByLabel("Current password", { exact: true }).fill(browserUserPassword);
  await page.getByLabel("New password", { exact: true }).fill("Browser test password 123");
  await page.getByLabel("Confirm new password", { exact: true }).fill("Browser test password 123");
  await page.getByRole("button", { name: "Change password", exact: true }).click();
  await page.waitForURL(origin + "/");
  await page.goto(`${origin}/meetings`);
  await page.getByText("Assigned Election", { exact: true }).waitFor();
  assert.equal(await page.getByRole("button", { name: /(Create|New|Add).*Meeting/i }).count(), 0);
  assert.equal(await page.getByRole("link", { name: "Users & Roles", exact: true }).count(), 0);
  await page.goto(`${origin}/admin`);
  await page.waitForURL(/\/access-denied/);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(/\/login/);
  const projected = page.waitForResponse((res) => res.url().includes(`/api/public/meetings/${meeting.id}/results`) && res.status() === 200);
  await page.goto(`${origin}/meetings/${meeting.id}/live`);
  await projected;
  assert.equal(browserErrors.length, 0, browserErrors.join("\n"));
  assert.equal(hydrationWarnings.length, 0, hydrationWarnings.join("\n"));
  check("browser sign-in, protected page redirects, user/meeting assignment, role creation, sign-out and public projection");

  await verifyUI({ browser, origin, email: bootstrap.user.email, password: "Admin test password 123", db, admin, check });
  await verifyShareholderBallots({ db, admin, origin, check });
  await admin.call("/api/auth/reauth", "POST", { password: "Admin test password 123" });

  const secondAdminBody = { ...userBody("Second Admin", "super-admin"), email: "second-admin@example.test", accessScope: "ALL" };
  const secondAdminUser = await admin.call("/api/admin/users", "POST", secondAdminBody, 201);
  const secondAdmin = client();
  await signIn(secondAdmin, { email: secondAdminUser.user.email, password: secondAdminUser.temporaryPassword });
  await secondAdmin.call("/api/auth/password", "POST", { currentPassword: secondAdminUser.temporaryPassword, newPassword: "Second Admin password 123" });
  const ownDisable = async (account, id, body) => {
    try { await account.call(`/api/admin/users/${id}`, "PUT", { ...body, active: false }); return 200; }
    catch (error) { if (error.actual === 409) return 409; throw error; }
  };
  const changes = await Promise.all([
    ownDisable(admin, authUser.id, { ...userBody("Test Admin", "super-admin"), email: authUser.email, accessScope: "ALL" }),
    ownDisable(secondAdmin, secondAdminUser.user.id, secondAdminBody),
  ]);
  assert.deepEqual(changes.sort(), [200, 409]);
  assert.equal(await db.user.count({ where: { roleId: "super-admin", active: true, mustChangePassword: false } }), 1);
  check("simultaneous administrator changes cannot disable the final usable Super Admin");
  await writeFile(".local/rbac-verification/result.json", JSON.stringify({ passed: true, checks, testedAt: new Date().toISOString() }, null, 2));
  console.log(`RBAC verification passed: ${checks} integration groups. Existing application records were not used.`);
} catch (error) {
  console.error(error);
  // Retain local diagnostics without placing connection strings in artifacts.
  await mkdir(".local/rbac-verification", { recursive: true });
  await writeFile(".local/rbac-verification/server.log", serverLog.replaceAll(testUrl.href, "[test database]"));
  const failedPage = browser?.contexts()[0]?.pages()[0];
  if (failedPage) await failedPage.screenshot({ path: ".local/rbac-verification/failure.png", fullPage: true });
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server?.pid) {
    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      await once(killer, "exit");
    } else { server.kill("SIGTERM"); await once(server, "exit"); }
  }
  await db.$disconnect();
  const tsconfig = JSON.parse(await readFile("tsconfig.json", "utf8"));
  if (tsconfig.include?.includes(".next-rbac-verify/types/**/*.ts")) {
    tsconfig.include = tsconfig.include.filter((path) => path !== ".next-rbac-verify/types/**/*.ts");
    await writeFile("tsconfig.json", JSON.stringify(tsconfig, null, 2) + "\n");
  }
  await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
  await connection.end();
}
