'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TermStructureData {
  contracts: Array<{
    symbol: string;
    expiration: string;
    price: number;
    basis: number; // Basis vs spot
  }>;
  spotPrice: number;
  structure: 'contango' | 'backwardation' | 'neutral';
  timestamp: string;
  aiReading: string;
}

/**
 * Term Structure Indicator
 * 
 * Futures Term Structure Analysis
 * Academic Reference: Fama & French (1987) - "Commodity Futures Prices"
 * 
 * Updates: Every 2 minutes (real-time)
 */
export default function TermStructureIndicator() {
  const { t } = useTranslations();
  const [data, setData] = useState<TermStructureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermStructure = async () => {
      try {
        const response = await fetch('/api/market-indicators/term-structure');
        if (!response.ok) throw new Error('Failed to fetch Term Structure');
        
        const termData = await response.json();
        setData(termData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Term Structure');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermStructure();
    // Update every 2 minutes
    const interval = setInterval(fetchTermStructure, 120000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading Term Structure...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-lg border p-6 h-full flex items-center justify-center">
        <div className="text-destructive">Error loading Term Structure data</div>
      </div>
    );
  }

  const chartData = {
    labels: data.contracts.map((c) => c.symbol),
    datasets: [
      {
        label: 'Basis vs Spot',
        data: data.contracts.map((c) => c.basis),
        backgroundColor: data.structure === 'contango' 
          ? 'rgba(34, 197, 94, 0.6)' 
          : data.structure === 'backwardation'
          ? 'rgba(239, 68, 68, 0.6)'
          : 'rgba(251, 191, 36, 0.6)',
        borderColor: data.structure === 'contango'
          ? 'rgb(34, 197, 94)'
          : data.structure === 'backwardation'
          ? 'rgb(239, 68, 68)'
          : 'rgb(251, 191, 36)',
        borderWidth: 1,
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
        callbacks: {
          label: (context: any) => {
            const contract = data.contracts[context.dataIndex];
            return `Basis: ${contract.basis.toFixed(2)}% | Price: $${contract.price.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const getStructureColor = (structure: string): string => {
    if (structure === 'contango') return 'text-green-600';
    if (structure === 'backwardation') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStructureLabel = (structure: string): string => {
    if (structure === 'contango') return 'Contango (Futures > Spot)';
    if (structure === 'backwardation') return 'Backwardation (Futures < Spot)';
    return 'Neutral';
  };

  return (
    <div className="bg-card rounded-lg border p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Term Structure</h2>
          <p className="text-sm text-muted-foreground">Futures vs Spot</p>
        </div>
        <div className={`text-lg font-bold ${getStructureColor(data.structure)}`}>
          {getStructureLabel(data.structure)}
        </div>
      </div>

      {/* Spot Price */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Spot Price</p>
        <p className="text-2xl font-bold">${data.spotPrice.toFixed(2)}</p>
      </div>

      {/* Chart */}
      <div className="h-48 -mx-2">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Structure Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Structure</p>
          <p className={`font-semibold ${getStructureColor(data.structure)}`}>
            {data.structure.charAt(0).toUpperCase() + data.structure.slice(1)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Contracts</p>
          <p className="font-semibold">{data.contracts.length}</p>
        </div>
      </div>

      {/* Groq AI Reading */}
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-2">Market Reading (Groq AI)</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.aiReading || 'Analyzing term structure...'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Reference: Fama & French (1987) - "Commodity Futures Prices"
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-muted-foreground text-center">
        Updated: {new Date(data.timestamp).toLocaleTimeString('it-IT')}
      </div>
    </div>
  );
}
