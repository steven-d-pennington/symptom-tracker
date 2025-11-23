import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Chart, Filler } from 'chart.js';

Chart.register(Filler);

jest.unstable_mockModule('react-chartjs-2', () => ({
    Line: () => <canvas role="img" />,
}));

describe('TrendChart', () => {
    it('should render the chart canvas', async () => {
        const { TrendChart } = await import('../TrendChart');
        const mockData = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }));
        render(<TrendChart data={mockData} trendline={mockData} />);
        
        const canvas = screen.getByRole('img');
        expect(canvas).toBeInTheDocument();
    });
});
