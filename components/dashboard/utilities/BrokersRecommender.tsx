'use client';

import { useState, useMemo } from 'react';
import { Building2, CheckCircle2, X, Info, BookOpen, TrendingUp, Shield, Globe, Zap, Star, ChevronRight, ChevronLeft, AlertTriangle, FileText, Award, Target, Settings, ArrowRight, Check } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
  spread: string;
  commission: string;
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
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0,
    leverage: 'Variabile',
    spread: 'DMA',
    commission: 'Variabile',
    taxRegime: 'dichiarativo',
    educationLevel: 'advanced',
    pros: [
      'Copertura multi-mercato con DMA reale',
      'API e dati storici completi',
      'Gestione rischio margini trasparente',
      'Accesso a 160+ mercati globali'
    ],
    cons: [
      'Curva di apprendimento ripida (TWS)',
      'Costi dati in tempo reale separati',
      'Più complesso per principianti'
    ],
    rating: 4.8,
    score: 95,
    riskLevel: 'high',
    mifid2Compliant: true,
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
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0,
    leverage: 'Variabile',
    spread: 'Variabile',
    commission: 'Variabile',
    taxRegime: 'amministrato',
    educationLevel: 'intermediate',
    pros: [
      'Regime fiscale amministrato (IT)',
      'Copertura globale azioni/derivati',
      'Piattaforme professionali configurabili',
      'Supporto italiano'
    ],
    cons: [
      'Struttura commissionale articolata',
      'Richiede familiarità con marginazione avanzata'
    ],
    rating: 4.5,
    score: 90,
    riskLevel: 'medium',
    mifid2Compliant: true,
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
    spread: 'Variabile',
    commission: 'Variabile',
    taxRegime: 'amministrato',
    educationLevel: 'beginner',
    pros: [
      'Fiscalità amministrata completamente gestita',
      'Accesso diretto a IDEM e Borsa Italiana',
      'Supporto in lingua italiana',
      'Nessun deposito minimo'
    ],
    cons: [
      'Interfaccia meno moderna rispetto a peer esteri',
      'Costi su mercati esteri da valutare caso per caso'
    ],
    rating: 4.2,
    score: 84,
    riskLevel: 'low',
    mifid2Compliant: true,
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
    spread: 'N/A',
    commission: 'Da €0.99 per ordine',
    taxRegime: 'amministrato',
    educationLevel: 'all',
    pros: [
      'Accesso IPO primarie regolamentato',
      'Piani di accumulo e conto remunerato',
      'Protezione fondi UE (ICF fino a 20k €)',
      'Regime amministrato'
    ],
    cons: [
      'Depositi minimi più elevati per IPO',
      'Costi cambio valuta da gestire'
    ],
    rating: 4.3,
    score: 85,
    riskLevel: 'low',
    mifid2Compliant: true,
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
    spread: 'Variabile',
    commission: 'Bassa',
    taxRegime: 'amministrato',
    educationLevel: 'beginner',
    pros: [
      'Regime amministrato con sostituto d\'imposta',
      'Interessi sulla liquidità e PAC gratuiti',
      'Esperienza mobile-first',
      'IBAN italiano'
    ],
    cons: [
      'Assistenza prevalentemente digitale',
      'Offerta derivati limitata'
    ],
    rating: 4.4,
    score: 88,
    riskLevel: 'low',
    mifid2Compliant: true,
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
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-green-400" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-text-primary">
                    Brokers Consigliati ({recommendedBrokers.length})
                  </h3>
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
    </div>
  );
}
