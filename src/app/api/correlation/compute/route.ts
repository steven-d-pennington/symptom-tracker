/**
 * API Route: /api/correlation/compute
 * - Computes correlation for food-symptom pairs
 * - Returns cached results immediately if available
 * - Triggers background recomputation if cache is stale/missing
 */

import { NextRequest, NextResponse } from "next/server";
import { correlationOrchestrationService } from "@/lib/services/correlation/CorrelationOrchestrationService";
import { correlationCacheService } from "@/lib/services/correlation/CorrelationCacheService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, foodId, symptomId, startMs, endMs } = body;

    // Validation
    if (!userId || !foodId || !symptomId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, foodId, symptomId" },
        { status: 400 }
      );
    }

    // Use default 30-day range if not provided
    const end = endMs || Date.now();
    const start = startMs || end - 30 * 24 * 60 * 60 * 1000;

    // Check cache first (non-blocking pattern)
    const cached = await correlationCacheService.get(userId, foodId, symptomId);

    if (cached) {
      // Return cached result immediately
      return NextResponse.json({
        ...cached,
        fromCache: true,
        cacheAge: Date.now() - cached.computedAt,
      });
    }

    // No cache hit - compute synchronously for first request
    // (Could be async in production with polling/webhooks)
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range: { start, end },
    });

    // Cache the result
    await correlationCacheService.set(result, userId);

    return NextResponse.json({
      ...result,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error computing correlation:", error);
    return NextResponse.json(
      { error: "Failed to compute correlation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const foodId = searchParams.get("foodId");
    const symptomId = searchParams.get("symptomId");

    if (!userId || !foodId || !symptomId) {
      return NextResponse.json(
        { error: "Missing required query params: userId, foodId, symptomId" },
        { status: 400 }
      );
    }

    // Check cache only (read-only operation)
    const cached = await correlationCacheService.get(userId, foodId, symptomId);

    if (!cached) {
      return NextResponse.json(
        { error: "No cached correlation found. Use POST to compute." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...cached,
      fromCache: true,
      cacheAge: Date.now() - cached.computedAt,
    });
  } catch (error) {
    console.error("Error fetching correlation:", error);
    return NextResponse.json(
      { error: "Failed to fetch correlation" },
      { status: 500 }
    );
  }
}
