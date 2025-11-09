/**
 * Correlation Data Extractor Service
 *
 * Extracts and aligns time-series data from repositories for correlation analysis.
 * Handles food consumption, symptom severity, medication adherence, and trigger exposure.
 */

import { db } from "../db/client";
import type { TimeSeriesData } from "../../types/correlation";

/**
 * Extract food consumption time series
 * Returns frequency of specific food per day within date range
 *
 * @param userId - User ID
 * @param foodId - Food ID to track
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Map of date string → consumption frequency
 */
export async function extractFoodTimeSeries(
  userId: string,
  foodId: string,
  startDate: number,
  endDate: number
): Promise<Map<string, number>> {
  // Query foodEvents in date range using [userId+timestamp] compound index
  const events = await db.foodEvents
    .where("userId")
    .equals(userId)
    .filter(
      (event) => event.timestamp >= startDate && event.timestamp <= endDate
    )
    .toArray();

  // Aggregate by date (YYYY-MM-DD)
  const dailyFrequency = new Map<string, number>();

  for (const event of events) {
    const foodIds = JSON.parse(event.foodIds) as string[];

    // Check if this event contains the food we're tracking
    if (foodIds.includes(foodId)) {
      const dateKey = getDateKey(event.timestamp);
      const currentCount = dailyFrequency.get(dateKey) || 0;
      dailyFrequency.set(dateKey, currentCount + 1);
    }
  }

  return dailyFrequency;
}

/**
 * Extract symptom severity time series
 * Returns average severity per symptom per day within date range
 *
 * @param userId - User ID
 * @param symptomName - Symptom name to track
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Map of date string → average severity
 */
export async function extractSymptomTimeSeries(
  userId: string,
  symptomName: string,
  startDate: number,
  endDate: number
): Promise<Map<string, number>> {
  // Query symptomInstances in date range
  // Note: symptomInstances use Date objects for timestamp
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const instances = await db.symptomInstances
    .where("userId")
    .equals(userId)
    .toArray();

  // Filter by date range and symptom name manually
  const filtered = instances.filter((instance) => {
    const instanceTimestamp = instance.timestamp.getTime();
    return (
      instanceTimestamp >= startDate &&
      instanceTimestamp <= endDate &&
      instance.name === symptomName
    );
  });

  // Aggregate by date (calculate average severity per day)
  const dailyData = new Map<string, { sum: number; count: number }>();

  for (const instance of filtered) {
    const dateKey = getDateKey(instance.timestamp.getTime());
    const current = dailyData.get(dateKey) || { sum: 0, count: 0 };
    dailyData.set(dateKey, {
      sum: current.sum + instance.severity,
      count: current.count + 1,
    });
  }

  // Convert to average severity map
  const dailyAverage = new Map<string, number>();
  for (const [dateKey, data] of dailyData.entries()) {
    dailyAverage.set(dateKey, data.sum / data.count);
  }

  return dailyAverage;
}

/**
 * Extract medication adherence time series
 * Returns adherence rate (0-1) per medication per day within date range
 *
 * @param userId - User ID
 * @param medicationId - Medication ID to track
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Map of date string → adherence rate (0=not taken, 1=taken)
 */
export async function extractMedicationTimeSeries(
  userId: string,
  medicationId: string,
  startDate: number,
  endDate: number
): Promise<Map<string, number>> {
  // Query medicationEvents in date range
  const events = await db.medicationEvents
    .where("userId")
    .equals(userId)
    .filter(
      (event) =>
        event.timestamp >= startDate &&
        event.timestamp <= endDate &&
        event.medicationId === medicationId
    )
    .toArray();

  // Aggregate by date (calculate adherence rate)
  const dailyData = new Map<string, { taken: number; total: number }>();

  for (const event of events) {
    const dateKey = getDateKey(event.timestamp);
    const current = dailyData.get(dateKey) || { taken: 0, total: 0 };
    dailyData.set(dateKey, {
      taken: current.taken + (event.taken ? 1 : 0),
      total: current.total + 1,
    });
  }

  // Convert to adherence rate (0-1)
  const dailyAdherence = new Map<string, number>();
  for (const [dateKey, data] of dailyData.entries()) {
    dailyAdherence.set(dateKey, data.taken / data.total);
  }

  return dailyAdherence;
}

/**
 * Extract trigger exposure time series
 * Returns exposure frequency per trigger per day within date range
 *
 * @param userId - User ID
 * @param triggerId - Trigger ID to track
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Map of date string → exposure frequency
 */
export async function extractTriggerTimeSeries(
  userId: string,
  triggerId: string,
  startDate: number,
  endDate: number
): Promise<Map<string, number>> {
  // Query triggerEvents in date range
  const events = await db.triggerEvents
    .where("userId")
    .equals(userId)
    .filter(
      (event) =>
        event.timestamp >= startDate &&
        event.timestamp <= endDate &&
        event.triggerId === triggerId
    )
    .toArray();

  // Aggregate by date (count exposures)
  const dailyFrequency = new Map<string, number>();

  for (const event of events) {
    const dateKey = getDateKey(event.timestamp);
    const currentCount = dailyFrequency.get(dateKey) || 0;
    dailyFrequency.set(dateKey, currentCount + 1);
  }

  return dailyFrequency;
}

/**
 * Extract flare severity time series
 * Returns average flare severity per day within date range
 *
 * @param userId - User ID
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Map of date string → average severity
 */
export async function extractFlareTimeSeries(
  userId: string,
  startDate: number,
  endDate: number
): Promise<Map<string, number>> {
  // Query flares in date range
  const flares = await db.flares
    .where("userId")
    .equals(userId)
    .toArray();

  // Filter by date range and severity updates
  const dailyData = new Map<string, { sum: number; count: number }>();

  for (const flare of flares) {
    // Check flare creation date
    if (flare.createdAt >= startDate && flare.createdAt <= endDate) {
      const dateKey = getDateKey(flare.createdAt);
      const current = dailyData.get(dateKey) || { sum: 0, count: 0 };
      dailyData.set(dateKey, {
        sum: current.sum + flare.initialSeverity,
        count: current.count + 1,
      });
    }

    // Check updates (if flare was updated during period)
    if (flare.updatedAt >= startDate && flare.updatedAt <= endDate) {
      const dateKey = getDateKey(flare.updatedAt);
      const current = dailyData.get(dateKey) || { sum: 0, count: 0 };
      dailyData.set(dateKey, {
        sum: current.sum + flare.currentSeverity,
        count: current.count + 1,
      });
    }
  }

  // Convert to average severity map
  const dailyAverage = new Map<string, number>();
  for (const [dateKey, data] of dailyData.entries()) {
    dailyAverage.set(dateKey, data.sum / data.count);
  }

  return dailyAverage;
}

/**
 * Align two time series by date with lag offset
 *
 * Shifts series2 backward by lagHours before alignment
 * Returns parallel arrays of aligned values
 *
 * @param series1 - First time series (e.g., food consumption)
 * @param series2 - Second time series (e.g., symptom severity)
 * @param lagHours - Time lag in hours (0, 6, 12, 24, 48)
 * @returns Tuple of [aligned values from series1, aligned values from series2]
 *
 * @example
 * // Test 6-hour lag: food at noon → symptom at 6pm
 * series1 = { "2024-01-01": 1 } // Food consumption
 * series2 = { "2024-01-01": 7 } // Symptom severity
 * lagHours = 6
 * // Result: Match food at noon (day 1) with symptom at 6pm (same day)
 */
export function alignTimeSeries(
  series1: Map<string, number>,
  series2: Map<string, number>,
  lagHours: number
): [number[], number[]] {
  const aligned1: number[] = [];
  const aligned2: number[] = [];

  const lagMs = lagHours * 60 * 60 * 1000;

  // Convert series1 to array of {date, value}
  const series1Array = Array.from(series1.entries()).map(([dateKey, value]) => ({
    timestamp: parseDateKey(dateKey),
    value,
  }));

  // Convert series2 to array of {date, value}
  const series2Array = Array.from(series2.entries()).map(([dateKey, value]) => ({
    timestamp: parseDateKey(dateKey),
    value,
  }));

  // For each point in series1, find corresponding point in series2 (shifted by lag)
  for (const point1 of series1Array) {
    // Find point in series2 that occurs lagHours after point1
    const targetTimestamp = point1.timestamp + lagMs;
    const targetDateKey = getDateKey(targetTimestamp);

    // Check if series2 has data for this date
    const point2Value = series2.get(targetDateKey);

    if (point2Value !== undefined) {
      aligned1.push(point1.value);
      aligned2.push(point2Value);
    }
  }

  return [aligned1, aligned2];
}

/**
 * Extract all time series data for correlation analysis
 *
 * @param userId - User ID
 * @param startDate - Start of date range (epoch ms)
 * @param endDate - End of date range (epoch ms)
 * @returns Object containing all time series data
 */
export async function extractAllTimeSeries(
  userId: string,
  startDate: number,
  endDate: number
) {
  // Get all unique food IDs, symptom names, medication IDs, trigger IDs
  const foodIds = await getAllTrackedFoods(userId);
  const symptomNames = await getAllTrackedSymptoms(userId);
  const medicationIds = await getAllTrackedMedications(userId);
  const triggerIds = await getAllTrackedTriggers(userId);

  // Extract time series for each
  const foodTimeSeries = new Map<string, Map<string, number>>();
  for (const foodId of foodIds) {
    const series = await extractFoodTimeSeries(
      userId,
      foodId,
      startDate,
      endDate
    );
    foodTimeSeries.set(foodId, series);
  }

  const symptomTimeSeries = new Map<string, Map<string, number>>();
  for (const symptomName of symptomNames) {
    const series = await extractSymptomTimeSeries(
      userId,
      symptomName,
      startDate,
      endDate
    );
    symptomTimeSeries.set(symptomName, series);
  }

  const medicationTimeSeries = new Map<string, Map<string, number>>();
  for (const medicationId of medicationIds) {
    const series = await extractMedicationTimeSeries(
      userId,
      medicationId,
      startDate,
      endDate
    );
    medicationTimeSeries.set(medicationId, series);
  }

  const triggerTimeSeries = new Map<string, Map<string, number>>();
  for (const triggerId of triggerIds) {
    const series = await extractTriggerTimeSeries(
      userId,
      triggerId,
      startDate,
      endDate
    );
    triggerTimeSeries.set(triggerId, series);
  }

  const flareTimeSeries = await extractFlareTimeSeries(
    userId,
    startDate,
    endDate
  );

  return {
    foodTimeSeries,
    symptomTimeSeries,
    medicationTimeSeries,
    triggerTimeSeries,
    flareTimeSeries,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert epoch timestamp to date key (YYYY-MM-DD)
 *
 * @param timestamp - Epoch milliseconds
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/**
 * Parse date key back to epoch timestamp (start of day)
 *
 * @param dateKey - Date string in YYYY-MM-DD format
 * @returns Epoch milliseconds (midnight UTC)
 */
export function parseDateKey(dateKey: string): number {
  return new Date(dateKey + "T00:00:00.000Z").getTime();
}

/**
 * Get all unique food IDs tracked by user
 *
 * @param userId - User ID
 * @returns Array of food IDs
 */
async function getAllTrackedFoods(userId: string): Promise<string[]> {
  const events = await db.foodEvents.where("userId").equals(userId).toArray();

  const foodIdSet = new Set<string>();
  for (const event of events) {
    const foodIds = JSON.parse(event.foodIds) as string[];
    foodIds.forEach((id) => foodIdSet.add(id));
  }

  return Array.from(foodIdSet);
}

/**
 * Get all unique symptom names tracked by user
 *
 * @param userId - User ID
 * @returns Array of symptom names
 */
async function getAllTrackedSymptoms(userId: string): Promise<string[]> {
  const instances = await db.symptomInstances
    .where("userId")
    .equals(userId)
    .toArray();

  const symptomNameSet = new Set<string>();
  for (const instance of instances) {
    symptomNameSet.add(instance.name);
  }

  return Array.from(symptomNameSet);
}

/**
 * Get all unique medication IDs tracked by user
 *
 * @param userId - User ID
 * @returns Array of medication IDs
 */
async function getAllTrackedMedications(userId: string): Promise<string[]> {
  const events = await db.medicationEvents
    .where("userId")
    .equals(userId)
    .toArray();

  const medicationIdSet = new Set<string>();
  for (const event of events) {
    medicationIdSet.add(event.medicationId);
  }

  return Array.from(medicationIdSet);
}

/**
 * Get all unique trigger IDs tracked by user
 *
 * @param userId - User ID
 * @returns Array of trigger IDs
 */
async function getAllTrackedTriggers(userId: string): Promise<string[]> {
  const events = await db.triggerEvents
    .where("userId")
    .equals(userId)
    .toArray();

  const triggerIdSet = new Set<string>();
  for (const event of events) {
    triggerIdSet.add(event.triggerId);
  }

  return Array.from(triggerIdSet);
}
