/**
 * TimeRangeSelector Component for Insights (Story 6.4 - Task 7)
 *
 * Time range dropdown for insights page with 4 options: 7d, 30d, 90d, all
 * Adapted from src/components/analytics/TimeRangeSelector.tsx
 * Removed "1y" option as per AC6.4.6
 *
 * AC6.4.6: Add time range selector
 */

'use client';

const PRESET_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

interface TimeRangeSelectorProps {
  onChange: (timeRange: string) => void;
  value?: string;
  disabled?: boolean;
}

/**
 * TimeRangeSelector Component
 *
 * Dropdown selector for time range with keyboard accessibility.
 * Default value: "30d" (Last 30 days)
 *
 * @param onChange - Callback when time range changes
 * @param value - Current selected value (default: "30d")
 * @param disabled - Whether selector is disabled
 */
export function TimeRangeSelector({
  onChange,
  value = '30d',
  disabled = false,
}: TimeRangeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor="insights-time-range" className="block text-sm font-medium mb-1">
        Time Range
      </label>
      <select
        id="insights-time-range"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select time range for insights"
      >
        {PRESET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
