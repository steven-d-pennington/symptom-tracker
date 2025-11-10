"use client";

import React, { useState } from 'react';
import { Apple, AlertCircle, Pill, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import type { CorrelationType } from '@/types/correlation';

/**
 * PatternLegend Props
 * Story 6.5: Task 3 - Pattern legend component
 */
export interface PatternLegendProps {
  availableTypes: CorrelationType[]; // Types available in current correlations
  visibleTypes: Set<CorrelationType>; // Types currently visible
  onToggleType: (type: CorrelationType) => void;
}

/**
 * Pattern legend item definition
 */
interface LegendItem {
  type: CorrelationType;
  label: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * PatternLegend Component
 *
 * Displays legend for pattern types with color coding and toggle functionality.
 * Clicking legend items toggles visibility of that pattern type on timeline.
 */
function PatternLegend({
  availableTypes,
  visibleTypes,
  onToggleType,
}: PatternLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define all legend items
  const allLegendItems: LegendItem[] = [
    {
      type: 'food-symptom',
      label: 'Food-Symptom',
      description: 'Food consumption correlates with symptoms',
      color: '#f97316', // Orange
      icon: Apple,
    },
    {
      type: 'trigger-symptom',
      label: 'Trigger-Symptom',
      description: 'Trigger exposure correlates with symptoms',
      color: '#ef4444', // Red
      icon: AlertCircle,
    },
    {
      type: 'medication-symptom',
      label: 'Medication-Symptom',
      description: 'Medication correlates with symptom changes',
      color: '#22c55e', // Green
      icon: Pill,
    },
    {
      type: 'food-flare',
      label: 'Food-Flare',
      description: 'Food consumption correlates with flares',
      color: '#3b82f6', // Blue
      icon: Apple,
    },
    {
      type: 'trigger-flare',
      label: 'Trigger-Flare',
      description: 'Trigger exposure correlates with flares',
      color: '#a855f7', // Purple
      icon: AlertCircle,
    },
  ];

  // Filter to only available types
  const legendItems = allLegendItems.filter(item =>
    availableTypes.includes(item.type)
  );

  if (legendItems.length === 0) {
    return null; // No patterns to show
  }

  return (
    <div className="pattern-legend bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Pattern Legend</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded md:hidden"
          aria-label={isCollapsed ? 'Expand legend' : 'Collapse legend'}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Legend items */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {legendItems.map((item) => {
            const isVisible = visibleTypes.has(item.type);
            const Icon = item.icon;

            return (
              <button
                key={item.type}
                onClick={() => onToggleType(item.type)}
                className={`flex items-start gap-2 p-2 rounded border transition-all ${
                  isVisible
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
                aria-pressed={isVisible}
                aria-label={`Toggle ${item.label} patterns`}
              >
                {/* Color swatch */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center mt-0.5"
                  style={{
                    backgroundColor: isVisible ? `${item.color}33` : '#f3f4f6',
                    border: `2px solid ${isVisible ? item.color : '#d1d5db'}`,
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isVisible ? item.color : '#9ca3af' }}
                  />
                </div>

                {/* Label and description */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {item.description}
                  </div>
                </div>

                {/* Visibility indicator */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      isVisible
                        ? 'bg-green-500 border-green-600'
                        : 'bg-gray-200 border-gray-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Helper text */}
      {!isCollapsed && (
        <p className="text-xs text-gray-500 mt-3">
          Click items to show/hide pattern types on the timeline. Patterns are based on correlation analysis.
        </p>
      )}
    </div>
  );
}

export default PatternLegend;
