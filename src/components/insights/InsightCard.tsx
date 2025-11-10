/**
 * InsightCard Component (Story 6.4 - Task 2)
 *
 * Displays a single correlation insight in a card format.
 * Shows insight type icon, headline, strength badge, confidence level,
 * timeframe, sample size, and "View Details" button.
 *
 * AC6.4.2: Build InsightCard component
 */

'use client';

import { Apple, AlertCircle, Pill, Activity, TrendingUp } from 'lucide-react';
import { CorrelationResult } from '@/types/correlation';

interface InsightCardProps {
  correlation: CorrelationResult;
  onViewDetails: (correlation: CorrelationResult) => void;
}

/**
 * Get icon for insight type
 *
 * Mapping:
 * - food: Apple
 * - trigger: AlertCircle
 * - medication: Pill
 * - flare: Activity
 *
 * @param type - Correlation type
 * @returns Lucide icon component
 */
function getInsightIcon(type: string) {
  if (type.includes('food')) {
    return Apple;
  } else if (type.includes('trigger')) {
    return AlertCircle;
  } else if (type.includes('medication')) {
    return Pill;
  } else if (type.includes('flare')) {
    return Activity;
  }
  return TrendingUp; // Default icon
}

/**
 * Generate headline text from correlation
 *
 * Format: "High {item1} → Increased {item2}"
 *
 * Examples:
 * - "High Dairy → Increased Headache"
 * - "High Gluten → Increased Fatigue"
 *
 * @param correlation - Correlation result
 * @returns Formatted headline string
 */
function generateHeadline(correlation: CorrelationResult): string {
  const item1Formatted = correlation.item1.charAt(0).toUpperCase() + correlation.item1.slice(1);
  const item2Formatted = correlation.item2.charAt(0).toUpperCase() + correlation.item2.slice(1);

  // Determine direction based on coefficient sign
  const direction = correlation.coefficient > 0 ? 'Increased' : 'Decreased';

  return `High ${item1Formatted} → ${direction} ${item2Formatted}`;
}

/**
 * Get strength badge color classes
 *
 * - Strong (|ρ| >= 0.7): Red
 * - Moderate (0.3 <= |ρ| < 0.7): Yellow/Amber
 * - Weak (|ρ| < 0.3): Gray
 *
 * @param strength - Correlation strength
 * @returns Tailwind CSS class string
 */
function getStrengthBadgeColor(strength: string): string {
  switch (strength) {
    case 'strong':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'weak':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get confidence level display text
 *
 * - high: ≥20 samples
 * - medium: 10-19 samples
 * - low: <10 samples
 *
 * @param confidence - Confidence level
 * @param sampleSize - Number of data points
 * @returns Display string
 */
function getConfidenceText(confidence: string, sampleSize: number): string {
  return `${confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence (${sampleSize} data points)`;
}

/**
 * Format timeframe for display
 *
 * @param timeRange - Time range
 * @returns Formatted string
 */
function formatTimeRange(timeRange: string): string {
  switch (timeRange) {
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    default:
      return timeRange;
  }
}

/**
 * InsightCard Component
 *
 * Card displaying correlation insight with:
 * - Type icon
 * - Headline text
 * - Strength badge
 * - Confidence level
 * - Timeframe
 * - Sample size
 * - "View Details" button
 *
 * @param correlation - Correlation result to display
 * @param onViewDetails - Callback when "View Details" clicked
 */
export function InsightCard({ correlation, onViewDetails }: InsightCardProps) {
  const Icon = getInsightIcon(correlation.type);
  const headline = generateHeadline(correlation);
  const strengthColor = getStrengthBadgeColor(correlation.strength);
  const confidenceText = getConfidenceText(correlation.confidence, correlation.sampleSize);
  const timeRangeText = formatTimeRange(correlation.timeRange);

  return (
    <article
      className="border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 bg-white"
      aria-label={`Insight: ${headline}`}
    >
      {/* Icon and headline */}
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{headline}</h3>
      </div>

      {/* Strength badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${strengthColor}`}
        >
          {correlation.strength.charAt(0).toUpperCase() + correlation.strength.slice(1)} (ρ ={' '}
          {correlation.coefficient.toFixed(2)})
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <p>{confidenceText}</p>
        <p>Timeframe: {timeRangeText}</p>
        {correlation.lagHours > 0 && <p>Lag: {correlation.lagHours} hours</p>}
      </div>

      {/* View Details button */}
      <button
        onClick={() => onViewDetails(correlation)}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-label={`View details for ${headline}`}
      >
        View Details →
      </button>
    </article>
  );
}
