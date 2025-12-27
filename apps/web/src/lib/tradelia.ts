export type MarketSlug = 'crypto' | 'fx' | 'equity' | 'commodities'
export type HorizonSlug = 'accumulo' | 'multiday' | 'intraday'

export type MarketOption = {
  id: MarketSlug
  label: string
  context: string
  description: string
}

export type HorizonOption = {
  id: HorizonSlug
  label: string
  description: string
  focus: string
}

export const marketOptions: MarketOption[] = [
  {
    id: 'crypto',
    label: 'Crypto',
    context: 'Contesto digitale e alta volatilità',
    description: 'Ogni mercato ha dinamiche, rischi e indicatori diversi. Tradelia AI li interpreta secondo il contesto corretto.',
  },
  {
    id: 'fx',
    label: 'FX',
    context: 'Valute e macroeconomia',
    description: 'Ogni mercato ha dinamiche, rischi e indicatori diversi. Tradelia AI li interpreta secondo il contesto corretto.',
  },
  {
    id: 'equity',
    label: 'Equity',
    context: 'Azionario e fattori di rischio',
    description: 'Ogni mercato ha dinamiche, rischi e indicatori diversi. Tradelia AI li interpreta secondo il contesto corretto.',
  },
  {
    id: 'commodities',
    label: 'Commodities',
    context: 'Cicli, domanda/offerta, stagionalità',
    description: 'Ogni mercato ha dinamiche, rischi e indicatori diversi. Tradelia AI li interpreta secondo il contesto corretto.',
  },
]

export const horizonOptions: HorizonOption[] = [
  {
    id: 'accumulo',
    label: 'Accumulo / lungo termine',
    description: 'Contesto macro, rischio strutturale, drawdown storici.',
    focus: 'Costruire letture coerenti con cicli lunghi e resilienza del portafoglio.',
  },
  {
    id: 'multiday',
    label: 'Operatività multi-giorno',
    description: 'Regimi di mercato, volatilità, transizioni.',
    focus: 'Interpretare regimi e transizioni senza confondere segnali di breve e medio periodo.',
  },
  {
    id: 'intraday',
    label: 'Operatività intraday',
    description: 'Micro-struttura, liquidità, pressione di mercato.',
    focus: 'Mantenere coerenza con dati di micro-struttura e liquidità intraday.',
  },
]

export const methodPoints = [
  'Indicatori selezionati per coerenza accademica, non popolarità',
  'Interpretazione AI basata su contesto, limiti statistici e letteratura',
  'Nessuna personalizzazione, nessuna esecuzione, nessun segnale',
  'Contenuti esclusivamente educativi e informativi',
]

export const complianceCopy =
  'Tradelia AI è una piattaforma educativa e informativa. Non fornisce consulenza finanziaria né raccomandazioni operative.'

export function getMarketById(slug: string): MarketOption | undefined {
  return marketOptions.find((option) => option.id === slug)
}

export function getHorizonById(slug: string): HorizonOption | undefined {
  return horizonOptions.find((option) => option.id === slug)
}

export function buildPathTitle(market: MarketOption, horizon: HorizonOption) {
  return `${market.label} · ${horizon.label}`
}

export function buildObjectiveCopy(market: MarketOption, horizon: HorizonOption) {
  return [
    `Percorso su ${market.label} orientato a ${horizon.label.toLowerCase()}, con letture guidate per ridurre errori concettuali.`,
    horizon.focus,
  ]
}
