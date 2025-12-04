'use client';

import { MIFIDSuggestions, Suggestion } from './MIFIDSuggestions';

/**
 * Interest Rate Suggestions for Financial Calculator
 * Based on academic finance literature and current market conditions
 */

const interestRateSuggestions: Suggestion[] = [
  {
    label: 'Conto Deposito',
    value: 1.5,
    description: 'Conti deposito bancari tradizionali (basso rischio, liquidità immediata)',
    academicNote: 'Tasso medio conti deposito italiani: 1-2% annuo (Banca d\'Italia, 2024). Garantiti fino a €100.000 dal Fondo Interbancario di Tutela dei Depositi.',
    mifidWarning: 'Rischio molto basso. Adatto a investitori conservativi che cercano liquidità.',
    category: 'Basso Rischio',
  },
  {
    label: 'Obbligazioni Governative',
    value: 3,
    description: 'BOT, BTP e titoli di stato (rischio basso, rendimento moderato)',
    academicNote: 'Rendimento storico medio BTP 10 anni: 2-4% annuo (Borsa Italiana, 2024). Rischio di credito molto basso per titoli governativi.',
    mifidWarning: 'Rischio basso. Adatto a investitori conservativi con orizzonte temporale medio.',
    category: 'Basso Rischio',
  },
  {
    label: 'Obbligazioni Corporate',
    value: 4.5,
    description: 'Obbligazioni aziendali investment grade (rischio medio-basso)',
    academicNote: 'Rendimento storico medio obbligazioni corporate investment grade: 4-6% annuo (Bloomberg, 2024). Rischio di credito superiore ai titoli governativi.',
    mifidWarning: 'Rischio medio-basso. Adatto a investitori moderati.',
    category: 'Medio-Basso Rischio',
  },
  {
    label: 'Portafoglio Bilanciato',
    value: 6,
    description: 'Mix azioni-obbligazioni 60/40 (rischio medio)',
    academicNote: 'Rendimento storico medio portafoglio bilanciato: 5-7% annuo (Ibbotson, 2021). Equilibrio tra crescita e stabilità.',
    mifidWarning: 'Rischio medio. Adatto a investitori con orizzonte temporale medio-lungo (10+ anni).',
    category: 'Medio Rischio',
  },
  {
    label: 'Portafoglio Azionario',
    value: 8,
    description: 'Portafoglio diversificato azionario globale (rischio medio-alto)',
    academicNote: 'Rendimento storico medio mercato azionario globale: 7-10% annuo (Fama & French, 2002). Elevata volatilità nel breve termine.',
    mifidWarning: 'Rischio medio-alto. Adatto a investitori con orizzonte temporale lungo (15+ anni) e alta tolleranza al rischio.',
    category: 'Medio-Alto Rischio',
  },
  {
    label: 'Portafoglio Aggressivo',
    value: 10,
    description: 'Portafoglio prevalentemente azionario con focus crescita (rischio alto)',
    academicNote: 'Rendimento storico medio portafogli growth: 9-12% annuo (Ibbotson, 2021). Elevata volatilità e rischio di perdita.',
    mifidWarning: 'Rischio alto. Adatto SOLO a investitori esperti con orizzonte temporale molto lungo (20+ anni) e altissima tolleranza al rischio.',
    category: 'Alto Rischio',
  },
];

interface InterestRateSuggestionsProps {
  onSelect: (value: number) => void;
  currentValue: number;
}

export function InterestRateSuggestions({ onSelect, currentValue }: InterestRateSuggestionsProps) {
  return (
    <MIFIDSuggestions
      title="Suggerimenti Tasso di Interesse (MIFID Compliant)"
      description="I seguenti valori sono basati su dati storici accademici e rappresentano tassi di interesse medi attesi. I rendimenti passati non garantiscono risultati futuri. Scegli in base al tuo profilo di rischio e orizzonte temporale."
      suggestions={interestRateSuggestions}
      onSelect={onSelect}
      currentValue={currentValue}
      unit="%"
      type="rate"
    />
  );
}
