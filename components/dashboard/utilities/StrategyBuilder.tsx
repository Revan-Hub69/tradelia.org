'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Info, BookOpen, Calculator, Target, Shield, Save, Download, Settings, Filter, X, CheckCircle2, Circle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Tooltip } from '@/components/ui/Tooltip';
import { MethodologyNotes } from './MethodologyNotes';
import { StrategyBuilderContent } from './StrategyBuilderContent';
import { 
  ACADEMIC_STRATEGIES, 
  getStrategyById, 
  getStrategiesByCategory,
  type StrategyType,
  type Timeframe,
  type AcademicStrategy 
} from '@/lib/strategies/academic-strategies';

/**
 * Strategy Builder - Costruzione e Ottimizzazione Strategie Trading
 * 
 * ⚠️ IMPORTANTE: Questo è uno strumento SEPARATO dal Trading Journal
 * 
 * - Strategy Builder: Testa strategie TEORICHE su dati simulati/storici
 * - Trading Journal: Registra operazioni REALI che hai eseguito
 * 
 * Workflow consigliato:
 * 1. Usa Strategy Builder per testare strategie prima di tradare
 * 2. Esegui operazioni reali basate sulla strategia ottimizzata
 * 3. Registra operazioni reali nel Trading Journal
 * 4. Confronta performance teorica (Strategy Builder) vs reale (Journal)
 * 
 * Best Practice: Walk-Forward Optimization per evitare overfitting
 * 
 * References:
 * - Prado, M. L. (2018): "Advances in Financial Machine Learning"
 * - Chan, E. P. (2013): "Algorithmic Trading: Winning Strategies and Their Rationale"
 * - Aronson, D. (2006): "Evidence-Based Technical Analysis"
 */

interface OptimizationResult {
  strategyId: StrategyType;
  parameters: Record<string, number>; // Parametri specifici della strategia
  inSampleReturn: number;
  outOfSampleReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
  isRobust: boolean;
  robustnessScore: number; // 0-100, quanto è robusto
}

interface WalkForwardWindow {
  inSampleStart: Date;
  inSampleEnd: Date;
  outOfSampleStart: Date;
  outOfSampleEnd: Date;
  bestStrategy: StrategyType;
  bestParameters: Record<string, number>;
  results: OptimizationResult[];
}

export function StrategyBuilder() {
  const { t, locale } = useTranslations();
  
  // Strategy selection
  const [selectedStrategies, setSelectedStrategies] = useState<Set<StrategyType>>(new Set(['moving-average-crossover']));
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1d');
  const [strategyParams, setStrategyParams] = useState<Record<StrategyType, Record<string, number>>>({});
  
  // User inputs - full autonomy
  const [keyValueMin, setKeyValueMin] = useState(1.0);
  const [keyValueMax, setKeyValueMax] = useState(5.0);
  const [keyValueStep, setKeyValueStep] = useState(0.5);
  const [atrPeriodMin, setAtrPeriodMin] = useState(7);
  const [atrPeriodMax, setAtrPeriodMax] = useState(30);
  const [atrPeriodStep, setAtrPeriodStep] = useState(1);
  const [inSampleMonths, setInSampleMonths] = useState(12);
  const [outOfSampleMonths, setOutOfSampleMonths] = useState(3);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState<WalkForwardWindow[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Personalization settings
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(true);
  const [minRobustnessScore, setMinRobustnessScore] = useState(60);
  const [minProfitFactor, setMinProfitFactor] = useState(1.2);
  const [minWinRate, setMinWinRate] = useState(40);
  const [maxDrawdownThreshold, setMaxDrawdownThreshold] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<Array<{
    id: string;
    name: string;
    config: any;
    timestamp: Date;
  }>>([]);
  const [showSaveConfig, setShowSaveConfig] = useState(false);
  const [configName, setConfigName] = useState('');

  // Memoized calculations - count parameter combinations for selected strategies
  const totalCombinations = useMemo(() => {
    let total = 0;
    selectedStrategies.forEach(strategyId => {
      const strategy = getStrategyById(strategyId);
      if (!strategy) return;
      
      let strategyCombinations = 1;
      strategy.parameters.forEach(param => {
        const range = param.max - param.min;
        const count = Math.floor(range / param.step) + 1;
        strategyCombinations *= count;
      });
      total += strategyCombinations;
    });
    return total || 1; // Fallback to 1 if no strategies selected
  }, [selectedStrategies]);

  // Validate inputs - memoized
  const validateInputs = useCallback((): boolean => {
    const errors: string[] = [];
    
    if (selectedStrategies.size === 0) {
      errors.push(locale === 'it'
        ? 'Seleziona almeno una strategia'
        : 'Select at least one strategy');
    }
    
    if (keyValueMin >= keyValueMax) {
      errors.push(locale === 'it' 
        ? 'Key Value Min deve essere minore di Max'
        : 'Key Value Min must be less than Max');
    }
    if (keyValueStep <= 0 || keyValueStep > (keyValueMax - keyValueMin)) {
      errors.push(locale === 'it'
        ? 'Key Value Step deve essere positivo e minore della differenza Max-Min'
        : 'Key Value Step must be positive and less than Max-Min difference');
    }
    if (atrPeriodMin >= atrPeriodMax) {
      errors.push(locale === 'it'
        ? 'ATR Period Min deve essere minore di Max'
        : 'ATR Period Min must be less than Max');
    }
    if (atrPeriodStep <= 0 || atrPeriodStep > (atrPeriodMax - atrPeriodMin)) {
      errors.push(locale === 'it'
        ? 'ATR Period Step deve essere positivo e minore della differenza Max-Min'
        : 'ATR Period Step must be positive and less than Max-Min difference');
    }
    if (inSampleMonths < 3 || inSampleMonths > 60) {
      errors.push(locale === 'it'
        ? 'Periodo In-Sample deve essere tra 3 e 60 mesi'
        : 'In-Sample Period must be between 3 and 60 months');
    }
    if (outOfSampleMonths < 1 || outOfSampleMonths > 12) {
      errors.push(locale === 'it'
        ? 'Periodo Out-of-Sample deve essere tra 1 e 12 mesi'
        : 'Out-of-Sample Period must be between 1 and 12 months');
    }
    if (new Date(startDate) >= new Date(endDate)) {
      errors.push(locale === 'it'
        ? 'Data inizio deve essere precedente alla data fine'
        : 'Start date must be before end date');
    }
    if (new Date(endDate) > new Date()) {
      errors.push(locale === 'it'
        ? 'Data fine non può essere futura'
        : 'End date cannot be in the future');
    }
    
    // Check if optimization would be too large
    if (totalCombinations > 1000) {
      errors.push(locale === 'it'
        ? `Troppi parametri da testare (${totalCombinations}). Riduci i range o aumenta lo step.`
        : `Too many parameters to test (${totalCombinations}). Reduce ranges or increase step.`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [keyValueMin, keyValueMax, keyValueStep, atrPeriodMin, atrPeriodMax, atrPeriodStep, inSampleMonths, outOfSampleMonths, startDate, endDate, totalCombinations, locale]);

  // Simulate Walk-Forward Optimization - memoized with useCallback
  const runWalkForwardOptimization = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsOptimizing(true);
    setResults([]);
    
    try {
      // Simulate optimization delay
      await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate walk-forward windows
    const windows: WalkForwardWindow[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);

    while (currentDate < end) {
      const inSampleStart = new Date(currentDate);
      const inSampleEnd = new Date(currentDate);
      inSampleEnd.setMonth(inSampleEnd.getMonth() + inSampleMonths);
      
      const outOfSampleStart = new Date(inSampleEnd);
      outOfSampleStart.setDate(outOfSampleStart.getDate() + 1);
      const outOfSampleEnd = new Date(outOfSampleStart);
      outOfSampleEnd.setMonth(outOfSampleEnd.getMonth() + outOfSampleMonths);

      if (outOfSampleEnd > end) break;

      // Simulate optimization results for each selected strategy
      const optimizationResults: OptimizationResult[] = [];
      
      // Iterate over selected strategies
      for (const strategyId of selectedStrategies) {
        const strategy = getStrategyById(strategyId);
        if (!strategy) continue;
        
        const params = strategyParams[strategyId] || {};
        
        // Generate parameter combinations for this strategy
        // For each parameter, create a range based on min/max/step
        const paramRanges: Record<string, number[]> = {};
        strategy.parameters.forEach(param => {
          const values: number[] = [];
          const currentValue = params[param.id] ?? param.default;
          // Test around the current value: ±20% range
          const range = param.max - param.min;
          const testMin = Math.max(param.min, currentValue - range * 0.2);
          const testMax = Math.min(param.max, currentValue + range * 0.2);
          
          for (let val = testMin; val <= testMax; val += param.step) {
            values.push(Math.round(val / param.step) * param.step); // Round to step
          }
          // Always include the current/default value
          if (!values.includes(currentValue)) {
            values.push(currentValue);
          }
          paramRanges[param.id] = values.sort((a, b) => a - b);
        });
        
        // Generate all parameter combinations
        const generateCombinations = (paramIds: string[], current: Record<string, number>): Record<string, number>[] => {
          if (paramIds.length === 0) return [current];
          
          const [first, ...rest] = paramIds;
          const combinations: Record<string, number>[] = [];
          
          for (const value of paramRanges[first] || []) {
            combinations.push(...generateCombinations(rest, { ...current, [first]: value }));
          }
          
          return combinations;
        };
        
        const paramCombinations = generateCombinations(
          strategy.parameters.map(p => p.id),
          {}
        );
        
        // Simulate performance for each parameter combination
        for (const paramCombo of paramCombinations) {
          // Strategy-specific simulation based on strategy type and parameters
          let baseReturn = 10;
          let baseVolatility = 8;
          let baseTrades = 40;
          let baseWinRate = 0.45;
          
          // Adjust based on strategy type
          switch (strategyId) {
            case 'moving-average-crossover':
              const fastMA = paramCombo.fastMA || 10;
              const slowMA = paramCombo.slowMA || 50;
              const maRatio = slowMA / fastMA;
              baseReturn = 8 + maRatio * 0.5;
              baseVolatility = 6 + (slowMA - fastMA) * 0.1;
              baseTrades = Math.floor(60 - (slowMA - fastMA) * 0.5);
              baseWinRate = 0.40 + (maRatio > 3 ? 0.1 : 0);
              break;
              
            case 'rsi-mean-reversion':
              const rsiPeriod = paramCombo.rsiPeriod || 14;
              const oversold = paramCombo.oversold || 30;
              const overbought = paramCombo.overbought || 70;
              baseReturn = 12 - (rsiPeriod - 14) * 0.2;
              baseVolatility = 10 + (100 - overbought - oversold) * 0.1;
              baseTrades = Math.floor(80 - (overbought - oversold) * 0.5);
              baseWinRate = 0.50 + (oversold < 25 ? 0.05 : 0);
              break;
              
            case 'macd-trend':
              const fastEMA = paramCombo.fastEMA || 12;
              const slowEMA = paramCombo.slowEMA || 26;
              const signalPeriod = paramCombo.signalPeriod || 9;
              baseReturn = 10 + (slowEMA - fastEMA) * 0.1;
              baseVolatility = 7 + (signalPeriod - 9) * 0.2;
              baseTrades = Math.floor(50 - (slowEMA - fastEMA) * 0.3);
              baseWinRate = 0.45 + (signalPeriod < 8 ? 0.05 : 0);
              break;
              
            case 'bollinger-bands':
              const bbPeriod = paramCombo.bbPeriod || 20;
              const bbStdDev = paramCombo.bbStdDev || 2.0;
              baseReturn = 11 - (bbPeriod - 20) * 0.1;
              baseVolatility = 9 + (bbStdDev - 2.0) * 1.5;
              baseTrades = Math.floor(70 - (bbStdDev - 2.0) * 10);
              baseWinRate = 0.48 + (bbStdDev > 2.2 ? 0.05 : 0);
              break;
              
            case 'momentum':
              const momPeriod = paramCombo.momentumPeriod || 12;
              const momThreshold = paramCombo.momentumThreshold || 2.0;
              baseReturn = 13 + (momPeriod - 12) * 0.15;
              baseVolatility = 9 + (momThreshold - 2.0) * 0.5;
              baseTrades = Math.floor(45 - (momThreshold - 2.0) * 5);
              baseWinRate = 0.42 + (momPeriod > 15 ? 0.08 : 0);
              break;
              
            case 'mean-reversion':
              const meanPeriod = paramCombo.meanPeriod || 20;
              const devMult = paramCombo.deviationMultiplier || 2.0;
              baseReturn = 9 - (meanPeriod - 20) * 0.05;
              baseVolatility = 8 + (devMult - 2.0) * 0.8;
              baseTrades = Math.floor(90 - (devMult - 2.0) * 15);
              baseWinRate = 0.52 + (devMult > 2.2 ? 0.05 : 0);
              break;
              
            case 'atr-trailing-stop':
              const atrPeriod = paramCombo.atrPeriod || 14;
              const atrMult = paramCombo.atrMultiplier || 2.0;
              baseReturn = 10 + (atrPeriod - 14) * 0.1;
              baseVolatility = 6 + (atrMult - 2.0) * 0.5;
              baseTrades = Math.floor(55 - (atrMult - 2.0) * 8);
              baseWinRate = 0.46 + (atrMult > 2.5 ? 0.06 : 0);
              break;
          }
          
          // Adjust for timeframe
          const timeframeMultiplier = {
            '1m': 0.3, '5m': 0.5, '15m': 0.7, '30m': 0.8,
            '1h': 1.0, '4h': 1.2, '1d': 1.5, '1w': 2.0, '1M': 2.5
          }[selectedTimeframe] || 1.0;
          
          baseReturn *= timeframeMultiplier;
          baseTrades = Math.floor(baseTrades * (timeframeMultiplier < 1 ? 1.5 : 1 / timeframeMultiplier));
          
          // In-Sample performance (optimistic, as it's optimized on this data)
          const inSampleReturn = baseReturn + Math.random() * 6 - 2;
          const inSampleVolatility = baseVolatility * (0.8 + Math.random() * 0.4);
          const inSampleMaxDD = inSampleVolatility * (1.2 + Math.random() * 0.6);
          
          // Out-of-Sample performance (more realistic, typically 60-80% of IS)
          const oosMultiplier = 0.65 + Math.random() * 0.15; // 65-80% of IS
          const outOfSampleReturn = inSampleReturn * oosMultiplier;
          const outOfSampleVolatility = inSampleVolatility * (1.1 + Math.random() * 0.2);
          const outOfSampleMaxDD = inSampleMaxDD * (1.1 + Math.random() * 0.3);
          
          // Trading statistics
          const totalTrades = Math.max(10, Math.floor(baseTrades * (0.8 + Math.random() * 0.4)));
          const winRate = Math.max(0.3, Math.min(0.7, baseWinRate + (Math.random() * 0.1 - 0.05)));
          const averageWin = inSampleReturn / (totalTrades * winRate) * 1.5;
          const averageLoss = Math.abs(inSampleReturn / (totalTrades * (1 - winRate))) * 0.8;
          const largestWin = averageWin * (2.5 + Math.random() * 1.5);
          const largestLoss = Math.abs(averageLoss * (1.5 + Math.random() * 1));
          
          // Profit Factor = (Win Rate * Avg Win) / (Loss Rate * Avg Loss)
          const profitFactor = (winRate * averageWin) / ((1 - winRate) * Math.abs(averageLoss));
          
          // Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
          const expectancy = (winRate * averageWin) - ((1 - winRate) * Math.abs(averageLoss));
          
          // Sharpe Ratio (annualized)
          const riskFreeRate = 0.02; // 2% annual
          const sharpeRatio = ((inSampleReturn / 100) - riskFreeRate) / (inSampleVolatility / 100);
          
          // Calmar Ratio
          const calmarRatio = (inSampleReturn / 100) / (inSampleMaxDD / 100);
          
          // Robustness calculation: multi-factor score
          const oosReturnRatio = outOfSampleReturn / inSampleReturn;
          const oosSharpeRatio = ((outOfSampleReturn / 100) - riskFreeRate) / (outOfSampleVolatility / 100);
          const sharpeConsistency = oosSharpeRatio / sharpeRatio;
          
          // Robustness score: 0-100
          let robustnessScore = 0;
          if (oosReturnRatio >= 0.7) robustnessScore += 40;
          else if (oosReturnRatio >= 0.5) robustnessScore += 20;
          
          if (sharpeConsistency >= 0.7) robustnessScore += 30;
          else if (sharpeConsistency >= 0.5) robustnessScore += 15;
          
          if (profitFactor > 1.5) robustnessScore += 20;
          else if (profitFactor > 1.2) robustnessScore += 10;
          
          if (winRate >= 0.4 && winRate <= 0.6) robustnessScore += 10;
          
          const isRobust = robustnessScore >= 60;

          optimizationResults.push({
            strategyId,
            parameters: paramCombo,
            inSampleReturn,
            outOfSampleReturn,
            maxDrawdown: outOfSampleMaxDD,
            sharpeRatio,
            calmarRatio,
            winRate: winRate * 100,
            profitFactor,
            totalTrades,
            averageWin,
            averageLoss,
            largestWin,
            largestLoss,
            expectancy,
            isRobust,
            robustnessScore,
          });
        }
      }

      // Apply user filters
      const filteredResults = optimizationResults.filter(r => {
        if (r.robustnessScore < minRobustnessScore) return false;
        if (r.profitFactor < minProfitFactor) return false;
        if (r.winRate < minWinRate) return false;
        if (r.maxDrawdown > maxDrawdownThreshold) return false;
        return true;
      });
      
      // Find best parameter using multi-criteria optimization
      // Priority: Robustness > OOS Return > Sharpe Ratio > Profit Factor
      const bestResult = (filteredResults.length > 0 ? filteredResults : optimizationResults)
        .filter(r => r.isRobust)
        .sort((a, b) => {
          // Primary: Robustness score
          if (Math.abs(a.robustnessScore - b.robustnessScore) > 5) {
            return b.robustnessScore - a.robustnessScore;
          }
          // Secondary: OOS Return
          if (Math.abs(a.outOfSampleReturn - b.outOfSampleReturn) > 2) {
            return b.outOfSampleReturn - a.outOfSampleReturn;
          }
          // Tertiary: Sharpe Ratio
          if (Math.abs(a.sharpeRatio - b.sharpeRatio) > 0.2) {
            return b.sharpeRatio - a.sharpeRatio;
          }
          // Quaternary: Profit Factor
          return b.profitFactor - a.profitFactor;
        })[0] || optimizationResults.sort((a, b) => b.robustnessScore - a.robustnessScore)[0];

      windows.push({
        inSampleStart,
        inSampleEnd,
        outOfSampleStart,
        outOfSampleEnd,
        bestStrategy: bestResult.strategyId,
        bestParameters: bestResult.parameters,
        results: optimizationResults,
      });

      // Move window forward
      currentDate = new Date(outOfSampleEnd);
    }

      setResults(windows);
    } catch (error) {
      console.error('Error in Walk-Forward Optimization:', error);
      setValidationErrors([
        locale === 'it'
          ? 'Errore durante l\'ottimizzazione. Riprova più tardi.'
          : 'Error during optimization. Please try again later.'
      ]);
    } finally {
      setIsOptimizing(false);
    }
  }, [validateInputs, keyValueMin, keyValueMax, keyValueStep, atrPeriodMin, atrPeriodMax, atrPeriodStep, inSampleMonths, outOfSampleMonths, startDate, endDate, selectedStrategies, selectedTimeframe, strategyParams, locale]);

  // Memoized calculations
  const selectedWindowData = useMemo(() => 
    selectedWindow !== null ? results[selectedWindow] : null,
    [selectedWindow, results]
  );

  // Calculate overall best parameter across all windows
  const overallBestParameter = useMemo(() => {
    if (results.length === 0) return null;
    
    // Count how many times each parameter was best and was robust
    const parameterScores = new Map<number, { robustCount: number; totalScore: number; avgRobustness: number }>();
    
    results.forEach(window => {
      window.results.forEach(result => {
        if (!parameterScores.has(result.keyValue)) {
          parameterScores.set(result.keyValue, { robustCount: 0, totalScore: 0, avgRobustness: 0 });
        }
        const score = parameterScores.get(result.keyValue)!;
        if (result.isRobust) {
          score.robustCount++;
          score.totalScore += result.robustnessScore;
        }
      });
    });
    
    // Calculate average robustness for each parameter
    parameterScores.forEach((score, param) => {
      const robustResults = results.flatMap(w => w.results.filter(r => r.keyValue === param && r.isRobust));
      if (robustResults.length > 0) {
        score.avgRobustness = robustResults.reduce((sum, r) => sum + r.robustnessScore, 0) / robustResults.length;
      }
    });
    
    // Find parameter with highest robustness score and most windows where it's robust
    let bestParam = null;
    let bestScore = -1;
    
    parameterScores.forEach((score, param) => {
      const combinedScore = score.avgRobustness * 0.6 + (score.robustCount / results.length) * 40;
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestParam = param;
      }
    });
    
    return bestParam;
  }, [results]);
  
  // Get detailed stats for best parameter
  const bestParameterStats = useMemo(() => {
    if (!overallBestParameter || results.length === 0) return null;
    
    const allResults = results.flatMap(w => w.results.filter(r => r.keyValue === overallBestParameter && r.isRobust));
    if (allResults.length === 0) return null;
    
    return {
      keyValue: overallBestParameter,
      windowsUsed: allResults.length,
      avgReturn: allResults.reduce((sum, r) => sum + r.outOfSampleReturn, 0) / allResults.length,
      avgSharpe: allResults.reduce((sum, r) => sum + r.sharpeRatio, 0) / allResults.length,
      avgCalmar: allResults.reduce((sum, r) => sum + r.calmarRatio, 0) / allResults.length,
      avgWinRate: allResults.reduce((sum, r) => sum + r.winRate, 0) / allResults.length,
      avgProfitFactor: allResults.reduce((sum, r) => sum + r.profitFactor, 0) / allResults.length,
      avgRobustness: allResults.reduce((sum, r) => sum + r.robustnessScore, 0) / allResults.length,
      avgMaxDD: allResults.reduce((sum, r) => sum + r.maxDrawdown, 0) / allResults.length,
    };
  }, [overallBestParameter, results]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  const content = (
    <>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: locale === 'it' ? 'Strategy Simulator - Educational Tool' : 'Strategy Simulator - Educational Tool',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              description: locale === 'it'
                ? 'Strumento educativo per simulare strategie di trading usando dati simulati. Best practice accademiche per comprendere come funzionano le strategie. Per test reali, usa Paper Trading.'
                : 'Educational tool to simulate trading strategies using simulated data. Academic best practices to understand how strategies work. For real tests, use Paper Trading.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              featureList: [
                locale === 'it' ? 'Walk-Forward Optimization' : 'Walk-Forward Optimization',
                locale === 'it' ? 'Ottimizzazione parametri multivariata' : 'Multi-variate parameter optimization',
                locale === 'it' ? 'Metriche di performance (Sharpe, Calmar, MaxDD)' : 'Performance metrics (Sharpe, Calmar, MaxDD)',
                locale === 'it' ? 'Rilevamento overfitting' : 'Overfitting detection',
              ],
            }),
          }}
        />
        
      {/* Header */}
      <header className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {locale === 'it' ? 'Strategy Simulator' : 'Strategy Simulator'}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {locale === 'it'
                ? 'Simula ed esplora strategie di trading usando dati simulati per scopi educativi. Questo strumento ti aiuta a capire come funzionano le strategie accademiche. Per testare con prezzi reali, usa Paper Trading.'
                : 'Simulate and explore trading strategies using simulated data for educational purposes. This tool helps you understand how academic strategies work. To test with real prices, use Paper Trading.'}
            </p>
            {/* IMPORTANT: Simulated Data Warning */}
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {locale === 'it' ? '⚠️ Dati Simulati - Solo Educativo' : '⚠️ Simulated Data - Educational Only'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-3">
                    {locale === 'it'
                      ? 'Questo strumento usa dati SIMULATI per scopi educativi. I risultati NON riflettono performance reali di mercato. Per testare strategie con prezzi reali, usa Paper Trading.'
                      : 'This tool uses SIMULATED data for educational purposes. Results do NOT reflect real market performance. To test strategies with real prices, use Paper Trading.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="/dashboard/utilities?utility=paper-trading"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all"
                    >
                      <Target className="w-4 h-4" />
                      {locale === 'it' ? 'Testa in Paper Trading' : 'Test in Paper Trading'}
                    </a>
                    <div className="text-xs text-text-tertiary flex items-center">
                      {locale === 'it'
                        ? 'Backtesting reale disponibile Q2 2025'
                        : 'Real backtesting available Q2 2025'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* Disclaimer Banner - Always Visible */}
      <aside 
        className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-2 text-sm">
              {locale === 'it' ? '⚠️ AVVISO IMPORTANTE - MIFID II' : '⚠️ IMPORTANT NOTICE - MIFID II'}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed mb-2">
              {locale === 'it'
                ? 'Questo strumento è esclusivamente a scopo EDUCATIVO e DIMOSTRATIVO. I risultati sono basati su dati simulati e calcoli teorici. NON costituisce consulenza finanziaria, raccomandazione di investimento o suggerimento operativo. Le performance passate o simulate NON garantiscono risultati futuri.'
                : 'This tool is EXCLUSIVELY for EDUCATIONAL and DEMONSTRATION purposes. Results are based on simulated data and theoretical calculations. It does NOT constitute financial advice, investment recommendation, or trading suggestion. Past or simulated performance does NOT guarantee future results.'}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              {locale === 'it'
                ? 'Prima di utilizzare qualsiasi strategia di trading, valuta attentamente il tuo profilo di rischio, orizzonte temporale, obiettivi finanziari e consulta un consulente finanziario qualificato. Il trading comporta rischi significativi di perdita del capitale.'
                : 'Before using any trading strategy, carefully evaluate your risk profile, time horizon, financial goals, and consult a qualified financial advisor. Trading involves significant risks of capital loss.'}
            </p>
          </div>
        </aside>

      {/* Info Box - Chiarimento con Trading Journal */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary space-y-2">
            <p className="font-semibold text-text-primary">
              {locale === 'it' ? '📝 Differenza con Trading Journal' : '📝 Difference with Trading Journal'}
            </p>
            <p>
              {locale === 'it'
                ? 'Questo strumento testa strategie TEORICHE su dati simulati/storici. Il Trading Journal registra invece operazioni REALI che hai eseguito. Usa questo strumento PRIMA di tradare per ottimizzare la strategia, poi registra le operazioni reali nel Journal.'
                : 'This tool tests THEORETICAL strategies on simulated/historical data. The Trading Journal records REAL trades you executed. Use this tool BEFORE trading to optimize your strategy, then record real trades in the Journal.'}
            </p>
            <p className="text-xs text-text-tertiary italic">
              {locale === 'it'
                ? '💡 Best Practice: Testa la strategia qui → Esegui operazioni reali → Registra nel Trading Journal → Confronta performance teorica vs reale'
                : '💡 Best Practice: Test strategy here → Execute real trades → Record in Trading Journal → Compare theoretical vs real performance'}
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <section 
        className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6 space-y-6"
        aria-labelledby="strategy-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 
            id="strategy-heading"
            className="text-lg font-semibold text-text-primary flex items-center gap-2"
          >
            <Target className="w-5 h-5 text-accent" aria-hidden="true" />
            {locale === 'it' ? 'Selezione Strategie' : 'Strategy Selection'}
          </h3>
          <div className="text-xs text-text-tertiary">
            {locale === 'it' ? 'Seleziona una o più strategie accademiche' : 'Select one or more academic strategies'}
          </div>
        </div>
        
        {/* Strategy Categories */}
        <div className="space-y-4">
          {/* Basic Strategies */}
          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-3">
              {locale === 'it' ? 'Strategie Base' : 'Basic Strategies'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getStrategiesByCategory('basic').map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    const newSet = new Set(selectedStrategies);
                    if (newSet.has(strategy.id)) {
                      newSet.delete(strategy.id);
                    } else {
                      newSet.add(strategy.id);
                    }
                    setSelectedStrategies(newSet);
                    
                    // Initialize default parameters if not set
                    if (!strategyParams[strategy.id]) {
                      const defaults: Record<string, number> = {};
                      strategy.parameters.forEach(param => {
                        defaults[param.id] = param.default;
                      });
                      setStrategyParams({
                        ...strategyParams,
                        [strategy.id]: defaults
                      });
                    }
                  }}
                  className={cn(
                    'p-4 rounded-lg border transition-all text-left',
                    'hover:border-accent/40 hover:bg-bg-soft',
                    selectedStrategies.has(strategy.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border-subtle bg-bg-surface'
                  )}
                  aria-pressed={selectedStrategies.has(strategy.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedStrategies.has(strategy.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-text-primary">
                          {locale === 'it' ? strategy.name : strategy.nameEn}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {locale === 'it' ? strategy.description : strategy.descriptionEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-tertiary mt-2">
                    <BookOpen className="w-3 h-3" />
                    <span className="line-clamp-1">{strategy.academicSource.split('(')[0].trim()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Advanced Strategies */}
          <div>
            <h4 className="text-sm font-semibold text-text-secondary mb-3">
              {locale === 'it' ? 'Strategie Avanzate' : 'Advanced Strategies'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getStrategiesByCategory('advanced').map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    const newSet = new Set(selectedStrategies);
                    if (newSet.has(strategy.id)) {
                      newSet.delete(strategy.id);
                    } else {
                      newSet.add(strategy.id);
                    }
                    setSelectedStrategies(newSet);
                    
                    // Initialize default parameters if not set
                    if (!strategyParams[strategy.id]) {
                      const defaults: Record<string, number> = {};
                      strategy.parameters.forEach(param => {
                        defaults[param.id] = param.default;
                      });
                      setStrategyParams({
                        ...strategyParams,
                        [strategy.id]: defaults
                      });
                    }
                  }}
                  className={cn(
                    'p-4 rounded-lg border transition-all text-left',
                    'hover:border-accent/40 hover:bg-bg-soft',
                    selectedStrategies.has(strategy.id)
                      ? 'border-accent bg-accent/10'
                      : 'border-border-subtle bg-bg-surface'
                  )}
                  aria-pressed={selectedStrategies.has(strategy.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedStrategies.has(strategy.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm text-text-primary">
                          {locale === 'it' ? strategy.name : strategy.nameEn}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {locale === 'it' ? strategy.description : strategy.descriptionEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-tertiary mt-2">
                    <BookOpen className="w-3 h-3" />
                    <span className="line-clamp-1">{strategy.academicSource.split('(')[0].trim()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Timeframe Selection */}
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-text-primary mb-2">
            {locale === 'it' ? 'Timeframe' : 'Timeframe'}
          </label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)}
            className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="1m">1 minuto</option>
            <option value="5m">5 minuti</option>
            <option value="15m">15 minuti</option>
            <option value="30m">30 minuti</option>
            <option value="1h">1 ora</option>
            <option value="4h">4 ore</option>
            <option value="1d">1 giorno</option>
            <option value="1w">1 settimana</option>
            <option value="1M">1 mese</option>
          </select>
        </div>
      </section>
      
      {/* Strategy Parameters */}
      {Array.from(selectedStrategies).map((strategyId) => {
        const strategy = getStrategyById(strategyId);
        if (!strategy) return null;
        
        const params = strategyParams[strategy.id] || {};
        
        return (
          <section
            key={strategy.id}
            className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6 space-y-4"
            aria-labelledby={`params-${strategy.id}`}
          >
            <h3 
              id={`params-${strategy.id}`}
              className="text-lg font-semibold text-text-primary flex items-center gap-2"
            >
              <Settings className="w-5 h-5 text-accent" aria-hidden="true" />
              {locale === 'it' ? strategy.name : strategy.nameEn} - {locale === 'it' ? 'Parametri' : 'Parameters'}
            </h3>
            
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text-primary">{locale === 'it' ? 'Nota Accademica:' : 'Academic Note:'}</strong>{' '}
                  {locale === 'it' ? strategy.academicNotes : strategy.academicNotesEn}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {strategy.parameters.map((param) => (
                <div key={param.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <label 
                      htmlFor={`${strategy.id}-${param.id}`}
                      className="text-sm font-medium text-text-primary"
                    >
                      {param.label}
                    </label>
                    <Tooltip
                      position="top"
                      content={
                        <div className="max-w-xs space-y-2 text-xs">
                          <div className="font-semibold text-white mb-1">{param.label}</div>
                          <div className="text-text-secondary">{param.academicTooltip.description}</div>
                          {param.academicTooltip.recommendation && (
                            <div className="pt-2 border-t border-white/20">
                              <div className="font-semibold text-accent mb-1">
                                {locale === 'it' ? 'Raccomandazione:' : 'Recommendation:'}
                              </div>
                              <div className="text-text-secondary">{param.academicTooltip.recommendation}</div>
                            </div>
                          )}
                          {param.academicTooltip.academicContext && (
                            <div className="pt-2 border-t border-white/20">
                              <div className="font-semibold text-accent mb-1">
                                {locale === 'it' ? 'Contesto Accademico:' : 'Academic Context:'}
                              </div>
                              <div className="text-text-secondary">{param.academicTooltip.academicContext}</div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-white/20">
                            <div className="font-semibold text-accent mb-1">
                              {locale === 'it' ? 'Fonte:' : 'Source:'}
                            </div>
                            <div className="text-text-secondary text-[10px] leading-relaxed">
                              {param.academicTooltip.source}
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <Info className="w-4 h-4 text-accent cursor-help" />
                    </Tooltip>
                  </div>
                  <input
                    id={`${strategy.id}-${param.id}`}
                    type={param.type === 'integer' ? 'number' : 'number'}
                    value={params[param.id] ?? param.default}
                    onChange={(e) => {
                      const value = param.type === 'integer' 
                        ? parseInt(e.target.value) || param.default
                        : parseFloat(e.target.value) || param.default;
                      setStrategyParams({
                        ...strategyParams,
                        [strategy.id]: {
                          ...params,
                          [param.id]: Math.max(param.min, Math.min(param.max, value))
                        }
                      });
                    }}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <div className="text-xs text-text-tertiary mt-1">
                    Range: {param.min} - {param.max} (Step: {param.step})
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      
      {/* Configuration */}
      <section 
        className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6 space-y-6"
        aria-labelledby="config-heading"
        itemScope
        itemType="https://schema.org/HowTo"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 
            id="config-heading"
            className="text-lg font-semibold text-text-primary flex items-center gap-2"
          >
            <Calculator className="w-5 h-5 text-accent" aria-hidden="true" />
            {locale === 'it' ? 'Configurazione Walk-Forward' : 'Walk-Forward Configuration'}
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'border border-border-subtle',
                showAdvancedMetrics
                  ? 'bg-accent/20 text-accent border-accent/40'
                  : 'bg-bg-soft text-text-tertiary hover:text-text-primary'
              )}
              aria-label={locale === 'it' ? 'Mostra metriche avanzate' : 'Show advanced metrics'}
              aria-pressed={showAdvancedMetrics}
            >
              <Settings className="w-3 h-3 inline-block mr-1" />
              {locale === 'it' ? 'Metriche' : 'Metrics'}
            </button>
            <div className="text-xs text-text-tertiary">
              {locale === 'it' ? 'Configurazione ottimizzazione' : 'Optimization configuration'}
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-400 text-sm mb-2">
                  {locale === 'it' ? 'Errori di Validazione' : 'Validation Errors'}
                </h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-xs text-text-secondary">• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Date Range */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <legend className="sr-only">
            {locale === 'it' ? 'Periodo storico da analizzare' : 'Historical period to analyze'}
          </legend>
          <div>
            <label 
              htmlFor="start-date"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              {locale === 'it' ? 'Data Inizio' : 'Start Date'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Data Inizio Periodo' : 'Period Start Date'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Data di inizio del periodo storico da analizzare. Deve essere precedente alla data fine.'
                        : 'Start date of the historical period to analyze. Must be before end date.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" aria-label={locale === 'it' ? 'Informazioni' : 'Information'} />
              </Tooltip>
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              aria-describedby="start-date-desc"
              aria-required="true"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <p id="start-date-desc" className="sr-only">
              {locale === 'it' ? 'Data di inizio del periodo storico' : 'Start date of historical period'}
            </p>
          </div>
          <div>
            <label 
              htmlFor="end-date"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              {locale === 'it' ? 'Data Fine' : 'End Date'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Data Fine Periodo' : 'Period End Date'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Data di fine del periodo storico. Non può essere futura.'
                        : 'End date of the historical period. Cannot be in the future.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" aria-label={locale === 'it' ? 'Informazioni' : 'Information'} />
              </Tooltip>
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              aria-describedby="end-date-desc"
              aria-required="true"
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <p id="end-date-desc" className="sr-only">
              {locale === 'it' ? 'Data di fine del periodo storico' : 'End date of historical period'}
            </p>
          </div>
        </fieldset>

        {/* Key Value Range */}
        <fieldset className="p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <legend className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            {locale === 'it' ? 'Key Value (Moltiplicatore)' : 'Key Value (Multiplier)'}
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-semibold text-xs">
                    {locale === 'it' ? 'Key Value' : 'Key Value'}
                  </p>
                  <p className="text-xs">
                    {locale === 'it'
                      ? 'Il moltiplicatore utilizzato per calcolare i livelli di entrata/uscita. Valori più alti = segnali meno frequenti ma più selettivi. Definisci il range Min-Max e lo step per l\'ottimizzazione.'
                      : 'The multiplier used to calculate entry/exit levels. Higher values = less frequent but more selective signals. Define Min-Max range and step for optimization.'}
                  </p>
                </div>
              }
              position="top"
            >
              <Info className="w-4 h-4 text-text-tertiary cursor-help" aria-label={locale === 'it' ? 'Informazioni Key Value' : 'Key Value information'} />
            </Tooltip>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="key-value-min" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Min' : 'Min'}
              </label>
              <input
                id="key-value-min"
                type="number"
                value={keyValueMin}
                onChange={(e) => setKeyValueMin(parseFloat(e.target.value) || 1.0)}
                min={0.1}
                max={keyValueMax}
                step={0.1}
                aria-label={locale === 'it' ? 'Valore minimo Key Value' : 'Key Value minimum'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="key-value-max" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Max' : 'Max'}
              </label>
              <input
                id="key-value-max"
                type="number"
                value={keyValueMax}
                onChange={(e) => setKeyValueMax(parseFloat(e.target.value) || 5.0)}
                min={keyValueMin}
                max={20}
                step={0.1}
                aria-label={locale === 'it' ? 'Valore massimo Key Value' : 'Key Value maximum'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="key-value-step" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Step' : 'Step'}
              </label>
              <input
                id="key-value-step"
                type="number"
                value={keyValueStep}
                onChange={(e) => setKeyValueStep(parseFloat(e.target.value) || 0.5)}
                min={0.1}
                max={keyValueMax - keyValueMin}
                step={0.1}
                aria-label={locale === 'it' ? 'Incremento Key Value' : 'Key Value step'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-text-tertiary" aria-live="polite">
            {locale === 'it'
              ? `Valori testati: ${Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1}`
              : `Values tested: ${Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1}`}
          </div>
        </fieldset>

        {/* ATR Period Range */}
        <fieldset className="p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <legend className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            {locale === 'it' ? 'ATR Period' : 'ATR Period'}
            <Tooltip
              content={
                <div className="space-y-2">
                  <p className="font-semibold text-xs">ATR Period</p>
                  <p className="text-xs">
                    {locale === 'it'
                      ? 'Il periodo per calcolare l\'Average True Range. Valori più alti = volatilità più smooth ma meno reattiva. Definisci il range Min-Max e lo step per l\'ottimizzazione.'
                      : 'The period for calculating Average True Range. Higher values = smoother but less reactive volatility. Define Min-Max range and step for optimization.'}
                  </p>
                </div>
              }
              position="top"
            >
              <Info className="w-4 h-4 text-text-tertiary cursor-help" aria-label={locale === 'it' ? 'Informazioni ATR Period' : 'ATR Period information'} />
            </Tooltip>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="atr-period-min" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Min' : 'Min'}
              </label>
              <input
                id="atr-period-min"
                type="number"
                value={atrPeriodMin}
                onChange={(e) => setAtrPeriodMin(parseInt(e.target.value) || 7)}
                min={1}
                max={atrPeriodMax}
                step={1}
                aria-label={locale === 'it' ? 'Periodo minimo ATR' : 'ATR period minimum'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="atr-period-max" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Max' : 'Max'}
              </label>
              <input
                id="atr-period-max"
                type="number"
                value={atrPeriodMax}
                onChange={(e) => setAtrPeriodMax(parseInt(e.target.value) || 30)}
                min={atrPeriodMin}
                max={200}
                step={1}
                aria-label={locale === 'it' ? 'Periodo massimo ATR' : 'ATR period maximum'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label htmlFor="atr-period-step" className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Step' : 'Step'}
              </label>
              <input
                id="atr-period-step"
                type="number"
                value={atrPeriodStep}
                onChange={(e) => setAtrPeriodStep(parseInt(e.target.value) || 1)}
                min={1}
                max={atrPeriodMax - atrPeriodMin}
                step={1}
                aria-label={locale === 'it' ? 'Incremento ATR Period' : 'ATR period step'}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-text-tertiary" aria-live="polite">
            {locale === 'it'
              ? `Valori testati: ${Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1}`
              : `Values tested: ${Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1}`}
          </div>
        </fieldset>

        {/* Walk-Forward Windows */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <legend className="sr-only">
            {locale === 'it' ? 'Configurazione finestre temporali' : 'Time windows configuration'}
          </legend>
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
                        ? 'Il periodo utilizzato per ottimizzare i parametri. Tipicamente 12-24 mesi per strategie giornaliere. Minimo 3 mesi, massimo 60 mesi.'
                        : 'The period used to optimize parameters. Typically 12-24 months for daily strategies. Minimum 3 months, maximum 60 months.'}
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
              min={3}
              max={60}
              step={1}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label 
              htmlFor="out-of-sample-months"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              {locale === 'it' ? 'Periodo Out-of-Sample (mesi)' : 'Out-of-Sample Period (months)'}
              <Tooltip
                content={
                  <div className="space-y-2">
                    <p className="font-semibold text-xs">
                      {locale === 'it' ? 'Finestra Out-of-Sample' : 'Out-of-Sample Window'}
                    </p>
                    <p className="text-xs">
                      {locale === 'it'
                        ? 'Il periodo per testare i parametri ottimizzati. Tipicamente 3-6 mesi. Se la performance OOS è molto inferiore a IS, è segno di overfitting. Minimo 1 mese, massimo 12 mesi.'
                        : 'The period to test optimized parameters. Typically 3-6 months. If OOS performance is much lower than IS, it\'s a sign of overfitting. Minimum 1 month, maximum 12 months.'}
                    </p>
                  </div>
                }
                position="top"
              >
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" aria-label={locale === 'it' ? 'Informazioni' : 'Information'} />
              </Tooltip>
            </label>
            <input
              id="out-of-sample-months"
              type="number"
              value={outOfSampleMonths}
              onChange={(e) => setOutOfSampleMonths(parseInt(e.target.value) || 3)}
              min={1}
              max={12}
              step={1}
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              aria-label={locale === 'it' ? 'Periodo Out-of-Sample in mesi' : 'Out-of-Sample period in months'}
            />
          </div>
        </fieldset>

        {/* Total Combinations Warning */}
        {totalCombinations > 100 && (
          <div 
            className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-text-secondary">
                {locale === 'it'
                  ? `Attenzione: ${totalCombinations} combinazioni di parametri da testare. Questo potrebbe richiedere molto tempo. Considera di ridurre i range o aumentare lo step.`
                  : `Warning: ${totalCombinations} parameter combinations to test. This might take a long time. Consider reducing ranges or increasing step.`}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={runWalkForwardOptimization}
          onKeyDown={(e) => handleKeyDown(e, runWalkForwardOptimization)}
          disabled={isOptimizing || validationErrors.length > 0 || selectedStrategies.size === 0}
          aria-label={locale === 'it' ? 'Esegui ottimizzazione Walk-Forward' : 'Run Walk-Forward Optimization'}
          aria-busy={isOptimizing}
          className={cn(
            'flex-1 py-3 px-6 rounded-lg font-semibold transition-all',
            'bg-gradient-to-r from-accent to-accent-hover text-white',
            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
            'flex items-center justify-center gap-2',
            'touch-manipulation' // Mobile optimization
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
              <span>
                {selectedStrategies.size === 0
                  ? (locale === 'it' ? 'Seleziona una strategia' : 'Select a strategy')
                  : (locale === 'it' ? 'Esegui Walk-Forward Optimization' : 'Run Walk-Forward Optimization')}
              </span>
            </>
          )}
        </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-3 rounded-lg font-medium transition-all',
              'border border-border-subtle bg-bg-soft text-text-primary',
              'hover:bg-bg-surface hover:border-accent/40',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              'flex items-center justify-center gap-2'
            )}
            aria-label={locale === 'it' ? 'Mostra filtri avanzati' : 'Show advanced filters'}
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{locale === 'it' ? 'Filtri' : 'Filters'}</span>
          </button>
          
          {results.length > 0 && (
            <button
              onClick={() => setShowSaveConfig(true)}
              className={cn(
                'px-4 py-3 rounded-lg font-medium transition-all',
                'border border-border-subtle bg-bg-soft text-text-primary',
                'hover:bg-bg-surface hover:border-accent/40',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                'flex items-center justify-center gap-2'
              )}
              aria-label={locale === 'it' ? 'Salva configurazione' : 'Save configuration'}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'it' ? 'Salva' : 'Save'}</span>
            </button>
          )}
        </div>
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Filter className="w-4 h-4 text-accent" />
                {locale === 'it' ? 'Filtri Avanzati' : 'Advanced Filters'}
              </h4>
              <button
                onClick={() => setShowFilters(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors"
                aria-label={locale === 'it' ? 'Chiudi filtri' : 'Close filters'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="min-robustness" className="block text-xs font-medium text-text-secondary mb-1">
                  {locale === 'it' ? 'Robustezza Min' : 'Min Robustness'}
                </label>
                <input
                  id="min-robustness"
                  type="number"
                  value={minRobustnessScore}
                  onChange={(e) => setMinRobustnessScore(parseInt(e.target.value) || 60)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div>
                <label htmlFor="min-profit-factor" className="block text-xs font-medium text-text-secondary mb-1">
                  {locale === 'it' ? 'Profit Factor Min' : 'Min Profit Factor'}
                </label>
                <input
                  id="min-profit-factor"
                  type="number"
                  value={minProfitFactor}
                  onChange={(e) => setMinProfitFactor(parseFloat(e.target.value) || 1.2)}
                  min={0.5}
                  max={5}
                  step={0.1}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div>
                <label htmlFor="min-win-rate" className="block text-xs font-medium text-text-secondary mb-1">
                  {locale === 'it' ? 'Win Rate Min (%)' : 'Min Win Rate (%)'}
                </label>
                <input
                  id="min-win-rate"
                  type="number"
                  value={minWinRate}
                  onChange={(e) => setMinWinRate(parseInt(e.target.value) || 40)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div>
                <label htmlFor="max-drawdown" className="block text-xs font-medium text-text-secondary mb-1">
                  {locale === 'it' ? 'Max Drawdown Max (%)' : 'Max Drawdown (%)'}
                </label>
                <input
                  id="max-drawdown"
                  type="number"
                  value={maxDrawdownThreshold}
                  onChange={(e) => setMaxDrawdownThreshold(parseInt(e.target.value) || 20)}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Info className="w-4 h-4" />
              <span>
                {locale === 'it'
                  ? 'I filtri vengono applicati durante l\'ottimizzazione per mostrare solo i parametri che soddisfano i criteri.'
                  : 'Filters are applied during optimization to show only parameters that meet the criteria.'}
              </span>
            </div>
          </div>
        )}
        
        {/* Save Configuration Modal */}
        {showSaveConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {locale === 'it' ? 'Salva Configurazione' : 'Save Configuration'}
                </h3>
                <button
                  onClick={() => {
                    setShowSaveConfig(false);
                    setConfigName('');
                  }}
                  className="w-8 h-8 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                  aria-label={locale === 'it' ? 'Chiudi' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label htmlFor="config-name" className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Nome Configurazione' : 'Configuration Name'}
                </label>
                <input
                  id="config-name"
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder={locale === 'it' ? 'Es: Strategia Trend Following' : 'E.g: Trend Following Strategy'}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (configName.trim()) {
                      const newConfig = {
                        id: Date.now().toString(),
                        name: configName.trim(),
                        config: {
                          selectedStrategies: Array.from(selectedStrategies),
                          selectedTimeframe,
                          strategyParams,
                          keyValueMin,
                          keyValueMax,
                          keyValueStep,
                          atrPeriodMin,
                          atrPeriodMax,
                          atrPeriodStep,
                          inSampleMonths,
                          outOfSampleMonths,
                          startDate,
                          endDate,
                          minRobustnessScore,
                          minProfitFactor,
                          minWinRate,
                          maxDrawdownThreshold,
                        },
                        timestamp: new Date(),
                      };
                      setSavedConfigs([...savedConfigs, newConfig]);
                      setShowSaveConfig(false);
                      setConfigName('');
                    }
                  }}
                  disabled={!configName.trim()}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                    'bg-accent text-white',
                    'hover:bg-accent-hover',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                  )}
                >
                  {locale === 'it' ? 'Salva' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowSaveConfig(false);
                    setConfigName('');
                  }}
                  className="px-4 py-2 rounded-lg font-medium border border-border-subtle bg-bg-soft text-text-primary hover:bg-bg-surface transition-colors"
                >
                  {locale === 'it' ? 'Annulla' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <section 
          className="space-y-6"
          aria-labelledby="results-heading"
        >
          {/* Summary */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 
              id="results-heading"
              className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-accent" aria-hidden="true" />
              {locale === 'it' ? 'Risultati Ottimizzazione' : 'Optimization Results'}
            </h3>
            
            {bestParameterStats && (
              <div 
                className="bg-accent/10 border border-accent/30 rounded-lg p-4 sm:p-6 mb-4"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span className="font-semibold text-text-primary">
                    {locale === 'it' ? 'Parametro Ottimale Consigliato' : 'Recommended Optimal Parameter'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'Strategia' : 'Strategy'}
                    </div>
                    <div className="text-lg font-bold text-accent">
                      {getStrategyById(bestParameterStats.strategyId) 
                        ? (locale === 'it' 
                            ? getStrategyById(bestParameterStats.strategyId)!.name 
                            : getStrategyById(bestParameterStats.strategyId)!.nameEn)
                        : bestParameterStats.strategyId}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'Robustezza' : 'Robustness'}
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {bestParameterStats.avgRobustness.toFixed(0)}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'Finestre Valide' : 'Valid Windows'}
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {bestParameterStats.windowsUsed}/{results.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'OOS Return Avg' : 'OOS Return Avg'}
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {bestParameterStats.avgReturn.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-accent/20">
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">Sharpe</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {bestParameterStats.avgSharpe.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">Calmar</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {bestParameterStats.avgCalmar.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'Win Rate' : 'Win Rate'}
                    </div>
                    <div className="text-sm font-semibold text-text-primary">
                      {bestParameterStats.avgWinRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">
                      {locale === 'it' ? 'Profit Factor' : 'Profit Factor'}
                    </div>
                    <div className="text-sm font-semibold text-text-primary">
                      {bestParameterStats.avgProfitFactor.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-text-secondary mt-4">
                  {locale === 'it'
                    ? `Basato su analisi multi-criterio: robustezza (${bestParameterStats.avgRobustness.toFixed(0)}/100), performance OOS media (${bestParameterStats.avgReturn.toFixed(2)}%), e consistenza attraverso ${bestParameterStats.windowsUsed} finestre temporali.`
                    : `Based on multi-criteria analysis: robustness (${bestParameterStats.avgRobustness.toFixed(0)}/100), average OOS performance (${bestParameterStats.avgReturn.toFixed(2)}%), and consistency across ${bestParameterStats.windowsUsed} time windows.`}
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
                  {results.reduce((sum, w) => sum + w.results.filter(r => 
                    r.isRobust && 
                    r.robustnessScore >= minRobustnessScore &&
                    r.profitFactor >= minProfitFactor &&
                    r.winRate >= minWinRate &&
                    r.maxDrawdown <= maxDrawdownThreshold
                  ).length, 0)}
                </div>
              </div>
              <div className="bg-bg-soft rounded-lg p-4">
                <div className="text-xs text-text-tertiary mb-1">
                  {locale === 'it' ? 'Filtrati' : 'Filtered'}
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {results.reduce((sum, w) => sum + w.results.filter(r => 
                    !r.isRobust || 
                    r.robustnessScore < minRobustnessScore ||
                    r.profitFactor < minProfitFactor ||
                    r.winRate < minWinRate ||
                    r.maxDrawdown > maxDrawdownThreshold
                  ).length, 0)}
                </div>
              </div>
            </div>
            
            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <h4 className="text-sm font-semibold text-text-primary mb-3">
                  {locale === 'it' ? 'Configurazioni Salvate' : 'Saved Configurations'}
                </h4>
                <div className="space-y-2">
                  {savedConfigs.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => {
                        if (config.config.selectedStrategies) {
                          setSelectedStrategies(new Set(config.config.selectedStrategies));
                        }
                        if (config.config.selectedTimeframe) {
                          setSelectedTimeframe(config.config.selectedTimeframe);
                        }
                        if (config.config.strategyParams) {
                          setStrategyParams(config.config.strategyParams);
                        }
                        setKeyValueMin(config.config.keyValueMin);
                        setKeyValueMax(config.config.keyValueMax);
                        setKeyValueStep(config.config.keyValueStep);
                        setAtrPeriodMin(config.config.atrPeriodMin);
                        setAtrPeriodMax(config.config.atrPeriodMax);
                        setAtrPeriodStep(config.config.atrPeriodStep);
                        setInSampleMonths(config.config.inSampleMonths);
                        setOutOfSampleMonths(config.config.outOfSampleMonths);
                        setStartDate(config.config.startDate);
                        setEndDate(config.config.endDate);
                        setMinRobustnessScore(config.config.minRobustnessScore);
                        setMinProfitFactor(config.config.minProfitFactor);
                        setMinWinRate(config.config.minWinRate);
                        setMaxDrawdownThreshold(config.config.maxDrawdownThreshold);
                      }}
                      className="w-full text-left p-3 bg-bg-soft border border-border-subtle rounded-lg hover:border-accent/40 hover:bg-bg-surface transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-text-primary text-sm">{config.name}</div>
                          <div className="text-xs text-text-tertiary mt-1">
                            {config.timestamp.toLocaleDateString(locale)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSavedConfigs(savedConfigs.filter(c => c.id !== config.id));
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={locale === 'it' ? 'Elimina configurazione' : 'Delete configuration'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Walk-Forward Windows */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {locale === 'it' ? 'Finestre Walk-Forward' : 'Walk-Forward Windows'}
            </h3>
            
            <div 
              className="space-y-3"
              role="list"
              aria-label={locale === 'it' ? 'Lista finestre temporali' : 'Time windows list'}
            >
              {results.map((window, index) => {
                const bestResult = window.results.find(r => r.parameter === window.bestParameter) || window.results[0];
                return (
                  <div
                    key={index}
                    role="listitem"
                    className="w-full"
                  >
                    <button
                      onClick={() => setSelectedWindow(selectedWindow === index ? null : index)}
                      onKeyDown={(e) => handleKeyDown(e, () => setSelectedWindow(selectedWindow === index ? null : index))}
                      aria-expanded={selectedWindow === index}
                      aria-controls={`window-details-${index}`}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
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
                          KV: {window.bestParameter.toFixed(1)}
                        </div>
                        <div className="text-xs text-text-tertiary flex items-center gap-1">
                          {bestResult.isRobust ? (
                            <>
                              <span className="text-green-400">✓ Robust</span>
                              <span className="text-text-secondary">({bestResult.robustnessScore}/100)</span>
                            </>
                          ) : (
                            <>
                              <span className="text-red-400">⚠ Overfitted</span>
                              <span className="text-text-secondary">({bestResult.robustnessScore}/100)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedWindow === index && (
                      <div 
                        id={`window-details-${index}`}
                        className="mt-4 pt-4 border-t border-border-subtle space-y-4"
                        role="region"
                        aria-label={locale === 'it' ? `Dettagli finestra ${index + 1}` : `Window ${index + 1} details`}
                      >
                        {/* Performance Metrics */}
                        <div>
                          <h5 className="text-xs font-semibold text-text-secondary mb-2 uppercase">
                            {locale === 'it' ? 'Metriche di Performance' : 'Performance Metrics'}
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                              <div className="text-xs text-text-tertiary mb-1">Sharpe Ratio</div>
                              <div className="text-sm font-semibold text-text-primary">
                                {bestResult.sharpeRatio.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">Calmar Ratio</div>
                              <div className="text-sm font-semibold text-text-primary">
                                {bestResult.calmarRatio.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Robustezza' : 'Robustness'}
                              </div>
                              <div className={cn(
                                'text-sm font-semibold',
                                bestResult.robustnessScore >= 70 ? 'text-green-400' :
                                bestResult.robustnessScore >= 50 ? 'text-amber-400' : 'text-red-400'
                              )}>
                                {bestResult.robustnessScore}/100
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Trading Statistics - Conditionally shown */}
                        {showAdvancedMetrics && (
                          <div>
                            <h5 className="text-xs font-semibold text-text-secondary mb-2 uppercase">
                              {locale === 'it' ? 'Statistiche Trading' : 'Trading Statistics'}
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Win Rate' : 'Win Rate'}
                              </div>
                              <div className="text-sm font-semibold text-text-primary">
                                {bestResult.winRate.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Profit Factor' : 'Profit Factor'}
                              </div>
                              <div className={cn(
                                'text-sm font-semibold',
                                bestResult.profitFactor > 1.5 ? 'text-green-400' :
                                bestResult.profitFactor > 1.2 ? 'text-amber-400' : 'text-red-400'
                              )}>
                                {bestResult.profitFactor.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Totale Trade' : 'Total Trades'}
                              </div>
                              <div className="text-sm font-semibold text-text-primary">
                                {bestResult.totalTrades}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Expectancy' : 'Expectancy'}
                              </div>
                              <div className={cn(
                                'text-sm font-semibold',
                                bestResult.expectancy > 0 ? 'text-green-400' : 'text-red-400'
                              )}>
                                {bestResult.expectancy.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Avg Win' : 'Avg Win'}
                              </div>
                              <div className="text-sm font-semibold text-green-400">
                                {bestResult.averageWin.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Avg Loss' : 'Avg Loss'}
                              </div>
                              <div className="text-sm font-semibold text-red-400">
                                {bestResult.averageLoss.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Largest Win' : 'Largest Win'}
                              </div>
                              <div className="text-sm font-semibold text-green-400">
                                {bestResult.largestWin.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-text-tertiary mb-1">
                                {locale === 'it' ? 'Largest Loss' : 'Largest Loss'}
                              </div>
                              <div className="text-sm font-semibold text-red-400">
                                {bestResult.largestLoss.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                        
                        {/* Parameter Info */}
                        <div className="bg-bg-soft rounded-lg p-3">
                          <div className="text-xs text-text-tertiary mb-1">
                            {locale === 'it' ? 'Parametri Ottimizzati' : 'Optimized Parameters'}
                          </div>
                          <div className="text-sm font-semibold text-text-primary mb-2">
                            {getStrategyById(bestResult.strategyId) 
                              ? (locale === 'it' 
                                  ? getStrategyById(bestResult.strategyId)!.name 
                                  : getStrategyById(bestResult.strategyId)!.nameEn)
                              : bestResult.strategyId}
                          </div>
                          <div className="text-xs text-text-secondary space-y-1">
                            {Object.entries(bestResult.parameters).map(([key, value]) => {
                              const strategy = getStrategyById(bestResult.strategyId);
                              const param = strategy?.parameters.find(p => p.id === key);
                              return (
                                <div key={key} className="flex justify-between">
                                  <span>{param?.label || key}:</span>
                                  <span className="font-medium">{typeof value === 'number' ? value.toFixed(param?.type === 'integer' ? 0 : 2) : value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Educational Content */}
      <aside 
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-6"
        aria-label={locale === 'it' ? 'Contenuto educativo' : 'Educational content'}
      >
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
        </aside>

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

      {/* Usage Guide */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-3">
              {locale === 'it' ? '📖 Come Usare Questo Strumento' : '📖 How to Use This Tool'}
            </h4>
            <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
              <li>
                {locale === 'it'
                  ? 'Definisci il periodo storico: seleziona Data Inizio e Data Fine del periodo che vuoi analizzare.'
                  : 'Define historical period: select Start Date and End Date of the period you want to analyze.'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Configura i parametri: imposta Min, Max e Step per Key Value e ATR Period. Più valori = più tempo di calcolo.'
                  : 'Configure parameters: set Min, Max and Step for Key Value and ATR Period. More values = longer calculation time.'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Imposta le finestre temporali: definisci quanto tempo usare per ottimizzare (In-Sample) e quanto per testare (Out-of-Sample).'
                  : 'Set time windows: define how much time to use for optimization (In-Sample) and how much for testing (Out-of-Sample).'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Esegui l\'ottimizzazione: clicca "Esegui Walk-Forward Optimization" e attendi i risultati.'
                  : 'Run optimization: click "Run Walk-Forward Optimization" and wait for results.'}
              </li>
              <li>
                {locale === 'it'
                  ? 'Analizza i risultati: esamina le finestre temporali. I parametri "Robusti" hanno performance OOS >= 70% di IS. Evita parametri "Overfitted".'
                  : 'Analyze results: examine time windows. "Robust" parameters have OOS performance >= 70% of IS. Avoid "Overfitted" parameters.'}
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Additional MIFID Disclaimer */}
      <aside 
        className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 sm:p-6"
        role="complementary"
        aria-label={locale === 'it' ? 'Disclaimer legale MIFID II' : 'MIFID II legal disclaimer'}
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-3 text-sm">
              {locale === 'it' ? '⚠️ DISCLAIMER LEGALE - MIFID II' : '⚠️ LEGAL DISCLAIMER - MIFID II'}
            </h4>
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p>
                <strong>{locale === 'it' ? '1. Scopo Educativo:' : '1. Educational Purpose:'}</strong>{' '}
                {locale === 'it'
                  ? 'Questo strumento è esclusivamente per scopi educativi e di ricerca. NON fornisce consulenza finanziaria, raccomandazioni di investimento o suggerimenti operativi.'
                  : 'This tool is exclusively for educational and research purposes. It does NOT provide financial advice, investment recommendations, or trading suggestions.'}
              </p>
              <p>
                <strong>{locale === 'it' ? '2. Dati Simulati:' : '2. Simulated Data:'}</strong>{' '}
                {locale === 'it'
                  ? 'I risultati sono basati su calcoli teorici e dati simulati. NON riflettono performance reali di mercato. Le condizioni di mercato reali possono differire significativamente.'
                  : 'Results are based on theoretical calculations and simulated data. They do NOT reflect real market performance. Real market conditions may differ significantly.'}
              </p>
              <p>
                <strong>{locale === 'it' ? '3. Nessuna Garanzia:' : '3. No Guarantee:'}</strong>{' '}
                {locale === 'it'
                  ? 'Le performance passate o simulate NON garantiscono risultati futuri. Il trading comporta rischi significativi di perdita del capitale, incluso il rischio di perdere l\'intero investimento.'
                  : 'Past or simulated performance does NOT guarantee future results. Trading involves significant risks of capital loss, including the risk of losing the entire investment.'}
              </p>
              <p>
                <strong>{locale === 'it' ? '4. Consulenza Professionale:' : '4. Professional Advice:'}</strong>{' '}
                {locale === 'it'
                  ? 'Prima di prendere qualsiasi decisione di investimento, consulta un consulente finanziario qualificato e indipendente. Valuta attentamente il tuo profilo di rischio, orizzonte temporale, obiettivi finanziari e situazione personale.'
                  : 'Before making any investment decision, consult a qualified and independent financial advisor. Carefully evaluate your risk profile, time horizon, financial goals, and personal situation.'}
              </p>
              <p>
                <strong>{locale === 'it' ? '5. Conformità MIFID II:' : '5. MIFID II Compliance:'}</strong>{' '}
                {locale === 'it'
                  ? 'Questo strumento è conforme alle normative MIFID II per quanto riguarda la fornitura di informazioni educative. Non costituisce consulenza in materia di investimenti ai sensi della Direttiva MIFID II.'
                  : 'This tool complies with MIFID II regulations regarding the provision of educational information. It does not constitute investment advice under MIFID II Directive.'}
              </p>
            </div>
          </div>
        </aside>
    </>
  );

  return React.createElement(
    StrategyBuilderContent,
    {
      className: 'space-y-6',
      itemScope: true,
      itemType: 'https://schema.org/SoftwareApplication'
    },
    content
  );
}

// Export memoized version for performance
export default memo(StrategyBuilder);
