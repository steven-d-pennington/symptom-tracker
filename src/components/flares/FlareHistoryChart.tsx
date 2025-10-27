'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { FlareEventRecord } from '@/lib/db/schema';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

interface FlareHistoryChartProps {
  events: FlareEventRecord[];
}

export const FlareHistoryChart = React.memo(function FlareHistoryChart({ events }: FlareHistoryChartProps) {
  const chartData = useMemo(() => {
    // Filter to severity update events
    const severityEvents = events.filter(e =>
      e.eventType === 'severity_update' && e.severity !== undefined
    );

    if (severityEvents.length === 0) {
      return null;
    }

    // Sort by timestamp ascending for chart
    const sortedEvents = [...severityEvents].sort((a, b) => a.timestamp - b.timestamp);

    return {
      datasets: [{
        label: 'Severity',
        data: sortedEvents.map(e => ({
          x: e.timestamp,
          y: e.severity,
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      }],
    };
  }, [events]);

  const annotations = useMemo(() => {
    const interventionEvents = events.filter(e => e.eventType === 'intervention');

    return interventionEvents.reduce((acc, event, index) => {
      acc[`intervention-${index}`] = {
        type: 'line' as const,
        xMin: event.timestamp,
        xMax: event.timestamp,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        label: {
          content: event.interventionType || 'Intervention',
          enabled: true,
          position: 'top' as const,
        },
      };
      return acc;
    }, {} as Record<string, any>);
  }, [events]);

  if (!chartData) {
    return (
      <div className="text-gray-500 text-center py-8">
        No severity updates to display
      </div>
    );
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Severity',
        },
      },
    },
    plugins: {
      annotation: {
        annotations,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Severity: ${context.parsed.y}/10`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
});
