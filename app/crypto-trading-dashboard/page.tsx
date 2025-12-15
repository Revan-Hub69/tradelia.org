/**
 * Crypto Trading Dashboard - Decision Making
 * 
 * UNA SOLA PAGINA per decidere:
 * 1. Su quale crypto operare
 * 2. Come operare (long/short, leverage, entry/exit)
 * 
 * Integra TUTTO:
 * - Supporti/Resistenze reali (order book)
 * - Funding Rates (sentiment, liquidations risk)
 * - Liquidations Clusters (zone pericolose)
 * - Order Flow (pressione immediata)
 * - Market Pressure (buying/selling)
 * - Leverage Metrics (risk management)
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/skeleton';

const TOP_CRYPTO = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'UNI', 'ATOM', 'LTC', 'NEAR'];

interface TradingDecision {
  symbol: string;
  recommendation: 'LONG' | 'SHORT' | 'NEUTRAL' | 'AVOID';
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  recommendedLeverage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export default function CryptoTradingDashboardPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dati market overview (supporti/resistenze, pressione)
  const [marketData, setMarketData] = useState<any>(null);
  
  // Dati futures (funding, OI, liquidations)
  const [futuresData, setFuturesData] = useState<any>(null);
  
  // Order flow
  const [orderFlow, setOrderFlow] = useState<any>(null);
  
  // Liquidations
  const [liquidations, setLiquidations] = useState<any>(null);
  
  // Decisione automatica
  const [decision, setDecision] = useState<TradingDecision | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [marketRes, futuresRes, orderFlowRes, liquidationsRes] = await Promise.allSettled([
        fetch(`/api/crypto/market-overview?limit=50`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/futures/intraday?symbol=${selectedCrypto}`).then(r => r.ok || r.status === 206 ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/intraday/order-flow?symbol=${selectedCrypto}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/intraday/liquidations?symbol=${selectedCrypto}`).then(r => r.ok || r.status === 206 ? r.json() : null).catch(() => null),
      ]);

      // Estrai dati da Promise.allSettled
      const marketData = marketRes.status === 'fulfilled' ? marketRes.value : null;
      const futuresData = futuresRes.status === 'fulfilled' ? futuresRes.value : null;
      const orderFlowData = orderFlowRes.status === 'fulfilled' ? orderFlowRes.value : null;
      const liquidationsData = liquidationsRes.status === 'fulfilled' ? liquidationsRes.value : null;

      // Trova dati per crypto selezionata
      const cryptoMarketData = marketData?.cryptos?.find((c: any) => c.symbol === selectedCrypto);
      setMarketData(cryptoMarketData);
      setFuturesData(futuresData);
      setOrderFlow(orderFlowData);
      setLiquidations(liquidationsData);

      // Calcola decisione automatica (anche con dati parziali)
      if (cryptoMarketData) {
        const decision = calculateTradingDecision(
          cryptoMarketData,
          futuresData,
          orderFlowData,
          liquidationsData
        );
        setDecision(decision);
      }

      // Mostra warning se dati parziali
      if (futuresData?.partial || futuresData?.warning) {
        setError('Alcuni dati potrebbero essere incompleti');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Errore nel caricamento dati. Riprova tra qualche secondo.');
    } finally {
      setLoading(false);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    fetchAllData();
  }, [selectedCrypto]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAllData, 5000); // 5 secondi
    return () => clearInterval(interval);
  }, [autoRefresh, selectedCrypto]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crypto Trading Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tutti i dati per decidere su quale crypto operare e come - Aggiornato ogni 5 secondi
        </p>
      </div>

      {/* Crypto Selector */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap mb-4">
          {TOP_CRYPTO.map((crypto) => (
            <button
              key={crypto}
              onClick={() => setSelectedCrypto(crypto)}
              className={`px-4 py-2 rounded transition-colors ${
                selectedCrypto === crypto
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {crypto}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600 dark:text-gray-400">Auto-refresh ogni 5 secondi</span>
        </label>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
              aria-label="Chiudi avviso"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {loading && !marketData ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonChart height={400} />
          <SkeletonTable rows={5} cols={4} />
        </div>
      ) : (
        <>
          {/* DECISIONE AUTOMATICA - PRIMA COSA DA VEDERE */}
          {decision && (
            <div className={`mb-6 rounded-lg shadow-lg p-6 border-l-4 ${
              decision.recommendation === 'LONG' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
              decision.recommendation === 'SHORT' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              decision.recommendation === 'AVOID' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-gray-50 dark:bg-gray-800 border-gray-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {decision.recommendation} - {selectedCrypto}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence: </span>
                      <span className={`font-semibold ${
                        decision.confidence === 'high' ? 'text-green-600' :
                        decision.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {decision.confidence.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Risk: </span>
                      <span className={`font-semibold ${
                        decision.riskLevel === 'low' ? 'text-green-600' :
                        decision.riskLevel === 'medium' ? 'text-yellow-600' :
                        decision.riskLevel === 'high' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {decision.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Leverage: </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {decision.recommendedLeverage}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entry/Exit Levels */}
              {decision.entryPrice && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Entry</div>
                    <div className="font-bold text-lg">${decision.entryPrice.toFixed(2)}</div>
                  </div>
                  {decision.stopLoss && (
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
                      <div className="font-bold text-lg text-red-600">${decision.stopLoss.toFixed(2)}</div>
                    </div>
                  )}
                  {decision.takeProfit && (
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Take Profit</div>
                      <div className="font-bold text-lg text-green-600">${decision.takeProfit.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Reasoning */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ragionamento:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {decision.reasoning.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* QUICK STATS - Tutti i dati chiave in una vista */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {/* Price & Change */}
            {marketData && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-xs text-gray-500 mb-1">Prezzo</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ${marketData.price.toFixed(2)}
                  </div>
                  <div className={`text-sm ${marketData.change24hPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketData.change24hPercent >= 0 ? '+' : ''}{marketData.change24hPercent.toFixed(2)}%
                  </div>
                </div>

                {/* Funding Rate */}
                {futuresData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Funding Rate</div>
                    <div className={`text-xl font-bold ${
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
                )}

                {/* Order Flow Imbalance */}
                {orderFlow && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Order Flow</div>
                    <div className={`text-xl font-bold ${
                      orderFlow.imbalance > 0.2 ? 'text-green-600' :
                      orderFlow.imbalance < -0.2 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {(orderFlow.imbalance * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderFlow.flowDirection}
                    </div>
                  </div>
                )}

                {/* Market Pressure */}
                {marketData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Pressione</div>
                    <div className={`text-xl font-bold ${
                      marketData.pressure.overall > 0.2 ? 'text-green-600' :
                      marketData.pressure.overall < -0.2 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {(marketData.pressure.overall * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.pressure.strength}
                    </div>
                  </div>
                )}

                {/* Liquidation Risk */}
                {futuresData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Liquidation Risk</div>
                    <div className={`text-xl font-bold ${
                      futuresData.liquidationRisk === 'very-high' ? 'text-red-700' :
                      futuresData.liquidationRisk === 'high' ? 'text-red-600' :
                      futuresData.liquidationRisk === 'medium' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {futuresData.liquidationRisk.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Leverage: {futuresData.leverageMetrics.recommendedLeverage}x
                    </div>
                  </div>
                )}

                {/* Long/Short Ratio */}
                {futuresData && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Long/Short</div>
                    <div className={`text-xl font-bold ${
                      futuresData.longShortRatio > 1.2 ? 'text-green-600' :
                      futuresData.longShortRatio > 0.8 ? 'text-gray-600' : 'text-red-600'
                    }`}>
                      {futuresData.longShortRatio.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {futuresData.longAccount.toFixed(0)}% / {futuresData.shortAccount.toFixed(0)}%
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* DETTAGLI COMPLETI - Espandibili */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supporti/Resistenze */}
            {marketData && marketData.supportResistance.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Supporti & Resistenze
                </h3>
                <div className="space-y-2">
                  {marketData.supportResistance.slice(0, 5).map((sr: any, i: number) => (
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
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Forza: {sr.strength} | Distanza: {Math.abs(sr.distancePercent).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liquidations Clusters */}
            {liquidations && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Liquidation Clusters
                </h3>
                <div className="space-y-2">
                  {liquidations.liquidationClusters.slice(0, 5).map((cluster: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{cluster.leverage}x</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          cluster.risk === 'very-high' ? 'bg-red-700 text-white' :
                          cluster.risk === 'high' ? 'bg-red-500 text-white' :
                          cluster.risk === 'medium' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {cluster.risk}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Long: ${cluster.longLiquidationPrice.toFixed(2)} ({cluster.distanceLong.toFixed(2)}%) | 
                        Short: ${cluster.shortLiquidationPrice.toFixed(2)} ({cluster.distanceShort.toFixed(2)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Calcola decisione di trading automatica basata su tutti i dati
 */
function calculateTradingDecision(
  marketData: any,
  futuresData: any,
  orderFlow: any,
  liquidations: any
): TradingDecision {
  const reasoning: string[] = [];
  let recommendation: 'LONG' | 'SHORT' | 'NEUTRAL' | 'AVOID' = 'NEUTRAL';
  let confidence: 'low' | 'medium' | 'high' = 'low';
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high' = 'medium';
  let recommendedLeverage = 10;

  const currentPrice = marketData.price;
  let entryPrice = currentPrice;
  let stopLoss: number | undefined;
  let takeProfit: number | undefined;

  // 1. Analizza Funding Rate
  if (futuresData.fundingRate > 0.1) {
    reasoning.push(`Funding rate molto alto (${futuresData.fundingRate.toFixed(4)}%) = molti long = rischio liquidazione long se prezzo scende`);
    riskLevel = 'high';
  } else if (futuresData.fundingRate < -0.1) {
    reasoning.push(`Funding rate molto negativo (${futuresData.fundingRate.toFixed(4)}%) = molti short = rischio liquidazione short se prezzo sale`);
    riskLevel = 'high';
  }

  // 2. Analizza Order Flow
  if (orderFlow.imbalance > 0.2) {
    reasoning.push(`Forte pressione rialzista (imbalance ${(orderFlow.imbalance * 100).toFixed(1)}%)`);
    if (recommendation === 'NEUTRAL') {
      recommendation = 'LONG';
      confidence = 'medium';
    }
  } else if (orderFlow.imbalance < -0.2) {
    reasoning.push(`Forte pressione ribassista (imbalance ${(orderFlow.imbalance * 100).toFixed(1)}%)`);
    if (recommendation === 'NEUTRAL') {
      recommendation = 'SHORT';
      confidence = 'medium';
    }
  }

  // 3. Analizza Market Pressure
  if (marketData.pressure.overall > 0.3) {
    reasoning.push(`Alta pressione di acquisto (${(marketData.pressure.overall * 100).toFixed(1)}%)`);
    if (recommendation === 'LONG') confidence = 'high';
    else if (recommendation === 'NEUTRAL') {
      recommendation = 'LONG';
      confidence = 'medium';
    }
  } else if (marketData.pressure.overall < -0.3) {
    reasoning.push(`Alta pressione di vendita (${(marketData.pressure.overall * 100).toFixed(1)}%)`);
    if (recommendation === 'SHORT') confidence = 'high';
    else if (recommendation === 'NEUTRAL') {
      recommendation = 'SHORT';
      confidence = 'medium';
    }
  }

  // 4. Analizza Supporti/Resistenze
  const nearestSupport = marketData.supportResistance
    .filter((sr: any) => sr.type === 'support' && sr.price < currentPrice)
    .sort((a: any, b: any) => b.price - a.price)[0];
  
  const nearestResistance = marketData.supportResistance
    .filter((sr: any) => sr.type === 'resistance' && sr.price > currentPrice)
    .sort((a: any, b: any) => a.price - b.price)[0];

  if (nearestSupport) {
    reasoning.push(`Supporto più vicino: $${nearestSupport.price.toFixed(2)} (forza: ${nearestSupport.strength})`);
    if (recommendation === 'LONG') {
      stopLoss = nearestSupport.price * 0.99; // 1% sotto supporto
      entryPrice = currentPrice;
    }
  }

  if (nearestResistance) {
    reasoning.push(`Resistenza più vicina: $${nearestResistance.price.toFixed(2)} (forza: ${nearestResistance.strength})`);
    if (recommendation === 'SHORT') {
      stopLoss = nearestResistance.price * 1.01; // 1% sopra resistenza
      entryPrice = currentPrice;
    }
    if (recommendation === 'LONG') {
      takeProfit = nearestResistance.price * 0.99; // 1% sotto resistenza
    }
  }

  // 5. Analizza Liquidation Risk
  if (futuresData.liquidationRisk === 'very-high' || futuresData.liquidationRisk === 'high') {
    reasoning.push(`Rischio liquidazione ${futuresData.liquidationRisk} - usare leverage conservativo`);
    recommendedLeverage = 5;
    riskLevel = 'high';
  } else {
    recommendedLeverage = futuresData.leverageMetrics.recommendedLeverage;
  }

  // 6. Evita se conflitti
  if (orderFlow.imbalance > 0.2 && futuresData.fundingRate > 0.1) {
    reasoning.push(`⚠️ Conflitto: order flow rialzista ma funding alto = molti long già posizionati`);
    recommendation = 'AVOID';
    confidence = 'high';
  } else if (orderFlow.imbalance < -0.2 && futuresData.fundingRate < -0.1) {
    reasoning.push(`⚠️ Conflitto: order flow ribassista ma funding negativo = molti short già posizionati`);
    recommendation = 'AVOID';
    confidence = 'high';
  }

  // 7. Se nessun segnale chiaro
  if (Math.abs(orderFlow.imbalance) < 0.1 && Math.abs(marketData.pressure.overall) < 0.2) {
    reasoning.push(`Segnali deboli - attendere setup migliore`);
    recommendation = 'NEUTRAL';
    confidence = 'low';
  }

  return {
    symbol: marketData.symbol,
    recommendation,
    confidence,
    reasoning,
    entryPrice,
    stopLoss,
    takeProfit,
    recommendedLeverage,
    riskLevel,
  };
}

