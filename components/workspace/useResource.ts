"use client";
import { useCallback, useEffect, useState } from "react";
import { responseError } from "@/lib/response-error";

export function useResource<T>(url: string | null, delay = 0) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      const deadline = setTimeout(abort, 15000);
      try {
        const response = await fetch(url, {
          signal: request.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            responseError(result.error, "The records could not be loaded."),
          );
        if (!controller.signal.aborted) setData(result);
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            request.signal.aborted
              ? "The request timed out. Try again."
              : error instanceof Error
                ? error.message
                : "The records could not be loaded.",
          );
      } finally {
        clearTimeout(deadline);
        controller.signal.removeEventListener("abort", abort);
        if (!controller.signal.aborted) setLoading(false);
      }
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [url, delay, revision]);
  return { data, loading, error, reload };
}
