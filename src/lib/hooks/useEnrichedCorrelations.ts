/**
 * useEnrichedCorrelations Hook
 *
 * Enriches correlation results with human-readable names by looking up IDs
 * from foods, symptoms, triggers, and medications tables.
 *
 * Fixes: Correlation cards showing IDs instead of names
 */

'use client';

import { useState, useEffect } from 'react';
import { CorrelationResult } from '@/types/correlation';
import { db } from '@/lib/db/client';

export interface EnrichedCorrelation extends CorrelationResult {
  item1Name: string;
  item2Name: string;
}

interface UseEnrichedCorrelationsResult {
  correlations: EnrichedCorrelation[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Enriches correlations with item names by looking up IDs in respective tables
 *
 * @param rawCorrelations - Raw correlation results from useCorrelations
 * @param userId - User ID for filtering entities
 * @returns Enriched correlations with item1Name and item2Name
 */
export function useEnrichedCorrelations(
  rawCorrelations: CorrelationResult[],
  userId: string
): UseEnrichedCorrelationsResult {
  const [correlations, setCorrelations] = useState<EnrichedCorrelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function enrichCorrelations() {
      try {
        setIsLoading(true);
        setError(null);

        if (rawCorrelations.length === 0) {
          if (isMounted) {
            setCorrelations([]);
            setIsLoading(false);
          }
          return;
        }

        // Load all entities for name lookup
        const [foods, symptoms, triggers, medications] = await Promise.all([
          db.foods?.where('userId').equals(userId).toArray() || [],
          db.symptoms?.where('userId').equals(userId).toArray() || [],
          db.triggers?.where('userId').equals(userId).toArray() || [],
          db.medications?.where('userId').equals(userId).toArray() || [],
        ]);

        // Create lookup maps: id -> name
        const foodMap = new Map(foods.map((f) => [f.id, f.name]));
        const symptomMap = new Map(symptoms.map((s) => [s.id, s.name]));
        const triggerMap = new Map(triggers.map((t) => [t.id, t.name]));
        const medicationMap = new Map(medications.map((m) => [m.id, m.name]));

        // Enrich each correlation with names
        const enriched = rawCorrelations.map((correlation) => {
          let item1Name = correlation.item1; // Fallback to ID if not found
          let item2Name = correlation.item2; // Fallback to ID if not found

          // Determine item1 type and look up name
          if (correlation.type.includes('food')) {
            item1Name = foodMap.get(correlation.item1) || correlation.item1;
          } else if (correlation.type.includes('trigger')) {
            item1Name = triggerMap.get(correlation.item1) || correlation.item1;
          } else if (correlation.type.includes('medication')) {
            item1Name = medicationMap.get(correlation.item1) || correlation.item1;
          }

          // Determine item2 type and look up name
          if (correlation.type.includes('symptom')) {
            item2Name = symptomMap.get(correlation.item2) || correlation.item2;
          } else if (correlation.type.includes('flare')) {
            // Flares don't have names, use "flare severity" as placeholder
            item2Name = 'Flare Severity';
          }

          return {
            ...correlation,
            item1Name,
            item2Name,
          };
        });

        if (isMounted) {
          setCorrelations(enriched);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to enrich correlations'));
          setIsLoading(false);
        }
      }
    }

    enrichCorrelations();

    return () => {
      isMounted = false;
    };
  }, [rawCorrelations, userId]);

  return { correlations, isLoading, error };
}
