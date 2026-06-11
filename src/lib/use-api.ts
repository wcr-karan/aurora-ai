"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

/** Minimal data-fetching hook over the JSON API envelope. */
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    const r = await api.get<T>(url);
    if (r.ok) {
      setData(r.data ?? null);
      setError(null);
    } else {
      setError(r.error ?? "Failed to load");
    }
    setLoading(false);
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
