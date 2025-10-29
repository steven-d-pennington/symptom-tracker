/**
 * Analytics Repository (Story 3.1 - Task 1)
 *
 * Provides data aggregation methods for flare analytics.
 * Calculates problem areas, frequency metrics, and trends.
 *
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/solution-architecture.md#ADR-004 (On-demand calculation strategy)
 */

import { db } from '@/lib/db/client';
import { FlareRecord } from '@/lib/db/schema';
import { ProblemArea, TimeRange, RegionFlareHistory, RegionStatistics, DurationMetrics, SeverityMetrics, TrendAnalysis, TrendDataPoint } from '@/types/analytics';
import { withinTimeRange } from '@/lib/utils/timeRange';
import { calculateLinearRegression } from '@/lib/utils/linearRegression';

/**
 * Calculates problem areas by analyzing flare frequency across body regions.
 * Returns regions sorted by flare count (highest first).
 * Only includes regions with 3+ flares to avoid noise from one-off incidents.
 *
 * AC3.1.2: Problem areas ranked by flare frequency
 * - Groups flares by bodyRegionId
 * - Calculates percentage of total flares
 * - Filters out regions with < 3 flares
 * - Sorts by flareCount descending
 *
 * @param userId - User ID for multi-user isolation
 * @param timeRange - Time range to filter flares (last30d, last90d, lastYear, allTime)
 * @returns Promise resolving to array of ProblemArea objects sorted by frequency
 */
export async function getProblemAreas(
  userId: string,
  timeRange: TimeRange
): Promise<ProblemArea[]> {
  // Fetch all flares for user (both active and resolved)
  // Story 3.1 includes both active and resolved flares for complete frequency picture
  const allFlares = await db.flares.where({ userId }).toArray();

  // Filter by time range
  const flaresInRange = allFlares.filter((f) => withinTimeRange(f, timeRange));

  if (flaresInRange.length === 0) {
    return [];
  }

  // Group flares by body region
  const regionCounts = new Map<string, number>();
  flaresInRange.forEach((flare) => {
    const count = regionCounts.get(flare.bodyRegionId) || 0;
    regionCounts.set(flare.bodyRegionId, count + 1);
  });

  // Calculate total and percentages
  const totalFlares = flaresInRange.length;
  const problemAreas: ProblemArea[] = [];

  regionCounts.forEach((count, bodyRegionId) => {
    // Only include regions with 3+ flares (minimum threshold per AC3.1.2)
    if (count >= 3) {
      problemAreas.push({
        bodyRegionId,
        flareCount: count,
        percentage: (count / totalFlares) * 100,
      });
    }
  });

  // Sort by count descending (highest frequency first)
  problemAreas.sort((a, b) => b.flareCount - a.flareCount);

  return problemAreas;
}

/**
 * Fetches all flares for a specific body region with computed metrics.
 * Returns flares sorted by startDate descending (most recent first).
 *
 * Story 3.2 - Task 1: AC3.2.2, AC3.2.4
 * - Queries flares by userId and bodyRegionId
 * - Calculates duration in days
 * - Extracts peak severity from flare events
 * - Extracts trend outcome from most recent status update
 *
 * @param userId - User ID for multi-user isolation
 * @param regionId - Body region ID to filter by
 * @returns Promise resolving to array of RegionFlareHistory objects sorted by startDate descending
 */
export async function getFlaresByRegion(
  userId: string,
  regionId: string
): Promise<RegionFlareHistory[]> {
  // Fetch all flares for this region (Task 1.4)
  const flares = await db.flares
    .where({ userId, bodyRegionId: regionId })
    .toArray();

  // Sort by startDate descending (Task 1.5)
  flares.sort((a, b) => b.startDate - a.startDate);

  // Compute derived fields for each flare
  const now = Date.now();
  const regionFlares: RegionFlareHistory[] = [];

  for (const flare of flares) {
    // Task 1.6: Calculate duration in days
    const endTime = flare.endDate || now;
    const durationMs = endTime - flare.startDate;
    const duration = Math.round(durationMs / (24 * 60 * 60 * 1000));

    // Task 1.7: Get peak severity from flare events
    const events = await db.flareEvents
      .where({ flareId: flare.id })
      .toArray();

    const severityValues = events
      .filter(e => e.severity !== undefined)
      .map(e => e.severity!);
    const peakSeverity = severityValues.length > 0
      ? Math.max(...severityValues)
      : flare.initialSeverity || 0;

    // Task 1.8: Get most recent trend outcome
    const statusUpdates = events
      .filter(e => e.eventType === 'trend_change')
      .sort((a, b) => b.timestamp - a.timestamp);
    const trendOutcome = statusUpdates.length > 0
      ? statusUpdates[0].trend || 'N/A'
      : 'N/A';

    // Task 1.9: Build RegionFlareHistory object
    regionFlares.push({
      flareId: flare.id,
      startDate: flare.startDate,
      endDate: flare.endDate || null,
      duration,
      peakSeverity,
      trendOutcome,
      status: flare.status
    });
  }

  return regionFlares;
}

/**
 * Calculates aggregate statistics for a specific body region.
 *
 * Story 3.2 - Task 2: AC3.2.4
 * - Total flare count
 * - Average duration (resolved flares only)
 * - Average severity (all flares)
 * - Recurrence rate (flares per 90 days)
 *
 * @param userId - User ID for multi-user isolation
 * @param regionId - Body region ID to analyze
 * @returns Promise resolving to RegionStatistics object
 */
export async function getRegionStatistics(
  userId: string,
  regionId: string
): Promise<RegionStatistics> {
  // Task 2.3: Fetch all flares for region using getFlaresByRegion
  const flares = await getFlaresByRegion(userId, regionId);

  // Handle empty state
  if (flares.length === 0) {
    return {
      totalCount: 0,
      averageDuration: null,
      averageSeverity: null,
      recurrenceRate: 'No data'
    };
  }

  // Task 2.4: Total count
  const totalCount = flares.length;

  // Task 2.5: Average duration (resolved flares only)
  const resolvedFlares = flares.filter(f => f.status === 'resolved');
  const averageDuration = resolvedFlares.length > 0
    ? resolvedFlares.reduce((sum, f) => sum + f.duration, 0) / resolvedFlares.length
    : null;

  // Task 2.6: Average severity
  const averageSeverity = flares.reduce((sum, f) => sum + f.peakSeverity, 0) / totalCount;

  // Task 2.7: Recurrence rate (flares per 90 days)
  let recurrenceRate: number | string;
  if (flares.length >= 2) {
    const earliestFlare = flares[flares.length - 1]; // already sorted descending
    const daysSinceFirst = (Date.now() - earliestFlare.startDate) / (24 * 60 * 60 * 1000);
    recurrenceRate = (totalCount / daysSinceFirst) * 90;
  } else {
    recurrenceRate = 'Insufficient data';
  }

  // Task 2.8: Return RegionStatistics object
  return {
    totalCount,
    averageDuration: averageDuration !== null ? Math.round(averageDuration * 10) / 10 : null,
    averageSeverity: Math.round(averageSeverity * 10) / 10,
    recurrenceRate: typeof recurrenceRate === 'number'
      ? Math.round(recurrenceRate * 10) / 10
      : recurrenceRate
  };
}

/**
 * Calculates duration metrics from resolved flares within a time range.
 * Returns statistical summaries: average, median, shortest, longest durations.
 *
 * Story 3.3 - Task 1: AC3.3.2
 * - Fetches only resolved flares (status === 'resolved')
 * - Filters by time range using withinTimeRange utility
 * - Calculates duration in days for each flare
 * - Computes average (mean), median (50th percentile), min, max
 * - Returns null for metrics if no resolved flares exist
 *
 * @param userId - User ID for multi-user isolation
 * @param timeRange - Time range to filter flares
 * @returns Promise resolving to DurationMetrics object
 */
export async function getDurationMetrics(
  userId: string,
  timeRange: TimeRange
): Promise<DurationMetrics> {
  // Fetch only resolved flares (Task 1.5)
  const allFlares = await db.flares.where({ userId, status: 'resolved' }).toArray();

  // Filter by time range
  const flaresInRange = allFlares.filter(f => withinTimeRange(f, timeRange));

  // Handle empty state - no resolved flares
  if (flaresInRange.length === 0) {
    return {
      averageDuration: null,
      medianDuration: null,
      shortestDuration: null,
      longestDuration: null,
      resolvedFlareCount: 0
    };
  }

  // Task 1.6: Calculate duration in days for each resolved flare
  const durations = flaresInRange.map(flare => {
    const durationMs = (flare.endDate! - flare.startDate);
    return Math.round(durationMs / (24 * 60 * 60 * 1000));
  });

  // Task 1.7: Calculate average duration (mean)
  const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

  // Task 1.8: Calculate median duration
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedDurations.length / 2);
  const medianDuration = sortedDurations.length % 2 === 0
    ? (sortedDurations[midIndex - 1] + sortedDurations[midIndex]) / 2
    : sortedDurations[midIndex];

  // Task 1.9: Calculate shortest duration (minimum)
  const shortestDuration = Math.min(...durations);

  // Task 1.10: Calculate longest duration (maximum)
  const longestDuration = Math.max(...durations);

  // Task 1.11: Return DurationMetrics object with rounded values
  return {
    averageDuration: Math.round(averageDuration * 10) / 10,
    medianDuration: Math.round(medianDuration * 10) / 10,
    shortestDuration,
    longestDuration,
    resolvedFlareCount: flaresInRange.length
  };
}

/**
 * Calculates severity metrics from all flares within a time range.
 * Returns average peak severity and trend distribution percentages.
 *
 * Story 3.3 - Task 1: AC3.3.3
 * - Fetches all flares (active and resolved)
 * - Filters by time range using withinTimeRange utility
 * - Extracts peak severity from flareEvents (max severity value)
 * - Extracts most recent trend from flareEvents (eventType === 'trend_change')
 * - Calculates average peak severity and trend distribution percentages
 * - Returns null for metrics if no flares exist
 *
 * @param userId - User ID for multi-user isolation
 * @param timeRange - Time range to filter flares
 * @returns Promise resolving to SeverityMetrics object
 */
export async function getSeverityMetrics(
  userId: string,
  timeRange: TimeRange
): Promise<SeverityMetrics> {
  // Task 1.13: Fetch all flares (active and resolved)
  const allFlares = await db.flares.where({ userId }).toArray();

  // Filter by time range
  const flaresInRange = allFlares.filter(f => withinTimeRange(f, timeRange));

  // Handle empty state - no flares
  if (flaresInRange.length === 0) {
    return {
      averagePeakSeverity: null,
      trendDistribution: {
        improving: 0,
        stable: 0,
        worsening: 0,
        noData: 0
      },
      totalFlareCount: 0
    };
  }

  // Calculate peak severity and trend for each flare
  const peakSeverities: number[] = [];
  const trends: string[] = [];

  for (const flare of flaresInRange) {
    // Task 1.14: Get peak severity from flareEvents table
    const events = await db.flareEvents
      .where({ flareId: flare.id })
      .toArray();

    const severityValues = events
      .filter(e => e.severity !== undefined)
      .map(e => e.severity!);
    const peakSeverity = severityValues.length > 0
      ? Math.max(...severityValues)
      : flare.initialSeverity || 0;

    peakSeverities.push(peakSeverity);

    // Task 1.16: Get most recent trend from flareEvents (eventType === 'trend_change')
    const trendEvents = events
      .filter(e => e.eventType === 'trend_change')
      .sort((a, b) => b.timestamp - a.timestamp);
    const trend = trendEvents.length > 0
      ? trendEvents[0].trend || 'N/A'
      : 'N/A';

    trends.push(trend);
  }

  // Task 1.15: Calculate average peak severity
  const averagePeakSeverity = peakSeverities.reduce((sum, s) => sum + s, 0) / peakSeverities.length;

  // Task 1.17: Calculate trend distribution (count by category, convert to percentages)
  const trendCounts = {
    improving: trends.filter(t => t === 'improving').length,
    stable: trends.filter(t => t === 'stable').length,
    worsening: trends.filter(t => t === 'worsening').length,
    noData: trends.filter(t => t === 'N/A').length
  };

  const totalFlares = flaresInRange.length;
  const trendDistribution = {
    improving: Math.round((trendCounts.improving / totalFlares) * 1000) / 10,
    stable: Math.round((trendCounts.stable / totalFlares) * 1000) / 10,
    worsening: Math.round((trendCounts.worsening / totalFlares) * 1000) / 10,
    noData: Math.round((trendCounts.noData / totalFlares) * 1000) / 10
  };

  // Task 1.18: Return SeverityMetrics object
  return {
    averagePeakSeverity: Math.round(averagePeakSeverity * 10) / 10,
    trendDistribution,
    totalFlareCount: totalFlares
  };
}

/**
 * Calculates monthly trend data with linear regression analysis.
 * Returns flare frequency and average severity grouped by month.
 *
 * Story 3.4 - Task 1: AC3.4.2, AC3.4.3, AC3.4.4
 * - Fetches all flares (active and resolved)
 * - Filters by time range using withinTimeRange utility
 * - Groups flares by month using startDate (format: YYYY-MM)
 * - Calculates flare count and average peak severity per month
 * - Performs linear regression on monthly flare counts
 * - Determines trend direction based on slope thresholds
 * - Returns null for metrics if insufficient data (< 3 months)
 *
 * @param userId - User ID for multi-user isolation
 * @param timeRange - Time range to filter flares
 * @returns Promise resolving to TrendAnalysis object
 */
export async function getMonthlyTrendData(
  userId: string,
  timeRange: TimeRange
): Promise<TrendAnalysis> {
  // Task 1.4: Query all flares (active and resolved) within time range
  const allFlares = await db.flares.where({ userId }).toArray();
  const flaresInRange = allFlares.filter(f => withinTimeRange(f, timeRange));

  // Handle empty state - no flares
  if (flaresInRange.length === 0) {
    return {
      dataPoints: [],
      trendLine: { slope: 0, intercept: 0 },
      trendDirection: 'insufficient-data'
    };
  }

  // Task 1.5: Group flares by month using startDate (format: YYYY-MM)
  const monthlyBuckets = new Map<string, FlareRecord[]>();

  for (const flare of flaresInRange) {
    const date = new Date(flare.startDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyBuckets.has(monthKey)) {
      monthlyBuckets.set(monthKey, []);
    }
    monthlyBuckets.get(monthKey)!.push(flare);
  }

  // Task 1.6: For each month bucket, calculate flare count and average peak severity
  const dataPoints: TrendDataPoint[] = [];

  for (const [monthKey, flares] of monthlyBuckets.entries()) {
    const flareCount = flares.length;

    // Calculate average peak severity from flareEvents table
    const severities: number[] = [];

    for (const flare of flares) {
      const events = await db.flareEvents
        .where({ flareId: flare.id })
        .toArray();

      const severityValues = events
        .filter(e => e.severity !== undefined)
        .map(e => e.severity!);

      const peakSeverity = severityValues.length > 0
        ? Math.max(...severityValues)
        : flare.initialSeverity || 0;

      if (peakSeverity > 0) {
        severities.push(peakSeverity);
      }
    }

    const averageSeverity = severities.length > 0
      ? severities.reduce((sum, s) => sum + s, 0) / severities.length
      : null;

    // Create timestamp for first day of month at midnight UTC
    const [year, month] = monthKey.split('-').map(Number);
    const monthTimestamp = Date.UTC(year, month - 1, 1);

    dataPoints.push({
      month: monthKey,
      monthTimestamp,
      flareCount,
      averageSeverity: averageSeverity !== null
        ? Math.round(averageSeverity * 10) / 10
        : null
    });
  }

  // Task 1.7: Sort month buckets chronologically (oldest to newest)
  dataPoints.sort((a, b) => a.monthTimestamp - b.monthTimestamp);

  // Task 1.9: Determine trend direction - check for minimum 3 months
  if (dataPoints.length < 3) {
    return {
      dataPoints,
      trendLine: { slope: 0, intercept: 0 },
      trendDirection: 'insufficient-data'
    };
  }

  // Task 1.8: Calculate linear regression trend line using least squares method
  const regressionPoints = dataPoints.map((dp, index) => ({
    x: index, // Use index as x-coordinate (0, 1, 2, ...)
    y: dp.flareCount
  }));

  const regression = calculateLinearRegression(regressionPoints);

  // Task 1.9: Determine trend direction based on slope thresholds
  // improving: slope < -0.3 (flare count decreasing)
  // declining: slope > 0.3 (flare count increasing)
  // stable: between -0.3 and 0.3
  let trendDirection: 'improving' | 'stable' | 'declining' | 'insufficient-data';

  if (regression.slope < -0.3) {
    trendDirection = 'improving';
  } else if (regression.slope > 0.3) {
    trendDirection = 'declining';
  } else {
    trendDirection = 'stable';
  }

  // Task 1.10: Return TrendAnalysis object with data points and trend metadata
  return {
    dataPoints,
    trendLine: {
      slope: regression.slope,
      intercept: regression.intercept
    },
    trendDirection
  };
}

/**
 * Repository object exposing analytics data access methods.
 */
export const analyticsRepository = {
  getProblemAreas,
  getFlaresByRegion,
  getRegionStatistics,
  getDurationMetrics,
  getSeverityMetrics,
  getMonthlyTrendData,
};
