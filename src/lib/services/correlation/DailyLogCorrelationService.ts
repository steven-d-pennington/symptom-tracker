import { dailyLogsRepository } from "../../repositories/dailyLogsRepository";
import { symptomInstanceRepository } from "../../repositories/symptomInstanceRepository";
import { flareRepository } from "../../repositories/flareRepository";
import type { DailyLog } from "@/types/daily-log";
import {
    computePairWithData,
    bestWindow,
    computeConsistency,
    type WindowScore,
    type TimeRange,
    type CorrelationEventLike,
    type SymptomInstanceLike,
    WINDOW_SET,
} from "./CorrelationService";
import {
    determineConfidence,
} from "./ConfidenceCalculationService";

export type DailyLogMetric = "sleepHours" | "sleepQuality" | "mood" | "stressLevel";
export type CorrelationDirection = "forward" | "reverse"; // forward: Log -> Symptom, reverse: Symptom -> Log

export interface DailyLogCorrelationResult {
    metric: DailyLogMetric;
    symptomId: string; // or 'flare'
    direction: CorrelationDirection;
    windowScores: WindowScore[];
    bestWindow: WindowScore | undefined;
    computedAt: number;
    sampleSize: number;
    confidence?: "high" | "medium" | "low";
    consistency?: number;
}

export class DailyLogCorrelationService {
    /**
     * Compute correlation between a daily log metric and a symptom/flare
     */
    async computeCorrelation(
        userId: string,
        metric: DailyLogMetric,
        symptomId: string, // 'flare' or specific symptom name
        direction: CorrelationDirection,
        range: TimeRange,
        threshold: number, // e.g., sleep < 6, mood < 3
        operator: "<" | ">" | "<=" | ">="
    ): Promise<DailyLogCorrelationResult> {
        // 1. Hydrate Daily Logs
        // Convert ISO strings to Date for repository
        const startDate = new Date(range.start).toISOString().split('T')[0];
        const endDate = new Date(range.end).toISOString().split('T')[0];

        const logs = await dailyLogsRepository.listByDateRange(userId, startDate, endDate);

        // 2. Identify "Significant Days" based on metric threshold
        const significantLogs = logs.filter(log => {
            const value = log[metric];
            if (value === undefined) return false;

            switch (operator) {
                case "<": return value < threshold;
                case ">": return value > threshold;
                case "<=": return value <= threshold;
                case ">=": return value >= threshold;
                default: return false;
            }
        });

        // 3. Convert Logs to Events
        // Forward: Event is at start of day (e.g., 8 AM) to see if it affects the day
        // Reverse: Event is at end of day (e.g., 10 PM) to see if day's symptoms affected it
        const logEvents: CorrelationEventLike[] = significantLogs.map(log => {
            const date = new Date(log.date);
            const hour = direction === "forward" ? 8 : 22;
            date.setHours(hour, 0, 0, 0);
            return { timestamp: date.getTime() };
        });

        // 4. Hydrate Symptom/Flare Events
        let otherEvents: SymptomInstanceLike[] = [];

        if (symptomId === 'flare') {
            const flares = await flareRepository.listByDateRange(userId, range.start, range.end);
            otherEvents = flares.map(f => ({
                timestamp: new Date(f.startDate).getTime()
            }));
        } else {
            const allSymptoms = await symptomInstanceRepository.findByDateRange(
                userId,
                range.start,
                range.end
            );
            const relevantSymptoms = allSymptoms.filter(s => s.name === symptomId);
            otherEvents = relevantSymptoms.map(s => ({
                timestamp: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
            }));
        }

        // 5. Compute Correlations
        // Forward: Log (Cause) -> Symptom (Effect)
        // Reverse: Symptom (Cause) -> Log (Effect)
        const causeEvents = direction === "forward" ? logEvents : otherEvents as CorrelationEventLike[];
        const effectEvents = direction === "forward" ? otherEvents : logEvents as SymptomInstanceLike[];

        const windowScores = computePairWithData(causeEvents, effectEvents, range);
        const best = bestWindow(windowScores);

        // 6. Calculate Confidence & Consistency
        let confidence: "high" | "medium" | "low" | undefined;
        let consistency: number | undefined;

        if (best) {
            const timeWindow = WINDOW_SET.find(w => w.label === best.window)!;
            consistency = computeConsistency(causeEvents, effectEvents, timeWindow);
            confidence = determineConfidence(causeEvents.length, consistency, best.pValue);
        }

        return {
            metric,
            symptomId,
            direction,
            windowScores,
            bestWindow: best,
            computedAt: Date.now(),
            sampleSize: causeEvents.length,
            confidence,
            consistency,
        };
    }
}

export const dailyLogCorrelationService = new DailyLogCorrelationService();
