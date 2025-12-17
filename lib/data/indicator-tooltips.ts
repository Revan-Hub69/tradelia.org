/**
 * Minimal indicator tooltips data and helper.
 * Extend with full descriptions and references as needed.
 */

export interface AcademicReference {
  authors: string;
  title: string;
  year?: number;
}

export interface IndicatorInterpretation {
  positive: string;
  negative: string;
  neutral?: string;
}

export interface IndicatorTooltip {
  id: string;
  name: string;
  description: string;
  source?: string;
  howToUse?: string;
  academicReferences?: AcademicReference[];
  interpretation?: IndicatorInterpretation;
}

export const INDICATOR_TOOLTIPS: Record<string, IndicatorTooltip> = {
  vix: {
    id: 'vix',
    name: 'VIX (Volatility Index)',
    description: 'Indice di volatilità implicita del mercato azionario; spesso chiamato "indice della paura".',
    source: 'CBOE',
    howToUse: 'Valori alti indicano aspettative di volatilità; usato per misurare il rischio di mercato.',
    interpretation: {
      positive: 'Aumento della volatilità atteso; cautela nel trading.',
      negative: 'Volatilità in diminuzione; condizioni di mercato più calme.',
    },
  },
  price: {
    id: 'price',
    name: 'Prezzo',
    description: 'Prezzo corrente dell\'asset.',
  },
  volume: {
    id: 'volume',
    name: 'Volume',
    description: 'Volume delle transazioni in un periodo; utile per confermare movimenti di prezzo.',
  },
};

export function getIndicatorTooltip(indicatorId: string): IndicatorTooltip | undefined {
  if (!indicatorId) return undefined;
  return INDICATOR_TOOLTIPS[indicatorId];
}

export default getIndicatorTooltip;
