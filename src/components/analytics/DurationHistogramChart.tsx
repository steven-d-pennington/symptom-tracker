/**
 * DurationHistogramChart Component (Story 3.3 - Task 7)
 *
 * Bar chart displaying distribution of flare durations in day buckets.
 * Uses Chart.js for visualization with responsive configuration.
 *
 * AC3.3.4: Visual charts for metrics - Duration Histogram
 */

'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { calculateDurationHistogram } from '@/lib/utils/histogramUtils';

// Task 7.3: Import and register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Props for DurationHistogramChart component (Task 7.2)
 */
export interface DurationHistogramChartProps {
  /** Array of duration values in days */
  durations: number[];

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * DurationHistogramChart component for visualizing duration distribution.
 * Displays count of flares per duration bucket using a bar chart.
 *
 * @param props - DurationHistogramChart properties
 * @returns Rendered histogram chart
 */
export function DurationHistogramChart({
  durations,
  isLoading,
}: DurationHistogramChartProps) {
  // Task 7.12: Handle loading state with skeleton
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-100 animate-pulse h-64" />
    );
  }

  // Task 7.4: Use calculateDurationHistogram utility to get bucket data
  const buckets = calculateDurationHistogram(durations);

  // Task 7.5: Configure Chart.js with type 'bar'
  const chartData = {
    labels: buckets.map(b => b.label), // Task 7.7: Bucket labels
    datasets: [
      {
        label: 'Number of Flares',
        data: buckets.map(b => b.count),
        // Task 7.6: Gradient from light blue to dark blue
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',   // Blue-500
          'rgba(37, 99, 235, 0.6)',    // Blue-600
          'rgba(29, 78, 216, 0.6)',    // Blue-700
          'rgba(30, 64, 175, 0.6)',    // Blue-800
          'rgba(30, 58, 138, 0.6)',    // Blue-900
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(37, 99, 235, 1)',
          'rgba(29, 78, 216, 1)',
          'rgba(30, 64, 175, 1)',
          'rgba(30, 58, 138, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task 7.8-7.11: Configure chart options
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Task 7.10: Responsive configuration
    scales: {
      x: {
        // Task 7.7: Categorical labels for buckets
        title: {
          display: true,
          text: 'Duration',
        },
      },
      y: {
        // Task 7.8: Integer ticks, label "Number of Flares"
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        title: {
          display: true,
          text: 'Number of Flares',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        // Task 7.9: Chart title
        display: true,
        text: 'Flare Duration Distribution',
      },
    },
  };

  // Task 7.11: Calculate ARIA label summarizing data
  const totalFlares = durations.length;
  const bucketsWithData = buckets.filter(b => b.count > 0).length;
  const ariaLabel = `Duration histogram showing ${totalFlares} flares across ${bucketsWithData} buckets`;

  return (
    // Task 7.13: Use canvas element for Chart.js rendering
    <div className="border rounded-lg p-4 bg-white" aria-label={ariaLabel}>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
