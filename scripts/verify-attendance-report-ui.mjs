import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import * as XLSX from "xlsx";

// This isolated app imports the real report component without account layouts.
// Every attendance response and report asset is provided from synthetic fixtures.
// It never connects to, seeds, migrates, or changes an application database.
const workspace = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(workspace, ".local/attendance-report-verification");
const harness = join(output, "app-harness");
const reportPath = "app/meetings/[id]/reports/attendance";
await mkdir(join(harness, reportPath), { recursive: true });
const packageJson = JSON.parse(await readFile(join(workspace, "package.json"), "utf8"));
await Promise.all([
  writeFile(join(harness, "package.json"), JSON.stringify({
    name: "attendance-report-verification", private: true,
    dependencies: packageJson.dependencies, devDependencies: packageJson.devDependencies,
  }, null, 2)),
  writeFile(join(harness, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2017", lib: ["dom", "dom.iterable", "esnext"], allowJs: true,
      skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true,
      module: "esnext", moduleResolution: "bundler", resolveJsonModule: true,
      isolatedModules: true, jsx: "preserve", plugins: [{ name: "next" }],
      baseUrl: ".", paths: { "@/*": ["../../../*"] },
    }, include: ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], exclude: ["node_modules"],
  }, null, 2)),
  writeFile(join(harness, "next.config.mjs"), `export default { experimental: { externalDir: true }, webpack(config) { config.resolve.alias["@"] = ${JSON.stringify(workspace)}; return config; } };\n`),
  writeFile(join(harness, "postcss.config.mjs"), await readFile(join(workspace, "postcss.config.mjs"))),
  writeFile(join(harness, "app/styles.css"), `${await readFile(join(workspace, "app/globals.css"), "utf8")}\n@source "../../../../app";\n@source "../../../../components";\n`),
  writeFile(join(harness, "app/layout.tsx"), [
    'import "./styles.css";',
    'import "@/app/workspace.css";',
    'import { Toaster } from "sonner";',
    'export default function Layout({ children }: { children: React.ReactNode }) {',
    '  return <html lang="en"><body><div className="workspace-content">{children}</div><Toaster /></body></html>;',
    '}',
  ].join("\n")),
  writeFile(join(harness, reportPath, "page.tsx"),
    'export { default } from "@/app/meetings/[id]/reports/attendance/page";\n'),
]);

const fixtureRows = Array.from({ length: 34 }, (_, index) => {
  const ordinal = index + 1;
  const represented = ordinal % 3 !== 0;
  const representative = ordinal % 2 === 0 ? "rep-b" : "rep-a";
  return {
    id: `attendance-${String(ordinal).padStart(2, "0")}`,
    shareholderId: String(ordinal).padStart(5, "0"),
    shareholderName: ordinal === 1 ? '=HYPERLINK("https://example.test","Holder 1")' : `Holder ${ordinal}`,
    shareholderNameAm: ordinal === 1 ? "ሀና" : null,
    shareValue: `${ordinal * 10}.123456`,
    representedById: represented ? representative : null,
    representedByName: represented ? "Alice Same" : null,
    representativeName: represented ? "Alice Same" : null,
    createdAt: `2026-11-17T06:${String(index).padStart(2, "0")}:30.000Z`,
  };
});
fixtureRows.push(
  { id: "attendance-35", shareholderId: "00035", shareholderName: "Legacy holder", shareholderNameAm: "ሀና",
    shareValue: "30.5", representedById: null, representedByName: null, representativeName: "Legacy Representative",
    createdAt: "2026-11-16T21:00:59.900Z" },
  { id: "attendance-36", shareholderId: "00036", shareholderName: "Precision A", shareholderNameAm: null,
    shareValue: "9007199254740993.000001", representedById: "rep-a", representedByName: "Alice Same", representativeName: "Alice Same",
    createdAt: "2026-11-17T08:00:00.000Z" },
  { id: "attendance-37", shareholderId: "00037", shareholderName: "Precision B", shareholderNameAm: null,
    shareValue: "9007199254740993.000002", representedById: "rep-b", representedByName: "Alice Same", representativeName: "Alice Same",
    createdAt: "2026-11-17T08:00:00.000Z" },
  { id: "attendance-38", shareholderId: "00038", shareholderName: "Zero shares", shareholderNameAm: null,
    shareValue: "0", representedById: null, representedByName: null, representativeName: null,
    createdAt: "2026-11-17T08:01:00.000Z" },
);
let returnedRows = fixtureRows;
let requests = 0;
const report = () => ({
  meetingTitle: "Attendance export verification ሀና", meetingStatus: "OPEN", quorumPct: 50,
  totalShares: 50_000, attendedShares: 10_000, quorumMet: false, required: 25_000,
  attendeesCount: returnedRows.length, totalShareholdersCount: 50,
  attendance: returnedRows,
});
const listener = createServer();
listener.listen(0, "127.0.0.1");
await once(listener, "listening");
const port = listener.address().port;
await new Promise((done) => listener.close(done));
const origin = `http://127.0.0.1:${port}`;
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", VOTING_BUILD_DIR: ".next" };
const server = spawn(process.execPath, [
  join(workspace, "node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(port),
], { cwd: harness, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-40_000); });
server.stderr.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-40_000); });
let browser;
let checks = 0;
const check = (description) => { checks++; console.log(`PASS ${description}`); };

try {
  const deadline = Date.now() + 120_000;
  while (true) {
    if (server.exitCode !== null) throw new Error("Isolated attendance verification server stopped.");
    try {
      const status = (await fetch(`${origin}/`)).status;
      if (status === 404) break;
      if (status >= 500) throw new Error("Isolated attendance harness compilation failed; inspect server.log.");
    } catch (error) {
      if (error.message.includes("compilation failed")) throw error;
    }
    if (Date.now() > deadline) throw new Error("Isolated attendance verification server did not start.");
    await new Promise((done) => setTimeout(done, 500));
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }, timezoneId: "America/New_York", locale: "en-US",
  });
  context.setDefaultTimeout(30_000);
  const errors = [], hydration = [];
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration|hydrated|didn.t match|server rendered HTML|validateDOMNesting|In HTML,/i.test(message.text()))
      hydration.push(message.text());
  });
  await page.route("**/api/meetings/fixture/reports/attendance", async (route) => {
    requests++;
    await route.fulfill({ json: report() });
  });
  await page.route("**/logo.png", async (route) => route.fulfill({
    body: await readFile(join(workspace, "public/logo.png")), contentType: "image/png",
  }));
  await page.route("**/fonts/*", async (route) => {
    const filename = basename(new URL(route.request().url()).pathname);
    await route.fulfill({ body: await readFile(join(workspace, "public/fonts", filename)),
      contentType: filename.endsWith("woff2") ? "font/woff2" : "font/ttf" });
  });
  await page.goto(`${origin}/meetings/fixture/reports/attendance`);
  const table = page.getByRole("table", { name: "Attendance records", exact: true });
  const bodyRows = table.locator("tbody tr");
  const ids = () => bodyRows.locator("td:first-child").allTextContents();
  const controls = page.getByRole("region", { name: "Attendance report controls", exact: true });
  const listing = page.getByRole("region", { name: "Attendance records", exact: true });
  const select = (label) => page.getByRole("combobox", { name: label, exact: true });
  const reset = () => page.getByRole("button", { name: "Reset view", exact: true }).click();
  const openAdvanced = async () => {
    const details = controls.locator("details").first();
    if (!await details.evaluate((element) => element.open)) await details.locator("summary").click();
  };
  const openColumns = async () => {
    const details = controls.locator("details").last();
    if (!await details.evaluate((element) => element.open)) await details.locator("summary").click();
  };
  const noOverflow = async (width) => {
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
    }));
    if (dimensions.scroll > dimensions.client + 1) {
      const overflowing = await page.evaluate(() => Array.from(document.querySelectorAll("body *"))
        .map((element) => ({ tag: element.tagName, class: element.className, right: element.getBoundingClientRect().right,
          text: element.textContent?.slice(0, 80) }))
        .filter((element) => element.right > document.documentElement.clientWidth + 1).slice(0, 15));
      await page.screenshot({ path: join(output, `overflow-${width}.png`), fullPage: true });
      assert.fail(`${width}px document overflow: ${JSON.stringify({ ...dimensions, overflowing })}`);
    }
  };
  const download = async (button, name) => {
    const [file] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: button, exact: true }).click()]);
    assert.equal(await file.failure(), null);
    const path = join(output, name);
    await file.saveAs(path);
    await expect(page.getByRole("button", { name: button, exact: true })).toBeEnabled();
    return readFile(path);
  };
  const workbookRows = (bytes) => {
    const workbook = XLSX.read(bytes, { type: "buffer", cellNF: true });
    return { workbook, rows: XLSX.utils.sheet_to_json(workbook.Sheets.Attendance, { header: 1, raw: true }) };
  };

  await expect(bodyRows).toHaveCount(25);
  await expect(listing).toContainText("38 of 38 records match");
  assert.equal(requests, 1);
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await noOverflow(width);
    await page.screenshot({ path: join(output, `attendance-${width}.png`), fullPage: true,
      animations: "disabled", style: "nextjs-portal, [data-sonner-toaster] { visibility: hidden; }" });
  }
  check("attendance report renders at 1440, 820, and 390px without document overflow");
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByLabel("Search attendance", { exact: true }).fill("legacy representative");
  await expect(bodyRows).toHaveCount(1);
  assert.deepEqual(await ids(), ["00035"]);
  assert.equal(requests, 1, "Live filters should use the loaded attendance snapshot.");
  await reset();
  await select("Attendance type").selectOption("represented");
  await select("Representative").selectOption("id:rep-a");
  assert.ok((await ids()).every((id) => fixtureRows.find((row) => row.shareholderId === id).representedById === "rep-a"));
  await select("Representative").selectOption("id:rep-b");
  assert.ok((await ids()).every((id) => fixtureRows.find((row) => row.shareholderId === id).representedById === "rep-b"));
  await select("Representative").selectOption("name:Legacy%20Representative");
  assert.deepEqual(await ids(), ["00035"]);
  check("live search, represented attendance, same-name representative IDs, and legacy name-only representatives");

  await reset();
  await openAdvanced();
  await page.getByLabel("Minimum shares", { exact: true }).fill("9007199254740993.000002");
  await page.getByLabel("Maximum shares", { exact: true }).fill("9007199254740993.000002");
  assert.deepEqual(await ids(), ["00037"]);
  await page.getByLabel("Maximum shares", { exact: true }).fill("1");
  await expect(page.getByText("The minimum shares cannot exceed the maximum shares.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Excel", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Generate PDF", exact: true })).toBeDisabled();
  await reset();
  await page.getByLabel("Maximum shares", { exact: true }).fill("0");
  assert.deepEqual(await ids(), ["00038"]);
  await reset();
  await page.getByLabel("Check-in from (EAT)", { exact: true }).fill("2026-11-17T00:00");
  await page.getByLabel("Check-in to (EAT)", { exact: true }).fill("2026-11-17T00:00");
  assert.deepEqual(await ids(), ["00035"], "EAT filters include ending minute independently of device zone.");
  await page.getByLabel("Shareholder name (Amharic)", { exact: true }).fill("ሀና");
  await page.getByLabel("Representative name", { exact: true }).fill("Legacy");
  assert.deepEqual(await ids(), ["00035"]);
  check("exact high-precision/zero share ranges, invalid range export guards, combined name filters, and EAT midnight bounds in a New York browser");

  await reset();
  await table.getByRole("button", { name: /^Sort by Shares/ }).click();
  assert.equal((await ids())[0], "00038");
  await table.getByRole("button", { name: /^Sort by Shares/ }).click();
  assert.deepEqual((await ids()).slice(0, 2), ["00037", "00036"]);
  await select("Sort by").selectOption("representedByName");
  await select("Sort direction").selectOption("asc");
  await openColumns();
  await page.getByRole("button", { name: "Add sort", exact: true }).click();
  await select("Then sort by (2)").selectOption("shareValue");
  await select("Sort direction (2)").selectOption("desc");
  assert.deepEqual((await ids()).slice(0, 2), ["00037", "00036"]);
  await select("Rows per page").selectOption("10");
  await expect(bodyRows).toHaveCount(10);
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(listing).toContainText("Page 2 of 4");
  await page.getByLabel("Shareholder ID", { exact: true }).fill("00037");
  await expect(listing).toContainText("Page 1 of 1");
  assert.deepEqual(await ids(), ["00037"]);
  check("sortable headers, exact decimal descending order, multi-column priority, page size, and filter page resets");

  await reset();
  await select("Sort by").selectOption("shareholderId");
  const allExcel = workbookRows(await download("Export Excel", "all-matching.xlsx"));
  assert.equal(allExcel.rows.length, 39, "Export includes matching rows beyond the first table page.");
  assert.equal(allExcel.rows[1][0], "00001");
  assert.equal(allExcel.rows[1][1], fixtureRows[0].shareholderName);
  assert.equal(allExcel.workbook.Sheets.Attendance.B2.t, "s");
  assert.equal(allExcel.workbook.Sheets.Attendance.B2.f, undefined);
  assert.equal(allExcel.rows[36][2], "9007199254740993.000001");
  assert.deepEqual(allExcel.workbook.SheetNames, ["Summary", "Filters", "Attendance"]);
  const summary = Object.fromEntries(XLSX.utils.sheet_to_json(allExcel.workbook.Sheets.Summary, { header: 1, raw: true }).slice(1));
  assert.equal(summary["Matching attendance records"], 38);
  assert.equal(summary["Exported attendance records"], 38);
  await select("Rows per page").selectOption("10");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await select("Export records").selectOption("page");
  await openColumns();
  await page.getByRole("checkbox", { name: "Shareholder (Amharic)", exact: true }).check();
  await page.getByRole("checkbox", { name: "Attendance type", exact: true }).check();
  await page.getByRole("checkbox", { name: "Representative ID", exact: true }).check();
  await page.getByRole("checkbox", { name: "Represented by", exact: true }).uncheck();
  const pageExcel = workbookRows(await download("Export Excel", "current-page.xlsx"));
  assert.deepEqual(pageExcel.rows[0], ["ID", "Shareholder", "Shareholder (Amharic)", "Shares", "Attendance type", "Representative ID", "Check-in (EAT)"]);
  assert.equal(pageExcel.rows.length, 11);
  assert.deepEqual(pageExcel.rows.slice(1).map((row) => row[0]), await ids());
  const timeCell = pageExcel.workbook.Sheets.Attendance.G2;
  assert.equal(timeCell.t, "n");
  assert.equal(timeCell.z, "dd/mm/yyyy hh:mm:ss");
  check("Excel downloads include all 38 matching records or only the current sorted page, respect column selection, and preserve IDs, formula-like strings, exact shares, and EAT dates");

  const pagePDF = await download("Generate PDF", "current-page.pdf");
  assert.equal(pagePDF.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pagePDF.toString("latin1").includes("/ToUnicode"), "PDF embeds Unicode character mappings.");
  const mediaBox = /\/MediaBox\s*\[0 0 ([\d.]+) ([\d.]+)\]/.exec(pagePDF.toString("latin1"));
  assert.ok(mediaBox && Number(mediaBox[1]) > Number(mediaBox[2]), "Seven-column PDF uses landscape pages.");
  await page.getByRole("checkbox", { name: "Represented by", exact: true }).check();
  await select("Export records").selectOption("matching");
  const allPDF = await download("Generate PDF", "all-matching.pdf");
  assert.equal(allPDF.subarray(0, 5).toString(), "%PDF-");
  assert.ok(allPDF.toString("latin1").includes("/ToUnicode"), "Full PDF embeds Unicode character mappings.");
  assert.ok((allPDF.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length > 1);
  check("current-page and full PDF downloads embed Unicode fonts and support eight selected columns with landscape pagination");

  await page.setViewportSize({ width: 390, height: 1000 });
  await noOverflow(390);
  await page.screenshot({ path: join(output, "attendance-customized-390.png"), fullPage: true, animations: "disabled",
    style: "nextjs-portal, [data-sonner-toaster] { visibility: hidden; }" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await reset();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  returnedRows = fixtureRows.slice(0, 5);
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(bodyRows).toHaveCount(5);
  await expect(listing).toContainText("Page 1 of 1");
  assert.deepEqual(errors, [], `Browser errors: ${JSON.stringify(errors)}`);
  assert.deepEqual(hydration, [], `Hydration warnings: ${JSON.stringify(hydration)}`);
  check("refresh clamps pages after data changes; customized mobile layout and browser runtime/hydration remain clean");
  console.log(`Attendance browser verification passed (${checks} checks). Artifacts: .local/attendance-report-verification`);
} finally {
  await browser?.close();
  await writeFile(join(output, "server.log"), serverLog);
  if (server.pid && server.exitCode === null) {
    if (process.platform === "win32") {
      // Only stop the process tree spawned above, after verifying it is still live.
      const stop = spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      await once(stop, "exit");
    } else {
      server.kill("SIGTERM");
    }
  }
}
