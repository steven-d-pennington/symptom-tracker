/**
 * API Route: /api/correlation/cron
 * - Triggered by Vercel Cron for scheduled correlation recomputation
 * - Processes recent food-symptom pairs incrementally
 * - Cleans up expired cache entries
 */

import { NextRequest, NextResponse } from "next/server";
import { correlationOrchestrationService } from "@/lib/services/correlation/CorrelationOrchestrationService";
import { correlationCacheService } from "@/lib/services/correlation/CorrelationCacheService";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { db } from "@/lib/db/client";

// Configuration
const RECOMPUTE_WINDOW_DAYS = 30; // Only recompute last 30 days
const MAX_PAIRS_PER_RUN = 50; // Limit pairs per cron run to avoid timeouts

export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (Vercel adds special header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      usersProcessed: 0,
      pairsComputed: 0,
      cacheEntriesCreated: 0,
      expiredEntriesCleaned: 0,
      errors: [] as string[],
      duration: 0,
    };

    // Get all users (for single-user app, this is just one user)
    const users = await db.users.toArray();

    for (const user of users) {
      try {
        results.usersProcessed++;

        // Clean up expired cache entries first
        const cleaned = await correlationCacheService.cleanupExpired(user.id);
        results.expiredEntriesCleaned += cleaned;

        // Define time range for recent data (last 30 days)
        const endMs = Date.now();
        const startMs = endMs - RECOMPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

        // Get recent food events and symptom instances
        const recentFoodEvents = await foodEventRepository.findByDateRange(
          user.id,
          startMs,
          endMs
        );

        const recentSymptoms = await symptomInstanceRepository.findByDateRange(
          user.id,
          startMs,
          endMs
        );

        // Extract unique food IDs and symptom names
        const foodIds = new Set<string>();
        recentFoodEvents.forEach((event) => {
          const ids = JSON.parse(event.foodIds) as string[];
          ids.forEach((id) => foodIds.add(id));
        });

        const symptomNames = new Set<string>();
        recentSymptoms.forEach((symptom) => {
          symptomNames.add(symptom.name);
        });

        // Generate food-symptom pairs (limited to MAX_PAIRS_PER_RUN)
        const pairs: Array<{ foodId: string; symptomId: string }> = [];
        for (const foodId of foodIds) {
          for (const symptomName of symptomNames) {
            pairs.push({ foodId, symptomId: symptomName });
            if (pairs.length >= MAX_PAIRS_PER_RUN) break;
          }
          if (pairs.length >= MAX_PAIRS_PER_RUN) break;
        }

        // Compute correlations for pairs
        if (pairs.length > 0) {
          const correlations = await correlationOrchestrationService.computeMultiplePairs(
            user.id,
            pairs,
            { start: startMs, end: endMs }
          );

          results.pairsComputed += correlations.length;

          // Cache all results
          for (const correlation of correlations) {
            await correlationCacheService.set(correlation, user.id);
            results.cacheEntriesCreated++;
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        results.errors.push(`User ${user.id}: ${String(userError)}`);
      }
    }

    results.duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Correlation cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering during development
export async function POST(request: NextRequest) {
  return GET(request);
}
