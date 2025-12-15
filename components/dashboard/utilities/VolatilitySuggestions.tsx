'use client';

import { MIFIDSuggestions, Suggestion } from './MIFIDSuggestions';

/**
 * Volatility Suggestions for Options Calculator
 * Based on historical implied volatility data
 */

const volatilitySuggestions: Suggestion[] = [
  {
    label: 'Bassa Volatilità',
    value: 10,
    description: 'Asset stabili (es. blue chip, indici principali)',
    academicNote: 'Volatilità storica media S&P 500: 10-15% (CBOE, 2024). Caratteristica di asset maturi e stabili.',
    mifidWarning: 'Bassa volatilità indica minore rischio ma anche minore potenziale di guadagno.',
    category: 'Stabile',
  },
  {
    label: 'Volatilità Moderata',
    value: 20,
    description: 'Asset standard (es. azioni medie, ETF diversificati)',
    academicNote: 'Volatilità storica media mercato azionario globale: 15-25% (Bloomberg, 2024). Range tipico per investimenti azionari.',
    mifidWarning: 'Volatilità moderata bilancia rischio e opportunità.',
    category: 'Standard',
  },
  {
    label: 'Alta Volatilità',
    value: 30,
    description: 'Asset volatili (es. small cap, settori ciclici)',
    academicNote: 'Volatilità storica media small cap: 25-35% (Fama & French, 1993). Caratteristica di asset più rischiosi.',
    mifidWarning: 'Alta volatilità indica maggiore rischio e potenziale di perdita.',
    category: 'Volatile',
  },
  {
    label: 'Molto Alta Volatilità',
    value: 40,
    description: 'Asset molto volatili (es. crypto, settori emergenti)',
    academicNote: 'Volatilità storica media crypto: 40-80% (CoinGecko, 2024). Estrema volatilità caratteristica di asset speculativi.',
    mifidWarning: 'Volatilità molto alta comporta rischio estremo. Adatto SOLO a investitori esperti.',
    category: 'Estrema',
  },
];

interface VolatilitySuggestionsProps {
  onSelect: (value: number) => void;
  currentValue: number;
}

export function VolatilitySuggestions({ onSelect, currentValue }: VolatilitySuggestionsProps) {
  return (
    <MIFIDSuggestions
      title="Suggerimenti Volatilità (MIFID Compliant)"
      description="La volatilità misura la variabilità dei prezzi. Valori più alti indicano maggiore rischio. Basato su dati storici di volatilità implicita e realizzata."
      suggestions={volatilitySuggestions}
      onSelect={onSelect}
      currentValue={currentValue}
      unit="%"
      type="percentage"
    />
  );
}
