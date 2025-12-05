'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Doughnut } from 'react-chartjs-2';
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
    const fetchFearGreed = async () => {
      try {
        const response = await fetch(`/api/market-indicators/fear-greed?market=${selectedMarket}`);
        if (!response.ok) {
          if (response.status === 503) {
            // Stock market not yet available
            const errorData = await response.json();
            setError(errorData.error || 'Stock market Fear & Greed Index not yet available');
            setData(null);
            setIsLoading(false);
            return;
          }
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

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {locale === 'it' ? 'Indice Fear & Greed' : 'Fear & Greed Index'}
          </h2>
          {/* Market Selector */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setSelectedMarket('crypto')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedMarket === 'crypto'
                  ? 'bg-accent text-white'
                  : 'bg-bg-soft text-text-secondary hover:bg-bg-surface'
              }`}
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
            >
              {locale === 'it' ? 'Azionario (S&P 500)' : 'Stock (S&P 500)'}
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            {selectedMarket === 'crypto'
              ? (locale === 'it' 
                  ? 'Sentiment Mercato Crypto (Bitcoin & Criptovalute) - Fonte: Alternative.me' 
                  : 'Crypto Market Sentiment (Bitcoin & Cryptocurrencies) - Source: Alternative.me')
              : (locale === 'it'
                  ? 'Sentiment Mercato Azionario (S&P 500) - Fonte: CNN'
                  : 'Stock Market Sentiment (S&P 500) - Source: CNN')}
          </p>
        </div>
        {data && (
          <div className="text-2xl font-bold" style={{ color: getColor(data.value) }}>
            {data.value}
          </div>
        )}
      </div>

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
          <div className="text-center">
            <p className="text-text-secondary mb-2">
              {locale === 'it' 
                ? 'Indice Fear & Greed per mercato azionario in arrivo' 
                : 'Stock Market Fear & Greed Index coming soon'}
            </p>
            <p className="text-xs text-text-tertiary">
              {locale === 'it'
                ? 'Stiamo lavorando all\'integrazione con CNN Fear & Greed Index per S&P 500'
                : 'We are working on integrating CNN Fear & Greed Index for S&P 500'}
            </p>
          </div>
        </div>
      ) : null}

      {data && (
        <>
          {/* Groq AI Reading */}
          <div className="border-t border-border-subtle pt-4">
            <p className="text-sm font-semibold mb-2 text-text-primary">
              {locale === 'it' ? 'Lettura Mercato (Groq AI)' : 'Market Reading (Groq AI)'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              {data.aiReading || (locale === 'it' ? 'Analisi del sentiment in corso...' : 'Analyzing market sentiment...')}
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              {selectedMarket === 'crypto'
                ? (locale === 'it' 
                    ? 'Riferimento: Behavioral Finance - Analisi Sentiment Mercato Crypto (Alternative.me)'
                    : 'Reference: Behavioral Finance - Crypto Market Sentiment Analysis (Alternative.me)')
                : (locale === 'it'
                    ? 'Riferimento: Behavioral Finance - Analisi Sentiment Mercato Azionario (CNN)'
                    : 'Reference: Behavioral Finance - Stock Market Sentiment Analysis (CNN)')}
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
