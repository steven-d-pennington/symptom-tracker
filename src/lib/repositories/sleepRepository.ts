/**
 * Sleep Repository (Story 3.5.2)
 *
 * Provides data access methods for sleep entries.
 * Follows offline-first pattern with immediate IndexedDB persistence.
 * All methods include userId parameter for multi-user future-proofing.
 *
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 */

import { db } from "../db/client";
import { SleepEntryRecord } from "../db/schema";
import { SleepEntry, WeeklySleepAverage } from "@/types/sleep";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new sleep entry.
 * Generates UUID and timestamps automatically.
 *
 * @param entry - Partial sleep entry data (hours and quality required)
 * @returns Promise resolving to the new entry ID
 * @throws Error if database write fails or required fields missing
 */
export async function create(entry: Partial<SleepEntry>): Promise<string> {
  if (!entry.userId) {
    throw new Error("sleepRepository.create: userId is required");
  }
  if (entry.hours === undefined || entry.hours === null) {
    throw new Error("sleepRepository.create: hours is required");
  }
  if (entry.quality === undefined || entry.quality === null) {
    throw new Error("sleepRepository.create: quality is required");
  }

  const now = Date.now();
  const id = uuidv4();

  const sleepEntry: SleepEntryRecord = {
    id,
    userId: entry.userId,
    hours: entry.hours,
    quality: entry.quality,
    notes: entry.notes?.trim() || undefined,
    timestamp: entry.timestamp ?? now,
    createdAt: now,
    updatedAt: now,
  };

  await db.sleepEntries.add(sleepEntry);

  return id;
}

/**
 * Retrieves all sleep entries for a user.
 * Returns entries in reverse chronological order (most recent first).
 *
 * @param userId - User ID to query
 * @returns Promise resolving to array of SleepEntry records
 */
export async function getByUserId(userId: string): Promise<SleepEntry[]> {
  const entries = await db.sleepEntries
    .where("userId")
    .equals(userId)
    .reverse()
    .sortBy("timestamp");

  return entries as SleepEntry[];
}

/**
 * Retrieves sleep entries for a user within a date range.
 * Uses compound index [userId+timestamp] for efficient queries.
 *
 * @param userId - User ID to query
 * @param startDate - Start timestamp (epoch ms)
 * @param endDate - End timestamp (epoch ms)
 * @returns Promise resolving to array of SleepEntry records in date range
 */
export async function getByDateRange(
  userId: string,
  startDate: number,
  endDate: number
): Promise<SleepEntry[]> {
  const entries = await db.sleepEntries
    .where("userId")
    .equals(userId)
    .and((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
    .sortBy("timestamp");

  return entries as SleepEntry[];
}

/**
 * Calculates weekly average sleep hours and quality for a given week.
 * Week starts at weekStartDate and spans 7 days.
 *
 * @param userId - User ID to query
 * @param weekStartDate - Start timestamp of the week (epoch ms)
 * @returns Promise resolving to WeeklySleepAverage with avgHours and avgQuality
 */
export async function getWeeklyAverage(
  userId: string,
  weekStartDate: number
): Promise<WeeklySleepAverage> {
  const weekEndDate = weekStartDate + 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  const entries = await getByDateRange(userId, weekStartDate, weekEndDate);

  if (entries.length === 0) {
    return { avgHours: 0, avgQuality: 0 };
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);

  return {
    avgHours: parseFloat((totalHours / entries.length).toFixed(1)),
    avgQuality: parseFloat((totalQuality / entries.length).toFixed(1)),
  };
}

/**
 * Updates an existing sleep entry.
 * Only updates provided fields, preserves others.
 *
 * @param id - UUID of sleep entry to update
 * @param changes - Partial sleep entry data to update
 * @returns Promise resolving when update complete
 * @throws Error if entry not found
 */
export async function update(
  id: string,
  changes: Partial<SleepEntry>
): Promise<void> {
  const existing = await db.sleepEntries.get(id);
  if (!existing) {
    throw new Error(`sleepRepository.update: Sleep entry not found: ${id}`);
  }

  await db.sleepEntries.update(id, {
    ...changes,
    updatedAt: Date.now(),
  });
}

/**
 * Deletes a sleep entry by ID.
 *
 * @param id - UUID of sleep entry to delete
 * @returns Promise resolving when delete complete
 */
export async function deleteEntry(id: string): Promise<void> {
  await db.sleepEntries.delete(id);
}

/**
 * Retrieves a single sleep entry by ID.
 *
 * @param id - UUID of sleep entry to retrieve
 * @returns Promise resolving to SleepEntry or undefined if not found
 */
export async function getById(id: string): Promise<SleepEntry | undefined> {
  const entry = await db.sleepEntries.get(id);
  return entry as SleepEntry | undefined;
}

/**
 * Sleep repository object with all CRUD methods.
 * Provides a consistent API for sleep data access.
 */
export const sleepRepository = {
  create,
  getByUserId,
  getByDateRange,
  getWeeklyAverage,
  update,
  delete: deleteEntry,
  getById,
};
