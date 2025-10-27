/**
 * TimeRangeSelector Component (Story 3.1 - Task 5)
 *
 * Radio button group for selecting analytics time range.
 * Responsive: horizontal on desktop, vertical on mobile.
 *
 * AC3.1.3: Time range selector with multiple options
 */

'use client';

import { TimeRange } from '@/types/analytics';

export interface TimeRangeSelectorProps {
  /** Current selected time range */
  value: TimeRange;
  /** Callback when time range changes */
  onChange: (range: TimeRange) => void;
}

/**
 * Time range options for display (Story 3.1)
 */
const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: 'last30d', label: 'Last 30 days' },
  { value: 'last90d', label: 'Last 90 days' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'allTime', label: 'All Time' },
];

/**
 * Time range selector component with radio buttons.
 * AC3.1.3: Provides options: Last 30 days, Last 90 days, Last Year, All Time
 */
export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div
      className="flex flex-col sm:flex-row gap-2"
      role="radiogroup"
      aria-label="Select time range for analytics"
    >
      {TIME_RANGE_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            className={`
              flex items-center justify-center px-4 py-2 rounded-md border cursor-pointer transition-all
              ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <input
              type="radio"
              name="timeRange"
              value={option.value}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value as TimeRange)}
              className="sr-only"
              aria-label={option.label}
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
