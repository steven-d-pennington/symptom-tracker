import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrendWidget } from '../TrendWidget';
import { DashboardProvider } from '../DashboardContext';
import { TrendAnalysisService } from '@/lib/services/TrendAnalysisService';

// Mock the useCurrentUser hook
jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(() => ({ userId: 'test-user-id' })),
}));

// Mock the TrendChart component
jest.mock('../TrendChart', () => ({
  TrendChart: () => <div data-testid="mock-chart">Mock Chart</div>,
}));

describe('TrendWidget', () => {
    it('should show a loading state and then display the chart', async () => {
        const mockService = {
          analyzeTrend: jest.fn(() => Promise.resolve({
            slope: 0.5,
            intercept: 10,
            rSquared: 0.8,
          })),
          fetchMetricData: jest.fn(() => Promise.resolve([])),
          extractTimeSeriesPoints: jest.fn(() => []),
        } as unknown as TrendAnalysisService;

        render(
            <DashboardProvider service={mockService}>
                <TrendWidget />
            </DashboardProvider>
        );
        
        // Check for skeleton loading state (animated pulse div)
        const loadingSkeleton = document.querySelector('.animate-pulse');
        expect(loadingSkeleton).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
        });
    });
});
