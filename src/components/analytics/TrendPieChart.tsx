/**
 * TrendPieChart Component (Story 3.3 - Task 9)
 *
 * Pie chart displaying proportion of flares by trend outcome.
 * Uses Chart.js for visualization with color-coded trend segments.
 *
 * AC3.3.4: Visual charts for metrics - Trend Pie Chart
 */

'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Task 9.3: Import and register Chart.js components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Trend distribution interface (Task 9.2)
 */
interface TrendDistribution {
  /** Percentage of flares with improving trend */
  improving: number;
  /** Percentage of flares with stable trend */
  stable: number;
  /** Percentage of flares with worsening trend */
  worsening: number;
  /** Percentage of flares with no trend data */
  noData: number;
}

/**
 * Props for TrendPieChart component (Task 9.2)
 */
export interface TrendPieChartProps {
  /** Trend distribution percentages */
  trendDistribution: TrendDistribution;

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * TrendPieChart component for visualizing trend outcome distribution.
 * Displays percentage breakdown of flare trends using a pie chart.
 *
 * @param props - TrendPieChart properties
 * @returns Rendered pie chart
 */
export function TrendPieChart({
  trendDistribution,
  isLoading,
}: TrendPieChartProps) {
  // Task 9.10: Handle loading state with skeleton
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-100 animate-pulse h-64" />
    );
  }

  // Task 9.11: Handle empty data
  const hasData = (
    trendDistribution.improving > 0 ||
    trendDistribution.stable > 0 ||
    trendDistribution.worsening > 0 ||
    trendDistribution.noData > 0
  );

  if (!hasData) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="text-gray-500 text-center py-8">
          No trend data available
        </div>
      </div>
    );
  }

  // Task 9.3: Configure Chart.js with type 'pie'
  const chartData = {
    labels: ['Improving', 'Stable', 'Worsening', 'No Data'], // Task 9.3: Trend labels
    datasets: [
      {
        data: [
          trendDistribution.improving,
          trendDistribution.stable,
          trendDistribution.worsening,
          trendDistribution.noData,
        ],
        // Task 9.4: Segment colors matching trend colors from Story 3.2
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',  // Green (#10b981)
          'rgba(107, 114, 128, 0.6)', // Gray (#6b7280)
          'rgba(239, 68, 68, 0.6)',   // Red (#ef4444)
          'rgba(209, 213, 219, 0.6)', // Light gray (#d1d5db)
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(107, 114, 128, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(209, 213, 219, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task 9.5-9.9: Configure chart options
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false, // Task 9.8: Responsive configuration
    plugins: {
      legend: {
        // Task 9.5: Legend position
        position: 'bottom' as const, // Use 'bottom' for all screen sizes for consistency
      },
      title: {
        // Task 9.7: Chart title
        display: true,
        text: 'Flare Trend Outcomes',
      },
      tooltip: {
        // Task 9.6: Tooltips showing percentage and count
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  // Task 9.9: Calculate ARIA label with percentages
  const ariaLabel = `Pie chart showing ${trendDistribution.improving}% improving, ${trendDistribution.stable}% stable, ${trendDistribution.worsening}% worsening, ${trendDistribution.noData}% no data`;

  return (
    <div className="border rounded-lg p-4 bg-white" aria-label={ariaLabel}>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
