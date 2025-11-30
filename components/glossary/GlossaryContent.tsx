'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

// Dati del glossario - in futuro possiamo spostarli su Supabase
const glossaryTerms: GlossaryTerm[] = [
  {
    id: '1',
    term: 'MiFID II',
    definition: 'Markets in Financial Instruments Directive II - Direttiva europea che regola i mercati degli strumenti finanziari, migliorando la trasparenza e la protezione degli investitori.',
    category: 'Regolamentazione',
    relatedTerms: ['Compliance', 'Best Execution'],
  },
  {
    id: '2',
    term: 'Best Execution',
    definition: "Obbligo per gli intermediari finanziari di eseguire gli ordini dei clienti alle migliori condizioni possibili, considerando prezzo, costi, velocità e probabilità di esecuzione.",
    category: 'Regolamentazione',
    relatedTerms: ['MiFID II', 'Compliance'],
  },
  {
    id: '3',
    term: 'Compliance',
    definition: "Conformità alle norme, regolamenti e politiche applicabili. In ambito finanziario, garantisce che le attività rispettino le normative come MiFID II.",
    category: 'Regolamentazione',
    relatedTerms: ['MiFID II', 'Best Execution'],
  },
  {
    id: '4',
    term: 'Asset Allocation',
    definition: "Strategia di investimento che distribuisce il capitale tra diverse classi di attività (azioni, obbligazioni, liquidità, ecc.) per bilanciare rischio e rendimento.",
    category: 'Investimenti',
    relatedTerms: ['Diversificazione', 'Portfolio'],
  },
  {
    id: '5',
    term: 'Diversificazione',
    definition: "Strategia di riduzione del rischio investendo in una varietà di asset diversi, settori o aree geografiche per limitare l'impatto di perdite su singoli investimenti.",
    category: 'Investimenti',
    relatedTerms: ['Asset Allocation', 'Portfolio'],
  },
  {
    id: '6',
    term: 'Portfolio',
    definition: "Insieme di investimenti detenuti da un individuo o istituzione, comprendente azioni, obbligazioni, derivati e altri strumenti finanziari.",
    category: 'Investimenti',
    relatedTerms: ['Asset Allocation', 'Diversificazione'],
  },
  {
    id: '7',
    term: 'ROI',
    definition: "Return on Investment - Metrica che misura la redditività di un investimento, calcolata come (Guadagno - Costo) / Costo × 100.",
    category: 'Metriche',
    relatedTerms: ['Rendimento', 'Performance'],
  },
  {
    id: '8',
    term: 'Volatilità',
    definition: "Misura statistica della variazione dei rendimenti di un asset nel tempo. Una maggiore volatilità indica maggiore incertezza e rischio.",
    category: 'Metriche',
    relatedTerms: ['Rischio', 'Beta'],
  },
  {
    id: '9',
    term: 'Beta',
    definition: "Coefficiente che misura la sensibilità di un asset ai movimenti del mercato. Un beta di 1 indica che l'asset si muove in linea con il mercato.",
    category: 'Metriche',
    relatedTerms: ['Volatilità', 'Rischio'],
  },
  {
    id: '10',
    term: 'Framework',
    definition: "Struttura concettuale o metodologia utilizzata per organizzare e guidare lo sviluppo di processi, analisi o sistemi. In Tradelia, framework verificabili per analisi finanziarie.",
    category: 'Metodologia',
    relatedTerms: ['Metodologia', 'Standard'],
  },
];

const categories = ['Tutti', ...Array.from(new Set(glossaryTerms.map(t => t.category)))];

export function GlossaryContent() {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tutti' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleTerm = (id: string) => {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {t('glossary.title') || 'Glossario'}
              </h1>
              <p className="text-text-secondary mt-1">
                {t('glossary.subtitle') || 'Definizioni e termini finanziari'}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder={t('glossary.searchPlaceholder') || 'Cerca un termine...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-bg-soft border border-border-subtle text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-accent text-white'
                    : 'bg-bg-soft text-text-secondary hover:bg-bg-surface border border-border-subtle'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('glossary.noResults') || 'Nessun termine trovato'}</p>
            </div>
          ) : (
            filteredTerms.map((term, index) => {
              const isExpanded = expandedTerms.has(term.id);
              return (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
                >
                  <button
                    onClick={() => toggleTerm(term.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-bg-soft transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{term.term}</h3>
                        <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-xs text-accent">
                          {term.category}
                        </span>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                          >
                            <p className="text-sm text-text-secondary leading-relaxed mb-3">
                              {term.definition}
                            </p>
                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div>
                                <p className="text-xs text-text-tertiary mb-1">
                                  {t('glossary.relatedTerms') || 'Termini correlati'}:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {term.relatedTerms.map(related => (
                                    <span
                                      key={related}
                                      className="px-2 py-1 bg-bg-soft border border-border-subtle rounded text-xs text-text-secondary"
                                    >
                                      {related}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-tertiary" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-tertiary" />
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-border-subtle">
          <p className="text-sm text-text-tertiary text-center">
            {t('glossary.stats') || `${glossaryTerms.length} termini disponibili`}
          </p>
        </div>
      </div>
    </div>
  );
}

