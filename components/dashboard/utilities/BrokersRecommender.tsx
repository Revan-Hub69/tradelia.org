'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Building2, CheckCircle2, X, Info, BookOpen, TrendingUp, Shield, Globe, Zap, Star, ChevronRight, ChevronLeft, AlertTriangle, FileText, Award, Target, Settings, ArrowRight, Check, DollarSign, CreditCard, HeadphonesIcon, Smartphone, GraduationCap, Calendar, ExternalLink, Calculator, BarChart3, Download, Share2, Brain, Scale, TrendingDown, Activity, Layers, Sparkles, Gauge } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';

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
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'CFD'],
    minDeposit: 10000,
    leverage: 'Fino a 30:1 (retail), fino a 500:1 (professional)',
    spread: 'DMA - Spread di mercato',
    commission: 'Azioni: 0.1% (min €1), Bond: 0.05% (min €5)',
    taxRegime: 'both',
    educationLevel: 'advanced',
    pros: [
      'Copertura obbligazionaria molto ampia',
      'DMA su 50+ mercati quotati',
      'Supporto multi-valuta e tool risk',
      'Accesso globale',
      'Protezione fondi fino a €20,000 (ICF)',
      'API FIX per integrazione istituzionale'
    ],
    cons: [
      'Deposito minimo elevato (€10,000)',
      'Crypto solo via CFD',
      'Piattaforma meno intuitiva per principianti',
      'Costi dati di mercato aggiuntivi'
    ],
    rating: 4.4,
    score: 88,
    riskLevel: 'high',
    mifid2Compliant: true,
    costs: {
      commissionStocks: '0.1% (min €1)',
      commissionForex: 'Spread incluso (da 0.3 pip)',
      commissionOptions: 'Da €1.50 per contratto',
      commissionFutures: 'Da €2.00 per contratto',
      spreadForex: 'Da 0.3 pip (EUR/USD)',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito (1/mese), poi €25',
      currencyConversionFee: 'Spread incluso',
      marketDataFee: 'Gratuito per dati base, premium a pagamento'
    },
    fundProtection: {
      scheme: 'ICF (Investor Compensation Fund)',
      amount: '€20,000'
    },
    support: {
      languages: ['Inglese', 'Russo', 'Cinese', 'Arabo'],
      hours: 'Lun-Ven 24/5 (mercati aperti)',
      channels: ['Telefono', 'Email', 'Chat'],
      responseTime: '< 24h per email, immediato per chat/telefono'
    },
    payment: {
      depositMethods: ['Bonifico', 'Wire Transfer', 'Criptovalute'],
      withdrawalMethods: ['Bonifico', 'Wire Transfer', 'Criptovalute'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-3 giorni lavorativi',
      minWithdrawal: '€100'
    },
    accountTypes: ['Retail', 'Professional', 'Institutional'],
    demoAccount: true,
    educationalResources: true,
    mobileAppRating: 3.8,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://exante.eu',
      terms: 'https://exante.eu/terms',
      privacy: 'https://exante.eu/privacy'
    },
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
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex'],
    minDeposit: 0,
    leverage: 'Fino a 50:1 (retail), fino a 400:1 (professional)',
    spread: 'DMA - Spread di mercato (stesso di IBKR)',
    commission: 'Tiered: 0.005 USD per azione (min $1), Fixed: 0.005 USD per azione (min $1)',
    taxRegime: 'dichiarativo',
    educationLevel: 'intermediate',
    pros: [
      'Accesso TWS con supporto UE',
      'Nessun deposito minimo',
      'Documentazione educativa strutturata',
      'Supporto italiano',
      'Stessa infrastruttura IBKR a costi competitivi',
      'Protezione fondi ICF fino a €20,000'
    ],
    cons: [
      'Dipendenza infrastrutturale da IBKR',
      'Commissioni su opzioni da monitorare',
      'Costi dati di mercato separati (come IBKR)',
      'Supporto limitato rispetto a IBKR diretto'
    ],
    rating: 4.3,
    score: 86,
    riskLevel: 'medium',
    mifid2Compliant: true,
    costs: {
      commissionStocks: 'Tiered: 0.005 USD per azione (min $1), Fixed: 0.005 USD per azione (min $1)',
      commissionForex: '0.08-0.20 pip (EUR/USD)',
      commissionOptions: 'Da $0.70 per contratto',
      commissionFutures: 'Da $0.85 per contratto',
      spreadForex: 'DMA - Spread di mercato',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito (1/mese), poi €10',
      currencyConversionFee: '0.002% (2 bps)',
      marketDataFee: 'Da $4.50/mese per dati real-time (come IBKR)',
      minCommission: '$1 per ordine'
    },
    fundProtection: {
      scheme: 'ICF (Investor Compensation Fund)',
      amount: '€20,000'
    },
    support: {
      languages: ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo'],
      hours: 'Lun-Ven 9:00-18:00 CET',
      channels: ['Telefono', 'Email', 'Chat'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'SEPA', 'Carta'],
      withdrawalMethods: ['Bonifico', 'SEPA'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-3 giorni lavorativi',
      minWithdrawal: '€50'
    },
    accountTypes: ['Retail', 'Professional'],
    demoAccount: true,
    educationalResources: true,
    mobileAppRating: 4.0,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.mexem.com',
      terms: 'https://www.mexem.com/terms',
      privacy: 'https://www.mexem.com/privacy'
    },
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
    platforms: ['Web', 'App iOS/Android'],
    instruments: ['ETF', 'Azioni', 'PAC', 'Bond'],
    minDeposit: 1,
    leverage: 'N/A',
    spread: 'Spread incluso nel prezzo',
    commission: '€0.99 per ordine (fino a €250,000), poi 0.1%',
    taxRegime: 'dichiarativo',
    educationLevel: 'beginner',
    pros: [
      'Costi contenuti e trasparenti',
      'Ampia scelta ETF/PAC automatizzati',
      'Interfaccia intuitiva',
      'Regolamentato BaFin',
      'Protezione fondi fino a €100,000',
      'Nessun costo di inattività',
      'PAC gratuiti'
    ],
    cons: [
      'Copertura mercati concentrata su Europa',
      'Limitate funzioni avanzate per derivati',
      'Spread non trasparente (incluso nel prezzo)',
      'Limitato a investimenti passivi'
    ],
    rating: 4.2,
    score: 83,
    riskLevel: 'low',
    mifid2Compliant: true,
    costs: {
      commissionStocks: '€0.99 per ordine (fino a €250,000), poi 0.1%',
      inactivityFee: 'Nessun costo di inattività',
      withdrawalFee: 'Gratuito',
      currencyConversionFee: 'Spread incluso nel prezzo',
      minCommission: '€0.99 per ordine'
    },
    fundProtection: {
      scheme: 'Einlagensicherungsfonds',
      amount: '€100,000'
    },
    support: {
      languages: ['Tedesco', 'Inglese', 'Italiano', 'Francese', 'Spagnolo'],
      hours: 'Lun-Ven 9:00-18:00 CET',
      channels: ['Email', 'Chat', 'Telefono'],
      responseTime: '< 24h'
    },
    payment: {
      depositMethods: ['Bonifico', 'SEPA', 'Carta'],
      withdrawalMethods: ['Bonifico', 'SEPA'],
      depositTime: '1-2 giorni lavorativi',
      withdrawalTime: '1-2 giorni lavorativi',
      minWithdrawal: '€1'
    },
    accountTypes: ['Retail'],
    demoAccount: false,
    educationalResources: true,
    mobileAppRating: 4.4,
    lastUpdated: '2025-01-27',
    officialLinks: {
      website: 'https://www.scalable.capital',
      terms: 'https://www.scalable.capital/terms',
      privacy: 'https://www.scalable.capital/privacy'
    },
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
  monthlyVolume?: number | ''; // Volume mensile in €
  supportLanguage?: string[]; // Lingue preferite per supporto
  supportChannels?: string[]; // Canali preferiti (Email, Chat, Telefono)
}

// Semplificato: solo 2 step essenziali
const STEPS = [
  { id: 1, title: 'Preferenze', icon: Target },
  { id: 2, title: 'Risultati', icon: Award },
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
    monthlyVolume: '',
    supportLanguage: [],
    supportChannels: [],
  });
  const [showDrawer, setShowDrawer] = useState<Broker | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [showRegulatoryCheck, setShowRegulatoryCheck] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(false);

  const availableInstruments = ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'Crypto', 'Commodities', 'Indici', 'CFD', 'IDEM', 'IPO', 'PAC'];
  const availablePlatforms = ['Web', 'Mobile', 'Desktop', 'MT4', 'MT5', 'cTrader', 'TWS', 'Client Portal', 'SaxoTraderGO', 'SaxoTraderPRO', 'Directa Platform', 'dLite', 'TradingView', 'OpenAPI', 'API FIX/REST'];

  // Logica di filtraggio meno restrittiva - Publisher approach: informativo, non consulenziale
  // Mostra tutti i broker di default, i filtri sono suggerimenti, non requisiti obbligatori
  const recommendedBrokers = useMemo(() => {
    // Se non ci sono filtri selezionati, mostra tutti i broker
    const hasFilters = formData.taxRegime || formData.experience || formData.instruments.length > 0 || 
                      formData.platforms.length > 0 || formData.minDeposit || formData.leverage ||
                      (formData.supportLanguage && formData.supportLanguage.length > 0) ||
                      (formData.supportChannels && formData.supportChannels.length > 0);
    
    if (!hasFilters) {
      return availableBrokers.sort((a, b) => (b.score || b.rating * 20) - (a.score || a.rating * 20));
    }

    // Sistema di scoring invece di filtri binari - più flessibile
    return availableBrokers.map(broker => {
      let score = broker.score || broker.rating * 20;
      let matchCount = 0;
      let totalCriteria = 0;

      // Regime fiscale - match perfetto aumenta score
      if (formData.taxRegime && formData.taxRegime !== 'both') {
        totalCriteria++;
        if (formData.taxRegime === 'amministrato' && (broker.taxRegime === 'amministrato' || broker.taxRegime === 'both')) {
          score += 10;
          matchCount++;
        } else if (formData.taxRegime === 'dichiarativo' && (broker.taxRegime === 'dichiarativo' || broker.taxRegime === 'both')) {
          score += 10;
          matchCount++;
        }
      }

      // Esperienza - match perfetto aumenta score
      if (formData.experience) {
        totalCriteria++;
        if (broker.educationLevel === formData.experience || broker.educationLevel === 'all') {
          score += 10;
          matchCount++;
        }
      }

      // Strumenti - ogni match aumenta score
      if (formData.instruments.length > 0) {
        totalCriteria++;
        const matchingInstruments = formData.instruments.filter(inst => broker.instruments.includes(inst)).length;
        if (matchingInstruments > 0) {
          score += matchingInstruments * 5;
          matchCount++;
        }
      }

      // Piattaforme - ogni match aumenta score
      if (formData.platforms.length > 0) {
        totalCriteria++;
        const matchingPlatforms = formData.platforms.filter(plat => 
          broker.platforms.some(bp => bp.toLowerCase().includes(plat.toLowerCase()) || plat.toLowerCase().includes(bp.toLowerCase()))
        ).length;
        if (matchingPlatforms > 0) {
          score += matchingPlatforms * 5;
          matchCount++;
        }
      }

      // Deposito minimo - match aumenta score
      if (formData.minDeposit && typeof formData.minDeposit === 'number') {
        totalCriteria++;
        const brokerMin = typeof broker.minDeposit === 'number' ? broker.minDeposit : 0;
        if (brokerMin <= formData.minDeposit) {
          score += 5;
          matchCount++;
        }
      }

      // Leverage - match aumenta score
      if (formData.leverage) {
        totalCriteria++;
        if (broker.leverage !== 'N/A') {
          if (formData.leverage === 'low' && broker.leverage.includes('30:1')) {
            score += 5;
            matchCount++;
          } else if (formData.leverage === 'medium' && (broker.leverage.includes('50:1') || broker.leverage.includes('100:1'))) {
            score += 5;
            matchCount++;
          } else if (formData.leverage === 'high' && broker.leverage.includes('400:1')) {
            score += 5;
            matchCount++;
          }
        } else if (formData.leverage === 'low') {
          score += 5;
          matchCount++;
        }
      }

      // Supporto lingua - match aumenta score
      if (formData.supportLanguage && formData.supportLanguage.length > 0 && broker.support) {
        totalCriteria++;
        const hasLanguage = formData.supportLanguage.some(lang => 
          broker.support!.languages.some(bLang => 
            bLang.toLowerCase().includes(lang.toLowerCase()) || 
            lang.toLowerCase().includes(bLang.toLowerCase())
          )
        );
        if (hasLanguage) {
          score += 5;
          matchCount++;
        }
      }

      // Canali supporto - match aumenta score
      if (formData.supportChannels && formData.supportChannels.length > 0 && broker.support) {
        totalCriteria++;
        const hasChannel = formData.supportChannels.some(channel => 
          broker.support!.channels.some(bChannel => 
            bChannel.toLowerCase().includes(channel.toLowerCase()) || 
            channel.toLowerCase().includes(bChannel.toLowerCase())
          )
        );
        if (hasChannel) {
          score += 5;
          matchCount++;
        }
      }

      return { broker, score, matchCount, totalCriteria };
    })
    .filter(item => item.matchCount > 0 || !hasFilters) // Mostra solo se ha almeno un match O se non ci sono filtri
    .sort((a, b) => b.score - a.score)
    .map(item => item.broker);
  }, [formData]);

  // Analisi Matching Avanzata: Scoring basato su criteri oggettivi e normativi
  const getAIMatchingExplanation = useCallback((broker: Broker) => {
    if (!broker) {
      return { aiScore: 0, explanations: [], totalScore: 0 };
    }

    const explanations: string[] = [];
    let aiScore = 0;

    // Analisi regime fiscale
    if (formData.taxRegime && formData.taxRegime !== 'both') {
      if (broker.taxRegime === formData.taxRegime || broker.taxRegime === 'both') {
        aiScore += 15;
        explanations.push(
          `✓ Regime fiscale ${formData.taxRegime === 'amministrato' ? 'amministrato' : 'dichiarativo'} compatibile. ` +
          `Secondo la normativa italiana (D.Lgs. 239/1996), il regime amministrato semplifica la dichiarazione dei redditi ` +
          `trasferendo l'onere fiscale al broker, mentre il dichiarativo offre maggiore controllo ma richiede competenze contabili.`
        );
      }
    }

    // Analisi esperienza vs strumenti disponibili
    if (formData.experience && broker.educationLevel) {
      const levelMatch = broker.educationLevel === formData.experience || broker.educationLevel === 'all';
      if (levelMatch) {
        aiScore += 12;
        explanations.push(
          `✓ Livello di esperienza allineato. ` +
          `Secondo il framework MiFID II (Art. 25), i broker devono valutare l'adeguatezza degli strumenti rispetto ` +
          `all'esperienza del cliente. Questo broker offre strumenti appropriati per il tuo livello.`
        );
      }
    }

    // Analisi copertura strumenti
    if (formData.instruments.length > 0) {
      const coverage = (formData.instruments.filter(i => broker.instruments.includes(i)).length / formData.instruments.length) * 100;
      if (coverage >= 80) {
        aiScore += 20;
        explanations.push(
          `✓ Copertura strumenti ${coverage.toFixed(0)}%. ` +
          `La diversificazione del portafoglio (Markowitz, 1952) richiede accesso a più asset class. ` +
          `Questo broker offre la maggior parte degli strumenti richiesti, riducendo il rischio di concentrazione.`
        );
      } else if (coverage >= 50) {
        aiScore += 10;
        explanations.push(
          `⚠ Copertura strumenti ${coverage.toFixed(0)}%. ` +
          `Potresti dover utilizzare broker multipli per completare la strategia di investimento.`
        );
      }
    }

    // Analisi piattaforme e tecnologia
    if (formData.platforms.length > 0) {
      const platformMatch = formData.platforms.some(p => 
        broker.platforms.some(bp => bp.toLowerCase().includes(p.toLowerCase()))
      );
      if (platformMatch) {
        aiScore += 10;
        explanations.push(
          `✓ Piattaforme compatibili. ` +
          `L'accesso a piattaforme professionali (es. MT5, TWS) migliora l'efficienza operativa ` +
          `e riduce i tempi di esecuzione, fattore critico secondo la letteratura HFT (High-Frequency Trading).`
        );
      }
    }

    // Analisi conformità regolatoria
    if (broker.mifid2Compliant) {
      aiScore += 15;
      explanations.push(
        `✓ Conformità MiFID II verificata. ` +
        `La Direttiva 2014/65/UE garantisce protezione del cliente, trasparenza dei costi e adeguatezza degli strumenti. ` +
        `Questo broker rispetta gli standard europei di vigilanza.`
      );
    }

    // Analisi protezione fondi
    if (broker.fundProtection) {
      aiScore += 10;
      explanations.push(
        `✓ Protezione fondi: ${broker.fundProtection.scheme} fino a ${broker.fundProtection.amount}. ` +
        `Secondo ESMA, i fondi dei clienti retail devono essere segregati e protetti da schemi di compensazione. ` +
        `Questo broker offre protezione conforme alle normative UE.`
      );
    }

    // Analisi costi vs volume
    if (formData.monthlyVolume && typeof formData.monthlyVolume === 'number') {
      const volume = formData.monthlyVolume;
      if (volume > 50000) {
        aiScore += 8;
        explanations.push(
          `✓ Volume elevato rilevato. ` +
          `Per volumi superiori a €50k/mese, i broker con commissioni fisse o strutture tiered ` +
          `possono offrire vantaggi economici significativi rispetto a commissioni percentuali.`
        );
      }
    }

    return { aiScore, explanations, totalScore: aiScore + (broker.score || broker.rating * 20) };
  }, [formData]);

  // Regulatory Compliance Checker
  const getRegulatoryCompliance = useCallback((broker: Broker) => {
    if (!broker) {
      return [];
    }

    const checks: Array<{ regulation: string; status: 'compliant' | 'partial' | 'non-compliant'; details: string }> = [];

    // MiFID II Compliance
    if (broker.mifid2Compliant) {
      checks.push({
        regulation: 'MiFID II (2014/65/UE)',
        status: 'compliant',
        details: 'Conforme alla Direttiva sui Mercati degli Strumenti Finanziari. Garantisce trasparenza costi, adeguatezza e protezione clienti retail.'
      });
    } else {
      checks.push({
        regulation: 'MiFID II (2014/65/UE)',
        status: 'partial',
        details: 'Verifica manuale richiesta. Alcuni broker extra-UE possono operare tramite passaporting o accordi bilaterali.'
      });
    }

    // ESMA Leverage Limits
    if (broker.leverage.includes('30:1') || broker.leverage.includes('50:1')) {
      checks.push({
        regulation: 'ESMA Leverage Limits',
        status: 'compliant',
        details: 'Rispetta i limiti di leverage per clienti retail: 30:1 per major forex, 5:1 per crypto (Regolamento ESMA 2018/1636).'
      });
    }

    // Fund Protection
    if (broker.fundProtection) {
      const schemes = ['ICF', 'FSCS', 'SIPC', 'ASIC'];
      const hasEUProtection = schemes.some(s => broker.fundProtection!.scheme.includes(s));
      checks.push({
        regulation: 'Protezione Fondi Clienti',
        status: hasEUProtection ? 'compliant' : 'partial',
        details: `Schema ${broker.fundProtection.scheme} fino a ${broker.fundProtection.amount}. ` +
          `Conforme alla Direttiva 97/9/CE per la compensazione degli investitori.`
      });
    }

    // Regulatory Bodies
    const euRegulators = ['FCA', 'CONSOB', 'CSSF', 'BaFin', 'AMF', 'CNMV'];
    const hasEURegulator = broker.regulatory.some(r => euRegulators.some(eu => r.includes(eu)));
    checks.push({
      regulation: 'Vigilanza Regolatoria UE',
      status: hasEURegulator ? 'compliant' : 'partial',
      details: `Regolamentato da: ${broker.regulatory.join(', ')}. ` +
        `${hasEURegulator ? 'Vigilanza diretta da autorità UE.' : 'Vigilanza extra-UE, verifica accordi bilaterali.'}`
    });

    return checks;
  }, []);

  // Risk Assessment Calculator
  const getRiskAssessment = useCallback((broker: Broker) => {
    if (!broker) {
      return { riskScore: 0, factors: [], overallRisk: 'medium' as const };
    }

    let riskScore = 0;
    const factors: Array<{ factor: string; impact: 'low' | 'medium' | 'high'; explanation: string }> = [];

    // Leverage Risk
    if (broker.leverage && (broker.leverage.includes('400:1') || broker.leverage.includes('500:1'))) {
      riskScore += 30;
      factors.push({
        factor: 'Leverage Elevato',
        impact: 'high',
        explanation: 'Leverage superiore a 100:1 aumenta significativamente il rischio di perdite. Secondo ESMA, il leverage massimo per retail è limitato a 30:1 per major forex.'
      });
    } else if (broker.leverage && (broker.leverage.includes('30:1') || broker.leverage.includes('50:1'))) {
      riskScore += 10;
      factors.push({
        factor: 'Leverage Moderato',
        impact: 'low',
        explanation: 'Leverage conforme ai limiti ESMA per clienti retail. Riduce il rischio di margin call e perdite eccessive.'
      });
    }

    // Regulatory Risk
    const euRegulators = ['FCA', 'CONSOB', 'CSSF', 'BaFin'];
    const hasEURegulator = broker.regulatory.some(r => euRegulators.some(eu => r.includes(eu)));
    if (!hasEURegulator) {
      riskScore += 20;
      factors.push({
        factor: 'Vigilanza Extra-UE',
        impact: 'medium',
        explanation: 'Broker regolamentato fuori UE. Verifica accordi bilaterali e protezione fondi equivalente.'
      });
    } else {
      factors.push({
        factor: 'Vigilanza UE',
        impact: 'low',
        explanation: 'Regolamentato da autorità UE. Maggiore protezione e trasparenza conforme a MiFID II.'
      });
    }

    // Fund Protection
    if (!broker.fundProtection || (() => {
      try {
        const amount = parseFloat(broker.fundProtection.amount.replace(/[^\d.]/g, ''));
        return isNaN(amount) || amount < 20000;
      } catch {
        return true; // Se errore nel parsing, considera non protetto
      }
    })()) {
      riskScore += 15;
      factors.push({
        factor: 'Protezione Fondi Limitata',
        impact: 'medium',
        explanation: 'Protezione fondi inferiore a €20,000 o non specificata. Valuta il rischio di default del broker.'
      });
    } else {
      factors.push({
        factor: 'Protezione Fondi Adeguata',
        impact: 'low',
        explanation: `Protezione fino a ${broker.fundProtection.amount} tramite schema ${broker.fundProtection.scheme}.`
      });
    }

    // Instruments Risk
    const highRiskInstruments = ['CFD', 'Forex', 'Crypto', 'Futures'];
    const hasHighRisk = highRiskInstruments.some(inst => broker.instruments.includes(inst));
    if (hasHighRisk) {
      riskScore += 15;
      factors.push({
        factor: 'Strumenti ad Alto Rischio',
        impact: 'high',
        explanation: 'Offre strumenti derivati (CFD, Forex) che comportano rischio elevato. Le perdite possono superare il capitale investito.'
      });
    }

    const overallRisk: 'low' | 'medium' | 'high' = riskScore < 30 ? 'low' : riskScore < 50 ? 'medium' : 'high';

    return { riskScore, factors, overallRisk };
  }, []);


  // Export/Share Functionality with error handling
  const handleExportReport = useCallback(() => {
    try {
      if (!recommendedBrokers || recommendedBrokers.length === 0) {
        throw new Error('Nessun broker disponibile per l\'esportazione');
      }

      const reportData = {
        date: new Date().toISOString(),
        userProfile: formData,
        brokers: recommendedBrokers.slice(0, 5).map(broker => ({
          name: broker.name || 'N/A',
          score: broker.score || broker.rating * 20 || 0,
          regulatory: broker.regulatory || [],
          instruments: broker.instruments || [],
          platforms: broker.platforms || [],
          costs: broker.costs || null,
          riskLevel: broker.riskLevel || 'medium',
          mifid2Compliant: broker.mifid2Compliant || false,
        })),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradelia-broker-comparison-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore durante l\'esportazione del report:', error);
      alert('Si è verificato un errore durante l\'esportazione. Riprova più tardi.');
    }
  }, [formData, recommendedBrokers]);

  const handleShareReport = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Confronto Broker Tradelia',
          text: `Ho analizzato ${recommendedBrokers.length} broker su Tradelia. Scopri quale fa per te!`,
          url: window.location.href,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback: copia link
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      } else {
        // Fallback finale: mostra link
        prompt('Copia questo link:', window.location.href);
      }
    } catch (err) {
      // User cancelled share or error occurred
      if ((err as Error).name !== 'AbortError') {
        console.error('Errore durante la condivisione:', err);
        // Fallback silenzioso - non mostrare errore se l'utente ha annullato
      }
    }
  }, [recommendedBrokers.length]);

  const canProceed = useMemo(() => {
    // Step 1: almeno regime fiscale o esperienza (opzionali, ma meglio avere qualcosa)
    if (currentStep === 1) return true; // Tutto opzionale per approccio publisher
    return false;
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const resetForm = useCallback(() => {
    setFormData({
      taxRegime: '',
      experience: '',
      instruments: [],
      platforms: [],
      minDeposit: '',
      leverage: '',
      monthlyVolume: '',
      supportLanguage: [],
      supportChannels: [],
    });
    setCurrentStep(1);
  }, []);

  const handleInstrumentToggle = useCallback((instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument],
    }));
  }, []);

  const handlePlatformToggle = useCallback((platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  }, []);

  const handleTaxRegimeSelect = useCallback((regime: 'amministrato' | 'dichiarativo' | 'both') => {
    setFormData(prev => ({ ...prev, taxRegime: regime }));
  }, []);

  const handleExperienceSelect = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    setFormData(prev => ({ ...prev, experience: level }));
  }, []);

  const handleLeverageSelect = useCallback((lev: 'low' | 'medium' | 'high') => {
    setFormData(prev => ({ ...prev, leverage: lev }));
  }, []);

  const handleMinDepositChange = useCallback((value: string) => {
    // Validazione input: solo numeri positivi, max €1M
    const numValue = value === '' ? '' : Number(value);
    if (numValue === '' || (typeof numValue === 'number' && numValue >= 0 && numValue <= 1000000)) {
      setFormData(prev => ({ ...prev, minDeposit: numValue }));
    }
  }, []);

  const handleShowDrawer = useCallback((broker: Broker | null) => {
    setShowDrawer(broker);
  }, []);

  const handleCompareToggle = useCallback(() => {
    setCompareMode(prev => !prev);
  }, []);

  const handleCostCalculatorToggle = useCallback(() => {
    setShowCostCalculator(prev => !prev);
  }, []);

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
              {t('utilities.brokers.title') || 'Brokers Disponibili'}
            </h2>
            <p className="text-text-secondary mb-3">
              {t('utilities.brokers.description') || 'Strumento informativo per confrontare broker regolamentati. Utilizza i filtri per trovare opzioni che corrispondono alle tue preferenze.'}
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-text-primary mb-1">Disclaimer Publisher</p>
                  <p>
                    Tradelia è un publisher informativo, non un consulente finanziario. Le informazioni fornite sono a scopo educativo e informativo.
                    La selezione di un broker è una decisione personale che richiede valutazione autonoma. Verifica sempre le informazioni ufficiali
                    sul sito del broker e consulta un consulente finanziario autorizzato se necessario.
                  </p>
                </div>
              </div>
            </div>
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
                <p className={cn('text-xs mt-2 font-medium underline-selection', isActive ? 'active text-text-primary' : isCompleted ? 'text-green-400' : 'text-text-tertiary')}>
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
            <div className="bg-bg-surface border-premium shadow-premium rounded-xl p-6 md:p-8 space-y-6 container-mobile">
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
                  <div className="info-box info-box-accent">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                    {(['amministrato', 'dichiarativo', 'both'] as const).map(regime => (
                      <button
                        key={regime}
                        onClick={() => handleTaxRegimeSelect(regime)}
                        className={cn(
                          'p-4 rounded-lg border-premium shadow-premium interaction-smooth text-left underline-selection',
                          formData.taxRegime === regime
                            ? 'bg-bg-soft border-border-strong text-text-primary active shadow-premium-hover'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-border-strong'
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => handleExperienceSelect(level)}
                        className={cn(
                          'p-4 rounded-lg border-premium shadow-premium interaction-smooth text-left underline-selection',
                          formData.experience === level
                            ? 'bg-bg-soft border-border-strong text-text-primary active shadow-premium-hover'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-border-strong'
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
              
              {/* Sezione 2: Strumenti - Inline */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-text-primary block mb-3">
                  Strumenti di Interesse (Opzionale)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 spacing-mobile">
                  {availableInstruments.map(instrument => {
                    const isSelected = formData.instruments.includes(instrument);
                    return (
                      <button
                        key={instrument}
                        onClick={() => handleInstrumentToggle(instrument)}
                        className={cn(
                          'p-3 rounded-lg border-premium shadow-premium interaction-smooth text-sm underline-selection',
                          isSelected
                            ? 'bg-bg-soft border-border-strong text-text-primary active font-semibold shadow-premium-hover'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-border-strong'
                        )}
                        aria-pressed={isSelected}
                      >
                        {instrument}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sezione 3: Piattaforme - Inline */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-text-primary block mb-3">
                  Piattaforme Preferite (Opzionale)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 spacing-mobile">
                  {availablePlatforms.map(platform => {
                    const isSelected = formData.platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => handlePlatformToggle(platform)}
                        className={cn(
                          'p-3 rounded-lg border-premium shadow-premium interaction-smooth text-sm underline-selection',
                          isSelected
                            ? 'bg-bg-soft border-border-strong text-text-primary active font-semibold shadow-premium-hover'
                            : 'bg-bg-soft border-border-subtle text-text-secondary hover:border-border-strong'
                        )}
                        aria-pressed={isSelected}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-400" aria-hidden="true" />
                    <h3 className="text-xl font-bold text-text-primary">
                      Brokers Consigliati ({recommendedBrokers.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCostCalculatorToggle}
                      className="btn-action btn-action-primary"
                      aria-label="Confronto costi pubblici"
                    >
                      <Calculator className="w-4 h-4" aria-hidden="true" />
                      Confronto Costi
                    </button>
                    <button
                      onClick={() => setShowAIMatching(true)}
                      className="btn-action btn-action-secondary"
                      aria-label="Analisi AI Matching"
                    >
                      <Brain className="w-4 h-4" aria-hidden="true" />
                      Analisi Matching
                    </button>
                    <button
                      onClick={() => setShowRegulatoryCheck(true)}
                      className="btn-action btn-action-info"
                      aria-label="Verifica Conformità Regolatoria"
                    >
                      <Shield className="w-4 h-4" aria-hidden="true" />
                      Conformità
                    </button>
                    <button
                      onClick={() => setShowRiskAssessment(true)}
                      className="btn-action btn-action-danger"
                      aria-label="Valutazione Rischio"
                    >
                      <Gauge className="w-4 h-4" aria-hidden="true" />
                      Rischio
                    </button>
                    {recommendedBrokers.length > 1 && (
                      <>
                        <button
                          onClick={handleCompareToggle}
                          className={cn(
                            'px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium interaction-smooth',
                            compareMode
                              ? 'bg-accent text-white hover:bg-accent-hover'
                              : 'bg-bg-soft text-text-primary hover:bg-bg-soft/80'
                          )}
                          aria-label={compareMode ? 'Esci dalla modalità comparazione' : 'Attiva modalità comparazione'}
                        >
                          <BarChart3 className="w-4 h-4" aria-hidden="true" />
                          {compareMode ? 'Esci Comparazione' : 'Confronta'}
                        </button>
                        <button
                          onClick={() => setShowComparisonMatrix(true)}
                          className="btn-action btn-action-indigo"
                          aria-label="Matrice Confronto"
                        >
                          <Layers className="w-4 h-4" aria-hidden="true" />
                          Matrice
                        </button>
                      </>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={handleExportReport}
                        className="btn-action"
                        aria-label="Esporta report"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Esporta
                      </button>
                      <button
                        onClick={handleShareReport}
                        className="btn-action"
                        aria-label="Condividi report"
                      >
                        <Share2 className="w-4 h-4" aria-hidden="true" />
                        Condividi
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary">
                  Broker disponibili {recommendedBrokers.length > 0 && `(${recommendedBrokers.length} trovati)`}
                </p>
              </div>

              {recommendedBrokers.length === 0 ? (
                <div className="bg-bg-soft border-premium shadow-premium rounded-xl p-6 md:p-8 text-center card-mobile">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-text-secondary mb-2 font-semibold">
                    Nessun broker corrisponde esattamente ai criteri selezionati
                  </p>
                  <p className="text-sm text-text-tertiary mb-4">
                    Prova a modificare le preferenze o ricomincia per vedere tutti i broker disponibili
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        resetForm();
                        setCurrentStep(1);
                      }}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors interaction-smooth"
                      aria-label="Ricomincia il form"
                    >
                      Mostra Tutti i Broker
                    </button>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 bg-bg-soft hover:bg-bg-elevated border-premium shadow-premium text-text-primary rounded-lg transition-colors interaction-smooth"
                      aria-label="Torna indietro"
                    >
                      Modifica Criteri
                    </button>
                  </div>
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
                                  onClick={() => handleShowDrawer(broker)}
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
                      className="bg-bg-surface border-premium shadow-premium rounded-xl overflow-hidden hover:border-border-strong shadow-premium-hover interaction-smooth group card-mobile"
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
                                  <span className="badge-accent">
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
                            onClick={() => handleShowDrawer(broker)}
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
                              <span key={inst} className="badge-accent">
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
      {currentStep < 5 && (
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
            disabled={!canProceed}
            className={cn(
              'px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-semibold',
              canProceed
                ? 'bg-accent hover:bg-accent-hover text-white'
                : 'bg-bg-soft text-text-tertiary cursor-not-allowed'
            )}
            aria-label="Passo successivo"
          >
            Vedi Risultati
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {currentStep === 5 && (
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
                          <span className="badge-accent">
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
                    onClick={() => handleShowDrawer(null)}
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

                {/* Academic Research & Regulatory References */}
                <div className="gradient-cyan border border-cyan-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-cyan-300" aria-hidden="true" />
                    <h4 className="font-bold text-lg text-text-primary">Riferimenti Accademici e Regolatori</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-bg-surface/50 rounded-lg p-4 border border-cyan-500/20">
                      <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">Normative di Riferimento</p>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>Direttiva MiFID II (2014/65/UE):</strong> Mercati degli Strumenti Finanziari - Protezione investitori, trasparenza costi, adeguatezza
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>Regolamento ESMA 2018/1636:</strong> Limitazioni leverage per clienti retail (30:1 major forex, 5:1 crypto)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>Direttiva 97/9/CE:</strong> Sistemi di compensazione investitori (ICF, FSCS, SIPC)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>CONSOB:</strong> Regolamentazione italiana mercati finanziari e protezione risparmiatori
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-bg-surface/50 rounded-lg p-4 border border-cyan-500/20">
                      <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">Framework Teorici</p>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>Markowitz (1952):</strong> Modern Portfolio Theory - Diversificazione riduce rischio non sistematico
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>MiFID II Art. 25:</strong> Adeguatezza e appropriatezza strumenti finanziari rispetto al profilo cliente
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            <strong>ESMA Guidelines 2024:</strong> AI Explainability in Financial Services - Trasparenza algoritmi
                          </span>
                        </li>
                      </ul>
                    </div>
                    {showDrawer.review?.researchSignal && (
                      <div className="bg-bg-surface/50 rounded-lg p-4 border border-cyan-500/20">
                        <p className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wide">Riferimenti Specifici Broker</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.researchSignal}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                          <span key={inst} className="badge-accent">
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
                          <span key={plat} className="badge-accent">
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
                                <span key={lang} className="badge-accent">
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
                                <span key={channel} className="badge-accent">
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
                                <span key={method} className="badge-success">
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
                                <span key={method} className="badge-info">
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
                              <span key={type} className="badge-accent">
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
                                      i < Math.floor(showDrawer.mobileAppRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-text-tertiary'
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
                              className="btn-action btn-action-primary"
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
            onClick={handleCostCalculatorToggle}
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
                    <h3 id="cost-calculator-title" className="text-xl font-bold text-text-primary">Confronto Costi Pubblici</h3>
                  </div>
                  <button
                    onClick={handleCostCalculatorToggle}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi confronto costi"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Confronto delle commissioni e costi dichiarati pubblicamente dai broker
                </p>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">Confronto Costi Pubblici - Informazioni Dichiarate</p>
                      <p>
                        Questo strumento mostra le <strong>commissioni e costi dichiarati pubblicamente</strong> dai broker.
                        I dati sono basati sulle informazioni disponibili sui siti ufficiali e possono variare in base a:
                        volume di trading, tipo di account, condizioni di mercato e negoziazioni individuali.
                      </p>
                      <p className="mt-2">
                        <strong>⚠️ Importante:</strong> I costi effettivi possono differire significativamente. 
                        Consulta sempre il sito ufficiale del broker e le condizioni contrattuali per informazioni aggiornate e precise.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                    <div className="text-center py-8 text-text-secondary">
                      Nessun broker disponibile per il confronto costi
                    </div>
                  ) : (
                    recommendedBrokers.slice(0, 5).map(broker => {
                      if (!broker) return null;
                      return (
                        <div key={broker.id} className="bg-bg-soft border-premium rounded-xl p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white p-2 border border-border-subtle">
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
                              <h4 className="font-bold text-lg text-text-primary">{broker.name}</h4>
                              <p className="text-sm text-text-secondary">{broker.description}</p>
                            </div>
                          </div>
                          
                          {broker.costs && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {broker.costs.commissionStocks && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Commissioni Azioni</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.commissionStocks}</p>
                                </div>
                              )}
                              {broker.costs.commissionForex && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Commissioni Forex</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.commissionForex}</p>
                                </div>
                              )}
                              {broker.costs.spreadForex && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Spread Forex Tipico</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.spreadForex}</p>
                                </div>
                              )}
                              {broker.costs.inactivityFee && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Commissione Inattività</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.inactivityFee}</p>
                                </div>
                              )}
                              {broker.costs.withdrawalFee && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Commissione Prelievo</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.withdrawalFee}</p>
                                </div>
                              )}
                              {broker.costs.currencyConversionFee && (
                                <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
                                  <p className="text-xs font-semibold text-text-tertiary mb-1 uppercase">Conversione Valutaria</p>
                                  <p className="text-sm font-semibold text-text-primary">{broker.costs.currencyConversionFee}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!broker.costs && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                              <p className="text-sm text-text-secondary">
                                Informazioni sui costi non disponibili. Consulta il sito ufficiale del broker per dettagli aggiornati.
                              </p>
                            </div>
                          )}
                          
                          {broker.officialLinks?.website && (
                            <a
                              href={broker.officialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium"
                            >
                              Consulta costi aggiornati sul sito ufficiale
                              <ExternalLink className="w-4 h-4" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      );
                    }).filter(Boolean)
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                  <button
                    onClick={handleCostCalculatorToggle}
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

      {/* AI-Powered Smart Matching */}
      <AnimatePresence>
        {showAIMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAIMatching(false)}
            aria-label="Chiudi AI Matching"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-matching-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border-premium shadow-premium rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-purple-400" aria-hidden="true" />
                    <h3 id="ai-matching-title" className="text-xl font-bold text-text-primary">Analisi Matching Avanzata</h3>
                  </div>
                  <button
                    onClick={() => setShowAIMatching(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi analisi matching"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Analisi basata su criteri oggettivi e framework normativi (MiFID II, ESMA, CONSOB)
                </p>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Nessun broker disponibile per l'analisi AI</p>
                  </div>
                ) : (
                  recommendedBrokers.slice(0, 5).map(broker => {
                    if (!broker) return null;
                    const { aiScore, explanations, totalScore } = getAIMatchingExplanation(broker);
                    return (
                      <div key={broker.id} className="bg-bg-soft border-premium rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white p-2 border border-border-subtle">
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
                            <h4 className="font-bold text-lg text-text-primary">{broker.name}</h4>
                            <p className="text-sm text-text-secondary">Score AI: {aiScore}/100</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-400">{totalScore}</p>
                          <p className="text-xs text-text-tertiary">Score Totale</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {explanations.map((explanation, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-text-secondary bg-bg-surface rounded-lg p-3">
                            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <p>{explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    );
                  }).filter(Boolean)
                )}
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                <button
                  onClick={() => setShowAIMatching(false)}
                  className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regulatory Compliance Checker */}
      <AnimatePresence>
        {showRegulatoryCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegulatoryCheck(false)}
            aria-label="Chiudi verifica conformità"
            role="dialog"
            aria-modal="true"
            aria-labelledby="regulatory-check-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border-premium shadow-premium rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle gradient-cyan">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-cyan-300" aria-hidden="true" />
                    <h3 id="regulatory-check-title" className="text-xl font-bold text-text-primary">Verifica Conformità Regolatoria</h3>
                  </div>
                  <button
                    onClick={() => setShowRegulatoryCheck(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi verifica"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Analisi conformità MiFID II, ESMA, CONSOB e normative internazionali
                </p>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Nessun broker disponibile per la verifica conformità</p>
                  </div>
                ) : (
                  recommendedBrokers.slice(0, 5).map(broker => {
                    if (!broker) return null;
                    const compliance = getRegulatoryCompliance(broker);
                    return (
                    <div key={broker.id} className="bg-bg-soft border-premium rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white p-2 border border-border-subtle">
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
                          <h4 className="font-bold text-lg text-text-primary">{broker.name}</h4>
                          <p className="text-sm text-text-secondary">Regolamentato da: {broker.regulatory.join(', ')}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {compliance.map((check, idx) => (
                          <div key={idx} className={cn(
                            "flex items-start gap-3 p-3 rounded-lg",
                            check.status === 'compliant' ? 'bg-green-500/10 border border-green-500/20' :
                            check.status === 'partial' ? 'bg-amber-500/10 border border-amber-500/20' :
                            'bg-red-500/10 border border-red-500/20'
                          )}>
                            {check.status === 'compliant' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            ) : check.status === 'partial' ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-text-primary">{check.regulation}</p>
                              <p className="text-sm text-text-secondary mt-1">{check.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  }).filter(Boolean)
                )}
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                <div className="info-box info-box-accent">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-sm text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">Riferimenti Normativi</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Direttiva MiFID II (2014/65/UE) - Mercati degli Strumenti Finanziari</li>
                        <li>Regolamento ESMA 2018/1636 - Limitazioni Leverage Retail</li>
                        <li>Direttiva 97/9/CE - Compensazione Investitori</li>
                        <li>CONSOB - Regolamentazione Italiana Mercati Finanziari</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegulatoryCheck(false)}
                  className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Assessment */}
      <AnimatePresence>
        {showRiskAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRiskAssessment(false)}
            aria-label="Chiudi valutazione rischio"
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-assessment-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border-premium shadow-premium rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gauge className="w-6 h-6 text-red-400" aria-hidden="true" />
                    <h3 id="risk-assessment-title" className="text-xl font-bold text-text-primary">Valutazione Rischio Personalizzata</h3>
                  </div>
                  <button
                    onClick={() => setShowRiskAssessment(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi valutazione"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Analisi rischio basata su profilo investitore, leverage, conformità e protezione fondi
                </p>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">Nessun broker disponibile per la valutazione rischio</p>
                  </div>
                ) : (
                  recommendedBrokers.slice(0, 5).map(broker => {
                    if (!broker) return null;
                    const risk = getRiskAssessment(broker);
                    return (
                    <div key={broker.id} className="bg-bg-soft border-premium rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white p-2 border border-border-subtle">
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
                            <h4 className="font-bold text-lg text-text-primary">{broker.name}</h4>
                            <p className="text-sm text-text-secondary">Score Rischio: {risk.riskScore}/100</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-lg font-semibold",
                          risk.overallRisk === 'low' ? 'bg-green-500/20 text-green-400' :
                          risk.overallRisk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          {risk.overallRisk === 'low' ? 'Rischio Basso' :
                           risk.overallRisk === 'medium' ? 'Rischio Medio' :
                           'Rischio Alto'}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {risk.factors.map((factor, idx) => (
                          <div key={idx} className={cn(
                            "flex items-start gap-3 p-3 rounded-lg",
                            factor.impact === 'low' ? 'bg-green-500/10 border border-green-500/20' :
                            factor.impact === 'medium' ? 'bg-amber-500/10 border border-amber-500/20' :
                            'bg-red-500/10 border border-red-500/20'
                          )}>
                            {factor.impact === 'low' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            ) : factor.impact === 'medium' ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-text-primary">{factor.factor}</p>
                              <p className="text-sm text-text-secondary mt-1">{factor.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  }).filter(Boolean)
                )}
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                <button
                  onClick={() => setShowRiskAssessment(false)}
                  className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Visual Comparison Matrix */}
      <AnimatePresence>
        {showComparisonMatrix && recommendedBrokers.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComparisonMatrix(false)}
            aria-label="Chiudi matrice confronto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comparison-matrix-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-bg-surface border-premium shadow-premium rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border-subtle bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-indigo-400" aria-hidden="true" />
                    <h3 id="comparison-matrix-title" className="text-xl font-bold text-text-primary">Matrice Confronto Avanzata</h3>
                  </div>
                  <button
                    onClick={() => setShowComparisonMatrix(false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors p-2 hover:bg-bg-soft rounded-lg"
                    aria-label="Chiudi matrice"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Confronto visivo multi-dimensionale dei broker selezionati
                </p>
              </div>
              <div className="overflow-x-auto flex-1 p-6">
                <div className="min-w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left p-3 font-semibold text-text-primary sticky left-0 bg-bg-surface z-10">Criterio</th>
                        {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                          <th className="text-center p-3 font-semibold text-text-primary min-w-[200px]">
                            Nessun broker disponibile
                          </th>
                        ) : (
                          recommendedBrokers.slice(0, 5).map(broker => (
                            broker ? (
                          <th key={broker.id} className="text-center p-3 font-semibold text-text-primary min-w-[200px]">
                            <div className="flex flex-col items-center gap-2">
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
                              <span className="text-xs">{broker.name}</span>
                            </div>
                          </th>
                            ) : null
                          )).filter(Boolean)
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Score Tradelia AI</td>
                        {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                          <td className="text-center p-3 text-text-secondary">-</td>
                        ) : (
                          recommendedBrokers.slice(0, 5).map(broker => (
                            broker ? (
                              <td key={broker.id} className="text-center p-3">
                                <span className="font-bold text-accent">{broker.score || broker.rating * 20 || 0}</span>
                              </td>
                            ) : null
                          )).filter(Boolean)
                        )}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Conformità MiFID II</td>
                        {(!recommendedBrokers || recommendedBrokers.length === 0) ? (
                          <td className="text-center p-3">-</td>
                        ) : (
                          recommendedBrokers.slice(0, 5).map(broker => (
                            broker ? (
                              <td key={broker.id} className="text-center p-3">
                                {broker.mifid2Compliant ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" aria-hidden="true" />
                                ) : (
                                  <X className="w-5 h-5 text-red-400 mx-auto" aria-hidden="true" />
                                )}
                              </td>
                            ) : null
                          )).filter(Boolean)
                        )}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Regime Fiscale</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {broker.taxRegime === 'amministrato' ? 'Amministrato' :
                             broker.taxRegime === 'dichiarativo' ? 'Dichiarativo' :
                             'Entrambi'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Protezione Fondi</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {broker.fundProtection ? `${broker.fundProtection.scheme} - ${broker.fundProtection.amount}` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Strumenti Disponibili</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {broker.instruments.length}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Piattaforme</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {broker.platforms.length}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border-subtle">
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Deposito Minimo</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {typeof broker.minDeposit === 'number' ? `€${broker.minDeposit}` : broker.minDeposit}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-text-primary sticky left-0 bg-bg-surface z-10">Leverage</td>
                        {recommendedBrokers.slice(0, 5).map(broker => (
                          <td key={broker.id} className="text-center p-3 text-sm text-text-secondary">
                            {broker.leverage}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 border-t border-border-subtle bg-bg-soft">
                <button
                  onClick={() => setShowComparisonMatrix(false)}
                  className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer Publisher e Affiliate */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Disclaimer Publisher e Link Affiliate</p>
            <p>
              <strong>Tradelia è un publisher informativo, non un consulente finanziario.</strong> Le informazioni fornite
              in questo strumento sono a scopo educativo e informativo. Non costituiscono consulenza finanziaria, raccomandazione
              di investimento o sollecitazione all'acquisto/vendita di strumenti finanziari.
            </p>
            <p>
              Alcuni link presenti sono link di affiliazione. Tradelia può ricevere una commissione se apri un account
              tramite questi link, senza alcun costo aggiuntivo per te. Le informazioni sono sempre basate su criteri
              oggettivi e conformi a MiFID II, indipendentemente da eventuali accordi di affiliazione.
            </p>
            <p>
              <strong>Importante:</strong> La selezione di un broker è una decisione personale che richiede valutazione autonoma.
              Prima di aprire un account, leggi attentamente i termini e condizioni, la Key Information Document (KID) quando
              disponibile, e consulta un consulente finanziario autorizzato se necessario. Il trading comporta rischi significativi
              e puoi perdere più del capitale investito.
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
