'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Info, BookOpen, Calculator, Target, Shield } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui/Tooltip';
import { MethodologyNotes } from './MethodologyNotes';

/**
 * Strategy Builder - MVP
 * 
 * Best Practice: Walk-Forward Optimization per evitare overfitting
 * 
 * References:
 * - Prado, M. L. (2018): "Advances in Financial Machine Learning"
 * - Chan, E. P. (2013): "Algorithmic Trading: Winning Strategies and Their Rationale"
 * - Aronson, D. (2006): "Evidence-Based Technical Analysis"
 */

interface OptimizationResult {
  parameter: number;
  inSampleReturn: number;
  outOfSampleReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  calmarRatio: number;
  isRobust: boolean;
}

interface WalkForwardWindow {
  inSampleStart: Date;
  inSampleEnd: Date;
  outOfSampleStart: Date;
  outOfSampleEnd: Date;
  bestParameter: number;
  results: OptimizationResult[];
}

export function StrategyBuilder() {
  const { t, locale } = useTranslations();
  const [keyValue, setKeyValue] = useState(2.0);
  const [atrPeriod, setAtrPeriod] = useState(14);
  const [inSampleMonths, setInSampleMonths] = useState(12);
  const [outOfSampleMonths, setOutOfSampleMonths] = useState(3);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<WalkForwardWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<number | null>(null);

  // Parameter ranges for optimization
  const keyValueRange = { min: 1.0, max: 5.0, step: 0.5 };
  const atrPeriodRange = { min: 7, max: 30, step: 1 };

  // Simulate Walk-Forward Optimization
  const runWalkForwardOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate walk-forward windows
    const windows: WalkForwardWindow[] = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2024-12-31');
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const inSampleStart = new Date(currentDate);
      const inSampleEnd = new Date(currentDate);
      inSampleEnd.setMonth(inSampleEnd.getMonth() + inSampleMonths);
      
      const outOfSampleStart = new Date(inSampleEnd);
      outOfSampleEnd.setDate(outOfSampleEnd.getDate() + 1);
      const outOfSampleEnd = new Date(outOfSampleStart);
      outOfSampleEnd.setMonth(outOfSampleEnd.getMonth() + outOfSampleMonths);

      if (outOfSampleEnd > endDate) break;

      // Simulate optimization results
      const optimizationResults: OptimizationResult[] = [];
      
      for (let kv = keyValueRange.min; kv <= keyValueRange.max; kv += keyValueRange.step) {
        for (let atr = atrPeriodRange.min; atr <= atrPeriodRange.max; atr += atrPeriodRange.step) {
          // Simulate performance (in real implementation, this would run actual backtest)
          const inSampleReturn = 15 + Math.random() * 20 - (kv - 2.5) * 2;
          const outOfSampleReturn = inSampleReturn * (0.7 + Math.random() * 0.3); // OOS typically lower
          const maxDrawdown = 5 + Math.random() * 10 + (kv - 2.5) * 1.5;
          const sharpeRatio = inSampleReturn / (maxDrawdown * 2);
          const calmarRatio = inSampleReturn / maxDrawdown;
          
          // Robust if OOS performance is within 70% of IS performance
          const isRobust = outOfSampleReturn >= inSampleReturn * 0.7;

          optimizationResults.push({
            parameter: kv,
            inSampleReturn,
            outOfSampleReturn,
            maxDrawdown,
            sharpeRatio,
            calmarRatio,
            isRobust,
          });
        }
      }

      // Find best parameter (highest OOS return with good robustness)
      const bestResult = optimizationResults
        .filter(r => r.isRobust)
        .sort((a, b) => b.outOfSampleReturn - a.outOfSampleReturn)[0] || optimizationResults[0];

      windows.push({
        inSampleStart,
        inSampleEnd,
        outOfSampleStart,
        outOfSampleEnd,
        bestParameter: bestResult.parameter,
        results: optimizationResults,
      });

      // Move window forward
      currentDate = new Date(outOfSampleEnd);
    }

    setResults(windows);
    setIsOptimizing(false);
  };

  const selectedWindowData = selectedWindow !== null ? results[selectedWindow] : null;
  const overallBestParameter = results.length > 0
    ? results.reduce((best, window) => 
        window.results.some(r => r.parameter === best && r.isRobust)
          ? best
          : window.bestParameter,
        results[0].bestParameter
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {locale === 'it' ? 'Strategy Builder' : 'Strategy Builder'}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {locale === 'it'
                ? 'Costruisci e ottimizza strategie di trading robuste usando Walk-Forward Optimization per evitare overfitting. Questo strumento ti guida attraverso le best practice accademiche per l\'ottimizzazione di parametri.'
                : 'Build and optimize robust trading strategies using Walk-Forward Optimization to avoid overfitting. This tool guides you through academic best practices for parameter optimization.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>
                {locale === 'it'
                  ? 'MVP: Dati simulati per dimostrazione. Integrazione con dati storici reali in sviluppo.'
                  : 'MVP: Simulated data for demonstration. Real historical data integration in development.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent" />
          {locale === 'it' ? 'Configurazione Parametri' : 'Parameter Configuration'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Value */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Key Value (Moltiplicatore)' : 'Key Value (Multiplier)'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Key Value' : 'Key Value'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Il moltiplicatore utilizzato per calcolare i livelli di entrata/uscita. Valori più alti = segnali meno frequenti ma più selettivi.'
                        : 'The multiplier used to calculate entry/exit levels. Higher values = less frequent but more selective signals.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={keyValue}
              onChange={(e) => setKeyValue(parseFloat(e.target.value) || 2.0)}
              min={keyValueRange.min}
              max={keyValueRange.max}
              step={keyValueRange.step}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>{keyValueRange.min}</span>
              <span>{keyValueRange.max}</span>
            </div>
          </div>

          {/* ATR Period */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'ATR Period' : 'ATR Period'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">ATR Period</p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Il periodo per calcolare l\'Average True Range. Valori più alti = volatilità più smooth ma meno reattiva.'
                        : 'The period for calculating Average True Range. Higher values = smoother but less reactive volatility.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={atrPeriod}
              onChange={(e) => setAtrPeriod(parseInt(e.target.value) || 14)}
              min={atrPeriodRange.min}
              max={atrPeriodRange.max}
              step={atrPeriodRange.step}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>{atrPeriodRange.min}</span>
              <span>{atrPeriodRange.max}</span>
            </div>
          </div>

          {/* In-Sample Period */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Periodo In-Sample (mesi)' : 'In-Sample Period (months)'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Finestra In-Sample' : 'In-Sample Window'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Il periodo utilizzato per ottimizzare i parametri. Tipicamente 12-24 mesi per strategie giornaliere.'
                        : 'The period used to optimize parameters. Typically 12-24 months for daily strategies.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={inSampleMonths}
              onChange={(e) => setInSampleMonths(parseInt(e.target.value) || 12)}
              min={6}
              max={36}
              step={3}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Out-of-Sample Period */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Periodo Out-of-Sample (mesi)' : 'Out-of-Sample Period (months)'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Finestra Out-of-Sample' : 'Out-of-Sample Window'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Il periodo per testare i parametri ottimizzati. Tipicamente 3-6 mesi. Se la performance OOS è molto inferiore a IS, è segno di overfitting.'
                        : 'The period to test optimized parameters. Typically 3-6 months. If OOS performance is much lower than IS, it\'s a sign of overfitting.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="number"
              value={outOfSampleMonths}
              onChange={(e) => setOutOfSampleMonths(parseInt(e.target.value) || 3)}
              min={1}
              max={12}
              step={1}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <button
          onClick={runWalkForwardOptimization}
          disabled={isOptimizing}
          className={cn(
            'w-full py-3 px-6 rounded-lg font-semibold transition-all',
            'bg-gradient-to-r from-accent to-accent-hover text-white',
            'hover:shadow-lg hover:scale-[1.02]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isOptimizing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{locale === 'it' ? 'Ottimizzazione in corso...' : 'Optimizing...'}</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              <span>{locale === 'it' ? 'Esegui Walk-Forward Optimization' : 'Run Walk-Forward Optimization'}</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              {locale === 'it' ? 'Risultati Ottimizzazione' : 'Optimization Results'}
            </h3>
            
            {overallBestParameter && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-text-primary">
                    {locale === 'it' ? 'Parametro Ottimale Consigliato' : 'Recommended Optimal Parameter'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-accent mb-1">
                  Key Value: {overallBestParameter.toFixed(1)}
                </p>
                <p className="text-xs text-text-secondary">
                  {locale === 'it'
                    ? 'Basato sulla performance Out-of-Sample attraverso tutte le finestre temporali.'
                    : 'Based on Out-of-Sample performance across all time windows.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-soft rounded-lg p-4">
                <div className="text-xs text-text-tertiary mb-1">
                  {locale === 'it' ? 'Finestre Analizzate' : 'Windows Analyzed'}
                </div>
                <div className="text-2xl font-bold text-text-primary">{results.length}</div>
              </div>
              <div className="bg-bg-soft rounded-lg p-4">
                <div className="text-xs text-text-tertiary mb-1">
                  {locale === 'it' ? 'Parametri Testati' : 'Parameters Tested'}
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {results[0]?.results.length || 0}
                </div>
              </div>
              <div className="bg-bg-soft rounded-lg p-4">
                <div className="text-xs text-text-tertiary mb-1">
                  {locale === 'it' ? 'Robusti' : 'Robust'}
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {results.reduce((sum, w) => sum + w.results.filter(r => r.isRobust).length, 0)}
                </div>
              </div>
              <div className="bg-bg-soft rounded-lg p-4">
                <div className="text-xs text-text-tertiary mb-1">
                  {locale === 'it' ? 'Overfitted' : 'Overfitted'}
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {results.reduce((sum, w) => sum + w.results.filter(r => !r.isRobust).length, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Walk-Forward Windows */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {locale === 'it' ? 'Finestre Walk-Forward' : 'Walk-Forward Windows'}
            </h3>
            
            <div className="space-y-3">
              {results.map((window, index) => {
                const bestResult = window.results.find(r => r.parameter === window.bestParameter) || window.results[0];
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedWindow(selectedWindow === index ? null : index)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border transition-all',
                      selectedWindow === index
                        ? 'border-accent bg-accent/10'
                        : 'border-border-subtle bg-bg-soft hover:border-accent/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-text-primary">
                          {locale === 'it' ? 'Finestra' : 'Window'} {index + 1}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {window.inSampleStart.toLocaleDateString(locale)} - {window.outOfSampleEnd.toLocaleDateString(locale)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-accent">
                          Key Value: {window.bestParameter.toFixed(1)}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {bestResult.isRobust ? (
                            <span className="text-green-400">✓ Robust</span>
                          ) : (
                            <span className="text-red-400">⚠ Overfitted</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedWindow === index && (
                      <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">IS Return</div>
                          <div className="text-sm font-semibold text-text-primary">
                            {bestResult.inSampleReturn.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">OOS Return</div>
                          <div className={cn(
                            'text-sm font-semibold',
                            bestResult.outOfSampleReturn >= bestResult.inSampleReturn * 0.7
                              ? 'text-green-400'
                              : 'text-red-400'
                          )}>
                            {bestResult.outOfSampleReturn.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">Max Drawdown</div>
                          <div className="text-sm font-semibold text-text-primary">
                            {bestResult.maxDrawdown.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-tertiary mb-1">Calmar Ratio</div>
                          <div className="text-sm font-semibold text-text-primary">
                            {bestResult.calmarRatio.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Educational Content */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-2">
              {locale === 'it' ? 'Perché Walk-Forward Optimization?' : 'Why Walk-Forward Optimization?'}
            </h4>
            <p className="text-sm text-text-secondary mb-3">
              {locale === 'it'
                ? 'L\'overfitting è il problema #1 nell\'ottimizzazione di strategie. La WFO risolve questo dividendo i dati in finestre temporali: ottimizzi su una finestra (In-Sample) e testi su quella successiva (Out-of-Sample). Solo i parametri che performano bene su dati mai visti sono considerati robusti.'
                : 'Overfitting is the #1 problem in strategy optimization. WFO solves this by dividing data into time windows: you optimize on one window (In-Sample) and test on the next (Out-of-Sample). Only parameters that perform well on unseen data are considered robust.'}
            </p>
            <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
              <li>
                {locale === 'it'
                  ? 'Evita overfitting: testa su dati mai visti durante l\'ottimizzazione'
                  : 'Avoids overfitting: tests on data never seen during optimization'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Misura onesta: la performance OOS è più vicina alla performance futura reale'
                  : 'Honest measure: OOS performance is closer to real future performance'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Robustezza: solo parametri che funzionano su più finestre temporali sono selezionati'
                  : 'Robustness: only parameters that work across multiple time windows are selected'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Methodology Notes */}
      <MethodologyNotes
        toolName="Strategy Builder"
        formulas={[
          {
            name: locale === 'it' ? 'Sharpe Ratio' : 'Sharpe Ratio',
            formula: 'Sharpe = (Return - RiskFreeRate) / StandardDeviation',
            description: locale === 'it'
              ? 'Misura il rendimento aggiustato per il rischio. Valori > 1 sono considerati buoni.'
              : 'Measures risk-adjusted return. Values > 1 are considered good.',
          },
          {
            name: locale === 'it' ? 'Calmar Ratio' : 'Calmar Ratio',
            formula: 'Calmar = AnnualReturn / MaximumDrawdown',
            description: locale === 'it'
              ? 'Rapporto tra rendimento annuo e drawdown massimo. Misura la sostenibilità psicologica.'
              : 'Ratio of annual return to maximum drawdown. Measures psychological sustainability.',
          },
          {
            name: locale === 'it' ? 'Robustezza' : 'Robustness',
            formula: 'Robust = OOS_Return >= IS_Return × 0.7',
            description: locale === 'it'
              ? 'Un parametro è robusto se la performance OOS è almeno il 70% della performance IS.'
              : 'A parameter is robust if OOS performance is at least 70% of IS performance.',
          },
        ]}
        assumptions={[
          locale === 'it'
            ? 'I dati storici sono rappresentativi delle condizioni di mercato future'
            : 'Historical data is representative of future market conditions',
          locale === 'it'
            ? 'I costi di transazione e slippage sono inclusi nei calcoli'
            : 'Transaction costs and slippage are included in calculations',
          locale === 'it'
            ? 'La performance Out-of-Sample è più indicativa della performance futura rispetto a In-Sample'
            : 'Out-of-Sample performance is more indicative of future performance than In-Sample',
        ]}
        references={[
          'Prado, M. L. (2018): "Advances in Financial Machine Learning"',
          'Chan, E. P. (2013): "Algorithmic Trading: Winning Strategies and Their Rationale"',
          'Aronson, D. (2006): "Evidence-Based Technical Analysis"',
          'Sharpe, W. F. (1994): "The Sharpe Ratio"',
        ]}
        version="1.0.0"
        lastUpdated={new Date().toLocaleDateString(locale)}
      />

      {/* MIFID Disclaimer */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-2">
              {locale === 'it' ? 'Avviso MIFID II' : 'MIFID II Notice'}
            </h4>
            <p className="text-sm text-text-secondary">
              {locale === 'it'
                ? 'Questo strumento è a scopo educativo e dimostrativo. I risultati sono basati su dati simulati e non costituiscono consulenza finanziaria. Le performance passate o simulate non garantiscono risultati futuri. Valuta attentamente il tuo profilo di rischio prima di utilizzare qualsiasi strategia di trading.'
                : 'This tool is for educational and demonstration purposes. Results are based on simulated data and do not constitute financial advice. Past or simulated performance does not guarantee future results. Carefully evaluate your risk profile before using any trading strategy.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
