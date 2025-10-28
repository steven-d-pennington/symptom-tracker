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
