'use client';

import { useState, useMemo } from 'react';
import { Building2, CheckCircle2, X, Info, BookOpen, TrendingUp, Shield, Globe, Zap, Star, ChevronRight, ChevronLeft, AlertTriangle, FileText, Award, Target, Settings, ArrowRight, Check, DollarSign, CreditCard, HeadphonesIcon, Smartphone, GraduationCap, Calendar, ExternalLink, Calculator, BarChart3 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BrokerCosts {
  // Commissioni specifiche
  commissionStocks?: string; // es. "0.1% min €1"
  commissionForex?: string; // es. "Da 0.0 pip"
  commissionOptions?: string; // es. "€0.70 per contratto"
  commissionFutures?: string; // es. "€2.50 per contratto"
  // Spread tipici
  spreadForex?: string; // es. "0.1 pip EUR/USD"
  spreadIndices?: string; // es. "0.4 punti"
  // Costi aggiuntivi
  inactivityFee?: string; // es. "€10/mese dopo 12 mesi"
  withdrawalFee?: string; // es. "Gratuito"
  currencyConversionFee?: string; // es. "0.2%"
  marketDataFee?: string; // es. "€10/mese per dati real-time"
  // Costi minimi
  minCommission?: string; // es. "€1 per ordine"
  maxCommission?: string; // es. "1% del valore"
}

interface BrokerSupport {
  languages: string[]; // es. ['Italiano', 'Inglese']
  hours: string; // es. "Lun-Ven 9:00-18:00 CET"
  channels: string[]; // es. ['Email', 'Chat', 'Telefono']
  responseTime?: string; // es. "< 24h"
}

interface BrokerPayment {
  depositMethods: string[]; // es. ['Bonifico', 'Carta', 'PayPal']
  withdrawalMethods: string[]; // es. ['Bonifico', 'Carta']
  depositTime?: string; // es. "1-2 giorni lavorativi"
  withdrawalTime?: string; // es. "1-3 giorni lavorativi"
  minWithdrawal?: string; // es. "€50"
}

interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  regulatory: string[];
  platforms: string[];
  instruments: string[];
  minDeposit: number | string;
  leverage: string;
  spread: string; // Legacy - mantenuto per compatibilità
  commission: string; // Legacy - mantenuto per compatibilità
  taxRegime: 'amministrato' | 'dichiarativo' | 'both';
  educationLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  pros: string[];
  cons: string[];
  rating: number;
  affiliateLink?: string;
  score?: number;
  review?: {
    summary: string;
    recommendedFor: string;
    aiSupport: string;
    researchSignal: string;
  };
  riskLevel?: 'low' | 'medium' | 'high';
  mifid2Compliant?: boolean;
  // Nuove informazioni complete
  costs?: BrokerCosts;
  fundProtection?: {
    scheme: string; // es. "ICF", "SIPC", "FSCS"
    amount: string; // es. "€20,000", "$500,000"
  };
  support?: BrokerSupport;
  payment?: BrokerPayment;
  accountTypes?: string[]; // es. ['Retail', 'Professional', 'Institutional']
  demoAccount?: boolean;
  educationalResources?: boolean;
  mobileAppRating?: number; // 1-5
  lastUpdated?: string; // Data ultimo aggiornamento
  officialLinks?: {
    website?: string;
    terms?: string;
    kid?: string; // Key Information Document
    privacy?: string;
  };
}

// Lista broker corretta e affidabile dalla pagina brokers esistente
const availableBrokers: Broker[] = [
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/logos/tradelia-logo.svg',
    description: 'Accesso DMA a 160+ mercati globali con Toolset Trader Workstation, Client Portal e API istituzionali.',
    regulatory: ['SEC', 'CFTC', 'FCA', 'CSSF', 'ASIC'],
    platforms: ['TWS', 'Client Portal', 'IBKR Mobile', 'API FIX/REST'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'Commodities'],
    minDeposit: 0,
    leverage: 'Fino a 50:1 (retail), fino a 400:1 (professional)',
    spread: 'DMA - Spread di mercato',
    commission: 'Tiered: 0.005 USD per azione (min $1), Fixed: 0.005 USD per azione (min $1)',
    taxRegime: 'dichiarativo',
    educationLevel: 'advanced',
    pros: [
      'Copertura multi-mercato con DMA reale',
      'API e dati storici completi',
      'Gestione rischio margini trasparente',
      'Accesso a 160+ mercati globali',
      'Protezione SIPC fino a $500,000',
      'App mobile completa e professionale'
    ],
    cons: [
      'Curva di apprendimento ripida (TWS)',
      'Costi dati in tempo reale separati (da $4.50/mese)',
      'Più complesso per principianti',
      'Commissioni su opzioni/futures possono essere elevate per piccoli volumi'
    ],
    rating: 4.8,
    score: 95,
    riskLevel: 'high',
    mifid2Compliant: true,
    costs: {
      commissionStocks: 'Tiered: 0.005 USD per azione (min $1), Fixed: 0.005 USD per azione (min $1)',
      commissionForex: '0.08-0.20 pip (EUR/USD)',
      commissionOptions: 'Da $0.70 per contratto',
      commissionFutures: 'Da $0.85 per contratto',
      spreadForex: 'DMA - Spread di mercato',
      inactivityFee: '$20/mese se account < $2,000 e nessuna attività',
      withdrawalFee: 'Gratuito (1 prelievo/mese), poi $10',
      currencyConversionFee: '0.002% (2 bps)',
      marketDataFee: 'Da $4.50/mese per dati real-time (gratuito per dati ritardati)',
      minCommission: '$1 per ordine'
    },
    fundProtection: {
      scheme: 'SIPC',
      amount: '$500,000 (di cui $250,000 cash)'
    },
    support: {
      languages: ['Inglese', 'Italiano', 'Francese', 'Tedesco', 'Spagnolo', 'Cinese'],
      hours: 'Lun-Ven 24/5 (mercati aperti), Sab-Dom limitato',
      channels: ['Telefono', 'Chat', 'Email', 'Ticket'],
      responseTime: '< 24h per email, immediato per chat/telefono'
    },
    payment: {
      depositMethods: ['Bonifico', 'Wire Transfer', 'ACH', 'Carta'],
      withdrawalMethods: ['Bonifico', 'Wire Transfer', 'ACH'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-3 giorni lavorativi',
      minWithdrawal: '$1'
    },
    accountTypes: ['Retail', 'Professional', 'Institutional'],
    demoAccount: true,
    educationalResources: true,
    mobileAppRating: 4.5,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.interactivebrokers.com',
      terms: 'https://www.interactivebrokers.com/en/index.php?f=16457',
      privacy: 'https://www.interactivebrokers.com/en/index.php?f=16458'
    },
    review: {
      summary: 'Utilizziamo IBKR per dataset microstrutturali e per replicare condizioni istituzionali nelle simulazioni AI di portafoglio.',
      recommendedFor: 'Desk quantitativi, investitori professionali, master universitari con focus su derivati quotati.',
      aiSupport: 'API documentate e accesso a dati storici tick-level utili per modelli di reinforcement learning.',
      researchSignal: 'Copertura multipaese coerente con gli scenari testati nel whitepaper ESMA 2024 su AI explainability.'
    }
  },
  {
    id: 'bgsaxo',
    name: 'BG Saxo (SIM Italia)',
    logo: '/logos/tradelia-logo.svg',
    description: 'Succursale italiana del gruppo Saxo Bank con regime amministrato e piattaforme SaxoTraderGO/PRO.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    platforms: ['SaxoTraderGO', 'SaxoTraderPRO', 'OpenAPI'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'CFD'],
    minDeposit: 0,
    leverage: 'Fino a 30:1 (retail), fino a 400:1 (professional)',
    spread: 'Da 0.4 pip (EUR/USD)',
    commission: 'Azioni: 0.1% (min €3), Forex: spread incluso',
    taxRegime: 'amministrato',
    educationLevel: 'intermediate',
    pros: [
      'Regime fiscale amministrato (IT)',
      'Copertura globale azioni/derivati',
      'Piattaforme professionali configurabili',
      'Supporto italiano',
      'Protezione fondi fino a €100,000',
      'Piattaforme desktop e mobile complete'
    ],
    cons: [
      'Struttura commissionale articolata',
      'Richiede familiarità con marginazione avanzata',
      'Costi dati di mercato aggiuntivi per alcuni strumenti'
    ],
    rating: 4.5,
    score: 90,
    riskLevel: 'medium',
    mifid2Compliant: true,
    costs: {
      commissionStocks: '0.1% (min €3)',
      commissionForex: 'Spread incluso (da 0.4 pip EUR/USD)',
      commissionOptions: 'Da €1.50 per contratto',
      commissionFutures: 'Da €2.50 per contratto',
      spreadForex: 'Da 0.4 pip (EUR/USD)',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito',
      currencyConversionFee: 'Spread incluso',
      marketDataFee: 'Gratuito per dati base, premium a pagamento'
    },
    fundProtection: {
      scheme: 'Fondo Interbancario di Tutela dei Depositi',
      amount: '€100,000'
    },
    support: {
      languages: ['Italiano', 'Inglese'],
      hours: 'Lun-Ven 9:00-18:00 CET',
      channels: ['Telefono', 'Email', 'Chat'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'Carta', 'SEPA'],
      withdrawalMethods: ['Bonifico', 'SEPA'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-3 giorni lavorativi',
      minWithdrawal: '€50'
    },
    accountTypes: ['Retail', 'Professional'],
    demoAccount: true,
    educationalResources: true,
    mobileAppRating: 4.3,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.saxobank.com/it',
      terms: 'https://www.saxobank.com/it/terms',
      privacy: 'https://www.saxobank.com/it/privacy'
    },
    review: {
      summary: 'Selezionato per progetti pilota con università italiane su fiscalità amministrata e formazione su derivati quotati.',
      recommendedFor: 'Investitori evoluti che necessitano di sostituto d\'imposta italiano con ampia gamma strumenti globali.',
      aiSupport: 'OpenAPI con SDK ufficiali e esportazione dati posizioni, utile per classificatori risk-aware.',
      researchSignal: 'Documentazione ESG e risk disclosure aggiornata secondo linee guida CONSOB 2025.'
    }
  },
  {
    id: 'directa',
    name: 'Directa SIM',
    logo: '/logos/tradelia-logo.svg',
    description: 'Broker italiano storico con focus su Borsa Italiana e mercati USA/Europa, documentazione trasparente.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    platforms: ['Directa Platform', 'dLite', 'TradingView integrazione'],
    instruments: ['Azioni', 'ETF', 'Bond', 'IDEM'],
    minDeposit: 0,
    leverage: 'N/A',
    spread: 'Spread di mercato (DMA)',
    commission: 'Borsa Italiana: 0.19% (min €2.95), USA: $0.005 per azione (min $1)',
    taxRegime: 'amministrato',
    educationLevel: 'beginner',
    pros: [
      'Fiscalità amministrata completamente gestita',
      'Accesso diretto a IDEM e Borsa Italiana',
      'Supporto in lingua italiana',
      'Nessun deposito minimo',
      'Nessun costo di inattività',
      'Commissioni trasparenti e competitive per mercato italiano'
    ],
    cons: [
      'Interfaccia meno moderna rispetto a peer esteri',
      'Costi su mercati esteri da valutare caso per caso',
      'App mobile limitata rispetto a competitor internazionali'
    ],
    rating: 4.2,
    score: 84,
    riskLevel: 'low',
    mifid2Compliant: true,
    costs: {
      commissionStocks: 'Borsa Italiana: 0.19% (min €2.95), USA: $0.005 per azione (min $1)',
      spreadForex: 'N/A - Non offre forex',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito',
      currencyConversionFee: 'Spread applicato su cambio valuta',
      minCommission: '€2.95 (Borsa Italiana), $1 (USA)'
    },
    fundProtection: {
      scheme: 'Fondo Interbancario di Tutela dei Depositi',
      amount: '€100,000'
    },
    support: {
      languages: ['Italiano'],
      hours: 'Lun-Ven 9:00-18:00 CET',
      channels: ['Telefono', 'Email', 'Chat'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'Carta'],
      withdrawalMethods: ['Bonifico'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-2 giorni lavorativi',
      minWithdrawal: '€50'
    },
    accountTypes: ['Retail'],
    demoAccount: false,
    educationalResources: true,
    mobileAppRating: 3.5,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.directa.it',
      terms: 'https://www.directa.it/condizioni-generali',
      privacy: 'https://www.directa.it/privacy'
    },
    review: {
      summary: 'Utilizzato in laboratori didattici per la componente fiscale domestica e per testare microflussi IDEM.',
      recommendedFor: 'Investitori italiani che privilegiano rapporto diretto con SIM vigilata e regime amministrato.',
      aiSupport: 'API REST (beta) per estrazione movimenti e portafogli, integrate nel nostro framework di reporting fiscale.',
      researchSignal: 'Case study nella sezione "educazione finanziaria" del Rapporto CONSOB 2025.'
    }
  },
  {
    id: 'exante',
    name: 'Exante',
    logo: '/logos/exante.svg',
    description: 'Intermediario multi-mercato con accesso DMA e copertura obbligazionaria estesa, utilizzato per ricerca su fixed income.',
    regulatory: ['MFSA', 'CySEC', 'FCA'],
    platforms: ['Piattaforma proprietaria Web/Desktop', 'API FIX'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 10000,
    leverage: 'Variabile',
    spread: 'DMA',
    commission: 'Variabile',
    taxRegime: 'both',
    educationLevel: 'advanced',
    pros: [
      'Copertura obbligazionaria molto ampia',
      'DMA su 50+ mercati quotati',
      'Supporto multi-valuta e tool risk',
      'Accesso globale'
    ],
    cons: [
      'Deposito minimo elevato',
      'Crypto solo via CFD'
    ],
    rating: 4.4,
    score: 88,
    riskLevel: 'high',
    mifid2Compliant: true,
    review: {
      summary: 'Nel framework Tradelia AI viene impiegato per dataset obbligazionari e analisi cross-market su tassi benchmark.',
      recommendedFor: 'Investitori professionali e desk obbligazionari che necessitano di book profondi.',
      aiSupport: 'Export veloce dei dati storici e FIX gateway utile per strategie basate su reinforcement learning controllato.',
      researchSignal: 'Allineamento con raccomandazioni BIS 2024 su trasparenza dati fixed-income.'
    }
  },
  {
    id: 'mexem',
    name: 'MEXEM',
    logo: '/logos/tradelia-logo.svg',
    description: 'Introducing broker europeo su infrastruttura IBKR con supporto dedicato UE e materiale formativo certificato.',
    regulatory: ['CySEC', 'FCA'],
    platforms: ['Trader Workstation', 'Client Portal', 'App'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0,
    leverage: 'Variabile',
    spread: 'Variabile',
    commission: 'Variabile',
    taxRegime: 'dichiarativo',
    educationLevel: 'intermediate',
    pros: [
      'Accesso TWS con supporto UE',
      'Nessun deposito minimo',
      'Documentazione educativa strutturata',
      'Supporto italiano'
    ],
    cons: [
      'Dipendenza infrastrutturale da IBKR',
      'Commissioni su opzioni da monitorare'
    ],
    rating: 4.3,
    score: 86,
    riskLevel: 'medium',
    mifid2Compliant: true,
    review: {
      summary: 'Adottato per percorsi educativi avanzati in lingua italiana con accesso TWS e supporto compliance europeo.',
      recommendedFor: 'Trader avanzati e studenti MSc che necessitano di supporto localizzato mantenendo infrastruttura IBKR.',
      aiSupport: 'Condivide API IBKR, integrabile nei workflow di controllo rischio AI sviluppati dal team.',
      researchSignal: 'Riferito nel MIT-IBM 2024 per la sezione "accessibilità TWS a studenti e ricercatori".'
    }
  },
  {
    id: 'freedom24',
    name: 'Freedom24',
    logo: '/logos/freedom24.svg',
    description: 'Focalizzata su IPO statunitensi ed europee con accesso retail regolamentato e materiale MiFID II dedicato.',
    regulatory: ['CySEC', 'CONSOB'],
    platforms: ['Web', 'App iOS/Android'],
    instruments: ['Azioni', 'ETF', 'Bond', 'IPO'],
    minDeposit: 10,
    leverage: 'N/A',
    spread: 'Spread incluso nel prezzo',
    commission: '€0.99 per ordine (fino a €1,000), poi 0.1%',
    taxRegime: 'amministrato',
    educationLevel: 'all',
    pros: [
      'Accesso IPO primarie regolamentato',
      'Piani di accumulo e conto remunerato',
      'Protezione fondi UE (ICF fino a 20k €)',
      'Regime amministrato',
      'Commissioni fisse e trasparenti',
      'Nessun costo di inattività'
    ],
    cons: [
      'Depositi minimi più elevati per IPO',
      'Costi cambio valuta da gestire',
      'Spread non trasparente (incluso nel prezzo)',
      'Limitato a azioni/ETF/Bond'
    ],
    rating: 4.3,
    score: 85,
    riskLevel: 'low',
    mifid2Compliant: true,
    costs: {
      commissionStocks: '€0.99 per ordine (fino a €1,000), poi 0.1%',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito',
      currencyConversionFee: 'Spread incluso nel prezzo',
      minCommission: '€0.99 per ordine'
    },
    fundProtection: {
      scheme: 'ICF (Investor Compensation Fund)',
      amount: '€20,000'
    },
    support: {
      languages: ['Italiano', 'Inglese', 'Tedesco', 'Francese'],
      hours: 'Lun-Ven 9:00-18:00 CET',
      channels: ['Email', 'Chat'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'Carta', 'SEPA'],
      withdrawalMethods: ['Bonifico', 'SEPA'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-3 giorni lavorativi',
      minWithdrawal: '€10'
    },
    accountTypes: ['Retail'],
    demoAccount: false,
    educationalResources: true,
    mobileAppRating: 4.2,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.freedom24.com',
      terms: 'https://www.freedom24.com/terms',
      privacy: 'https://www.freedom24.com/privacy'
    },
    review: {
      summary: 'Monitorato per analisi su allocazione primaria e gestione lock-up nelle IPO; interessante per laboratori su equity capital markets.',
      recommendedFor: 'Investitori informati interessati a pipeline IPO e diversificazione tramite piani di accumulo.',
      aiSupport: 'Dataset strutturati su pipeline IPO integrati nella nostra dashboard di monitoraggio volatilità post-listing.',
      researchSignal: 'Casi studio citati nell\'OECD 2025 su AI e distribuzione di prodotti primari.'
    }
  },
  {
    id: 'scalable',
    name: 'Scalable Capital',
    logo: '/logos/tradelia-logo.svg',
    description: 'Piattaforma europea focalizzata su ETF, PAC automatizzati e servizi di risparmio regolamentati.',
    regulatory: ['BaFin', 'CONSOB passporting'],
    platforms: ['Web', 'App'],
    instruments: ['ETF', 'Azioni', 'PAC'],
    minDeposit: 1,
    leverage: 'N/A',
    spread: 'N/A',
    commission: 'Bassa',
    taxRegime: 'dichiarativo',
    educationLevel: 'beginner',
    pros: [
      'Costi contenuti e trasparenti',
      'Ampia scelta ETF/PAC automatizzati',
      'Interfaccia intuitiva',
      'Regolamentato BaFin'
    ],
    cons: [
      'Copertura mercati concentrata su Europa',
      'Limitate funzioni avanzate per derivati'
    ],
    rating: 4.2,
    score: 83,
    riskLevel: 'low',
    mifid2Compliant: true,
    review: {
      summary: 'Analizzata per casi studio su automazione PAC e ottimizzazione costi, utile nei percorsi educativi su accumulo disciplinato.',
      recommendedFor: 'Investitori retail consapevoli che necessitano di costi bassi e automazione su ETF europei.',
      aiSupport: 'Dataset periodici sui PAC integrati nella nostra dashboard di monitoraggio costi effettivi.',
      researchSignal: 'Cita le best practice MiFID II 2025 su informativa precontrattuale digitale.'
    }
  },
  {
    id: 'traderepublic',
    name: 'Trade Republic',
    logo: '/logos/tradelia-logo.svg',
    description: 'Banca d\'investimento con IBAN italiano, interessi 3% annuo e PAC gratuiti su asset reali.',
    regulatory: ['BaFin', 'Banca d\'Italia'],
    platforms: ['App iOS/Android', 'Web'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Crypto spot'],
    minDeposit: 1,
    leverage: 'N/A',
    spread: 'Spread incluso nel prezzo (non trasparente)',
    commission: '€1 per ordine (fino a €1,000), poi 0.1%',
    taxRegime: 'amministrato',
    educationLevel: 'beginner',
    pros: [
      'Regime amministrato con sostituto d\'imposta',
      'Interessi sulla liquidità (3% annuo) e PAC gratuiti',
      'Esperienza mobile-first ottimizzata',
      'IBAN italiano',
      'Nessun costo di inattività',
      'Commissioni fisse e trasparenti'
    ],
    cons: [
      'Assistenza prevalentemente digitale (no telefono)',
      'Offerta derivati limitata',
      'Spread non trasparente (incluso nel prezzo)',
      'Limitato a mercati europei'
    ],
    rating: 4.4,
    score: 88,
    riskLevel: 'low',
    mifid2Compliant: true,
    costs: {
      commissionStocks: '€1 per ordine (fino a €1,000), poi 0.1%',
      commissionForex: 'N/A - Non offre forex',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito',
      currencyConversionFee: 'Spread incluso nel prezzo',
      minCommission: '€1 per ordine'
    },
    fundProtection: {
      scheme: 'Einlagensicherungsfonds',
      amount: '€100,000'
    },
    support: {
      languages: ['Italiano', 'Tedesco', 'Inglese', 'Francese', 'Spagnolo'],
      hours: 'Lun-Dom 8:00-20:00 CET',
      channels: ['Chat', 'Email'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'Carta', 'SEPA Instant'],
      withdrawalMethods: ['Bonifico', 'SEPA Instant'],
      depositTime: 'Immediato (SEPA Instant) o 1-2 giorni',
      withdrawalTime: 'Immediato (SEPA Instant) o 1-2 giorni',
      minWithdrawal: '€1'
    },
    accountTypes: ['Retail'],
    demoAccount: false,
    educationalResources: true,
    mobileAppRating: 4.8,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.traderepublic.com',
      terms: 'https://www.traderepublic.com/it/terms',
      privacy: 'https://www.traderepublic.com/it/privacy'
    },
    review: {
      summary: 'Sperimentata per moduli educativi su gestione tesoreria personale e pacchetti multi-asset con fiscalità amministrata.',
      recommendedFor: 'Investitori retail disciplinati orientati a PAC e gestione liquidità con infrastruttura bancaria vigilata.',
      aiSupport: 'API private per estrazione cronologia operazioni, integrate nel nostro motore di reconcialiazione fiscale.',
      researchSignal: 'Evidenziata nel Rapporto CONSOB 2025 per trasparenza informativa ai giovani risparmiatori.'
    }
  },
];

interface FormData {
  taxRegime: 'amministrato' | 'dichiarativo' | 'both' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  instruments: string[];
  platforms: string[];
  minDeposit: number | '';
  leverage: 'low' | 'medium' | 'high' | '';
}

const STEPS = [
  { id: 1, title: 'Profilo Investitore', icon: Target },
  { id: 2, title: 'Obiettivi di Investimento', icon: TrendingUp },
  { id: 3, title: 'Preferenze Tecniche', icon: Settings },
  { id: 4, title: 'Risultati', icon: Award },
] as const;

export function BrokersRecommender() {
  const { t } = useTranslations();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    taxRegime: '',
    experience: '',
    instruments: [],
    platforms: [],
    minDeposit: '',
    leverage: '',
  });
  const [showDrawer, setShowDrawer] = useState<Broker | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCostCalculator, setShowCostCalculator] = useState(false);

  const availableInstruments = ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'Crypto', 'Commodities', 'Indici', 'CFD', 'IDEM', 'IPO', 'PAC'];
  const availablePlatforms = ['Web', 'Mobile', 'Desktop', 'MT4', 'MT5', 'cTrader', 'TWS', 'Client Portal', 'SaxoTraderGO', 'SaxoTraderPRO', 'Directa Platform', 'dLite', 'TradingView', 'OpenAPI', 'API FIX/REST'];

  const recommendedBrokers = useMemo(() => {
    return availableBrokers.filter(broker => {
      if (formData.taxRegime && formData.taxRegime !== 'both') {
        if (formData.taxRegime === 'amministrato' && broker.taxRegime !== 'amministrato' && broker.taxRegime !== 'both') return false;
        if (formData.taxRegime === 'dichiarativo' && broker.taxRegime !== 'dichiarativo' && broker.taxRegime !== 'both') return false;
      }

      if (formData.experience) {
        const experienceMap = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' };
        if (broker.educationLevel !== experienceMap[formData.experience] && broker.educationLevel !== 'all') return false;
      }

      if (formData.instruments.length > 0) {
        const hasInstruments = formData.instruments.some(inst => broker.instruments.includes(inst));
        if (!hasInstruments) return false;
      }

      if (formData.platforms.length > 0) {
        const hasPlatforms = formData.platforms.some(plat => broker.platforms.some(bp => bp.includes(plat) || plat.includes(bp)));
        if (!hasPlatforms) return false;
      }

      if (formData.minDeposit && typeof formData.minDeposit === 'number') {
        const brokerMin = typeof broker.minDeposit === 'number' ? broker.minDeposit : 0;
        if (brokerMin > formData.minDeposit) return false;
      }

      if (formData.leverage) {
        if (broker.leverage === 'N/A') {
          if (formData.leverage !== 'low') return true;
          return false;
        }
      }

      return true;
    }).sort((a, b) => (b.score || b.rating * 20) - (a.score || a.rating * 20));
  }, [formData]);

  const canProceed = () => {
    if (currentStep === 1) return formData.taxRegime && formData.experience;
    if (currentStep === 2) return formData.instruments.length > 0;
    if (currentStep === 3) return true;
    return false;
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setFormData({
      taxRegime: '',
      experience: '',
      instruments: [],
      platforms: [],
      minDeposit: '',
      leverage: '',
    });
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent/20 rounded-lg">
            <Building2 className="w-6 h-6 text-accent" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t('utilities.brokers.title') || 'Brokers Consigliati'}
            </h2>
            <p className="text-text-secondary">
              {t('utilities.brokers.description') || 'Trova il broker ideale attraverso un percorso guidato basato su criteri accademici e conformità MiFID II'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive
                      ? 'bg-accent border-accent text-white'
                      : isCompleted
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-bg-soft border-border-subtle text-text-tertiary'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  )}
                </div>
                <p className={cn('text-xs mt-2 font-medium', isActive ? 'text-accent' : isCompleted ? 'text-green-400' : 'text-text-tertiary')}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-2', isCompleted ? 'bg-green-500' : 'bg-border-subtle')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" aria-hidden="true" />
                  Profilo Investitore
                </h3>
                <p className="text-text-secondary">
                  Definisci il tuo profilo fiscale e livello di esperienza per una raccomandazione personalizzata
                </p>
              </div>

              {/* Regime Fiscale */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-3">
                    Regime Fiscale Preferito
                  </label>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="space-y-2 text-sm text-text-secondary">
                        <p className="font-semibold text-text-primary">Spiegazione Accademica - Regime Fiscale</p>
                        <p>
                          <strong>Regime Amministrato:</strong> Secondo l'Art. 5 del D.Lgs. 461/1997, il broker agisce come sostituto d'imposta,
                          trattenendo automaticamente le imposte sui guadagni. Non è richiesta dichiarazione nel 730/Unico per i redditi da capitale.
                          Ideale per investitori retail che preferiscono semplificazione amministrativa.
                        </p>
                        <p>
                          <strong>Regime Dichiarativo:</strong> Conforme all'Art. 67 del TUIR, l'investitore deve dichiarare guadagni e perdite
                          nel modello 730/Unico. Offre maggiore controllo fiscale e possibilità di compensazione delle minusvalenze.
                          Consigliato per trader attivi e investitori professionali.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['amministrato', 'dichiarativo', 'both'] as const).map(regime => (
                      <button
                        key={regime}
                        onClick={() => setFormData(prev => ({ ...prev, taxRegime: regime }))}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          formData.taxRegime === regime
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-accent/40'
                        )}
                        aria-label={`Seleziona regime ${regime}`}
                        aria-pressed={formData.taxRegime === regime}
                      >
                        <div className="font-semibold mb-1">
                          {regime === 'amministrato' ? 'Amministrato' : regime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
                        </div>
                        <div className="text-xs">
                          {regime === 'amministrato' && 'Semplificato, broker trattiene tasse'}
                          {regime === 'dichiarativo' && 'Controllo totale, dichiarazione richiesta'}
                          {regime === 'both' && 'Nessuna preferenza specifica'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Livello Esperienza */}
                <div>
                  <label className="text-sm font-semibold text-text-primary block mb-3">
                    Livello di Esperienza nel Trading
                  </label>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="space-y-2 text-sm text-text-secondary">
                        <p className="font-semibold text-text-primary">Classificazione MiFID II - Profilo Investitore</p>
                        <p>
                          Secondo l'Art. 25 della Direttiva MiFID II (2014/65/UE), i broker devono classificare i clienti in base a conoscenze,
                          esperienza e obiettivi. La nostra classificazione segue le linee guida ESMA 2024:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>Principiante:</strong> Investitore retail con conoscenze base, preferisce supporto e formazione</li>
                          <li><strong>Intermedio:</strong> Investitore informato con esperienza moderata, cerca autonomia con supporto</li>
                          <li><strong>Avanzato:</strong> Investitore professionale o esperto, richiede strumenti avanzati e API</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setFormData(prev => ({ ...prev, experience: level }))}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          formData.experience === level
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-accent/40'
                        )}
                        aria-label={`Seleziona livello ${level}`}
                        aria-pressed={formData.experience === level}
                      >
                        <div className="font-semibold mb-1">
                          {level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : 'Avanzato'}
                        </div>
                        <div className="text-xs">
                          {level === 'beginner' && 'Conoscenze base, preferisco supporto'}
                          {level === 'intermediate' && 'Esperienza moderata, autonomia con guida'}
                          {level === 'advanced' && 'Esperto, strumenti avanzati e API'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" aria-hidden="true" />
                  Obiettivi di Investimento
                </h3>
                <p className="text-text-secondary">
                  Seleziona gli strumenti finanziari che desideri tradare. Puoi selezionare più opzioni.
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-2 text-sm text-text-secondary">
                    <p className="font-semibold text-text-primary">Diversificazione Portafoglio - Teoria Moderna</p>
                    <p>
                      Secondo il Modello di Markowitz (1952) e le linee guida MiFID II, la diversificazione riduce il rischio non sistematico.
                      La selezione degli strumenti deve allinearsi al tuo profilo di rischio e obiettivi di investimento.
                    </p>
                    <p>
                      <strong>Nota:</strong> Gli strumenti derivati (Opzioni, Futures, CFD) comportano rischi elevati e possono comportare
                      perdite superiori al capitale investito. Conforme all'Art. 25 MiFID II, è richiesta adeguata valutazione dell'adeguatezza.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableInstruments.map(instrument => {
                  const isSelected = formData.instruments.includes(instrument);
                  return (
                    <button
                      key={instrument}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          instruments: prev.instruments.includes(instrument)
                            ? prev.instruments.filter(i => i !== instrument)
                            : [...prev.instruments, instrument],
                        }));
                      }}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-sm font-medium relative',
                        isSelected
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-accent/40'
                      )}
                      aria-label={`${isSelected ? 'Deseleziona' : 'Seleziona'} ${instrument}`}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 absolute top-1 right-1 text-accent" aria-hidden="true" />
                      )}
                      {instrument}
                    </button>
                  );
                })}
              </div>

              {formData.instruments.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    <strong>Strumenti selezionati:</strong> {formData.instruments.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" aria-hidden="true" />
                  Preferenze Tecniche
                </h3>
                <p className="text-text-secondary">
                  Definisci le tue preferenze per piattaforme, deposito minimo e leverage
                </p>
              </div>

              {/* Piattaforme */}
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-3">
                  Piattaforme Preferite (opzionale)
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availablePlatforms.map(platform => {
                    const isSelected = formData.platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            platforms: prev.platforms.includes(platform)
                              ? prev.platforms.filter(p => p !== platform)
                              : [...prev.platforms, platform],
                          }));
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border transition-all text-sm',
                          isSelected
                            ? 'bg-accent/20 text-accent border-accent'
                            : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                        )}
                        aria-label={`${isSelected ? 'Deseleziona' : 'Seleziona'} ${platform}`}
                        aria-pressed={isSelected}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deposito Minimo */}
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-2">
                  Deposito Minimo Massimo (€) - Opzionale
                </label>
                <input
                  type="number"
                  value={formData.minDeposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, minDeposit: e.target.value ? Number(e.target.value) : '' }))}
                  placeholder="Es: 1000"
                  className="w-full px-4 py-3 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  aria-label="Inserisci deposito minimo massimo desiderato in euro"
                />
              </div>

              {/* Leverage */}
              <div>
                <label className="text-sm font-semibold text-text-primary block mb-3">
                  Leverage Desiderato (opzionale)
                </label>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-2 text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary">Avviso Rischio - Leverage</p>
                      <p>
                        <strong>IMPORTANTE - Conformità MiFID II Art. 25:</strong> Il trading con leverage comporta rischi elevati.
                        Secondo ESMA, il leverage massimo per clienti retail è limitato (es. 30:1 per major forex, 5:1 per crypto).
                        Le perdite possono superare il capitale investito.
                      </p>
                      <p>
                        <strong>Nota:</strong> I broker regolamentati UE applicano automaticamente i limiti ESMA per clienti retail.
                        I clienti professionali possono accedere a leverage più elevato previa adeguata valutazione.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['low', 'medium', 'high'] as const).map(lev => (
                    <button
                      key={lev}
                      onClick={() => setFormData(prev => ({ ...prev, leverage: lev }))}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-left',
                        formData.leverage === lev
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-accent/40'
                      )}
                      aria-label={`Seleziona leverage ${lev}`}
                      aria-pressed={formData.leverage === lev}
                    >
                      <div className="font-semibold mb-1">
                        {lev === 'low' ? 'Basso (fino a 30:1)' : lev === 'medium' ? 'Medio (fino a 200:1)' : 'Alto (fino a 500:1)'}
                      </div>
                      <div className="text-xs">
                        {lev === 'low' && 'Conforme limiti ESMA retail'}
                        {lev === 'medium' && 'Per trader esperti'}
                        {lev === 'high' && 'Solo clienti professionali'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-400" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-text-primary">
                      Brokers Consigliati ({recommendedBrokers.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCostCalculator(true)}
                      className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                      aria-label="Apri calcolatore costi"
                    >
                      <Calculator className="w-4 h-4" aria-hidden="true" />
                      Calcolatore Costi
                    </button>
                    {recommendedBrokers.length > 1 && (
                      <button
                        onClick={() => setCompareMode(!compareMode)}
                        className={cn(
                          'px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium',
                          compareMode
                            ? 'bg-accent text-white hover:bg-accent-hover'
                            : 'bg-bg-soft text-text-primary hover:bg-bg-soft/80'
                        )}
                        aria-label={compareMode ? 'Esci dalla modalità comparazione' : 'Attiva modalità comparazione'}
                      >
                        <BarChart3 className="w-4 h-4" aria-hidden="true" />
                        {compareMode ? 'Esci Comparazione' : 'Confronta'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-text-secondary">
                  Basato sui criteri selezionati, ecco i broker che meglio si adattano al tuo profilo
                </p>
              </div>

              {recommendedBrokers.length === 0 ? (
                <div className="bg-bg-soft border border-border-subtle rounded-xl p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-text-secondary mb-4">
                    Nessun broker trovato con i criteri selezionati. Prova a modificare le preferenze.
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
                    aria-label="Ricomincia il form"
                  >
                    Ricomincia
                  </button>
                </div>
              ) : compareMode ? (
                /* Modalità Comparazione Side-by-Side */
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-bg-soft border-b border-border-subtle">
                          <th className="text-left p-4 font-semibold text-text-primary sticky left-0 bg-bg-soft z-10">Broker</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Rating</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Deposito Min.</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Commissioni</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Regime Fiscale</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Protezione</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Supporto</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Demo</th>
                          <th className="text-left p-4 font-semibold text-text-primary">Azione</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendedBrokers.map((broker, index) => (
                          <tr key={broker.id} className={cn('border-b border-border-subtle hover:bg-bg-soft/50 transition-colors', index % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-soft/30')}>
                            <td className="p-4 sticky left-0 bg-inherit z-10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-white p-1 border border-border-subtle">
                                  <Image
                                    src={broker.logo}
                                    alt={`Logo ${broker.name}`}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary">{broker.name}</p>
                                  <p className="text-xs text-text-tertiary">{broker.riskLevel && `Rischio ${broker.riskLevel === 'low' ? 'Basso' : broker.riskLevel === 'medium' ? 'Medio' : 'Alto'}`}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                                <span className="text-sm font-semibold text-text-primary">{broker.rating}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-text-primary">
                                {typeof broker.minDeposit === 'number' && broker.minDeposit > 0
                                  ? `€${broker.minDeposit.toLocaleString()}`
                                  : typeof broker.minDeposit === 'string'
                                  ? broker.minDeposit
                                  : 'Nessun minimo'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-text-primary">{broker.costs?.commissionStocks || broker.commission}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-text-primary">
                                {broker.taxRegime === 'amministrato' ? 'Amministrato' : broker.taxRegime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
                              </span>
                            </td>
                            <td className="p-4">
                              {broker.fundProtection ? (
                                <div>
                                  <p className="text-xs font-semibold text-green-400">{broker.fundProtection.scheme}</p>
                                  <p className="text-xs text-text-tertiary">{broker.fundProtection.amount}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-text-tertiary">N/A</span>
                              )}
                            </td>
                            <td className="p-4">
                              {broker.support ? (
                                <div>
                                  <p className="text-xs text-text-primary">{broker.support.languages.join(', ')}</p>
                                  <p className="text-xs text-text-tertiary">{broker.support.channels.join(', ')}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-text-tertiary">N/A</span>
                              )}
                            </td>
                            <td className="p-4">
                              {broker.demoAccount !== undefined ? (
                                broker.demoAccount ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400" aria-label="Account demo disponibile" />
                                ) : (
                                  <X className="w-5 h-5 text-text-tertiary" aria-label="Account demo non disponibile" />
                                )
                              ) : (
                                <span className="text-xs text-text-tertiary">N/A</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowDrawer(broker)}
                                  className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                  aria-label={`Dettagli ${broker.name}`}
                                >
                                  <Info className="w-4 h-4" aria-hidden="true" />
                                </button>
                                {broker.affiliateLink && (
                                  <a
                                    href={broker.affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors"
                                    aria-label={`Apri account ${broker.name}`}
                                  >
                                    Apri
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendedBrokers.map((broker, index) => (
                    <motion.div
                      key={broker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden hover:border-accent/40 transition-all group"
                      role="article"
                      aria-label={`Broker ${broker.name}, rating ${broker.rating}, score ${broker.score || 'N/A'}`}
                    >
                      {/* Header Card */}
                      <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 border-b border-border-subtle">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center border border-border-subtle shadow-sm">
                              <Image
                                src={broker.logo}
                                alt={`Logo ${broker.name}`}
                                width={64}
                                height={64}
                                className="object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-text-primary mb-1">{broker.name}</h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'w-4 h-4',
                                        i < Math.floor(broker.rating) ? 'text-amber-400 fill-amber-400' : 'text-text-tertiary'
                                      )}
                                      aria-hidden="true"
                                    />
                                  ))}
                                  <span className="text-xs text-text-tertiary ml-1">({broker.rating})</span>
                                </div>
                                {broker.score && (
                                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-semibold">
                                    Score: {broker.score}/100
                                  </span>
                                )}
                                {broker.mifid2Compliant && (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold flex items-center gap-1">
                                    <Shield className="w-3 h-3" aria-hidden="true" />
                                    MiFID II
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDrawer(broker)}
                            className="text-accent hover:text-accent-hover transition-colors p-2 hover:bg-accent/10 rounded-lg"
                            aria-label={`Dettagli completi ${broker.name}`}
                          >
                            <Info className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{broker.description}</p>
                      </div>

                      {/* Body Card */}
                      <div className="p-6 space-y-4">
                        {/* Risk Level */}
                        {broker.riskLevel && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={cn(
                              'w-4 h-4',
                              broker.riskLevel === 'low' ? 'text-green-400' : broker.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                            )} aria-hidden="true" />
                            <span className={cn(
                              'text-xs font-semibold',
                              broker.riskLevel === 'low' ? 'text-green-400' : broker.riskLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                            )}>
                              Rischio {broker.riskLevel === 'low' ? 'Basso' : broker.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                            </span>
                          </div>
                        )}

                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-bg-soft rounded-lg p-3">
                            <p className="text-xs text-text-tertiary mb-1">Deposito Minimo</p>
                            <p className="font-semibold text-text-primary">
                              {typeof broker.minDeposit === 'number' && broker.minDeposit > 0
                                ? `€${broker.minDeposit.toLocaleString()}`
                                : typeof broker.minDeposit === 'string'
                                ? broker.minDeposit
                                : 'Nessun minimo'}
                            </p>
                          </div>
                          <div className="bg-bg-soft rounded-lg p-3">
                            <p className="text-xs text-text-tertiary mb-1">Regime Fiscale</p>
                            <p className="font-semibold text-text-primary">
                              {broker.taxRegime === 'amministrato' ? 'Amministrato' : broker.taxRegime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
                            </p>
                          </div>
                        </div>

                        {/* Instruments Preview */}
                        <div>
                          <p className="text-xs text-text-tertiary mb-2">Strumenti Disponibili</p>
                          <div className="flex flex-wrap gap-2">
                            {broker.instruments.slice(0, 4).map(inst => (
                              <span key={inst} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                                {inst}
                              </span>
                            ))}
                            {broker.instruments.length > 4 && (
                              <span className="px-2 py-1 bg-bg-soft text-text-tertiary rounded text-xs">
                                +{broker.instruments.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Regulatory */}
                        <div>
                          <p className="text-xs text-text-tertiary mb-2">Regolamentazione</p>
                          <div className="flex flex-wrap gap-2">
                            {broker.regulatory.map(reg => (
                              <span key={reg} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium">
                                {reg}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        {broker.affiliateLink && (
                          <a
                            href={broker.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block text-center px-4 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 group"
                            aria-label={`Apri account ${broker.name}`}
                          >
                            Apri Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              'px-6 py-3 rounded-lg border transition-all flex items-center gap-2',
              currentStep === 1
                ? 'bg-bg-soft text-text-tertiary border-border-subtle cursor-not-allowed'
                : 'bg-bg-surface text-text-primary border-border-subtle hover:border-accent/40'
            )}
            aria-label="Passo precedente"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Indietro
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={cn(
              'px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold',
              canProceed()
                ? 'bg-accent hover:bg-accent-hover text-white'
                : 'bg-bg-soft text-text-tertiary cursor-not-allowed'
            )}
            aria-label="Passo successivo"
          >
            {currentStep === 3 ? 'Vedi Risultati' : 'Avanti'}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="flex items-center justify-center pt-4 border-t border-border-subtle">
          <button
            onClick={resetForm}
            className="px-6 py-3 rounded-lg bg-bg-surface text-text-primary border border-border-subtle hover:border-accent/40 transition-all flex items-center gap-2"
            aria-label="Ricomincia il form"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Ricomincia
          </button>
        </div>
      )}

      {/* Drawer Dettagli Broker Premium */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDrawer(null)}
            aria-label="Chiudi dettagli broker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="broker-drawer-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Drawer */}
              <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 border-b border-border-subtle">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-lg bg-white p-3 flex items-center justify-center border border-border-subtle shadow-sm">
                      <Image
                        src={showDrawer.logo}
                        alt={`Logo ${showDrawer.name}`}
                        width={80}
                        height={80}
                        className="object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 id="broker-drawer-title" className="text-2xl font-bold text-text-primary mb-2">{showDrawer.name}</h3>
                      <p className="text-text-secondary mb-3">{showDrawer.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < Math.floor(showDrawer.rating) ? 'text-amber-400 fill-amber-400' : 'text-text-tertiary'
                              )}
                              aria-hidden="true"
                            />
                          ))}
                          <span className="text-sm text-text-tertiary ml-1">({showDrawer.rating})</span>
                        </div>
                        {showDrawer.score && (
                          <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm font-semibold">
                            Score Tradelia AI: {showDrawer.score}/100
                          </span>
                        )}
                        {showDrawer.mifid2Compliant && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold flex items-center gap-1">
                            <Shield className="w-4 h-4" aria-hidden="true" />
                            Conforme MiFID II
                          </span>
                        )}
                        {showDrawer.riskLevel && (
                          <span className={cn(
                            'px-3 py-1 rounded-lg text-sm font-semibold',
                            showDrawer.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                            showDrawer.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            Rischio {showDrawer.riskLevel === 'low' ? 'Basso' : showDrawer.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDrawer(null)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi dettagli"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Body Drawer - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {/* Tradelia AI Review */}
                {showDrawer.review && (
                  <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-accent" aria-hidden="true" />
                      <h4 className="font-bold text-lg text-text-primary">Tradelia AI Review</h4>
                    </div>
                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">{showDrawer.review.summary}</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-bg-surface/50 rounded-lg p-4 border border-accent/10">
                        <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">A chi è rivolto</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.recommendedFor}</p>
                      </div>
                      <div className="bg-bg-surface/50 rounded-lg p-4 border border-accent/10">
                        <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">Integrazione AI</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.aiSupport}</p>
                      </div>
                      <div className="bg-bg-surface/50 rounded-lg p-4 border border-accent/10">
                        <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">Segnale di ricerca</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.researchSignal}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informazioni Tecniche */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" aria-hidden="true" />
                        Regolamentazione
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {showDrawer.regulatory.map(reg => (
                          <span key={reg} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" aria-hidden="true" />
                        Strumenti Disponibili
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {showDrawer.instruments.map(inst => (
                          <span key={inst} className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm">
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-accent" aria-hidden="true" />
                        Piattaforme
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {showDrawer.platforms.map(plat => (
                          <span key={plat} className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm">
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-bg-soft rounded-lg p-4">
                        <p className="text-xs text-text-tertiary mb-1">Deposito Minimo</p>
                        <p className="font-bold text-text-primary">
                          {typeof showDrawer.minDeposit === 'number' 
                            ? `€${showDrawer.minDeposit.toLocaleString()}` 
                            : showDrawer.minDeposit}
                        </p>
                      </div>
                      {showDrawer.leverage !== 'N/A' && (
                        <div className="bg-bg-soft rounded-lg p-4">
                          <p className="text-xs text-text-tertiary mb-1">Leverage</p>
                          <p className="font-bold text-text-primary">{showDrawer.leverage}</p>
                        </div>
                      )}
                      <div className="bg-bg-soft rounded-lg p-4">
                        <p className="text-xs text-text-tertiary mb-1">Spread</p>
                        <p className="font-bold text-text-primary">{showDrawer.spread}</p>
                      </div>
                      <div className="bg-bg-soft rounded-lg p-4">
                        <p className="text-xs text-text-tertiary mb-1">Commissioni</p>
                        <p className="font-bold text-text-primary">{showDrawer.commission}</p>
                      </div>
                    </div>

                    {/* Costi Dettagliati */}
                    {showDrawer.costs && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-accent" aria-hidden="true" />
                          Costi Dettagliati
                        </h4>
                        <div className="bg-bg-soft rounded-lg p-4 space-y-3">
                          {showDrawer.costs.commissionStocks && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Commissioni Azioni:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.commissionStocks}</span>
                            </div>
                          )}
                          {showDrawer.costs.commissionForex && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Commissioni Forex:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.commissionForex}</span>
                            </div>
                          )}
                          {showDrawer.costs.commissionOptions && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Commissioni Opzioni:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.commissionOptions}</span>
                            </div>
                          )}
                          {showDrawer.costs.commissionFutures && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Commissioni Futures:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.commissionFutures}</span>
                            </div>
                          )}
                          {showDrawer.costs.spreadForex && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Spread Forex:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.spreadForex}</span>
                            </div>
                          )}
                          {showDrawer.costs.inactivityFee && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Costo Inattività:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.inactivityFee}</span>
                            </div>
                          )}
                          {showDrawer.costs.withdrawalFee && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Costo Prelievo:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.withdrawalFee}</span>
                            </div>
                          )}
                          {showDrawer.costs.currencyConversionFee && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Costo Cambio Valuta:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.currencyConversionFee}</span>
                            </div>
                          )}
                          {showDrawer.costs.marketDataFee && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-text-tertiary">Costo Dati Mercato:</span>
                              <span className="text-sm font-semibold text-text-primary text-right">{showDrawer.costs.marketDataFee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Protezione Fondi */}
                    {showDrawer.fundProtection && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-400" aria-hidden="true" />
                          Protezione Fondi
                        </h4>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Schema:</strong> {showDrawer.fundProtection.scheme}
                          </p>
                          <p className="text-sm text-text-secondary">
                            <strong>Importo Protetto:</strong> {showDrawer.fundProtection.amount}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Supporto */}
                    {showDrawer.support && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <HeadphonesIcon className="w-4 h-4 text-accent" aria-hidden="true" />
                          Supporto Clienti
                        </h4>
                        <div className="bg-bg-soft rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Lingue Supportate</p>
                            <div className="flex flex-wrap gap-2">
                              {showDrawer.support.languages.map(lang => (
                                <span key={lang} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Orari</p>
                            <p className="text-sm font-semibold text-text-primary">{showDrawer.support.hours}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Canali</p>
                            <div className="flex flex-wrap gap-2">
                              {showDrawer.support.channels.map(channel => (
                                <span key={channel} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                          {showDrawer.support.responseTime && (
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Tempo di Risposta</p>
                              <p className="text-sm font-semibold text-text-primary">{showDrawer.support.responseTime}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metodi di Pagamento */}
                    {showDrawer.payment && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-accent" aria-hidden="true" />
                          Depositi e Prelievi
                        </h4>
                        <div className="bg-bg-soft rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Metodi Deposito</p>
                            <div className="flex flex-wrap gap-2">
                              {showDrawer.payment.depositMethods.map(method => (
                                <span key={method} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                  {method}
                                </span>
                              ))}
                            </div>
                            {showDrawer.payment.depositTime && (
                              <p className="text-xs text-text-tertiary mt-2">Tempo: {showDrawer.payment.depositTime}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-text-tertiary mb-1">Metodi Prelievo</p>
                            <div className="flex flex-wrap gap-2">
                              {showDrawer.payment.withdrawalMethods.map(method => (
                                <span key={method} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                  {method}
                                </span>
                              ))}
                            </div>
                            {showDrawer.payment.withdrawalTime && (
                              <p className="text-xs text-text-tertiary mt-2">Tempo: {showDrawer.payment.withdrawalTime}</p>
                            )}
                            {showDrawer.payment.minWithdrawal && (
                              <p className="text-xs text-text-tertiary mt-1">Minimo: {showDrawer.payment.minWithdrawal}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account Types e Features */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {showDrawer.accountTypes && showDrawer.accountTypes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-text-primary mb-3">Tipi di Account</h4>
                          <div className="flex flex-wrap gap-2">
                            {showDrawer.accountTypes.map(type => (
                              <span key={type} className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3">Caratteristiche</h4>
                        <div className="space-y-2">
                          {showDrawer.demoAccount !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              {showDrawer.demoAccount ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" />
                                  <span className="text-text-secondary">Account Demo Disponibile</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
                                  <span className="text-text-tertiary">Account Demo Non Disponibile</span>
                                </>
                              )}
                            </div>
                          )}
                          {showDrawer.educationalResources !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              {showDrawer.educationalResources ? (
                                <>
                                  <GraduationCap className="w-4 h-4 text-green-400" aria-hidden="true" />
                                  <span className="text-text-secondary">Risorse Educative</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
                                  <span className="text-text-tertiary">Nessuna Risorsa Educativa</span>
                                </>
                              )}
                            </div>
                          )}
                          {showDrawer.mobileAppRating && (
                            <div className="flex items-center gap-2 text-sm">
                              <Smartphone className="w-4 h-4 text-accent" aria-hidden="true" />
                              <span className="text-text-secondary">App Mobile: </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'w-3 h-3',
                                      i < Math.floor(showDrawer.mobileAppRating) ? 'text-amber-400 fill-amber-400' : 'text-text-tertiary'
                                    )}
                                    aria-hidden="true"
                                  />
                                ))}
                                <span className="text-xs text-text-tertiary ml-1">({showDrawer.mobileAppRating})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Link Ufficiali */}
                    {showDrawer.officialLinks && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-accent" aria-hidden="true" />
                          Link Ufficiali
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {showDrawer.officialLinks.website && (
                            <a
                              href={showDrawer.officialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors flex items-center gap-2"
                              aria-label={`Visita il sito ufficiale di ${showDrawer.name}`}
                            >
                              Sito Web
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                          {showDrawer.officialLinks.terms && (
                            <a
                              href={showDrawer.officialLinks.terms}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-bg-soft text-text-primary rounded-lg text-sm font-medium hover:bg-bg-soft/80 transition-colors flex items-center gap-2"
                              aria-label={`Termini e condizioni di ${showDrawer.name}`}
                            >
                              Termini
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                          {showDrawer.officialLinks.kid && (
                            <a
                              href={showDrawer.officialLinks.kid}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-bg-soft text-text-primary rounded-lg text-sm font-medium hover:bg-bg-soft/80 transition-colors flex items-center gap-2"
                              aria-label={`Key Information Document di ${showDrawer.name}`}
                            >
                              KID
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                          {showDrawer.officialLinks.privacy && (
                            <a
                              href={showDrawer.officialLinks.privacy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-bg-soft text-text-primary rounded-lg text-sm font-medium hover:bg-bg-soft/80 transition-colors flex items-center gap-2"
                              aria-label={`Privacy policy di ${showDrawer.name}`}
                            >
                              Privacy
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data Ultimo Aggiornamento */}
                    {showDrawer.lastUpdated && (
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        <span>Ultimo aggiornamento: {new Date(showDrawer.lastUpdated).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" />
                      Vantaggi
                    </h4>
                    <ul className="space-y-2">
                      {showDrawer.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary bg-green-500/5 rounded-lg p-3">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                      Limitazioni
                    </h4>
                    <ul className="space-y-2">
                      {showDrawer.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary bg-amber-500/5 rounded-lg p-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MiFID II Disclosure */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-2 text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary">Avviso Rischio - Conformità MiFID II</p>
                      <p>
                        Il trading comporta rischi significativi. Le perdite possono superare il capitale investito.
                        Questo broker è conforme alla Direttiva MiFID II (2014/65/UE) e alle linee guida ESMA.
                      </p>
                      <p>
                        <strong>Nota:</strong> Prima di aprire un account, assicurati di aver compreso i rischi associati
                        agli strumenti finanziari che intendi tradare. Consulta sempre la documentazione precontrattuale
                        e la Key Information Document (KID) quando disponibile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Drawer */}
              {showDrawer.affiliateLink && (
                <div className="p-6 border-t border-border-subtle bg-bg-soft">
                  <a
                    href={showDrawer.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                    aria-label={`Apri account ${showDrawer.name}`}
                  >
                    Apri Account su {showDrawer.name}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calcolatore Costi */}
      <AnimatePresence>
        {showCostCalculator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCostCalculator(false)}
            aria-label="Chiudi calcolatore costi"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cost-calculator-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-accent" aria-hidden="true" />
                    <h3 id="cost-calculator-title" className="text-xl font-bold text-text-primary">Calcolatore Costi</h3>
                  </div>
                  <button
                    onClick={() => setShowCostCalculator(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi calcolatore"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Confronta i costi totali per diversi scenari di trading
                </p>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">Nota Importante</p>
                      <p>
                        Questo calcolatore fornisce una stima basata sulle commissioni pubbliche. I costi effettivi possono variare
                        in base al volume, al tipo di account e alle condizioni di mercato. Consulta sempre il sito ufficiale del broker
                        per informazioni aggiornate e dettagliate.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-text-primary block mb-2">
                      Scenario di Trading
                    </label>
                    <select className="w-full px-4 py-3 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent">
                      <option>10 ordini/mese - Azioni USA (€1,000 per ordine)</option>
                      <option>20 ordini/mese - Azioni Europee (€500 per ordine)</option>
                      <option>50 ordini/mese - Trading Attivo (€500 per ordine)</option>
                      <option>100 ordini/mese - Trading Professionale (€1,000 per ordine)</option>
                    </select>
                  </div>
                  <div className="bg-bg-soft rounded-lg p-4">
                    <p className="text-sm font-semibold text-text-primary mb-3">Confronto Costi Mensili Stimati</p>
                    <div className="space-y-3">
                      {recommendedBrokers.slice(0, 5).map(broker => {
                        // Calcolo semplificato - in produzione si dovrebbe fare un calcolo più accurato
                        const estimatedCost = broker.costs?.commissionStocks 
                          ? (broker.costs.commissionStocks.includes('€') 
                              ? parseFloat(broker.costs.commissionStocks.match(/€(\d+\.?\d*)/)?.[1] || '0') * 10
                              : broker.costs.commissionStocks.includes('%')
                              ? 1000 * 0.001 * 10 // Stima 0.1% su €1,000 per 10 ordini
                              : 0)
                          : broker.commission.includes('€')
                          ? parseFloat(broker.commission.match(/€(\d+\.?\d*)/)?.[1] || '0') * 10
                          : 0;
                        return (
                          <div key={broker.id} className="flex items-center justify-between p-3 bg-bg-surface rounded-lg border border-border-subtle">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-white p-1 border border-border-subtle">
                                <Image
                                  src={broker.logo}
                                  alt={`Logo ${broker.name}`}
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                  loading="lazy"
                                />
                              </div>
                              <span className="font-semibold text-text-primary">{broker.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">~€{estimatedCost.toFixed(2)}/mese</p>
                              <p className="text-xs text-text-tertiary">Stima per 10 ordini</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                <button
                  onClick={() => setShowCostCalculator(false)}
                  className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-semibold"
                  aria-label="Chiudi calcolatore"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer Affiliate */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Disclaimer - Link Affiliate</p>
            <p>
              Alcuni link presenti in questa pagina sono link di affiliazione. Questo significa che Tradelia può ricevere
              una commissione se apri un account tramite questi link, senza alcun costo aggiuntivo per te. Le nostre
              raccomandazioni sono sempre basate su criteri oggettivi, accademici e conformi a MiFID II, indipendentemente
              da eventuali accordi di affiliazione.
            </p>
            <p>
              <strong>Importante:</strong> Prima di aprire un account con qualsiasi broker, leggi attentamente i termini
              e condizioni, la Key Information Document (KID) quando disponibile, e assicurati di comprendere tutti i rischi
              associati al trading. Il trading comporta rischi significativi e puoi perdere più del capitale investito.
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Ultimo aggiornamento informazioni broker: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
