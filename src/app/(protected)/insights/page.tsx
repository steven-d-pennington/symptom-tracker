/**
 * Health Insights Hub Page (Story 6.4)
 *
 * Visual insights dashboard presenting correlation findings in clear, actionable cards.
 * Main page integrating all insights components: timeline selector, disclaimer,
 * insights grid, empty state, and detail modal.
 *
 * Route: /insights
 * AC6.4.1: Create /insights page route
 */

'use client';

import { useState } from 'react';
import { CorrelationResult } from '@/types/correlation';
import { useCorrelations, useLoggedDaysCount } from '@/lib/hooks/useCorrelations';
import { sortInsightsByPriority } from '@/lib/services/insightPrioritization';
import { TimeRangeSelector } from '@/components/insights/TimeRangeSelector';
import { MedicalDisclaimerBanner } from '@/components/insights/MedicalDisclaimerBanner';
import { InsightsGrid } from '@/components/insights/InsightsGrid';
import { InsightsEmptyState } from '@/components/insights/InsightsEmptyState';
import { InsightDetailModal } from '@/components/insights/InsightDetailModal';

/**
 * Health Insights Hub Page
 *
 * Page structure:
 * 1. Header with title and time range selector
 * 2. Medical disclaimer banner at top (dismissible)
 * 3. Insights grid (or empty state if insufficient data)
 * 4. Detail modal (opened when clicking "View Details")
 *
 * Responsive layout:
 * - Full width with max-width container
 * - Responsive padding
 * - Grid adapts to screen size (1/2/3 columns)
 */
export default function InsightsPage() {
  // User ID (in production, from auth context)
  const userId = 'default-user'; // TODO: Get from auth context

  // Time range state (default: 30 days)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Modal state
  const [selectedInsight, setSelectedInsight] = useState<CorrelationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch correlations and logged days count
  const { correlations: rawCorrelations, isLoading, error } = useCorrelations(userId, timeRange);
  const { loggedDaysCount, isLoading: isLoadingDays } = useLoggedDaysCount(userId);

  // Apply prioritization algorithm
  const prioritizedCorrelations = sortInsightsByPriority(rawCorrelations);

  // Determine if empty state should be shown
  const showEmptyState =
    !isLoading && (prioritizedCorrelations.length === 0 || loggedDaysCount < 10);

  /**
   * Handle "View Details" button click
   */
  const handleViewDetails = (correlation: CorrelationResult) => {
    setSelectedInsight(correlation);
    setIsModalOpen(true);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsight(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Insights Hub</h1>
              <p className="text-gray-600 mt-1">
                Discover patterns in your health data through correlation analysis
              </p>
            </div>

            {/* Time range selector */}
            <div className="sm:w-64">
              <TimeRangeSelector
                value={timeRange}
                onChange={(value) => setTimeRange(value as '7d' | '30d' | '90d' | 'all')}
                disabled={isLoading}
              />
            </div>
          </div>
        </header>

        {/* Medical disclaimer banner */}
        <MedicalDisclaimerBanner />

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6" role="alert">
            <p className="text-sm text-red-800">
              Failed to load insights: {error.message}. Please try again later.
            </p>
          </div>
        )}

        {/* Main content */}
        <main>
          {/* Show empty state or insights grid */}
          {showEmptyState ? (
            <InsightsEmptyState
              loggedDaysCount={loggedDaysCount}
              requiredDays={10}
            />
          ) : (
            <InsightsGrid
              correlations={prioritizedCorrelations}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          )}
        </main>

        {/* Insight detail modal */}
        <InsightDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          correlation={selectedInsight}
        />
      </div>
    </div>
  );
}

/**
 * Page Metadata
 *
 * For SEO and browser tab display
 */
export const metadata = {
  title: 'Health Insights - Symptom Tracker',
  description: 'Discover patterns and correlations in your health data',
};
