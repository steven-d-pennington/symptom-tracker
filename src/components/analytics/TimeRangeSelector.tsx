'use client';

const PRESET_OPTIONS = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last year', value: '1y' },
    { label: 'All time', value: 'all' },
];

interface TimeRangeSelectorProps {
    onChange: (timeRange: string) => void;
    value?: string;
    disabled?: boolean;
}

export const TimeRangeSelector = ({ onChange, value = '30d', disabled = false }: TimeRangeSelectorProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label htmlFor="time-range-selector" className="block text-sm font-medium mb-1">
                Time Range
            </label>
            <select
                id="time-range-selector"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {PRESET_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
