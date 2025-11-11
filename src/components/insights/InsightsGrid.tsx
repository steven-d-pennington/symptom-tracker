/**
 * InsightsGrid Component (Story 6.4 - Task 11)
 *
 * Responsive CSS Grid container for InsightCard components.
 * Handles loading skeletons and smooth transitions.
 *
 * AC6.4.10: Build responsive grid layout with loading skeletons
 */

'use client';

import { CorrelationResult } from '@/types/correlation';
import { EnrichedCorrelation } from '@/lib/hooks/useEnrichedCorrelations';
import { InsightCard } from './InsightCard';
import { InsightCardSkeleton } from './InsightCardSkeleton';

interface InsightsGridProps {
  correlations: EnrichedCorrelation[];
  isLoading: boolean;
  onViewDetails: (correlation: EnrichedCorrelation) => void;
}

/**
 * InsightsGrid Component
 *
 * Responsive grid layout:
 * - 1 column on mobile (< 768px)
 * - 2 columns on tablet (768px - 1024px)
 * - 3 columns on desktop (> 1024px)
 *
 * Loading state: Shows 6 skeleton cards
 * Loaded state: Shows InsightCard for each correlation
 *
 * @param correlations - Array of correlation results
 * @param isLoading - Whether data is loading
 * @param onViewDetails - Callback when "View Details" clicked
 */
export function InsightsGrid({ correlations, isLoading, onViewDetails }: InsightsGridProps) {
  // Show loading skeletons while data loads
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="status"
        aria-label="Loading insights"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <InsightCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Show insights grid once loaded
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in"
      role="feed"
      aria-label="Health insights"
    >
      {correlations.map((correlation) => (
        <InsightCard
          key={correlation.id}
          correlation={correlation}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

/**
 * Fade-in animation CSS
 *
 * Add to your global styles or Tailwind config:
 *
 * @keyframes fadeIn {
 *   from { opacity: 0; }
 *   to { opacity: 1; }
 * }
 *
 * .fade-in {
 *   animation: fadeIn 0.3s ease-in;
 * }
 */
