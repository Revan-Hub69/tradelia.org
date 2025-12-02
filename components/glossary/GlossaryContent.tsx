'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Filter, X, Sparkles, GraduationCap, FileText, ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGlossaryTerms, type GlossaryTerm } from '@/lib/glossary/terms';
import { getGlossaryCategories, getGlossaryTags, type GlossaryCategory } from '@/lib/glossary/categories';

/**
 * Glossary Content Component
 * Best Practice Design & UX:
 * - Academic-grade typography and spacing
 * - Clear visual hierarchy
 * - Accessible search and filters
 * - Smooth animations
 * - Responsive design
 * - Print-friendly layout
 * - WCAG 2.1 AA compliant
 */
export function GlossaryContent() {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [glossaryData, setGlossaryData] = useState<Record<string, GlossaryTerm>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load glossary data
  useEffect(() => {
    loadGlossaryTerms().then((data) => {
      setGlossaryData(data);
      setLoading(false);
    });
  }, []);

  const categories = getGlossaryCategories();
  const allTags = getGlossaryTags();
  const terms = Object.entries(glossaryData).map(([key, term]) => ({ key, ...term }));

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      const matchesSearch =
        term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.what.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.how.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.technical?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => term.tags?.includes(tag as any));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchTerm, selectedCategory, selectedTags, terms]);

  const toggleTerm = (key: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento glossario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header - Academic Design */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-accent-hover to-indigo-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary mb-2 tracking-tight">
                {t('glossary.title') || 'Glossario Finanziario'}
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
                {t('glossary.subtitle') || 
                  'Definizioni accademiche, spiegazioni tecniche e applicazioni pratiche dei termini finanziari utilizzati in Tradelia'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{terms.length} termini disponibili</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>{categories.length} categorie</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Fonti accademiche verificate</span>
            </div>
          </div>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder={t('glossary.searchPlaceholder') || 'Cerca un termine, definizione o concetto...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-bg-surface border-2 border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all text-base"
              aria-label="Cerca nel glossario"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-bg-soft text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Cancella ricerca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters - Collapsible */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtri</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4 overflow-hidden"
              >
                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        selectedCategory === 'all'
                          ? 'bg-accent text-white shadow-md'
                          : 'bg-bg-soft text-text-secondary hover:bg-bg-surface border border-border-subtle'
                      )}
                    >
                      Tutte
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          selectedCategory === category
                            ? 'bg-accent text-white shadow-md'
                            : 'bg-bg-soft text-text-secondary hover:bg-bg-surface border border-border-subtle'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Tag
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                            selectedTags.includes(tag)
                              ? 'bg-accent text-white border-accent shadow-sm'
                              : 'bg-bg-soft text-text-secondary border-border-subtle hover:bg-bg-surface'
                          )}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="mt-2 text-xs text-accent hover:text-accent-hover"
                      >
                        Rimuovi tutti i tag
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-text-tertiary">
          {filteredTerms.length === 0 ? (
            <span>Nessun termine trovato</span>
          ) : (
            <span>
              {filteredTerms.length} {filteredTerms.length === 1 ? 'termine trovato' : 'termini trovati'}
            </span>
          )}
        </div>

        {/* Terms List - Academic Card Design */}
        <div className="space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-16 bg-bg-soft rounded-2xl border border-border-subtle">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" />
              <p className="text-lg font-semibold text-text-secondary mb-2">
                {t('glossary.noResults') || 'Nessun termine trovato'}
              </p>
              <p className="text-sm text-text-tertiary">
                Prova a modificare i filtri o la ricerca
              </p>
            </div>
          ) : (
            filteredTerms.map((term, index) => {
              const isExpanded = expandedTerms.has(term.key);
              return (
                <motion.div
                  key={term.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-bg-surface border-2 border-border-subtle rounded-2xl overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all"
                >
                  <button
                    onClick={() => toggleTerm(term.key)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-bg-soft/50 transition-colors group"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                          {term.title}
                        </h3>
                        {term.category && (
                          <span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-lg text-xs font-semibold text-accent whitespace-nowrap flex-shrink-0">
                            {term.category}
                          </span>
                        )}
                      </div>

                      {/* Preview */}
                      {!isExpanded && (
                        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                          {term.what}
                        </p>
                      )}

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4"
                          >
                            {/* Academic Definition */}
                            <div className="bg-bg-soft/50 rounded-xl p-4 border border-border-subtle">
                              <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-4 h-4 text-accent" />
                                <h4 className="text-sm font-semibold text-text-primary">
                                  Definizione Accademica
                                </h4>
                              </div>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {term.what}
                              </p>
                            </div>

                            {/* Tradelia AI Explanation */}
                            {term.how && (
                              <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-cyan-300" />
                                  <h4 className="text-sm font-semibold text-text-primary">
                                    Applicazione Tradelia
                                  </h4>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                  {term.how}
                                </p>
                              </div>
                            )}

                            {/* Technical Explanation */}
                            {term.technical && (
                              <div className="bg-bg-soft/30 rounded-xl p-4 border border-border-subtle">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-text-tertiary" />
                                  <h4 className="text-sm font-semibold text-text-primary">
                                    Spiegazione Tecnica
                                  </h4>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                  {term.technical}
                                </p>
                              </div>
                            )}

                            {/* Sources */}
                            {term.source && (
                              <div className="flex items-start gap-2 text-xs text-text-tertiary">
                                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>
                                  <strong>Fonte:</strong> {term.source}
                                </span>
                              </div>
                            )}

                            {/* Tags */}
                            {term.tags && term.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                                {term.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 rounded-full text-xs bg-bg-soft border border-border-subtle text-text-tertiary"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Related Terms */}
                            {term.relatedTerms && term.relatedTerms.length > 0 && (
                              <div className="pt-2 border-t border-border-subtle">
                                <p className="text-xs text-text-tertiary mb-2">
                                  Termini correlati:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {term.relatedTerms.map((relatedKey) => {
                                    const relatedTerm = glossaryData[relatedKey];
                                    return relatedTerm ? (
                                      <span
                                        key={relatedKey}
                                        className="px-3 py-1.5 bg-bg-soft border border-border-subtle rounded-lg text-xs text-text-secondary hover:bg-bg-surface hover:border-accent/30 transition-colors cursor-pointer"
                                      >
                                        {relatedTerm.title}
                                      </span>
                                    ) : (
                                      <span
                                        key={relatedKey}
                                        className="px-3 py-1.5 bg-bg-soft border border-border-subtle rounded-lg text-xs text-text-secondary"
                                      >
                                        {relatedKey}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors" />
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center">
          <p className="text-sm text-text-tertiary">
            Glossario Tradelia - {new Date().getFullYear()} | 
            <span className="mx-2">Fonti accademiche verificate</span> |
            <span className="mx-2">{terms.length} termini</span>
          </p>
        </div>
      </div>
    </div>
  );
}
