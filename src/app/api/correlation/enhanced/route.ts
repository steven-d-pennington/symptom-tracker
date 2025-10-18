/**
 * API Route: /api/correlation/enhanced
 * - Computes both individual correlations AND combination effects
 * - Returns enhanced results with synergistic food combinations
 * - Supports optional includeCombinations query parameter
 */

import { NextRequest, NextResponse } from "next/server";
import { correlationOrchestrationService } from "@/lib/services/correlation/CorrelationOrchestrationService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symptomId, startMs, endMs, minSampleSize } = body;

    // Validation
    if (!userId || !symptomId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, symptomId" },
        { status: 400 }
      );
    }

    // Use default 30-day range if not provided
    const end = endMs || Date.now();
    const start = startMs || end - 30 * 24 * 60 * 60 * 1000;

    // Compute enhanced correlations with combinations
    const result = await correlationOrchestrationService.computeWithCombinations(
      userId,
      symptomId,
      { start, end },
      { minSampleSize }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error computing enhanced correlation:", error);
    return NextResponse.json(
      { error: "Failed to compute enhanced correlation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const symptomId = searchParams.get("symptomId");
    const startMs = searchParams.get("startMs");
    const endMs = searchParams.get("endMs");
    const minSampleSize = searchParams.get("minSampleSize");

    if (!userId || !symptomId) {
      return NextResponse.json(
        { error: "Missing required query params: userId, symptomId" },
        { status: 400 }
      );
    }

    // Use default 30-day range if not provided
    const end = endMs ? parseInt(endMs) : Date.now();
    const start = startMs ? parseInt(startMs) : end - 30 * 24 * 60 * 60 * 1000;

    // Compute enhanced correlations with combinations
    const result = await correlationOrchestrationService.computeWithCombinations(
      userId,
      symptomId,
      { start, end },
      { minSampleSize: minSampleSize ? parseInt(minSampleSize) : undefined }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching enhanced correlation:", error);
    return NextResponse.json(
      { error: "Failed to fetch enhanced correlation" },
      { status: 500 }
    );
  }
}
