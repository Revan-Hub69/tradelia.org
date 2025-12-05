'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
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
  const { t, locale } = useTranslations();
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
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-tertiary">
          {locale === 'it' ? 'Caricamento VIX...' : 'Loading VIX...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-red-400">
          {locale === 'it' ? 'Errore nel caricamento dei dati VIX' : 'Error loading VIX data'}
        </div>
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
    if (value < 12) {
      return { 
        label: locale === 'it' ? 'Bassa Volatilità' : 'Low Volatility', 
        color: 'text-green-600' 
      };
    }
    if (value < 20) {
      return { 
        label: locale === 'it' ? 'Volatilità Normale' : 'Normal Volatility', 
        color: 'text-blue-600' 
      };
    }
    if (value < 30) {
      return { 
        label: locale === 'it' ? 'Volatilità Elevata' : 'Elevated Volatility', 
        color: 'text-orange-600' 
      };
    }
    return { 
      label: locale === 'it' ? 'Alta Volatilità (Paura)' : 'High Volatility (Fear)', 
      color: 'text-red-600' 
    };
  };

  const vixLevel = getVIXLevel(data.value);

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">VIX</h2>
          <p className="text-sm text-text-secondary">
            {locale === 'it' ? 'CBOE Volatility Index (Indice di Volatilità)' : 'CBOE Volatility Index'}
          </p>
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
          <p className="text-sm text-text-secondary">
            {locale === 'it' ? 'Variazione' : 'Change'}
          </p>
          <p className={`text-lg font-semibold ${data.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div>
          <p className="text-sm text-text-secondary">
            {locale === 'it' ? 'Livello' : 'Level'}
          </p>
          <p className={`text-lg font-semibold ${vixLevel.color}`}>
            {vixLevel.label}
          </p>
        </div>
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            Whaley (1993) - "{locale === 'it' ? 'Derivatives on Market Volatility' : 'Derivatives on Market Volatility'}"
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Indice di volatilità implicita calcolato dalle opzioni S&P 500. Misura le aspettative di volatilità del mercato per i prossimi 30 giorni.'
              : 'Implied volatility index calculated from S&P 500 options. Measures market expectations of volatility for the next 30 days.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolato dal CBOE usando prezzi di opzioni ATM e OTM su S&P 500. Range tipico 10-40, con picchi storici oltre 80.'
              : 'Calculated by CBOE using ATM and OTM option prices on S&P 500. Typical range 10-40, with historical peaks above 80.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerlo Accademicamente */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Interpretazione Accademica' : 'Academic Interpretation'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>&lt;12 ({locale === 'it' ? 'Bassa Volatilità' : 'Low Volatility'}):</strong>{' '}
            {locale === 'it'
              ? 'Mercato calmo, bassa paura. Storicamente associato a trend rialzisti, ma può precedere correzioni.'
              : 'Calm market, low fear. Historically associated with bullish trends, but can precede corrections.'}
          </p>
          <p>
            <strong>12-20 ({locale === 'it' ? 'Volatilità Normale' : 'Normal Volatility'}):</strong>{' '}
            {locale === 'it'
              ? 'Range normale. Mercato in equilibrio, volatilità fisiologica.'
              : 'Normal range. Market in equilibrium, physiological volatility.'}
          </p>
          <p>
            <strong>20-30 ({locale === 'it' ? 'Volatilità Elevata' : 'Elevated Volatility'}):</strong>{' '}
            {locale === 'it'
              ? 'Volatilità elevata, aumento della paura. Possibile instabilità, attenzione a movimenti ampi.'
              : 'Elevated volatility, increased fear. Possible instability, watch for wide movements.'}
          </p>
          <p>
            <strong>&gt;30 ({locale === 'it' ? 'Alta Volatilità (Paura)' : 'High Volatility (Fear)'}):</strong>{' '}
            {locale === 'it'
              ? 'Volatilità molto alta, paura estrema. Storicamente zone di acquisto potenziali, ma richiede gestione del rischio.'
              : 'Very high volatility, extreme fear. Historically potential buying zones, but requires risk management.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Il VIX misura aspettative, non volatilità realizzata. Può rimanere elevato anche dopo la stabilizzazione del mercato.'
              : 'VIX measures expectations, not realized volatility. Can remain elevated even after market stabilization.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 3: Lettura AI */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading || (locale === 'it' ? 'Analisi della volatilità in corso...' : 'Analyzing market volatility...')}
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          {locale === 'it'
            ? 'Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.'
            : 'Descriptive analysis based on current data. Does not constitute financial advice.'}
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-text-tertiary text-center">
        {locale === 'it' ? 'Aggiornato' : 'Updated'}: {new Date(data.timestamp).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US')}
      </div>
    </div>
  );
}
