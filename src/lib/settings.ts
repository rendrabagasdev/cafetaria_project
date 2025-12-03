/**
 * Settings Management Library
 *
 * Provides cached access to Settings table (single source of truth for fees)
 * Cache duration: 5 minutes to reduce database load
 */

import { PrismaClient, Settings } from "@prisma/client";

const prisma = new PrismaClient();

// In-memory cache
let settingsCache: Settings | null = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get Settings with caching
 * Returns cached settings if available and not expired
 * Otherwise fetches from database and updates cache
 */
export async function getSettings(): Promise<Settings> {
  const now = Date.now();

  // Return cached settings if valid
  if (settingsCache && now - lastFetch < CACHE_DURATION) {
    return settingsCache;
  }

  // Fetch from database
  const settings = await prisma.settings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    throw new Error("Settings not initialized. Please run: npx prisma db seed");
  }

  // Update cache
  settingsCache = settings;
  lastFetch = now;

  return settings;
}

/**
 * Force refresh settings cache
 * Call this after updating Settings via PATCH /api/settings
 */
export function invalidateSettingsCache(): void {
  settingsCache = null;
  lastFetch = 0;
}

/**
 * Get settings without caching (for admin panel display)
 */
export async function getSettingsDirect(): Promise<Settings | null> {
  return await prisma.settings.findUnique({
    where: { id: 1 },
  });
}
