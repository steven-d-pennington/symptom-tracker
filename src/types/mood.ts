import { z } from "zod";

/**
 * Mood emotion types for quick visual selection.
 * Users can select from predefined emotions in addition to numeric mood scale.
 */
export enum MoodType {
  Happy = "happy",
  Neutral = "neutral",
  Sad = "sad",
  Anxious = "anxious",
  Stressed = "stressed",
}

/**
 * Mood entry record stored in IndexedDB.
 * Tracks user's emotional state and mental health patterns.
 * Enables correlation analysis with symptoms and flares.
 */
export interface MoodEntry {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support (future-proofing) */
  userId: string;

  /** Numeric mood scale (1-10, where 1=very bad, 10=very good) */
  mood: number;

  /** Optional emotion picker selection for quick categorization */
  moodType?: MoodType;

  /** Optional free-text notes about mood and feelings */
  notes?: string;

  /** Unix timestamp when mood was logged (Date.now()) */
  timestamp: number;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

/**
 * Zod schema for runtime validation of MoodEntry.
 * Ensures data integrity when creating/updating mood entries.
 */
export const moodEntrySchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  userId: z.string().min(1, "User ID is required"),
  mood: z
    .number()
    .int("Mood must be an integer")
    .min(1, "Mood must be at least 1")
    .max(10, "Mood must be at most 10"),
  moodType: z.nativeEnum(MoodType).optional(),
  notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
  timestamp: z.number().positive("Timestamp must be a positive value"),
  createdAt: z.number().positive("Created at must be a positive timestamp"),
  updatedAt: z.number().positive("Updated at must be a positive timestamp"),
});
