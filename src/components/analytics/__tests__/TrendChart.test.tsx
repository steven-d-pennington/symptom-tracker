import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { TrendChart } from '../TrendChart';

jest.mock('react-chartjs-2', () => ({
    Line: () => <canvas role="img" />,
}));

describe('TrendChart', () => {
    it('should render the chart canvas', () => {
        const mockData = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }));
        render(<TrendChart data={mockData} trendline={mockData} />);
        
        const canvas = screen.getByRole('img');
        expect(canvas).toBeInTheDocument();
    });
});
