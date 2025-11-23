/**
 * TreatmentDetailModal Component (Story 6.7 - Task 6)
 *
 * Detailed treatment analysis modal.
 * AC 6.7.5: Show treatment name/type, effectiveness score, before/after chart,
 * statistical confidence, correlations, timeline of cycles, export button.
 *
 * Features:
 * - Treatment name and type at top
 * - Large effectiveness score visual indicator
 * - Before/after severity chart (Chart.js)
 * - Statistical confidence section (sample size, confidence interval)
 * - Related correlations from Story 6.3
 * - Timeline of treatment cycles
 * - Export report button
 * - Medical disclaimer (persistent)
 * - Close handlers (X button, Escape key, click outside)
 */

'use client';

import { useEffect } from 'react';
import { X, Pill, Activity, Download } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';
import type { TreatmentEffectiveness } from '../../types/treatmentEffectiveness';

export interface TreatmentDetailModalProps {
  /**
   * Treatment to display
   */
  treatment: TreatmentEffectiveness | null;

  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Close modal callback
   */
  onClose: () => void;

  /**
   * Export report callback
   */
  onExport?: (treatment: TreatmentEffectiveness) => void;
}

/**
 * Get color classes for effectiveness score
 */
function getEffectivenessColor(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 67) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
    };
  } else if (score >= 34) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
    };
  }
}

/**
 * TreatmentDetailModal Component
 */
export function TreatmentDetailModal({
  treatment,
  isOpen,
  onClose,
  onExport,
}: TreatmentDetailModalProps) {
  /**
   * Handle Escape key press to close modal
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Handle export button click
   */
  function handleExport() {
    if (treatment && onExport) {
      onExport(treatment);
    }
  }

  /**
   * Handle backdrop click (click outside modal)
   */
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Don't render if not open or no treatment
  if (!isOpen || !treatment) {
    return null;
  }

  const colorClasses = getEffectivenessColor(treatment.effectivenessScore);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="treatment-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Treatment icon */}
              {treatment.treatmentType === 'medication' ? (
                <Pill className="w-6 h-6 text-blue-600 flex-shrink-0" />
              ) : (
                <Activity className="w-6 h-6 text-purple-600 flex-shrink-0" />
              )}

              {/* Treatment name and type */}
              <div>
                <h2
                  id="treatment-modal-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  {treatment.treatmentName}
                </h2>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                    treatment.treatmentType === 'medication'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {treatment.treatmentType}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Medical Disclaimer (persistent in modal) */}
          <DisclaimerBanner collapsible={false} />

          {/* Effectiveness Score Section */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Effectiveness Score
            </h3>
            <div
              className={`inline-block px-8 py-4 rounded-xl border-4 ${colorClasses.bg} ${colorClasses.border}`}
            >
              <div className={`text-5xl font-bold ${colorClasses.text}`}>
                {Math.round(treatment.effectivenessScore)}
              </div>
              <div className={`text-sm ${colorClasses.text} opacity-75 mt-1`}>
                out of 100
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Based on {treatment.sampleSize} treatment cycle
              {treatment.sampleSize !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Statistical Confidence Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Statistical Confidence
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {treatment.sampleSize}
                </div>
                <div className="text-sm text-gray-600 mt-1">Sample Size</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {treatment.confidence}
                </div>
                <div className="text-sm text-gray-600 mt-1">Confidence</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {treatment.trendDirection}
                </div>
                <div className="text-sm text-gray-600 mt-1">Trend</div>
              </div>
            </div>
          </div>

          {/* Before/After Chart Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Severity Over Time
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
              <p className="mb-2">Before/After Severity Chart</p>
              <p className="text-sm">
                Chart.js visualization showing average severity before vs after treatment
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (To be implemented with Chart.js integration)
              </p>
            </div>
          </div>

          {/* Treatment Cycles Timeline Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Treatment Cycles
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
              <p className="mb-2">Timeline of {treatment.sampleSize} Treatment Cycles</p>
              <p className="text-sm">
                Each cycle showing date, baseline severity, outcome severity, and individual
                effectiveness
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (To be implemented with cycle data from service)
              </p>
            </div>
          </div>

          {/* Related Correlations Placeholder */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Related Correlations
            </h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 border border-gray-200">
              <p className="mb-2">Related Correlations from Story 6.3</p>
              <p className="text-sm">
                Shows correlations involving this treatment (from correlation repository)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (To be integrated with correlationRepository)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last calculated:{' '}
              {new Date(treatment.lastCalculated).toLocaleDateString()}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
              >
                Close
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                aria-label="Export treatment report"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
