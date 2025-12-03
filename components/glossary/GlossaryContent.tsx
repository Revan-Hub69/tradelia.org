'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, BookOpen, X, GraduationCap, FileText, Keyboard, Layers, Tag, ChevronDown, Sparkles, Calendar } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGlossaryTerms, type GlossaryTerm } from '@/lib/glossary/terms';
import { getGlossaryCategories, getGlossaryTags, getCategoryDisplayName, getTagDisplayName, type GlossaryCategory, type GlossaryTag } from '@/lib/glossary/categories';
import { TRADELIA_GLOSSARY_CATEGORIES, TRADELIA_GLOSSARY_TAGS, type TradeliaGlossaryCategory, type TradeliaGlossaryTag } from '@/lib/glossary/tradelia-glossary-structure';
import { getTermOfTheDay, formatTermDate } from '@/lib/glossary/term-of-the-day';
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
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | TradeliaGlossaryCategory | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [glossaryData, setGlossaryData] = useState<Record<string, GlossaryTerm>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTermWithKey | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const termRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [termOfTheDay, setTermOfTheDay] = useState<GlossaryTermWithKey | null>(null);

  // Load glossary data
  useEffect(() => {
    loadGlossaryTerms().then((data) => {
      setGlossaryData(data);
      setLoading(false);
      
      // Calcola termine del giorno
      const tod = getTermOfTheDay(data);
      if (tod) {
        // Trova la chiave del termine
        const termKey = Object.keys(data).find(key => {
          const term = data[key];
          return term.title === tod.title && term.what === tod.what;
        });
        if (termKey) {
          setTermOfTheDay({ key: termKey, ...tod });
        }
      }
    });
  }, []);

  // Get all categories (both old and Tradelia)
  const oldCategories = getGlossaryCategories();
  const tradeliaCategories = Object.keys(TRADELIA_GLOSSARY_CATEGORIES) as TradeliaGlossaryCategory[];
  const allCategories = [...oldCategories, ...tradeliaCategories];
  
  const terms = Object.entries(glossaryData).map(([key, term]) => ({ key, ...term }));

  // Helper function per matching tag più robusto
  const matchesTag = (term: GlossaryTermWithKey, tag: string): boolean => {
    if (!term.tags || term.tags.length === 0) return false;
    return term.tags.some(tagItem => {
      if (typeof tagItem === 'string') {
        return tagItem === tag || tagItem.toLowerCase() === tag.toLowerCase();
      }
      return tagItem === tag;
    });
  };

  // Helper function per matching categoria più robusto
  const normalizeCategory = (cat: GlossaryCategory | TradeliaGlossaryCategory | string | undefined): string | null => {
    if (!cat) return null;
    if (cat === 'all') return 'all';
    
    // Se è già una chiave Tradelia, ritorna quella
    if (cat in TRADELIA_GLOSSARY_CATEGORIES) {
      return cat as string;
    }
    
    // Se è un displayName Tradelia, trova la chiave
    const tradeliaCat = Object.values(TRADELIA_GLOSSARY_CATEGORIES).find(
      c => c.displayName === cat
    );
    if (tradeliaCat) {
      return tradeliaCat.key;
    }
    
    // Altrimenti ritorna come stringa (categoria vecchia)
    return cat as string;
  };

  // Helper function per matching categoria più robusto
  const matchesCategory = (term: GlossaryTermWithKey, category: GlossaryCategory | TradeliaGlossaryCategory | 'all'): boolean => {
    if (category === 'all') return true;
    
    const normalizedCategory = normalizeCategory(category);
    const normalizedTermCategory = normalizeCategory(term.category);
    
    if (!normalizedCategory || !normalizedTermCategory) return false;
    
    return normalizedCategory === normalizedTermCategory;
  };

  // Helper function per ricerca più completa
  const matchesSearch = (term: GlossaryTermWithKey, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    
    // Cerca nel titolo
    if (term.title.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nella definizione accademica
    if (term.what.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nella spiegazione Tradelia
    if (term.whatDoes?.toLowerCase().includes(searchLower)) return true;
    if (term.howToUse?.toLowerCase().includes(searchLower)) return true;
    if (term.tradeliaExplanation?.whatDoes?.toLowerCase().includes(searchLower)) return true;
    if (term.tradeliaExplanation?.howToUse?.toLowerCase().includes(searchLower)) return true;
    
    // Cerca in legacy fields
    if (term.technical?.toLowerCase().includes(searchLower)) return true;
    if (term.how?.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nei tag
    if (term.tags?.some(tag => 
      typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
    )) return true;
    
    // Cerca nella categoria
    if (term.category && typeof term.category === 'string' && 
        term.category.toLowerCase().includes(searchLower)) return true;
    
    return false;
  };
  
  // Extract unique tags actually used in terms (best practice: show only what exists)
  const usedTagsSet = new Set<string>();
  terms.forEach(term => {
    if (term.tags && term.tags.length > 0) {
      term.tags.forEach(tag => {
        if (typeof tag === 'string') {
          usedTagsSet.add(tag);
        } else {
          usedTagsSet.add(tag as string);
        }
      });
    }
  });
  
  // Convert to array and sort by usage frequency (most used first)
  // Usa le funzioni helper già definite sopra
  const allTags = Array.from(usedTagsSet).sort((a, b) => {
    try {
      const countA = terms.filter(t => matchesTag(t, a)).length;
      const countB = terms.filter(t => matchesTag(t, b)).length;
      return countB - countA; // Descending order
    } catch (error) {
      // Fallback: alphabetical sort se c'è errore
      return a.localeCompare(b);
    }
  });

  // Helper function per normalizzare categoria a stringa per confronti
  const normalizeCategory = (cat: GlossaryCategory | TradeliaGlossaryCategory | string | undefined): string | null => {
    if (!cat) return null;
    if (cat === 'all') return 'all';
    
    // Se è già una chiave Tradelia, ritorna quella
    if (cat in TRADELIA_GLOSSARY_CATEGORIES) {
      return cat as string;
    }
    
    // Se è un displayName Tradelia, trova la chiave
    const tradeliaCat = Object.values(TRADELIA_GLOSSARY_CATEGORIES).find(
      c => c.displayName === cat
    );
    if (tradeliaCat) {
      return tradeliaCat.key;
    }
    
    // Altrimenti ritorna come stringa (categoria vecchia)
    return cat as string;
  };

  // Helper function per matching categoria più robusto
  const matchesCategory = (term: GlossaryTermWithKey, category: GlossaryCategory | TradeliaGlossaryCategory | 'all'): boolean => {
    if (category === 'all') return true;
    
    const normalizedCategory = normalizeCategory(category);
    const normalizedTermCategory = normalizeCategory(term.category);
    
    if (!normalizedCategory || !normalizedTermCategory) return false;
    
    return normalizedCategory === normalizedTermCategory;
  };

  // Helper function per matching tag più robusto
  const matchesTag = (term: GlossaryTermWithKey, tag: string): boolean => {
    if (!term.tags || term.tags.length === 0) return false;
    return term.tags.some(tagItem => {
      if (typeof tagItem === 'string') {
        return tagItem === tag || tagItem.toLowerCase() === tag.toLowerCase();
      }
      return tagItem === tag;
    });
  };

  // Helper function per ricerca più completa
  const matchesSearch = (term: GlossaryTermWithKey, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    
    // Cerca nel titolo
    if (term.title.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nella definizione accademica
    if (term.what.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nella spiegazione Tradelia
    if (term.whatDoes?.toLowerCase().includes(searchLower)) return true;
    if (term.howToUse?.toLowerCase().includes(searchLower)) return true;
    if (term.tradeliaExplanation?.whatDoes?.toLowerCase().includes(searchLower)) return true;
    if (term.tradeliaExplanation?.howToUse?.toLowerCase().includes(searchLower)) return true;
    
    // Cerca in legacy fields
    if (term.technical?.toLowerCase().includes(searchLower)) return true;
    if (term.how?.toLowerCase().includes(searchLower)) return true;
    
    // Cerca nei tag
    if (term.tags?.some(tag => 
      typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
    )) return true;
    
    // Cerca nella categoria
    if (term.category && typeof term.category === 'string' && 
        term.category.toLowerCase().includes(searchLower)) return true;
    
    return false;
  };

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      return matchesSearch(term, searchTerm) &&
             matchesCategory(term, selectedCategory) &&
             (selectedTags.length === 0 || selectedTags.some(tag => matchesTag(term, tag)));
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

  // Keyboard navigation migliorata
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in search or other inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)) {
        return;
      }

      // Close drawer with Escape
      if (e.key === 'Escape' && selectedTerm) {
        e.preventDefault();
        closeTerm();
        return;
      }
      
      // Ctrl/Cmd + K: focus search (best practice)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
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
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <p className="text-sm text-text-tertiary">
                    <span className="font-semibold text-text-primary">{terms.length}</span> termini
                  </p>
                  <span className="text-text-tertiary">•</span>
                  <p className="text-sm text-text-tertiary">
                    <span className="font-semibold text-text-primary">{allCategories.length}</span> categorie
                  </p>
                  <span className="text-text-tertiary">•</span>
                  <p className="text-sm text-text-tertiary">
                    <span className="font-semibold text-text-primary">{allTags.length}</span> argomenti
                  </p>
                </div>
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

        {/* Termine del Giorno - Featured Section */}
        {termOfTheDay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-2 border-accent/30 rounded-xl shadow-lg"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Termine del Giorno
                  </h2>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatTermDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-bg-surface rounded-lg p-4 border border-border-subtle">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {termOfTheDay.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-3">
                    {termOfTheDay.what}
                  </p>
                  {termOfTheDay.category && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/20 border border-accent/30 rounded text-xs font-medium text-accent">
                      <Layers className="w-3 h-3" />
                      {termOfTheDay.category in TRADELIA_GLOSSARY_CATEGORIES
                        ? TRADELIA_GLOSSARY_CATEGORIES[termOfTheDay.category as TradeliaGlossaryCategory].displayName
                        : getCategoryDisplayName(termOfTheDay.category as GlossaryCategory)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openTerm(termOfTheDay)}
                  className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors flex-shrink-0 flex items-center gap-2"
                  aria-label={`Leggi la definizione completa di ${termOfTheDay.title}`}
                >
                  <span>Leggi tutto</span>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar - Compact */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('glossary.searchPlaceholder') || 'Cerca per nome, definizione o argomento...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-surface border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm"
              aria-label="Cerca nel glossario per nome, definizione o argomento"
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

        {/* Filters - Always Visible, Immediate Feedback */}
        <div className="mb-4 space-y-4">
          {/* Active Filters Summary - Immediate Visual Feedback */}
          {(selectedCategory !== 'all' || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <span className="text-xs font-semibold text-text-primary">Filtri applicati:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-white border border-accent shadow-sm">
                  {selectedCategory in TRADELIA_GLOSSARY_CATEGORIES
                    ? TRADELIA_GLOSSARY_CATEGORIES[selectedCategory as TradeliaGlossaryCategory].displayName
                    : getCategoryDisplayName(selectedCategory as GlossaryCategory)}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Rimuovi filtro categoria`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTags.map((tag) => {
                const tagDisplayName = getTagDisplayName(tag as GlossaryTag);
                return (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-white border border-accent shadow-sm"
                  >
                    {tagDisplayName}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Rimuovi filtro argomento ${tagDisplayName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTags([]);
                }}
                className="ml-auto text-xs text-accent hover:text-accent-hover font-medium underline"
              >
                Cancella filtri
              </button>
            </div>
          )}

          {/* Categories - Always Visible */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-accent" />
              <label className="text-sm font-semibold text-text-primary">
                Filtra per categoria
              </label>
              <span className="text-xs text-text-tertiary">
                • {filteredTerms.length} {filteredTerms.length === 1 ? 'termine trovato' : 'termini trovati'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                  selectedCategory === 'all'
                    ? 'bg-accent text-white border-accent shadow-md'
                    : 'bg-bg-surface text-text-secondary hover:bg-bg-soft border-border-subtle hover:border-accent/50'
                )}
              >
                Mostra tutte
              </button>
              {allCategories.map((category) => {
                // Get display name for both old and Tradelia categories
                const displayName = category in TRADELIA_GLOSSARY_CATEGORIES
                  ? TRADELIA_GLOSSARY_CATEGORIES[category as TradeliaGlossaryCategory].displayName
                  : getCategoryDisplayName(category as GlossaryCategory);
                
                // Count terms in this category (considering search term and tag filters but not category filter)
                const count = terms.filter(t => {
                  const searchMatch = matchesSearch(t, searchTerm);
                  const categoryMatch = matchesCategory(t, category);
                  const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => matchesTag(t, tag));
                  return searchMatch && categoryMatch && tagMatch;
                }).length;
                
                if (count === 0) return null; // Hide categories with no terms
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 flex items-center gap-2',
                      selectedCategory === category
                        ? 'bg-accent text-white border-accent shadow-md'
                        : 'bg-bg-surface text-text-secondary hover:bg-bg-soft border-border-subtle hover:border-accent/50'
                    )}
                  >
                    <span>{displayName}</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-semibold',
                      selectedCategory === category
                        ? 'bg-white/20 text-white'
                        : 'bg-bg-soft text-text-tertiary'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags - Always Visible, Scrollable - Improved UX */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-accent" />
                <label className="text-sm font-semibold text-text-primary">
                  Argomenti e Temi
                </label>
                {selectedTags.length > 0 && (
                  <span className="text-xs text-accent font-semibold">
                    • {selectedTags.length} {selectedTags.length === 1 ? 'tema selezionato' : 'temi selezionati'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {allTags.map((tag) => {
                  // Count terms with this tag (considering search and category filters but not tag filter)
                  const count = terms.filter(t => {
                    const searchMatch = matchesSearch(t, searchTerm);
                    const categoryMatch = matchesCategory(t, selectedCategory);
                    const tagMatch = matchesTag(t, tag);
                    return searchMatch && categoryMatch && tagMatch;
                  }).length;
                  if (count === 0) return null; // Nascondi tag senza risultati
                  
                  // Get display name for tag with proper formatting
                  const formatTagDisplayName = (tagStr: string): string => {
                    // Check if it's an old GlossaryTag
                    const oldTagsList = getGlossaryTags();
                    if (oldTagsList.includes(tagStr as GlossaryTag)) {
                      return getTagDisplayName(tagStr as GlossaryTag);
                    }
                    // Format Tradelia tags (kebab-case to Title Case)
                    return tagStr
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };
                  
                  const tagDisplayName = formatTagDisplayName(tag);
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5',
                        selectedTags.includes(tag)
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-bg-surface text-text-secondary border-border-subtle hover:bg-bg-soft hover:border-accent/50'
                      )}
                      title={`${tagDisplayName}: ${count} ${count === 1 ? 'termine' : 'termini'}`}
                    >
                      <span>{tagDisplayName}</span>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded font-semibold',
                        selectedTags.includes(tag)
                          ? 'bg-white/20 text-white'
                          : 'bg-bg-soft text-text-tertiary'
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-xs text-text-tertiary hover:text-text-primary underline"
                >
                  Rimuovi tutti i temi
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count - Clear Summary */}
        <div className="mb-3 flex items-center gap-2">
          {filteredTerms.length === 0 ? (
            <span className="text-sm text-text-secondary font-medium">Nessun risultato trovato</span>
          ) : (
            <span className="text-sm text-text-primary font-semibold">
              {filteredTerms.length} {filteredTerms.length === 1 ? 'termine disponibile' : 'termini disponibili'}
            </span>
          )}
          {(searchTerm || selectedCategory !== 'all' || selectedTags.length > 0) && filteredTerms.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedTags([]);
              }}
              className="text-xs text-accent hover:text-accent-hover underline"
            >
              Mostra tutti i termini
            </button>
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
                Prova a modificare i filtri o la ricerca per trovare altri termini
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                  }}
                  className="mt-3 px-4 py-2 text-sm font-medium text-accent hover:text-accent-hover underline"
                >
                  Mostra tutti i {terms.length} termini disponibili
                </button>
              )}
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
                  'w-full p-4 rounded-xl border-2 text-left transition-all group',
                  'bg-bg-surface border-border-subtle',
                  'hover:border-accent/60 hover:bg-bg-soft hover:shadow-md hover:shadow-accent/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                  focusedIndex === index && 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base border-accent/60'
                )}
                aria-label={`Apri definizione di ${term.title}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                        {term.title}
                      </h3>
                      {term.category && (
                        <span className="px-2.5 py-1 bg-accent/15 border border-accent/30 rounded-md text-xs font-semibold text-accent whitespace-nowrap flex-shrink-0">
                          {term.category in TRADELIA_GLOSSARY_CATEGORIES
                            ? TRADELIA_GLOSSARY_CATEGORIES[term.category as TradeliaGlossaryCategory].displayName
                            : typeof term.category === 'string' ? term.category : ''}
                        </span>
                      )}
                      {term.learningLevel && (
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          term.learningLevel === 'foundational' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                          term.learningLevel === 'intermediate' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                          term.learningLevel === 'advanced' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                          term.learningLevel === 'expert' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        )}>
                          {term.learningLevel === 'foundational' && 'Base'}
                          {term.learningLevel === 'intermediate' && 'Intermedio'}
                          {term.learningLevel === 'advanced' && 'Avanzato'}
                          {term.learningLevel === 'expert' && 'Esperto'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-2">
                      {term.what}
                    </p>
                    {term.tags && term.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {term.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-bg-soft border border-border-subtle rounded text-xs text-text-tertiary"
                          >
                            {typeof tag === 'string' 
                              ? (getGlossaryTags().includes(tag as GlossaryTag) 
                                  ? getTagDisplayName(tag as GlossaryTag)
                                  : tag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
                              : tag}
                          </span>
                        ))}
                        {term.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-text-tertiary">
                            +{term.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-5 h-5 text-text-tertiary group-hover:text-accent flex-shrink-0 mt-1 transition-colors" />
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
