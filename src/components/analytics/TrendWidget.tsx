'use client';

import { TimeRangeSelector } from './TimeRangeSelector';
import { TrendChart } from './TrendChart';
import { useDashboard } from './DashboardContext';

export const TrendWidget = () => {
    const {
        selectedMetric,
        selectedTimeRange,
        analysis,
        loading,
        error,
        runAnalysis,
        retry
    } = useDashboard();

    const handleTimeRangeChange = (timeRange: string) => {
        runAnalysis(selectedMetric, timeRange);
    };

    const handleMetricChange = (metric: string) => {
        runAnalysis(metric, selectedTimeRange);
    };

    return (
        <div className="p-4 border rounded-lg bg-card">
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Trend Analysis</h2>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="metric-select" className="block text-sm font-medium mb-1">
                            Metric
                        </label>
                        <select
                            id="metric-select"
                            value={selectedMetric}
                            onChange={(e) => handleMetricChange(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            disabled={loading}
                        >
                            <option value="overallHealth">Overall Health</option>
                            <option value="energyLevel">Energy Level</option>
                            <option value="sleepQuality">Sleep Quality</option>
                            <option value="stressLevel">Stress Level</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <TimeRangeSelector
                            onChange={handleTimeRangeChange}
                            value={selectedTimeRange}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="space-y-4 animate-pulse">
                    <div className="h-64 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="p-4 border border-destructive rounded-md bg-destructive/10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-destructive">Error Loading Trend</h3>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                        <button
                            onClick={retry}
                            className="px-3 py-1 text-sm border rounded-md hover:bg-muted"
                            disabled={loading}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Success State */}
            {analysis && analysis.result && !loading && !error && (
                <div>
                    <TrendChart
                        data={Array.isArray(analysis.data) ? analysis.data : []}
                        trendline={analysis.result ? [
                            { x: 0, y: analysis.result.intercept },
                            { x: 1, y: analysis.result.slope + analysis.result.intercept }
                        ] : []}
                    />
                    <div className="mt-4 p-3 border rounded-md bg-muted/50">
                        <h3 className="text-sm font-semibold mb-2">Analysis Summary</h3>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                            <dt className="text-muted-foreground">Data Points:</dt>
                            <dd className="font-mono">{Array.isArray(analysis.data) ? analysis.data.length : 0}</dd>
                            <dt className="text-muted-foreground">Slope:</dt>
                            <dd className="font-mono">{analysis.result.slope.toFixed(4)}</dd>
                            <dt className="text-muted-foreground">R²:</dt>
                            <dd className="font-mono">{analysis.result.rSquared.toFixed(4)}</dd>
                            <dt className="text-muted-foreground">Intercept:</dt>
                            <dd className="font-mono">{analysis.result.intercept.toFixed(4)}</dd>
                        </dl>
                    </div>
                </div>
            )}

            {/* No Data State */}
            {(!analysis || !analysis.result) && !loading && !error && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No trend data available for the selected time range.</p>
                    <p className="text-sm mt-1">Try a different metric or time range.</p>
                </div>
            )}
        </div>
    );
};

