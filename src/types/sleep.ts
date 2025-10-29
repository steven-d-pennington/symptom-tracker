import { z } from "zod";

/**
 * Sleep entry record stored in IndexedDB.
 * Tracks user's sleep patterns and quality.
 * Enables correlation analysis between sleep and symptom/flare patterns.
 */
export interface SleepEntry {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support (future-proofing) */
  userId: string;

  /** Hours slept (supports fractional hours like 7.5, 8.25) */
  hours: number;

  /** Sleep quality rating (1-10, where 1=very poor, 10=excellent) */
  quality: number;

  /** Optional free-text notes about sleep disturbances, dreams, or patterns */
  notes?: string;

  /** Unix timestamp representing the date of sleep (typically previous night) */
  timestamp: number;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

/**
 * Weekly sleep average statistics for dashboard display.
 */
export interface WeeklySleepAverage {
  /** Average hours slept per night over the week */
  avgHours: number;

  /** Average sleep quality rating over the week */
  avgQuality: number;
}

/**
 * Zod schema for runtime validation of SleepEntry.
 * Ensures data integrity when creating/updating sleep entries.
 */
export const sleepEntrySchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  userId: z.string().min(1, "User ID is required"),
  hours: z
    .number()
    .min(0, "Hours must be non-negative")
    .max(24, "Hours must be at most 24"),
  quality: z
    .number()
    .int("Quality must be an integer")
    .min(1, "Quality must be at least 1")
    .max(10, "Quality must be at most 10"),
  notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
  timestamp: z.number().positive("Timestamp must be a positive value"),
  createdAt: z.number().positive("Created at must be a positive timestamp"),
  updatedAt: z.number().positive("Updated at must be a positive timestamp"),
});
