// client/src/hooks/useDashboardStats.js
import { useEffect, useRef, useState, useCallback } from "react";
import { getDashboardStatsApi } from "../api/dashboardApi.js";

const POLL_MS = 30000;

export function useDashboardStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await getDashboardStatsApi();
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, error, refresh: load };
}
