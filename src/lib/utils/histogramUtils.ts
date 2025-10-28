/**
 * Histogram Utilities (Story 3.3 - Task 2)
 *
 * Utility functions for calculating duration histograms and severity distributions.
 * Supports bucket-based analysis for charts and visualizations.
 */

/**
 * Duration bucket interface (Task 2.2)
 * Represents a time range bucket for duration histogram.
 */
export interface DurationBucket {
  /** Display label for the bucket (e.g., "0-7 days") */
  label: string;

  /** Minimum days in the bucket (inclusive) */
  minDays: number;

  /** Maximum days in the bucket (inclusive) - null for open-ended buckets */
  maxDays: number | null;

  /** Count of flares falling within this bucket */
  count: number;
}

/**
 * Severity range interface (Task 2.7)
 * Represents a severity level range for distribution chart.
 */
export interface SeverityRange {
  /** Display label for the range (e.g., "Mild") */
  label: string;

  /** Range description (e.g., "1-3") */
  range: string;

  /** Color coding for the range (green, yellow, red) */
  color: string;

  /** Count of flares falling within this range */
  count: number;
}

/**
 * Calculate duration histogram from an array of durations.
 * Groups durations into predefined buckets for visualization.
 *
 * Task 2.3-2.6: AC3.3.4 (Duration Histogram)
 * - Buckets: 0-7 days, 8-14 days, 15-30 days, 31-60 days, 60+ days
 * - Assigns each duration to appropriate bucket
 * - Counts flares per bucket
 * - Returns array of DurationBucket objects
 *
 * @param durations - Array of duration values in days
 * @returns Array of DurationBucket objects with counts
 */
export function calculateDurationHistogram(durations: number[]): DurationBucket[] {
  // Task 2.4: Define duration buckets
  const buckets: DurationBucket[] = [
    { label: '0-7 days', minDays: 0, maxDays: 7, count: 0 },
    { label: '8-14 days', minDays: 8, maxDays: 14, count: 0 },
    { label: '15-30 days', minDays: 15, maxDays: 30, count: 0 },
    { label: '31-60 days', minDays: 31, maxDays: 60, count: 0 },
    { label: '60+ days', minDays: 60, maxDays: null, count: 0 }
  ];

  // Task 2.5: For each bucket, count durations falling within range
  durations.forEach(duration => {
    const bucket = buckets.find(b => {
      if (b.maxDays === null) {
        // Open-ended bucket (60+ days)
        return duration >= b.minDays;
      }
      // Closed bucket (inclusive range)
      return duration >= b.minDays && duration <= b.maxDays;
    });
    if (bucket) {
      bucket.count++;
    }
  });

  // Task 2.6: Return array of DurationBucket objects with counts
  return buckets;
}

/**
 * Calculate severity distribution from an array of severity values.
 * Groups severities into predefined ranges for visualization.
 *
 * Task 2.8-2.11: AC3.3.4 (Severity Distribution)
 * - Ranges: Mild (1-3), Moderate (4-6), Severe (7-10)
 * - Assigns each severity to appropriate range
 * - Counts flares per range
 * - Returns array of SeverityRange objects with color coding
 *
 * @param severities - Array of severity values (1-10 scale)
 * @returns Array of SeverityRange objects with counts
 */
export function calculateSeverityDistribution(severities: number[]): SeverityRange[] {
  // Task 2.9: Define severity ranges with color coding
  const ranges: SeverityRange[] = [
    { label: 'Mild', range: '1-3', color: 'green', count: 0 },
    { label: 'Moderate', range: '4-6', color: 'yellow', count: 0 },
    { label: 'Severe', range: '7-10', color: 'red', count: 0 }
  ];

  // Task 2.10: For each range, count severities within bounds
  severities.forEach(severity => {
    if (severity >= 1 && severity <= 3) {
      ranges[0].count++;
    } else if (severity >= 4 && severity <= 6) {
      ranges[1].count++;
    } else if (severity >= 7 && severity <= 10) {
      ranges[2].count++;
    }
  });

  // Task 2.11: Return array of SeverityRange objects with counts
  return ranges;
}
