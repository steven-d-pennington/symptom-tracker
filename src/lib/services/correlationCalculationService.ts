/**
 * Correlation Calculation Service
 *
 * Background service that recalculates correlations when new data is logged.
 * Uses debouncing to avoid excessive computation.
 */

import { correlationEngine } from "./correlationEngine";
import { correlationRepository } from "../repositories/correlationRepository";
import type { TimeRange } from "../../types/correlation";

// Debounce timeout (5 minutes in milliseconds)
const DEBOUNCE_DELAY = 5 * 60 * 1000;

// Cache TTL (1 hour in milliseconds)
const CACHE_TTL = 60 * 60 * 1000;

// Storage keys
const STORAGE_KEYS = {
  LAST_CALCULATED: "correlation_last_calculated",
  IS_CALCULATING: "correlation_is_calculating",
  CACHE_TIMESTAMP: "correlation_cache_timestamp",
};

// Debounce timers (per user)
const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Schedule correlation recalculation for a user
 * Debounces multiple calls to avoid excessive recalculation
 *
 * @param userId - User ID
 */
export function scheduleRecalculation(userId: string): void {
  // Clear existing timer for this user
  const existingTimer = debounceTimers.get(userId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timer
  const timer = setTimeout(() => {
    recalculateCorrelations(userId).catch((error) => {
      console.error(`Correlation recalculation failed for user ${userId}:`, error);
    });
    debounceTimers.delete(userId);
  }, DEBOUNCE_DELAY);

  debounceTimers.set(userId, timer);

  console.log(`Correlation recalculation scheduled for user ${userId} in ${DEBOUNCE_DELAY / 1000}s`);
}

/**
 * Recalculate correlations for a user
 * Runs in background, updates IndexedDB with results
 *
 * @param userId - User ID
 */
export async function recalculateCorrelations(userId: string): Promise<void> {
  console.log(`Starting correlation recalculation for user ${userId}`);

  // Check if already calculating
  const isCalculating = localStorage.getItem(
    `${STORAGE_KEYS.IS_CALCULATING}_${userId}`
  );
  if (isCalculating === "true") {
    console.log("Correlation calculation already in progress, skipping");
    return;
  }

  // Check cache validity
  const cacheTimestamp = localStorage.getItem(
    `${STORAGE_KEYS.CACHE_TIMESTAMP}_${userId}`
  );
  if (cacheTimestamp) {
    const age = Date.now() - parseInt(cacheTimestamp, 10);
    if (age < CACHE_TTL) {
      console.log(`Correlation cache is still valid (${Math.floor(age / 1000)}s old), skipping recalculation`);
      return;
    }
  }

  // Set calculating flag
  localStorage.setItem(`${STORAGE_KEYS.IS_CALCULATING}_${userId}`, "true");

  try {
    // Delete old correlations (older than 7 days)
    const cutoffDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const deleted = await correlationRepository.deleteOlderThan(
      userId,
      cutoffDate
    );
    if (deleted > 0) {
      console.log(`Deleted ${deleted} old correlation records`);
    }

    // Calculate correlations for all time ranges
    const timeRanges: TimeRange[] = ["7d", "30d", "90d"];
    let totalCalculated = 0;

    for (const timeRange of timeRanges) {
      console.log(`Calculating correlations for ${timeRange} time range...`);

      const results = await correlationEngine.findSignificantCorrelations(
        userId,
        timeRange,
        0.3 // Minimum threshold
      );

      console.log(`Found ${results.length} significant correlations for ${timeRange}`);

      // Save results to repository (upsert to avoid duplicates)
      for (const result of results) {
        await correlationRepository.upsert({
          userId: result.userId,
          type: result.type,
          item1: result.item1,
          item2: result.item2,
          coefficient: result.coefficient,
          strength: result.strength,
          significance: result.significance,
          sampleSize: result.sampleSize,
          lagHours: result.lagHours,
          confidence: result.confidence,
          timeRange: result.timeRange,
          calculatedAt: result.calculatedAt,
        });
      }

      totalCalculated += results.length;
    }

    // Update timestamps
    const now = Date.now();
    localStorage.setItem(
      `${STORAGE_KEYS.LAST_CALCULATED}_${userId}`,
      now.toString()
    );
    localStorage.setItem(
      `${STORAGE_KEYS.CACHE_TIMESTAMP}_${userId}`,
      now.toString()
    );

    console.log(`Correlation recalculation complete: ${totalCalculated} correlations calculated`);
  } catch (error) {
    console.error("Error during correlation recalculation:", error);
    throw error;
  } finally {
    // Clear calculating flag
    localStorage.setItem(`${STORAGE_KEYS.IS_CALCULATING}_${userId}`, "false");
  }
}

/**
 * Trigger correlation recalculation on data change events
 * Call this when user logs new data
 *
 * @param userId - User ID
 * @param eventType - Type of event that triggered recalculation
 */
export function onDataLogged(userId: string, eventType: string): void {
  console.log(`Data logged (${eventType}), scheduling correlation recalculation for user ${userId}`);
  scheduleRecalculation(userId);
}

/**
 * Get last calculation timestamp for a user
 *
 * @param userId - User ID
 * @returns Timestamp (epoch ms) or null if never calculated
 */
export function getLastCalculated(userId: string): number | null {
  const timestamp = localStorage.getItem(
    `${STORAGE_KEYS.LAST_CALCULATED}_${userId}`
  );
  return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Check if correlations are currently being calculated for a user
 *
 * @param userId - User ID
 * @returns True if calculation in progress
 */
export function isCalculating(userId: string): boolean {
  const flag = localStorage.getItem(`${STORAGE_KEYS.IS_CALCULATING}_${userId}`);
  return flag === "true";
}

/**
 * Force immediate recalculation (bypasses debounce and cache)
 *
 * @param userId - User ID
 */
export async function forceRecalculation(userId: string): Promise<void> {
  // Clear cache
  localStorage.removeItem(`${STORAGE_KEYS.CACHE_TIMESTAMP}_${userId}`);

  // Clear any pending debounced calculation
  const existingTimer = debounceTimers.get(userId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    debounceTimers.delete(userId);
  }

  // Run calculation immediately
  await recalculateCorrelations(userId);
}

/**
 * Clear all correlation data and cache for a user
 *
 * @param userId - User ID
 */
export async function clearUserData(userId: string): Promise<void> {
  // Delete all correlation records
  await correlationRepository.deleteAll(userId);

  // Clear localStorage
  localStorage.removeItem(`${STORAGE_KEYS.LAST_CALCULATED}_${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.IS_CALCULATING}_${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.CACHE_TIMESTAMP}_${userId}`);

  // Clear debounce timer
  const existingTimer = debounceTimers.get(userId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    debounceTimers.delete(userId);
  }

  console.log(`Cleared all correlation data for user ${userId}`);
}

/**
 * Initialize correlation calculation service
 * Call this on app startup
 */
export function initializeCorrelationService(): void {
  console.log("Correlation calculation service initialized");

  // Clear any stale "is calculating" flags on startup
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(STORAGE_KEYS.IS_CALCULATING)) {
      localStorage.setItem(key, "false");
    }
  }
}
