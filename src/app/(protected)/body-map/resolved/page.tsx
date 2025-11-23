"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ResolvedFlareCard } from "@/components/flares/ResolvedFlareCard";
import { ResolvedFlaresFilters } from "@/components/flares/ResolvedFlaresFilters";
import { ResolvedFlaresEmptyState } from "@/components/flares/ResolvedFlaresEmptyState";
import { bodyMarkerRepository } from "@/lib/repositories/bodyMarkerRepository";
import { BodyMarkerRecord } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

type SortBy = 'resolutionDate' | 'duration' | 'peakSeverity';
type SortOrder = 'asc' | 'desc';

/**
 * Resolved Flares Archive Page (Story 2.8)
 * Displays list of all resolved flares with filtering and sorting capabilities
 * AC2.8.1: Page at /flares/resolved with ResolvedFlareCard grid layout
 * AC2.8.3: Sortable by resolution date, duration, peak severity
 */
export default function ResolvedFlaresPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();

  // State for resolved flares data
  const [resolvedFlares, setResolvedFlares] = useState<BodyMarkerRecord[]>([]);
  const [filteredFlares, setFilteredFlares] = useState<BodyMarkerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Sort state (AC2.8.3)
  const [sortBy, setSortBy] = useState<SortBy>('resolutionDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Peak severity cache for sorting
  const [peakSeverities, setPeakSeverities] = useState<Record<string, number>>({});

  // Load sort preference from localStorage (AC2.8.3: persist sort state)
  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(`resolved-flares-sort-${userId}`);
    if (saved) {
      try {
        const { by, order } = JSON.parse(saved);
        setSortBy(by);
        setSortOrder(order);
      } catch (error) {
        console.error('Failed to parse saved sort preference:', error);
      }
    }
  }, [userId]);

  // Save sort preference to localStorage (AC2.8.3)
  useEffect(() => {
    if (!userId) return;

    localStorage.setItem(
      `resolved-flares-sort-${userId}`,
      JSON.stringify({ by: sortBy, order: sortOrder })
    );
  }, [sortBy, sortOrder, userId]);

  // Fetch resolved flares (AC2.8.1: use flareRepository.getResolvedFlares)
  useEffect(() => {
    if (!userId) return;

    const fetchResolvedFlares = async () => {
      try {
        setIsLoading(true);
        const flares = await bodyMarkerRepository.getResolvedMarkers(userId, 'flare');
        setResolvedFlares(flares);
        setFilteredFlares(flares);

        // Fetch peak severities for all flares for sorting
        const severities: Record<string, number> = {};
        await Promise.all(
          flares.map(async (flare: BodyMarkerRecord) => {
            const history = await bodyMarkerRepository.getMarkerHistory(userId, flare.id);
            const severityValues = history
              .map(e => e.severity)
              .filter((s): s is number => s != null);
            severities[flare.id] = severityValues.length > 0
              ? Math.max(...severityValues)
              : flare.currentSeverity;
          })
        );
        setPeakSeverities(severities);

        setError(null);
      } catch (err) {
        console.error('Failed to fetch resolved flares:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch resolved flares'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResolvedFlares();

    // Poll for updates every 10 seconds (AC2.8.7: real-time count updates)
    const interval = setInterval(fetchResolvedFlares, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  // Sort flares (AC2.8.3: sort by resolution date, duration, or peak severity)
  const sortedFlares = useMemo(() => {
    const flares = [...filteredFlares];

    flares.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'resolutionDate':
          // AC2.8.3: Default sort by resolution date descending
          comparison = (a.endDate || 0) - (b.endDate || 0);
          break;

        case 'duration':
          // Sort by total duration (endDate - startDate)
          const durationA = (a.endDate || 0) - a.startDate;
          const durationB = (b.endDate || 0) - b.startDate;
          comparison = durationA - durationB;
          break;

        case 'peakSeverity':
          // Sort by peak severity from cached values
          const severityA = peakSeverities[a.id] || a.currentSeverity;
          const severityB = peakSeverities[b.id] || b.currentSeverity;
          comparison = severityA - severityB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return flares;
  }, [filteredFlares, sortBy, sortOrder, peakSeverities]);

  // Handle flare card click (AC2.8.4: navigate to detail page)
  const handleFlareClick = useCallback((flareId: string) => {
    router.push(`/flares/${flareId}`);
  }, [router]);

  // Handle filter change
  const handleFilterChange = useCallback((filtered: BodyMarkerRecord[]) => {
    setFilteredFlares(filtered);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilteredFlares(resolvedFlares);
  }, [resolvedFlares]);

  // Determine if filters are active
  const hasFilters = filteredFlares.length !== resolvedFlares.length;

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [by, order] = e.target.value.split('-') as [SortBy, SortOrder];
    setSortBy(by);
    setSortOrder(order);
  };

  // Loading state (AC2.8.1: skeleton cards during fetch)
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Resolved Flares</h1>
          <p className="text-muted-foreground">Loading your resolved flares...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-lg animate-pulse"
              aria-label="Loading flare card"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state (AC2.8.1: error message with retry)
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error loading resolved flares</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with count badge (AC2.8.1, AC2.8.7) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-3xl font-bold text-foreground mb-2"
            aria-label={`${resolvedFlares.length} resolved flares`}
          >
            Resolved Flares ({resolvedFlares.length})
          </h1>
          <p className="text-muted-foreground">
            {resolvedFlares.length === 0
              ? "No resolved flares yet"
              : "Review your flare history and patterns"
            }
          </p>
        </div>

        {/* Sort dropdown (AC2.8.3) */}
        {sortedFlares.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm font-medium text-foreground">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Sort resolved flares"
            >
              <option value="resolutionDate-desc">Most Recent</option>
              <option value="resolutionDate-asc">Oldest First</option>
              <option value="duration-desc">Longest Duration</option>
              <option value="duration-asc">Shortest Duration</option>
              <option value="peakSeverity-desc">Highest Severity</option>
              <option value="peakSeverity-asc">Lowest Severity</option>
            </select>
          </div>
        )}
      </div>

      {/* Filters (AC2.8.5) */}
      {resolvedFlares.length > 0 && (
        <ResolvedFlaresFilters
          flares={resolvedFlares}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Flare cards or empty state */}
      {sortedFlares.length === 0 ? (
        <ResolvedFlaresEmptyState
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Resolved flares list"
        >
          {sortedFlares.map((flare) => (
            <ResolvedFlareCard
              key={flare.id}
              flare={flare}
              userId={userId}
              onFlareClick={handleFlareClick}
            />
          ))}
        </div>
      )}

      {/* Filtered results count (AC2.8.5) */}
      {hasFilters && sortedFlares.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Showing {filteredFlares.length} of {resolvedFlares.length} resolved flares
        </div>
      )}
    </div>
  );
}
