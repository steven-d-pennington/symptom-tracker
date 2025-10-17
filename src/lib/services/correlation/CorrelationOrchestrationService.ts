/**
 * CorrelationOrchestrationService
 * - Orchestrates correlation computation by hydrating data from repositories
 * - Calls pure CorrelationService for computation
 * - Manages caching and cache invalidation
 */

import { foodEventRepository } from "../../repositories/foodEventRepository";
import { symptomInstanceRepository } from "../../repositories/symptomInstanceRepository";
import type { FoodEventRecord, SymptomInstanceRecord } from "../../db/schema";
import {
  computePairWithData,
  bestWindow,
  type WindowScore,
  type TimeRange,
  type FoodEventLike,
  type SymptomInstanceLike,
} from "./CorrelationService";
import {
  computeDoseResponse,
  normalizePortionSize,
  type DoseResponseResult,
} from "../food/DoseResponseService";

export interface CorrelationRequest {
  userId: string;
  foodId: string;
  symptomId: string;
  range: TimeRange;
}

export interface CorrelationResult {
  foodId: string;
  symptomId: string;
  windowScores: WindowScore[];
  bestWindow: WindowScore | undefined;
  computedAt: number;
  sampleSize: number;
  doseResponse?: DoseResponseResult; // Dose-response analysis when portion data available
}

export class CorrelationOrchestrationService {
  /**
   * Compute correlation for a single food-symptom pair
   * Hydrates data from repositories and delegates to pure CorrelationService
   */
  async computeCorrelation(request: CorrelationRequest): Promise<CorrelationResult> {
    const { userId, foodId, symptomId, range } = request;

    // Hydrate food events for this specific food
    const allFoodEvents = await foodEventRepository.findByDateRange(
      userId,
      range.start,
      range.end
    );

    // Filter to events containing this specific foodId
    const relevantFoodEvents = allFoodEvents.filter((event) => {
      const foodIds = JSON.parse(event.foodIds) as string[];
      return foodIds.includes(foodId);
    });

    // Hydrate symptom instances for this specific symptom
    const allSymptomInstances = await symptomInstanceRepository.findByDateRange(
      userId,
      range.start,
      range.end
    );

    // Filter to instances of this specific symptom (by name match)
    // Note: SymptomInstanceRecord has 'name' field, not 'symptomId'
    const symptom = await this.getSymptomName(symptomId);
    const relevantSymptoms = allSymptomInstances.filter(
      (instance: SymptomInstanceRecord) => instance.name === symptom
    );

    // Convert to lightweight interfaces for pure computation
    const foodEvents: FoodEventLike[] = relevantFoodEvents.map((e: FoodEventRecord) => ({
      timestamp: e.timestamp,
    }));

    const symptoms: SymptomInstanceLike[] = relevantSymptoms.map((s: SymptomInstanceRecord) => ({
      timestamp: new Date(s.timestamp).getTime(),
    }));

    // Compute window scores using pure service
    const windowScores = computePairWithData(foodEvents, symptoms, range);

    // Select best window
    const best = bestWindow(windowScores);

    // Compute dose-response analysis if portion data is available
    const doseResponse = await this.computeDoseResponseIfAvailable(
      relevantFoodEvents,
      relevantSymptoms,
      foodId
    );

    return {
      foodId,
      symptomId,
      windowScores,
      bestWindow: best,
      computedAt: Date.now(),
      sampleSize: foodEvents.length,
      doseResponse,
    };
  }

  /**
   * Compute dose-response analysis if portion data is available
   * Extracts portion sizes and symptom severities for regression analysis
   */
  private async computeDoseResponseIfAvailable(
    foodEvents: FoodEventRecord[],
    symptomInstances: SymptomInstanceRecord[],
    foodId: string
  ): Promise<DoseResponseResult | undefined> {
    try {
      // Extract portion sizes for this specific food
      const portionSizes: number[] = [];
      const severityScores: number[] = [];

      // For each food event, find symptom instances within a reasonable time window
      // Using 24-hour window after food consumption (same as correlation analysis)
      const SYMPTOM_WINDOW_MS = 24 * 60 * 60 * 1000;

      for (const foodEvent of foodEvents) {
        // Parse portion map to get portion size for this specific food
        const portionMap = JSON.parse(foodEvent.portionMap) as Record<string, string>;
        const portionSize = portionMap[foodId];

        if (!portionSize) {
          continue; // Skip if no portion data for this food
        }

        // Find symptom instances within 24 hours after this food event
        const eventTime = foodEvent.timestamp;
        const symptomsAfterFood = symptomInstances.filter((symptom) => {
          // Handle both Date objects and timestamps
          const symptomTime = symptom.timestamp instanceof Date
            ? symptom.timestamp.getTime()
            : new Date(symptom.timestamp).getTime();
          
          return (
            symptomTime >= eventTime &&
            symptomTime <= eventTime + SYMPTOM_WINDOW_MS
          );
        });

        // Use maximum severity within the window (worst symptom after eating)
        if (symptomsAfterFood.length > 0) {
          const maxSeverity = Math.max(
            ...symptomsAfterFood.map((s) => s.severity)
          );
          portionSizes.push(normalizePortionSize(portionSize));
          severityScores.push(maxSeverity);
        }
      }

      // Only compute dose-response if we have matched portion-severity pairs
      if (portionSizes.length === 0) {
        return undefined;
      }

      // Compute dose-response using DoseResponseService
      return computeDoseResponse(portionSizes, severityScores);
    } catch (error) {
      console.error("Error computing dose-response:", error);
      return undefined; // Gracefully handle errors, don't block correlation
    }
  }

  /**
   * Compute correlations for multiple food-symptom pairs
   * Useful for batch processing in background jobs
   */
  async computeMultiplePairs(
    userId: string,
    pairs: Array<{ foodId: string; symptomId: string }>,
    range: TimeRange
  ): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const pair of pairs) {
      const result = await this.computeCorrelation({
        userId,
        foodId: pair.foodId,
        symptomId: pair.symptomId,
        range,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Helper: Get symptom name by ID
   * TODO: Use symptomRepository when available
   */
  private async getSymptomName(symptomId: string): Promise<string> {
    // Temporary: In current schema, symptomInstances store name directly
    // In future, might need to look up from symptoms table
    return symptomId; // Assuming symptomId is actually the symptom name for now
  }
}

export const correlationOrchestrationService = new CorrelationOrchestrationService();
