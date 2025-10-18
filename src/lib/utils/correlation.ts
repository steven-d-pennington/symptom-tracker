import type { TriggerEventRecord } from "../db/schema";
import type { Symptom } from "../types/symptoms";
import type { TriggerCorrelation } from "../types/trigger-correlation";

/**
 * Time bucket windows in milliseconds
 * 0-2h, 2-4h, 4-6h, 6-12h, 12-24h
 */
const TIME_BUCKETS = [
  { label: "0-2h", min: 0, max: 2 * 60 * 60 * 1000 },
  { label: "2-4h", min: 2 * 60 * 60 * 1000, max: 4 * 60 * 60 * 1000 },
  { label: "4-6h", min: 4 * 60 * 60 * 1000, max: 6 * 60 * 60 * 1000 },
  { label: "6-12h", min: 6 * 60 * 60 * 1000, max: 12 * 60 * 60 * 1000 },
  { label: "12-24h", min: 12 * 60 * 60 * 1000, max: 24 * 60 * 60 * 1000 },
];

interface TimeLagData {
  bucket: string;
  count: number;
}

/**
 * Calculate temporal correlation between triggers and symptoms
 * Analyzes time-lag patterns using time bucket windows
 */
export function calculateTemporalCorrelation(
  triggers: TriggerEventRecord[],
  symptoms: Symptom[]
): TriggerCorrelation[] {
  const correlationMap = new Map<
    string,
    {
      triggerName: string;
      symptomName: string;
      timeLagData: TimeLagData[];
      totalOccurrences: number;
      severities: number[];
    }
  >();

  // For each trigger event, find symptoms within time windows
  triggers.forEach((trigger) => {
    const triggerTimestamp = typeof trigger.timestamp === 'number'
      ? trigger.timestamp
      : new Date(trigger.timestamp).getTime();

    symptoms.forEach((symptom) => {
      const symptomTimestamp = typeof symptom.timestamp === 'number'
        ? symptom.timestamp
        : new Date(symptom.timestamp).getTime();

      // Calculate time difference (symptom after trigger)
      const timeDiff = symptomTimestamp - triggerTimestamp;

      // Only consider symptoms that occur AFTER triggers within 24 hours
      if (timeDiff < 0 || timeDiff > 24 * 60 * 60 * 1000) {
        return;
      }

      // Find which time bucket this falls into
      const bucket = TIME_BUCKETS.find((b) => timeDiff >= b.min && timeDiff < b.max);
      if (!bucket) return;

      // Create correlation key using a safe separator to avoid hyphen/name collisions
      const SEP = "__SEP__";
      const key = `${trigger.triggerId}${SEP}${symptom.name}`;

      if (!correlationMap.has(key)) {
        correlationMap.set(key, {
          triggerName: trigger.triggerId, // Will be resolved to name later
          symptomName: symptom.name,
          timeLagData: TIME_BUCKETS.map((b) => ({ bucket: b.label, count: 0 })),
          totalOccurrences: 0,
          severities: [],
        });
      }

      const data = correlationMap.get(key)!;
      const bucketIndex = TIME_BUCKETS.findIndex((b) => b.label === bucket.label);
      data.timeLagData[bucketIndex].count++;
      data.totalOccurrences++;
      data.severities.push(symptom.severity);
    });
  });

  // Convert to TriggerCorrelation array
  const correlations: TriggerCorrelation[] = [];

  correlationMap.forEach((data, key) => {
    const [triggerId, symptomName] = key.split("__SEP__");

    // Find most common time-lag bucket
    const maxBucket = data.timeLagData.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    // Calculate average severity
    const avgSeverity =
      data.severities.reduce((sum, s) => sum + s, 0) / data.severities.length;

    // Calculate correlation score (0-1) based on occurrences and consistency
    // More occurrences and concentrated in one bucket = higher score
    const maxBucketRatio = maxBucket.count / data.totalOccurrences;
    const occurrenceScore = Math.min(data.totalOccurrences / 10, 1); // Normalize by 10 occurrences
    const correlationScore = (maxBucketRatio + occurrenceScore) / 2;

    // Determine confidence level
    let confidence: "high" | "medium" | "low" = "low";
    if (data.totalOccurrences >= 10 && correlationScore > 0.7) {
      confidence = "high";
    } else if (data.totalOccurrences >= 5 && correlationScore > 0.5) {
      confidence = "medium";
    }

    correlations.push({
      triggerId,
      triggerName: triggerId, // Will be resolved by caller
      symptomId: symptomName,
      symptomName,
      correlationScore,
      occurrences: data.totalOccurrences,
      avgSeverityIncrease: avgSeverity,
      confidence,
      timeLag: maxBucket.bucket, // Most common time delay
    });
  });

  // Sort by correlation score (highest first)
  return correlations.sort((a, b) => b.correlationScore - a.correlationScore);
}

/**
 * Calculate Pearson correlation coefficient
 * Returns value between -1 and 1
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}
