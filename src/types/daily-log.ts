import { z } from "zod";

/**
 * Flare quick update within a daily log entry.
 * Allows users to update flare severity and trend without navigating to body map.
 */
export interface FlareQuickUpdate {
  /** Foreign key to flares table */
  flareId: string;

  /** Severity level (1-10 scale) */
  severity: number;

  /** Trend indicator */
  trend: 'improving' | 'stable' | 'worsening';

  /** Optional list of interventions applied (e.g., "Ice pack", "Rest") */
  interventions?: string[];

  /** Optional notes about the flare update */
  notes?: string;
}

/**
 * Daily log entry record stored in IndexedDB (Story 6.2).
 * Represents unified end-of-day reflection capturing mood, sleep, and notes.
 * Distinct from event-based tracking (food, medication, symptoms logged throughout day).
 * One entry per user per day enforced by compound index [userId+date].
 *
 * @see docs/ux-design-specification.md#Daily-Log-Architecture
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 */
export interface DailyLog {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support */
  userId: string;

  /** ISO date string (YYYY-MM-DD format) - unique per user per day */
  date: string;

  // Daily reflection fields

  /** Mood scale (1=Bad, 2=Poor, 3=Okay, 4=Good, 5=Great) */
  mood: 1 | 2 | 3 | 4 | 5;

  /** Sleep duration in hours (0-24, supports 0.5 increments like 7.5) */
  sleepHours: number;

  /** Sleep quality rating (1-5 stars) */
  sleepQuality: 1 | 2 | 3 | 4 | 5;

  /** Optional free-text notes about the day (max 2000 characters) */
  notes?: string;

  /** Optional quick updates for active flares */
  flareUpdates?: FlareQuickUpdate[];

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

/**
 * Zod schema for FlareQuickUpdate validation.
 */
export const flareQuickUpdateSchema = z.object({
  flareId: z.string().uuid("Flare ID must be a valid UUID"),
  severity: z
    .number()
    .int("Severity must be an integer")
    .min(1, "Severity must be at least 1")
    .max(10, "Severity must be at most 10"),
  trend: z.enum(['improving', 'stable', 'worsening']),
  interventions: z.array(z.string()).optional(),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
});

/**
 * Zod schema for runtime validation of DailyLog.
 * Ensures data integrity when creating/updating daily log entries.
 */
export const dailyLogSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  userId: z.string().min(1, "User ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  mood: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  sleepHours: z
    .number()
    .min(0, "Sleep hours must be at least 0")
    .max(24, "Sleep hours must be at most 24"),
  sleepQuality: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  notes: z.string().max(2000, "Notes must be at most 2000 characters").optional(),
  flareUpdates: z.array(flareQuickUpdateSchema).optional(),
  createdAt: z.number().positive("Created at must be a positive timestamp"),
  updatedAt: z.number().positive("Updated at must be a positive timestamp"),
});
