'use client';

import { useEffect, useState } from 'react';
import { IndicatorCard, AcademicReference, IndicatorInterpretation } from './IndicatorCard';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { Skeleton } from '@/components/ui/Skeleton';

interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

const academicReference: AcademicReference = {
  paper: 'Derivatives on Market Volatility',
  authors: 'Whaley',
  year: 1993,
  theory: 'Volatility Index Theory - Misura le aspettative di volatilità implicita del mercato per i prossimi 30 giorni, calcolato dalle opzioni S&P 500',
  validity: 'very-high',
};

function getInterpretation(value: number): IndicatorInterpretation {
  if (value < 12) {
    return {
      level: 'low',
      meaning: 'Bassa Volatilità - Mercato calmo',
      color: 'green-400',
      variant: 'success',
    };
  } else if (value >= 12 && value < 20) {
    return {
      level: 'normal',
      meaning: 'Volatilità Normale - Equilibrio',
      color: 'blue-400',
      variant: 'info',
    };
  } else if (value >= 20 && value < 30) {
    return {
      level: 'elevated',
      meaning: 'Volatilità Elevata - Attenzione',
      color: 'yellow-400',
      variant: 'warning',
    };
  } else {
    return {
      level: 'high',
      meaning: 'Alta Volatilità - Paura Estrema',
      color: 'red-400',
      variant: 'error',
    };
  }
}

export function VIXIndicator() {
  const [data, setData] = useState<VIXData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVIX() {
      try {
        setLoading(true);
        const response = await fetch('/api/market-indicators/vix');
        if (!response.ok) throw new Error('Failed to fetch VIX data');
        const vixData = await response.json();
        setData(vixData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchVIX();
    const interval = setInterval(fetchVIX, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <IndicatorCard
        title="VIX - Volatility Index"
        value="N/A"
        aiReading="Dati non disponibili. Verifica la configurazione delle API keys."
        academicReference={academicReference}
      />
    );
  }

  const interpretation = getInterpretation(data.value);

  // Prepare chart data
  const chartData: LineChartData[] = data.history.map((item) => ({
    name: new Date(item.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
    value: item.value,
  }));

  const chart = chartData.length > 0 ? (
    <LineChart
      data={chartData}
      lines={[
        {
          key: 'value',
          label: 'VIX',
          color: interpretation.color === 'green-400' ? '#10b981' : 
                 interpretation.color === 'blue-400' ? '#3b82f6' :
                 interpretation.color === 'yellow-400' ? '#f59e0b' :
                 interpretation.color === 'red-400' ? '#ef4444' : '#3b82f6',
          strokeWidth: 2,
        },
      ]}
      height={200}
      showGrid={true}
      showLegend={false}
    />
  ) : null;

  return (
    <IndicatorCard
      title="VIX - Volatility Index"
      value={data.value}
      change={data.change}
      changePercent={data.changePercent}
      unit=""
      chart={chart}
      aiReading={data.aiReading}
      academicReference={academicReference}
      interpretation={interpretation}
      timestamp={data.timestamp}
    />
  );
}
