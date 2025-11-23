import { triggerEventRepository } from "../../repositories/triggerEventRepository";
import { symptomInstanceRepository } from "../../repositories/symptomInstanceRepository";
import { flareRepository } from "../../repositories/flareRepository";
import type { TriggerEventRecord, SymptomInstanceRecord, FlareRecord } from "../../db/schema";
import {
    computePairWithData,
    bestWindow,
    computeConsistency,
    type WindowScore,
    type TimeRange,
    type CorrelationEventLike,
    type SymptomInstanceLike,
    type WindowRange,
    WINDOW_SET,
} from "./CorrelationService";
import {
    determineConfidence,
    P_VALUE_THRESHOLD,
} from "./ConfidenceCalculationService";

export interface TriggerCorrelationResult {
    triggerId: string;
    symptomId: string; // or 'flare'
    windowScores: WindowScore[];
    bestWindow: WindowScore | undefined;
    computedAt: number;
    sampleSize: number;
    confidence?: "high" | "medium" | "low";
    consistency?: number;
}

export class TriggerCorrelationService {
    /**
     * Compute correlation for a single trigger-symptom pair
     */
    async computeCorrelation(
        userId: string,
        triggerId: string,
        symptomId: string, // 'flare' or specific symptom name
        range: TimeRange
    ): Promise<TriggerCorrelationResult> {
        // 1. Hydrate Trigger Events
        const allTriggerEvents = await triggerEventRepository.findByDateRange(
            userId,
            range.start,
            range.end
        );

        const relevantTriggerEvents = allTriggerEvents.filter(
            (e) => e.triggerId === triggerId
        );

        const triggerEvents: CorrelationEventLike[] = relevantTriggerEvents.map((e) => ({
            timestamp: e.timestamp,
        }));

        // 2. Hydrate Result Events (Symptom or Flare)
        let resultEvents: SymptomInstanceLike[] = [];

        if (symptomId === 'flare') {
            const flares = await flareRepository.listByDateRange(userId, range.start, range.end);

            resultEvents = flares.map(f => ({
                timestamp: new Date(f.startDate).getTime()
            }));
        } else {
            const allSymptoms = await symptomInstanceRepository.findByDateRange(
                userId,
                range.start,
                range.end
            );

            // Filter by symptom name (assuming symptomId is the name for now)
            const relevantSymptoms = allSymptoms.filter(
                (s) => s.name === symptomId
            );

            resultEvents = relevantSymptoms.map((s) => ({
                timestamp: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
            }));
        }

        // 3. Compute Correlations
        const windowScores = computePairWithData(triggerEvents, resultEvents, range);
        const best = bestWindow(windowScores);

        // 4. Calculate Confidence & Consistency
        let confidence: "high" | "medium" | "low" | undefined;
        let consistency: number | undefined;

        if (best) {
            const timeWindow = WINDOW_SET.find(w => w.label === best.window)!;
            consistency = computeConsistency(triggerEvents, resultEvents, timeWindow);
            confidence = determineConfidence(triggerEvents.length, consistency, best.pValue);
        }

        return {
            triggerId,
            symptomId,
            windowScores,
            bestWindow: best,
            computedAt: Date.now(),
            sampleSize: triggerEvents.length,
            confidence,
            consistency,
        };
    }
}

export const triggerCorrelationService = new TriggerCorrelationService();
