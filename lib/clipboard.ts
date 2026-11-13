/** Copy text on HTTPS/localhost and on browsers without the Clipboard API. */
export async function copyText(
  text: string,
  container?: HTMLElement | null,
): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard?.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Browsers may deny clipboard permission even in a secure context.
  }

  if (
    typeof document === "undefined" ||
    typeof document.execCommand !== "function"
  ) {
    return false;
  }

  // A dismissed dialog must not resume copying on the page after permission fails.
  if (container && !container.isConnected) return false;
  const parent = container ?? document.body;
  if (!parent) return false;

  const activeElement = document.activeElement as HTMLElement | null;
  const selection = document.getSelection();
  const ranges: Range[] = [];
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index++) {
      ranges.push(selection.getRangeAt(index).cloneRange());
    }
  }
  const activeInput =
    activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA"
      ? (activeElement as HTMLInputElement | HTMLTextAreaElement)
      : null;
  const inputSelection = activeInput
    ? {
        start: activeInput.selectionStart,
        end: activeInput.selectionEnd,
        direction: activeInput.selectionDirection,
      }
    : null;

  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.setAttribute("aria-hidden", "true");
  // Keep the field inside an open dialog so its focus trap permits selection.
  Object.assign(field.style, {
    position: "fixed",
    top: "0",
    left: "0",
    opacity: "0",
    pointerEvents: "none",
    fontSize: "16px",
  });

  try {
    parent.appendChild(field);
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, text.length);
    return document.execCommand("copy") === true;
  } catch {
    return false;
  } finally {
    field.value = "";
    field.remove();
    try {
      activeElement?.focus({ preventScroll: true });
      if (selection) {
        selection.removeAllRanges();
        for (const range of ranges) selection.addRange(range);
      }
      if (
        activeInput &&
        inputSelection?.start !== null &&
        inputSelection?.start !== undefined &&
        inputSelection.end !== null
      ) {
        activeInput.setSelectionRange(
          inputSelection.start,
          inputSelection.end,
          inputSelection.direction ?? undefined,
        );
      }
    } catch {
      // A closed dialog or detached selection can disappear during a copy.
    }
  }
}
