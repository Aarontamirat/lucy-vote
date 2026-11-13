export function responseError(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const messages = value.flatMap((issue) =>
      issue && typeof issue.message === "string" ? [issue.message] : [],
    );
    if (messages.length) return messages.join("; ");
  }
  return fallback;
}
