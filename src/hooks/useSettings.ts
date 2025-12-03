/**
 * Settings Hook
 * Fetches and caches application settings
 */

"use client";

import { useState, useEffect } from "react";

interface Settings {
  kasirWhatsapp: string;
  namaPengurus: string;
  cafeteriaName?: string;
  cafeteriaTagline?: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data.settings || data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    refreshSettings: fetchSettings,
  };
}
