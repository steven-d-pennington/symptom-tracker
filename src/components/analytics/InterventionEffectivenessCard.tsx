/**
 * InterventionEffectivenessCard Component (Story 3.5 - Task 3)
 *
 * Card component displaying effectiveness metrics for a single intervention type.
 * Shows usage count, average severity change, success rate, and optional rank badge.
 * Includes "View Details" button for drill-down to intervention instances.
 *
 * AC3.5.2, AC3.5.3, AC3.5.7: Intervention metrics display with ranking and drill-down
 */

'use client';

import { InterventionEffectiveness, InterventionType } from '@/types/analytics';
import {
  Snowflake, Flame, Pill, BedDouble, Droplet, HelpCircle
} from 'lucide-react';

/**
 * Props for InterventionEffectivenessCard component (Task 3.2)
 */
export interface InterventionEffectivenessCardProps {
  /** Intervention effectiveness data */
  intervention: InterventionEffectiveness;
  /** Rank position (1, 2, 3) or null if not ranked */
  rank: number | null;
  /** Callback when "View Details" button is clicked */
  onViewDetails: () => void;
}

/**
 * Icon map for intervention types (Task 3.4)
 */
const interventionIcons: Record<InterventionType, React.ComponentType<{ className?: string }>> = {
  Ice: Snowflake,
  Heat: Flame,
  Medication: Pill,
  Rest: BedDouble,
  Drainage: Droplet,
  Other: HelpCircle
};

/**
 * Rank badge configuration (Task 3.5)
 */
const rankBadges: Record<number, { label: string; color: string }> = {
  1: { label: '1st', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  2: { label: '2nd', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  3: { label: '3rd', color: 'bg-orange-100 text-orange-800 border-orange-300' }
};

/**
 * InterventionEffectivenessCard component
 * Displays intervention effectiveness metrics with rank badge and view details action.
 *
 * @param props - InterventionEffectivenessCard properties
 * @returns Rendered intervention card
 */
export function InterventionEffectivenessCard({
  intervention,
  rank,
  onViewDetails
}: InterventionEffectivenessCardProps) {
  // Task 3.4: Get icon component for intervention type
  const Icon = interventionIcons[intervention.interventionType];

  // Task 3.8: Color code success rate (> 60% green, 40-60% yellow, < 40% red)
  const successRateColor = intervention.successRate !== null
    ? intervention.successRate > 60 ? 'text-green-600'
      : intervention.successRate >= 40 ? 'text-yellow-600'
      : 'text-red-600'
    : 'text-gray-400';

  return (
    // Task 3.3: Card with border, rounded-lg, p-4, bg-white
    // Task 3.11-3.12: Add aria-label and keyboard navigation support
    <div
      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
      tabIndex={0}
      aria-label={`Intervention: ${intervention.interventionType}, Success rate: ${intervention.successRate ?? 'N/A'}%, View details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails();
        }
      }}
    >
      {/* Task 3.4-3.6: Display intervention icon, type name, and rank badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">{intervention.interventionType}</h3>
        </div>
        {rank && rank <= 3 && (
          <span className={`px-2 py-1 text-xs font-semibold rounded border ${rankBadges[rank].color}`}>
            {rankBadges[rank].label}
          </span>
        )}
      </div>

      {/* Task 3.7: Display three metric values in grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-600">Usage Count</p>
          <p className="text-xl font-bold text-gray-900">{intervention.usageCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Avg Change</p>
          <p className="text-xl font-bold text-gray-900">
            {intervention.averageSeverityChange !== null
              ? `${intervention.averageSeverityChange > 0 ? '+' : ''}${intervention.averageSeverityChange}`
              : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className={`text-xl font-bold ${successRateColor}`}>
            {intervention.successRate !== null ? `${intervention.successRate}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Task 3.9-3.10: "View Details" button with click handler */}
      <button
        onClick={onViewDetails}
        className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        aria-label={`View details for ${intervention.interventionType} intervention`}
      >
        View Details
      </button>
    </div>
  );
}
