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
          <Target className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {locale === 'it' ? 'Strategy Simulator' : 'Strategy Simulator'}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {locale === 'it'
              ? 'Simula ed esplora strategie di trading usando dati simulati per scopi educativi. Questo strumento ti aiuta a capire come funzionano le strategie accademiche.'
              : 'Simulate and explore trading strategies using simulated data for educational purposes. This tool helps you understand how academic strategies work.'}
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
                <p className="text-xs text-text-secondary leading-relaxed">
                  {locale === 'it'
                    ? 'Questo strumento usa dati SIMULATI per scopi educativi. I risultati NON riflettono performance reali di mercato.'
                    : 'This tool uses SIMULATED data for educational purposes. Results do NOT reflect real market performance.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
