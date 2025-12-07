'use client';

import { Target, AlertCircle } from 'lucide-react';

interface StrategyBuilderHeaderProps {
  locale: string;
}

export function StrategyBuilderHeader({ locale }: StrategyBuilderHeaderProps) {
  return (
    <header className="bg-bg-soft border border-border-subtle rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-blue-400" />
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
                  <div className="text-xs text-text-secondary flex items-center">
                    {locale === 'it'
                      ? 'Backtesting reale disponibile Q2 2025'
                      : 'Real backtesting available Q2 2025'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
