'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, GraduationCap, Sparkles, FileText, ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

interface GlossaryTerm {
  title: string;
  what: string; // Spiegazione accademica
  how: string; // Spiegazione Tradelia AI
  source: string; // Fonti
}

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  term: GlossaryTerm | null;
}

/**
 * Glossary Drawer Component
 * Drawer migliorato per mostrare termini del glossario
 * Riferimento: Material Design Drawer, WCAG 2.1 - Modal/Dialog
 */
export function GlossaryDrawer({ isOpen, onClose, term }: GlossaryDrawerProps) {
  const { t } = useTranslations();

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

  // Gestione ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-gradient-to-r from-accent/10 via-transparent to-accent/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 id="glossary-drawer-title" className="text-lg font-semibold text-text-primary">
                    {term.title}
                  </h2>
                  <p id="glossary-drawer-description" className="text-xs text-text-tertiary">
                    {t('glossary.drawer.subtitle') || 'Definizione completa del termine'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                aria-label={t('common.close') || 'Chiudi drawer'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Spiegazione Accademica */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t('glossary.drawer.academicExplanation') || 'Spiegazione Accademica'}
                  </h3>
                </div>
                <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {term.what}
                  </p>
                </div>
              </section>

              {/* Spiegazione Tradelia AI */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t('glossary.drawer.tradeliaExplanation') || 'Spiegazione Tradelia AI'}
                  </h3>
                </div>
                <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {term.how}
                  </p>
                </div>
              </section>

              {/* Fonti */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {t('glossary.drawer.sources') || 'Fonti Accademiche'}
                  </h3>
                </div>
                <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
                  <div className="space-y-2">
                    {term.source.split('|').map((source, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ExternalLink className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {source.trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-subtle bg-bg-soft">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                {t('common.close') || 'Chiudi'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

