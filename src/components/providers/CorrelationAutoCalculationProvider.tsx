/**
 * Correlation Auto-Calculation Provider
 *
 * Automatically recalculates correlations on app startup if cache is stale.
 * Runs client-side with access to IndexedDB.
 *
 * Features:
 * - Checks last calculation timestamp on mount
 * - Auto-recalculates if older than 1 hour
 * - Uses debounced scheduling to avoid excessive calculations
 * - Silent background operation (no UI blocking)
 */

'use client';

import { useEffect, useRef } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import {
  scheduleRecalculation,
  getLastCalculated,
  initializeCorrelationService,
} from '@/lib/services/correlationCalculationService';

// Cache TTL: 1 hour (in milliseconds)
const CACHE_TTL = 60 * 60 * 1000;

export function CorrelationAutoCalculationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useCurrentUser();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize correlation service on first mount
    if (!hasInitialized.current) {
      initializeCorrelationService();
      hasInitialized.current = true;
    }

    // Only proceed if we have a valid user ID
    if (!userId) {
      return;
    }

    // Check if correlation cache is stale
    const lastCalculated = getLastCalculated(userId);
    const now = Date.now();

    // Calculate cache age
    if (lastCalculated === null) {
      // Never calculated - schedule first calculation
      console.log('[Correlation Auto-Calc] No previous calculation found. Scheduling first calculation...');
      scheduleRecalculation(userId);
      return;
    }

    const cacheAge = now - lastCalculated;

    if (cacheAge >= CACHE_TTL) {
      // Cache is stale - schedule recalculation
      const ageInMinutes = Math.floor(cacheAge / (60 * 1000));
      console.log(
        `[Correlation Auto-Calc] Cache is stale (${ageInMinutes} minutes old). Scheduling recalculation...`
      );
      scheduleRecalculation(userId);
    } else {
      // Cache is fresh - no action needed
      const remainingMinutes = Math.floor((CACHE_TTL - cacheAge) / (60 * 1000));
      console.log(
        `[Correlation Auto-Calc] Cache is fresh. Next auto-calculation in ${remainingMinutes} minutes.`
      );
    }
  }, [userId]);

  // This provider is purely for side effects - it doesn't render anything
  return <>{children}</>;
}
