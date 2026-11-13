import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as XLSX from "xlsx";
import { expect } from "@playwright/test";
import { verifyClipboardUI } from "./verify-clipboard-ui.mjs";
import { verifyHydrationUI } from "./verify-hydration-ui.mjs";
import { verifyVoteLayoutUI } from "./verify-vote-layout-ui.mjs";

// Called by verify-rbac after it creates its temporary database and server.
// All mutations below affect only those synthetic fixtures.
export async function verifyUI({
  browser,
  origin,
  email,
  password,
  db,
  admin,
  check,
}) {
  await mkdir(".local/ui-verification", { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  });
  context.setDefaultTimeout(60_000);
  const errors = [],
    hydration = [];
  context.on("page", (page) => {
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        /hydration|hydrated|didn.t match|server rendered HTML|In HTML,|validateDOMNesting/i.test(
          message.text(),
        )
      )
        hydration.push(message.text());
    });
  });
  const page = await context.newPage();
  try {
    const noOverflow = async () => {
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      assert.ok(
        dimensions.scroll <= dimensions.client + 1,
        `Page overflow on ${new URL(page.url()).pathname}: ${JSON.stringify(dimensions)}`,
      );
    };
    const screenshot = async (name, fullPage = true) => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await noOverflow();
      await page.screenshot({
        path: `.local/ui-verification/${name}.png`,
        fullPage,
        animations: "disabled",
        style: "[data-sonner-toaster], nextjs-portal { visibility: hidden; }",
      });
    };
    const openMenu = async (name) => {
      await page
        .getByRole("button", {
          name: "Actions for UI Test Election",
          exact: true,
        })
        .click();
      await page.getByRole("menuitem", { name, exact: true }).click();
    };

    await page.goto(`${origin}/`);
    await page.getByRole("heading", { name: /Every share counts/ }).waitFor();
    await screenshot("landing-desktop");
    await page.goto(`${origin}/login`);
    await page.getByRole("heading", { name: "Sign in", exact: true }).waitFor();
    assert.equal(await page.locator("body").getAttribute("location"), null);
    await screenshot("login-light");
    await page
      .getByRole("button", { name: "Switch to dark theme", exact: true })
      .click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await screenshot("login-dark");
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Switch to light theme", exact: true }),
    ).toBeEnabled();
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("login-mobile-dark");
    await page
      .getByRole("button", { name: "Switch to light theme", exact: true })
      .click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click();
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "type",
      "text",
    );
    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(origin + "/");
    await page.getByRole("heading", { name: /Welcome,/ }).waitFor();
    await screenshot("dashboard-mobile");
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await screenshot("navigation-mobile");
    await page
      .getByRole("button", { name: "Close navigation", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Open navigation", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Shareholders", exact: true })
      .click();
    await page.waitForURL(/\/shareholders/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("heading", { name: "Shareholders", exact: true })
      .waitFor();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .getByRole("button", { name: "Add shareholder", exact: true })
      .click();
    const shareholderDialog = page.getByRole("dialog");
    await shareholderDialog.getByLabel("ID", { exact: true }).fill("ui-holder");
    await shareholderDialog
      .getByLabel("Name", { exact: true })
      .fill("UI Shareholder");
    await shareholderDialog
      .getByLabel("Amharic Name", { exact: true })
      .fill("የሙከራ ባለአክሲዮን");
    await shareholderDialog
      .getByLabel("Phone", { exact: true })
      .fill("0912345678");
    await shareholderDialog
      .getByLabel("Share Value", { exact: true })
      .fill("50");
    await shareholderDialog
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await expect(shareholderDialog).toHaveCount(0);
    await expect
      .poll(() => db.shareholder.count({ where: { id: "ui-holder" } }))
      .toBe(1);
    await db.shareholder.createMany({
      data: Array.from({ length: 28 }, (_, index) => ({
        id: `ui-fixture-${String(index).padStart(3, "0")}`,
        name: `Test Shareholder ${index + 1}`,
        nameAm: "የሙከራ ባለአክሲዮን",
        shareValue: 100 + index,
      })),
    });
    await page
      .getByRole("button", { name: "Refresh shareholders", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Next page", exact: true }),
    ).toBeEnabled();
    await screenshot("registry-desktop");
    await page
      .getByRole("button", { name: "Switch to dark theme", exact: true })
      .click();
    await screenshot("registry-dark");
    await page
      .getByRole("button", { name: "Switch to light theme", exact: true })
      .click();
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(page.getByText("Page 2 of 4", { exact: true })).toBeVisible();
    await page
      .getByLabel("Search shareholders", { exact: true })
      .fill("no-matching-holder");
    await expect(
      page.getByRole("heading", {
        name: "No matching shareholders",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await page
      .getByLabel("Search shareholders", { exact: true })
      .fill("ui-holder");
    await expect(
      page.getByText("UI Shareholder", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Edit UI Shareholder", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Address", { exact: true })
      .fill("Test Hall, Addis Ababa");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect
      .poll(
        async () =>
          (await db.shareholder.findUnique({ where: { id: "ui-holder" } }))
            .address,
      )
      .toBe("Test Hall, Addis Ababa");
    const clearedRegistry = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === "/api/shareholders" &&
        url.searchParams.get("q") === "" && response.ok();
    });
    await page.getByLabel("Search shareholders", { exact: true }).fill("");
    await clearedRegistry;
    await expect(page.getByRole("button", { name: "Refresh shareholders", exact: true })).toBeEnabled();
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("registry-mobile");
    await page.setViewportSize({ width: 1440, height: 1000 });
    let failRegistry = true;
    await page.route("**/api/shareholders?*", (route) =>
      failRegistry
        ? route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "Test connection interrupted" }),
          })
        : route.continue(),
    );
    await page
      .getByRole("button", { name: "Refresh shareholders", exact: true })
      .click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Test connection interrupted" }),
    ).toBeVisible();
    failRegistry = false;
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Test connection interrupted" }),
    ).toHaveCount(0);
    await page.unroute("**/api/shareholders?*");
    check(
      "desktop/mobile navigation, themes, registry creation/editing/search/pagination and connection recovery",
    );

    await page.goto(`${origin}/meetings`);
    await page
      .getByRole("button", { name: "Create meeting", exact: true })
      .click();
    const meetingDialog = page.getByRole("dialog");
    await meetingDialog
      .getByLabel("Title", { exact: true })
      .fill("UI Test Election");
    await meetingDialog
      .getByLabel("Date & time", { exact: true })
      .fill("2026-11-12T09:00");
    await meetingDialog
      .getByLabel("Location", { exact: true })
      .fill("UI Test Hall");
    await meetingDialog.getByLabel("Quorum (%)", { exact: true }).fill("50");
    await meetingDialog
      .getByLabel("Number of winners", { exact: false })
      .fill("1");
    await meetingDialog
      .getByRole("button", { name: "Save meeting", exact: true })
      .click();
    await expect(meetingDialog).toHaveCount(0);
    const meeting = await db.meeting.findFirstOrThrow({
      where: { title: "UI Test Election" },
    });
    const prefix = `/api/meetings/${meeting.id}`;
    await page.getByText("UI Test Election", { exact: true }).waitFor();
    await screenshot("meetings-desktop");
    await openMenu("Manage nominees");
    const nomineeDialog = page.getByRole("dialog");
    await nomineeDialog
      .getByLabel("Shareholder", { exact: true })
      .selectOption("ui-holder");
    await nomineeDialog
      .getByRole("button", { name: "Add nominee", exact: true })
      .click();
    await expect(
      nomineeDialog.getByText("UI Shareholder", { exact: true }),
    ).toBeVisible();
    await nomineeDialog
      .getByLabel("Shareholder", { exact: true })
      .selectOption("nominee");
    await nomineeDialog
      .getByRole("button", { name: "Add nominee", exact: true })
      .click();
    await expect(
      nomineeDialog.getByText("nominee private identity", { exact: true }),
    ).toBeVisible();
    await screenshot("nominees-dialog");
    await nomineeDialog
      .getByRole("button", { name: "Edit nominee UI Shareholder", exact: true })
      .click();
    await expect(
      nomineeDialog.getByLabel("Shareholder", { exact: true }),
    ).toBeDisabled();
    await nomineeDialog
      .getByLabel("Description (optional)", { exact: true })
      .fill("Synthetic nominee description");
    await nomineeDialog
      .getByRole("button", { name: "Update nominee", exact: true })
      .click();
    await expect(
      nomineeDialog.getByText(/Synthetic nominee description/),
    ).toBeVisible();
    await nomineeDialog
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await openMenu("Open attendance");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Open attendance", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page
        .getByRole("row")
        .filter({ hasText: "UI Test Election" })
        .getByText("Attendance open", { exact: true }),
    ).toBeVisible();
    await openMenu("View attendance");
    const attendanceDialog = page.getByRole("dialog");
    await attendanceDialog
      .getByLabel("Search shareholders", { exact: true })
      .fill("ui-holder");
    await attendanceDialog
      .getByRole("checkbox", {
        name: "Select UI Shareholder (ui-holder)",
        exact: true,
      })
      .check();
    await screenshot("attendance-dialog");
    await attendanceDialog
      .getByRole("button", { name: "Register 1 shareholder", exact: true })
      .click();
    await expect(
      attendanceDialog.getByRole("heading", { name: /Registered attendees/ }),
    ).toContainText("1");
    await attendanceDialog
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await openMenu("Open voting");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Open voting", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page
        .getByRole("row")
        .filter({ hasText: "UI Test Election" })
        .getByText("Voting open", { exact: true }),
    ).toBeVisible();
    await openMenu("View nominees");
    await expect(
      page.getByRole("dialog").getByText(/Nominee details are read-only/),
    ).toBeVisible();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Add nominee", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await page
      .getByLabel("Meeting status", { exact: true })
      .selectOption("CLOSED");
    await expect(
      page.getByRole("heading", {
        name: "No meetings match your filters",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("meetings-mobile");
    check(
      "meeting creation, nominee setup, attendance registration, lifecycle confirmations and read-only nominee controls",
    );

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/meetings/${meeting.id}/vote`);
    await page
      .getByLabel("Shareholder ID on voting card", { exact: true })
      .fill("absent-voter");
    await expect(page.locator(".error-notice")).toBeVisible();
    await page
      .getByLabel("Shareholder ID on voting card", { exact: true })
      .fill("ui-holder");
    await expect(
      page.getByRole("status").filter({ hasText: "choices used" }),
    ).toContainText("50 shares");
    await page
      .getByRole("checkbox", { name: "UI Shareholder", exact: true })
      .check();
    await screenshot("vote-desktop");
    await page
      .getByRole("button", { name: "Switch to dark theme", exact: true })
      .click();
    await screenshot("vote-dark");
    await page
      .getByRole("button", { name: "Switch to light theme", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record 1 choice", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Reverse recorded vote for UI Shareholder",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Reverse recorded vote for UI Shareholder",
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Reason for reversal", { exact: true })
      .fill("no");
    await expect(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Reverse choice", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("dialog")
      .getByLabel("Reason for reversal", { exact: true })
      .fill("Correcting the synthetic UI test ballot");
    await screenshot("reversal-dialog");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Reverse choice", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "Reverse recorded vote for UI Shareholder",
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("checkbox", { name: "nominee private identity", exact: true })
      .check();
    await page
      .getByRole("button", { name: "Record 1 choice", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Reverse recorded vote for nominee private identity",
        exact: true,
      }),
    ).toBeVisible();
    assert.equal(await db.vote.count({ where: { meetingId: meeting.id } }), 1);
    assert.equal(
      Number(
        (await db.vote.findFirstOrThrow({ where: { meetingId: meeting.id } }))
          .weight,
      ),
      50,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("vote-mobile");
    check(
      "browser ballot eligibility, recording, reversal reason validation and corrected vote weight",
    );
    const voteLayoutChecks = await verifyVoteLayoutUI({ browser, context, origin, meeting, check });

    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      for (const [suffix, title] of [
        ["reports", "Reports"],
        ["reports/attendance", "Attendance report"],
        ["reports/voting", "Voting report"],
        ["results", "Voting results"],
      ]) {
        await page.goto(`${origin}/meetings/${meeting.id}/${suffix}`);
        await page.getByRole("heading", { name: title, exact: true }).waitFor();
        if (suffix !== "reports")
          await expect(
            page.getByRole("status").filter({ hasText: /Loading/ }),
          ).toHaveCount(0);
        await screenshot(`${suffix.replaceAll("/", "-")}-${width}`);
      }
    }
    await page.goto(`${origin}/meetings/${meeting.id}/reports/voting`);
    await page
      .getByLabel("Shareholder or representative name / ID", { exact: false })
      .fill("absent-voter");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "No matching vote records",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page
      .getByRole("cell")
      .filter({ hasText: "UI Shareholder" })
      .waitFor();
    const savedVote = await db.vote.findFirstOrThrow({
      where: { meetingId: meeting.id },
    });
    await db.vote.createMany({
      data: Array.from({ length: 500 }, (_, index) => ({
        meetingId: meeting.id,
        nomineeId: savedVote.nomineeId,
        voterId: `ui-export-${String(index).padStart(3, "0")}`,
        weight: 1,
        snapshotVoterName: `Export test voter ${index + 1}`,
        snapshotVoterShareValue: 1,
      })),
    });
    const [excel] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export Excel", exact: true }).click(),
    ]);
    await excel.saveAs(".local/ui-verification/voting-report.xlsx");
    assert.equal(await excel.failure(), null);
    const workbook = XLSX.read(
      await readFile(".local/ui-verification/voting-report.xlsx"),
      { type: "buffer" },
    );
    assert.equal(
      XLSX.utils.sheet_to_json(workbook.Sheets["Vote audit"]).length,
      501,
    );
    await db.vote.deleteMany({
      where: { meetingId: meeting.id, voterId: { startsWith: "ui-export-" } },
    });
    await page.goto(`${origin}/meetings/${meeting.id}/reports/attendance`);
    await page
      .getByRole("cell")
      .filter({ hasText: "UI Shareholder" })
      .waitFor();
    const [pdf] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Generate PDF", exact: true }).click(),
    ]);
    await pdf.saveAs(".local/ui-verification/attendance-report.pdf");
    assert.equal(await pdf.failure(), null);
    const attendanceReport = await admin.call(`${prefix}/reports/attendance`);
    assert.equal(attendanceReport.attendeesCount, 1);
    assert.equal(attendanceReport.attendedShares, 50);
    assert.equal(attendanceReport.totalShareholdersCount, 33);
    check(
      "responsive reports/results, vote filters, full Excel export and attendance PDF download",
    );

    await page.goto(`${origin}/meetings/${meeting.id}/voting-cards`);
    await expect(page.locator(".print-area article")).toHaveCount(33);
    await screenshot("cards-desktop", false);
    await page.setViewportSize({ width: 820, height: 1000 });
    await screenshot("cards-tablet", false);
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("cards-mobile", false);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".workspace-sidebar")).toBeHidden();
    await expect(page.locator(".workspace-topbar")).toBeHidden();
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: ".local/ui-verification/voting-cards.pdf",
      preferCSSPageSize: true,
      printBackground: true,
    });
    const sheet = await page
      .locator(".print-area > div")
      .first()
      .evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
      }));
    assert.ok(
      Math.abs(sheet.width - 793.7) < 2 && Math.abs(sheet.height - 1122.5) < 2,
      `A4 sheet dimensions: ${JSON.stringify(sheet)}`,
    );
    await page.emulateMedia({ media: "screen" });
    const zero = (
      await admin.call(
        "/api/meetings",
        "POST",
        {
          title: "Zero share projection",
          date: "2026-11-15T09:00:00Z",
          location: "Test",
          quorum: 50,
          winnerCount: 1,
        },
        201,
      )
    ).item;
    await page.goto(`${origin}/meetings/${zero.id}/attendance/live`);
    await page
      .getByText("Waiting for more Attendees ...", { exact: true })
      .waitFor();
    await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
    const zeroStats = await admin.call(
      `/api/public/meetings/${zero.id}/attendance`,
    );
    assert.equal(zeroStats.quorumMet, false);
    await screenshot("projection-zero-shares", false);
    await page
      .getByRole("button", { name: "Enter fullscreen", exact: true })
      .click();
    await expect
      .poll(() => page.evaluate(() => !!document.fullscreenElement))
      .toBe(true);
    await page.evaluate(() => document.exitFullscreen());
    await expect(
      page.getByRole("button", { name: "Enter fullscreen", exact: true }),
    ).toBeVisible();
    for (const suffix of ["attendance/live", "live"]) {
      for (const width of [390, 1280, 1920]) {
        await page.setViewportSize({
          width,
          height: width === 390 ? 844 : width === 1280 ? 720 : 1080,
        });
        const response = page.waitForResponse(
          (response) =>
            response.url().includes(`/api/public/meetings/${meeting.id}/`) &&
            response.ok(),
        );
        await page.goto(`${origin}/meetings/${meeting.id}/${suffix}`);
        await response;
        const projectionContent = suffix === "attendance/live"
          ? page.getByRole("region", { name: "Attendance totals", exact: true })
          : page.locator(".election-wall");
        await expect(projectionContent).toBeVisible();
        await expect(projectionContent).toHaveCSS("opacity", "1");
        await expect(page.locator(".workspace-sidebar")).toHaveCount(0);
        await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
        await screenshot(`projection-${suffix.replaceAll("/", "-")}-${width}`);
      }
    }
    await page.goto(`${origin}/admin`);
    await page
      .getByRole("heading", { name: "Users & Roles", exact: true })
      .waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Add user", exact: true }).click();
    await screenshot("admin-mobile");
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Account settings", exact: true })
      .click();
    await page.waitForURL(/\/account\/password/);
    await page
      .getByRole("button", { name: "Change password", exact: true })
      .waitFor();
    await screenshot("account-mobile");
    await page.goto(`${origin}/admin`);
    await page
      .getByRole("heading", { name: "Users & Roles", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Add user", exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await screenshot("admin-desktop");
    await page.goto(`${origin}/audit`);
    await page
      .getByRole("heading", { name: "Audit history", exact: true })
      .waitFor();
    await expect(
      page.getByRole("status").filter({ hasText: /Loading/ }),
    ).toHaveCount(0);
    await screenshot("audit-desktop");
    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot("audit-mobile");
    await page.setViewportSize({ width: 1440, height: 1000 });
    const reauth = await page.request.post(`${origin}/api/auth/reauth`, {
      headers: { origin },
      data: { password },
    });
    assert.ok(reauth.ok(), "The test administrator could not reconfirm the session.");
    const clipboardChecks = await verifyClipboardUI({ page, origin, check });
    const hydrationChecks = await verifyHydrationUI({ browser, context, origin, meeting, check });
    assert.deepEqual(errors, [], errors.join("\n"));
    assert.deepEqual(hydration, [], hydration.join("\n"));
    await writeFile(
      ".local/ui-verification/result.json",
      JSON.stringify(
        {
          passed: true,
          origin,
          secureContext: await page.evaluate(() => window.isSecureContext),
          clipboardScenarios: clipboardChecks.scenarios,
          voteLayoutChecks,
          hydrationNavigations: hydrationChecks.navigations,
          hydrationWarnings: hydration.length,
          runtimeErrors: errors.length,
          viewportWidths: [390, 820, 1280, 1440, 1920],
          testedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    check(
      "all-shareholder A4 cards, public projections, mobile administration/audit and no app hydration or runtime errors",
    );
  } catch (error) {
    await page
      .screenshot({
        path: ".local/ui-verification/failure.png",
        fullPage: true,
      })
      .catch(() => {});
    await writeFile(
      ".local/ui-verification/failure.json",
      JSON.stringify(
        { url: page.url(), errors, hydration, error: error.message },
        null,
        2,
      ),
    );
    throw error;
  } finally {
    await context.close();
  }
}
