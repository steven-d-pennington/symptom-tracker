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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: { x: number; y: number }[];
  trendline: { x: number; y: number }[];
  changePoints?: number[];
}

export const TrendChart = ({ data, trendline, changePoints }: TrendChartProps) => {
  const chartData = {
    labels: data.map(p => new Date(p.x).toLocaleDateString()),
    datasets: [
      {
        label: 'Symptom Severity',
        data: data.map(p => p.y),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Trend',
        data: trendline.map(p => p.y),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Symptom Trend Analysis',
      },
    },
  };

  return <Line options={options} data={chartData} />;
};
