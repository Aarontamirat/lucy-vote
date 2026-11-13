import assert from "node:assert/strict";
import { expect } from "@playwright/test";

// Invoked only by verify-rbac's synthetic administrator and temporary database.
// Keep all credential comparisons in the browser; return only booleans/counts.
export async function verifyClipboardUI({ page, origin, check }) {
  const fixture = {
    name: "Clipboard User",
    email: "clipboard-ui@example.test",
    role: "projection-viewer",
    meeting: "UI Test Election",
  };
  const runtimeErrors = [];
  const onPageError = (error) => runtimeErrors.push(error.message);
  page.on("pageerror", onPageError);

  const dialog = page.getByRole("dialog", {
    name: "Temporary sign-in details",
    exact: true,
  });
  const passwordInput = dialog.locator('input[aria-label="Temporary password"]');
  const feedback = dialog.locator("#temporary-password-copy-feedback");
  const copyButton = dialog.getByRole("button", {
    name: "Copy password",
    exact: true,
  });

  const restoreBrowser = async () => {
    await page.evaluate(() => {
      const state = window.__clipboardUIVerification;
      if (!state) return;
      document.removeEventListener("copy", state.onCopy, true);
      if (state.clipboardDescriptor) {
        Object.defineProperty(navigator, "clipboard", state.clipboardDescriptor);
      } else {
        delete navigator.clipboard;
      }
      if (state.commandDescriptor) {
        Object.defineProperty(document, "execCommand", state.commandDescriptor);
      } else {
        delete document.execCommand;
      }
      delete window.__clipboardUIVerification;
    });
  };

  async function verifyCopyMode(mode, phase) {
    await page.evaluate((mode) => {
      const dialog = [...document.querySelectorAll('[role="dialog"]')].find(
        (element) => element.querySelector('input[aria-label="Temporary password"]'),
      );
      const password = dialog.querySelector('input[aria-label="Temporary password"]').value;
      const state = {
        clipboardDescriptor: Object.getOwnPropertyDescriptor(navigator, "clipboard"),
        commandDescriptor: Object.getOwnPropertyDescriptor(document, "execCommand"),
        apiCalls: 0,
        apiMatches: false,
        copyEvents: 0,
        selectedTextMatches: false,
        selectedInsideDialog: false,
        selectedEntireText: false,
      };
      state.onCopy = () => {
        const selected = document.activeElement;
        const hasInputSelection =
          selected instanceof HTMLInputElement ||
          selected instanceof HTMLTextAreaElement;
        const selectedText = hasInputSelection
          ? selected.value.slice(selected.selectionStart, selected.selectionEnd)
          : document.getSelection()?.toString();
        state.copyEvents++;
        state.selectedTextMatches = selectedText === password && password.length > 0;
        state.selectedInsideDialog = selected?.closest('[role="dialog"]') === dialog;
        state.selectedEntireText =
          hasInputSelection && selected.selectionStart === 0 &&
          selected.selectionEnd === selected.value.length;
      };
      window.__clipboardUIVerification = state;
      document.addEventListener("copy", state.onCopy, true);
      const clipboard = mode === "api-missing" ? undefined : {
        async writeText(value) {
          state.apiCalls++;
          state.apiMatches = value === password && password.length > 0;
          if (mode !== "api-success") {
            throw new DOMException("Clipboard permission denied", "NotAllowedError");
          }
        },
      };
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: clipboard,
      });
      if (mode === "both-fail") {
        Object.defineProperty(document, "execCommand", {
          configurable: true,
          value: () => false,
        });
      }
    }, mode);
    try {
      await copyButton.click();
      if (mode === "both-fail") {
        await expect(feedback).toHaveAttribute("role", "alert");
        await expect(feedback).toContainText("Your browser could not copy the password.");
        await expect(copyButton, `${phase}/${mode}: copy-button focus is restored`).toBeFocused();
        await dialog.getByRole("button", { name: "Select password", exact: true }).click();
        await expect(passwordInput).toHaveAttribute("type", "text");
        await expect(passwordInput).toBeFocused();
        await expect(feedback).toHaveAttribute("role", "status");
        await expect(feedback).toContainText("Password selected.");
        assert.equal(await passwordInput.evaluate((input) =>
          input.selectionStart === 0 && input.selectionEnd === input.value.length &&
          input.value.length > 0,
        ), true, `${phase}: failed automatic copy selects the entire password for manual copying`);
        // This click confirms the credential can be concealed again after selection.
        await dialog.getByRole("button", { name: "Hide", exact: true }).click();
        await expect(passwordInput).toHaveAttribute("type", "password");
      } else {
        await expect(feedback).toHaveAttribute("role", "status");
        await expect(feedback).toHaveText("Temporary password copied.");
        await expect(copyButton, `${phase}/${mode}: copy-button focus is restored`).toBeFocused();
      }

      const result = await page.evaluate(() => {
        const state = window.__clipboardUIVerification;
        return {
          apiCalls: state.apiCalls,
          apiMatches: state.apiMatches,
          copyEvents: state.copyEvents,
          selectedTextMatches: state.selectedTextMatches,
          selectedInsideDialog: state.selectedInsideDialog,
          selectedEntireText: state.selectedEntireText,
        };
      });
      if (mode === "api-success") {
        assert.equal(result.apiCalls, 1, `${phase}: Clipboard API is invoked once`);
        assert.equal(result.apiMatches, true, `${phase}: Clipboard API receives the temporary password`);
        assert.equal(result.copyEvents, 0, `${phase}: successful Clipboard API avoids legacy copying`);
      } else if (mode !== "both-fail") {
        assert.equal(result.apiCalls, mode === "api-missing" ? 0 : 1);
        assert.ok(result.copyEvents > 0, `${phase}: the native legacy copy event fires`);
        assert.equal(result.selectedTextMatches, true, `${phase}: legacy copy selects the temporary password`);
        assert.equal(result.selectedInsideDialog, true, `${phase}: legacy copy remains inside the modal focus trap`);
        assert.equal(result.selectedEntireText, true, `${phase}: legacy copy includes the entire password`);
      } else {
        assert.equal(result.apiCalls, 1);
        assert.equal(result.copyEvents, 0, `${phase}: denied copy does not claim a copy event`);
      }
      await expect(dialog.locator("textarea")).toHaveCount(0);
      assert.equal(runtimeErrors.length, 0, `${phase}: clipboard operations produce no uncaught errors`);
    } catch (error) {
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        return {
          tag: element?.tagName,
          id: element?.id,
          label: element?.getAttribute("aria-label"),
          role: element?.getAttribute("role"),
          button: element?.tagName === "BUTTON" ? element.textContent?.trim() : undefined,
        };
      }).catch(() => null);
      throw new Error(`${phase}/${mode} failed; active element ${JSON.stringify(focused)}: ${error.message}`, { cause: error });
    } finally {
      await restoreBrowser();
    }
  }

  async function verifyCredentialDialog(phase) {
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(fixture.email, { exact: true })).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(feedback).toHaveCount(0);
    for (const mode of ["api-success", "api-missing", "api-rejected", "both-fail"]) {
      await verifyCopyMode(mode, phase);
    }
    await dialog.getByRole("button", { name: "Done", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    check(`${phase}: Clipboard API, LAN HTTP legacy copy, permission fallback, manual selection and focus restoration`);
  }

  try {
    await page.goto(`${origin}/admin`);
    await page.getByRole("heading", { name: "Users & Roles", exact: true }).waitFor();
    await page.getByRole("button", { name: "Add user", exact: true }).click();
    await page.getByLabel("Display name", { exact: true }).fill(fixture.name);
    await page.getByLabel("Email", { exact: true }).fill(fixture.email);
    await page.getByLabel("Role", { exact: true }).selectOption(fixture.role);
    await page.getByLabel(fixture.meeting, { exact: false }).check();
    const created = page.waitForResponse((response) =>
      new URL(response.url()).pathname === "/api/admin/users" &&
      response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save user", exact: true }).click();
    assert.equal((await created).status(), 201,
      "Synthetic clipboard user creation succeeds; the UI administrator must have recent reauthentication");
    await verifyCredentialDialog("new user password");

    await page.getByLabel("Search accounts", { exact: true }).fill(fixture.email);
    await page.locator(".settings-item").filter({ hasText: fixture.email }).click();
    await page.getByRole("button", { name: "Reset password", exact: true }).click();
    const confirmation = page.getByRole("dialog", { name: "Reset password", exact: true });
    await expect(confirmation).toBeVisible();
    const reset = page.waitForResponse((response) =>
      /\/api\/admin\/users\/[^/]+\/password$/.test(new URL(response.url()).pathname) &&
      response.request().method() === "POST",
    );
    await confirmation.getByRole("button", { name: "Reset password", exact: true }).click();
    assert.equal((await reset).status(), 200,
      "Synthetic clipboard password reset succeeds; the UI administrator must have recent reauthentication");
    await verifyCredentialDialog("reset user password");
    assert.equal(runtimeErrors.length, 0, "Clipboard UI produces no uncaught runtime errors");
    return { created: true, reset: true, scenarios: 8 };
  } finally {
    await restoreBrowser().catch(() => {});
    if (await dialog.isVisible().catch(() => false)) {
      await dialog.getByRole("button", { name: "Done", exact: true }).click().catch(() => {});
    }
    page.off("pageerror", onPageError);
  }
}
