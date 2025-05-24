'use client';

import { useState, useEffect } from 'react';
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
  Filler,
  ChartOptions,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data - will be replaced with real data
const generateMockData = () => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const streams = labels.map(() => Math.floor(Math.random() * 50000) + 20000);
  const revenue = labels.map(() => Math.floor(Math.random() * 5000) + 2000);
  const followers = labels.map(() => Math.floor(Math.random() * 2000) + 500);

  return {
    labels,
    datasets: [
      {
        label: 'Streams',
        data: streams,
        borderColor: 'rgb(0, 255, 204)',
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Revenue ($)',
        data: revenue,
        borderColor: 'rgb(255, 0, 102)',
        backgroundColor: 'rgba(255, 0, 102, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'New Followers',
        data: followers,
        borderColor: 'rgb(255, 204, 0)',
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
};

export default function PerformanceChart() {
  const [chartData, setChartData] = useState(generateMockData());
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#b3b3b3',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1f1f1f',
        titleColor: '#ffffff',
        bodyColor: '#b3b3b3',
        borderColor: '#333333',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#808080',
        },
      },
      y: {
        grid: {
          color: '#333333',
          drawBorder: false,
        },
        ticks: {
          color: '#808080',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const periods = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: '1y', label: '1y' },
  ];

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-zam-accent-primary" />
          <h2 className="text-lg font-semibold text-zam-text-primary">Performance Overview</h2>
        </div>
        <div className="flex gap-1 p-1 bg-zam-bg-hover rounded-lg">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedPeriod === period.value
                  ? 'bg-zam-accent-primary text-zam-bg-primary'
                  : 'text-zam-text-secondary hover:text-zam-text-primary'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}