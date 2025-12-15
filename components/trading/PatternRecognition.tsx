/**
 * Pattern Recognition Component
 * 
 * Visualizza pattern riconosciuti nel grafico
 */

'use client';

import { useState, useEffect } from 'react';
import { detectAllPatterns, type Pattern } from '@/lib/analysis/pattern-recognition';
import { calculateRSI, calculateMACD } from '@/lib/indicators/technical-indicators';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PatternRecognitionProps {
  symbol: string;
  supportResistance?: Array<{
    type: 'support' | 'resistance';
    price: number;
    strength: string;
  }>;
  onPatternDetected?: (pattern: Pattern) => void;
}

export function PatternRecognition({ symbol, supportResistance = [], onPatternDetected }: PatternRecognitionProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchPatterns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch price data
        const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1h&limit=100`
        );

        if (!response.ok) {
          throw new Error('Errore nel fetch dati');
        }

        const data = await response.json();
        const priceData = data.map((kline: any[]) => ({
          timestamp: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
        }));

        // Calculate indicators - need array of RSI values for pattern detection
        const rsiValues: number[] = [];
        for (let i = 14; i < priceData.length; i++) {
          const rsi = calculateRSI(priceData.slice(0, i + 1));
          rsiValues.push(rsi.rsi);
        }
        // Pad with last value for initial 14 periods
        if (rsiValues.length > 0) {
          const lastRSI = rsiValues[rsiValues.length - 1];
          rsiValues.unshift(...Array(14).fill(lastRSI));
        }

        // Extract support/resistance levels
        const supportLevels = supportResistance
          .filter(sr => sr.type === 'support')
          .map(sr => sr.price);
        
        const resistanceLevels = supportResistance
          .filter(sr => sr.type === 'resistance')
          .map(sr => sr.price);

        // Detect patterns
        const detectedPatterns = detectAllPatterns(
          priceData,
          rsiValues,
          supportLevels,
          resistanceLevels
        );

        setPatterns(detectedPatterns);

        // Trigger callbacks
        detectedPatterns.forEach(pattern => {
          onPatternDetected?.(pattern);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
    const interval = setInterval(fetchPatterns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [symbol, onPatternDetected]);

  const getPatternIcon = (signal: string) => {
    if (signal === 'bullish') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (signal === 'bearish') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  };

  const getPatternColor = (signal: string) => {
    if (signal === 'bullish') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (signal === 'bearish') return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
  };

  if (loading && patterns.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Pattern Recognition
        </h3>
        <p className="text-xs text-gray-500 mt-1">{symbol}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      <div className="p-4">
        {patterns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessun pattern rilevato</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patterns.map((pattern, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-l-4 ${getPatternColor(pattern.signal)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPatternIcon(pattern.signal)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pattern.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {pattern.type} • {pattern.signal.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {pattern.confidence}%
                    </div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {pattern.description}
                </p>

                {/* Entry/Exit Levels */}
                {(pattern.entry || pattern.target || pattern.stopLoss) && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {pattern.entry && (
                      <div>
                        <div className="text-xs text-gray-500">Entry</div>
                        <div className="text-sm font-semibold">${pattern.entry.toFixed(2)}</div>
                      </div>
                    )}
                    {pattern.target && (
                      <div>
                        <div className="text-xs text-gray-500">Target</div>
                        <div className="text-sm font-semibold text-green-600">
                          ${pattern.target.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {pattern.stopLoss && (
                      <div>
                        <div className="text-xs text-gray-500">Stop Loss</div>
                        <div className="text-sm font-semibold text-red-600">
                          ${pattern.stopLoss.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

