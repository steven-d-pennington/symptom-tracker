/**
 * RegionDetailView Component (Story 3.2 - Task 8)
 *
 * Main component for region detail page displaying comprehensive flare history.
 * Uses useRegionAnalytics hook for data fetching with polling.
 *
 * AC3.2.1: Region detail page layout
 * - Page header with body region name
 * - Back button to analytics page
 * - Breadcrumb navigation
 * - Responsive layout (grid on desktop, stack on mobile)
 *
 * AC3.2.2, AC3.2.5, AC3.2.7: Flare list with filtering
 * - Statistics summary card
 * - Filter controls (All/Active/Resolved)
 * - Flare cards sorted by date
 * - Empty state when no flares
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegionAnalytics } from '@/lib/hooks/useRegionAnalytics';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getBodyRegionById } from '@/lib/data/bodyRegions';
import { RegionFlareCard } from './RegionFlareCard';
import { RegionStatisticsCard } from './RegionStatisticsCard';
import { RegionFlareTimeline } from './RegionFlareTimeline';
import { FlareStatusFilter, FlareFilter } from './FlareStatusFilter';
import { RegionEmptyState } from './RegionEmptyState';

interface RegionDetailViewProps {
  /** Body region ID */
  regionId: string;
}

/**
 * RegionDetailView component - displays comprehensive flare history for a specific body region.
 */
export function RegionDetailView({ regionId }: RegionDetailViewProps) {
  const router = useRouter();
  const { userId } = useCurrentUser();

  // Task 8.3: Lookup region name from bodyRegions data
  const region = getBodyRegionById(regionId);
  const regionName = region?.name || regionId;

  // Task 8.4: Use hook for data fetching
  const { flares, statistics, isLoading, error, refetch } = useRegionAnalytics({ userId, regionId });

  // Task 8.5: Initialize filter state
  const [filter, setFilter] = useState<FlareFilter>('all');

  // Task 8.6: Load filter preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`region-filter-${userId}-${regionId}`);
    if (saved && ['all', 'active', 'resolved'].includes(saved)) {
      setFilter(saved as FlareFilter);
    }
  }, [userId, regionId]);

  // Task 8.7: Save filter to localStorage when changed
  useEffect(() => {
    localStorage.setItem(`region-filter-${userId}-${regionId}`, filter);
  }, [filter, userId, regionId]);

  // Task 8.8: Filter flares client-side based on filter state
  const filteredFlares = flares.filter(flare => {
    if (filter === 'active') return flare.status === 'active' || flare.status === 'improving' || flare.status === 'worsening';
    if (filter === 'resolved') return flare.status === 'resolved';
    return true; // 'all'
  });

  // Task 8.9: Calculate filter counts
  const filterCounts = {
    all: flares.length,
    active: flares.filter(f => f.status === 'active' || f.status === 'improving' || f.status === 'worsening').length,
    resolved: flares.filter(f => f.status === 'resolved').length
  };

  // Task 8.16: Handle flare click - navigate to flare detail
  const handleFlareClick = (flareId: string) => {
    router.push(`/flares/${flareId}`);
  };

  // Task 8.17: Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Task 8.18: Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading region data: {error.message}</p>
        <button
          onClick={refetch}
          className="mt-2 text-red-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Task 8.15: Handle empty state
  if (flares.length === 0) {
    return <RegionEmptyState regionName={regionName} />;
  }

  return (
    <div className="space-y-6">
      {/* Task 8.11: Render statistics card */}
      {statistics && <RegionStatisticsCard statistics={statistics} />}

      {/* Task 8.12: Render timeline visualization */}
      <RegionFlareTimeline flares={flares} timeRange="lastYear" />

      {/* Task 8.13: Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">
          Flare History ({filteredFlares.length} {filteredFlares.length === 1 ? 'flare' : 'flares'})
        </h3>
        <FlareStatusFilter
          value={filter}
          onChange={setFilter}
          counts={filterCounts}
        />
      </div>

      {/* Task 8.14: Render flare list */}
      <div className="space-y-3">
        {filteredFlares.map(flare => (
          <RegionFlareCard
            key={flare.flareId}
            flare={flare}
            onClick={handleFlareClick}
          />
        ))}
      </div>

      {/* Show message when filtered list is empty but flares exist */}
      {filteredFlares.length === 0 && flares.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No {filter} flares found. Try a different filter.
        </div>
      )}
    </div>
  );
}
