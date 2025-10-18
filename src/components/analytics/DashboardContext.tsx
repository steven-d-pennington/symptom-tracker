'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { TrendAnalysisService, MetricSeries } from '../../lib/services/TrendAnalysisService';
import { RegressionResult } from '../../lib/utils/statistics/linearRegression';
import { useCurrentUser } from '../../lib/hooks/useCurrentUser';

interface AnalysisResult {
    result: RegressionResult | null;
    series: MetricSeries;
    interpretation?: { direction: string; confidence: string };
}

interface DashboardState {
    selectedMetric: string;
    selectedTimeRange: string;
    analysis: AnalysisResult | null;
    loading: boolean;
    error: string | null;
    retryCount: number;
    runAnalysis: (metric: string, timeRange: string) => Promise<void>;
    retry: () => Promise<void>;
    clearError: () => void;
}

const DashboardContext = createContext<DashboardState | undefined>(undefined);

const DEFAULT_METRIC = 'symptom-frequency:all:daily';
const DEFAULT_TIME_RANGE = '90d';

export const DashboardProvider = ({ children, service }: { children: ReactNode, service: TrendAnalysisService }) => {
    const { userId } = useCurrentUser();
    const [selectedMetric, setSelectedMetric] = useState<string>(DEFAULT_METRIC);
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>(DEFAULT_TIME_RANGE);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const runAnalysis = useCallback(async (metric: string, timeRange: string) => {
        if (!userId) {
            setError('No user found. Please complete onboarding first.');
            setLoading(false);
            return;
        }

        setSelectedMetric(metric);
        setSelectedTimeRange(timeRange);
        setLoading(true);
        setError(null);

        try {
            const series = await service.fetchMetricSeries(userId, metric, timeRange);
            const result = await service.computeTrend(userId, metric, timeRange, series);
            const interpretation = result ? service.generateInterpretation(result, series.points.length) : undefined;

            console.log('[Analytics] Data fetched:', {
                metric,
                timeRange,
                pointsCount: series.points.length,
                metadata: series.metadata,
                result,
            });

            setAnalysis({ result, series, interpretation });
            setRetryCount(0); // Reset retry count on success
            setLoading(false);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to analyze trend. Please try again.';
            setError(errorMessage);
            setLoading(false);

            // Note: Automatic retry removed for simpler state management
            // Users can manually retry using the retry button
        }
    }, [service, userId]);

    const retry = useCallback(async () => {
        setRetryCount(0);
        await runAnalysis(selectedMetric, selectedTimeRange);
    }, [runAnalysis, selectedMetric, selectedTimeRange]);

    const clearError = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    // Initial data fetch on mount (only when userId is available)
    useEffect(() => {
        if (userId) {
            runAnalysis(DEFAULT_METRIC, DEFAULT_TIME_RANGE);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const value = {
        selectedMetric,
        selectedTimeRange,
    analysis,
        loading,
        error,
        retryCount,
        runAnalysis,
        retry,
        clearError
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
