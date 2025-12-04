'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
} from 'chart.js';

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

interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

/**
 * VIX Indicator Component
 * 
 * VIX (CBOE Volatility Index) - "Fear Index"
 * Academic Reference: Whaley (1993) - "Derivatives on Market Volatility"
 * 
 * Updates: Every 1 minute (real-time)
 */
export default function VIXIndicator() {
  const t = useTranslations('Dashboard');
  const [data, setData] = useState<VIXData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVIX = async () => {
      try {
        const response = await fetch('/api/market-indicators/vix');
        if (!response.ok) throw new Error('Failed to fetch VIX');
        
        const vixData = await response.json();
        setData(vixData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading VIX');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVIX();
    // Update every 1 minute
    const interval = setInterval(fetchVIX, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading VIX...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-lg border p-6 h-full flex items-center justify-center">
        <div className="text-destructive">Error loading VIX data</div>
      </div>
    );
  }

  const chartData = {
    labels: data.history.map((h) => new Date(h.date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'VIX',
        data: data.history.map((h) => h.value),
        borderColor: data.value > 30 ? 'rgb(239, 68, 68)' : data.value > 20 ? 'rgb(251, 146, 60)' : 'rgb(34, 197, 94)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, data.value > 30 ? 'rgba(239, 68, 68, 0.2)' : data.value > 20 ? 'rgba(251, 146, 60, 0.2)' : 'rgba(34, 197, 94, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const getVIXLevel = (value: number): { label: string; color: string } => {
    if (value < 12) return { label: 'Low Volatility', color: 'text-green-600' };
    if (value < 20) return { label: 'Normal Volatility', color: 'text-blue-600' };
    if (value < 30) return { label: 'Elevated Volatility', color: 'text-orange-600' };
    return { label: 'High Volatility (Fear)', color: 'text-red-600' };
  };

  const vixLevel = getVIXLevel(data.value);

  return (
    <div className="bg-card rounded-lg border p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">VIX</h2>
          <p className="text-sm text-muted-foreground">CBOE Volatility Index</p>
        </div>
        <div className={`text-2xl font-bold ${vixLevel.color}`}>
          {data.value.toFixed(2)}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 -mx-2">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Change</p>
          <p className={`text-lg font-semibold ${data.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Level</p>
          <p className={`text-lg font-semibold ${vixLevel.color}`}>
            {vixLevel.label}
          </p>
        </div>
      </div>

      {/* Groq AI Reading */}
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-2">Market Reading (Groq AI)</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.aiReading || 'Analyzing market volatility...'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Reference: Whaley (1993) - "Derivatives on Market Volatility"
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-muted-foreground text-center">
        Updated: {new Date(data.timestamp).toLocaleTimeString('it-IT')}
      </div>
    </div>
  );
}
