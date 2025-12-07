'use client';

import { useState, useMemo } from 'react';
import { Building2, HelpCircle, CheckCircle2, X, Info, BookOpen, TrendingUp, Shield, Globe, Zap, Star } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ContextualHelp } from '@/components/dashboard/ContextualHelp';

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
}

// Lista broker corretta e affidabile dalla pagina brokers esistente
const availableBrokers: Broker[] = [
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo IBKR se disponibile
    description: 'Accesso DMA a 160+ mercati globali con Toolset Trader Workstation, Client Portal e API istituzionali.',
    regulatory: ['SEC', 'CFTC', 'FCA', 'CSSF', 'ASIC'],
    platforms: ['TWS', 'Client Portal', 'IBKR Mobile', 'API FIX/REST'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0, // Nessun minimo formale
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
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo BG Saxo se disponibile
    description: 'Succursale italiana del gruppo Saxo Bank con regime amministrato e piattaforme SaxoTraderGO/PRO.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    platforms: ['SaxoTraderGO', 'SaxoTraderPRO', 'OpenAPI'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0, // Variabile in base al profilo
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
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo Directa se disponibile
    description: 'Broker italiano storico con focus su Borsa Italiana e mercati USA/Europa, documentazione trasparente.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    platforms: ['Directa Platform', 'dLite', 'TradingView integrazione'],
    instruments: ['Azioni', 'ETF', 'Bond', 'IDEM'],
    minDeposit: 0, // Nessun minimo dichiarato
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
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo MEXEM se disponibile
    description: 'Introducing broker europeo su infrastruttura IBKR con supporto dedicato UE e materiale formativo certificato.',
    regulatory: ['CySEC', 'FCA'],
    platforms: ['Trader Workstation', 'Client Portal', 'App'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures'],
    minDeposit: 0, // Nessun minimo
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
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo Scalable Capital se disponibile
    description: 'Piattaforma europea focalizzata su ETF, PAC automatizzati e servizi di risparmio regolamentati.',
    regulatory: ['BaFin', 'CONSOB passporting'],
    platforms: ['Web', 'App'],
    instruments: ['ETF', 'Azioni', 'PAC'],
    minDeposit: 1, // Da pochi euro (PAC)
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
    logo: '/logos/tradelia-logo.svg', // TODO: Aggiungere logo Trade Republic se disponibile
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
  educationLevel: 'beginner' | 'intermediate' | 'advanced' | 'all' | '';
  instruments: string[];
  platforms: string[];
  minDeposit: number | '';
  leverage: 'low' | 'medium' | 'high' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
}

export function BrokersRecommender() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState<FormData>({
    taxRegime: '',
    educationLevel: '',
    instruments: [],
    platforms: [],
    minDeposit: '',
    leverage: '',
    experience: '',
  });
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<Broker | null>(null);

  const availableInstruments = ['Forex', 'Azioni', 'Crypto', 'ETF', 'Commodities', 'Indici', 'CFD', 'Bond', 'Derivati', 'Opzioni', 'Futures', 'IDEM', 'IPO', 'PAC'];
  const availablePlatforms = ['Web', 'Mobile', 'Desktop', 'MT4', 'MT5', 'cTrader', 'Proprietaria', 'TWS', 'Client Portal', 'SaxoTraderGO', 'SaxoTraderPRO', 'Directa Platform', 'dLite', 'TradingView', 'OpenAPI', 'API FIX/REST'];

  // Filtra broker in base alle preferenze
  const recommendedBrokers = useMemo(() => {
    return availableBrokers.filter(broker => {
      // Filtro regime fiscale
      if (formData.taxRegime && formData.taxRegime !== 'both') {
        if (formData.taxRegime === 'amministrato' && broker.taxRegime !== 'amministrato' && broker.taxRegime !== 'both') {
          return false;
        }
        if (formData.taxRegime === 'dichiarativo' && broker.taxRegime !== 'dichiarativo' && broker.taxRegime !== 'both') {
          return false;
        }
      }

      // Filtro livello educativo
      if (formData.educationLevel && formData.educationLevel !== 'all') {
        if (broker.educationLevel !== formData.educationLevel && broker.educationLevel !== 'all') {
          return false;
        }
      }

      // Filtro strumenti
      if (formData.instruments.length > 0) {
        const hasInstruments = formData.instruments.some(inst => broker.instruments.includes(inst));
        if (!hasInstruments) return false;
      }

      // Filtro piattaforme
      if (formData.platforms.length > 0) {
        const hasPlatforms = formData.platforms.some(plat => broker.platforms.some(bp => bp.includes(plat) || plat.includes(bp)));
        if (!hasPlatforms) return false;
      }

      // Filtro deposito minimo
      if (formData.minDeposit && typeof formData.minDeposit === 'number') {
        const brokerMin = typeof broker.minDeposit === 'number' ? broker.minDeposit : 0;
        if (brokerMin > formData.minDeposit) return false;
      }

      // Filtro leverage
      if (formData.leverage) {
        const leverageMap = {
          low: 30,
          medium: 200,
          high: 500,
        };
        if (broker.leverage === 'N/A' || broker.leverage === 'Variabile') {
          // Se leverage è N/A o Variabile, includi solo se non è richiesto specifico
          if (formData.leverage !== 'low') return true; // Accetta per medium/high
        } else {
          const maxLeverage = parseInt(broker.leverage.replace(/[^0-9]/g, ''));
          if (formData.leverage === 'low' && maxLeverage > leverageMap.low) return false;
          if (formData.leverage === 'medium' && (maxLeverage < leverageMap.low || maxLeverage > leverageMap.medium)) return false;
          if (formData.leverage === 'high' && maxLeverage < leverageMap.medium) return false;
        }
      }

      return true;
    }).sort((a, b) => (b.score || b.rating * 20) - (a.score || a.rating * 20));
  }, [formData]);

  const toggleInstrument = (instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument],
    }));
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-accent" aria-hidden="true" />
          {t('utilities.brokers.title') || 'Brokers Consigliati'}
        </h2>
        <p className="text-text-secondary">
          {t('utilities.brokers.description') || 'Trova il broker ideale per le tue esigenze con il nostro form intelligente'}
        </p>
      </div>

      {/* Form Intelligente */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
        {/* Regime Fiscale */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-text-primary">
              {t('utilities.brokers.taxRegime') || 'Regime Fiscale'}
            </label>
            <ContextualHelp
              content={
                <div className="space-y-2">
                  <p className="font-semibold">Regime Amministrato:</p>
                  <p className="text-sm">Il broker trattiene le tasse automaticamente. Non devi dichiarare nulla nel 730/Unico. Ideale per principianti.</p>
                  <p className="font-semibold mt-3">Regime Dichiarativo:</p>
                  <p className="text-sm">Devi dichiarare i guadagni/perdite nel 730/Unico. Più controllo ma più responsabilità. Ideale per trader esperti.</p>
                </div>
              }
              aria-label="Spiegazione regime fiscale"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {(['amministrato', 'dichiarativo', 'both'] as const).map(regime => (
              <button
                key={regime}
                onClick={() => setFormData(prev => ({ ...prev, taxRegime: regime }))}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                  formData.taxRegime === regime
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                )}
                aria-label={`Seleziona regime ${regime}`}
                aria-pressed={formData.taxRegime === regime}
              >
                {regime === 'amministrato' ? 'Amministrato' : regime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
              </button>
            ))}
          </div>
        </div>

        {/* Livello Tecnico */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-text-primary">
              {t('utilities.brokers.experience') || 'Livello Tecnico'}
            </label>
            <ContextualHelp
              content="Scegli il tuo livello di esperienza nel trading. I broker beginner-friendly offrono più supporto e formazione."
              aria-label="Spiegazione livello tecnico"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
              <button
                key={level}
                onClick={() => setFormData(prev => ({ ...prev, experience: level, educationLevel: level }))}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                  formData.experience === level
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                )}
                aria-label={`Seleziona livello ${level}`}
                aria-pressed={formData.experience === level}
              >
                {level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : 'Avanzato'}
              </button>
            ))}
          </div>
        </div>

        {/* Strumenti Disponibili */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-text-primary">
              {t('utilities.brokers.instruments') || 'Strumenti Disponibili'}
            </label>
            <ContextualHelp
              content="Seleziona gli strumenti finanziari che vuoi tradare. Puoi selezionare più opzioni."
              aria-label="Spiegazione strumenti disponibili"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {availableInstruments.map(instrument => (
              <button
                key={instrument}
                onClick={() => toggleInstrument(instrument)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border transition-all text-sm',
                  formData.instruments.includes(instrument)
                    ? 'bg-accent/20 text-accent border-accent'
                    : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                )}
                aria-label={`${formData.instruments.includes(instrument) ? 'Deseleziona' : 'Seleziona'} ${instrument}`}
                aria-pressed={formData.instruments.includes(instrument)}
              >
                {instrument}
              </button>
            ))}
          </div>
        </div>

        {/* Piattaforme Disponibili */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-semibold text-text-primary">
              {t('utilities.brokers.platforms') || 'Piattaforme Disponibili'}
            </label>
            <ContextualHelp
              content="Seleziona le piattaforme che preferisci usare. MT4/MT5 sono le più popolari per trading avanzato."
              aria-label="Spiegazione piattaforme"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border transition-all text-sm',
                  formData.platforms.includes(platform)
                    ? 'bg-accent/20 text-accent border-accent'
                    : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                )}
                aria-label={`${formData.platforms.includes(platform) ? 'Deseleziona' : 'Seleziona'} ${platform}`}
                aria-pressed={formData.platforms.includes(platform)}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Deposito Minimo */}
        <div>
          <label className="text-sm font-semibold text-text-primary block mb-2">
            {t('utilities.brokers.minDeposit') || 'Deposito Minimo (€)'}
          </label>
          <input
            type="number"
            value={formData.minDeposit}
            onChange={(e) => setFormData(prev => ({ ...prev, minDeposit: e.target.value ? Number(e.target.value) : '' }))}
            placeholder="Es: 100"
            className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
            aria-label="Inserisci deposito minimo desiderato in euro"
          />
        </div>

        {/* Leverage */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-semibold text-text-primary">
              {t('utilities.brokers.leverage') || 'Leverage Desiderato'}
            </label>
            <ContextualHelp
              content="Il leverage moltiplica i tuoi investimenti ma aumenta anche il rischio. Scegli in base alla tua tolleranza al rischio."
              aria-label="Spiegazione leverage"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {(['low', 'medium', 'high'] as const).map(lev => (
              <button
                key={lev}
                onClick={() => setFormData(prev => ({ ...prev, leverage: lev }))}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                  formData.leverage === lev
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-soft text-text-secondary border-border-subtle hover:border-accent/40'
                )}
                aria-label={`Seleziona leverage ${lev}`}
                aria-pressed={formData.leverage === lev}
              >
                {lev === 'low' ? 'Basso (fino a 30:1)' : lev === 'medium' ? 'Medio (fino a 200:1)' : 'Alto (fino a 500:1)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risultati */}
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          {t('utilities.brokers.results') || 'Brokers Consigliati'} ({recommendedBrokers.length})
        </h3>
        {recommendedBrokers.length === 0 ? (
          <div className="bg-bg-soft border border-border-subtle rounded-xl p-8 text-center">
            <p className="text-text-secondary">
              {t('utilities.brokers.noResults') || 'Nessun broker trovato con i criteri selezionati. Prova a modificare i filtri.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedBrokers.map(broker => (
              <motion.div
                key={broker.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all"
                role="article"
                aria-label={`Broker ${broker.name}, rating ${broker.rating}, score ${broker.score || 'N/A'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center border border-border-subtle">
                      <Image
                        src={broker.logo}
                        alt={`Logo ${broker.name}`}
                        width={64}
                        height={64}
                        className="object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{broker.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
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
                        {broker.score && (
                          <span className="text-xs text-accent ml-2 font-medium">Score: {broker.score}/100</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDrawer(broker)}
                    className="text-accent hover:text-accent-hover transition-colors"
                    aria-label={`Dettagli ${broker.name}`}
                  >
                    <Info className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary mb-4">{broker.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {typeof broker.minDeposit === 'number' && broker.minDeposit > 0 ? (
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                      Min: €{broker.minDeposit}
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                      Min: {typeof broker.minDeposit === 'string' ? broker.minDeposit : 'Nessun minimo'}
                    </span>
                  )}
                  {broker.leverage !== 'N/A' && (
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                      {broker.leverage}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                    {broker.taxRegime === 'amministrato' ? 'Amministrato' : broker.taxRegime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
                  </span>
                </div>
                {broker.affiliateLink && (
                  <a
                    href={broker.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium"
                    aria-label={`Apri account ${broker.name}`}
                  >
                    Apri Account
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Dettagli Broker */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDrawer(null)}
            aria-label="Chiudi dettagli broker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="broker-drawer-title"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg bg-white p-3 flex items-center justify-center border border-border-subtle">
                    <Image
                      src={showDrawer.logo}
                      alt={`Logo ${showDrawer.name}`}
                      width={80}
                      height={80}
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 id="broker-drawer-title" className="text-2xl font-bold text-text-primary">{showDrawer.name}</h3>
                    <p className="text-text-secondary">{showDrawer.description}</p>
                    {showDrawer.score && (
                      <p className="text-sm text-accent mt-1 font-medium">Score Tradelia AI: {showDrawer.score}/100</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawer(null)}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                  aria-label="Chiudi dettagli"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Regolamentazione</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDrawer.regulatory.map(reg => (
                      <span key={reg} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Strumenti Disponibili</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDrawer.instruments.map(inst => (
                      <span key={inst} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Piattaforme</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDrawer.platforms.map(plat => (
                      <span key={plat} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                        {plat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-tertiary">Deposito Minimo</p>
                    <p className="font-semibold text-text-primary">
                      {typeof showDrawer.minDeposit === 'number' 
                        ? `€${showDrawer.minDeposit}` 
                        : showDrawer.minDeposit}
                    </p>
                  </div>
                  {showDrawer.leverage !== 'N/A' && (
                    <div>
                      <p className="text-sm text-text-tertiary">Leverage</p>
                      <p className="font-semibold text-text-primary">{showDrawer.leverage}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-text-tertiary">Spread</p>
                    <p className="font-semibold text-text-primary">{showDrawer.spread}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Commissioni</p>
                    <p className="font-semibold text-text-primary">{showDrawer.commission}</p>
                  </div>
                </div>

                {showDrawer.review && (
                  <div className="space-y-3 pt-4 border-t border-border-subtle">
                    <h4 className="font-semibold text-text-primary">Tradelia AI Review</h4>
                    <p className="text-sm text-text-secondary">{showDrawer.review.summary}</p>
                    <div className="space-y-2">
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs font-semibold text-accent mb-1">A chi è rivolto</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.recommendedFor}</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs font-semibold text-accent mb-1">Integrazione AI</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.aiSupport}</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs font-semibold text-accent mb-1">Segnale di ricerca</p>
                        <p className="text-sm text-text-secondary">{showDrawer.review.researchSignal}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Vantaggi</h4>
                  <ul className="space-y-1">
                    {showDrawer.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Limitazioni</h4>
                  <ul className="space-y-1">
                    {showDrawer.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
