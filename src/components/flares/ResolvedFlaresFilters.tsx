"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BodyMarkerRecord } from "@/lib/db/schema";
import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";

interface ResolvedFlaresFiltersProps {
  flares: BodyMarkerRecord[];
  onFilterChange: (filtered: BodyMarkerRecord[]) => void;
}

/**
 * Filter controls component for Resolved Flares Archive (Story 2.8)
 * Provides body region, date range, and duration filters with URL persistence
 * AC2.8.5: Multi-select regions, date pickers, duration inputs, URL query params
 */
export function ResolvedFlaresFilters({ flares, onFilterChange }: ResolvedFlaresFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filter state from URL query params (AC2.8.5)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [durationMin, setDurationMin] = useState<string>('');
  const [durationMax, setDurationMax] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Load filter panel state from localStorage (AC2.8.5: persist panel state)
  useEffect(() => {
    const savedExpanded = localStorage.getItem('resolved-flares-filters-expanded');
    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === 'true');
    }
  }, []);

  // Parse URL query params on mount (AC2.8.5)
  useEffect(() => {
    const regionParam = searchParams.get('region');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const durationMinParam = searchParams.get('durationMin');
    const durationMaxParam = searchParams.get('durationMax');

    if (regionParam) {
      setSelectedRegions(regionParam.split(','));
    }
    if (dateFromParam) {
      setDateFrom(dateFromParam);
    }
    if (dateToParam) {
      setDateTo(dateToParam);
    }
    if (durationMinParam) {
      setDurationMin(durationMinParam);
    }
    if (durationMaxParam) {
      setDurationMax(durationMaxParam);
    }
  }, [searchParams]);

  // Apply filters whenever filter state updates (AC2.8.5: AND logic)
  useEffect(() => {
    const filtered = flares.filter((flare) => {
      // Body region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(flare.bodyRegionId)) {
        return false;
      }

      // Date range filter on endDate (resolution date)
      if (dateFrom && flare.endDate) {
        const fromTimestamp = new Date(dateFrom).getTime();
        if (flare.endDate < fromTimestamp) {
          return false;
        }
      }
      if (dateTo && flare.endDate) {
        const toTimestamp = new Date(dateTo).getTime() + (24 * 60 * 60 * 1000 - 1); // End of day
        if (flare.endDate > toTimestamp) {
          return false;
        }
      }

      // Duration filter (in days)
      if ((durationMin || durationMax) && flare.endDate) {
        const durationMs = flare.endDate - flare.startDate;
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

        if (durationMin && durationDays < parseInt(durationMin)) {
          return false;
        }
        if (durationMax && durationDays > parseInt(durationMax)) {
          return false;
        }
      }

      return true;
    });

    onFilterChange(filtered);
  }, [flares, selectedRegions, dateFrom, dateTo, durationMin, durationMax, onFilterChange]);

  // Sync filters to URL query params (AC2.8.5)
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedRegions.length > 0) {
      params.set('region', selectedRegions.join(','));
    }
    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params.set('dateTo', dateTo);
    }
    if (durationMin) {
      params.set('durationMin', durationMin);
    }
    if (durationMax) {
      params.set('durationMax', durationMax);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Only update if URL actually changed
    if (newUrl !== window.location.pathname + window.location.search) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedRegions, dateFrom, dateTo, durationMin, durationMax, router]);

  // Build unique list of body regions that have resolved flares (AC2.8.5)
  const uniqueRegions = Array.from(new Set(flares.map(f => f.bodyRegionId)));
  const allRegions = [...FRONT_BODY_REGIONS, ...BACK_BODY_REGIONS];
  const availableRegions = uniqueRegions
    .map(regionId => {
      const region = allRegions.find(r => r.id === regionId);
      return { id: regionId, name: region?.name || regionId };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate active filter count (AC2.8.5)
  const activeFilterCount = [
    selectedRegions.length > 0,
    !!dateFrom,
    !!dateTo,
    !!durationMin,
    !!durationMax
  ].filter(Boolean).length;

  // Clear all filters (AC2.8.5)
  const handleClearFilters = () => {
    setSelectedRegions([]);
    setDateFrom('');
    setDateTo('');
    setDurationMin('');
    setDurationMax('');
    router.replace(window.location.pathname, { scroll: false });
  };

  // Toggle region selection
  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev =>
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  // Toggle filter panel and persist state (AC2.8.5)
  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem('resolved-flares-filters-expanded', newExpanded.toString());
  };

  return (
    <div className="bg-gray-50 rounded-lg mb-6 border border-gray-200">
      {/* Filter header with expand/collapse button */}
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={toggleExpanded}>
        <h2 className="text-lg font-semibold text-foreground">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </h2>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Filter controls (collapsible) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Body region filter (AC2.8.5: multi-select dropdown) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2" htmlFor="region-filter">
                Body Region
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                {availableRegions.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No regions available</div>
                ) : (
                  availableRegions.map((region) => (
                    <label
                      key={region.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region.id)}
                        onChange={() => toggleRegion(region.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                        aria-label={`Filter by ${region.name}`}
                      />
                      <span className="text-sm text-foreground">{region.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Date range filter (AC2.8.5: resolution date start/end) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resolution Date
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="From"
                  aria-label="Resolution date from"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="To"
                  aria-label="Resolution date to"
                />
              </div>
            </div>

            {/* Duration range filter (AC2.8.5: min/max days) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (days)
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Min days"
                  aria-label="Minimum duration in days"
                />
                <input
                  type="number"
                  min="0"
                  value={durationMax}
                  onChange={(e) => setDurationMax(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Max days"
                  aria-label="Maximum duration in days"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
