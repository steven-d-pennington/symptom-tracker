/**
 * Daily Log Generator (Story 6.8)
 *
 * Generates synthetic daily log entries for testing Epic 6 analytics capabilities.
 * Creates mood/sleep data correlated with flare severity for realistic test scenarios.
 *
 * Key Features:
 * - 60-80% day coverage (realistic gaps)
 * - Mood/sleep values correlate with flare severity
 * - Weekday vs weekend patterns
 * - Optional notes (10% of days)
 *
 * @see docs/stories/6-8-devdata-controls-enhancement-for-analytics-support.md
 * @see docs/stories/6-2-daily-log-page.md (DailyLog schema)
 */

import { dailyLogsRepository } from "@/lib/repositories/dailyLogsRepository";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { format, addDays } from "date-fns";

/**
 * Configuration for daily log generation
 */
export interface DailyLogGenerationConfig {
  userId: string;
  startDate: Date;
  endDate: Date;
  /** Target coverage percentage (0.6 = 60%, 0.8 = 80%) */
  coveragePercent: number;
  /** Whether to correlate mood/sleep with flare severity */
  correlateWithFlares: boolean;
}

/**
 * Result of daily log generation
 */
export interface DailyLogGenerationResult {
  dailyLogsCreated: number;
}

/**
 * Generates synthetic daily log entries with realistic patterns.
 * Correlates mood/sleep with flare severity for testing insights features.
 *
 * Algorithm:
 * 1. Calculate target days based on coverage percentage
 * 2. Randomly select days (realistic gaps, not consecutive)
 * 3. Generate mood (1-5) and sleep (hours 4-10, quality 1-5)
 * 4. Query flares for correlation: high flare severity = worse mood/sleep
 * 5. Apply weekday/weekend patterns (better mood/sleep on weekends)
 * 6. Batch create daily logs via dailyLogsRepository
 *
 * @param config - Generation configuration (userId, date range, coverage)
 * @returns Promise resolving to generation result with count
 */
export async function generateDailyLogs(
  config: DailyLogGenerationConfig
): Promise<DailyLogGenerationResult> {
  const { userId, startDate, endDate, coveragePercent, correlateWithFlares } = config;

  console.log("[generateDailyLogs] Starting generation", {
    userId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    coveragePercent,
    correlateWithFlares,
  });

  // Step 1: Calculate total days and target days
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const targetDays = Math.floor(totalDays * coveragePercent);

  console.log(`[generateDailyLogs] Target: ${targetDays} days out of ${totalDays} (${Math.round(coveragePercent * 100)}% coverage)`);

  // Step 2: Randomly select days for coverage (realistic gaps)
  const selectedDays = new Set<number>();
  while (selectedDays.size < targetDays) {
    const randomDay = Math.floor(Math.random() * totalDays);
    selectedDays.add(randomDay);
  }

  const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);

  // Step 3: Load flares once for correlation (if enabled)
  let flaresByDate: Map<string, { maxSeverity: number }> | null = null;
  if (correlateWithFlares) {
    const flares = await flareRepository.listByDateRange(
      userId,
      startDate.getTime(),
      endDate.getTime()
    );

    flaresByDate = new Map();

    // Build date-indexed map of flare severity
    for (const flare of flares) {
      const flareStartDate = new Date(flare.startDate);
      const flareEndDate = flare.endDate ? new Date(flare.endDate) : endDate;

      // Mark all days this flare was active
      let currentDate = new Date(flareStartDate);
      while (currentDate <= flareEndDate) {
        const dateKey = format(currentDate, "yyyy-MM-dd");
        const existing = flaresByDate.get(dateKey);
        const currentMaxSeverity = existing ? existing.maxSeverity : 0;

        flaresByDate.set(dateKey, {
          maxSeverity: Math.max(currentMaxSeverity, flare.currentSeverity),
        });

        currentDate = addDays(currentDate, 1);
      }
    }

    console.log(`[generateDailyLogs] Loaded ${flares.length} flares for correlation`);
  }

  // Step 4: Generate daily logs for selected days
  const dailyLogs: Array<{
    userId: string;
    date: string;
    mood: 1 | 2 | 3 | 4 | 5;
    sleepHours: number;
    sleepQuality: 1 | 2 | 3 | 4 | 5;
    notes?: string;
  }> = [];

  for (const dayOffset of sortedDays) {
    const date = addDays(startDate, dayOffset);
    const dateString = format(date, "yyyy-MM-dd");

    // Step 5: Generate base mood (1-5 scale per DailyLog schema)
    let baseMood = Math.floor(Math.random() * 2) + 3; // 3-4 baseline (Okay-Good)

    // Step 6: Generate base sleep (hours 4-10, quality 1-5 scale)
    let baseSleepHours = 6.5 + (Math.random() - 0.5) * 3; // 5-8 hours
    let baseSleepQuality = Math.floor(Math.random() * 2) + 3; // 3-4 baseline

    // Step 7: Apply flare correlation (high flare severity = worse mood/sleep)
    if (correlateWithFlares && flaresByDate) {
      const flareData = flaresByDate.get(dateString);
      if (flareData) {
        const maxFlareSeverity = flareData.maxSeverity;

        if (maxFlareSeverity >= 7) {
          // High severity flare: significant impact (reduce by 2-3 points on 5-point scale)
          const flarePenalty = Math.floor(Math.random() * 2) + 2; // 2-3 points
          baseMood = Math.max(1, baseMood - flarePenalty);
          baseSleepHours = Math.max(4, baseSleepHours - (Math.random() + 1)); // -1 to -2 hours
          baseSleepQuality = Math.max(1, baseSleepQuality - flarePenalty);
        } else if (maxFlareSeverity >= 4) {
          // Moderate severity flare: mild impact (reduce by 1 point)
          baseMood = Math.max(1, baseMood - 1);
          baseSleepHours = Math.max(4, baseSleepHours - Math.random()); // -0 to -1 hour
          baseSleepQuality = Math.max(1, baseSleepQuality - 1);
        }
      }
    }

    // Step 8: Apply weekday/weekend patterns (better mood/sleep on weekends)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      baseMood = Math.min(5, baseMood + 1); // Cap at 5 (Great)
      baseSleepHours = Math.min(10, baseSleepHours + 0.5);
      baseSleepQuality = Math.min(5, baseSleepQuality + 1); // Cap at 5 stars
    }

    // Step 9: Round and clamp values to schema constraints
    const mood = Math.max(1, Math.min(5, Math.round(baseMood))) as 1 | 2 | 3 | 4 | 5;
    const sleepHours = Math.max(4, Math.min(10, Math.round(baseSleepHours * 2) / 2)); // Round to 0.5
    const sleepQuality = Math.max(1, Math.min(5, Math.round(baseSleepQuality))) as 1 | 2 | 3 | 4 | 5;

    // Step 10: Generate optional notes (10% of days)
    let notes: string | undefined;
    if (Math.random() < 0.1) {
      const noteTemplates = [
        "Felt pretty good today overall",
        "Had trouble sleeping last night",
        "Stressful day at work",
        "Relaxing day, felt much better",
        "Noticed some flare activity",
        "Great day, minimal symptoms",
        "Tired and sore today",
      ];
      notes = noteTemplates[Math.floor(Math.random() * noteTemplates.length)];
    }

    dailyLogs.push({
      userId,
      date: dateString,
      mood,
      sleepHours,
      sleepQuality,
      notes,
    });
  }

  // Step 11: Batch create daily logs
  console.log(`[generateDailyLogs] Creating ${dailyLogs.length} daily logs...`);

  for (const log of dailyLogs) {
    try {
      await dailyLogsRepository.create(log);
    } catch (error) {
      // Log error but continue (may be duplicate date)
      console.warn(`[generateDailyLogs] Failed to create log for ${log.date}:`, error);
    }
  }

  console.log(`[generateDailyLogs] ✅ Created ${dailyLogs.length} daily logs`);

  return {
    dailyLogsCreated: dailyLogs.length,
  };
}
