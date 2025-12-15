/**
 * Crypto Market Microstructure Lab
 * 
 * Dashboard personale per trading intraday/scalping con:
 * - Order Book Multi-Exchange L400
 * - Bid/Ask Imbalance
 * - Futures Data (Funding, OI)
 * - Lettura AI del mercato
 */

'use client';

import { useState, useEffect } from 'react';
import { OrderBookHeatmap } from '@/components/crypto/OrderBookHeatmap';
import { ImbalanceChart } from '@/components/crypto/ImbalanceChart';
import { FuturesHistoryChart } from '@/components/crypto/FuturesHistoryChart';

interface MarketData {
  orderBook?: any;
  imbalance?: any;
  futures?: any;
  futuresHistory?: any;
  onchain?: any;
  reading?: {
    reading: string;
    warnings: string[];
  };
}

export default function CryptoMicrostructureLabPage() {
  const [symbol, setSymbol] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketData>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // secondi

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderBookRes, imbalanceRes, futuresRes, futuresHistoryRes, onchainRes, readingRes] = await Promise.all([
        fetch(`/api/crypto/microstructure/orderbook?symbol=${symbol}&explanation=true`),
        fetch(`/api/crypto/microstructure/imbalance?symbol=${symbol}&explanation=true`),
        fetch(`/api/crypto/futures/data?symbol=${symbol}&explanation=true`),
        fetch(`/api/crypto/futures/history?symbol=${symbol}&period=24h`),
        fetch(`/api/crypto/onchain/data?symbol=${symbol}&explanation=true`),
        fetch(`/api/crypto/microstructure/reading?symbol=${symbol}`),
      ]);

      const orderBook = orderBookRes.ok ? await orderBookRes.json() : null;
      const imbalance = imbalanceRes.ok ? await imbalanceRes.json() : null;
      const futures = futuresRes.ok ? await futuresRes.json() : null;
      const futuresHistory = futuresHistoryRes.ok ? await futuresHistoryRes.json() : null;
      const onchain = onchainRes.ok ? await onchainRes.json() : null;
      const reading = readingRes.ok ? await readingRes.json() : null;

      setData({
        orderBook,
        imbalance,
        futures,
        futuresHistory,
        onchain,
        reading,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, symbol]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Crypto Market Microstructure Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dati puliti, analisi accademica, lettura AI del mercato
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Simbolo
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="BNB">BNB</option>
              <option value="SOL">SOL</option>
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
                min="1"
                max="60"
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

        {/* Market Reading (AI) */}
        {data.reading?.reading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Lettura AI del Mercato
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {data.reading.reading}
              </p>
            </div>
            {data.reading.warnings && data.reading.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Avvisi
                </h3>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300">
                  {data.reading.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Grid: Order Book, Imbalance, Futures */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Order Book */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Book L400
            </h2>
            {data.orderBook ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Profondità</span>
                    <span>{data.orderBook.aggregated?.depth || 0} livelli</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Volume Bid</span>
                    <span className="text-green-600 dark:text-green-400">
                      {data.orderBook.aggregated?.totalBidVolume?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Volume Ask</span>
                    <span className="text-red-600 dark:text-red-400">
                      {data.orderBook.aggregated?.totalAskVolume?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Exchange: {data.orderBook.exchanges?.map((e: any) => e.name).join(', ') || 'N/A'}
                </div>
                {data.orderBook.explanation && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {data.orderBook.explanation}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Caricamento...</p>
            )}
          </div>

          {/* Imbalance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Bid/Ask Imbalance
            </h2>
            {data.imbalance ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Imbalance Complessivo</span>
                    <span className={`font-bold ${
                      data.imbalance.overallImbalance > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(data.imbalance.overallImbalance * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Spread</span>
                    <span>{data.imbalance.spreadPercent?.toFixed(3)}%</span>
                  </div>
                </div>
                {data.imbalance.imbalances && data.imbalance.imbalances.length > 0 && (
                  <div className="mt-4">
                    <ImbalanceChart imbalances={data.imbalance.imbalances} />
                  </div>
                )}
                {data.imbalance.explanation && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {data.imbalance.explanation}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Caricamento...</p>
            )}
          </div>

          {/* Futures */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Futures Data
            </h2>
            {data.futures ? (
              <div className="space-y-4">
                {data.futures.funding && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Funding Rate</span>
                      <span className={`font-bold ${
                        data.futures.funding.fundingRatePercent > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {data.futures.funding.fundingRatePercent?.toFixed(4)}%
                      </span>
                    </div>
                    {data.futures.sentiment?.fundingExtreme && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        ⚠️ Estremo
                      </div>
                    )}
                  </div>
                )}
                {data.futures.openInterest && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Open Interest</span>
                      <span>${data.futures.openInterest.openInterest?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                )}
                {data.futures.sentiment?.interpretation && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {data.futures.sentiment.interpretation}
                  </div>
                )}
                {data.futures.explanation && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {data.futures.explanation}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Caricamento...</p>
            )}
          </div>
        </div>

        {/* Visualizzazioni Grafiche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Book Heatmap */}
          {data.orderBook?.aggregated && data.imbalance?.midPrice && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <OrderBookHeatmap
                bids={data.orderBook.aggregated.bids}
                asks={data.orderBook.aggregated.asks}
                midPrice={data.imbalance.midPrice}
                maxLevels={30}
              />
            </div>
          )}

          {/* Futures History */}
          {data.futuresHistory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <FuturesHistoryChart
                fundingHistory={data.futuresHistory.fundingHistory || []}
                oiHistory={data.futuresHistory.oiHistory || []}
              />
            </div>
          )}
        </div>

        {/* On-Chain Data */}
        {data.onchain && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Dati On-Chain
            </h2>
            {data.onchain.exchangeFlow ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Net Flow 24h</div>
                    <div className={`text-lg font-bold ${
                      data.onchain.exchangeFlow.netFlow24h > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${data.onchain.exchangeFlow.netFlow24h.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {data.onchain.exchangeFlow.netFlowPercent.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Inflow 24h</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${data.onchain.exchangeFlow.inflow24h.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Outflow 24h</div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      ${data.onchain.exchangeFlow.outflow24h.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Whale Movements</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {data.onchain.whaleMovements?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      &gt;$1M ultime 24h
                    </div>
                  </div>
                </div>
                {data.onchain.exchangeFlow.interpretation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
                    {data.onchain.exchangeFlow.interpretation}
                  </div>
                )}
                {data.onchain.explanation && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {data.onchain.explanation}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Dati on-chain non disponibili (richiede WHALE_ALERT_API_KEY)
              </p>
            )}
          </div>
        )}

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

