/**
 * RegionFlareTimeline Component (Story 3.2 - Task 5)
 *
 * Visual timeline showing flare occurrences over time using Chart.js.
 * Displays flares as markers on a horizontal time axis with duration indicators.
 *
 * AC3.2.3: Timeline visualization of flare occurrences
 * - Timeline displays flares as markers on time axis
 * - Each marker positioned by startDate with duration indicator
 * - Marker color indicates status (red = active, gray = resolved)
 * - Responsive and horizontally scrollable on mobile
 * - Spans "Last Year" by default with option to expand to "All Time"
 */

'use client';

import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { RegionFlareHistory } from '@/types/analytics';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface RegionFlareTimelineProps {
  /** Flare history data */
  flares: RegionFlareHistory[];
  /** Time range to display (lastYear or allTime) */
  timeRange: 'lastYear' | 'allTime';
}

/**
 * RegionFlareTimeline component - scatter chart showing flare occurrences over time.
 */
export function RegionFlareTimeline({ flares, timeRange }: RegionFlareTimelineProps) {
  if (flares.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center text-gray-500">
        No flare data to display in timeline
      </div>
    );
  }

  // Task 5.5: Map flares to chart data points
  const activeFlares = flares
    .filter(f => f.status === 'active' || f.status === 'improving' || f.status === 'worsening')
    .map(flare => ({
      x: flare.startDate,
      y: flare.peakSeverity,
      id: flare.flareId,
      duration: flare.duration,
      status: flare.status,
      endDate: flare.endDate
    }));

  const resolvedFlares = flares
    .filter(f => f.status === 'resolved')
    .map(flare => ({
      x: flare.startDate,
      y: flare.peakSeverity,
      id: flare.flareId,
      duration: flare.duration,
      status: flare.status,
      endDate: flare.endDate
    }));

  // Task 5.8: Set x-axis range based on timeRange prop
  const now = Date.now();
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
  const minTime = timeRange === 'lastYear'
    ? oneYearAgo
    : Math.min(...flares.map(f => f.startDate));
  const maxTime = now;

  const chartData = {
    datasets: [
      {
        label: 'Active Flares',
        data: activeFlares,
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // red for active
        borderColor: 'rgba(239, 68, 68, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Resolved Flares',
        data: resolvedFlares,
        backgroundColor: 'rgba(156, 163, 175, 0.8)', // gray for resolved
        borderColor: 'rgba(156, 163, 175, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Task 5.7: Configure x-axis as time scale with date formatting
  // Task 5.11: Responsive configuration
  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Flare Timeline',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw as any;
            const date = new Date(point.x).toLocaleDateString();
            return [
              `Start: ${date}`,
              `Severity: ${point.y}/10`,
              `Duration: ${point.duration} days`,
              `Status: ${point.status}`,
            ];
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
        min: minTime,
        max: maxTime,
      },
      y: {
        title: {
          display: true,
          text: 'Severity',
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Task 5.9: Horizontally scrollable on mobile */}
      <div className="h-64 md:h-80 overflow-x-auto">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
}
