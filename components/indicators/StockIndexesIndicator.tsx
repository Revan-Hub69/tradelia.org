'use client';

import { useEffect, useState } from 'react';
import { IndicatorCard, AcademicReference, IndicatorInterpretation } from './IndicatorCard';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { Skeleton } from '@/components/ui/Skeleton';

interface StockIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface StockIndexesData {
  indexes: StockIndex[];
  timestamp: string;
  aiReading: string;
}

const academicReference: AcademicReference = {
  paper: 'Portfolio Selection',
  authors: 'Markowitz',
  year: 1952,
  theory: 'Modern Portfolio Theory - Gli indici azionari principali riflettono la performance complessiva del mercato azionario',
  validity: 'very-high',
};

function getInterpretation(indexes: StockIndex[]): IndicatorInterpretation {
  const avgChange = indexes.reduce((sum, idx) => sum + idx.changePercent, 0) / indexes.length;
  
  if (avgChange > 2) {
    return {
      level: 'high',
      meaning: 'Forte Rialzo - Mercato Ottimista',
      color: 'green-400',
      variant: 'success',
    };
  } else if (avgChange > 0.5) {
    return {
      level: 'normal',
      meaning: 'Rialzo Moderato - Trend Positivo',
      color: 'blue-400',
      variant: 'info',
    };
  } else if (avgChange < -2) {
    return {
      level: 'high',
      meaning: 'Forte Ribasso - Mercato Pessimista',
      color: 'red-400',
      variant: 'error',
    };
  } else if (avgChange < -0.5) {
    return {
      level: 'elevated',
      meaning: 'Ribasso Moderato - Attenzione',
      color: 'yellow-400',
      variant: 'warning',
    };
  } else {
    return {
      level: 'normal',
      meaning: 'Lateralità - Mercato in Equilibrio',
      color: 'blue-400',
      variant: 'info',
    };
  }
}

export function StockIndexesIndicator() {
  const [data, setData] = useState<StockIndexesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockIndexes() {
      try {
        setLoading(true);
        const response = await fetch('/api/market-indicators/stock-indexes');
        if (!response.ok) throw new Error('Failed to fetch Stock Indexes data');
        const indexesData = await response.json();
        setData(indexesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStockIndexes();
    const interval = setInterval(fetchStockIndexes, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error || !data || data.indexes.length === 0) {
    return (
      <IndicatorCard
        title="Stock Indexes"
        value="N/A"
        aiReading="Dati non disponibili. Verifica la configurazione delle API keys."
        academicReference={academicReference}
      />
    );
  }

  const interpretation = getInterpretation(data.indexes);

  // Prepare chart data - Multi-line chart
  const chartData: LineChartData[] = data.indexes.map((idx) => ({
    name: idx.symbol,
    [idx.symbol]: idx.price,
  }));

  const chart = (
    <LineChart
      data={chartData}
      lines={data.indexes.map((idx, i) => ({
        key: idx.symbol,
        label: idx.name,
        color: ['#3b82f6', '#10b981', '#f59e0b'][i % 3],
        strokeWidth: 2,
      }))}
      height={200}
      showGrid={true}
      showLegend={true}
    />
  );

  // Get main index (S&P 500) for value display
  const sp500 = data.indexes.find(idx => idx.symbol === 'SP500') || data.indexes[0];

  return (
    <IndicatorCard
      title="Stock Indexes"
      value={sp500.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      change={sp500.change}
      changePercent={sp500.changePercent}
      chart={chart}
      aiReading={data.aiReading}
      academicReference={academicReference}
      interpretation={interpretation}
      timestamp={data.timestamp}
    />
  );
}
