/**
 * CorrelationScatterPlot Component (Story 6.4 - Task 5)
 *
 * Interactive scatter plot using Chart.js to visualize correlation.
 * X-axis = item1 consumption/exposure frequency
 * Y-axis = item2 symptom severity
 * Shows data points with trend line overlay.
 *
 * AC6.4.4: Create correlation scatter plot visualization
 */

'use client';

import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterDataPoint {
  x: number;
  y: number;
  date?: string;
}

interface CorrelationScatterPlotProps {
  item1Name: string;
  item2Name: string;
  dataPoints: ScatterDataPoint[];
  coefficient: number;
}

/**
 * Calculate linear regression trend line
 *
 * Simple linear regression: y = mx + b
 *
 * @param points - Data points
 * @returns Trend line points
 */
function calculateTrendLine(points: ScatterDataPoint[]): ScatterDataPoint[] {
  if (points.length < 2) {
    return [];
  }

  // Calculate means
  const n = points.length;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate slope (m)
  const numerator = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
  const denominator = points.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0);

  if (denominator === 0) {
    return [];
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Generate trend line points
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));

  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
}

/**
 * CorrelationScatterPlot Component
 *
 * Displays scatter plot with:
 * - X-axis: item1 value (frequency/amount)
 * - Y-axis: item2 value (severity/frequency)
 * - Data points for each day in time range
 * - Trend line showing correlation direction
 * - Interactive tooltips on hover
 * - Responsive sizing
 *
 * @param item1Name - Name of first item (e.g., "Dairy")
 * @param item2Name - Name of second item (e.g., "Headache")
 * @param dataPoints - Array of scatter data points
 * @param coefficient - Correlation coefficient (ρ)
 */
export function CorrelationScatterPlot({
  item1Name,
  item2Name,
  dataPoints,
  coefficient,
}: CorrelationScatterPlotProps) {
  const trendLine = calculateTrendLine(dataPoints);

  const chartData = {
    datasets: [
      {
        label: 'Data Points',
        data: dataPoints,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Trend Line',
        data: trendLine,
        type: 'line' as const,
        backgroundColor: 'transparent',
        borderColor: 'rgba(239, 68, 68, 0.8)', // Red
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${item1Name} vs ${item2Name} (ρ = ${coefficient.toFixed(2)})`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw as ScatterDataPoint;
            const label = context.dataset.label || '';
            if (label === 'Data Points' && point.date) {
              return `${point.date}: ${item1Name}=${point.x}, ${item2Name}=${point.y}`;
            }
            return `${label}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`;
          },
        },
      },
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: `${item1Name} (frequency/amount)`,
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: `${item2Name} (severity/frequency)`,
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  return (
    <div className="w-full h-96" aria-label={`Scatter plot showing correlation between ${item1Name} and ${item2Name}`}>
      <Scatter data={chartData} options={options} />
    </div>
  );
}
