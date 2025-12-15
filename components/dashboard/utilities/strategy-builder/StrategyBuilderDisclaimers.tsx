'use client';

import { Shield, Info } from 'lucide-react';

interface StrategyBuilderDisclaimersProps {
  locale: string;
}

export function StrategyBuilderDisclaimers({ locale }: StrategyBuilderDisclaimersProps) {
  return (
    <>
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
    </>
  );
}
