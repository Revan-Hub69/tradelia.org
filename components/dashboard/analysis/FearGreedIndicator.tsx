'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Doughnut } from 'react-chartjs-2';
import { IndicatorHeader } from './IndicatorHeader';
import { getFearGreedMethodology } from './IndicatorMethodologyNotes';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FearGreedData {
  value: number; // 0-100
  classification: string;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
  market?: 'crypto' | 'stock'; // Tipo di mercato
}

/**
 * Fear & Greed Index Indicator
 * 
 * Crypto Market Sentiment Index (Bitcoin & Crypto)
 * Nota: Questo indicatore è specifico per il mercato crypto (Alternative.me API).
 * Esiste anche un Fear & Greed Index per il mercato azionario (CNN per S&P 500).
 * 
 * Academic Reference: Behavioral Finance principles
 * 
 * Updates: Every 5 minutes (real-time)
 */
export default function FearGreedIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<'crypto' | 'stock'>('crypto');

  useEffect(() => {
    // Se selezionato stock market, non fare fetch (non ancora disponibile)
    if (selectedMarket === 'stock') {
      setError(null);
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchFearGreed = async () => {
      try {
        const response = await fetch(`/api/market-indicators/fear-greed?market=${selectedMarket}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Fear & Greed');
        }
        
        const fearGreedData = await response.json();
        setData(fearGreedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Fear & Greed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFearGreed();
    // Update every 5 minutes
    const interval = setInterval(fetchFearGreed, 300000);
    return () => clearInterval(interval);
  }, [selectedMarket]);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-tertiary">
          {locale === 'it' ? 'Caricamento Fear & Greed...' : 'Loading Fear & Greed...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-red-400">
          {locale === 'it' 
            ? 'Errore nel caricamento dei dati Fear & Greed' 
            : 'Error loading Fear & Greed data'}
        </div>
      </div>
    );
  }

  const getColor = (value: number): string => {
    if (value < 25) return 'rgb(239, 68, 68)'; // Extreme Fear - Red
    if (value < 45) return 'rgb(251, 146, 60)'; // Fear - Orange
    if (value < 55) return 'rgb(251, 191, 36)'; // Neutral - Yellow
    if (value < 75) return 'rgb(34, 197, 94)'; // Greed - Green
    return 'rgb(16, 185, 129)'; // Extreme Greed - Bright Green
  };

  const chartData = {
    labels: ['Fear', 'Greed'],
    datasets: [
      {
        data: [100 - data.value, data.value],
        backgroundColor: [
          'rgb(239, 68, 68)',
          getColor(data.value),
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
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
  };

  const methodology = useMemo(() => getFearGreedMethodology(locale), [locale]);

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header with Methodology Popup */}
      <IndicatorHeader
        title={locale === 'it' ? 'Indice Fear & Greed' : 'Fear & Greed Index'}
        methodology={methodology}
      />
      
      {/* Market Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedMarket('crypto')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            selectedMarket === 'crypto'
              ? 'bg-accent text-white'
              : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
          }`}
          aria-label={locale === 'it' ? 'Seleziona mercato crypto' : 'Select crypto market'}
          aria-pressed={selectedMarket === 'crypto'}
        >
          {locale === 'it' ? 'Crypto' : 'Crypto'}
        </button>
        <button
          onClick={() => setSelectedMarket('stock')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            selectedMarket === 'stock'
              ? 'bg-accent text-white'
              : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
          }`}
          aria-label={locale === 'it' ? 'Seleziona mercato azionario' : 'Select stock market'}
          aria-pressed={selectedMarket === 'stock'}
        >
          {locale === 'it' ? 'Azionario (S&P 500)' : 'Stock (S&P 500)'}
        </button>
      </div>
      
      {/* Description */}
      <p className="text-sm text-text-secondary">
        {selectedMarket === 'crypto'
          ? (locale === 'it' 
              ? 'Sentiment Mercato Crypto (Bitcoin & Criptovalute) - Fonte: Alternative.me' 
              : 'Crypto Market Sentiment (Bitcoin & Cryptocurrencies) - Source: Alternative.me')
          : (locale === 'it'
              ? 'Sentiment Mercato Azionario (S&P 500) - Fonte: CNN'
              : 'Stock Market Sentiment (S&P 500) - Source: CNN')}
      </p>
      
      {/* Value Display */}
      {data && (
        <div className="text-2xl font-bold" style={{ color: getColor(data.value) }}>
          {data.value}
        </div>
      )}

      {data ? (
        <>
          {/* Doughnut Chart */}
          <div className="h-48 flex items-center justify-center relative">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute text-center">
              <div className="text-3xl font-bold" style={{ color: getColor(data.value) }}>
                {data.value}
              </div>
              <div className="text-sm text-text-tertiary">{data.classification}</div>
            </div>
          </div>

          {/* Classification */}
          <div className="text-center">
            <p className={`text-lg font-semibold`} style={{ color: getColor(data.value) }}>
              {data.classification}
            </p>
          </div>
        </>
      ) : selectedMarket === 'stock' ? (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-soft flex items-center justify-center">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-primary font-semibold mb-2">
              {locale === 'it' 
                ? 'Prossimamente disponibile' 
                : 'Coming soon'}
            </p>
            <p className="text-sm text-text-secondary mb-2">
              {locale === 'it' 
                ? 'Indice Fear & Greed per mercato azionario (CNN S&P 500)' 
                : 'Stock Market Fear & Greed Index (CNN S&P 500)'}
            </p>
            <p className="text-xs text-text-tertiary max-w-sm">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione. CNN non fornisce un\'API pubblica, quindi stiamo valutando soluzioni affidabili.'
                : 'We are working on the integration. CNN does not provide a public API, so we are evaluating reliable solutions.'}
            </p>
          </div>
        </div>
      ) : null}

      {data && (
        <>
          {/* AI Reading */}
          <div className="border-t border-border-subtle pt-4">
            <p className="text-sm font-semibold mb-2 text-text-primary">
              {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {data.aiReading || (locale === 'it' ? 'Analisi del sentiment in corso...' : 'Analyzing market sentiment...')}
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
        </>
      )}
    </div>
  );
}
