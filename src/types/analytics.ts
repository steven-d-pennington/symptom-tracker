/**
 * Analytics Types (Story 3.1)
 *
 * Type definitions for flare analytics features.
 * Supports problem areas analysis and time-range filtering.
 */

/**
 * Time range options for analytics queries.
 * - last30d: Last 30 days
 * - last90d: Last 90 days
 * - lastYear: Last year (365 days)
 * - allTime: All time (no time limit)
 */
export type TimeRange = 'last30d' | 'last90d' | 'lastYear' | 'allTime';

/**
 * Problem area represents a body region with flare frequency metrics.
 * Used for identifying high-frequency flare locations.
 */
export interface ProblemArea {
  /** Body region ID (foreign key to bodyRegions) */
  bodyRegionId: string;

  /** Total number of flares in this region within the time range */
  flareCount: number;

  /** Percentage of total flares (0-100, calculated as regionCount/totalFlares * 100) */
  percentage: number;
}

/**
 * Flare metrics for analytics dashboard.
 * Future interface for Stories 3.3-3.5.
 */
export interface FlareMetrics {
  /** Average duration of flares in milliseconds */
  averageDuration: number;

  /** Average severity across all flares (1-10 scale) */
  averageSeverity: number;

  /** Total number of flares in time range */
  totalFlares: number;

  /** Time range for these metrics */
  timeRange: TimeRange;
}

/**
 * Region flare history interface (Story 3.2 - Task 1.2)
 * Represents a single flare with computed metrics for region detail view.
 */
export interface RegionFlareHistory {
  /** Flare ID (foreign key to flares table) */
  flareId: string;

  /** Start date timestamp (epoch ms) */
  startDate: number;

  /** End date timestamp (epoch ms) - null if active */
  endDate: number | null;

  /** Duration in days (calculated from startDate to endDate or now) */
  duration: number;

  /** Peak severity (highest severity from flare events, 1-10 scale) */
  peakSeverity: number;

  /** Trend outcome (final trend from most recent status_update event) */
  trendOutcome: string;

  /** Flare status (active or resolved) */
  status: string;
}

/**
 * Region statistics interface (Story 3.2 - Task 2.2)
 * Aggregate metrics for a specific body region.
 */
export interface RegionStatistics {
  /** Total flare count for region (all-time) */
  totalCount: number;

  /** Average duration in days (resolved flares only) - null if no resolved flares */
  averageDuration: number | null;

  /** Average severity (mean of all peak severity values) - null if no flares */
  averageSeverity: number | null;

  /** Recurrence rate (flares per 90 days) - string for "Insufficient data" case */
  recurrenceRate: number | string;
}

/**
 * Duration metrics interface (Story 3.3 - Task 1.2)
 * Statistical summaries of flare duration across resolved flares.
 */
export interface DurationMetrics {
  /** Average duration in days (mean of all resolved flares) - null if no resolved flares */
  averageDuration: number | null;

  /** Median duration in days (50th percentile) - null if no resolved flares */
  medianDuration: number | null;

  /** Shortest duration in days (minimum from resolved flares) - null if no resolved flares */
  shortestDuration: number | null;

  /** Longest duration in days (maximum from resolved flares) - null if no resolved flares */
  longestDuration: number | null;

  /** Total count of resolved flares used for calculations */
  resolvedFlareCount: number;
}

/**
 * Severity metrics interface (Story 3.3 - Task 1.3)
 * Statistical summaries of flare severity and trend outcomes.
 */
export interface SeverityMetrics {
  /** Average peak severity (mean of all peak severity values) - null if no flares */
  averagePeakSeverity: number | null;

  /** Trend distribution showing percentage breakdown by trend category */
  trendDistribution: {
    /** Percentage of flares with improving trend */
    improving: number;
    /** Percentage of flares with stable trend */
    stable: number;
    /** Percentage of flares with worsening trend */
    worsening: number;
    /** Percentage of flares with no trend data */
    noData: number;
  };

  /** Total count of flares (active and resolved) used for calculations */
  totalFlareCount: number;
}

/**
 * Trend data point interface (Story 3.4 - Task 1.1)
 * Represents flare metrics for a single month bucket in trend analysis.
 */
export interface TrendDataPoint {
  /** Month in YYYY-MM format (e.g., "2024-01") */
  month: string;

  /** Timestamp (epoch ms) for first day of month at midnight UTC */
  monthTimestamp: number;

  /** Count of flares that started in this month */
  flareCount: number;

  /** Average peak severity across all flares in this month - null if no flares */
  averageSeverity: number | null;
}

/**
 * Trend analysis interface (Story 3.4 - Task 1.2)
 * Contains monthly trend data with linear regression analysis.
 */
export interface TrendAnalysis {
  /** Array of monthly data points sorted chronologically (oldest to newest) */
  dataPoints: TrendDataPoint[];

  /** Linear regression trend line parameters */
  trendLine: {
    /** Slope of trend line (negative = improving, positive = declining) */
    slope: number;
    /** Y-intercept of trend line */
    intercept: number;
  };

  /** Overall trend direction assessment */
  trendDirection: 'improving' | 'stable' | 'declining' | 'insufficient-data';
}
