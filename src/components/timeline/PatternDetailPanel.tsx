"use client";

import React, { useEffect } from 'react';
import { X, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import type { DetectedPattern } from '@/lib/services/patternDetectionService';

/**
 * PatternDetailPanel Props
 * Story 6.5: Task 7 - Pattern detail panel
 */
export interface PatternDetailPanelProps {
  pattern: DetectedPattern | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PatternDetailPanel Component
 *
 * Side panel/modal displaying detailed information about a detected pattern.
 * Shows pattern description, frequency, statistical confidence, and occurrences.
 */
function PatternDetailPanel({
  pattern,
  isOpen,
  onClose,
}: PatternDetailPanelProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pattern) {
    return null;
  }

  // Format correlation coefficient
  const coefficientText = pattern.coefficient >= 0
    ? `Positive correlation (ρ = ${pattern.coefficient.toFixed(3)})`
    : `Negative correlation (ρ = ${pattern.coefficient.toFixed(3)})`;

  // Determine correlation strength description
  const getStrengthDescription = () => {
    const absCoef = Math.abs(pattern.coefficient);
    if (absCoef >= 0.7) return 'Strong correlation';
    if (absCoef >= 0.3) return 'Moderate correlation';
    return 'Weak correlation';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pattern-detail-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2
            id="pattern-detail-title"
            className="text-lg font-semibold text-gray-900"
          >
            Pattern Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close pattern details"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Pattern Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pattern
            </h3>
            <p className="text-base text-gray-900">
              {pattern.description}
            </p>
          </div>

          {/* Frequency */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Frequency
            </h3>
            <p className="text-sm text-gray-900">
              Occurred in{' '}
              <span className="font-semibold">{pattern.frequency}</span> instance
              {pattern.frequency !== 1 ? 's' : ''}
            </p>
            {pattern.lagHours > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Typical lag: {pattern.lagHours} hours
              </p>
            )}
          </div>

          {/* Statistical Confidence */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistical Confidence
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Strength:</span>
                <span className="font-medium text-gray-900">
                  {getStrengthDescription()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Coefficient:</span>
                <span className="font-mono text-gray-900">
                  {coefficientText}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Confidence Level:</span>
                <span className="capitalize font-medium text-gray-900">
                  {pattern.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* Pattern Type Badge */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Pattern Type
            </h3>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {pattern.type}
            </span>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-900">
              <strong>Note:</strong> Patterns show correlations, not causation.
              Always consult with healthcare professionals before making treatment
              decisions based on these patterns.
            </p>
          </div>

          {/* Occurrences Timeline */}
          {pattern.occurrences.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Pattern Occurrences
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pattern.occurrences.slice(0, 10).map((occurrence, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {occurrence.event1.summary}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {new Date(occurrence.timestamp).toLocaleDateString()} at{' '}
                        {new Date(occurrence.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {pattern.occurrences.length > 10 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    +{pattern.occurrences.length - 10} more occurrences
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PatternDetailPanel;
