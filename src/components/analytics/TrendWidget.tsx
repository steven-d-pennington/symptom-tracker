'use client';

import { TimeRangeSelector } from './TimeRangeSelector';
import { TrendChart } from './TrendChart';
import { TrendInterpretation } from './TrendInterpretation';
import { useDashboard } from './DashboardContext';

const METRIC_OPTIONS = [
    { value: 'symptom-frequency:all:daily', label: 'Symptom Frequency (Daily)' },
    { value: 'symptom-frequency:all:weekly', label: 'Symptom Frequency (Weekly)' },
    { value: 'symptom-frequency:all:monthly', label: 'Symptom Frequency (Monthly)' },
    { value: 'flare-severity:all', label: 'Flare Severity Trend' },
    { value: 'medication-adherence:overall', label: 'Medication Adherence' },
    { value: 'overallHealth', label: 'Overall Health (Legacy)' },
    { value: 'energyLevel', label: 'Energy Level (Legacy)' },
    { value: 'sleepQuality', label: 'Sleep Quality (Legacy)' },
    { value: 'stressLevel', label: 'Stress Level (Legacy)' },
];

const getMetricType = (metric: string): 'symptom' | 'symptom-frequency' | 'flare' | 'adherence' | 'energy' | 'sleep' | 'stress' | 'health' => {
    if (metric.startsWith('symptom-frequency')) return 'symptom-frequency';
    if (metric.startsWith('symptom:')) return 'symptom';
    if (metric.startsWith('flare-severity')) return 'flare';
    if (metric.startsWith('medication-adherence')) return 'adherence';
    if (metric === 'energyLevel') return 'energy';
    if (metric === 'sleepQuality') return 'sleep';
    if (metric === 'stressLevel') return 'stress';
    return 'health';
};

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

    const interpretation = analysis?.interpretation ?? null;
    const points = analysis?.series.points ?? [];
    const metadata = analysis?.series.metadata;

    const metricType = getMetricType(selectedMetric);

    const trendline = analysis?.result && points.length > 0
        ? points.map((point) => ({
            x: point.x,
            y: analysis.result!.slope * point.x + analysis.result!.intercept,
        }))
        : [];

    const adherenceSummary = metadata?.summary && 'perMedication' in metadata.summary
        ? metadata.summary as { overallAdherence?: number; perMedication?: Array<{ medicationId: string; medicationName: string; scheduled: number; taken: number; adherenceRate: number }>; totalScheduled?: number; totalTaken?: number }
        : null;

    const symptomSummary = metadata?.summary && 'totalOccurrences' in metadata.summary
        ? metadata.summary as { totalOccurrences: number; buckets: number }
        : null;

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
                            {METRIC_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
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
            {analysis && !loading && !error && points.length > 0 && (
                <div className="space-y-4">
                    {/* Trend Interpretation */}
                    {interpretation && (
                        <TrendInterpretation 
                            direction={interpretation.direction} 
                            confidence={interpretation.confidence} 
                        />
                    )}

                    {/* Trend Chart */}
                    <TrendChart
                        data={points}
                        trendline={trendline}
                        metricType={metricType}
                        datasetLabel={metadata?.label}
                        trendlineLabel={metadata?.label ? `${metadata.label} Trend` : undefined}
                    />

                    {/* Analysis Summary */}
                    <div className="p-3 border rounded-md bg-muted/50 space-y-3">
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Analysis Summary</h3>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                                <dt className="text-muted-foreground">Data Points:</dt>
                                <dd className="font-mono">{points.length}</dd>
                                {analysis.result && (
                                    <>
                                        <dt className="text-muted-foreground">Slope:</dt>
                                        <dd className="font-mono">{analysis.result.slope.toFixed(4)}</dd>
                                        <dt className="text-muted-foreground">R²:</dt>
                                        <dd className="font-mono">{analysis.result.rSquared.toFixed(4)}</dd>
                                        <dt className="text-muted-foreground">Intercept:</dt>
                                        <dd className="font-mono">{analysis.result.intercept.toFixed(4)}</dd>
                                    </>
                                )}
                            </dl>
                        </div>

                        {symptomSummary && (
                            <div className="text-sm">
                                <p>Total occurrences: <span className="font-semibold">{symptomSummary.totalOccurrences}</span></p>
                                <p>Aggregated buckets: <span className="font-semibold">{symptomSummary.buckets}</span></p>
                            </div>
                        )}

                        {adherenceSummary && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Medication Adherence</p>
                                <p className="text-sm">
                                    Overall adherence: <span className="font-semibold">{adherenceSummary.overallAdherence?.toFixed(2) ?? '0.00'}%</span>
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm border border-border rounded-md">
                                        <thead>
                                            <tr className="bg-muted text-left">
                                                <th className="px-3 py-2 font-medium">Medication</th>
                                                <th className="px-3 py-2 font-medium">Scheduled</th>
                                                <th className="px-3 py-2 font-medium">Taken</th>
                                                <th className="px-3 py-2 font-medium">Adherence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(adherenceSummary.perMedication ?? []).map((entry) => (
                                                <tr key={entry.medicationId} className="border-t border-border">
                                                    <td className="px-3 py-2">{entry.medicationName}</td>
                                                    <td className="px-3 py-2 font-mono">{entry.scheduled}</td>
                                                    <td className="px-3 py-2 font-mono">{entry.taken}</td>
                                                    <td className="px-3 py-2 font-mono">{entry.adherenceRate.toFixed(2)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* No Data State */}
            {(!analysis || points.length === 0) && !loading && !error && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No trend data available for the selected time range.</p>
                    <p className="text-sm mt-1">Try a different metric or time range.</p>
                </div>
            )}
        </div>
    );
};

