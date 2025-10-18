'use client';

import { Line } from 'react-chartjs-2';
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
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface TrendChartProps {
  data: { x: number; y: number }[];
  trendline: { x: number; y: number }[];
  changePoints?: number[];
  datasetLabel?: string;
  trendlineLabel?: string;
  metricType?: 'symptom' | 'symptom-frequency' | 'flare' | 'adherence' | 'energy' | 'sleep' | 'stress' | 'health';
}

const getDefaultLabels = (metricType?: string) => {
  switch (metricType) {
    case 'symptom':
      return { dataset: 'Symptom Severity', trendline: 'Trend' };
    case 'symptom-frequency':
      return { dataset: 'Symptom Count', trendline: 'Frequency Trend' };
    case 'flare':
      return { dataset: 'Flare Severity', trendline: 'Flare Trend' };
    case 'adherence':
      return { dataset: 'Adherence (%)', trendline: 'Adherence Trend' };
    case 'energy':
      return { dataset: 'Energy Level', trendline: 'Energy Trend' };
    case 'sleep':
      return { dataset: 'Sleep Quality', trendline: 'Sleep Trend' };
    case 'stress':
      return { dataset: 'Stress Level', trendline: 'Stress Trend' };
    case 'health':
      return { dataset: 'Overall Health', trendline: 'Health Trend' };
    default:
      return { dataset: 'Metric Value', trendline: 'Trend' };
  }
};

export const TrendChart = ({ 
  data, 
  trendline, 
  changePoints, 
  datasetLabel, 
  trendlineLabel,
  metricType 
}: TrendChartProps) => {
  const defaultLabels = getDefaultLabels(metricType);
  const finalDatasetLabel = datasetLabel || defaultLabels.dataset;
  const finalTrendlineLabel = trendlineLabel || defaultLabels.trendline;

  const chartData = {
    labels: data.map(p => new Date(p.x).toLocaleDateString()),
    datasets: [
      {
        label: finalDatasetLabel,
        data: data.map(p => p.y),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: finalTrendlineLabel,
        data: trendline.map(p => p.y),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'transparent',
        tension: 0.1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  // Create change point annotations
  const annotations = (changePoints ?? []).reduce<Record<string, AnnotationOptions>>((acc, timestamp, index) => {
    const dateStr = new Date(timestamp).toLocaleDateString();
    const dataIndex = data.findIndex(p => new Date(p.x).toLocaleDateString() === dateStr);
    
    if (dataIndex !== -1) {
      acc[`changePoint${index}`] = {
        type: 'line' as const,
        xMin: dataIndex,
        xMax: dataIndex,
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          display: true,
          content: 'Change',
          position: 'start' as const,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          color: 'white',
          font: {
            size: 10,
          },
          padding: 4,
        },
      };
    }
    return acc;
  }, {});

  const yScale: Record<string, unknown> = {
    beginAtZero: true,
    title: {
      display: true,
      text: finalDatasetLabel,
    },
  };

  if (metricType === 'adherence') {
    yScale.suggestedMax = 100;
    yScale.max = 100;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Trend Analysis',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          afterBody: (tooltipItems: { dataIndex: number }[]) => {
            if (changePoints && tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const timestamp = data[index].x;
              const isChangePoint = changePoints.some(
                cp => new Date(cp).toLocaleDateString() === new Date(timestamp).toLocaleDateString()
              );
              if (isChangePoint) {
                return '\n⚠️ Significant change detected';
              }
            }
            return '';
          },
        },
      },
      annotation: {
        annotations,
      },
    },
    scales: {
      y: yScale,
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    // Mobile responsive configuration
    '@media (max-width: 768px)': {
      aspectRatio: 1.5,
    },
    '@media (max-width: 480px)': {
      aspectRatio: 1,
    },
  };

  return (
    <div className="w-full h-[400px] md:h-[500px]" role="img" aria-label={`Trend chart showing ${finalDatasetLabel} over time`}>
      <Line options={options} data={chartData} />
    </div>
  );
};
