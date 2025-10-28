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
