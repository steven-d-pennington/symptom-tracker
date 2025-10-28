/**
 * RegionFlareCard Component (Story 3.2 - Task 4)
 *
 * Displays individual flare card with key metrics for region detail view.
 * Shows start/end dates, duration, peak severity, and trend outcome.
 *
 * AC3.2.2: Flare card display
 * - Start date (formatted)
 * - Resolution date or "Active" badge
 * - Duration in days
 * - Peak severity with color coding (1-3 green, 4-6 yellow, 7-10 red)
 * - Trend outcome with arrows (Improving ↗, Stable →, Worsening ↘)
 *
 * AC3.2.6: Navigation to flare detail
 * - Click/tap navigates to flare detail page
 * - Keyboard accessible (Enter key)
 * - ARIA labels for screen readers
 * - 44px minimum touch target (NFR001)
 */

'use client';

import { RegionFlareHistory } from '@/types/analytics';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';

interface RegionFlareCardProps {
  /** Flare data with computed metrics */
  flare: RegionFlareHistory;
  /** Click handler with flare ID */
  onClick: (flareId: string) => void;
}

/**
 * RegionFlareCard component displaying flare metrics with color-coded severity and trend indicators.
 */
export function RegionFlareCard({ flare, onClick }: RegionFlareCardProps) {
  // Task 4.3: Format startDate
  const startDateFormatted = format(new Date(flare.startDate), 'MMM dd, yyyy');

  // Task 4.4: Display resolution date or "Active" badge
  const endDateDisplay = flare.endDate
    ? format(new Date(flare.endDate), 'MMM dd, yyyy')
    : <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">Active</span>;

  // Task 4.6: Severity color coding (1-3 green, 4-6 yellow, 7-10 red)
  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'text-red-600';
    if (severity >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Task 4.7: Trend outcome with arrow icons
  const getTrendDisplay = (trend: string) => {
    switch (trend) {
      case 'improving':
        return { icon: <ArrowDownRight className="w-4 h-4" />, color: 'text-green-600', label: 'Improving' };
      case 'stable':
        return { icon: <ArrowRight className="w-4 h-4" />, color: 'text-gray-600', label: 'Stable' };
      case 'worsening':
        return { icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-red-600', label: 'Worsening' };
      default:
        return { icon: null, color: 'text-gray-400', label: 'N/A' };
    }
  };

  const trendDisplay = getTrendDisplay(flare.trendOutcome);

  // Task 4.8: Click handler
  const handleClick = () => {
    onClick(flare.flareId);
  };

  // Task 4.9: Keyboard navigation (Enter key)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer min-h-[44px]"
      aria-label={`View details for flare from ${startDateFormatted}`}
    >
      {/* Task 4.12: Responsive layout - stack on mobile, grid on desktop */}
      <div className="flex flex-col md:grid md:grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-gray-500">Start Date</p>
          <p className="text-sm font-semibold">{startDateFormatted}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">End Date</p>
          <div className="text-sm">{endDateDisplay}</div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          {/* Task 4.5: Display duration in days */}
          <p className="text-sm">{flare.duration} {flare.duration === 1 ? 'day' : 'days'}</p>
        </div>
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div>
            <p className="text-xs text-gray-500">Peak Severity</p>
            <p className={`text-sm font-bold ${getSeverityColor(flare.peakSeverity)}`}>
              {flare.peakSeverity}/10
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trend</p>
            <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
              {trendDisplay.icon}
              <span className="text-sm">{trendDisplay.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
