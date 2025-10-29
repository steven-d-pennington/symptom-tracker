/**
 * TrendAnalysisSection Component (Story 3.4 - Task 6)
 *
 * Main section component for Flare Trend Analysis feature.
 * Displays trend chart with frequency and severity over time.
 * Includes trend direction indicator and chart export functionality.
 *
 * AC3.4.1: Analytics page displays Flare Trends visualization
 * AC3.4.5: Time range selector with extended options
 * AC3.4.7: Export chart as image for medical consultations
 */

'use client';

import { useRef, useState } from 'react';
import { TrendAnalysis, TimeRange } from '@/types/analytics';
import { FlareTrendChart } from './FlareTrendChart';
import { exportChartAsImage } from '@/lib/utils/chartExport';
import { Download, TrendingDown, TrendingUp, Minus } from 'lucide-react';

/**
 * Props for TrendAnalysisSection component (Task 6.2)
 */
export interface TrendAnalysisSectionProps {
  /** Trend analysis data or null if loading/unavailable */
  trendAnalysis: TrendAnalysis | null;

  /** Loading state indicator */
  isLoading: boolean;

  /** Selected time range for context */
  timeRange: TimeRange;
}

/**
 * TrendAnalysisSection component for displaying flare trend analysis.
 * Shows interactive line chart with trend direction and export capability.
 *
 * @param props - TrendAnalysisSection properties
 * @returns Rendered trend analysis section
 */
export function TrendAnalysisSection({
  trendAnalysis,
  isLoading,
  timeRange,
}: TrendAnalysisSectionProps) {
  // Task 6.4: Create chart ref using useRef for export functionality
  const chartRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Task 6.10: Handle export button click
  const handleExportClick = async () => {
    try {
      setIsExporting(true);
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const filename = `flare-trends-${today}.png`;
      await exportChartAsImage(chartRef, filename);
    } catch (err) {
      console.error('Failed to export chart:', err);
      // Error is already logged in exportChartAsImage
    } finally {
      setIsExporting(false);
    }
  };

  // Determine trend indicator properties
  const getTrendIndicator = () => {
    if (!trendAnalysis || isLoading) {
      return null;
    }

    const trendConfig = {
      improving: {
        label: 'Improving',
        color: 'bg-green-100 text-green-800',
        icon: TrendingDown,
      },
      stable: {
        label: 'Stable',
        color: 'bg-gray-100 text-gray-800',
        icon: Minus,
      },
      declining: {
        label: 'Declining',
        color: 'bg-red-100 text-red-800',
        icon: TrendingUp,
      },
      'insufficient-data': {
        label: 'Insufficient Data',
        color: 'bg-gray-100 text-gray-600',
        icon: Minus,
      },
    };

    return trendConfig[trendAnalysis.trendDirection];
  };

  const trendIndicator = getTrendIndicator();

  return (
    <div className="space-y-4">
      {/* Task 6.6: Render section with header and description */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flare Trends</h2>
          <p className="text-gray-600 mt-1">
            Track your flare patterns over time to assess trajectory
          </p>
        </div>

        {/* Task 6.7: Display trend direction indicator badge */}
        {trendIndicator && !isLoading && (
          <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${trendIndicator.color}`}>
            <trendIndicator.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{trendIndicator.label}</span>
          </div>
        )}
      </div>

      {/* Task 6.8: Render FlareTrendChart with ref and all required props */}
      <FlareTrendChart
        ref={chartRef}
        trendAnalysis={trendAnalysis}
        isLoading={isLoading}
      />

      {/* Task 6.9: Render "Export Chart" button below chart */}
      {!isLoading && trendAnalysis && trendAnalysis.trendDirection !== 'insufficient-data' && (
        <div className="flex justify-end">
          <button
            onClick={handleExportClick}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Export chart as PNG image"
          >
            {/* Task 6.11: Show loading spinner on export button during export operation */}
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Chart</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
