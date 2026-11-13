import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { expect } from "@playwright/test";

const hydrationMessage =
  /hydration|hydrated|didn.t match|server rendered HTML|In HTML,|validateDOMNesting/i;

// Reuses only the isolated verification session. This helper makes no API mutations.
export async function verifyHydrationUI({ browser, context, origin, meeting, check }) {
  const [layout, shell] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/workspace/AppShell.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(layout, /<body\b[^>]*suppressHydrationWarning/);
  assert.doesNotMatch(shell, /<div\b[^>]*className="workspace-shell"[^>]*suppressHydrationWarning/);

  const session = await context.storageState();
  const appOrigin = new URL(origin).origin;
  const ownedContexts = [];
  const hydration = [], runtime = [];
  let navigations = 0;
  const storageWithTheme = (theme) => {
    const existing = session.origins.find((item) => item.origin === appOrigin);
    return {
      cookies: session.cookies,
      origins: [
        ...session.origins.filter((item) => item.origin !== appOrigin),
        {
          origin: appOrigin,
          localStorage: [
            ...(existing?.localStorage ?? []).filter((item) => item.name !== "theme"),
            { name: "theme", value: theme },
          ],
        },
      ],
    };
  };
  const assertClean = () => {
    assert.deepEqual(hydration, [], JSON.stringify(hydration, null, 2));
    assert.deepEqual(runtime, [], JSON.stringify(runtime, null, 2));
  };
  const createPage = async (theme) => {
    const isolated = await browser.newContext({
      storageState: storageWithTheme(theme),
      viewport: { width: 1440, height: 1000 },
      colorScheme: "light",
      reducedMotion: "reduce",
      locale: "de-DE",
      timezoneId: "America/New_York",
    });
    ownedContexts.push(isolated);
    isolated.setDefaultTimeout(60_000);
    isolated.on("page", (page) => {
      page.on("console", (message) => {
        if (hydrationMessage.test(message.text())) {
          hydration.push({ url: page.url(), text: message.text(), location: message.location() });
        }
      });
      page.on("pageerror", (error) => {
        runtime.push({ url: page.url(), message: error.message, stack: error.stack });
      });
    });
    return isolated.newPage();
  };
  const expectTheme = async (page, theme) => {
    await expect.poll(() => page.locator("html").evaluate((node) =>
      node.classList.contains("dark") ? "dark" : "light",
    )).toBe(theme);
  };
  const expectSkipLink = async (page) => {
    const skip = page.locator(".workspace-shell > a.skip-link");
    await expect(skip).toHaveCount(1);
    await expect(skip).toHaveAttribute("href", "#workspace-content");
    await expect(skip).toHaveAttribute("class", "skip-link");
    await expect(page.locator("#workspace-content")).toHaveCount(1);
  };
  const sidebarColors = async (locator) => locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return { background: style.backgroundColor, foreground: style.color };
  });
  const openMobileNavigation = async (page) => {
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Navigation", exact: true });
    await expect(dialog).toBeVisible();
    // Radix's generated IDs must still connect its portalled title and description.
    const accessibleReferences = await dialog.evaluate((node) => {
      const label = node.getAttribute("aria-labelledby");
      const description = node.getAttribute("aria-describedby");
      const uniqueReference = (id) => !!id &&
        Array.from(document.querySelectorAll("[id]")).filter((element) => element.id === id).length === 1;
      return {
        label: uniqueReference(label),
        description: uniqueReference(description),
        portalled: !node.closest(".workspace-shell"),
      };
    });
    assert.deepEqual(accessibleReferences, { label: true, description: true, portalled: true });
    return dialog;
  };
  const closeMobileNavigation = async (page) => {
    await page.getByRole("button", { name: "Close navigation", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Navigation", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open navigation", exact: true })).toBeFocused();
  };
  const settledWorkspace = async (page, route) => {
    await page.getByRole("heading", { name: route.heading, exact: typeof route.heading === "string" }).waitFor();
    await expect(page.getByRole("button", { name: "Switch to light theme", exact: true })).toBeEnabled();
    await expectSkipLink(page);
    assertClean();
  };

  try {
    const darkPage = await createPage("dark");
    const routes = [
      { path: "/", heading: /Welcome,/, link: "Overview" },
      { path: "/admin", heading: "Users & Roles", link: "Users & Roles" },
      { path: "/meetings", heading: "Meetings", link: "Meetings" },
      { path: "/shareholders", heading: "Shareholders", link: "Shareholders" },
    ];
    for (const [index, route] of routes.entries()) {
      if (index === 0) await darkPage.goto(`${origin}${route.path}`, { waitUntil: "networkidle" });
      else {
        await darkPage.locator(".workspace-sidebar").getByRole("link", { name: route.link, exact: true }).click();
        await darkPage.waitForURL(`${origin}${route.path}`);
        await darkPage.waitForLoadState("networkidle");
      }
      navigations++;
      await expectTheme(darkPage, "dark");
      await settledWorkspace(darkPage, route);
      // Open a real Radix menu after hydration, without choosing a mutation.
      if (route.path === "/meetings" || route.path === "/shareholders") {
        const trigger = route.path === "/meetings"
          ? darkPage.getByRole("button", { name: /Actions for/ }).first()
          : darkPage.getByRole("button", { name: "Registry options", exact: true });
        await trigger.click();
        await expect(darkPage.getByRole("menu")).toBeVisible();
        await darkPage.keyboard.press("Escape");
        await expect(darkPage.getByRole("menu")).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
      await darkPage.reload({ waitUntil: "networkidle" });
      navigations++;
      await settledWorkspace(darkPage, route);
      await expectTheme(darkPage, "dark");
    }
    const persistedDarkColors = await sidebarColors(darkPage.locator(".workspace-sidebar"));
    assert.notEqual(persistedDarkColors.background, "rgba(0, 0, 0, 0)");

    await darkPage.setViewportSize({ width: 390, height: 844 });
    let dialog = await openMobileNavigation(darkPage);
    assert.deepEqual(await sidebarColors(dialog), persistedDarkColors);
    await closeMobileNavigation(darkPage);
    await openMobileNavigation(darkPage);
    await darkPage.reload({ waitUntil: "networkidle" });
    navigations++;
    await settledWorkspace(darkPage, routes[3]);
    await expect(darkPage.getByRole("dialog")).toHaveCount(0);
    dialog = await openMobileNavigation(darkPage);
    assert.deepEqual(await sidebarColors(dialog), persistedDarkColors);
    await dialog.getByRole("link", { name: "Meetings", exact: true }).click();
    await darkPage.waitForURL(`${origin}/meetings`);
    await settledWorkspace(darkPage, routes[2]);
    await expect(darkPage.getByRole("dialog")).toHaveCount(0);
    navigations++;

    for (const suffix of ["attendance/live", "live"]) {
      const path = `/meetings/${meeting.id}/${suffix}`;
      const ready = () => suffix === "attendance/live"
        ? darkPage.getByRole("region", { name: "Attendance totals", exact: true })
        : darkPage.locator(".election-wall");
      for (const reload of [false, true]) {
        const response = darkPage.waitForResponse((item) =>
          item.url().includes(`/api/public/meetings/${meeting.id}/`) && item.ok(),
        );
        if (reload) await darkPage.reload({ waitUntil: "networkidle" });
        else await darkPage.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        await response;
        await expect(ready()).toBeVisible();
        await expectTheme(darkPage, "dark");
        await expect(darkPage.locator(".workspace-sidebar")).toHaveCount(0);
        assertClean();
        navigations++;
      }
    }
    check("signed-in hydration on navigation/reload, persisted dark theme, skip links, Radix portals and both projections with differing locale/timezone and reduced motion");

    const systemPage = await createPage("system");
    await systemPage.goto(origin, { waitUntil: "networkidle" });
    await systemPage.getByRole("heading", { name: /Welcome,/ }).waitFor();
    await expectTheme(systemPage, "light");
    await expectSkipLink(systemPage);
    const lightColors = await sidebarColors(systemPage.locator(".workspace-sidebar"));
    assert.notEqual(lightColors.background, persistedDarkColors.background);
    assert.notEqual(lightColors.foreground, persistedDarkColors.foreground);
    await systemPage.setViewportSize({ width: 390, height: 844 });
    dialog = await openMobileNavigation(systemPage);
    assert.deepEqual(await sidebarColors(dialog), lightColors);
    await systemPage.emulateMedia({ colorScheme: "dark" });
    await expectTheme(systemPage, "dark");
    assert.deepEqual(await sidebarColors(dialog), persistedDarkColors);
    await closeMobileNavigation(systemPage);
    await systemPage.reload({ waitUntil: "networkidle" });
    await expectTheme(systemPage, "dark");
    await expectSkipLink(systemPage);
    await expect(systemPage.getByRole("dialog")).toHaveCount(0);
    dialog = await openMobileNavigation(systemPage);
    assert.deepEqual(await sidebarColors(dialog), persistedDarkColors);
    await closeMobileNavigation(systemPage);
    await systemPage.setViewportSize({ width: 1440, height: 1000 });
    assert.deepEqual(await sidebarColors(systemPage.locator(".workspace-sidebar")), persistedDarkColors);
    await systemPage.emulateMedia({ colorScheme: "light" });
    await expectTheme(systemPage, "light");
    assert.deepEqual(await sidebarColors(systemPage.locator(".workspace-sidebar")), lightColors);
    assert.equal(await systemPage.evaluate(() => localStorage.getItem("theme")), "system");
    navigations += 2;
    assertClean();
    check("system theme changes update desktop and open mobile navigation colors, retain preference across reload, and produce no hydration/runtime errors");
    return { navigations, hydrationWarnings: hydration.length, runtimeErrors: runtime.length };
  } finally {
    await Promise.all(ownedContexts.map((isolated) => isolated.close()));
  }
}
