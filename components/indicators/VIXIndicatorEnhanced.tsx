'use client';

import { useEffect, useState } from 'react';
import { IndicatorCardEnhanced } from './IndicatorCardEnhanced';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AcademicReference, IndicatorInterpretation } from './IndicatorCard';

interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

const academicReference: AcademicReference = {
  paper: 'Derivatives on Market Volatility: Hedging Tools Long Overdue',
  authors: 'Whaley',
  year: 1993,
  theory: 'Volatility Index Theory - Misura le aspettative di volatilità implicita del mercato per i prossimi 30 giorni, calcolato dalle opzioni S&P 500. Il VIX è considerato il "fear index" del mercato.',
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

export function VIXIndicatorEnhanced() {
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
      <div className="h-full min-h-[600px]">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <IndicatorCardEnhanced
        title="VIX - Volatility Index"
        value="N/A"
        aiReading="Dati non disponibili. Verifica la configurazione delle API keys (Yahoo Finance per VIX)."
        academicReference={academicReference}
        methodology={{
          description: 'Il VIX (CBOE Volatility Index) misura le aspettative di volatilità implicita del mercato azionario USA (S&P 500) per i prossimi 30 giorni, calcolato dai prezzi delle opzioni.',
          calculation: 'Calcolato usando i prezzi delle opzioni S&P 500 (SPX) con scadenze a 30 giorni. Formula complessa che pesa le opzioni out-of-the-money per stimare la volatilità implicita.',
          dataSource: 'Yahoo Finance (non ufficiale, ma ampiamente usato). Alternativa: CBOE DataShop API (subscription a pagamento).',
          updateFrequency: 'Tempo reale durante trading hours (9:30-16:00 EST). Aggiornato ogni minuto.',
          limitations: 'Il VIX misura aspettative, non volatilità realizzata. Può rimanere elevato anche dopo correzioni. Non predice direzione del mercato, solo volatilità. Richiede contesto di altri indicatori per interpretazione completa.',
        }}
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
          strokeWidth: 2,
        },
      ]}
      indicatorId="vix" // Usa chart config automatico
    />
  ) : null;

  return (
    <IndicatorCardEnhanced
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
      methodology={{
        description: 'Il VIX (CBOE Volatility Index) misura le aspettative di volatilità implicita del mercato azionario USA (S&P 500) per i prossimi 30 giorni, calcolato dai prezzi delle opzioni. È considerato il "fear index" del mercato.',
        calculation: 'Calcolato usando i prezzi delle opzioni S&P 500 (SPX) con scadenze a 30 giorni. La formula pesa le opzioni out-of-the-money per stimare la volatilità implicita attesa dal mercato.',
        dataSource: 'Yahoo Finance (non ufficiale, ma ampiamente usato in progetti open source). Alternativa ufficiale: CBOE DataShop API (richiede subscription a pagamento).',
        updateFrequency: 'Tempo reale durante trading hours (9:30-16:00 EST). Aggiornato ogni minuto su questa dashboard.',
        limitations: 'Il VIX misura aspettative di volatilità, non volatilità realizzata. Può rimanere elevato anche dopo correzioni del mercato. Non predice direzione del mercato (rialzo/ribasso), solo il livello di volatilità attesa. Richiede contesto di altri indicatori (yield curve, economic indicators) per interpretazione completa.',
      }}
      size="standard"
    />
  );
}
