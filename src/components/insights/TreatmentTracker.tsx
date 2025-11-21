/**
 * TreatmentTracker Component (Story 6.7 - Task 5)
 *
 * Displays list of all tracked treatments with effectiveness scores.
 * AC 6.7.3: Build TreatmentTracker component displaying treatments sorted by effectiveness.
 *
 * Features:
 * - Treatment name and type badge (medication/intervention)
 * - Effectiveness score with color-coded indicator (0-33 red, 34-66 yellow, 67-100 green)
 * - Trend arrow (↑ improving, → stable, ↓ declining)
 * - Confidence level badge (high/medium/low)
 * - Sample size (number of cycles)
 * - Empty state for no treatments
 * - Medical disclaimer banner (collapsible)
 * - Click treatment to open detail modal
 */

'use client';

import { useState, useEffect } from 'react';
import { Pill, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';
import { treatmentEffectivenessRepository } from '../../lib/repositories/treatmentEffectivenessRepository';
import { calculateAllTreatmentEffectiveness } from '../../lib/services/treatmentEffectivenessService';
import type { TreatmentEffectiveness } from '../../types/treatmentEffectiveness';

export interface TreatmentTrackerProps {
  /**
   * User ID
   */
  userId: string;

  /**
   * Time range for analysis
   */
  timeRange?: '7d' | '30d' | '90d';

  /**
   * Callback when treatment card is clicked
   */
  onTreatmentClick?: (treatment: TreatmentEffectiveness) => void;
}

/**
 * Get color classes for effectiveness score
 * - 0-33: Red (low effectiveness)
 * - 34-66: Yellow (moderate effectiveness)
 * - 67-100: Green (high effectiveness)
 */
function getEffectivenessColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 67) {
    return {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-500/50',
    };
  } else if (score >= 34) {
    return {
      bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-500/50',
    };
  } else {
    return {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-500/50',
    };
  }
}

/**
 * Get trend arrow icon component
 */
function getTrendIcon(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    case 'stable':
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
}

/**
 * Get confidence badge color classes
 */
function getConfidenceColor(confidence: 'high' | 'medium' | 'low'): {
  bg: string;
  text: string;
} {
  switch (confidence) {
    case 'high':
      return { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' };
    case 'medium':
      return { bg: 'bg-muted/50', text: 'text-muted-foreground' };
    case 'low':
      return { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400' };
  }
}

/**
 * TreatmentTracker Component
 */
export function TreatmentTracker({
  userId,
  timeRange = '30d',
  onTreatmentClick,
}: TreatmentTrackerProps) {
  const [treatments, setTreatments] = useState<TreatmentEffectiveness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load treatments on mount and when timeRange changes
   */
  useEffect(() => {
    loadTreatments();
  }, [userId, timeRange]);

  /**
   * Load treatment effectiveness data
   */
  async function loadTreatments() {
    try {
      setIsLoading(true);
      setError(null);

      // First try to load from repository (cached data)
      let treatmentData: TreatmentEffectiveness[] = await treatmentEffectivenessRepository.findAll(userId) as any;

      // If no data or data is stale (> 24 hours old), recalculate
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const needsRecalculation =
        treatmentData.length === 0 ||
        treatmentData.some((t) => now - t.lastCalculated > ONE_DAY_MS);

      if (needsRecalculation) {
        console.log('Recalculating treatment effectiveness...');
        const calculated = await calculateAllTreatmentEffectiveness(userId, timeRange);

        // Store calculated results in repository
        for (const treatment of calculated) {
          await treatmentEffectivenessRepository.upsert({
            userId: treatment.userId,
            treatmentId: treatment.treatmentId,
            treatmentType: treatment.treatmentType,
            treatmentName: treatment.treatmentName,
            effectivenessScore: treatment.effectivenessScore,
            trendDirection: treatment.trendDirection,
            sampleSize: treatment.sampleSize,
            confidence: treatment.confidence,
            timeRangeStart: treatment.timeRange.start,
            timeRangeEnd: treatment.timeRange.end,
            lastCalculated: treatment.lastCalculated,
          });
        }

        treatmentData = calculated.map((t) => t);
      }

      // Sort by effectiveness score (highest first) - already done by repository
      setTreatments(treatmentData);
    } catch (err) {
      console.error('Error loading treatments:', err);
      setError('Failed to load treatment effectiveness data');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle treatment card click
   */
  function handleTreatmentClick(treatment: TreatmentEffectiveness) {
    if (onTreatmentClick) {
      onTreatmentClick(treatment);
    }
  }

  return (
    <div className="space-y-4">
      {/* Medical Disclaimer Banner (collapsible) */}
      <DisclaimerBanner collapsible={true} />

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Loading treatments...</div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && treatments.length === 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">No treatments tracked yet</p>
          <p className="text-sm text-muted-foreground">
            Log medications and interventions to see effectiveness analysis
          </p>
        </div>
      )}

      {/* Treatment cards */}
      {!isLoading && !error && treatments.length > 0 && (
        <div className="grid gap-4">
          {treatments.map((treatment) => {
            const colorClasses = getEffectivenessColor(treatment.effectivenessScore);
            const confidenceClasses = getConfidenceColor(treatment.confidence);

            return (
              <div
                key={treatment.treatmentId}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTreatmentClick(treatment)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTreatmentClick(treatment);
                  }
                }}
                aria-label={`View details for ${treatment.treatmentName}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side: Treatment info */}
                  <div className="flex-1 min-w-0">
                    {/* Treatment name and type */}
                    <div className="flex items-center gap-2 mb-2">
                      {treatment.treatmentType === 'medication' ? (
                        <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      ) : (
                        <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      )}
                      <h3 className="font-medium text-foreground truncate">
                        {treatment.treatmentName}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${treatment.treatmentType === 'medication'
                            ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                          }`}
                      >
                        {treatment.treatmentType}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* Sample size */}
                      <span>
                        {treatment.sampleSize} cycle{treatment.sampleSize !== 1 ? 's' : ''}
                      </span>

                      {/* Confidence badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${confidenceClasses.bg} ${confidenceClasses.text}`}
                      >
                        {treatment.confidence} confidence
                      </span>
                    </div>
                  </div>

                  {/* Right side: Effectiveness score and trend */}
                  <div className="flex items-center gap-3">
                    {/* Trend arrow */}
                    <div
                      className="flex items-center justify-center"
                      title={`Trend: ${treatment.trendDirection}`}
                    >
                      {getTrendIcon(treatment.trendDirection)}
                    </div>

                    {/* Effectiveness score */}
                    <div
                      className={`px-4 py-2 rounded-lg border-2 ${colorClasses.bg} ${colorClasses.border} text-center min-w-[80px]`}
                    >
                      <div className={`text-2xl font-bold ${colorClasses.text}`}>
                        {Math.round(treatment.effectivenessScore)}
                      </div>
                      <div className={`text-xs ${colorClasses.text} opacity-75`}>
                        effectiveness
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
