'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import Image from 'next/image';

interface GlossaryTerm {
  title: string;
  what: string; // Definizione accademica
  source: string; // Fonti accademiche
  technical?: string; // Spiegazione tecnica Tradelia AI (best practice educativa)
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
 * - Nome del termine (title)
 * - Definizione Accademica (what)
 * - Spiegazione Tecnica Tradelia AI (technical) - best practice educativa ma solida
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

  // Blocca scroll quando drawer è aperto (Best Practice: Prevent body scroll)
  useEffect(() => {
    if (isOpen) {
      // Salva lo scroll corrente
      const scrollY = window.scrollY;
      // Blocca scroll body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Ripristina scroll body
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      // Cleanup: ripristina sempre
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
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
      setRelatedTermsData(
        terms
          .filter((t): t is { key: string; term: GlossaryTermType } => t !== null)
          .map((t) => t.term)
      );
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

  // Focus trap: mantiene il focus dentro il drawer (Best Practice: WCAG 2.1)
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    
    // Get all focusable elements
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    const focusableElements = Array.from(
      drawer.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when drawer opens
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Don't trap if focus is outside drawer
      if (!drawer.contains(document.activeElement)) {
        e.preventDefault();
        firstElement?.focus();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab: go backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: go forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Prevent scroll on drawer when using arrow keys
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
        const scrollableElement = drawer.querySelector('.overflow-y-auto');
        if (scrollableElement && scrollableElement.contains(document.activeElement)) {
          // Allow arrow keys within scrollable content
          return;
        }
        // Prevent default scroll behavior
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleTab);
    window.addEventListener('keydown', handleArrowKeys);
    
    return () => {
      window.removeEventListener('keydown', handleTab);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen]);

  // Inject print styles dynamically (Best Practice: Compatible with Next.js build)
  useEffect(() => {
    const printStyles = [
      '@media print {',
      '  body * { visibility: hidden; }',
      '  .glossary-print-container, .glossary-print-container * { visibility: visible; }',
      '  .glossary-print-container {',
      '    display: block !important;',
      '    position: absolute;',
      '    left: 0;',
      '    top: 0;',
      '    width: 100%;',
      '    background: white;',
      '    color: #000;',
      '    padding: 0;',
      '    margin: 0;',
      '  }',
      '  .no-print, button, .backdrop, nav, .print-header-actions { display: none !important; }',
      '  .print-header {',
      '    display: flex;',
      '    justify-content: space-between;',
      '    align-items: center;',
      '    padding: 1.5cm 2cm 1cm 2cm;',
      '    border-bottom: 2px solid #e5e7eb;',
      '    margin-bottom: 1.5cm;',
      '    page-break-after: avoid;',
      '  }',
      '  .print-logo { height: 40px; width: auto; }',
      '  .print-header-info {',
      '    text-align: right;',
      '    font-size: 10pt;',
      '    color: #6b7280;',
      '    line-height: 1.5;',
      '  }',
      '  .print-content {',
      '    padding: 0 2cm;',
      '    font-size: 11pt;',
      '    line-height: 1.6;',
      '    color: #111827;',
      '  }',
      '  .print-title {',
      '    font-size: 24pt;',
      '    font-weight: 700;',
      '    color: #111827;',
      '    margin-bottom: 0.5cm;',
      '    page-break-after: avoid;',
      '  }',
      '  .print-meta {',
      '    font-size: 9pt;',
      '    color: #6b7280;',
      '    margin-bottom: 1cm;',
      '    padding-bottom: 0.5cm;',
      '    border-bottom: 1px solid #e5e7eb;',
      '  }',
      '  .print-section {',
      '    margin-bottom: 1.5cm;',
      '    page-break-inside: avoid;',
      '  }',
      '  .print-section-title {',
      '    font-size: 14pt;',
      '    font-weight: 600;',
      '    color: #111827;',
      '    margin-bottom: 0.5cm;',
      '    padding-bottom: 0.3cm;',
      '    border-bottom: 1px solid #d1d5db;',
      '  }',
      '  .print-section-content {',
      '    font-size: 11pt;',
      '    line-height: 1.7;',
      '    color: #374151;',
      '    text-align: justify;',
      '  }',
      '  .print-sources {',
      '    margin-top: 1.5cm;',
      '    padding-top: 1cm;',
      '    border-top: 1px solid #e5e7eb;',
      '    page-break-inside: avoid;',
      '  }',
      '  .print-source-item {',
      '    font-size: 9pt;',
      '    font-family: "Courier New", monospace;',
      '    color: #4b5563;',
      '    margin-bottom: 0.5cm;',
      '    padding-left: 1em;',
      '    text-indent: -1em;',
      '  }',
      '  .print-footer {',
      '    position: fixed;',
      '    bottom: 0;',
      '    left: 0;',
      '    right: 0;',
      '    padding: 0.5cm 2cm;',
      '    border-top: 1px solid #e5e7eb;',
      '    font-size: 8pt;',
      '    color: #9ca3af;',
      '    text-align: center;',
      '    background: white;',
      '  }',
      '  @page { size: A4; margin: 2cm; }',
      '  .print-section, .print-source-item { page-break-inside: avoid; }',
      '  .print-tags {',
      '    display: flex;',
      '    flex-wrap: wrap;',
      '    gap: 0.3cm;',
      '    margin-bottom: 0.5cm;',
      '  }',
      '  .print-tag {',
      '    font-size: 8pt;',
      '    padding: 0.2cm 0.4cm;',
      '    background: #f3f4f6;',
      '    border: 1px solid #d1d5db;',
      '    border-radius: 3px;',
      '    color: #4b5563;',
      '  }',
      '}',
    ].join('\n');

    const styleId = 'glossary-print-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = printStyles;

    return () => {
      // Cleanup: remove style element when component unmounts
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  if (!term) return null;

  return (
    <React.Fragment>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-bg-surface border-l border-border-subtle shadow-2xl z-[9999] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="glossary-drawer-title"
              aria-describedby="glossary-drawer-description"
            >
              {/* Print Version - Hidden on screen, visible when printing */}
              <div className="glossary-print-container" style={{ display: 'none' }}>
                {/* Print Header with Logo */}
                <div className="print-header">
                  <div className="print-logo-container">
                    <Image
                      src="/logos/tradelia-logo-variant-1-wordmark.svg"
                      alt="Tradelia"
                      width={160}
                      height={40}
                      className="print-logo"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="print-header-info">
                    <div>Glossario Finanziario Tradelia</div>
                    <div>{new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                {/* Print Content */}
                <div className="print-content">
                  {/* Print Title */}
                  <h1 className="print-title">{term.title}</h1>
                  
                  {/* Print Meta */}
                  <div className="print-meta">
                    {term.category && (
                      <div style={{ marginBottom: '0.3cm' }}>
                        <strong>Categoria:</strong> {term.category}
                      </div>
                    )}
                    {term.tags && term.tags.length > 0 && (
                      <div className="print-tags">
                        {term.tags.map((tag) => (
                          <span key={tag} className="print-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Definizione Accademica */}
                  <section className="print-section">
                    <h2 className="print-section-title">Definizione Accademica</h2>
                    <div className="print-section-content">
                      {term.what}
                    </div>
                  </section>

                  {/* Spiegazione Tecnica Tradelia AI */}
                  {term.technical && (
                    <section className="print-section">
                      <h2 className="print-section-title">Spiegazione Tecnica Tradelia AI</h2>
                      <div className="print-section-content" style={{ whiteSpace: 'pre-line' }}>
                        {term.technical}
                      </div>
                    </section>
                  )}

                  {/* Termini Correlati */}
                  {relatedTermsData.length > 0 && (
                    <section className="print-section">
                      <h2 className="print-section-title">Termini Correlati</h2>
                      <div className="print-section-content">
                        {relatedTermsData.map((relatedTerm, index) => (
                          <div key={index} style={{ marginBottom: '0.3cm' }}>
                            • {relatedTerm.title}
                            {relatedTerm.category && ` (${relatedTerm.category})`}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Fonti Accademiche */}
                  <section className="print-sources">
                    <h2 className="print-section-title">Riferimenti Bibliografici</h2>
                    <div>
                      {term.source.split('|').map((source, index) => (
                        <div key={index} className="print-source-item">
                          {source.trim()}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Print Footer */}
                <div className="print-footer">
                  Glossario Tradelia • {new Date().getFullYear()} • Fonti accademiche verificate
                </div>
              </div>
            {/* Header - Academic Style */}
            <div className="no-print border-b border-border-subtle bg-bg-surface">
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
                <div className="print-header-actions flex items-center gap-2 ml-4">
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
            <div className="no-print flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8" style={{ scrollbarWidth: 'thin' }}>
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

              {/* Spiegazione Tecnica Tradelia AI - Academic Style */}
              {term.technical && (
                <section className="space-y-3" aria-labelledby="technical-section-title">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="technical-section-title" className="text-base font-bold text-text-primary">
                        {t('glossary.drawer.technicalExplanation') || 'Spiegazione Tecnica Tradelia AI'}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-0.5">Technical Explanation (Educational Best Practice)</p>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line font-normal">
                      {term.technical}
                    </p>
                  </div>
                </section>
              )}

              {/* Termini Correlati - Academic Style */}
              {relatedTermsData.length > 0 && (
                <section className="space-y-3" aria-labelledby="related-terms-section-title">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-indigo-600 dark:text-cyan-300" aria-hidden="true" />
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
            <div className="no-print p-6 border-t border-border-subtle bg-bg-surface">
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
    </React.Fragment>
  );
}

