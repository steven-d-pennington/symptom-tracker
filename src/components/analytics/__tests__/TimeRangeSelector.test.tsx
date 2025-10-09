import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeSelector } from '../TimeRangeSelector';

describe('TimeRangeSelector', () => {
    it('should render the select element with options', () => {
        const handleChange = jest.fn();
        render(<TimeRangeSelector onChange={handleChange} />);
        
        expect(screen.getByLabelText('Select time range')).toBeInTheDocument();
        expect(screen.getAllByRole('option').length).toBe(5);
    });

    it('should call onChange when a new option is selected', () => {
        const handleChange = jest.fn();
        render(<TimeRangeSelector onChange={handleChange} />);
        
        const select = screen.getByLabelText('Select time range');
        fireEvent.change(select, { target: { value: '90d' } });

        expect(handleChange).toHaveBeenCalledWith('90d');
    });
});
