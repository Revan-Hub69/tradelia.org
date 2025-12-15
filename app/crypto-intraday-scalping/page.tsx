/**
 * Crypto Intraday/Scalping Dashboard
 * 
 * Dashboard dedicata per trading intraday/scalping con leva e futures
 * Focus su:
 * - Real-time order book
 * - Funding rates
 * - Liquidations
 * - Order flow
 * - Spread arbitrage
 * - Leverage metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TOP_CRYPTO = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK'];

export default function CryptoIntradayScalpingPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [futuresData, setFuturesData] = useState<any>(null);
  const [orderFlow, setOrderFlow] = useState<any>(null);
  const [liquidations, setLiquidations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [futuresRes, orderFlowRes, liquidationsRes] = await Promise.all([
        fetch(`/api/crypto/futures/intraday?symbol=${selectedCrypto}`),
        fetch(`/api/crypto/intraday/order-flow?symbol=${selectedCrypto}`),
        fetch(`/api/crypto/intraday/liquidations?symbol=${selectedCrypto}`),
      ]);

      if (futuresRes.ok) {
        const data = await futuresRes.json();
        setFuturesData(data);
      }

      if (orderFlowRes.ok) {
        const data = await orderFlowRes.json();
        setOrderFlow(data);
      }

      if (liquidationsRes.ok) {
        const data = await liquidationsRes.json();
        setLiquidations(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCrypto]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5000); // Refresh ogni 5 secondi
    return () => clearInterval(interval);
  }, [autoRefresh, selectedCrypto]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crypto Intraday/Scalping Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trading real-time con leva e futures - Dati aggiornati ogni 5 secondi
        </p>
      </div>

      {/* Crypto Selector */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {TOP_CRYPTO.map((crypto) => (
          <button
            key={crypto}
            onClick={() => setSelectedCrypto(crypto)}
            className={`px-4 py-2 rounded ${
              selectedCrypto === crypto
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {crypto}
          </button>
        ))}
      </div>

      {/* Auto Refresh Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Auto-refresh ogni 5 secondi
          </span>
        </label>
      </div>

      {loading && !futuresData ? (
        <div className="text-center py-8 text-gray-500">Caricamento dati...</div>
      ) : (
        <>
          {/* Futures Data */}
          {futuresData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Funding Rate</div>
                <div className={`text-2xl font-bold ${
                  futuresData.fundingRate > 0.1 ? 'text-red-600' :
                  futuresData.fundingRate > 0.05 ? 'text-orange-600' :
                  futuresData.fundingRate > -0.05 ? 'text-gray-600' :
                  futuresData.fundingRate > -0.1 ? 'text-green-600' : 'text-green-700'
                }`}>
                  {futuresData.fundingRate >= 0 ? '+' : ''}{futuresData.fundingRate.toFixed(4)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {futuresData.fundingRateImpact.interpretation}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Interest</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(futuresData.openInterestValue / 1e9).toFixed(2)}B
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {futuresData.openInterest.toLocaleString()} contracts
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Long/Short Ratio</div>
                <div className={`text-2xl font-bold ${
                  futuresData.longShortRatio > 1.2 ? 'text-green-600' :
                  futuresData.longShortRatio > 0.8 ? 'text-gray-600' : 'text-red-600'
                }`}>
                  {futuresData.longShortRatio.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {futuresData.longAccount.toFixed(1)}% long / {futuresData.shortAccount.toFixed(1)}% short
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Liquidation Risk</div>
                <div className={`text-2xl font-bold ${
                  futuresData.liquidationRisk === 'very-high' ? 'text-red-700' :
                  futuresData.liquidationRisk === 'high' ? 'text-red-600' :
                  futuresData.liquidationRisk === 'medium' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {futuresData.liquidationRisk.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Recommended leverage: {futuresData.leverageMetrics.recommendedLeverage}x
                </div>
              </div>
            </div>
          )}

          {/* Order Flow */}
          {orderFlow && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Flow - {selectedCrypto}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Imbalance</div>
                  <div className={`text-3xl font-bold ${
                    orderFlow.imbalance > 0.2 ? 'text-green-600' :
                    orderFlow.imbalance < -0.2 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {(orderFlow.imbalance * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {orderFlow.interpretation}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Flow Direction</div>
                  <div className={`text-2xl font-bold ${
                    orderFlow.flowDirection === 'buying' ? 'text-green-600' :
                    orderFlow.flowDirection === 'selling' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {orderFlow.flowDirection.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Aggressive: {orderFlow.aggressiveBuyVolume.toFixed(2)} buy / {orderFlow.aggressiveSellVolume.toFixed(2)} sell
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Liquidations */}
          {liquidations && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Liquidation Clusters - {selectedCrypto}
              </h2>
              <div className="space-y-2">
                {liquidations.liquidationClusters.map((cluster: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="w-20 text-sm font-semibold">{cluster.leverage}x</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Long: ${cluster.longLiquidationPrice.toFixed(2)} ({cluster.distanceLong.toFixed(2)}%)</div>
                      <div className="text-xs text-gray-500">Short: ${cluster.shortLiquidationPrice.toFixed(2)} ({cluster.distanceShort.toFixed(2)}%)</div>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-semibold ${
                      cluster.risk === 'very-high' ? 'bg-red-700 text-white' :
                      cluster.risk === 'high' ? 'bg-red-500 text-white' :
                      cluster.risk === 'medium' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {cluster.risk}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

