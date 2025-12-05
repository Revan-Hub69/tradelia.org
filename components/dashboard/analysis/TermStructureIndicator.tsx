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
  const { t, locale } = useTranslations();
  const [data, setData] = useState<TermStructureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermStructure = async () => {
      try {
        const response = await fetch('/api/market-indicators/term-structure');
        if (!response.ok) {
          if (response.status === 503) {
            // Not yet available
            const errorData = await response.json();
            setError(errorData.error || 'Term Structure not yet available');
            setData(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch Term Structure');
        }
        
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
    const isNotAvailable = error?.includes('not yet available') || error?.includes('Coming soon');
    
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        {isNotAvailable ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-soft flex items-center justify-center">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-primary font-semibold mb-2">
              {locale === 'it' ? 'Prossimamente disponibile' : 'Coming soon'}
            </p>
            <p className="text-sm text-text-secondary mb-2">
              {locale === 'it' ? 'Term Structure (Futures vs Spot)' : 'Term Structure (Futures vs Spot)'}
            </p>
            <p className="text-xs text-text-tertiary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. Richiede un\'API affidabile per i futures (CME Group, Bloomberg, etc.).'
                : 'We are working on the integration. Requires a reliable futures API (CME Group, Bloomberg, etc.).'}
            </p>
          </div>
        ) : (
          <div className="text-red-400">
            {locale === 'it' ? 'Errore nel caricamento dei dati Term Structure' : 'Error loading Term Structure data'}
          </div>
        )}
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
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {locale === 'it' ? 'Struttura a Termine' : 'Term Structure'}
          </h2>
          <p className="text-sm text-text-secondary">
            {locale === 'it' 
              ? 'Analisi differenza tra Futures e Spot Price. Mostra se il mercato è in Contango (futures > spot) o Backwardation (futures < spot).'
              : 'Analysis of difference between Futures and Spot Price. Shows if market is in Contango (futures > spot) or Backwardation (futures < spot).'}
          </p>
        </div>
        <div className={`text-lg font-bold ${getStructureColor(data.structure)}`}>
          {locale === 'it' 
            ? (data.structure === 'contango' 
                ? 'Contango (Futures > Spot)' 
                : data.structure === 'backwardation'
                ? 'Backwardation (Futures < Spot)'
                : 'Neutrale')
            : getStructureLabel(data.structure)}
        </div>
      </div>

      {/* Spot Price */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          {locale === 'it' ? 'Prezzo Spot' : 'Spot Price'}
        </p>
        <p className="text-2xl font-bold text-text-primary">${data.spotPrice.toFixed(2)}</p>
      </div>

      {/* Chart */}
      <div className="h-48 -mx-2">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Structure Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-text-secondary">
            {locale === 'it' ? 'Struttura' : 'Structure'}
          </p>
          <p className={`font-semibold text-text-primary ${getStructureColor(data.structure)}`}>
            {locale === 'it' 
              ? (data.structure === 'contango' 
                  ? 'Contango' 
                  : data.structure === 'backwardation'
                  ? 'Backwardation'
                  : 'Neutrale')
              : data.structure.charAt(0).toUpperCase() + data.structure.slice(1)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary">
            {locale === 'it' ? 'Contratti' : 'Contracts'}
          </p>
          <p className="font-semibold text-text-primary">{data.contracts.length}</p>
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
            Fama & French (1987) - "{locale === 'it' ? 'Commodity Futures Prices' : 'Commodity Futures Prices'}"
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Analisi della differenza tra prezzi futures e spot price. La term structure riflette le aspettative di mercato e i costi di carry.'
              : 'Analysis of the difference between futures prices and spot price. Term structure reflects market expectations and carry costs.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolato come differenza percentuale (basis) tra futures e spot. Contango quando futures > spot, Backwardation quando futures < spot.'
              : 'Calculated as percentage difference (basis) between futures and spot. Contango when futures > spot, Backwardation when futures < spot.'}
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
            <strong>{locale === 'it' ? 'Contango (Futures &gt; Spot):' : 'Contango (Futures > Spot):'}</strong>{' '}
            {locale === 'it'
              ? 'Mercato normale. Futures più alti riflettono costi di carry (storage, financing). Tipico in mercati stabili con scorte adeguate.'
              : 'Normal market. Higher futures reflect carry costs (storage, financing). Typical in stable markets with adequate supplies.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Backwardation (Futures &lt; Spot):' : 'Backwardation (Futures < Spot):'}</strong>{' '}
            {locale === 'it'
              ? 'Mercato invertito. Indica scarsità immediata o aspettative di calo dei prezzi. Può segnalare stress di mercato o domanda immediata elevata.'
              : 'Inverted market. Indicates immediate scarcity or expectations of price decline. May signal market stress or high immediate demand.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Neutrale:' : 'Neutral:'}</strong>{' '}
            {locale === 'it'
              ? 'Futures ≈ Spot. Mercato in equilibrio, nessun segnale estremo.'
              : 'Futures ≈ Spot. Market in equilibrium, no extreme signals.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'La term structure può essere influenzata da fattori tecnici (rollover, liquidity) oltre alle aspettative fondamentali. Richiede contesto per interpretazione corretta.'
              : 'Term structure can be influenced by technical factors (rollover, liquidity) beyond fundamental expectations. Requires context for correct interpretation.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 3: Lettura AI */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading || (locale === 'it' ? 'Analisi struttura a termine in corso...' : 'Analyzing term structure...')}
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
