/**
 * InsufficientDataCard Component (Story 3.5 - Task 4)
 *
 * Card component for interventions with fewer than 5 instances.
 * Shows current usage count and required count for analysis.
 * Styled distinctly with dashed border and muted colors.
 *
 * AC3.5.6: Insufficient data threshold display
 */

'use client';

import { InterventionEffectiveness, InterventionType } from '@/types/analytics';
import {
  Snowflake, Flame, Pill, BedDouble, Droplet, HelpCircle, Info
} from 'lucide-react';

/**
 * Props for InsufficientDataCard component (Task 4.2)
 */
export interface InsufficientDataCardProps {
  /** Intervention effectiveness data (with hasSufficientData === false) */
  intervention: InterventionEffectiveness;
}

/**
 * Icon map for intervention types (Task 4.4)
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
 * InsufficientDataCard component
 * Displays intervention type with insufficient data notice and usage count.
 *
 * @param props - InsufficientDataCard properties
 * @returns Rendered insufficient data card
 */
export function InsufficientDataCard({
  intervention
}: InsufficientDataCardProps) {
  // Task 4.4: Get icon component for intervention type
  const Icon = interventionIcons[intervention.interventionType];

  // Task 4.5: Calculate required count (5 - usageCount)
  const requiredCount = 5 - intervention.usageCount;

  return (
    // Task 4.3: Smaller card with border-dashed, bg-gray-50
    // Task 4.7: Add aria-label for accessibility
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
      aria-label={`Insufficient data for ${intervention.interventionType}: ${intervention.usageCount} of 5 needed`}
    >
      {/* Task 4.4: Display intervention type icon and name */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-gray-400" />
        <h4 className="text-base font-medium text-gray-700">{intervention.interventionType}</h4>
      </div>

      {/* Task 4.5: Display current usage count and required count */}
      <div className="flex items-start gap-2">
        {/* Task 4.6: Display info icon with muted color */}
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        {/* Task 4.8: Style with muted colors to differentiate from main cards */}
        <p className="text-sm text-gray-600">
          {intervention.usageCount} use{intervention.usageCount !== 1 ? 's' : ''} - need {requiredCount} more for analysis
        </p>
      </div>
    </div>
  );
}
