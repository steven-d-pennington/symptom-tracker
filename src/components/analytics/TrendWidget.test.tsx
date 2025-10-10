import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrendWidget } from './TrendWidget';
import { DashboardProvider } from './DashboardContext';
import { TrendAnalysisService } from '../../lib/services/TrendAnalysisService';

// Mock useCurrentUser hook
jest.mock('../../lib/hooks/useCurrentUser', () => ({
    useCurrentUser: () => ({
        userId: 'demo',
        user: {
            id: 'demo',
            name: 'Demo User',
            email: 'demo@example.com',
        },
        isLoading: false,
        isAuthenticated: true,
    }),
}));

// Mock dependencies
jest.mock('./TrendChart', () => ({
    TrendChart: () => <div data-testid="trend-chart">Mocked TrendChart</div>
}));

jest.mock('./TimeRangeSelector', () => ({
    TimeRangeSelector: ({ onChange, value, disabled }: { onChange: (v: string) => void, value?: string, disabled?: boolean }) => (
        <select
            data-testid="time-range-selector"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
        </select>
    )
}));

const mockAnalyzeTrend = jest.fn();
const mockFetchMetricData = jest.fn();
const mockExtractTimeSeriesPoints = jest.fn();
const mockService = {
    analyzeTrend: mockAnalyzeTrend,
    fetchMetricData: mockFetchMetricData,
    extractTimeSeriesPoints: mockExtractTimeSeriesPoints,
} as unknown as TrendAnalysisService;

const renderWithProvider = (component: React.ReactElement) => {
    return render(
        <DashboardProvider service={mockService}>
            {component}
        </DashboardProvider>
    );
};

describe('TrendWidget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mocks for successful rendering
        mockFetchMetricData.mockResolvedValue([]);
        mockExtractTimeSeriesPoints.mockReturnValue([]);
    });

    it('should render loading state', async () => {
        mockAnalyzeTrend.mockImplementation(() => new Promise(() => {})); // Never resolves

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            // Check for skeleton loading state (animated pulse div)
            const loadingSkeleton = document.querySelector('.animate-pulse');
            expect(loadingSkeleton).toBeInTheDocument();
        });
    });

    it('should render error state with retry button', async () => {
        mockAnalyzeTrend.mockRejectedValue(new Error('Test error'));

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByText(/Error Loading Trend/i)).toBeInTheDocument();
            expect(screen.getByText(/Test error/i)).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
    });

    it('should render success state with analysis data', async () => {
        const mockResult = { slope: 0.5, intercept: 10, rSquared: 0.85 };
        mockAnalyzeTrend.mockResolvedValue(mockResult);

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
        });

        expect(screen.getByText(/Analysis Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/0.5000/i)).toBeInTheDocument(); // Slope
        expect(screen.getByText(/0.8500/i)).toBeInTheDocument(); // R²
        expect(screen.getByText(/10.0000/i)).toBeInTheDocument(); // Intercept
    });

    it('should render no data state when analysis is null', async () => {
        mockAnalyzeTrend.mockResolvedValue(null);

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByText(/No trend data available/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Try a different metric or time range/i)).toBeInTheDocument();
    });

    it('should change metric on select', async () => {
        mockAnalyzeTrend.mockResolvedValue({ slope: 0.3, intercept: 5, rSquared: 0.7 });

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
        });

        const metricSelect = screen.getByLabelText(/metric/i);
        fireEvent.change(metricSelect, { target: { value: 'energyLevel' } });

        await waitFor(() => {
            expect(mockAnalyzeTrend).toHaveBeenCalledWith('demo', 'energyLevel', '90d');
        });
    });

    it('should change time range on select', async () => {
        mockAnalyzeTrend.mockResolvedValue({ slope: 0.2, intercept: 8, rSquared: 0.6 });

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
        });

        const timeRangeSelect = screen.getByTestId('time-range-selector');
        fireEvent.change(timeRangeSelect, { target: { value: '30d' } });

        await waitFor(() => {
            expect(mockAnalyzeTrend).toHaveBeenCalledWith('demo', 'overallHealth', '30d');
        });
    });

    it('should disable inputs during loading', async () => {
        let resolveAnalysis: (value: unknown) => void;
        const analysisPromise = new Promise(resolve => {
            resolveAnalysis = resolve;
        });
        mockAnalyzeTrend.mockReturnValue(analysisPromise);

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            const metricSelect = screen.getByLabelText(/metric/i);
            const timeRangeSelect = screen.getByTestId('time-range-selector');

            expect(metricSelect).toBeDisabled();
            expect(timeRangeSelect).toBeDisabled();
        });

        // Resolve the promise
        resolveAnalysis!({ slope: 0.1, intercept: 3, rSquared: 0.5 });
    });

    it('should retry on button click', async () => {
        mockAnalyzeTrend
            .mockRejectedValueOnce(new Error('First error'))
            .mockResolvedValueOnce({ slope: 0.4, intercept: 7, rSquared: 0.75 });

        renderWithProvider(<TrendWidget />);

        await waitFor(() => {
            expect(screen.getByText(/Error Loading Trend/i)).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
        });
    });

});
