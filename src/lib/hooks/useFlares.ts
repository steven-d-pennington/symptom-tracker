'use client';

import { useEffect, useState } from 'react';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { ActiveFlare } from '@/lib/types/flare';
import { FlareRecord, FlareEventRecord } from '@/lib/db/schema';

interface UseFlaresOptions {
  userId: string;
  includeResolved?: boolean;
  status?: ActiveFlare['status'] | ActiveFlare['status'][];
  bodyRegionId?: string;
}

type FlareTrend = 'worsening' | 'stable' | 'improving';

/**
 * Calculate trend based on flare event history
 * Compares recent severity changes to determine if flare is improving/worsening/stable
 */
function calculateTrend(flare: FlareRecord, events: FlareEventRecord[]): FlareTrend {
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
 * Hook to fetch and subscribe to flare data with real-time updates
 * Polls for updates to keep data fresh
 *
 * Story 2.1: Uses new getActiveFlares + getFlareHistory API
 */
export function useFlares(options: UseFlaresOptions) {
  const { userId, includeResolved = false, status, bodyRegionId } = options;
  const [data, setData] = useState<Array<ActiveFlare & { trend: FlareTrend }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchFlares = async () => {
      try {
        setIsLoading(true);

        // Story 2.1: Use new API - getActiveFlares + getFlareHistory
        const flareRecords = await flareRepository.getActiveFlares(userId);

        // Fetch event history for each flare and calculate trends
        const flaresWithTrends = await Promise.all(
          flareRecords.map(async (flare) => {
            const events = await flareRepository.getFlareHistory(userId, flare.id);
            const trend = calculateTrend(flare, events);

            // Convert FlareRecord to ActiveFlare format for backward compatibility
            return {
              id: flare.id,
              userId: flare.userId,
              symptomName: flare.bodyRegionId, // Legacy field - bodyRegionId serves as symptomName
              bodyRegions: [flare.bodyRegionId], // Wrap in array for legacy compatibility
              severity: flare.currentSeverity,
              status: flare.status as ActiveFlare['status'],
              startDate: new Date(flare.startDate),
              trend,
            } as ActiveFlare & { trend: FlareTrend };
          })
        );

        // Apply filters
        let filtered = flaresWithTrends;

        // Filter by includeResolved
        if (!includeResolved) {
          filtered = filtered.filter(f => f.status !== 'resolved');
        }

        // Filter by status if specified
        if (status) {
          const statusArray = Array.isArray(status) ? status : [status];
          filtered = filtered.filter(f => statusArray.includes(f.status));
        }

        // Filter by bodyRegionId if specified (check if region is in bodyRegions array)
        if (bodyRegionId) {
          filtered = filtered.filter(f => f.bodyRegions.includes(bodyRegionId));
        }

        if (mounted) {
          setData(filtered);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch flares'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchFlares();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchFlares, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId, includeResolved, status, bodyRegionId, refreshTrigger]);

  // Manual refetch function
  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    refetch,
  };
}
