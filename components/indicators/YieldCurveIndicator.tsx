'use client';

import { useEffect, useState } from 'react';
import { IndicatorCard, AcademicReference, IndicatorInterpretation } from './IndicatorCard';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { Skeleton } from '@/components/ui/Skeleton';

interface YieldCurveData {
  '1M': number;
  '3M': number;
  '6M': number;
  '1Y': number;
  '2Y': number;
  '5Y': number;
  '10Y': number;
  '30Y': number;
  spread: {
    '10Y-2Y': number;
    '10Y-3M': number;
    '2Y-3M': number;
  };
  inversion: boolean;
  interpretation: string;
  recessionRisk: 'low' | 'medium' | 'high';
}

const academicReference: AcademicReference = {
  paper: 'Predicting U.S. Recessions',
  authors: 'Estrella & Mishkin',
  year: 1998,
  theory: 'Yield Curve Inversion Theory - L\'inversione della curva dei rendimenti (short > long) è un predittore di recessione economica',
  validity: 'very-high',
};

function getInterpretation(data: YieldCurveData): IndicatorInterpretation {
  if (data.inversion && data.recessionRisk === 'high') {
    return {
      level: 'high',
      meaning: 'Curva Invertita - Alto Rischio Recessione',
      color: 'red-400',
      variant: 'error',
    };
  } else if (data.inversion) {
    return {
      level: 'elevated',
      meaning: 'Curva Invertita - Warning Recessione',
      color: 'yellow-400',
      variant: 'warning',
    };
  } else if (data.spread['10Y-2Y'] < 0.5) {
    return {
      level: 'elevated',
      meaning: 'Curva Appiattita - Monitorare',
      color: 'yellow-400',
      variant: 'warning',
    };
  } else {
    return {
      level: 'normal',
      meaning: 'Curva Normale - Economia Sana',
      color: 'green-400',
      variant: 'success',
    };
  }
}

export function YieldCurveIndicator() {
  const [data, setData] = useState<YieldCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchYieldCurve() {
      try {
        setLoading(true);
        const response = await fetch('/api/market-indicators/yield-curve');
        if (!response.ok) throw new Error('Failed to fetch Yield Curve data');
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchYieldCurve();
    const interval = setInterval(fetchYieldCurve, 3600000); // Refresh every hour
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
        title="Yield Curve"
        value="N/A"
        aiReading="Dati non disponibili. Verifica la configurazione delle API keys."
        academicReference={academicReference}
      />
    );
  }

  const interpretation = getInterpretation(data);

  // Prepare chart data - Yield Curve
  const chartData: LineChartData[] = [
    { name: '1M', value: data['1M'] },
    { name: '3M', value: data['3M'] },
    { name: '6M', value: data['6M'] },
    { name: '1Y', value: data['1Y'] },
    { name: '2Y', value: data['2Y'] },
    { name: '5Y', value: data['5Y'] },
    { name: '10Y', value: data['10Y'] },
    { name: '30Y', value: data['30Y'] },
  ];

  const chart = (
    <LineChart
      data={chartData}
      lines={[
        {
          key: 'value',
          label: 'Yield (%)',
          color: interpretation.color === 'green-400' ? '#10b981' : 
                 interpretation.color === 'blue-400' ? '#3b82f6' :
                 interpretation.color === 'yellow-400' ? '#f59e0b' :
                 interpretation.color === 'red-400' ? '#ef4444' : '#3b82f6',
          strokeWidth: 3,
        },
      ]}
      height={200}
      showGrid={true}
      showLegend={false}
    />
  );

  // Create AI reading from interpretation
  const aiReading = `${data.interpretation}\n\nSpread 10Y-2Y: ${data.spread['10Y-2Y'].toFixed(2)}%\nSpread 10Y-3M: ${data.spread['10Y-3M'].toFixed(2)}%\nRischio Recessione: ${data.recessionRisk === 'high' ? 'Alto' : data.recessionRisk === 'medium' ? 'Medio' : 'Basso'}`;

  return (
    <IndicatorCard
      title="Yield Curve"
      value={`${data['10Y'].toFixed(2)}%`}
      chart={chart}
      aiReading={aiReading}
      academicReference={academicReference}
      interpretation={interpretation}
    />
  );
}
