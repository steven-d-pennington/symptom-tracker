/**
 * Mood Repository (Story 3.5.2)
 *
 * Provides data access methods for mood entries.
 * Follows offline-first pattern with immediate IndexedDB persistence.
 * All methods include userId parameter for multi-user future-proofing.
 *
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 */

import { db } from "../db/client";
import { MoodEntryRecord } from "../db/schema";
import { MoodEntry } from "@/types/mood";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a new mood entry.
 * Generates UUID and timestamps automatically.
 *
 * @param entry - Partial mood entry data (mood required)
 * @returns Promise resolving to the new entry ID
 * @throws Error if database write fails or userId/mood missing
 */
export async function create(entry: Partial<MoodEntry>): Promise<string> {
  if (!entry.userId) {
    throw new Error("moodRepository.create: userId is required");
  }
  if (entry.mood === undefined || entry.mood === null) {
    throw new Error("moodRepository.create: mood is required");
  }

  const now = Date.now();
  const id = uuidv4();

  const moodEntry: MoodEntryRecord = {
    id,
    userId: entry.userId,
    mood: entry.mood,
    moodType: entry.moodType,
    notes: entry.notes?.trim() || undefined,
    timestamp: entry.timestamp ?? now,
    createdAt: now,
    updatedAt: now,
  };

  await db.moodEntries.add(moodEntry);

  return id;
}

/**
 * Retrieves all mood entries for a user.
 * Returns entries in reverse chronological order (most recent first).
 *
 * @param userId - User ID to query
 * @returns Promise resolving to array of MoodEntry records
 */
export async function getByUserId(userId: string): Promise<MoodEntry[]> {
  const entries = await db.moodEntries
    .where("userId")
    .equals(userId)
    .reverse()
    .sortBy("timestamp");

  return entries as MoodEntry[];
}

/**
 * Retrieves mood entries for a user within a date range.
 * Uses compound index [userId+timestamp] for efficient queries.
 *
 * @param userId - User ID to query
 * @param startDate - Start timestamp (epoch ms)
 * @param endDate - End timestamp (epoch ms)
 * @returns Promise resolving to array of MoodEntry records in date range
 */
export async function getByDateRange(
  userId: string,
  startDate: number,
  endDate: number
): Promise<MoodEntry[]> {
  const entries = await db.moodEntries
    .where("userId")
    .equals(userId)
    .and((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
    .sortBy("timestamp");

  return entries as MoodEntry[];
}

/**
 * Updates an existing mood entry.
 * Only updates provided fields, preserves others.
 *
 * @param id - UUID of mood entry to update
 * @param changes - Partial mood entry data to update
 * @returns Promise resolving when update complete
 * @throws Error if entry not found
 */
export async function update(
  id: string,
  changes: Partial<MoodEntry>
): Promise<void> {
  const existing = await db.moodEntries.get(id);
  if (!existing) {
    throw new Error(`moodRepository.update: Mood entry not found: ${id}`);
  }

  await db.moodEntries.update(id, {
    ...changes,
    updatedAt: Date.now(),
  });
}

/**
 * Deletes a mood entry by ID.
 *
 * @param id - UUID of mood entry to delete
 * @returns Promise resolving when delete complete
 */
export async function deleteEntry(id: string): Promise<void> {
  await db.moodEntries.delete(id);
}

/**
 * Retrieves a single mood entry by ID.
 *
 * @param id - UUID of mood entry to retrieve
 * @returns Promise resolving to MoodEntry or undefined if not found
 */
export async function getById(id: string): Promise<MoodEntry | undefined> {
  const entry = await db.moodEntries.get(id);
  return entry as MoodEntry | undefined;
}

/**
 * Mood repository object with all CRUD methods.
 * Provides a consistent API for mood data access.
 */
export const moodRepository = {
  create,
  getByUserId,
  getByDateRange,
  update,
  delete: deleteEntry,
  getById,
};
