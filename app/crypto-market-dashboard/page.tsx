/**
 * Crypto Market Dashboard Completa
 * 
 * Dashboard professionale con:
 * - Top 20-50 crypto
 * - Supporti/Resistenze reali da order book
 * - Pressione di mercato (buying/selling)
 * - Microstruttura completa
 * - Tutti gli indicatori per decisioni ponderate
 * 
 * ⚠️ Per intraday/scalping con leva e futures, usa: /crypto-intraday-scalping
 */

'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MarketCapHeatmap } from '@/components/crypto/MarketCapHeatmap';

interface CryptoOverview {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  orderBook: {
    totalBidVolume: number;
    totalAskVolume: number;
    spread: number;
    spreadPercent: number;
    imbalance: number;
  };
  supportResistance: Array<{
    price: number;
    strength: string;
    type: 'support' | 'resistance';
    distancePercent: number;
  }>;
  pressure: {
    overall: number;
    strength: string;
    interpretation: string;
  };
  liquidity: {
    score: number;
    assessment: 'low' | 'medium' | 'high' | 'very-high';
  };
}

export default function CryptoMarketDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [cryptos, setCryptos] = useState<CryptoOverview[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'pressure' | 'liquidity'>('volume');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'high-pressure'>('all');
  const [limit, setLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false); // DISABILITATO per default - usa /crypto-trading-dashboard
  const [refreshInterval, setRefreshInterval] = useState(300); // 5 minuti invece di 30 secondi
  const [marketSentiment, setMarketSentiment] = useState<any>(null);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [cryptoReadings, setCryptoReadings] = useState<Record<string, string>>({});
  const [loadingReading, setLoadingReading] = useState<string | null>(null);
  const [solidIndicators, setSolidIndicators] = useState<Record<string, any>>({});
  const [loadingIndicators, setLoadingIndicators] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, sentimentRes, correlationsRes] = await Promise.all([
        fetch(`/api/crypto/market-overview?limit=${limit}`),
        fetch(`/api/crypto/market-sentiment`),
        fetch(`/api/crypto/correlations`),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setCryptos(data.cryptos || []);
      }

      if (sentimentRes.ok) {
        const sentiment = await sentimentRes.json();
        setMarketSentiment(sentiment);
      }

      if (correlationsRes.ok) {
        const corrData = await correlationsRes.json();
        setCorrelations(corrData.correlations || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, limit]);

  // Filtra e ordina
  let filteredCryptos = [...cryptos];
  
  if (filterBy === 'gainers') {
    filteredCryptos = filteredCryptos.filter((c) => c.change24hPercent > 0);
  } else if (filterBy === 'losers') {
    filteredCryptos = filteredCryptos.filter((c) => c.change24hPercent < 0);
  } else if (filterBy === 'high-pressure') {
    filteredCryptos = filteredCryptos.filter((c) => Math.abs(c.pressure.overall) > 0.5);
  }

  filteredCryptos.sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.volume24h - a.volume24h;
      case 'change':
        return b.change24hPercent - a.change24hPercent;
      case 'pressure':
        return Math.abs(b.pressure.overall) - Math.abs(a.pressure.overall);
      case 'liquidity':
        return b.liquidity.score - a.liquidity.score;
      default:
        return 0;
    }
  });

  const selectedCryptoData = selectedCrypto
    ? filteredCryptos.find((c) => c.symbol === selectedCrypto)
    : null;

  const fetchCryptoReading = async (symbol: string) => {
    if (cryptoReadings[symbol]) return; // Già caricato
    
    setLoadingReading(symbol);
    try {
      const response = await fetch(`/api/crypto/${symbol}/reading`);
      if (response.ok) {
        const data = await response.json();
        setCryptoReadings((prev) => ({
          ...prev,
          [symbol]: data.reading,
        }));
      }
    } catch (error) {
      console.error(`Error fetching reading for ${symbol}:`, error);
    } finally {
      setLoadingReading(null);
    }
  };

  const fetchSolidIndicators = async (symbol: string) => {
    if (solidIndicators[symbol]) return; // Già caricato
    
    setLoadingIndicators(symbol);
    try {
      const response = await fetch(`/api/crypto/indicators/solid?symbol=${symbol}`);
      if (response.ok) {
        const data = await response.json();
        setSolidIndicators((prev) => ({
          ...prev,
          [symbol]: data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching solid indicators for ${symbol}:`, error);
    } finally {
      setLoadingIndicators(null);
    }
  };

  useEffect(() => {
    if (selectedCrypto) {
      fetchCryptoReading(selectedCrypto);
      fetchSolidIndicators(selectedCrypto);
    }
  }, [selectedCrypto]);

  const getPressureColor = (pressure: number) => {
    if (pressure > 0.5) return 'text-green-600 dark:text-green-400';
    if (pressure > 0.3) return 'text-green-500 dark:text-green-500';
    if (pressure < -0.5) return 'text-red-600 dark:text-red-400';
    if (pressure < -0.3) return 'text-red-500 dark:text-red-500';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getLiquidityColor = (assessment: string) => {
    switch (assessment) {
      case 'very-high':
        return 'text-green-600 dark:text-green-400';
      case 'high':
        return 'text-green-500 dark:text-green-500';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* WARNING: Vecchia dashboard - usa /crypto-trading-dashboard */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Dashboard Deprecata
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Questa dashboard è stata sostituita. Auto-refresh disabilitato per default per ridurre chiamate API.
              </p>
              <a 
                href="/crypto-trading-dashboard" 
                className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 underline hover:text-yellow-900"
              >
                → Vai alla nuova Dashboard Trading (/crypto-trading-dashboard)
              </a>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crypto Market Dashboard (Deprecata)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analisi completa microstruttura, supporti/resistenze reali, pressione di mercato
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numero Crypto
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={30}>Top 30</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ordina per
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="volume">Volume 24h</option>
              <option value="change">Change 24h</option>
              <option value="pressure">Pressione</option>
              <option value="liquidity">Liquidità</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtra
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tutte</option>
              <option value="gainers">Gainers</option>
              <option value="losers">Losers</option>
              <option value="high-pressure">Alta Pressione</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700 dark:text-gray-300">
              Auto-refresh
            </label>
          </div>

          {autoRefresh && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Intervallo (s)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : 'Aggiorna'}
          </button>
        </div>

        {/* Market Overview Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Crypto
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Prezzo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    24h Change
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Volume 24h
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Spread
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Imbalance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Pressione
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Liquidità
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Caricamento dati...
                    </td>
                  </tr>
                ) : filteredCryptos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Nessun dato disponibile
                    </td>
                  </tr>
                ) : (
                  filteredCryptos.map((crypto) => (
                    <tr
                      key={crypto.symbol}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setSelectedCrypto(selectedCrypto === crypto.symbol ? null : crypto.symbol)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {crypto.symbol}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        crypto.change24hPercent >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {crypto.change24hPercent >= 0 ? '+' : ''}
                        {crypto.change24hPercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                        ${(crypto.volume24h / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                        {crypto.orderBook.spreadPercent.toFixed(3)}%
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${
                        crypto.orderBook.imbalance > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(crypto.orderBook.imbalance * 100).toFixed(1)}%
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${getPressureColor(crypto.pressure.overall)}`}>
                        {crypto.pressure.overall > 0 ? '+' : ''}
                        {(crypto.pressure.overall * 100).toFixed(1)}%
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {crypto.pressure.strength}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${getLiquidityColor(crypto.liquidity.assessment)}`}>
                        {crypto.liquidity.score}/100
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {crypto.liquidity.assessment}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                          Dettagli
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Crypto Details */}
        {selectedCryptoData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Support & Resistance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Supporti & Resistenze - {selectedCryptoData.symbol}
                </h2>
              </div>
              
              {/* Warning Metodologico */}
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Nota Metodologica:</strong> I supporti/resistenze sono calcolati da <strong>order book depth aggregato</strong> (Binance + OKX + Bybit).
                  Mostrano <strong>intenzioni di trading correnti</strong>, non volume storico reale. I livelli possono cambiare rapidamente (ordini cancellati).
                  Non considerano: volume storico, test ripetuti, psychological levels, fake walls. Utile per intraday/scalping, limitato per swing trading.
                </div>
              </div>

              <div className="space-y-3">
                {selectedCryptoData.supportResistance.length > 0 ? (
                  selectedCryptoData.supportResistance.map((sr, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border-l-4 ${
                        sr.type === 'support'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {sr.type === 'support' ? 'Supporto' : 'Resistenza'} - ${sr.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Forza: {sr.strength} | Distanza: {Math.abs(sr.distancePercent).toFixed(2)}%
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${
                          sr.strength === 'very-strong'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : sr.strength === 'strong'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : sr.strength === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {sr.strength}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Nessun livello identificato</p>
                )}
              </div>
            </div>

            {/* Market Pressure */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pressione di Mercato - {selectedCryptoData.symbol}
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pressione Complessiva</span>
                    <span className={`font-bold ${getPressureColor(selectedCryptoData.pressure.overall)}`}>
                      {(selectedCryptoData.pressure.overall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        selectedCryptoData.pressure.overall > 0
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.abs(selectedCryptoData.pressure.overall) * 100}%`,
                        marginLeft: selectedCryptoData.pressure.overall < 0 ? 'auto' : '0',
                      }}
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedCryptoData.pressure.interpretation}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Order Book</div>
                    <div className={`font-semibold ${getPressureColor(selectedCryptoData.pressure.overall)}`}>
                      {(selectedCryptoData.orderBook.imbalance * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Liquidità</div>
                    <div className={`font-semibold ${getLiquidityColor(selectedCryptoData.liquidity.assessment)}`}>
                      {selectedCryptoData.liquidity.score}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Reading per Crypto Selezionata */}
        {selectedCryptoData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Lettura AI - {selectedCryptoData.symbol}
            </h2>
            {loadingReading === selectedCryptoData.symbol ? (
              <div className="text-center py-8 text-gray-500">
                Generazione reading AI...
              </div>
            ) : cryptoReadings[selectedCryptoData.symbol] ? (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {cryptoReadings[selectedCryptoData.symbol]}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Clicca su una crypto per vedere la lettura AI
              </div>
            )}
          </div>
        )}

        {/* Market Cap Heatmap */}
        <div className="mb-6">
          <MarketCapHeatmap limit={50} />
        </div>

        {/* Solid Indicators per Crypto Selezionata */}
        {selectedCryptoData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Indicatori Solidi - {selectedCryptoData.symbol}
            </h2>
            {loadingIndicators === selectedCryptoData.symbol ? (
              <div className="text-center py-8 text-gray-500">
                Calcolo indicatori...
              </div>
            ) : solidIndicators[selectedCryptoData.symbol] ? (
              <div className="space-y-6">
                {/* VWAP */}
                {solidIndicators[selectedCryptoData.symbol].vwap && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      VWAP (Volume-Weighted Average Price)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">VWAP</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${solidIndicators[selectedCryptoData.symbol].vwap.vwap.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Deviazione</div>
                        <div className={`font-semibold ${
                          solidIndicators[selectedCryptoData.symbol].vwap.deviation > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {solidIndicators[selectedCryptoData.symbol].vwap.deviation >= 0 ? '+' : ''}
                          {solidIndicators[selectedCryptoData.symbol].vwap.deviation.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Prezzo {solidIndicators[selectedCryptoData.symbol].vwap.interpretation === 'above' ? 'sopra' : solidIndicators[selectedCryptoData.symbol].vwap.interpretation === 'below' ? 'sotto' : 'a'} VWAP
                      {' '}({solidIndicators[selectedCryptoData.symbol].vwap.significance})
                    </div>
                  </div>
                )}

                {/* Volume Profile */}
                {solidIndicators[selectedCryptoData.symbol].volumeProfile && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Volume Profile
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">POC</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${solidIndicators[selectedCryptoData.symbol].volumeProfile.poc.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Value Area High</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${solidIndicators[selectedCryptoData.symbol].volumeProfile.valueAreaHigh.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Value Area Low</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${solidIndicators[selectedCryptoData.symbol].volumeProfile.valueAreaLow.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      POC = Point of Control (prezzo con più volume). Value Area = 70% del volume.
                    </div>
                  </div>
                )}

                {/* Realized Volatility */}
                {solidIndicators[selectedCryptoData.symbol].realizedVolatility && (
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Realized Volatility
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Giornaliera</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {solidIndicators[selectedCryptoData.symbol].realizedVolatility.dailyVolatility.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Annualizzata</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {solidIndicators[selectedCryptoData.symbol].realizedVolatility.annualizedVolatility.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Periodo: {solidIndicators[selectedCryptoData.symbol].realizedVolatility.period} giorni
                      {' '}({solidIndicators[selectedCryptoData.symbol].realizedVolatility.interpretation})
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <button
                  onClick={async () => {
                    if (!selectedCryptoData) return;
                    setLoadingIndicators(selectedCryptoData.symbol);
                    try {
                      const res = await fetch(`/api/crypto/indicators/solid?symbol=${selectedCryptoData.symbol}`);
                      if (res.ok) {
                        const data = await res.json();
                        setSolidIndicators(prev => ({
                          ...prev,
                          [selectedCryptoData.symbol]: data,
                        }));
                      }
                    } catch (error) {
                      console.error('Error fetching solid indicators:', error);
                    } finally {
                      setLoadingIndicators(null);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Calcola Indicatori Solidi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Market Sentiment */}
        {marketSentiment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Market Sentiment Aggregato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sentiment</div>
                <div className={`text-2xl font-bold ${
                  marketSentiment.overall === 'very-bullish' || marketSentiment.overall === 'bullish'
                    ? 'text-green-600 dark:text-green-400'
                    : marketSentiment.overall === 'very-bearish' || marketSentiment.overall === 'bearish'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {marketSentiment.score > 0 ? '+' : ''}{marketSentiment.score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {marketSentiment.overall}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gainers</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {marketSentiment.gainersPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Crypto in crescita
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cambio Medio</div>
                <div className={`text-2xl font-bold ${
                  marketSentiment.averageChange >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {marketSentiment.averageChange >= 0 ? '+' : ''}
                  {marketSentiment.averageChange.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pressione Media</div>
                <div className={`text-2xl font-bold ${getPressureColor(marketSentiment.averagePressure)}`}>
                  {marketSentiment.averagePressure > 0 ? '+' : ''}
                  {(marketSentiment.averagePressure * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {marketSentiment.interpretation}
              </p>
            </div>
          </div>
        )}

        {/* Top Correlations */}
        {correlations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Correlazioni Forti (Top 10)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Crypto 1</th>
                    <th className="px-4 py-2 text-left">Crypto 2</th>
                    <th className="px-4 py-2 text-right">Correlazione</th>
                    <th className="px-4 py-2 text-center">Forza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {correlations.slice(0, 10).map((corr, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 font-semibold">{corr.symbol1}</td>
                      <td className="px-4 py-2 font-semibold">{corr.symbol2}</td>
                      <td className={`px-4 py-2 text-right font-semibold ${
                        corr.correlation > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          corr.strength === 'strong'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : corr.strength === 'moderate'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {corr.strength}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Market Summary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pressure Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Distribuzione Pressione
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredCryptos.map((c) => ({
                symbol: c.symbol,
                pressure: c.pressure.overall * 100,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pressione']} />
                <Bar dataKey="pressure">
                  {filteredCryptos.map((c, i) => (
                    <Cell
                      key={i}
                      fill={c.pressure.overall > 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Liquidity Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Distribuzione Liquidità
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredCryptos.map((c) => ({
                symbol: c.symbol,
                liquidity: c.liquidity.score,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value}/100`, 'Liquidità']} />
                <Bar dataKey="liquidity">
                  {filteredCryptos.map((c, i) => (
                    <Cell
                      key={i}
                      fill={
                        c.liquidity.assessment === 'very-high'
                          ? '#10b981'
                          : c.liquidity.assessment === 'high'
                          ? '#22c55e'
                          : c.liquidity.assessment === 'medium'
                          ? '#eab308'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Disclaimer:</strong> Questi dati e analisi sono a scopo educativo e informativo.
            Non costituiscono consigli di investimento o trading. Gli effetti microstrutturali sono
            piccoli, locali nel tempo, e facilmente annullati da costi di transazione. Il trading
            comporta rischi significativi.
          </p>
        </div>
      </div>
    </div>
  );
}

