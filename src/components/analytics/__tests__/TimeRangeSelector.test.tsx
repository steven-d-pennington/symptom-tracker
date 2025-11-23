/**
 * TimeRangeSelector Component Tests (Story 3.1 - Task 10)
 *
 * Test suite for TimeRangeSelector component.
 * Tests radio button group rendering, selection, and accessibility.
 */

import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector } from '../TimeRangeSelector';
import { TimeRange } from '@/types/analytics';

describe('TimeRangeSelector', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('should render radiogroup with 4 options (AC3.1.3)', () => {
        render(<TimeRangeSelector value="last90d" onChange={mockOnChange} />);

        const radiogroup = screen.getByRole('radiogroup');
        expect(radiogroup).toBeInTheDocument();
        expect(radiogroup).toHaveAttribute('aria-label', 'Select time range for analytics');

        // Verify all 4 options are rendered
        expect(screen.getByText('Last 30 days')).toBeInTheDocument();
        expect(screen.getByText('Last 90 days')).toBeInTheDocument();
        expect(screen.getByText('Last Year')).toBeInTheDocument();
        expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('should highlight the selected option', () => {
        const { container } = render(<TimeRangeSelector value="last90d" onChange={mockOnChange} />);

        // Find the label containing "Last 90 days" and check if it has selected styles
        const selectedLabel = screen.getByText('Last 90 days').closest('label');
        expect(selectedLabel).toHaveClass('bg-blue-500', 'text-white');
    });

    it('should call onChange when a different option is selected', () => {
        render(<TimeRangeSelector value="last90d" onChange={mockOnChange} />);

        const last30dOption = screen.getByLabelText('Last 30 days');
        fireEvent.click(last30dOption);

        expect(mockOnChange).toHaveBeenCalledWith('last30d');
    });

    it('should handle all time range options', () => {
        const { rerender } = render(<TimeRangeSelector value="last30d" onChange={mockOnChange} />);

        const timeRanges: TimeRange[] = ['last30d', 'last90d', 'lastYear', 'allTime'];

        timeRanges.forEach(range => {
            rerender(<TimeRangeSelector value={range} onChange={mockOnChange} />);
            const radio = screen.getByLabelText(
                range === 'last30d' ? 'Last 30 days' :
                range === 'last90d' ? 'Last 90 days' :
                range === 'lastYear' ? 'Last Year' : 'All Time'
            );
            expect(radio).toBeChecked();
        });
    });

    it('should be keyboard accessible', () => {
        render(<TimeRangeSelector value="last90d" onChange={mockOnChange} />);

        const radiogroup = screen.getByRole('radiogroup');
        expect(radiogroup).toBeInTheDocument();
    });
});
