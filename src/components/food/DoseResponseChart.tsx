'use client';

import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { type DoseResponseResult } from '@/lib/services/food/DoseResponseService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DoseResponseChartProps {
  doseResponse: DoseResponseResult;
  foodName?: string;
}

const PORTION_LABELS: Record<number, string> = {
  1: 'Small',
  2: 'Medium',
  3: 'Large',
};

export function DoseResponseChart({ doseResponse, foodName }: DoseResponseChartProps) {
  const { portionSeverityPairs, slope, intercept, rSquared, confidence } = doseResponse;

  // Handle insufficient data case
  if (confidence === 'insufficient') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          {doseResponse.message}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Log more meals with portion sizes to see dose-response analysis.
        </p>
      </div>
    );
  }

  // Scatter plot data (actual observations)
  const scatterData = portionSeverityPairs.map((pair) => ({
    x: pair.portion,
    y: pair.severity,
  }));

  // Regression line data
  const regressionLineData = [
    { x: 1, y: slope * 1 + intercept }, // Small
    { x: 2, y: slope * 2 + intercept }, // Medium
    { x: 3, y: slope * 3 + intercept }, // Large
  ];

  const chartData = {
    datasets: [
      {
        label: 'Observed Severity',
        data: scatterData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      },
      {
        label: 'Regression Line',
        data: regressionLineData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        showLine: true,
        type: 'line' as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: foodName
          ? `Dose-Response: ${foodName} Portion Size vs Symptom Severity`
          : 'Portion Size vs Symptom Severity',
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const dataPoint = context[0];
            const portionSize = dataPoint.parsed.x;
            return `Portion: ${PORTION_LABELS[portionSize] || portionSize}`;
          },
          label: (context: any) => {
            return `Severity: ${context.parsed.y.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Portion Size',
        },
        min: 0.5,
        max: 3.5,
        ticks: {
          stepSize: 1,
          callback: function (value: number | string) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            return PORTION_LABELS[numValue] || '';
          },
        },
        grid: {
          display: true,
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Symptom Severity',
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
        },
        grid: {
          display: true,
        },
      },
    },
  };

  // Confidence badge styling
  const confidenceBadgeClass =
    confidence === 'high'
      ? 'bg-green-100 text-green-800'
      : confidence === 'medium'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-orange-100 text-orange-800';

  return (
    <div className="space-y-4">
      <div style={{ height: '400px' }}>
        <Scatter data={chartData} options={options} />
      </div>

      {/* R-squared and confidence message */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Goodness of Fit (R²): <span className="font-mono">{rSquared.toFixed(3)}</span>
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {rSquared >= 0.7
                ? 'Strong linear relationship'
                : rSquared >= 0.4
                ? 'Moderate linear relationship'
                : 'Weak linear relationship'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceBadgeClass}`}
            role="status"
            aria-label={`Confidence level: ${confidence}`}
          >
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
          </span>
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-700">{doseResponse.message}</p>
        </div>
      </div>
    </div>
  );
}
