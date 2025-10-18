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
  computeConsistency,
  WINDOW_SET,
  type WindowScore,
  type TimeRange,
  type FoodEventLike,
  type SymptomInstanceLike,
  type WindowRange,
} from "./CorrelationService";
import {
  computeDoseResponse,
  normalizePortionSize,
  type DoseResponseResult,
} from "../food/DoseResponseService";
import {
  detectCombinations,
  type FoodCombination,
  type MealEvent,
  type IndividualCorrelation,
} from "../food/CombinationAnalysisService";
import {
  determineConfidence,
  P_VALUE_THRESHOLD,
} from "./ConfidenceCalculationService";

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
  confidence?: "high" | "medium" | "low"; // Confidence level from multi-factor analysis
  consistency?: number; // Consistency metric (0-1 decimal)
}

export interface EnhancedCorrelationResult {
  correlations: CorrelationResult[];
  combinations: FoodCombination[]; // Synergistic food combinations
  metadata: {
    userId: string;
    range: TimeRange;
    computedAt: number;
    totalPairs: number;
    combinationsDetected: number;
  };
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
   * Compute enhanced correlations with combination effects detection
   * Analyzes both individual food-symptom correlations and synergistic combinations
   */
  async computeWithCombinations(
    userId: string,
    symptomId: string,
    range: TimeRange,
    options?: {
      minSampleSize?: number;
      onlyUnique?: boolean;
    }
  ): Promise<EnhancedCorrelationResult> {
    // Step 1: Hydrate all food events and symptom instances
    const allFoodEvents = await foodEventRepository.findByDateRange(
      userId,
      range.start,
      range.end
    );

    const allSymptomInstances = await symptomInstanceRepository.findByDateRange(
      userId,
      range.start,
      range.end
    );

    // Filter symptom instances for the specific symptom
    const symptomName = await this.getSymptomName(symptomId);
    const relevantSymptoms = allSymptomInstances.filter(
      (instance: SymptomInstanceRecord) => instance.name === symptomName
    );

    // Step 2: Extract unique food IDs from all events
    const uniqueFoodIds = new Set<string>();
    allFoodEvents.forEach((event) => {
      const foodIds = JSON.parse(event.foodIds) as string[];
      foodIds.forEach((id) => uniqueFoodIds.add(id));
    });

    // Step 3: Compute individual correlations for each food with confidence
    const individualCorrelations: CorrelationResult[] = [];
    for (const foodId of uniqueFoodIds) {
      const result = await this.computeCorrelation({
        userId,
        foodId,
        symptomId,
        range,
      });

      // Compute confidence if bestWindow exists
      if (result.bestWindow) {
        // Filter to food events containing this specific foodId
        const foodEventsForThisFood = allFoodEvents.filter((event) => {
          const foodIds = JSON.parse(event.foodIds) as string[];
          return foodIds.includes(foodId);
        });

        // Convert to lightweight interfaces
        const foodEvents: FoodEventLike[] = foodEventsForThisFood.map((e) => ({
          timestamp: e.timestamp,
        }));

        const symptoms: SymptomInstanceLike[] = relevantSymptoms.map((s) => ({
          timestamp: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
        }));

        // Get time window from bestWindow
        const timeWindow: WindowRange = this.getTimeWindowFromLabel(result.bestWindow.window);

        // Compute consistency
        const consistency = computeConsistency(foodEvents, symptoms, timeWindow);

        // Determine confidence level
        const confidence = determineConfidence(
          result.sampleSize,
          consistency,
          result.bestWindow.pValue
        );

        // Add confidence and consistency to result
        result.confidence = confidence;
        result.consistency = consistency;
      }

      individualCorrelations.push(result);
    }

    // Filter out correlations with insufficient statistical significance (p >= 0.05)
    const significantCorrelations = individualCorrelations.filter((result) => {
      return result.bestWindow && result.bestWindow.pValue < P_VALUE_THRESHOLD;
    });

    // Step 4: Build individual correlation array for CombinationAnalysisService
    // Use only significant correlations
    const individualCorrelationArray: IndividualCorrelation[] = [];
    const foodNameMap: Record<string, string> = {}; // Store food names for combination detection
    
    for (const result of significantCorrelations) {
      if (result.bestWindow && result.bestWindow.score > 0) {
        // Get food name from food events
        const foodName = await this.getFoodName(result.foodId);
        foodNameMap[result.foodId] = foodName;
        
        individualCorrelationArray.push({
          foodId: result.foodId,
          foodName,
          symptomId,
          symptomName,
          correlation: result.bestWindow.score, // Use score as correlation strength
        });
      }
    }

    // Step 5: Transform food events to MealEvent format for combination detection
    const mealEvents: MealEvent[] = allFoodEvents.map((event) => {
      const foodIds = JSON.parse(event.foodIds) as string[];
      const foodNames = foodIds.map((id) => foodNameMap[id] || id); // Use mapped names or fallback to ID
      
      return {
        mealId: event.mealId || `meal-${event.id}`, // Use mealId if available, fallback to event ID
        foodIds,
        foodNames,
        timestamp: event.timestamp,
      };
    });

    // Step 6: Transform symptom instances for combination detection
    const symptomEvents: SymptomInstanceLike[] = relevantSymptoms.map((s) => ({
      timestamp: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
    }));

    // Step 7: Detect combinations using CombinationAnalysisService
    const combinations = detectCombinations(
      mealEvents,
      symptomEvents,
      individualCorrelationArray,
      range,
      options?.minSampleSize
    );

    // Step 8: Return enhanced result with only significant correlations
    return {
      correlations: significantCorrelations,
      combinations,
      metadata: {
        userId,
        range,
        computedAt: Date.now(),
        totalPairs: significantCorrelations.length,
        combinationsDetected: combinations.length,
      },
    };
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

  /**
   * Helper: Get food name by ID
   * TODO: Use foodRepository when available
   */
  private async getFoodName(foodId: string): Promise<string> {
    // Temporary: Return food ID as name
    // In future, look up from foods table to get actual name
    return foodId;
  }

  /**
   * Helper: Convert WindowLabel to WindowRange
   * Uses WINDOW_SET from CorrelationService
   */
  private getTimeWindowFromLabel(label: string): WindowRange {
    const window = WINDOW_SET.find((w: WindowRange) => w.label === label);
    if (!window) {
      throw new Error(`Unknown window label: ${label}`);
    }
    return window;
  }
}

export const correlationOrchestrationService = new CorrelationOrchestrationService();
