import { renderHook, act, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { TrendAnalysisService } from '../../lib/services/TrendAnalysisService';
import { ReactNode } from 'react';

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

// Mock TrendAnalysisService
const mockAnalyzeTrend = jest.fn();
const mockFetchMetricData = jest.fn();
const mockExtractTimeSeriesPoints = jest.fn();
const mockService = {
    analyzeTrend: mockAnalyzeTrend,
    fetchMetricData: mockFetchMetricData,
    extractTimeSeriesPoints: mockExtractTimeSeriesPoints,
} as unknown as TrendAnalysisService;

const wrapper = ({ children }: { children: ReactNode }) => (
    <DashboardProvider service={mockService}>{children}</DashboardProvider>
);

describe('DashboardContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mocks for successful rendering
        mockAnalyzeTrend.mockResolvedValue({ slope: 0.5, intercept: 10, rSquared: 0.8 });
        mockFetchMetricData.mockResolvedValue([]);
        mockExtractTimeSeriesPoints.mockReturnValue([]);
    });

    it('should initialize with default state and fetch analysis on mount', async () => {
        mockAnalyzeTrend.mockResolvedValue({ slope: 0.5, intercept: 10, rSquared: 0.8 });

        const { result } = renderHook(() => useDashboard(), { wrapper });

        // Wait for mount effect to complete
        await waitFor(() => {
            expect(result.current.analysis).not.toBe(null);
        });

        expect(result.current.selectedMetric).toBe('overallHealth');
        expect(result.current.selectedTimeRange).toBe('90d');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should fetch analysis on mount', async () => {
        const mockResult = { slope: 0.5, intercept: 10, rSquared: 0.8 };
        mockAnalyzeTrend.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await waitFor(() => {
            expect(mockAnalyzeTrend).toHaveBeenCalledWith('demo', 'overallHealth', '90d');
            expect(result.current.analysis?.result).toEqual(mockResult);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle analysis success', async () => {
        const mockResult = { slope: 1.2, intercept: 5, rSquared: 0.9 };
        mockAnalyzeTrend.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await act(async () => {
            await result.current.runAnalysis('energyLevel', '30d');
        });

        expect(mockAnalyzeTrend).toHaveBeenCalledWith('demo', 'energyLevel', '30d');
        expect(result.current.analysis?.result).toEqual(mockResult);
        expect(result.current.selectedMetric).toBe('energyLevel');
        expect(result.current.selectedTimeRange).toBe('30d');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.retryCount).toBe(0);
    });

    it('should handle analysis error', async () => {
        const errorMessage = 'Network error';
        mockAnalyzeTrend.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await act(async () => {
            await result.current.runAnalysis('sleepQuality', '7d');
        });

        await waitFor(() => {
            expect(result.current.error).toBe(errorMessage);
        });

        expect(result.current.loading).toBe(false);
    });

    it('should handle manual retry after error', async () => {
        mockAnalyzeTrend
            .mockResolvedValueOnce({ slope: 0.5, intercept: 10, rSquared: 0.8 }) // Mount
            .mockRejectedValueOnce(new Error('Temporary error')) // Manual call
            .mockResolvedValueOnce({ slope: 0.3, intercept: 8, rSquared: 0.7 }); // Retry

        const { result } = renderHook(() => useDashboard(), { wrapper });

        // Wait for initial mount to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.runAnalysis('stressLevel', '90d');
        });

        // Wait for error
        await waitFor(() => {
            expect(result.current.error).toBe('Temporary error');
        });

        // Manual retry
        await act(async () => {
            await result.current.retry();
        });

        // Wait for retry to complete
        await waitFor(() => {
            expect(result.current.analysis).not.toBe(null);
            expect(result.current.error).toBe(null);
        });
    });

    it('should reset retry count on manual retry', async () => {
        mockAnalyzeTrend
            .mockRejectedValueOnce(new Error('Error 1'))
            .mockResolvedValueOnce({ slope: 0.1, intercept: 2, rSquared: 0.5 });

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await act(async () => {
            await result.current.runAnalysis('overallHealth', '30d');
        });

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        await act(async () => {
            await result.current.retry();
        });

        await waitFor(() => {
            expect(result.current.analysis).not.toBe(null);
            expect(result.current.retryCount).toBe(0);
        });
    });

    it('should clear error', async () => {
        mockAnalyzeTrend.mockRejectedValue(new Error('Test error'));

        const { result } = renderHook(() => useDashboard(), { wrapper });

        await act(async () => {
            await result.current.runAnalysis('energyLevel', '90d');
        });

        await waitFor(() => {
            expect(result.current.error).toBeTruthy();
        });

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe(null);
        expect(result.current.retryCount).toBe(0);
    });

    it('should set loading state during analysis', async () => {
        mockAnalyzeTrend.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ slope: 0, intercept: 0, rSquared: 0 }), 100)));

        const { result } = renderHook(() => useDashboard(), { wrapper });

        act(() => {
            result.current.runAnalysis('sleepQuality', '7d');
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useDashboard());
        }).toThrow('useDashboard must be used within a DashboardProvider');

        consoleSpy.mockRestore();
    });
});
