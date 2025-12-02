'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Filter, X, GraduationCap, FileText, Keyboard } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGlossaryTerms, type GlossaryTerm } from '@/lib/glossary/terms';
import { getGlossaryCategories, getGlossaryTags, type GlossaryCategory } from '@/lib/glossary/categories';
import { GlossaryDrawer } from './GlossaryDrawer';

interface GlossaryTermWithKey extends GlossaryTerm {
  key: string;
}

/**
 * Glossary Content Component
 * Best Practice Academic Glossary:
 * - Compact list view with drawer for details
 * - Full keyboard navigation support
 * - Academic definitions only
 * - Technical explanations (Tradelia AI)
 * - Verified sources
 * - WCAG 2.1 AA compliant
 */
export function GlossaryContent() {
  const { t } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [glossaryData, setGlossaryData] = useState<Record<string, GlossaryTerm>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTermWithKey | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const termRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

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
        term.technical?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => term.tags?.includes(tag as any));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchTerm, selectedCategory, selectedTags, terms]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const openTerm = useCallback((term: GlossaryTermWithKey) => {
    setSelectedTerm(term);
  }, []);

  const closeTerm = useCallback(() => {
    setSelectedTerm(null);
    // Restore focus to the term that was clicked
    if (focusedIndex >= 0 && focusedIndex < filteredTerms.length) {
      const termKey = filteredTerms[focusedIndex].key;
      termRefs.current.get(termKey)?.focus();
    }
  }, [focusedIndex, filteredTerms]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in search
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Close drawer with Escape
      if (e.key === 'Escape' && selectedTerm) {
        closeTerm();
        return;
      }

      // Arrow keys navigation
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !selectedTerm) {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const newIndex = Math.max(0, Math.min(filteredTerms.length - 1, focusedIndex + direction));
        setFocusedIndex(newIndex);
        const termKey = filteredTerms[newIndex]?.key;
        if (termKey) {
          termRefs.current.get(termKey)?.focus();
        }
      }

      // Enter to open term
      if (e.key === 'Enter' && focusedIndex >= 0 && !selectedTerm) {
        e.preventDefault();
        const term = filteredTerms[focusedIndex];
        if (term) {
          openTerm(term);
        }
      }

      // Focus search with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTerms, focusedIndex, selectedTerm, openTerm, closeTerm]);

  // Reset focus index when filters change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchTerm, selectedCategory, selectedTags]);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header - Compact Academic Design */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent via-accent-hover to-indigo-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
                  {t('glossary.title') || 'Glossario Finanziario'}
                </h1>
                <p className="text-sm text-text-tertiary mt-1">
                  {terms.length} termini • {categories.length} categorie
                </p>
              </div>
            </div>
            
            {/* Keyboard Help Toggle */}
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors text-sm"
              aria-label="Mostra istruzioni tastiera"
            >
              <Keyboard className="w-4 h-4" />
              <span>Istruzioni</span>
            </button>
          </div>

          {/* Keyboard Navigation Instructions */}
          <AnimatePresence>
            {showKeyboardHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-bg-soft border border-border-subtle rounded-lg text-sm"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Keyboard className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-2">Navigazione da tastiera</h3>
                    <ul className="space-y-1 text-text-secondary text-xs">
                      <li><kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">↓</kbd> Naviga tra i termini</li>
                      <li><kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">Enter</kbd> Apri termine nel drawer</li>
                      <li><kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">Esc</kbd> Chiudi drawer</li>
                      <li><kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">Ctrl/Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">K</kbd> Focus ricerca</li>
                      <li><kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded">Tab</kbd> Naviga tra elementi interattivi</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowKeyboardHelp(false)}
                    className="p-1 rounded hover:bg-bg-surface text-text-tertiary hover:text-text-primary transition-colors"
                    aria-label="Chiudi istruzioni"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Bar - Compact */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('glossary.searchPlaceholder') || 'Cerca un termine...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
              aria-label="Cerca nel glossario"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-soft text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Cancella ricerca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters - Collapsible Compact */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors text-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtri</span>
            {showFilters ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {/* Categories */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Categoria
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        'px-3 py-1 rounded text-xs font-medium transition-all',
                        selectedCategory === 'all'
                          ? 'bg-accent text-white shadow-sm'
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
                          'px-3 py-1 rounded text-xs font-medium transition-all',
                          selectedCategory === category
                            ? 'bg-accent text-white shadow-sm'
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
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Tag
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
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
        <div className="mb-3 text-xs text-text-tertiary">
          {filteredTerms.length === 0 ? (
            <span>Nessun termine trovato</span>
          ) : (
            <span>
              {filteredTerms.length} {filteredTerms.length === 1 ? 'termine' : 'termini'}
            </span>
          )}
        </div>

        {/* Terms List - Compact Design */}
        <div className="space-y-2">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 bg-bg-soft rounded-xl border border-border-subtle">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-base font-semibold text-text-secondary mb-1">
                {t('glossary.noResults') || 'Nessun termine trovato'}
              </p>
              <p className="text-xs text-text-tertiary">
                Prova a modificare i filtri o la ricerca
              </p>
            </div>
          ) : (
            filteredTerms.map((term, index) => (
              <motion.button
                key={term.key}
                ref={(el) => {
                  if (el) termRefs.current.set(term.key, el);
                  else termRefs.current.delete(term.key);
                }}
                onClick={() => {
                  setFocusedIndex(index);
                  openTerm(term);
                }}
                onFocus={() => setFocusedIndex(index)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  'bg-bg-surface border-border-subtle',
                  'hover:border-accent/50 hover:bg-bg-soft hover:shadow-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                  focusedIndex === index && 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base'
                )}
                aria-label={`Apri definizione di ${term.title}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary">
                        {term.title}
                      </h3>
                      {term.category && (
                        <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-xs font-medium text-accent whitespace-nowrap flex-shrink-0">
                          {term.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {term.what}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Footer - Compact */}
        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="text-xs text-text-tertiary">
            Glossario Tradelia • {new Date().getFullYear()} • Fonti accademiche verificate
          </p>
        </div>
      </div>

      {/* Glossary Drawer */}
      {selectedTerm && (
        <GlossaryDrawer
          isOpen={!!selectedTerm}
          onClose={closeTerm}
          term={selectedTerm}
          onTermClick={(termKey) => {
            const term = terms.find(t => t.key === termKey);
            if (term) {
              openTerm(term);
            }
          }}
        />
      )}
    </div>
  );
}
