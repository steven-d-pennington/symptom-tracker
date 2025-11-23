/**
 * InsightCard Component (Story 6.4 - Task 2)
 *
 * Displays a single correlation insight in a card format.
 * Shows insight type icon, headline, strength badge, confidence level,
 * timeframe, sample size, and "View Details" button.
 *
 * AC6.4.2: Build InsightCard component
 * REFACTORED: Now uses shadcn/ui Card, Badge, and Button components
 */

'use client';

import { Apple, AlertCircle, Pill, Activity, TrendingUp } from 'lucide-react';
import { CorrelationResult } from '@/types/correlation';
import { EnrichedCorrelation } from '@/lib/hooks/useEnrichedCorrelations';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InsightCardProps {
  correlation: EnrichedCorrelation;
  onViewDetails: (correlation: EnrichedCorrelation) => void;
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
 * Format: "High {item1Name} → Increased {item2Name}"
 *
 * Examples:
 * - "High Dairy → Increased Headache"
 * - "High Gluten → Increased Fatigue"
 *
 * @param correlation - Enriched correlation result with item names
 * @returns Formatted headline string
 */
function generateHeadline(correlation: EnrichedCorrelation): string {
  const item1Formatted = correlation.item1Name.charAt(0).toUpperCase() + correlation.item1Name.slice(1);
  const item2Formatted = correlation.item2Name.charAt(0).toUpperCase() + correlation.item2Name.slice(1);

  // Determine direction based on coefficient sign
  const direction = correlation.coefficient > 0 ? 'Increased' : 'Decreased';

  return `High ${item1Formatted} → ${direction} ${item2Formatted}`;
}

/**
 * Get strength badge variant for shadcn/ui Badge component
 *
 * - Strong (|ρ| >= 0.7): destructive (red)
 * - Moderate (0.3 <= |ρ| < 0.7): warning (yellow)
 * - Weak (|ρ| < 0.3): secondary (gray)
 *
 * @param strength - Correlation strength
 * @returns Badge variant string
 */
function getStrengthBadgeVariant(strength: string): "destructive" | "warning" | "secondary" {
  switch (strength) {
    case 'strong':
      return 'destructive';
    case 'moderate':
      return 'warning';
    case 'weak':
      return 'secondary';
    default:
      return 'secondary';
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
  const strengthVariant = getStrengthBadgeVariant(correlation.strength);
  const confidenceText = getConfidenceText(correlation.confidence, correlation.sampleSize);
  const timeRangeText = formatTimeRange(correlation.timeRange);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200" aria-label={`Insight: ${headline}`}>
      <CardHeader>
        {/* Icon and headline */}
        <div className="flex items-start gap-3">
          <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{headline}</h3>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Strength badge */}
        <Badge variant={strengthVariant}>
          {correlation.strength.charAt(0).toUpperCase() + correlation.strength.slice(1)} (ρ ={' '}
          {correlation.coefficient.toFixed(2)})
        </Badge>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{confidenceText}</p>
          <p>Timeframe: {timeRangeText}</p>
          {correlation.lagHours > 0 && <p>Lag: {correlation.lagHours} hours</p>}
        </div>
      </CardContent>

      <CardFooter>
        {/* View Details button */}
        <Button
          onClick={() => onViewDetails(correlation)}
          className="w-full"
          aria-label={`View details for ${headline}`}
        >
          View Details →
        </Button>
      </CardFooter>
    </Card>
  );
}
