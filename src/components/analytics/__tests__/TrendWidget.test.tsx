import { jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { TrendWidget } from '../TrendWidget';
import { DashboardProvider } from '../DashboardContext';
import { trendAnalysisService } from '../../../lib/services/TrendAnalysisService';

jest.mock('../TrendChart', () => ({
    TrendChart: () => <div data-testid="mock-chart" />,
}));

jest.mock('../../../lib/services/TrendAnalysisService', () => ({
    trendAnalysisService: {
        analyzeTrend: jest.fn(),
    },
}));

const mockAnalyzeTrend = trendAnalysisService.analyzeTrend as jest.Mock;

describe('TrendWidget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show a loading state, then the chart on success', async () => {
        mockAnalyzeTrend.mockResolvedValue({ result: { slope: 1, intercept: 1, rSquared: 1 }, data: [] });

        render(
            <DashboardProvider>
                <TrendWidget />
            </DashboardProvider>
        );
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should show an error message on failure', async () => {
        mockAnalyzeTrend.mockRejectedValue(new Error('Analysis failed'));

        render(
            <DashboardProvider>
                <TrendWidget />
            </DashboardProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to analyze trend.')).toBeInTheDocument();
        });
    });
});
