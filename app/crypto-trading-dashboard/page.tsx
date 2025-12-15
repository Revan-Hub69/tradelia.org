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
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/components/ui/Skeleton';
import { useBinanceTrades, useBinanceOrderBook } from '@/lib/websocket/binance-websocket';
import { calculateHighPrecisionSignal } from '@/lib/trading/signal-system';
import { getPerformanceTracker } from '@/lib/trading/performance-tracker';
import { getAlertSystem } from '@/lib/alerts/alert-system';
import { createRiskManager } from '@/lib/risk/risk-manager';
import { detectAllPatterns } from '@/lib/analysis/pattern-recognition';
import { PerformanceDashboard } from '@/components/trading/PerformanceDashboard';
import { AlertsPanel } from '@/components/trading/AlertsPanel';
import { RiskManagerPanel } from '@/components/trading/RiskManagerPanel';
import { AIAssistant } from '@/components/trading/AIAssistant';
import { MarketScanner } from '@/components/trading/MarketScanner';
import { PatternRecognition } from '@/components/trading/PatternRecognition';
import { PortfolioTracker } from '@/components/trading/PortfolioTracker';
import { BacktestingPanel } from '@/components/trading/BacktestingPanel';
import { AdvancedCharts } from '@/components/trading/AdvancedCharts';
import { MarketDepthAnalysis } from '@/components/trading/MarketDepthAnalysis';
import type { DashboardData } from '@/lib/ai/groq-assistant';

// Dynamic crypto list - no hardcoded values

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
  
  // Dynamic crypto list
  const [cryptoList, setCryptoList] = useState<Array<{ symbol: string; name: string; marketCap: number; price: number }>>([]);
  const [cryptoListLoading, setCryptoListLoading] = useState(true);
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [cryptoLimit, setCryptoLimit] = useState(50);
  
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

  // Multi-timeframe data
  const [multiTimeframeData, setMultiTimeframeData] = useState<any>(null);

  // WebSocket real-time data
  const binanceSymbol = useMemo(() => selectedCrypto.includes('USDT') ? selectedCrypto : `${selectedCrypto}USDT`, [selectedCrypto]);
  const { trades: realTimeTrades, latestTrade } = useBinanceTrades(binanceSymbol);
  const { orderBook: realTimeOrderBook } = useBinanceOrderBook(binanceSymbol, 20);

  // Risk Manager
  const [riskManager] = useState(() => createRiskManager({
    accountBalance: 10000,
    riskPerTrade: 0.01,
    maxRiskPerDay: 0.05,
    maxPositions: 5,
    maxLeverage: 20,
    stopLossPercent: 0.02,
    takeProfitPercent: 0.04,
    useKellyCriterion: false,
  }));

  // Fetch dynamic crypto list
  const fetchCryptoList = useCallback(async () => {
    setCryptoListLoading(true);
    try {
      const response = await fetch(`/api/crypto/list?limit=${cryptoLimit}&exchange=binance${cryptoSearch ? `&search=${cryptoSearch}` : ''}`);
      if (response.ok) {
        const data = await response.json();
        setCryptoList(data.crypto || []);
        // Auto-select first if current selection not in list
        if (data.crypto.length > 0 && !data.crypto.find((c: any) => c.symbol === selectedCrypto)) {
          setSelectedCrypto(data.crypto[0].symbol);
        }
      }
    } catch (error) {
      console.error('Error fetching crypto list:', error);
    } finally {
      setCryptoListLoading(false);
    }
  }, [cryptoLimit, cryptoSearch, selectedCrypto]);

  useEffect(() => {
    fetchCryptoList();
  }, [fetchCryptoList]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [marketRes, futuresRes, orderFlowRes, liquidationsRes, multiTimeframeRes] = await Promise.allSettled([
        fetch(`/api/crypto/market-overview?limit=50`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/futures/intraday?symbol=${selectedCrypto}`).then(r => r.ok || r.status === 206 ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/intraday/order-flow?symbol=${selectedCrypto}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/intraday/liquidations?symbol=${selectedCrypto}`).then(r => r.ok || r.status === 206 ? r.json() : null).catch(() => null),
        fetch(`/api/crypto/indicators/multi-timeframe?symbol=${selectedCrypto}&timeframes=1m,5m,15m,1h`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      // Estrai dati da Promise.allSettled
      const marketData = marketRes.status === 'fulfilled' ? marketRes.value : null;
      const futuresData = futuresRes.status === 'fulfilled' ? futuresRes.value : null;
      const orderFlowData = orderFlowRes.status === 'fulfilled' ? orderFlowRes.value : null;
      const liquidationsData = liquidationsRes.status === 'fulfilled' ? liquidationsRes.value : null;
      const multiTimeframeData = multiTimeframeRes.status === 'fulfilled' ? multiTimeframeRes.value : null;

      // Trova dati per crypto selezionata
      const cryptoMarketData = marketData?.cryptos?.find((c: any) => c.symbol === selectedCrypto);
      setMarketData(cryptoMarketData);
      setFuturesData(futuresData);
      setOrderFlow(orderFlowData);
      setLiquidations(liquidationsData);
      setMultiTimeframeData(multiTimeframeData);

      // Calcola decisione automatica con HIGH-PRECISION SIGNAL SYSTEM
      if (cryptoMarketData) {
        // Usa nuovo sistema ad alta precisione
        const highPrecisionSignal = calculateHighPrecisionSignal(
          {
            price: cryptoMarketData.price,
            supportResistance: cryptoMarketData.supportResistance || [],
            marketPressure: {
              buying: cryptoMarketData.pressure?.buying || 0,
              selling: cryptoMarketData.pressure?.selling || 0,
            },
          },
          futuresData ? {
            fundingRate: futuresData.fundingRate || 0,
            openInterest: futuresData.openInterest || 0,
            longShortRatio: futuresData.longShortRatio || 1,
            liquidationRisk: futuresData.liquidationRisk || 'medium',
          } : null,
          orderFlowData ? {
            imbalance: orderFlowData.summary?.imbalance || 0,
            pressure: orderFlowData.summary?.buyPressure ? 'buying' : orderFlowData.summary?.sellPressure ? 'selling' : 'neutral',
          } : null,
          liquidationsData ? {
            liquidationClusters: liquidationsData.liquidationClusters || [],
          } : null,
          orderFlowData?.combinedSignal
        );

        // Converti a formato TradingDecision
        const decision: TradingDecision = {
          symbol: selectedCrypto,
          recommendation: highPrecisionSignal.signal === 'STRONG_BUY' || highPrecisionSignal.signal === 'BUY' ? 'LONG' :
                         highPrecisionSignal.signal === 'STRONG_SELL' || highPrecisionSignal.signal === 'SELL' ? 'SHORT' :
                         highPrecisionSignal.signal === 'NEUTRAL' ? 'NEUTRAL' : 'AVOID',
          confidence: highPrecisionSignal.confidence >= 85 ? 'high' :
                     highPrecisionSignal.confidence >= 70 ? 'medium' : 'low',
          reasoning: highPrecisionSignal.reasons,
          entryPrice: highPrecisionSignal.entryPrice,
          stopLoss: highPrecisionSignal.stopLoss,
          takeProfit: highPrecisionSignal.takeProfit,
          recommendedLeverage: highPrecisionSignal.recommendedLeverage,
          riskLevel: highPrecisionSignal.riskLevel,
        };

        // Risk Management - Valida prima di registrare
        if (decision.recommendation !== 'NEUTRAL' && decision.recommendation !== 'AVOID' && decision.entryPrice && decision.stopLoss) {
          const riskAnalysis = riskManager.analyzeRisk(
            selectedCrypto,
            decision.entryPrice,
            decision.stopLoss,
            decision.takeProfit || decision.entryPrice * 1.02,
            decision.recommendedLeverage,
            highPrecisionSignal.winRate / 100,
            decision.takeProfit ? (decision.takeProfit - decision.entryPrice) : 0,
            decision.stopLoss ? (decision.entryPrice - decision.stopLoss) : 0
          );

          if (riskAnalysis.canOpenPosition) {
            // Registra segnale per performance tracking
            const tracker = getPerformanceTracker();
            tracker.recordSignal({
              symbol: selectedCrypto,
              signal: highPrecisionSignal.signal,
              confidence: highPrecisionSignal.confidence,
              entryPrice: decision.entryPrice,
              stopLoss: decision.stopLoss,
              takeProfit: decision.takeProfit || decision.entryPrice * 1.02,
              leverage: decision.recommendedLeverage,
            });

            // Crea alert per segnali forti (escludi NEUTRAL)
            const alertSystem = getAlertSystem();
            if (highPrecisionSignal.confidence >= 80 && 
                highPrecisionSignal.signal !== 'NEUTRAL' &&
                decision.entryPrice) {
              alertSystem.createSignalAlert({
                symbol: selectedCrypto,
                signal: highPrecisionSignal.signal as 'STRONG_BUY' | 'BUY' | 'SELL' | 'STRONG_SELL',
                confidence: highPrecisionSignal.confidence,
                entryPrice: decision.entryPrice,
              });
            }

            // Check price alerts
            alertSystem.checkPriceAlerts(selectedCrypto, cryptoMarketData.price);
          } else {
            // Segnale non valido per risk management
            decision.recommendation = 'AVOID';
            decision.reasoning.push(`⚠️ Rischio troppo alto: ${riskAnalysis.reason}`);
          }
        }

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

      {/* Crypto Selector - Dynamic */}
      <div className="mb-6">
        <div className="mb-4 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Cerca crypto..."
            value={cryptoSearch}
            onChange={(e) => setCryptoSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 max-w-md"
          />
          <select
            value={cryptoLimit}
            onChange={(e) => setCryptoLimit(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
            <option value={200}>Top 200</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {cryptoListLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Caricamento crypto...</div>
          ) : cryptoList.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">Nessuna crypto trovata</div>
          ) : (
            cryptoList.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => setSelectedCrypto(crypto.symbol)}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedCrypto === crypto.symbol
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={`${crypto.name} - Market Cap: $${(crypto.marketCap / 1e9).toFixed(2)}B`}
              >
                {crypto.symbol}
              </button>
            ))
          )}
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
          {/* PORTFOLIO TRACKER */}
          <div className="mb-6">
            <PortfolioTracker accountBalance={10000} />
          </div>

          {/* PERFORMANCE TRACKING */}
          <div className="mb-6">
            <PerformanceDashboard timeframe="24h" />
          </div>

          {/* ALERTS PANEL */}
          <div className="mb-6">
            <AlertsPanel />
          </div>

          {/* RISK MANAGER */}
          <div className="mb-6">
            <RiskManagerPanel accountBalance={10000} />
          </div>

          {/* AI ASSISTANT - Interpretazione Intelligente Dati */}
          {marketData && futuresData && orderFlow && (
            <div className="mb-6">
              <AIAssistant
                dashboardData={{
                  marketData: {
                    price: marketData.price,
                    change24hPercent: marketData.change24hPercent,
                    supportResistance: marketData.supportResistance || [],
                    pressure: marketData.pressure || { buying: 0, selling: 0, overall: 0 },
                  },
                  futuresData: futuresData ? {
                    fundingRate: futuresData.fundingRate || 0,
                    openInterest: futuresData.openInterest || 0,
                    longShortRatio: futuresData.longShortRatio || 1,
                    liquidationRisk: futuresData.liquidationRisk || 'medium',
                    leverageMetrics: futuresData.leverageMetrics || {
                      recommendedLeverage: decision?.recommendedLeverage || 10,
                      maxSafeLeverage: 20,
                    },
                  } : undefined,
                  orderFlow: orderFlow && orderFlow.indicators ? {
                    indicators: {
                      delta: orderFlow.indicators.delta || { deltaPercent: 0, signal: 'NEUTRAL' },
                      takerRatio: orderFlow.indicators.takerRatio || { ratio: 1 },
                      orderBookImbalance: orderFlow.indicators.orderBookImbalance || { imbalancePercent: 0 },
                    },
                    combinedSignal: orderFlow.combinedSignal || {
                      signal: 'NEUTRAL',
                      confidence: 50,
                      reasons: [],
                    },
                  } : undefined,
                  decision: decision ? {
                    recommendation: decision.recommendation,
                    confidence: decision.confidence,
                    reasoning: decision.reasoning,
                    entryPrice: decision.entryPrice,
                    stopLoss: decision.stopLoss,
                    takeProfit: decision.takeProfit,
                    recommendedLeverage: decision.recommendedLeverage,
                    riskLevel: decision.riskLevel,
                  } : undefined,
                }}
                symbol={selectedCrypto}
              />
            </div>
          )}

          {/* PATTERN RECOGNITION */}
          <div className="mb-6">
            <PatternRecognition
              symbol={selectedCrypto}
              supportResistance={marketData?.supportResistance || []}
              onPatternDetected={(pattern) => {
                // Auto-create alert for high-confidence patterns (only bullish/bearish, skip neutral)
                if (pattern.confidence >= 75 && pattern.signal !== 'neutral') {
                  const alertSystem = getAlertSystem();
                  alertSystem.createPatternAlert(
                    selectedCrypto,
                    pattern.name,
                    pattern.signal as 'bullish' | 'bearish',
                    pattern.description
                  );
                }
              }}
            />
          </div>

          {/* MULTI-TIMEFRAME ANALYSIS */}
          {multiTimeframeData && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Multi-Timeframe Analysis
              </h3>
              {multiTimeframeData.analysis && (
                <div className="mb-4">
                  <div className={`p-4 rounded-lg ${
                    multiTimeframeData.analysis.consensus === 'strong-buy' ? 'bg-green-100 dark:bg-green-900/20' :
                    multiTimeframeData.analysis.consensus === 'strong-sell' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <div className="font-semibold text-lg mb-2">
                      Consensus: {multiTimeframeData.analysis.consensus.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Alignment: {multiTimeframeData.analysis.alignment.toFixed(1)}% | 
                      Confidence: {multiTimeframeData.analysis.consensusConfidence.toFixed(1)}%
                    </div>
                    <div className="text-sm mt-2">{multiTimeframeData.analysis.recommendation}</div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {multiTimeframeData.timeframes?.map((tf: any) => (
                  <div key={tf.timeframe} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                    <div className="text-xs text-gray-600 dark:text-gray-400">{tf.timeframe}</div>
                    <div className={`font-semibold ${
                      tf.signal.includes('buy') ? 'text-green-600' :
                      tf.signal.includes('sell') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {tf.signal.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500">{tf.confidence.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDER FLOW INDICATORS */}
          {orderFlow && orderFlow.indicators && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Order Flow Indicators
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Delta</div>
                  <div className={`font-semibold ${
                    orderFlow.indicators.delta.deltaPercent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {orderFlow.indicators.delta.deltaPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">{orderFlow.indicators.delta.signal}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Taker Ratio</div>
                  <div className={`font-semibold ${
                    orderFlow.indicators.takerRatio.ratio > 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {orderFlow.indicators.takerRatio.ratio.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Order Book Imbalance</div>
                  <div className={`font-semibold ${
                    orderFlow.indicators.orderBookImbalance.imbalancePercent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {orderFlow.indicators.orderBookImbalance.imbalancePercent.toFixed(2)}%
                  </div>
                </div>
                {orderFlow.combinedSignal && (
                  <div className="col-span-2 md:col-span-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-semibold">{orderFlow.combinedSignal.signal}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Confidence: {orderFlow.combinedSignal.confidence}%
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {orderFlow.combinedSignal.reasons.slice(0, 2).join(' | ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REAL-TIME TRADES (WebSocket) */}
          {latestTrade && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Real-Time Trades (WebSocket)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest Trade</span>
                  <span className={`font-semibold ${
                    !latestTrade.m ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${parseFloat(latestTrade.p).toFixed(2)} ({parseFloat(latestTrade.q).toFixed(4)})
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {realTimeTrades.length} trades in buffer
                </div>
              </div>
            </div>
          )}

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
                {orderFlow && orderFlow.indicators?.orderBookImbalance && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="text-xs text-gray-500 mb-1">Order Flow</div>
                    <div className={`text-xl font-bold ${
                      orderFlow.indicators.orderBookImbalance.imbalancePercent > 20 ? 'text-green-600' :
                      orderFlow.indicators.orderBookImbalance.imbalancePercent < -20 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {orderFlow.indicators.orderBookImbalance.imbalancePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderFlow.combinedSignal?.signal || 'NEUTRAL'}
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

          {/* MARKET SCANNER - Trova Opportunità */}
          <div className="mb-6">
            <MarketScanner />
          </div>

          {/* MARKET DEPTH ANALYSIS - Volume, Whales, Exchange Flows */}
          <div className="mb-6">
            <MarketDepthAnalysis symbol={selectedCrypto} />
          </div>

          {/* ADVANCED CHARTS */}
          <div className="mb-6">
            <AdvancedCharts symbol={selectedCrypto} />
          </div>

          {/* BACKTESTING PANEL */}
          <div className="mb-6">
            <BacktestingPanel />
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


