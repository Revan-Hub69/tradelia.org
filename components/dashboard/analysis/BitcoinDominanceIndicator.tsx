'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BitcoinDominanceData {
  dominance: number; // Percentage (0-100)
  bitcoinMarketCap: number;
  totalMarketCap: number;
  timestamp: string;
  history: Array<{ date: string; dominance: number }>;
  aiReading: string;
}

/**
 * Bitcoin Dominance Indicator
 *
 * Bitcoin Dominance = (Bitcoin Market Cap / Total Crypto Market Cap) * 100
 *
 * Academic Reference: Market Cap Analysis, Portfolio Theory
 * Data Source: CoinGecko API
 *
 * Updates: Every 5 minutes (real-time)
 */
export default function BitcoinDominanceIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<BitcoinDominanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBitcoinDominance = async () => {
      try {
        const response = await fetch('/api/market-indicators/bitcoin-dominance', {
          // Cache for 5 minutes on client side
          next: { revalidate: 300 },
        });
        if (!response.ok) throw new Error('Failed to fetch Bitcoin Dominance');

        const dominanceData = await response.json();
        setData(dominanceData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Bitcoin Dominance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBitcoinDominance();
    // Update every 5 minutes
    const interval = setInterval(fetchBitcoinDominance, 300000);
    return () => clearInterval(interval);
  }, []);

  // Memoize chart data for performance
  const chartData = useMemo(() => {
    if (!data) return null;

    const altcoinPercentage = 100 - data.dominance;

    return {
      labels: [
        locale === 'it' ? 'Bitcoin' : 'Bitcoin',
        locale === 'it' ? 'Altcoin' : 'Altcoin',
      ],
      datasets: [
        {
          data: [data.dominance, altcoinPercentage],
          backgroundColor: [
            'rgb(247, 147, 26)', // Bitcoin orange
            'rgb(34, 197, 94)', // Altcoin green
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, locale]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    }),
    []
  );

  const getDominanceLevel = useMemo(() => {
    if (!data) return null;

    const dominance = data.dominance;
    if (dominance >= 60) {
      return {
        label: locale === 'it' ? 'Alta Dominance' : 'High Dominance',
        color: 'text-orange-600',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        description:
          locale === 'it'
            ? 'Bitcoin domina il mercato. Fase conservativa, possibile accumulo.'
            : 'Bitcoin dominates the market. Conservative phase, possible accumulation.',
      };
    }
    if (dominance >= 50) {
      return {
        label: locale === 'it' ? 'Dominance Moderata' : 'Moderate Dominance',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description:
          locale === 'it'
            ? 'Dominance bilanciata. Mercato in equilibrio.'
            : 'Balanced dominance. Market in equilibrium.',
      };
    }
    if (dominance >= 40) {
      return {
        label: locale === 'it' ? 'Bassa Dominance' : 'Low Dominance',
        color: 'text-green-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description:
          locale === 'it'
            ? 'Altcoin stanno guadagnando terreno. Possibile Altcoin season.'
            : 'Altcoins gaining ground. Possible Altcoin season.',
      };
    }
    return {
      label: locale === 'it' ? 'Dominance Molto Bassa' : 'Very Low Dominance',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      description:
        locale === 'it'
          ? 'Altcoin dominano. Fase speculativa estrema.'
          : 'Altcoins dominate. Extreme speculative phase.',
    };
  }, [data, locale]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-tertiary">
          {locale === 'it' ? 'Caricamento Bitcoin Dominance...' : 'Loading Bitcoin Dominance...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-red-400">
          {locale === 'it'
            ? 'Errore nel caricamento dei dati Bitcoin Dominance'
            : 'Error loading Bitcoin Dominance data'}
        </div>
      </div>
    );
  }

  const dominanceLevel = getDominanceLevel!;

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {locale === 'it' ? 'Bitcoin Dominance' : 'Bitcoin Dominance'}
          </h2>
          <p className="text-sm text-text-secondary">
            {locale === 'it'
              ? 'Percentuale di Bitcoin sul totale market cap crypto'
              : 'Bitcoin percentage of total crypto market cap'}
          </p>
        </div>
        <div className={`text-2xl font-bold ${dominanceLevel.color}`}>
          {data.dominance.toFixed(2)}%
        </div>
      </div>

      {/* Doughnut Chart */}
      {chartData && (
        <div className="h-48 flex items-center justify-center relative">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute text-center">
            <div className={`text-3xl font-bold ${dominanceLevel.color}`}>
              {data.dominance.toFixed(2)}%
            </div>
            <div className="text-xs text-text-tertiary mt-1">
              {locale === 'it' ? 'Bitcoin' : 'Bitcoin'}
            </div>
          </div>
        </div>
      )}

      {/* Market Cap Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-text-secondary">
            {locale === 'it' ? 'Market Cap Bitcoin' : 'Bitcoin Market Cap'}
          </p>
          <p className="font-semibold text-text-primary">
            ${(data.bitcoinMarketCap / 1e12).toFixed(2)}T
          </p>
        </div>
        <div>
          <p className="text-text-secondary">
            {locale === 'it' ? 'Market Cap Totale' : 'Total Market Cap'}
          </p>
          <p className="font-semibold text-text-primary">
            ${(data.totalMarketCap / 1e12).toFixed(2)}T
          </p>
        </div>
      </div>

      {/* Dominance Level */}
      <div
        className={`rounded-lg border ${dominanceLevel.borderColor} ${dominanceLevel.bgColor} p-3`}
      >
        <p className={`text-sm font-semibold ${dominanceLevel.color} mb-1`}>
          {dominanceLevel.label}
        </p>
        <p className="text-xs text-text-secondary">{dominanceLevel.description}</p>
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-tertiary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            {locale === 'it'
              ? 'Market Cap Analysis - Portfolio Theory'
              : 'Market Cap Analysis - Portfolio Theory'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Bitcoin Dominance misura la percentuale di Bitcoin sul totale market cap del mercato crypto. Calcolato come (Bitcoin Market Cap / Total Crypto Market Cap) × 100.'
              : 'Bitcoin Dominance measures Bitcoin percentage of total crypto market cap. Calculated as (Bitcoin Market Cap / Total Crypto Market Cap) × 100.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolato usando dati market cap da CoinGecko. Range 0-100%, dove valori alti indicano preferenza per Bitcoin, valori bassi indicano rotazione verso altcoin.'
              : 'Calculated using market cap data from CoinGecko. Range 0-100%, where high values indicate Bitcoin preference, low values indicate rotation to altcoins.'}
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
            <strong>&gt;60% ({locale === 'it' ? 'Alta Dominance' : 'High Dominance'}):</strong>{' '}
            {locale === 'it'
              ? 'Bitcoin domina il mercato. Indica preferenza per asset più sicuro, possibile fase conservativa. Storicamente associato a fasi di accumulo Bitcoin.'
              : 'Bitcoin dominates the market. Indicates preference for safer asset, possible conservative phase. Historically associated with Bitcoin accumulation phases.'}
          </p>
          <p>
            <strong>50-60% ({locale === 'it' ? 'Dominance Moderata' : 'Moderate Dominance'}):</strong>{' '}
            {locale === 'it'
              ? 'Dominance bilanciata. Mercato in equilibrio tra Bitcoin e altcoin.'
              : 'Balanced dominance. Market in equilibrium between Bitcoin and altcoins.'}
          </p>
          <p>
            <strong>40-50% ({locale === 'it' ? 'Bassa Dominance' : 'Low Dominance'}):</strong>{' '}
            {locale === 'it'
              ? 'Altcoin stanno guadagnando terreno. Possibile "Altcoin season", maggiore appetito per rischio.'
              : 'Altcoins gaining ground. Possible "Altcoin season", higher risk appetite.'}
          </p>
          <p>
            <strong>&lt;40% ({locale === 'it' ? 'Dominance Molto Bassa' : 'Very Low Dominance'}):</strong>{' '}
            {locale === 'it'
              ? 'Altcoin dominano. Indica forte rotazione verso altcoin, possibile fase speculativa estrema.'
              : 'Altcoins dominate. Indicates strong rotation to altcoins, possible extreme speculative phase.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'La dominance può essere influenzata da nuovi progetti con market cap elevato. Non predice timing preciso delle rotazioni. Richiede contesto di altri indicatori per interpretazione completa.'
              : 'Dominance can be influenced by new projects with high market cap. Does not predict precise timing of rotations. Requires context from other indicators for complete interpretation.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 3: Lettura AI */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {data.aiReading ||
            (locale === 'it'
              ? 'Analisi Bitcoin Dominance in corso...'
              : 'Analyzing Bitcoin Dominance...')}
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          {locale === 'it'
            ? 'Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.'
            : 'Descriptive analysis based on current data. Does not constitute financial advice.'}
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-text-tertiary text-center">
        {locale === 'it' ? 'Aggiornato' : 'Updated'}:{' '}
        {new Date(data.timestamp).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US')}
      </div>
    </div>
  );
}
