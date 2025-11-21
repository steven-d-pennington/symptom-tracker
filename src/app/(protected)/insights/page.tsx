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
import { useEnrichedCorrelations, EnrichedCorrelation } from '@/lib/hooks/useEnrichedCorrelations';
import { sortInsightsByPriority } from '@/lib/services/insightPrioritization';
import { TimeRangeSelector } from '@/components/insights/TimeRangeSelector';
import { MedicalDisclaimerBanner } from '@/components/insights/MedicalDisclaimerBanner';
import { InsightsGrid } from '@/components/insights/InsightsGrid';
import { InsightsEmptyState } from '@/components/insights/InsightsEmptyState';
import { InsightDetailModal } from '@/components/insights/InsightDetailModal';
import { TreatmentTracker } from '@/components/insights/TreatmentTracker';
import { TreatmentDetailModal } from '@/components/insights/TreatmentDetailModal';
import { TreatmentEffectiveness } from '@/types/treatmentEffectiveness';
import { exportTreatmentReportPDF } from '@/lib/services/treatmentReportExportService';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

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
  // User ID from current user hook
  const { userId } = useCurrentUser();

  // Time range state (default: 30 days)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Modal state
  const [selectedInsight, setSelectedInsight] = useState<EnrichedCorrelation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Treatment modal state (Story 6.7)
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentEffectiveness | null>(null);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

  // Fetch correlations and logged days count
  const { correlations: rawCorrelations, isLoading, error } = useCorrelations(userId || '', timeRange);
  const { loggedDaysCount, isLoading: isLoadingDays } = useLoggedDaysCount(userId || '');

  // Enrich correlations with item names
  const { correlations: enrichedCorrelations, isLoading: isEnriching } = useEnrichedCorrelations(
    rawCorrelations,
    userId || ''
  );

  // Apply prioritization algorithm
  const prioritizedCorrelations = sortInsightsByPriority(enrichedCorrelations);

  // Combine loading states
  const isLoadingData = isLoading || isEnriching;

  // Determine if empty state should be shown
  const showEmptyState =
    !isLoadingData && (prioritizedCorrelations.length === 0 || loggedDaysCount < 10);

  /**
   * Handle "View Details" button click
   */
  const handleViewDetails = (correlation: EnrichedCorrelation) => {
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

  /**
   * Handle treatment click (Story 6.7)
   */
  const handleTreatmentClick = (treatment: TreatmentEffectiveness) => {
    setSelectedTreatment(treatment);
    setIsTreatmentModalOpen(true);
  };

  /**
   * Handle treatment modal close (Story 6.7)
   */
  const handleCloseTreatmentModal = () => {
    setIsTreatmentModalOpen(false);
    setSelectedTreatment(null);
  };

  /**
   * Handle treatment export (Story 6.7)
   */
  const handleExportTreatment = async (treatment: TreatmentEffectiveness) => {
    try {
      await exportTreatmentReportPDF(treatment);
    } catch (error) {
      console.error('Failed to export treatment report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <header className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Insights Hub</h1>
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
              isLoading={isLoadingData}
              onViewDetails={handleViewDetails}
            />
          )}
        </main>

        {/* Treatment Effectiveness Section (Story 6.7) */}
        {!showEmptyState && userId && (
          <section className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Treatment Effectiveness
            </h2>
            <TreatmentTracker
              userId={userId}
              timeRange={timeRange === 'all' ? '90d' : timeRange}
              onTreatmentClick={handleTreatmentClick}
            />
          </section>
        )}

        {/* Insight detail modal */}
        <InsightDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          correlation={selectedInsight}
        />

        {/* Treatment detail modal (Story 6.7) */}
        <TreatmentDetailModal
          treatment={selectedTreatment}
          isOpen={isTreatmentModalOpen}
          onClose={handleCloseTreatmentModal}
          onExport={handleExportTreatment}
        />
      </div>
    </div>
  );
}
