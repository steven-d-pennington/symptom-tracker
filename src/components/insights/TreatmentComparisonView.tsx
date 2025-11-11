/**
 * TreatmentComparisonView Component (Story 6.7 - Task 7)
 *
 * Side-by-side treatment comparison.
 * AC 6.7.6: Compare 2-4 treatments showing effectiveness scores, trends,
 * sample sizes, statistical significance, and recommendations.
 *
 * Features:
 * - Select 2-4 treatments to compare
 * - Effectiveness scores side-by-side with bar chart visualization
 * - Trend directions for each treatment
 * - Sample sizes for context
 * - Ranked recommendations with confidence levels
 * - Medical disclaimer (persistent header)
 */

'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';
import type { TreatmentEffectiveness } from '../../types/treatmentEffectiveness';

export interface TreatmentComparisonViewProps {
  /**
   * Available treatments to select from
   */
  treatments: TreatmentEffectiveness[];

  /**
   * Close comparison view callback
   */
  onClose: () => void;
}

/**
 * Get color classes for effectiveness score
 */
function getEffectivenessColor(score: number): string {
  if (score >= 67) return 'bg-green-500';
  if (score >= 34) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get trend icon
 */
function getTrendIcon(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    case 'stable':
      return <Minus className="w-4 h-4 text-gray-600" />;
  }
}

/**
 * TreatmentComparisonView Component
 */
export function TreatmentComparisonView({
  treatments,
  onClose,
}: TreatmentComparisonViewProps) {
  const [selectedTreatments, setSelectedTreatments] = useState<
    TreatmentEffectiveness[]
  >([]);

  /**
   * Toggle treatment selection
   */
  function toggleTreatment(treatment: TreatmentEffectiveness) {
    const isSelected = selectedTreatments.some(
      (t) => t.treatmentId === treatment.treatmentId
    );

    if (isSelected) {
      setSelectedTreatments(
        selectedTreatments.filter((t) => t.treatmentId !== treatment.treatmentId)
      );
    } else {
      // Only allow 2-4 selections
      if (selectedTreatments.length < 4) {
        setSelectedTreatments([...selectedTreatments, treatment]);
      }
    }
  }

  /**
   * Get ranked treatments (sorted by effectiveness)
   */
  const rankedTreatments = [...selectedTreatments].sort(
    (a, b) => b.effectivenessScore - a.effectivenessScore
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Compare Treatments</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Close
        </button>
      </div>

      {/* Medical Disclaimer (persistent) */}
      <DisclaimerBanner collapsible={false} />

      {/* Treatment Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Select Treatments to Compare (2-4)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {treatments.map((treatment) => {
            const isSelected = selectedTreatments.some(
              (t) => t.treatmentId === treatment.treatmentId
            );

            return (
              <button
                key={treatment.treatmentId}
                onClick={() => toggleTreatment(treatment)}
                disabled={!isSelected && selectedTreatments.length >= 4}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  !isSelected && selectedTreatments.length >= 4
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {treatment.treatmentName}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Score: {Math.round(treatment.effectivenessScore)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Results */}
      {selectedTreatments.length >= 2 ? (
        <div className="space-y-6">
          {/* Side-by-side comparison */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Effectiveness Comparison
            </h3>
            <div className="space-y-3">
              {selectedTreatments.map((treatment) => (
                <div
                  key={treatment.treatmentId}
                  className="flex items-center gap-4"
                >
                  <div className="w-48 text-sm font-medium text-gray-900 truncate">
                    {treatment.treatmentName}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <div
                      className={`${getEffectivenessColor(
                        treatment.effectivenessScore
                      )} h-8 rounded-full flex items-center justify-end pr-3 transition-all`}
                      style={{
                        width: `${Math.min(treatment.effectivenessScore, 100)}%`,
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {Math.round(treatment.effectivenessScore)}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-center">
                    {getTrendIcon(treatment.trendDirection)}
                  </div>
                  <div className="w-24 text-xs text-gray-600">
                    {treatment.sampleSize} cycles
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranked recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Recommended by Effectiveness
            </h3>
            <div className="space-y-2">
              {rankedTreatments.map((treatment, index) => (
                <div
                  key={treatment.treatmentId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      #{index + 1} {treatment.treatmentName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(treatment.effectivenessScore)}% effective •{' '}
                      {treatment.confidence} confidence •{' '}
                      {treatment.trendDirection}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistical Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Rankings are based on effectiveness scores.
              Consider confidence levels, trends, and sample sizes when making
              decisions. Statistical significance testing requires larger sample sizes.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Select at least 2 treatments to compare
        </div>
      )}
    </div>
  );
}
