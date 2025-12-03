/**
 * useSettings Hook
 * Custom hook untuk mengelola settings data
 */

import { useState, useEffect, useCallback } from "react";
import { Settings } from "../types";
import { settingsApi } from "../services/api";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.fetchSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch settings";
      setError(errorMessage);
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
