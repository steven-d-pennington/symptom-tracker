/**
 * FlareTrendChart Component (Story 3.4 - Task 4)
 *
 * Line chart displaying flare frequency and average severity trends over time.
 * Uses Chart.js with dual y-axes and linear regression trend line.
 *
 * AC3.4.2: Line chart displays flare frequency over time
 * AC3.4.3: Overlay shows average severity per month
 * AC3.4.4: Trend line indicates overall trajectory
 * AC3.4.6: Interactive chart with hover and details
 */

'use client';

import { forwardRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { TrendAnalysis } from '@/types/analytics';
import { format } from 'date-fns';

// Task 4.5: Register Chart.js components and plugins
ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

/**
 * Props for FlareTrendChart component (Task 4.2)
 */
export interface FlareTrendChartProps {
  /** Trend analysis data with monthly buckets */
  trendAnalysis: TrendAnalysis | null;

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * FlareTrendChart component for visualizing flare trends over time.
 * Displays frequency and severity on dual y-axes with regression trend line.
 *
 * @param props - FlareTrendChart properties
 * @returns Rendered line chart with trend analysis
 */
export const FlareTrendChart = forwardRef<any, FlareTrendChartProps>(
  function FlareTrendChart({ trendAnalysis, isLoading }, ref) {
    // Task 4.6: Handle loading state - show skeleton loader
    if (isLoading) {
      return (
        <div className="border rounded-lg p-4 bg-gray-100 animate-pulse h-96" />
      );
    }

    // Task 4.7: Handle insufficient data - show empty state
    if (!trendAnalysis || trendAnalysis.trendDirection === 'insufficient-data' || trendAnalysis.dataPoints.length === 0) {
      return (
        <div className="border rounded-lg p-4 bg-white h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Insufficient Data</p>
            <p className="text-sm mt-2">
              At least 3 months of flare data needed to show trends
            </p>
          </div>
        </div>
      );
    }

    // Prepare data for Chart.js
    const dataPoints = trendAnalysis.dataPoints;

    // Task 4.9: Dataset 1 (Flare Frequency) - blue line, left y-axis
    const frequencyData = dataPoints.map(dp => ({
      x: dp.monthTimestamp,
      y: dp.flareCount,
    }));

    // Task 4.10: Dataset 2 (Average Severity) - orange/red line, right y-axis
    const severityData = dataPoints.map(dp => ({
      x: dp.monthTimestamp,
      y: dp.averageSeverity,
    }));

    // Task 4.8: Configure Chart.js with type 'line' and dual y-axes
    const chartData = {
      datasets: [
        {
          label: 'Flare Frequency',
          data: frequencyData,
          borderColor: 'rgb(59, 130, 246)', // Blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4, // Smooth curves
          yAxisID: 'y-frequency',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Average Severity',
          data: severityData,
          borderColor: 'rgb(249, 115, 22)', // Orange-500
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2,
          tension: 0.4, // Smooth curves
          yAxisID: 'y-severity',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    // Determine trend line color based on direction
    const trendColors = {
      improving: 'rgb(34, 197, 94)', // Green-500
      stable: 'rgb(107, 114, 128)', // Gray-500
      declining: 'rgb(239, 68, 68)', // Red-500
    };

    const trendColor = trendColors[trendAnalysis.trendDirection] || trendColors.stable;

    // Calculate trend line points for annotation
    const firstIndex = 0;
    const lastIndex = dataPoints.length - 1;
    const trendStart = trendAnalysis.trendLine.slope * firstIndex + trendAnalysis.trendLine.intercept;
    const trendEnd = trendAnalysis.trendLine.slope * lastIndex + trendAnalysis.trendLine.intercept;

    // Task 4.8-4.17: Configure chart options
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        // Task 4.11: Configure x-axis with time scale
        x: {
          type: 'time',
          time: {
            unit: 'month',
            displayFormats: {
              month: 'MMM yyyy', // Format: Jan 2024
            },
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          title: {
            display: true,
            text: 'Month',
          },
        },
        // Task 4.12: Left y-axis for frequency (integers, starts at 0)
        'y-frequency': {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          title: {
            display: true,
            text: 'Flare Count',
            color: 'rgb(59, 130, 246)',
          },
        },
        // Task 4.12: Right y-axis for severity (1-10 scale)
        'y-severity': {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
          },
          grid: {
            display: false, // Don't show grid lines for secondary axis
          },
          title: {
            display: true,
            text: 'Average Severity',
            color: 'rgb(249, 115, 22)',
          },
        },
      },
      plugins: {
        // Task 4.15: Configure legend at bottom
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
        title: {
          display: false,
        },
        // Task 4.14: Configure tooltip with proper formatting
        tooltip: {
          callbacks: {
            title: (context) => {
              if (context[0]?.parsed?.x) {
                return format(new Date(context[0].parsed.x), 'MMM yyyy');
              }
              return '';
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;

              if (context.datasetIndex === 0) {
                // Frequency dataset
                return `${label}: ${value} flare${value !== 1 ? 's' : ''}`;
              } else {
                // Severity dataset
                return value !== null ? `${label}: ${value.toFixed(1)}/10` : `${label}: N/A`;
              }
            },
          },
        },
        // Task 4.13: Add trend line annotation
        annotation: {
          annotations: {
            trendLine: {
              type: 'line',
              yMin: trendStart,
              yMax: trendEnd,
              xMin: dataPoints[firstIndex].monthTimestamp,
              xMax: dataPoints[lastIndex].monthTimestamp,
              borderColor: trendColor,
              borderWidth: 2,
              borderDash: [5, 5],
              yScaleID: 'y-frequency',
              label: {
                display: true,
                content: `Trend: ${trendAnalysis.trendDirection.charAt(0).toUpperCase() + trendAnalysis.trendDirection.slice(1)}`,
                position: 'end',
                backgroundColor: trendColor,
                color: 'white',
                padding: 4,
                font: {
                  size: 11,
                  weight: 'bold',
                },
              },
            },
          },
        },
      },
    };

    // Task 4.17: Add ARIA label summarizing chart data
    const ariaLabel = `Flare trend chart showing ${dataPoints.length} months of data. ` +
      `Trend direction: ${trendAnalysis.trendDirection}. ` +
      `Total flares range from ${Math.min(...frequencyData.map(d => d.y))} to ${Math.max(...frequencyData.map(d => d.y))} per month.`;

    // Task 4.18: Render in container div with h-96 height
    return (
      <div className="border rounded-lg p-4 bg-white" aria-label={ariaLabel}>
        <div className="h-96">
          <Line ref={ref} data={chartData} options={options} />
        </div>
      </div>
    );
  }
);
