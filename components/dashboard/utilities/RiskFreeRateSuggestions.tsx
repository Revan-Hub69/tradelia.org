'use client';

import { MIFIDSuggestions, Suggestion } from './MIFIDSuggestions';

/**
 * Risk-Free Rate Suggestions
 * Based on current central bank rates and government bond yields
 */

const riskFreeRateSuggestions: Suggestion[] = [
  {
    label: 'Tasso BCE (EUR)',
    value: 4.0,
    description: 'Tasso di riferimento BCE per area Euro (aggiornato 2024)',
    academicNote: 'Tasso di riferimento BCE: 4.0% (Banca Centrale Europea, 2024). Usato come proxy per risk-free rate in area Euro.',
    mifidWarning: 'Tasso ufficiale BCE, rappresenta il costo del denaro nell\'area Euro.',
    category: 'Ufficiale',
  },
  {
    label: 'BOT 1 Anno',
    value: 3.5,
    description: 'Rendimento BOT a 1 anno (titoli di stato italiani)',
    academicNote: 'Rendimento medio BOT 1 anno: 3-4% (Borsa Italiana, 2024). Considerato risk-free per investitori italiani.',
    mifidWarning: 'Rischio molto basso, garantito dallo stato italiano.',
    category: 'Governativo',
  },
  {
    label: 'BTP 10 Anni',
    value: 3.8,
    description: 'Rendimento BTP a 10 anni (titoli di stato italiani)',
    academicNote: 'Rendimento medio BTP 10 anni: 3.5-4% (Borsa Italiana, 2024). Standard per calcoli di lungo termine.',
    mifidWarning: 'Rischio molto basso, adatto per calcoli di lungo termine.',
    category: 'Governativo',
  },
  {
    label: 'Tasso Fed (USD)',
    value: 5.25,
    description: 'Tasso di riferimento Federal Reserve per USD',
    academicNote: 'Tasso di riferimento Fed: 5.25% (Federal Reserve, 2024). Usato per calcoli in dollari.',
    mifidWarning: 'Tasso ufficiale Fed, rappresenta il costo del denaro in USD.',
    category: 'Ufficiale',
  },
];

interface RiskFreeRateSuggestionsProps {
  onSelect: (value: number) => void;
  currentValue: number;
}

export function RiskFreeRateSuggestions({ onSelect, currentValue }: RiskFreeRateSuggestionsProps) {
  return (
    <MIFIDSuggestions
      title="Suggerimenti Risk-Free Rate (MIFID Compliant)"
      description="Il risk-free rate rappresenta il rendimento di un investimento senza rischio. Generalmente basato su tassi di riferimento delle banche centrali o rendimenti di titoli di stato."
      suggestions={riskFreeRateSuggestions}
      onSelect={onSelect}
      currentValue={currentValue}
      unit="%"
      type="rate"
    />
  );
}
