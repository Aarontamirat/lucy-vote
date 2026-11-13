import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer, isIP } from "node:net";
import { networkInterfaces } from "node:os";
import { join } from "node:path";
import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";
import { chromium } from "@playwright/test";
import { bootstrapAdmin } from "./bootstrap-admin.mjs";

// Use a real LAN address: browsers treat HTTP localhost differently from HTTP LAN.
const addresses = Object.entries(networkInterfaces()).flatMap(([name, items]) =>
  (items ?? []).map((item) => ({ ...item, name })),
).filter((item) => item.family === "IPv4" && !item.internal && !item.address.startsWith("169.254."));
const host = process.env.VOTING_VERIFY_HOST ??
  addresses.find((item) => /ethernet|wi-?fi|wlan/i.test(item.name))?.address ?? addresses[0]?.address;
assert.ok(host && isIP(host) === 4 && !host.startsWith("127.") && host !== "0.0.0.0",
  "Set VOTING_VERIFY_HOST to this server's non-loopback LAN IPv4 address.");
const buildDir = process.env.VOTING_BUILD_DIR || ".next";
await readFile(join(buildDir, "BUILD_ID"), "utf8"); // Run npm run build first.
assert.ok(process.env.DATABASE_URL, "Configure DATABASE_URL in .env before running this verification.");
const source = new URL(process.env.DATABASE_URL);
const databaseName = `voting_lan_login_verify_${Date.now()}_${randomBytes(4).toString("hex")}`;
assert.match(databaseName, /^voting_lan_login_verify_\d+_[a-f0-9]{8}$/);
const testUrl = new URL(source);
testUrl.pathname = `/${databaseName}`;
const listener = createServer();
listener.listen(0, "0.0.0.0");
await once(listener, "listening");
const port = listener.address().port;
await new Promise((resolve) => listener.close(resolve));
const origin = `http://${host}:${port}`;
const env = { ...process.env, NODE_ENV: "production", DATABASE_URL: testUrl.href,
  AUTH_ORIGIN: origin, VOTING_BUILD_DIR: buildDir, NEXT_TELEMETRY_DISABLED: "1" };
const db = new PrismaClient({ datasources: { db: { url: testUrl.href } } });
const artifacts = ".local/lan-login-verification";
const secrets = [source.href, testUrl.href, "LAN login test password 123"];
const redact = (value) => secrets.reduce((text, secret) => text.replaceAll(secret, "[redacted]"), String(value));
let connection, databaseCreated = false, server, browser, page, serverLog = "";
const checks = [];
const check = (description) => { checks.push(description); console.log(`PASS ${description}`); };
async function command(script, args) {
  const child = spawn(process.execPath, [script, ...args], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  const [code] = await once(child, "exit");
  assert.equal(code, 0, redact(output));
}
async function browserUser() {
  return page.evaluate(async () => {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    return { status: response.status, ...(await response.json()) };
  });
}
async function sessionCookie(context) {
  const cookies = (await context.cookies(origin)).filter((cookie) =>
    ["voting-session", "__Host-voting-session"].includes(cookie.name));
  assert.equal(cookies.length, 1,
    "Production HTTP LAN sign-in must store a browser session cookie; Secure cookies are rejected here.");
  const cookie = cookies[0];
  assert.equal(cookie.name, "voting-session");
  assert.equal(cookie.secure, false);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, "Strict");
  assert.equal(cookie.domain, host);
  assert.equal(cookie.path, "/");
  return cookie;
}
async function login(email, password) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const response = page.waitForResponse((res) => res.url() === `${origin}/api/auth/login` && res.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const result = await response;
  await result.finished();
  return result;
}
try {
  // Only migrate/seed/drop the uniquely named database created by this run.
  connection = await mysql.createConnection({ host: source.hostname, port: Number(source.port || 3306),
    user: decodeURIComponent(source.username), password: decodeURIComponent(source.password) });
  await connection.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  databaseCreated = true;
  await command("node_modules/prisma/build/index.js", ["migrate", "deploy"]);
  const bootstrap = await bootstrapAdmin(db, "lan-admin@example.test", "LAN Admin");
  secrets.push(bootstrap.temporaryPassword);
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", String(port)],
    { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-24000); });
  server.stderr.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-24000); });
  const deadline = Date.now() + 60_000;
  while (true) {
    assert.equal(server.exitCode, null, "Production verification server stopped unexpectedly.");
    try { if ((await fetch(`${origin}/api/auth/me`, { signal: AbortSignal.timeout(2000) })).status === 401) break; } catch { /* Startup in progress. */ }
    assert.ok(Date.now() < deadline, "Production verification server did not start on the LAN address.");
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  check("production server runs on an actual HTTP LAN address with isolated synthetic accounts");
  for (const requestOrigin of ["https://untrusted.example.test", undefined]) {
    const response = await fetch(`${origin}/api/auth/login`, { method: "POST", headers: {
      "content-type": "application/json", ...(requestOrigin ? { origin: requestOrigin } : {}),
    }, body: JSON.stringify({ email: bootstrap.user.email, password: bootstrap.temporaryPassword }) });
    assert.equal(response.status, 403);
  }
  check("mismatched and missing request origins are rejected");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  context.setDefaultTimeout(30_000);
  page = await context.newPage();
  await page.goto(`${origin}/login`);
  assert.equal((await login("lan-admin@example.test", "Wrong LAN password 123")).status(), 401);
  await page.getByRole("alert").filter({ hasText: "Invalid email or password." }).waitFor();
  assert.equal(new URL(page.url()).pathname, "/login");
  check("incorrect credentials keep the user on sign-in with an error");
  assert.equal((await login(bootstrap.user.email, bootstrap.temporaryPassword)).status(), 200);
  const originalCookie = await sessionCookie(context);
  await page.waitForURL(`${origin}/account/password`);
  let identity = await browserUser();
  assert.equal(identity.status, 200);
  assert.equal(identity.user.email, bootstrap.user.email);
  assert.equal(identity.user.mustChangePassword, true);
  check("valid production LAN login stores the cookie and opens mandatory password setup");
  await page.getByLabel("Current password", { exact: true }).fill(bootstrap.temporaryPassword);
  await page.getByLabel("New password", { exact: true }).fill("LAN login test password 123");
  await page.getByLabel("Confirm new password", { exact: true }).fill("LAN login test password 123");
  const passwordResponse = page.waitForResponse((res) => res.url() === `${origin}/api/auth/password`);
  await page.getByRole("button", { name: "Change password", exact: true }).click();
  assert.equal((await passwordResponse).status(), 200);
  await page.waitForURL(`${origin}/`);
  const rotatedCookie = await sessionCookie(context);
  assert.ok(rotatedCookie.value !== originalCookie.value, "Password change must rotate the session token.");
  const oldSession = await fetch(`${origin}/api/auth/me`, { headers: { cookie: `${originalCookie.name}=${originalCookie.value}` } });
  assert.equal(oldSession.status, 401);
  identity = await browserUser();
  assert.equal(identity.status, 200);
  assert.equal(identity.user.mustChangePassword, false);
  await page.reload();
  await page.getByRole("heading", { name: "Welcome, LAN", exact: true }).waitFor();
  await page.goto(`${origin}/admin`);
  await page.getByRole("heading", { name: "Users & Roles", exact: true }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "Users & Roles", exact: true }).waitFor();
  check("password rotation revokes the old session and authenticated pages survive reload");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL(`${origin}/login`);
  assert.equal((await context.cookies(origin)).filter((cookie) => cookie.name === "voting-session").length, 0);
  assert.equal((await browserUser()).status, 401);
  await page.goto(`${origin}/admin`);
  await page.waitForURL((url) => url.pathname === "/login");
  check("sign-out removes the LAN cookie and protected pages require sign-in again");
  await page.goto(`${origin}/login?next=%2Fadmin`);
  assert.equal((await login(bootstrap.user.email, "LAN login test password 123")).status(), 200);
  await sessionCookie(context);
  await page.waitForURL(`${origin}/admin`);
  await page.getByRole("heading", { name: "Users & Roles", exact: true }).waitFor();
  check("established credentials return the user to the requested protected page");
  await mkdir(artifacts, { recursive: true });
  await writeFile(join(artifacts, "result.json"), JSON.stringify({ passed: true, mode: "production", origin, checks, testedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log(`Production LAN sign-in verification passed (${checks.length} checks).`);
} catch (error) {
  console.error(redact(error.stack ?? error));
  await mkdir(artifacts, { recursive: true });
  await writeFile(join(artifacts, "server.log"), redact(serverLog));
  process.exitCode = 1;
} finally {
  // Continue cleanup if any earlier resource fails to close.
  for (const cleanup of [
    () => browser?.close(),
    async () => {
      if (!server?.pid || server.exitCode !== null) return;
      if (process.platform === "win32") {
        const killer = spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        await once(killer, "exit");
      } else {
        server.kill("SIGTERM");
        await once(server, "exit");
      }
    },
    () => db.$disconnect(),
    () => databaseCreated ? connection.query(`DROP DATABASE \`${databaseName}\``) : undefined,
    () => connection?.end(),
  ]) {
    try { await cleanup(); }
    catch (error) { console.error(`Verification cleanup failed: ${redact(error.message)}`); process.exitCode = 1; }
  }
}
