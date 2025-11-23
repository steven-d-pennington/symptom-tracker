/**
 * FlareStatusFilter Component (Story 3.2 - Task 7)
 *
 * Filter control for flare list by status (All, Active, Resolved).
 * Displays count for each filter option.
 *
 * AC3.2.5: Filter flares by status
 * - Radio buttons or segmented control with three options
 * - Default selection is "All"
 * - Display count for each option (e.g., "All (10)")
 * - Highlight selected option
 * - ARIA labels for accessibility
 * - Responsive: horizontal on desktop, stack on mobile
 */

'use client';

export type FlareFilter = 'all' | 'active' | 'resolved';

interface FlareStatusFilterProps {
  /** Current filter value */
  value: FlareFilter;
  /** Change handler */
  onChange: (filter: FlareFilter) => void;
  /** Counts for each filter option */
  counts: {
    all: number;
    active: number;
    resolved: number;
  };
}

/**
 * FlareStatusFilter component - segmented control for filtering flares by status.
 */
export function FlareStatusFilter({ value, onChange, counts }: FlareStatusFilterProps) {
  // Task 7.3: Define filter options
  const filterOptions: Array<{ value: FlareFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div
      className="flex flex-col sm:flex-row gap-2"
      role="radiogroup"
      aria-label="Filter flares by status"
    >
      {/* Task 7.4: Render segmented control with three options */}
      {filterOptions.map((option) => {
        const isSelected = value === option.value;
        const count = counts[option.value];

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Filter by ${option.label} flares (${count})`}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-lg border transition-all
              ${isSelected
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {/* Task 7.5: Display count for each option */}
            {option.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
