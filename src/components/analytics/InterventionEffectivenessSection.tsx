/**
 * InterventionEffectivenessSection Component (Story 3.5 - Task 7)
 *
 * Main section component for intervention effectiveness analysis.
 * Displays medical disclaimer, ranked intervention cards, insufficient data cards, and detail modal.
 * Handles loading state, empty state, and intervention grouping.
 *
 * AC3.5.1, AC3.5.3, AC3.5.5, AC3.5.6: Section display with ranking and time range integration
 */

'use client';

import { useState } from 'react';
import { InterventionEffectiveness } from '@/types/analytics';
import { MedicalDisclaimerBanner } from './MedicalDisclaimerBanner';
import { InterventionEffectivenessCard } from './InterventionEffectivenessCard';
import { InsufficientDataCard } from './InsufficientDataCard';
import { InterventionDetailModal } from './InterventionDetailModal';

/**
 * Props for InterventionEffectivenessSection component (Task 7.2)
 */
export interface InterventionEffectivenessSectionProps {
  /** Intervention effectiveness data (null during initial load) */
  interventionEffectiveness: InterventionEffectiveness[] | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * InterventionEffectivenessSection component
 * Main section displaying intervention effectiveness with ranking and drill-down.
 *
 * @param props - InterventionEffectivenessSection properties
 * @returns Rendered intervention effectiveness section
 */
export function InterventionEffectivenessSection({
  interventionEffectiveness,
  isLoading
}: InterventionEffectivenessSectionProps) {
  // Task 7.3: Create modal state
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionEffectiveness | null>(null);

  // Task 7.6: Handle loading state - show skeleton cards
  if (isLoading) {
    return (
      <section className="space-y-6" aria-label="Intervention Effectiveness">
        {/* Task 7.4: Section header */}
        <h2 className="text-2xl font-bold text-gray-900">Intervention Effectiveness</h2>

        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3" />
              <div className="h-20 bg-gray-200 rounded mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Task 7.8: Handle empty state
  if (!interventionEffectiveness || interventionEffectiveness.length === 0) {
    return (
      <section className="space-y-6" aria-label="Intervention Effectiveness">
        {/* Task 7.4: Section header */}
        <h2 className="text-2xl font-bold text-gray-900">Intervention Effectiveness</h2>

        {/* Task 7.5: Medical disclaimer banner */}
        <MedicalDisclaimerBanner />

        {/* Empty state */}
        <div className="border rounded-lg p-8 bg-gray-50 text-center">
          <p className="text-gray-600">
            No interventions logged in this time period. Start logging interventions to see
            effectiveness analysis.
          </p>
        </div>
      </section>
    );
  }

  // Task 7.7: Separate interventions into sufficient and insufficient data groups
  const sufficientInterventions = interventionEffectiveness.filter(i => i.hasSufficientData);
  const insufficientInterventions = interventionEffectiveness.filter(i => !i.hasSufficientData);

  // Task 7.12: Handle card click - set selectedIntervention and open modal
  const handleViewDetails = (intervention: InterventionEffectiveness) => {
    setSelectedIntervention(intervention);
  };

  return (
    <section className="space-y-6" aria-label="Intervention Effectiveness">
      {/* Task 7.4: Section header */}
      <h2 className="text-2xl font-bold text-gray-900">Intervention Effectiveness</h2>

      {/* Task 7.5: Medical disclaimer banner */}
      <MedicalDisclaimerBanner />

      {/* Task 7.9: "Ranked by Effectiveness" subsection */}
      {sufficientInterventions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Ranked by Effectiveness</h3>

          {/* Task 7.10-7.11: Map interventions to cards with rank, use responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sufficientInterventions.map((intervention, index) => (
              <InterventionEffectivenessCard
                key={intervention.interventionType}
                intervention={intervention}
                rank={index + 1} // 1st, 2nd, 3rd...
                onViewDetails={() => handleViewDetails(intervention)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Task 7.13-7.14: "Insufficient Data" subsection (only if insufficient interventions exist) */}
      {insufficientInterventions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Insufficient Data</h3>

          {/* Task 7.16: Add spacing between subsections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insufficientInterventions.map((intervention) => (
              <InsufficientDataCard
                key={intervention.interventionType}
                intervention={intervention}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show message if all interventions have insufficient data */}
      {sufficientInterventions.length === 0 && insufficientInterventions.length > 0 && (
        <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
          <p className="text-sm text-blue-700">
            Log at least 5 interventions for each type to see effectiveness analysis.
            Keep tracking to build more reliable data!
          </p>
        </div>
      )}

      {/* Task 7.15: Intervention Detail Modal */}
      <InterventionDetailModal
        isOpen={selectedIntervention !== null}
        onClose={() => setSelectedIntervention(null)}
        intervention={selectedIntervention}
      />
    </section>
  );
}
