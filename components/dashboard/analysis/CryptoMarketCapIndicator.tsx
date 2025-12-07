'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface CryptoMarketCapData {
  totalMarketCap: number;
  totalVolume24h: number;
  bitcoinMarketCap: number;
  bitcoinDominance: number;
  timestamp: string;
  history: Array<{ date: string; marketCap: number }>;
  aiReading: string;
}

/**
 * Total Crypto Market Cap Indicator
 *
 * Total Cryptocurrency Market Capitalization
 *
 * Academic Reference: Market Cap Analysis, Portfolio Theory
 * Data Source: CoinGecko API
 * Updates: Every 5 minutes
 */
export default function CryptoMarketCapIndicator() {
  const { t, locale } = useTranslations();
  const [data, setData] = useState<CryptoMarketCapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptoMarketCap = async () => {
      try {
        const response = await fetch('/api/market-indicators/crypto-market-cap', {
          // Cache for 5 minutes
          next: { revalidate: 300 },
        });
        if (!response.ok) throw new Error('Failed to fetch Crypto Market Cap');

        const marketCapData = await response.json();
        setData(marketCapData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading Crypto Market Cap');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoMarketCap();
    // Update every 5 minutes
    const interval = setInterval(fetchCryptoMarketCap, 300000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-text-secondary">
          {locale === 'it'
            ? 'Caricamento Crypto Market Cap...'
            : 'Loading Crypto Market Cap...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex items-center justify-center">
        <div className="text-red-400">
          {locale === 'it'
            ? 'Errore nel caricamento dei dati Crypto Market Cap'
            : 'Error loading Crypto Market Cap data'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 h-full flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">
          {locale === 'it' ? 'Total Crypto Market Cap' : 'Total Crypto Market Cap'}
        </h2>
        <p className="text-sm text-text-secondary">
          {locale === 'it'
            ? 'Capitalizzazione totale mercato crypto'
            : 'Total cryptocurrency market capitalization'}
        </p>
      </div>

      {/* Main Value */}
      <div className="text-center">
        <p className="text-3xl font-bold text-text-primary">
          ${(data.totalMarketCap / 1e12).toFixed(2)}T
        </p>
        <p className="text-sm text-text-secondary mt-1">
          {locale === 'it' ? 'Capitalizzazione Totale' : 'Total Market Cap'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-secondary">
            {locale === 'it' ? 'Volume 24h' : '24h Volume'}
          </p>
          <p className="text-lg font-semibold text-text-primary">
            ${(data.totalVolume24h / 1e9).toFixed(2)}B
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">
            {locale === 'it' ? 'Bitcoin Dominance' : 'Bitcoin Dominance'}
          </p>
          <p className="text-lg font-semibold text-text-primary">
            {data.bitcoinDominance.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* SEZIONE 1: Spiegazione Accademica */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Riferimento Accademico' : 'Academic Reference'}
        </p>
        <div className="text-xs text-text-secondary space-y-1">
          <p>
            <strong>{locale === 'it' ? 'Paper:' : 'Paper:'}</strong>{' '}
            {locale === 'it'
              ? 'Market Cap Analysis - Portfolio Theory'
              : 'Market Cap Analysis - Portfolio Theory'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Definizione:' : 'Definition:'}</strong>{' '}
            {locale === 'it'
              ? 'Total Market Cap misura la capitalizzazione totale di tutte le criptovalute. Indica dimensione, maturità e importanza del settore crypto.'
              : 'Total Market Cap measures total capitalization of all cryptocurrencies. Indicates size, maturity and importance of crypto sector.'}
          </p>
          <p>
            <strong>{locale === 'it' ? 'Metodologia:' : 'Methodology:'}</strong>{' '}
            {locale === 'it'
              ? 'Calcolato come somma di (prezzo × supply) per tutte le criptovalute. Dati da CoinGecko, aggiornati in tempo reale.'
              : 'Calculated as sum of (price × supply) for all cryptocurrencies. Data from CoinGecko, updated in real-time.'}
          </p>
        </div>
      </div>

      {/* SEZIONE 2: Come Leggerlo Accademicamente */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-sm font-semibold mb-2 text-text-primary">
          {locale === 'it' ? 'Interpretazione Accademica' : 'Academic Interpretation'}
        </p>
        <div className="text-xs text-text-secondary space-y-1">
          <p>
            <strong>
              {locale === 'it' ? 'Market Cap Elevato (&gt;$2T):' : 'High Market Cap (>$2T):'}
            </strong>{' '}
            {locale === 'it'
              ? 'Mercato maturo, maggiore adozione istituzionale. Indica dimensione e importanza del settore crypto.'
              : 'Mature market, greater institutional adoption. Indicates size and importance of crypto sector.'}
          </p>
          <p>
            <strong>
              {locale === 'it' ? 'Volume Elevato:' : 'High Volume:'}
            </strong>{' '}
            {locale === 'it'
              ? 'Alta liquidità, forte attività di trading. Indica interesse e partecipazione attiva.'
              : 'High liquidity, strong trading activity. Indicates interest and active participation.'}
          </p>
          <p>
            <strong>
              {locale === 'it' ? 'Bitcoin Dominance:' : 'Bitcoin Dominance:'}
            </strong>{' '}
            {locale === 'it'
              ? 'Percentuale di Bitcoin sul totale. Alta: preferenza per asset sicuro. Bassa: rotazione verso altcoin.'
              : 'Bitcoin percentage of total. High: preference for safe asset. Low: rotation to altcoins.'}
          </p>
          <p className="mt-2 italic">
            <strong>{locale === 'it' ? 'Limitazioni:' : 'Limitations:'}</strong>{' '}
            {locale === 'it'
              ? 'Market Cap può essere influenzato da progetti con supply elevata. Volume può includere wash trading. Richiede analisi di altri indicatori per contesto completo.'
              : 'Market Cap can be influenced by projects with high supply. Volume may include wash trading. Requires analysis of other indicators for complete context.'}
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
              ? 'Analisi crypto market cap in corso...'
              : 'Analyzing crypto market cap...')}
        </p>
        <p className="text-xs text-text-secondary mt-2">
          {locale === 'it'
            ? 'Analisi descrittiva basata sui dati attuali. Non costituisce consulenza finanziaria.'
            : 'Descriptive analysis based on current data. Does not constitute financial advice.'}
        </p>
      </div>

      {/* Update Time */}
      <div className="text-xs text-text-secondary text-center">
        {locale === 'it' ? 'Aggiornato' : 'Updated'}:{' '}
        {new Date(data.timestamp).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US')}
      </div>
    </div>
  );
}
