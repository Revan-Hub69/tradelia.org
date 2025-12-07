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
  minDeposit: number;
  leverage: string;
  spread: string;
  commission: string;
  taxRegime: 'amministrato' | 'dichiarativo' | 'both';
  educationLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  pros: string[];
  cons: string[];
  rating: number;
  affiliateLink?: string;
}

// TODO: Aggiornare con lista broker corretta e affidabile dalla pagina brokers esistente
// ATTENZIONE: La lista attuale è vecchia e non corretta. 
// Deve essere sostituita con i broker affidabili dalla pagina brokers esistente.
// Per ora lasciamo array vuoto - da popolare con i broker corretti
const availableBrokers: Broker[] = [];

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
  const { t, locale } = useTranslations();
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

  const availableInstruments = ['Forex', 'Azioni', 'Crypto', 'ETF', 'Commodities', 'Indici', 'CFD', 'Bond', 'Derivati'];
  const availablePlatforms = ['Web', 'Mobile', 'Desktop', 'MT4', 'MT5', 'cTrader', 'Proprietaria'];

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
        const hasPlatforms = formData.platforms.some(plat => broker.platforms.includes(plat));
        if (!hasPlatforms) return false;
      }

      // Filtro deposito minimo
      if (formData.minDeposit && typeof formData.minDeposit === 'number') {
        if (broker.minDeposit > formData.minDeposit) return false;
      }

      // Filtro leverage
      if (formData.leverage) {
        const leverageMap = {
          low: 30,
          medium: 200,
          high: 500,
        };
        const maxLeverage = parseInt(broker.leverage.replace(/[^0-9]/g, ''));
        if (formData.leverage === 'low' && maxLeverage > leverageMap.low) return false;
        if (formData.leverage === 'medium' && (maxLeverage < leverageMap.low || maxLeverage > leverageMap.medium)) return false;
        if (formData.leverage === 'high' && maxLeverage < leverageMap.medium) return false;
      }

      return true;
    }).sort((a, b) => b.rating - a.rating);
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
                aria-label={`Broker ${broker.name}, rating ${broker.rating}`}
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
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                    Min: €{broker.minDeposit}
                  </span>
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                    {broker.leverage}
                  </span>
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
                    <p className="font-semibold text-text-primary">€{showDrawer.minDeposit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Leverage</p>
                    <p className="font-semibold text-text-primary">{showDrawer.leverage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Spread</p>
                    <p className="font-semibold text-text-primary">{showDrawer.spread}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Commissioni</p>
                    <p className="font-semibold text-text-primary">{showDrawer.commission}</p>
                  </div>
                </div>

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
                  <h4 className="font-semibold text-text-primary mb-2">Svantaggi</h4>
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
