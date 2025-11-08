/**
 * Daily Logs Repository (Story 6.2)
 *
 * Provides data access methods for daily log entries.
 * Implements unified end-of-day reflection for mood, sleep, and general notes.
 * Follows offline-first pattern with immediate IndexedDB persistence.
 * Enforces one entry per user per day via compound index [userId+date].
 *
 * @see docs/ux-design-specification.md#Daily-Log-Architecture
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 */

import { db } from "../db/client";
import { DailyLogRecord } from "../db/schema";
import { DailyLog } from "@/types/daily-log";
import { v4 as uuidv4 } from "uuid";
import { subDays, format } from "date-fns";

/**
 * Creates a new daily log entry.
 * Generates UUID and timestamps automatically.
 *
 * @param entry - Partial daily log data (userId, date, mood, sleepHours, sleepQuality required)
 * @returns Promise resolving to the new entry ID
 * @throws Error if database write fails or required fields missing
 */
export async function create(entry: Partial<DailyLog>): Promise<string> {
  if (!entry.userId) {
    throw new Error("dailyLogsRepository.create: userId is required");
  }
  if (!entry.date) {
    throw new Error("dailyLogsRepository.create: date is required");
  }
  if (entry.mood === undefined || entry.mood === null) {
    throw new Error("dailyLogsRepository.create: mood is required");
  }
  if (entry.sleepHours === undefined || entry.sleepHours === null) {
    throw new Error("dailyLogsRepository.create: sleepHours is required");
  }
  if (entry.sleepQuality === undefined || entry.sleepQuality === null) {
    throw new Error("dailyLogsRepository.create: sleepQuality is required");
  }

  // Check for existing entry on the same date for this user
  const existing = await getByDate(entry.userId, entry.date);
  if (existing) {
    throw new Error(
      `dailyLogsRepository.create: Daily log already exists for ${entry.userId} on ${entry.date}. Use upsert() to update.`
    );
  }

  const now = Date.now();
  const id = uuidv4();

  const dailyLogEntry: DailyLogRecord = {
    id,
    userId: entry.userId,
    date: entry.date,
    mood: entry.mood,
    sleepHours: entry.sleepHours,
    sleepQuality: entry.sleepQuality,
    notes: entry.notes?.trim() || undefined,
    // Stringify flareUpdates array per IndexedDB conventions
    flareUpdates: entry.flareUpdates
      ? JSON.stringify(entry.flareUpdates)
      : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.dailyLogs.add(dailyLogEntry);

  return id;
}

/**
 * Retrieves a daily log entry for a specific date.
 * Uses compound index [userId+date] for efficient lookup.
 *
 * @param userId - User ID to query
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Promise resolving to DailyLog or undefined if not found
 */
export async function getByDate(
  userId: string,
  date: string
): Promise<DailyLog | undefined> {
  const entry = await db.dailyLogs
    .where("[userId+date]")
    .equals([userId, date])
    .first();

  if (!entry) {
    return undefined;
  }

  // Parse flareUpdates JSON string back to array
  return {
    ...entry,
    flareUpdates: entry.flareUpdates
      ? JSON.parse(entry.flareUpdates)
      : undefined,
  } as DailyLog;
}

/**
 * Retrieves daily log entries for a user within a date range.
 * Returns entries in chronological order.
 *
 * @param userId - User ID to query
 * @param startDate - Start date (ISO string YYYY-MM-DD)
 * @param endDate - End date (ISO string YYYY-MM-DD)
 * @returns Promise resolving to array of DailyLog records in date range
 */
export async function listByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyLog[]> {
  const entries = await db.dailyLogs
    .where("userId")
    .equals(userId)
    .and((entry) => entry.date >= startDate && entry.date <= endDate)
    .sortBy("date");

  // Parse flareUpdates for each entry
  return entries.map((entry) => ({
    ...entry,
    flareUpdates: entry.flareUpdates
      ? JSON.parse(entry.flareUpdates)
      : undefined,
  })) as DailyLog[];
}

/**
 * Updates an existing daily log entry.
 * Only updates provided fields, preserves others.
 *
 * @param id - UUID of daily log entry to update
 * @param changes - Partial daily log data to update
 * @returns Promise resolving when update complete
 * @throws Error if entry not found
 */
export async function update(
  id: string,
  changes: Partial<DailyLog>
): Promise<void> {
  const existing = await db.dailyLogs.get(id);
  if (!existing) {
    throw new Error(`dailyLogsRepository.update: Daily log not found: ${id}`);
  }

  // Stringify flareUpdates if provided
  const updateData: Partial<DailyLogRecord> = {
    ...changes,
    flareUpdates: changes.flareUpdates
      ? JSON.stringify(changes.flareUpdates)
      : undefined,
    updatedAt: Date.now(),
  };

  await db.dailyLogs.update(id, updateData);
}

/**
 * Creates or updates a daily log entry for a given date.
 * If entry exists for the date, updates it. Otherwise creates new entry.
 * This is the preferred method for saving daily logs.
 *
 * @param entry - Partial daily log data (userId, date, mood, sleepHours, sleepQuality required)
 * @returns Promise resolving to the entry ID (existing or new)
 */
export async function upsert(entry: Partial<DailyLog>): Promise<string> {
  if (!entry.userId || !entry.date) {
    throw new Error(
      "dailyLogsRepository.upsert: userId and date are required"
    );
  }

  const existing = await getByDate(entry.userId, entry.date);

  if (existing) {
    // Update existing entry
    await update(existing.id, entry);
    return existing.id;
  } else {
    // Create new entry
    return await create(entry);
  }
}

/**
 * Retrieves the daily log entry from the previous day.
 * Used for smart defaults (pre-filling mood, sleep from previous day).
 *
 * @param userId - User ID to query
 * @param currentDate - Current date (ISO string YYYY-MM-DD)
 * @returns Promise resolving to previous day's DailyLog or undefined if not found
 */
export async function getPreviousDayLog(
  userId: string,
  currentDate: string
): Promise<DailyLog | undefined> {
  // Calculate previous day's date
  const currentDateObj = new Date(currentDate);
  const previousDateObj = subDays(currentDateObj, 1);
  const previousDate = format(previousDateObj, "yyyy-MM-dd");

  return await getByDate(userId, previousDate);
}

/**
 * Deletes a daily log entry by ID.
 *
 * @param id - UUID of daily log entry to delete
 * @returns Promise resolving when delete complete
 */
export async function deleteEntry(id: string): Promise<void> {
  await db.dailyLogs.delete(id);
}

/**
 * Retrieves a single daily log entry by ID.
 *
 * @param id - UUID of daily log entry to retrieve
 * @returns Promise resolving to DailyLog or undefined if not found
 */
export async function getById(id: string): Promise<DailyLog | undefined> {
  const entry = await db.dailyLogs.get(id);

  if (!entry) {
    return undefined;
  }

  // Parse flareUpdates JSON string back to array
  return {
    ...entry,
    flareUpdates: entry.flareUpdates
      ? JSON.parse(entry.flareUpdates)
      : undefined,
  } as DailyLog;
}

/**
 * Daily logs repository object with all CRUD methods.
 * Provides a consistent API for daily log data access.
 */
export const dailyLogsRepository = {
  create,
  getByDate,
  listByDateRange,
  update,
  upsert,
  getPreviousDayLog,
  delete: deleteEntry,
  getById,
};
