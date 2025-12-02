'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  ExternalLink,
  Code,
  Link2,
  Tag,
  Layers,
  ChevronRight,
  Printer,
  Download,
  Search,
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { getGlossaryTerm } from '@/lib/glossary/terms';
import type { GlossaryTerm as GlossaryTermType } from '@/lib/glossary/terms';

interface GlossaryTerm {
  title: string;
  what: string; // Spiegazione accademica
  how: string; // Spiegazione Tradelia AI
  source: string; // Fonti
  technical?: string; // Spiegazione tecnica semplificata (opzionale)
  relatedTerms?: string[]; // Termini correlati (opzionale)
  category?: string;
  tags?: string[];
}

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  term: GlossaryTerm | null;
  onTermClick?: (termKey: string) => void; // Callback quando si clicca su un termine correlato
}

/**
 * Glossary Drawer Component
 * Drawer completo per mostrare termini del glossario con:
 * - Spiegazione Accademica (what)
 * - Spiegazione Tecnica Semplificata (technical)
 * - Spiegazione Tradelia AI (how)
 * - Fonti Accademiche (source)
 * - Termini Correlati (relatedTerms)
 * 
 * Best Practice:
 * - Focus trap per accessibilità
 * - Keyboard navigation (ESC, Tab)
 * - ARIA labels completi
 * - Responsive design
 * Riferimento: Material Design Drawer, WCAG 2.1 - Modal/Dialog
 */
export function GlossaryDrawer({ isOpen, onClose, term, onTermClick }: GlossaryDrawerProps) {
  const { t } = useTranslations();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [relatedTermsData, setRelatedTermsData] = useState<GlossaryTermType[]>([]);

  // Blocca scroll quando drawer è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Carica termini correlati
  useEffect(() => {
    if (!term?.relatedTerms || term.relatedTerms.length === 0) {
      setRelatedTermsData([]);
      return;
    }

    const loadRelatedTerms = async () => {
      const terms = await Promise.all(
        term.relatedTerms!.map(async (termKey) => {
          const termData = await getGlossaryTerm(termKey);
          return termData ? { key: termKey, term: termData } : null;
        })
      );
      setRelatedTermsData(terms.filter((t): t is GlossaryTermType => t !== null));
    };

    loadRelatedTerms();
  }, [term?.relatedTerms]);

  // Focus trap e gestione ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus sul close button quando si apre
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Focus trap: mantiene il focus dentro il drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleTab);
    return () => drawer.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!term) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-bg-surface border-l border-border-subtle shadow-2xl z-[9999] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-drawer-title"
            aria-describedby="glossary-drawer-description"
          >
            {/* Header - Academic Style */}
            <div className="border-b border-border-subtle bg-bg-surface">
              {/* Breadcrumb Navigation */}
              <div className="px-6 pt-4 pb-2">
                <nav className="flex items-center gap-2 text-xs text-text-tertiary" aria-label="Breadcrumb">
                  <span className="hover:text-text-secondary">Glossario</span>
                  {term.category && (
                    <>
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      <span className="text-text-secondary">{term.category}</span>
                    </>
                  )}
                  <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  <span className="text-text-primary font-medium">{term.title}</span>
                </nav>
              </div>
              
              {/* Title Section */}
              <div className="flex items-start justify-between px-6 pb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 id="glossary-drawer-title" className="text-xl font-bold text-text-primary mb-1">
                      {term.title}
                    </h2>
                    <p id="glossary-drawer-description" className="text-sm text-text-secondary">
                      {term.category && (
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-text-tertiary" aria-hidden="true" />
                          <span className="text-text-tertiary">{term.category}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.print()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Stampa definizione"
                    title="Stampa"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label={t('common.close') || 'Chiudi drawer'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tags Bar */}
              {term.tags && term.tags.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {term.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Content - Academic Layout */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Spiegazione Accademica - Academic Style */}
              <section className="space-y-3" aria-labelledby="academic-section-title">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="academic-section-title" className="text-base font-bold text-text-primary">
                      {t('glossary.drawer.academicExplanation') || 'Definizione Accademica'}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-0.5">Academic Definition</p>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-text-primary leading-relaxed font-normal">
                    {term.what}
                  </p>
                </div>
              </section>

              {/* Spiegazione Tecnica Semplificata - Academic Style */}
              {term.technical && (
                <section className="space-y-3" aria-labelledby="technical-section-title">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="technical-section-title" className="text-base font-bold text-text-primary">
                        {t('glossary.drawer.technicalExplanation') || 'Spiegazione Tecnica Semplificata'}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-0.5">Simplified Technical Explanation</p>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line font-normal">
                      {term.technical}
                    </p>
                  </div>
                </section>
              )}

              {/* Spiegazione Tradelia AI - Academic Style */}
              <section className="space-y-3" aria-labelledby="tradelia-section-title">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="tradelia-section-title" className="text-base font-bold text-text-primary">
                      {t('glossary.drawer.tradeliaExplanation') || 'Applicazione Pratica Tradelia'}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-0.5">Tradelia AI Application</p>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line font-normal">
                    {term.how}
                  </p>
                </div>
              </section>

              {/* Termini Correlati - Academic Style */}
              {relatedTermsData.length > 0 && (
                <section className="space-y-3" aria-labelledby="related-terms-section-title">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="related-terms-section-title" className="text-base font-bold text-text-primary">
                        {t('glossary.drawer.relatedTerms') || 'Termini Correlati'}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-0.5">Related Terms & Concepts</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {relatedTermsData.map((relatedTerm, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (onTermClick) {
                            const termKey = term.relatedTerms?.[index];
                            if (termKey) {
                              onTermClick(termKey);
                            }
                          }
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-text-primary bg-bg-soft border border-border-subtle rounded-lg hover:bg-bg-base hover:border-border-default hover:shadow-sm transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        aria-label={`Apri definizione di ${relatedTerm.title}`}
                      >
                        <span className="block truncate">{relatedTerm.title}</span>
                        {relatedTerm.category && (
                          <span className="block text-xs text-text-tertiary mt-1 truncate">{relatedTerm.category}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Fonti Accademiche - APA Style */}
              <section className="space-y-3" aria-labelledby="sources-section-title">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="sources-section-title" className="text-base font-bold text-text-primary">
                      {t('glossary.drawer.sources') || 'Riferimenti Bibliografici'}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-0.5">Academic References (APA Style)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {term.source.split('|').map((source, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-bg-soft border border-border-subtle hover:border-border-default transition-colors">
                      <ExternalLink className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs text-text-primary leading-relaxed font-mono">
                        {source.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer - Academic Style */}
            <div className="p-6 border-t border-border-subtle bg-bg-surface">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-text-tertiary">
                  Glossario Tradelia • {new Date().getFullYear()}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-soft hover:bg-bg-base border border-border-subtle rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {t('common.close') || 'Chiudi'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

