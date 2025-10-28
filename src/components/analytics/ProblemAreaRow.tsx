/**
 * ProblemAreaRow Component (Story 3.1 - Task 4)
 *
 * Displays a single problem area with visual bar chart and metrics.
 * Supports keyboard navigation and accessibility.
 *
 * AC3.1.2: Problem areas ranked by flare frequency
 * AC3.1.5: Navigation to per-region flare history
 * AC3.1.7: Visual bar chart indicator for problem areas
 */

'use client';

import { ProblemArea } from '@/types/analytics';
import { getBodyRegionById } from '@/lib/data/bodyRegions';

export interface ProblemAreaRowProps {
  /** Problem area data to display */
  problemArea: ProblemArea;
  /** Maximum flare count across all problem areas (for bar width scaling) */
  maxCount: number;
  /** Callback when row is clicked/activated */
  onClick: (regionId: string) => void;
}

/**
 * Determine bar color based on percentage of maximum.
 * AC3.1.7: Color coding scheme
 * - Red: >= 100% (highest frequency region)
 * - Orange: >= 50% of max
 * - Yellow: >= 25% of max
 * - Green: < 25% of max
 */
function getBarColor(percentOfMax: number): string {
  if (percentOfMax >= 100) return 'bg-red-500';
  if (percentOfMax >= 50) return 'bg-orange-500';
  if (percentOfMax >= 25) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Problem area row with bar chart visualization.
 * Displays region name, flare count, percentage, and visual indicator.
 */
export function ProblemAreaRow({
  problemArea,
  maxCount,
  onClick,
}: ProblemAreaRowProps) {
  // Look up body region name from bodyRegions data
  const region = getBodyRegionById(problemArea.bodyRegionId);
  const regionName = region?.name || problemArea.bodyRegionId;

  // Calculate bar width as percentage of max (AC3.1.7)
  const barWidthPercent = (problemArea.flareCount / maxCount) * 100;

  // Determine bar color based on percentage (AC3.1.7)
  const barColor = getBarColor(barWidthPercent);

  // Handle click event
  const handleClick = () => {
    onClick(problemArea.bodyRegionId);
  };

  // Handle keyboard navigation (AC3.1.5: Enter key support)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Format percentage to 1 decimal place (AC3.1.2)
  const formattedPercentage = problemArea.percentage.toFixed(1);

  // Accessibility label (AC3.1.5)
  const ariaLabel = `View detailed history for ${regionName}, ${problemArea.flareCount} flare${
    problemArea.flareCount !== 1 ? 's' : ''
  }, ${formattedPercentage}% of total`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Region info (AC3.1.2: region name, count, percentage) */}
        <div className="flex-shrink-0 md:w-48">
          <h3 className="text-lg font-semibold text-gray-900">{regionName}</h3>
          <p className="text-sm text-gray-600">
            {problemArea.flareCount} flare{problemArea.flareCount !== 1 ? 's' : ''}{' '}
            ({formattedPercentage}%)
          </p>
        </div>

        {/* Bar chart visualization (AC3.1.7) */}
        <div className="flex-1 min-w-0">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full ${barColor} flex items-center justify-center text-white text-xs font-semibold transition-all duration-300`}
              style={{ width: `${barWidthPercent}%` }}
            >
              {/* Show count inside bar if there's enough space */}
              {barWidthPercent >= 20 && (
                <span>{problemArea.flareCount}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
