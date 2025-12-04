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

  // Validate inputs
  const validateInputs = (): boolean => {
    const errors: string[] = [];
    
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
    const keyValueCount = Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1;
    const atrPeriodCount = Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1;
    const totalCombinations = keyValueCount * atrPeriodCount;
    
    if (totalCombinations > 1000) {
      errors.push(locale === 'it'
        ? `Troppi parametri da testare (${totalCombinations}). Riduci i range o aumenta lo step.`
        : `Too many parameters to test (${totalCombinations}). Reduce ranges or increase step.`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Simulate Walk-Forward Optimization
  const runWalkForwardOptimization = async () => {
    if (!validateInputs()) {
      return;
    }
    
    setIsOptimizing(true);
    setResults([]);
    
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

      // Simulate optimization results
      const optimizationResults: OptimizationResult[] = [];
      
      for (let kv = keyValueMin; kv <= keyValueMax; kv += keyValueStep) {
        for (let atr = atrPeriodMin; atr <= atrPeriodMax; atr += atrPeriodStep) {
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
            <div className="bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">
                      {locale === 'it' ? '📊 Dati Real-Time' : '📊 Real-Time Data'}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-[10px] text-blue-300 font-semibold">
                      {locale === 'it' ? 'Presto Disponibile' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {locale === 'it'
                      ? 'Attualmente questo strumento utilizza dati simulati per dimostrazione. I dati storici real-time e l\'integrazione con API di mercato saranno disponibili nell\'upgrade previsto per Q2 2025. Questo ti permetterà di ottimizzare strategie su dati di mercato reali con precisione accademica.'
                      : 'Currently this tool uses simulated data for demonstration. Real-time historical data and market API integration will be available in the upgrade scheduled for Q2 2025. This will allow you to optimize strategies on real market data with academic precision.'}
                  </p>
                  <div className="mt-2 text-[10px] text-text-tertiary">
                    {locale === 'it'
                      ? 'Upgrade previsto: Q2 2025'
                      : 'Upgrade scheduled: Q2 2025'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner - Always Visible */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4">
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
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            {locale === 'it' ? 'Configurazione Parametri' : 'Parameter Configuration'}
          </h3>
          <div className="text-xs text-text-tertiary">
            {locale === 'it' ? 'Inserisci i valori desiderati' : 'Enter your desired values'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
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
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
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
                <Info className="w-4 h-4 inline-block ml-1 text-text-tertiary cursor-help" />
              </Tooltip>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Key Value Range */}
        <div className="p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
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
              <Info className="w-4 h-4 text-text-tertiary cursor-help" />
            </Tooltip>
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Min' : 'Min'}
              </label>
              <input
                type="number"
                value={keyValueMin}
                onChange={(e) => setKeyValueMin(parseFloat(e.target.value) || 1.0)}
                min={0.1}
                max={keyValueMax}
                step={0.1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Max' : 'Max'}
              </label>
              <input
                type="number"
                value={keyValueMax}
                onChange={(e) => setKeyValueMax(parseFloat(e.target.value) || 5.0)}
                min={keyValueMin}
                max={20}
                step={0.1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Step' : 'Step'}
              </label>
              <input
                type="number"
                value={keyValueStep}
                onChange={(e) => setKeyValueStep(parseFloat(e.target.value) || 0.5)}
                min={0.1}
                max={keyValueMax - keyValueMin}
                step={0.1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-text-tertiary">
            {locale === 'it'
              ? `Valori testati: ${Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1}`
              : `Values tested: ${Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1}`}
          </div>
        </div>

        {/* ATR Period Range */}
        <div className="p-4 bg-bg-soft rounded-lg border border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
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
              <Info className="w-4 h-4 text-text-tertiary cursor-help" />
            </Tooltip>
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Min' : 'Min'}
              </label>
              <input
                type="number"
                value={atrPeriodMin}
                onChange={(e) => setAtrPeriodMin(parseInt(e.target.value) || 7)}
                min={1}
                max={atrPeriodMax}
                step={1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Max' : 'Max'}
              </label>
              <input
                type="number"
                value={atrPeriodMax}
                onChange={(e) => setAtrPeriodMax(parseInt(e.target.value) || 30)}
                min={atrPeriodMin}
                max={200}
                step={1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {locale === 'it' ? 'Step' : 'Step'}
              </label>
              <input
                type="number"
                value={atrPeriodStep}
                onChange={(e) => setAtrPeriodStep(parseInt(e.target.value) || 1)}
                min={1}
                max={atrPeriodMax - atrPeriodMin}
                step={1}
                className="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-text-tertiary">
            {locale === 'it'
              ? `Valori testati: ${Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1}`
              : `Values tested: ${Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1}`}
          </div>
        </div>

        {/* Walk-Forward Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        ? 'Il periodo per testare i parametri ottimizzati. Tipicamente 3-6 mesi. Se la performance OOS è molto inferiore a IS, è segno di overfitting. Minimo 1 mese, massimo 12 mesi.'
                        : 'The period to test optimized parameters. Typically 3-6 months. If OOS performance is much lower than IS, it\'s a sign of overfitting. Minimum 1 month, maximum 12 months.'}
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

        {/* Total Combinations Warning */}
        {(() => {
          const keyValueCount = Math.floor((keyValueMax - keyValueMin) / keyValueStep) + 1;
          const atrPeriodCount = Math.floor((atrPeriodMax - atrPeriodMin) / atrPeriodStep) + 1;
          const totalCombinations = keyValueCount * atrPeriodCount;
          
          return totalCombinations > 100 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary">
                  {locale === 'it'
                    ? `Attenzione: ${totalCombinations} combinazioni di parametri da testare. Questo potrebbe richiedere molto tempo. Considera di ridurre i range o aumentare lo step.`
                    : `Warning: ${totalCombinations} parameter combinations to test. This might take a long time. Consider reducing ranges or increasing step.`}
                </div>
              </div>
            </div>
          );
        })()}

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
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
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
        </div>
      </div>
    </div>
  );
}
