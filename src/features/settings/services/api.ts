/**
 * Settings API Service
 */

import { Settings, UpdateSettingsPayload } from "../types";

export const settingsApi = {
  /**
   * Fetch current settings
   */
  async fetchSettings(): Promise<Settings> {
    const res = await fetch("/api/settings");
    if (!res.ok) {
      throw new Error("Failed to fetch settings");
    }
    return res.json();
  },

  /**
   * Update settings
   */
  async updateSettings(payload: UpdateSettingsPayload): Promise<Settings> {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update settings");
    }

    return data;
  },

  /**
   * Upload logo file
   */
  async uploadLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to upload logo");
    }

    return data;
  },
};
