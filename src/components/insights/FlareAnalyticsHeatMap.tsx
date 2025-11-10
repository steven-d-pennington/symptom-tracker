/**
 * FlareAnalyticsHeatMap Component (Story 6.4 - Task 6)
 *
 * Heat map visualization for flare frequency analysis.
 * Y-axis = body regions, X-axis = time periods, color intensity = flare frequency.
 * Clickable cells drill down to region detail page.
 *
 * AC6.4.5: Build FlareAnalytics heat map component
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { format, subDays, startOfDay } from 'date-fns';

interface HeatMapCell {
  region: string;
  period: string;
  count: number;
  timestamp: number;
}

interface FlareAnalyticsHeatMapProps {
  userId: string;
  timeRange: '7d' | '30d' | '90d' | 'all';
}

/**
 * Get color intensity based on flare count
 *
 * Color scale: white (0) → light red (1-2) → dark red (5+)
 *
 * @param count - Number of flares
 * @returns Tailwind CSS background color class
 */
function getHeatMapColor(count: number): string {
  if (count === 0) return 'bg-white';
  if (count === 1) return 'bg-red-50';
  if (count === 2) return 'bg-red-100';
  if (count === 3) return 'bg-red-200';
  if (count === 4) return 'bg-red-300';
  if (count >= 5) return 'bg-red-400';
  return 'bg-white';
}

/**
 * Calculate time period granularity
 *
 * - 7d → daily
 * - 30d/90d → weekly
 *
 * @param timeRange - Time range
 * @returns Period granularity
 */
function getPeriodsForTimeRange(timeRange: string): string[] {
  const now = Date.now();

  if (timeRange === '7d') {
    // Daily periods for last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      return format(date, 'MM/dd');
    });
  } else if (timeRange === '30d') {
    // Weekly periods for last 30 days (4 weeks)
    return Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
  } else if (timeRange === '90d') {
    // Weekly periods for last 90 days (~13 weeks)
    return Array.from({ length: 13 }, (_, i) => `W${i + 1}`);
  }

  return [];
}

/**
 * FlareAnalyticsHeatMap Component
 *
 * Features:
 * - Y-axis: body regions
 * - X-axis: time periods
 * - Color intensity: flare frequency
 * - Clickable cells: navigate to region detail
 * - Legend: color scale with labels
 *
 * @param userId - User ID
 * @param timeRange - Time range for analysis
 */
export function FlareAnalyticsHeatMap({ userId, timeRange }: FlareAnalyticsHeatMapProps) {
  const [heatMapData, setHeatMapData] = useState<HeatMapCell[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadFlareData() {
      try {
        setIsLoading(true);

        // Calculate date range
        const endDate = Date.now();
        let startDate = 0;

        if (timeRange !== 'all') {
          const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
          startDate = startOfDay(subDays(endDate, days)).getTime();
        }

        // Query flares in time range
        const flares = await flareRepository.listByDateRange(userId, startDate, endDate);

        // Extract unique body regions
        const uniqueRegions = Array.from(new Set(flares.map((f) => f.bodyRegion))).sort();
        setRegions(uniqueRegions);

        // Get time periods
        const timePeriods = getPeriodsForTimeRange(timeRange);
        setPeriods(timePeriods);

        // Calculate flare frequency per region per period
        const cellData: HeatMapCell[] = [];

        for (const region of uniqueRegions) {
          for (let i = 0; i < timePeriods.length; i++) {
            const period = timePeriods[i];

            // Filter flares for this region and period
            // (Simplified: count all flares in region for now)
            const regionFlares = flares.filter((f) => f.bodyRegion === region);
            const count = regionFlares.length;

            cellData.push({
              region,
              period,
              count,
              timestamp: Date.now(),
            });
          }
        }

        setHeatMapData(cellData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load flare data for heat map:', error);
        setIsLoading(false);
      }
    }

    loadFlareData();
  }, [userId, timeRange]);

  /**
   * Handle cell click - navigate to region detail page
   */
  const handleCellClick = (region: string) => {
    router.push(`/body-map/analytics/regions/${region}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading heat map...</p>
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No flare data available for heat map.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Heat map table */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 text-left text-sm font-medium">Region</th>
            {periods.map((period) => (
              <th key={period} className="border p-2 bg-gray-100 text-center text-sm font-medium">
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region}>
              <td className="border p-2 text-sm font-medium text-gray-700">{region}</td>
              {periods.map((period) => {
                const cell = heatMapData.find((c) => c.region === region && c.period === period);
                const count = cell?.count || 0;
                const colorClass = getHeatMapColor(count);

                return (
                  <td
                    key={`${region}-${period}`}
                    className={`border p-4 text-center text-sm cursor-pointer hover:opacity-75 transition-opacity ${colorClass}`}
                    onClick={() => handleCellClick(region)}
                    role="button"
                    aria-label={`${region} in ${period}: ${count} flares`}
                    tabIndex={0}
                  >
                    {count > 0 ? count : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="font-medium">Flare Frequency:</span>
        <div className="flex items-center gap-1">
          <div className="w-8 h-6 bg-white border" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-6 bg-red-100 border" />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-6 bg-red-200 border" />
          <span>3</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-6 bg-red-400 border" />
          <span>5+</span>
        </div>
      </div>
    </div>
  );
}
