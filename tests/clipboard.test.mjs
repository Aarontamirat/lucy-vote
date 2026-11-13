import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypescript } from "./helpers/load-typescript.mjs";

const { copyText } = loadTypescript("lib/clipboard.ts");
const testPassword = "test-only-temporary-password";

async function withBrowserGlobals(values, operation) {
  const previous = new Map();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  try {
    return await operation();
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function legacyBrowser(commandResult = true) {
  const calls = [];
  const savedRange = {};
  const originalInput = {
    tagName: "INPUT",
    selectionStart: 2,
    selectionEnd: 5,
    selectionDirection: "backward",
    focus() { calls.push("restore focus"); },
    setSelectionRange(start, end, direction) {
      calls.push(["restore input selection", start, end, direction]);
    },
  };
  const selection = {
    rangeCount: 1,
    getRangeAt: () => ({ cloneRange: () => savedRange }),
    removeAllRanges() { calls.push("clear ranges"); },
    addRange(range) { calls.push(["restore range", range]); },
  };
  const field = {
    value: "",
    style: {},
    setAttribute() {},
    focus() { calls.push("focus copy field"); },
    select() { calls.push("select copy field"); },
    setSelectionRange(start, end) { calls.push(["select text", start, end]); },
    remove() { calls.push("remove copy field"); },
  };
  const body = { appendChild() { calls.push("append to body"); } };
  const dialog = {
    isConnected: true,
    appendChild(node) {
      assert.equal(node, field);
      calls.push("append to dialog");
    },
  };
  const document = {
    body,
    activeElement: originalInput,
    getSelection: () => selection,
    createElement: () => field,
    execCommand(command) {
      calls.push(command);
      assert.equal(field.value, testPassword);
      if (commandResult instanceof Error) throw commandResult;
      return commandResult;
    },
  };
  return { document, dialog, field, calls, savedRange };
}

function assertRestored(browser) {
  assert.equal(browser.field.value, "", "temporary plaintext is cleared");
  assert.ok(browser.calls.includes("remove copy field"));
  assert.ok(browser.calls.includes("restore focus"));
  assert.deepEqual(
    browser.calls.find((entry) => Array.isArray(entry) && entry[0] === "restore input selection"),
    ["restore input selection", 2, 5, "backward"],
  );
  assert.ok(browser.calls.some((entry) => Array.isArray(entry) && entry[0] === "restore range" && entry[1] === browser.savedRange));
}

test("secure-context copying uses the Clipboard API and avoids changing focus", async () => {
  const browser = legacyBrowser();
  let writes = 0;
  await withBrowserGlobals({ navigator: { clipboard: { async writeText(value) {
    assert.equal(value, testPassword);
    writes++;
  } } }, document: browser.document }, async () => {
    assert.equal(await copyText(testPassword, browser.dialog), true);
  });
  assert.equal(writes, 1);
  assert.equal(browser.calls.length, 0);
});

test("LAN HTTP without navigator.clipboard copies within the active dialog and restores selection", async () => {
  const browser = legacyBrowser();
  await withBrowserGlobals({ navigator: {}, document: browser.document }, async () => {
    assert.equal(await copyText(testPassword, browser.dialog), true);
  });
  assert.ok(browser.calls.includes("append to dialog"));
  assert.ok(!browser.calls.includes("append to body"));
  assert.ok(browser.calls.includes("copy"));
  assertRestored(browser);
});

test("denied Clipboard API permission tries the legacy copy method", async () => {
  const browser = legacyBrowser();
  await withBrowserGlobals({ navigator: { clipboard: { async writeText() {
    throw new Error("Clipboard permission denied");
  } } }, document: browser.document }, async () => {
    assert.equal(await copyText(testPassword, browser.dialog), true);
  });
  assert.ok(browser.calls.includes("copy"));
  assertRestored(browser);
});

test("legacy browser rejection or exceptions return failure and clean up plaintext and focus", async () => {
  for (const result of [false, new Error("Copy is disabled")]) {
    const browser = legacyBrowser(result);
    await withBrowserGlobals({ navigator: {}, document: browser.document }, async () => {
      assert.equal(await copyText(testPassword, browser.dialog), false);
    });
    assertRestored(browser);
  }
});

test("a detached dialog refuses legacy copying while callers without a container can use the page", async () => {
  const browser = legacyBrowser();
  browser.dialog.isConnected = false;
  await withBrowserGlobals({ navigator: {}, document: browser.document }, async () => {
    assert.equal(await copyText(testPassword, browser.dialog), false);
    assert.equal(browser.calls.length, 0);
    assert.equal(await copyText(testPassword), true);
  });
  assert.ok(browser.calls.includes("append to body"));
  assertRestored(browser);
  await withBrowserGlobals({ navigator: undefined, document: undefined }, async () => {
    assert.equal(await copyText(testPassword), false);
  });
});

test("a pending Clipboard API rejection after the dialog closes never starts legacy copying", async () => {
  const browser = legacyBrowser();
  let rejectClipboard;
  const clipboardRequest = new Promise((_resolve, reject) => {
    rejectClipboard = reject;
  });
  await withBrowserGlobals({ navigator: { clipboard: { writeText() {
    return clipboardRequest;
  } } }, document: browser.document }, async () => {
    const copying = copyText(testPassword, browser.dialog);
    browser.dialog.isConnected = false;
    rejectClipboard(new Error("Clipboard permission denied after closing the dialog"));
    assert.equal(await copying, false);
  });
  assert.equal(browser.calls.length, 0, "dismissal preserves page focus and leaves the clipboard fallback unused");
  assert.equal(browser.field.value, "", "no temporary plaintext field is populated");
});
