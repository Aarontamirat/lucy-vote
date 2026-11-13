"use client";
import { useCallback, useEffect, useState } from "react";
import { responseError } from "@/lib/response-error";

export function usePollingResource<T>(url: string, interval = 10000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      const deadline = setTimeout(abort, 15000);
      setLoading(true);
      try {
        const response = await fetch(url, {
          signal: request.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            responseError(
              result.error,
              "The connection could not be refreshed.",
            ),
          );
        if (!controller.signal.aborted) {
          setData(result);
          setUpdatedAt(new Date());
          setError("");
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            request.signal.aborted
              ? "The connection timed out."
              : error instanceof Error
                ? error.message
                : "The connection could not be refreshed.",
          );
      } finally {
        clearTimeout(deadline);
        controller.signal.removeEventListener("abort", abort);
        if (!controller.signal.aborted) {
          setLoading(false);
          timer = setTimeout(refresh, interval);
        }
      }
    };
    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [url, interval, revision]);
  return { data, loading, error, updatedAt, reload };
}
