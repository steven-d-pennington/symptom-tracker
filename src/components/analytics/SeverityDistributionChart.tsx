/**
 * SeverityDistributionChart Component (Story 3.3 - Task 8)
 *
 * Bar chart displaying distribution of flare severities by range.
 * Uses Chart.js for visualization with color-coded severity levels.
 *
 * AC3.3.4: Visual charts for metrics - Severity Distribution
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
import { calculateSeverityDistribution } from '@/lib/utils/histogramUtils';

// Task 8.3: Import and register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Props for SeverityDistributionChart component (Task 8.2)
 */
export interface SeverityDistributionChartProps {
  /** Array of severity values (1-10 scale) */
  severities: number[];

  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * SeverityDistributionChart component for visualizing severity distribution.
 * Displays count of flares per severity range (Mild, Moderate, Severe) using a bar chart.
 *
 * @param props - SeverityDistributionChart properties
 * @returns Rendered distribution chart
 */
export function SeverityDistributionChart({
  severities,
  isLoading,
}: SeverityDistributionChartProps) {
  // Task 8.11: Handle loading state with skeleton
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-100 animate-pulse h-64" />
    );
  }

  // Task 8.3: Use calculateSeverityDistribution utility to get range data
  const ranges = calculateSeverityDistribution(severities);

  // Task 8.4: Configure Chart.js with type 'bar'
  const chartData = {
    labels: ranges.map(r => r.label), // Task 8.6: Range labels (Mild/Moderate/Severe)
    datasets: [
      {
        label: 'Number of Flares',
        data: ranges.map(r => r.count),
        // Task 8.5: Bar colors matching severity colors
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',  // Green (#10b981)
          'rgba(234, 179, 8, 0.6)',   // Yellow (#eab308)
          'rgba(239, 68, 68, 0.6)',   // Red (#ef4444)
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Task 8.7-8.10: Configure chart options
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Task 8.9: Responsive configuration
    scales: {
      x: {
        // Task 8.6: Categorical labels
        title: {
          display: true,
          text: 'Severity Range',
        },
      },
      y: {
        // Task 8.7: Integer ticks, label "Number of Flares"
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
        // Task 8.8: Chart title
        display: true,
        text: 'Severity Distribution',
      },
    },
  };

  // Task 8.10: Calculate ARIA label summarizing severity breakdown
  const totalFlares = severities.length;
  const severityBreakdown = ranges.map(r => `${r.count} ${r.label.toLowerCase()}`).join(', ');
  const ariaLabel = `Severity distribution showing ${totalFlares} total flares: ${severityBreakdown}`;

  return (
    <div className="border rounded-lg p-4 bg-white" aria-label={ariaLabel}>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
