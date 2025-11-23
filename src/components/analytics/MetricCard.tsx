/**
 * MetricCard Component (Story 3.3 - Task 4)
 *
 * Reusable card component for displaying individual metric values.
 * Supports icons, units, color coding, and accessibility features.
 *
 * AC3.3.2, AC3.3.3, AC3.3.7: Metric display with accessibility
 */

'use client';

import { ReactNode } from 'react';

/**
 * Props for MetricCard component (Task 4.2)
 */
export interface MetricCardProps {
  /** Metric label (e.g., "Average Duration") */
  label: string;

  /** Metric value (number, string, or null for no data) */
  value: number | string | null;

  /** Optional unit to append to value (e.g., "days", "%") */
  unit?: string;

  /** Icon component to display */
  icon: ReactNode;

  /** Optional color class for value text (e.g., "text-green-600") */
  color?: string;

  /** ARIA label for screen readers */
  ariaLabel: string;
}

/**
 * MetricCard component for displaying a single metric with icon and styling.
 * Follows responsive design patterns from Stories 3.1 and 3.2.
 *
 * @param props - MetricCard properties
 * @returns Rendered metric card
 */
export function MetricCard({
  label,
  value,
  unit,
  icon,
  color,
  ariaLabel,
}: MetricCardProps) {
  // Task 4.7-4.8: Handle value display with unit or "No data" fallback
  const displayValue = value !== null ? `${value}${unit ? ` ${unit}` : ''}` : 'No data';
  const valueClass = value !== null ? (color || 'text-gray-900') : 'text-gray-400';

  return (
    // Task 4.3: Card with border, rounded, p-4, bg-white
    // Task 4.9-4.10: Add aria-label and tabIndex for accessibility
    <div
      className="border rounded-lg p-4 bg-white"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      {/* Task 4.4: Render icon in top-left with specified color */}
      <div className="flex items-start justify-between mb-2">
        <div className={`${color || 'text-gray-600'}`}>
          {icon}
        </div>
      </div>

      {/* Task 4.5: Render label as text-sm text-gray-600 */}
      <p className="text-sm text-gray-600 mb-1">{label}</p>

      {/* Task 4.6: Render value as text-2xl font-bold with optional color */}
      <p className={`text-2xl font-bold ${valueClass}`}>
        {displayValue}
      </p>
    </div>
  );
}
