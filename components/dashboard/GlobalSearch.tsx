'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, BookOpen, TrendingUp, ArrowRight, Command } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { toast } from '@/components/ui/Toast';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { useFocusManagement } from '@/lib/hooks/useFocusManagement';

interface SearchResult {
  id: string;
  type: 'report' | 'course' | 'module' | 'glossary';
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function GlobalSearch() {
  const { t } = useTranslations();
  const router = useSafeRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const { containerRef: keyboardNavRef } = useKeyboardNavigation({
    itemCount: results.length,
    onSelect: (index) => {
      if (results[index]) {
        handleSelectResult(results[index]);
      }
    },
    enabled: isOpen && results.length > 0,
  });

  // Focus management
  const { containerRef: focusRef } = useFocusManagement({
    enabled: isOpen,
    initialFocus: inputRef,
  });

  // Merge refs for results container
  useEffect(() => {
    if (keyboardNavRef && resultsRef.current) {
      (keyboardNavRef as React.MutableRefObject<HTMLDivElement | null>).current = resultsRef.current;
    }
  }, [keyboardNavRef, results.length]);

  // Blocca scroll quando modal è aperto
  useBodyScrollLock(isOpen);

  // Search with API (with caching)
  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Errore ricerca');
      }

      const { data } = await response.json();
      
      // Map API results to SearchResult format
      const mappedResults: SearchResult[] = [];

      // Reports
      (data.reports || []).forEach((item: any) => {
        mappedResults.push({
          id: `report-${item.id}`,
          type: 'report',
          title: item.title,
          description: item.description || '',
          href: `/dashboard/analysis`,
          icon: <FileText className="w-4 h-4" />,
        });
      });

      // Courses
      (data.courses || []).forEach((item: any) => {
        mappedResults.push({
          id: `course-${item.id}`,
          type: 'course',
          title: item.title,
          description: item.description || '',
          href: item.slug ? `/courses/${item.slug}` : '/dashboard/education',
          icon: <BookOpen className="w-4 h-4" />,
        });
      });

      // Modules
      (data.modules || []).forEach((item: any) => {
        mappedResults.push({
          id: `module-${item.id}`,
          type: 'module',
          title: item.title,
          description: item.description || '',
          href: item.href || '/dashboard',
          icon: <TrendingUp className="w-4 h-4" />,
        });
      });

      setResults(mappedResults);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
      toast.error('Errore durante la ricerca', {
        action: {
          label: 'Riprova',
          onClick: () => searchContent(searchQuery),
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input quando si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cerca quando cambia la query (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchContent(query);
        setSelectedIndex(0);
      } else {
        setResults([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query, searchContent]);

  // Keyboard navigation is now handled by useKeyboardNavigation hook
  // The hook manages arrow keys, Enter, Home, End automatically

  // Click outside per chiudere
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all duration-200 text-sm"
        aria-label={t('dashboard.search.open') || 'Apri ricerca (Ctrl+K)'}
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">{t('dashboard.search.placeholder') || 'Cerca...'}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-tertiary">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
            />
            <motion.div
              ref={(node) => {
                (searchRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (focusRef && node) {
                  (focusRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
              }}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-4 left-4 right-4 md:top-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-[10001]"
              role="dialog"
              aria-modal="true"
              aria-label={t('dashboard.search.title') || 'Ricerca globale'}
            >
              <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
                  <Search className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('dashboard.search.placeholder') || 'Cerca report, corsi, moduli...'}
                    className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary text-base"
                    autoComplete="off"
                    aria-label={t('dashboard.search.inputLabel') || 'Campo di ricerca'}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                      aria-label={t('dashboard.search.clear') || 'Pulisci ricerca'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query.trim() && results.length === 0 ? (
                    <div className="p-8 text-center text-text-tertiary">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {t('dashboard.search.noResults') || 'Nessun risultato trovato'}
                      </p>
                    </div>
                  ) : query.trim() && results.length > 0 ? (
                    <div className="p-2" ref={resultsRef}>
                      {results.map((result, index) => (
                        <button
                          key={result.id}
                          data-keyboard-nav-item
                          tabIndex={selectedIndex === index ? 0 : -1}
                          onClick={() => handleSelectResult(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'w-full p-3 rounded-lg text-left transition-colors flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-accent',
                            index === selectedIndex
                              ? 'bg-accent/20 border border-accent/40'
                              : 'hover:bg-bg-soft border border-transparent'
                          )}
                          aria-label={`${result.title}: ${result.description}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-text-primary text-sm">{result.title}</h4>
                              <span className="px-1.5 py-0.5 bg-bg-soft border border-border-subtle rounded text-xs text-text-tertiary capitalize">
                                {result.type}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-1">{result.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-text-tertiary">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm mb-2">
                        {t('dashboard.search.startTyping') || 'Inizia a digitare per cercare...'}
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-bg-soft border border-border-subtle">↑↓</kbd>
                          <span>Naviga</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-bg-soft border border-border-subtle">↵</kbd>
                          <span>Seleziona</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-bg-soft border border-border-subtle">Esc</kbd>
                          <span>Chiudi</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

