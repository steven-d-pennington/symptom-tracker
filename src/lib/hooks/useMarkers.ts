'use client';

import { useEffect, useState, useCallback } from 'react';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { ActiveFlare } from '@/lib/types/flare';
import { BodyMarkerRecord, BodyMarkerEventRecord, MarkerType } from '@/lib/db/schema';

interface UseMarkersOptions {
  userId: string;
  type?: MarkerType; // Filter by marker type (flare, pain, inflammation)
  includeResolved?: boolean;
  status?: 'active' | 'resolved' | ('active' | 'resolved')[];
  bodyRegionId?: string;
}

type MarkerTrend = 'worsening' | 'stable' | 'improving';

/**
 * Calculate trend based on marker event history
 * Compares recent severity changes to determine if marker is improving/worsening/stable
 */
function calculateTrend(marker: BodyMarkerRecord, events: BodyMarkerEventRecord[]): MarkerTrend {
  // Filter to severity-related events only
  const severityEvents = events.filter(
    e => e.severity !== undefined && (e.eventType === 'created' || e.eventType === 'severity_update')
  ).sort((a, b) => a.timestamp - b.timestamp); // Chronological order

  if (severityEvents.length < 2) {
    return 'stable'; // Not enough data to determine trend
  }

  // Compare last 2 severity values
  const recent = severityEvents.slice(-2);
  const previousSeverity = recent[0].severity!;
  const currentSeverity = recent[1].severity!;

  const change = currentSeverity - previousSeverity;

  if (change > 0) return 'worsening'; // Severity increased
  if (change < 0) return 'improving'; // Severity decreased
  return 'stable'; // No change
}

/**
 * Hook to fetch and subscribe to unified marker data (flares, pain, inflammation)
 * Replaces useFlares with unified marker system
 *
 * @param options - Configuration for marker query
 * @returns Marker data with loading/error states
 */
export function useMarkers(options: UseMarkersOptions) {
  const { userId, type, includeResolved = false, status, bodyRegionId } = options;
  const [data, setData] = useState<Array<ActiveFlare & { trend: MarkerTrend }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchMarkers = async () => {
      try {
        setIsLoading(true);

        // Fetch markers based on status
        let markerRecords: BodyMarkerRecord[] = [];

        // Check if we should fetch resolved markers
        const shouldFetchResolved = status === 'resolved' ||
          (includeResolved && status && (
            Array.isArray(status) ? status.includes('resolved' as any) : (status as string) === 'resolved'
          ));

        if (shouldFetchResolved) {
          // Fetch resolved markers
          markerRecords = await bodyMarkerRepository.getResolvedMarkers(userId, type);
        } else {
          // Fetch active markers
          markerRecords = await bodyMarkerRepository.getActiveMarkers(userId, type);
        }

        // Fetch event history for each marker and calculate trends
        const markersWithTrends = await Promise.all(
          markerRecords.map(async (marker) => {
            const events = await bodyMarkerRepository.getMarkerHistory(userId, marker.id);
            const trend = calculateTrend(marker, events);

            // Load body locations for multi-location markers
            const locations = await bodyMarkerRepository.getMarkerLocations(marker.id);

            // Convert to ActiveFlare format for backward compatibility
            return {
              id: marker.id,
              userId: marker.userId,
              symptomName: marker.bodyRegionId, // Use bodyRegionId as symptomName
              bodyRegions: locations.length > 0
                ? Array.from(new Set(locations.map(loc => loc.bodyRegionId)))
                : [marker.bodyRegionId],
              severity: marker.currentSeverity,
              status: marker.status as ActiveFlare['status'],
              startDate: new Date(marker.startDate),
              coordinates: locations.length > 0
                ? locations.map(loc => ({
                    locationId: loc.id,
                    regionId: loc.bodyRegionId,
                    x: loc.coordinates.x,
                    y: loc.coordinates.y,
                  }))
                : marker.coordinates ? [{
                    locationId: `${marker.id}-single`,
                    regionId: marker.bodyRegionId,
                    x: marker.coordinates.x,
                    y: marker.coordinates.y,
                  }] : undefined,
              trend,
              // Add marker type for unified system (not in ActiveFlare interface but useful)
              markerType: marker.type,
            } as ActiveFlare & { trend: MarkerTrend; markerType?: MarkerType };
          })
        );

        // Apply filters
        let filtered = markersWithTrends;

        // Filter by includeResolved
        if (!includeResolved) {
          filtered = filtered.filter(f => f.status !== 'resolved');
        }

        // Filter by status if specified
        if (status) {
          const statusArray: ('active' | 'resolved')[] = Array.isArray(status) ? status : [status];
          filtered = filtered.filter(f => statusArray.includes(f.status as 'active' | 'resolved'));
        }

        // Filter by bodyRegionId if specified
        if (bodyRegionId) {
          filtered = filtered.filter(f => f.bodyRegions.includes(bodyRegionId));
        }

        if (mounted) {
          setData(filtered);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch markers'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMarkers();

    return () => {
      mounted = false;
    };
  }, [userId, type, includeResolved, status, bodyRegionId, refreshTrigger]);

  // Manual refetch function
  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    refetch,
  };
}
