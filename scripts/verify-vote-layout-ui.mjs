import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { expect } from "@playwright/test";

const voterId = "vote-layout-voter";
const status = "VOTINGOPEN";
const title = "Synthetic ballot layout election";

function makeFixture({ mode = "GROUPED", count = 24, emptySecond = false, recorded = [] } = {}) {
  const rules = mode === "GROUPED"
    ? { mode, winnerCount: 4, sections: [{ key: "first", label: "Group 1", count: 2 }, { key: "second", label: "Group 2", count: 2 }] }
    : { mode, winnerCount: 3, sections: [{ key: "standard", label: "Nominees you vote for", count: 3 }] };
  const config = mode === "GROUPED"
    ? { firstPassers: 2, secondPassers: 2, winnerCount: null }
    : { firstPassers: null, secondPassers: null, winnerCount: 3 };
  const nominees = [];
  for (let index = 1; index <= (mode === "GROUPED" ? count / 2 : count); index++) {
    // The source deliberately interleaves groups, starting with Group 2.
    for (const type of mode === "GROUPED" ? ["second", "first"] : ["standard"]) {
      if (emptySecond && type === "second") continue;
      const group = type === "first" ? "Group 1" : type === "second" ? "Group 2" : "Standard";
      const suffix = String(index).padStart(2, "0");
      const long = count >= 80;
      nominees.push({
        id: `vote-fixture-${type}-${suffix}`,
        shareholderId: `vote-holder-${type}-${suffix}`,
        name: long
          ? `${group} Candidate ${suffix} - Extended shareholder family name and full registered nominee label unique-last-${suffix}`
          : `${group} Candidate ${suffix}`,
        nameAm: null,
        type,
        description: null,
        createdAt: `2026-11-11T09:${String(index).padStart(2, "0")}:00.000Z`,
      });
    }
  }
  return { mode, rules, config, nominees, recorded: new Set(recorded) };
}

// Clones the existing synthetic administrator context. Only these three API
// endpoints are mocked, including writes; the real meeting authorizes the page.
export async function verifyVoteLayoutUI({ browser, context, origin, meeting, check }) {
  const meetingId = typeof meeting === "string" ? meeting : meeting?.id;
  assert.ok(meetingId, "An existing authorized synthetic meeting is required");
  const ownContext = await browser.newContext({
    storageState: await context.storageState(),
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  });
  ownContext.setDefaultTimeout(30_000);
  const errors = [], hydration = [], submissions = [], reversals = [];
  ownContext.on("page", (page) => {
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/hydration|hydrated|didn.t match|server rendered HTML|In HTML,|validateDOMNesting/i.test(message.text())) {
        hydration.push(message.text());
      }
    });
  });
  let fixture = makeFixture();
  const base = `/api/meetings/${meetingId}/`;
  const allowed = new Set([`${base}nominees`, `${base}attendance`, `${base}votes`]);
  await ownContext.route((url) => url.origin === new URL(origin).origin && allowed.has(url.pathname), async (route) => {
    const request = route.request(), url = new URL(request.url());
    let body, responseStatus = 200;
    if (url.pathname.endsWith("/nominees") && request.method() === "GET") {
      body = {
        meetingStatus: status,
        meetingName: title,
        items: fixture.nominees,
        shareholders: [],
        electionRules: fixture.rules,
        electionRulesError: null,
        electionConfig: fixture.config,
      };
    } else if (url.pathname.endsWith("/attendance") && request.method() === "GET") {
      body = { attendance: url.searchParams.get("voterId") === voterId
        ? [{ shareholderId: voterId, representedById: null, shareValue: "125", name: "Synthetic Layout Voter" }]
        : [] };
    } else if (url.pathname.endsWith("/votes") && request.method() === "GET") {
      body = {
        meetingStatus: status,
        voterId: url.searchParams.get("voterId"),
        voted: [...fixture.recorded],
        voterWeight: fixture.recorded.size ? 125 : undefined,
        maxVotes: fixture.rules.winnerCount,
        votingRules: fixture.mode === "GROUPED"
          ? { mode: fixture.mode, firstPassers: 2, secondPassers: 2 }
          : { mode: fixture.mode, winnerCount: 3 },
      };
    } else if (url.pathname.endsWith("/votes") && ["POST", "DELETE"].includes(request.method())) {
      const submitted = request.postDataJSON();
      const known = new Set(fixture.nominees.map((nominee) => nominee.id));
      if (submitted.voterId !== voterId || !Array.isArray(submitted.nomineeIds) ||
        !submitted.nomineeIds.length || submitted.nomineeIds.some((id) => !known.has(id))) {
        body = { error: "Invalid synthetic layout ballot" }; responseStatus = 400;
      } else if (request.method() === "POST") {
        submissions.push(submitted);
        for (const id of submitted.nomineeIds) fixture.recorded.add(id);
        body = { ok: true, created: submitted.nomineeIds.map((nomineeId) => ({ nomineeId, voterId, weight: 125 })), already: [] };
      } else {
        reversals.push(submitted);
        for (const id of submitted.nomineeIds) fixture.recorded.delete(id);
        body = { ok: true, reversedCount: submitted.nomineeIds.length, voted: [...fixture.recorded] };
      }
    } else {
      body = { error: "Unsupported synthetic layout request" }; responseStatus = 405;
    }
    await route.fulfill({ status: responseStatus, contentType: "application/json", body: JSON.stringify(body) });
  });

  const page = await ownContext.newPage();
  const path = `${origin}/meetings/${meetingId}/vote`;
  let phase = "initializing";
  const nomineeById = (id) => fixture.nominees.find((nominee) => nominee.id === id);
  const choice = (id) => page.locator(`[id="choice-${id}"]`);
  const panel = (key) => page.locator(`[data-vote-section="${key}"]`);
  const scrollList = (key) => page.locator(`[data-vote-scroll="${key}"]`);
  const search = () => page.getByRole("textbox", { name: "Search nominees", exact: true });
  const meter = () => page.getByRole("status").filter({ hasText: "choices used" });
  const record = () => page.getByRole("button", { name: /^(Record \d+ choices?|Select nominees to record)$/ });

  async function noOverflow(label) {
    const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: document.documentElement.clientWidth }));
    assert.ok(size.scroll <= size.width + 1, `${label}: no horizontal page overflow`);
  }
  async function controlsWithinViewport(label) {
    await page.evaluate(() => window.scrollTo(0, 0));
    for (const control of [page.getByLabel("Shareholder ID on voting card", { exact: true }), record()]) {
      const visible = await control.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
      });
      assert.equal(visible, true, `${label}: voter and recording controls remain within the viewport`);
    }
  }
  async function screenshot(name, fullPage = false) {
    await noOverflow(name);
    await page.screenshot({
      path: `.local/ui-verification/vote-${name}.png`, fullPage, animations: "disabled",
      style: "[data-sonner-toaster], nextjs-portal { visibility: hidden; }",
    });
  }
  async function load(next, width, height, label) {
    phase = label;
    fixture = next;
    await page.setViewportSize({ width, height });
    await page.goto(path);
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    await expect(page.locator('[role="checkbox"][id^="choice-vote-fixture-"]')).toHaveCount(fixture.nominees.length);
    await noOverflow(label);
  }
  async function identify() {
    await page.getByLabel("Shareholder ID on voting card", { exact: true }).fill(voterId);
    await expect(meter()).toContainText("125 shares");
  }
  async function ensureTheme(theme) {
    const dark = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
    if (dark !== (theme === "dark")) {
      await page.getByRole("button", { name: `Switch to ${theme} theme`, exact: true }).click();
    }
    await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /light/);
  }
  async function categoricalPanels() {
    for (const [key, label] of [["first", "Group 1"], ["second", "Group 2"]]) {
      await expect(panel(key).getByRole("heading", { name: label, exact: true })).toBeVisible();
      const ids = await panel(key).locator('[role="checkbox"]').evaluateAll((choices) => choices.map((choice) => choice.id.replace(/^choice-/, "")));
      assert.deepEqual(ids, fixture.nominees.filter((nominee) => nominee.type === key).map((nominee) => nominee.id),
        `${phase}: ${label} preserves registration order and contains only its nominees`);
    }
  }
  async function enoughChoices(key, minimum) {
    const visible = await panel(key).locator('[role="checkbox"]').evaluateAll((choices) => choices.filter((choice) => {
      const rect = choice.getBoundingClientRect();
      const container = choice.closest("[data-vote-scroll]").getBoundingClientRect();
      const top = Math.max(0, container.top), bottom = Math.min(innerHeight, container.bottom);
      return rect.top >= top && rect.bottom <= bottom;
    }).length);
    assert.ok(visible >= minimum, `${phase}: ${key} shows at least ${minimum} choices without scrolling (got ${visible})`);
  }
  async function attemptBeyondLimit(id) {
    if (!(await choice(id).isDisabled())) await choice(id).click();
    await expect(choice(id)).not.toBeChecked();
  }
  async function checkLabel(id) {
    const name = nomineeById(id).name;
    await expect(choice(id)).toHaveAccessibleName(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const label = page.locator(`label[for="choice-${id}"]`);
    await expect(label).toContainText(name);
    const readable = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.textOverflow !== "ellipsis" && element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1;
    });
    assert.equal(readable, true, `${phase}: full nominee labels wrap without clipping`);
  }

  try {
    await mkdir(".local/ui-verification", { recursive: true });
    for (const [width, height, minimum] of [[1366, 768, 6], [1440, 900, 8], [1920, 1080, 10]]) {
      await load(makeFixture(), width, height, `grouped-24-${width}`);
      await ensureTheme("light");
      await categoricalPanels();
      await identify();
      await controlsWithinViewport(phase);
      await enoughChoices("first", minimum);
      await enoughChoices("second", minimum);
      await choice("vote-fixture-first-01").focus();
      await choice("vote-fixture-first-01").press("Space");
      await expect(choice("vote-fixture-first-01")).toBeChecked();
      await choice("vote-fixture-second-01").check();
      await screenshot(`grouped-24-${width}`);
      if (width === 1366) {
        await choice("vote-fixture-first-02").check();
        await attemptBeyondLimit("vote-fixture-first-03");
        await expect(meter()).toContainText("3 of 4 choices used");
        await page.getByRole("button", { name: "Record 3 choices", exact: true }).click();
        await expect(page.getByRole("button", { name: "Reverse recorded vote for Group 1 Candidate 01", exact: true })).toBeVisible();
        assert.deepEqual(submissions.at(-1), {
          voterId,
          nomineeIds: ["vote-fixture-first-01", "vote-fixture-second-01", "vote-fixture-first-02"],
        }, "Grouped layout submits the selected nominee IDs rather than positions or group indices");
      }
      if (width === 1440) {
        await ensureTheme("dark");
        await screenshot("grouped-24-dark-1440");
        await noOverflow("grouped dark theme");
      }
    }
    check("grouped ballots keep categorized registration order, visible choices and voter controls at laptop/desktop sizes; keyboard selection and group limits submit correct IDs");

    await load(makeFixture({ count: 80 }), 1366, 768, "grouped-80");
    await ensureTheme("light");
    await identify();
    await controlsWithinViewport(phase);
    for (const key of ["first", "second"]) {
      const scrollable = await scrollList(key).evaluate((element) => {
        const style = getComputedStyle(element);
        return ["auto", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 4;
      });
      assert.equal(scrollable, true, `${phase}: ${key} scrolls inside its bounded panel`);
    }
    await choice("vote-fixture-first-01").check();
    await search().fill("unique-last-40");
    await expect(page.locator('[role="checkbox"][id^="choice-vote-fixture-"]')).toHaveCount(2);
    await expect(meter()).toContainText("1 of 4 choices used");
    for (const key of ["first", "second"]) {
      await checkLabel(`vote-fixture-${key}-40`);
      await choice(`vote-fixture-${key}-40`).check();
    }
    await screenshot("grouped-80-search");
    await search().fill("");
    await expect(page.locator('[role="checkbox"][id^="choice-vote-fixture-"]')).toHaveCount(80);
    await expect(choice("vote-fixture-first-01")).toBeChecked();
    await expect(choice("vote-fixture-first-40")).toBeChecked();
    await expect(choice("vote-fixture-second-40")).toBeChecked();
    await choice("vote-fixture-second-40").scrollIntoViewIfNeeded();
    await checkLabel("vote-fixture-second-40");
    assert.equal(await page.evaluate(() => window.scrollY <= 1), true, "Dense nominee scrolling keeps page controls in place");
    await controlsWithinViewport(phase);
    await screenshot("grouped-80-scroll");
    check("80 nominees use internal scrolling and full labels; searching and scrolling preserve selected nominee IDs");

    for (const [width, height] of [[390, 844], [820, 1180]]) {
      await load(makeFixture(), width, height, `grouped-responsive-${width}`);
      await ensureTheme("light");
      await categoricalPanels();
      await identify();
      await choice("vote-fixture-first-01").check();
      await choice("vote-fixture-second-01").check();
      await screenshot(`grouped-${width}`, true);
      await ensureTheme("dark");
      await screenshot(`grouped-dark-${width}`, true);
    }
    check("grouped ballot layout remains usable in both themes at mobile and tablet widths without horizontal overflow");

    await load(makeFixture({ mode: "STANDARD" }), 1440, 900, "standard-24");
    await ensureTheme("light");
    await expect(panel("standard")).toBeVisible();
    await expect(panel("first")).toHaveCount(0);
    await expect(panel("second")).toHaveCount(0);
    await identify();
    await controlsWithinViewport(phase);
    for (const id of ["vote-fixture-standard-01", "vote-fixture-standard-02", "vote-fixture-standard-03"]) await choice(id).check();
    await attemptBeyondLimit("vote-fixture-standard-04");
    await expect(meter()).toContainText("3 of 3 choices used");
    await screenshot("standard-1440");

    await load(makeFixture({ emptySecond: true }), 1366, 768, "empty-group");
    await categoricalPanels();
    await expect(panel("second").locator('[role="checkbox"]')).toHaveCount(0);
    await expect(panel("second").getByText(/No nominees|No choices/i)).toBeVisible();
    await screenshot("empty-group");
    await load(makeFixture({ mode: "STANDARD", count: 0 }), 1366, 768, "empty-nominees");
    await expect(page.getByRole("heading", { name: "No nominees registered", exact: true })).toBeVisible();
    await expect(record()).toBeDisabled();
    await screenshot("empty-nominees");
    check("standard ballots enforce their overall limit and empty groups/nominee lists retain clear recording states");

    await load(makeFixture({ recorded: ["vote-fixture-first-01"] }), 1440, 900, "recorded-choice");
    await identify();
    await expect(choice("vote-fixture-first-01")).toBeChecked();
    await expect(choice("vote-fixture-first-01")).toBeDisabled();
    await choice("vote-fixture-first-02").check();
    await attemptBeyondLimit("vote-fixture-first-03");
    const reverse = page.getByRole("button", { name: "Reverse recorded vote for Group 1 Candidate 01", exact: true });
    await expect(reverse).toBeVisible();
    await screenshot("recorded-choice");
    await reverse.click();
    const reversal = page.getByRole("dialog", { name: "Reverse recorded choice", exact: true });
    await reversal.getByLabel("Reason for reversal", { exact: true }).fill("Correcting the synthetic layout fixture");
    await reversal.getByRole("button", { name: "Reverse choice", exact: true }).click();
    await expect(reversal).toHaveCount(0);
    assert.deepEqual(reversals.at(-1).nomineeIds, ["vote-fixture-first-01"]);
    await expect(choice("vote-fixture-first-01")).not.toBeChecked();
    await expect(choice("vote-fixture-first-01")).toBeEnabled();
    await expect(choice("vote-fixture-first-02")).toBeChecked();
    await choice("vote-fixture-first-03").check();
    await expect(meter()).toContainText("2 of 4 choices used");
    check("recorded choices consume the correct group limit and retain an accessible reversal flow that frees the correct choice");

    assert.deepEqual(errors, [], errors.join("\n"));
    assert.deepEqual(hydration, [], hydration.join("\n"));
    check("grouped/standard ballot layout produces no hydration warnings or runtime errors");
    return { groupedNominees: 24, denseNominees: 80, viewportWidths: [390, 820, 1366, 1440, 1920], mockedSubmissions: submissions.length, mockedReversals: reversals.length, hydrationWarnings: 0, runtimeErrors: 0 };
  } catch (error) {
    await page.screenshot({ path: ".local/ui-verification/vote-layout-failure.png", fullPage: true }).catch(() => {});
    throw new Error(`Ballot layout verification failed during ${phase}: ${error.message}`, { cause: error });
  } finally {
    await ownContext.close();
  }
}
