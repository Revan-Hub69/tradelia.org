'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen, FileText, MessageSquare, ExternalLink, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
}

export function HelpSupport() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  // Blocca scroll quando modal è aperto
  useBodyScrollLock(isOpen);

  const helpItems: HelpItem[] = [
    {
      id: 'documentation',
      title: t('dashboard.help.documentation') || 'Documentazione',
      description: t('dashboard.help.documentationDesc') || 'Documentazione completa della piattaforma',
      icon: <FileText className="w-5 h-5" />,
      href: '/documentation',
    },
  ];

  return (
    <>
      {/* Help Button - Floating */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl border border-blue-400/30 flex items-center justify-center text-white transition-all duration-200 group"
        aria-label={t('dashboard.help.open') || 'Apri aiuto e supporto'}
      >
        <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
      </motion.button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 right-4 md:bottom-24 md:right-6 w-[calc(100%-2rem)] max-w-sm z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {t('dashboard.help.title') || 'Aiuto & Supporto'}
                      </h3>
                      <p className="text-xs text-text-tertiary">
                        {t('dashboard.help.subtitle') || 'Trova risposte e risorse'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                    aria-label={t('dashboard.help.close') || 'Chiudi'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {helpItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className="flex items-start gap-3 p-3 rounded-lg bg-bg-soft border border-border-subtle hover:border-blue-400/40 transition-all duration-200 group"
                        aria-label={`${item.title} - ${item.description}${item.external ? ' (si apre in una nuova scheda)' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-text-secondary">{item.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-border-subtle bg-bg-soft/50">
                  <p className="text-xs text-text-tertiary text-center">
                    {t('dashboard.help.footer') || 'Hai bisogno di più aiuto? Contattaci'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook per tooltip contestuali
export function useHelpTooltip(content: string) {
  const [show, setShow] = useState(false);

  const tooltip = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-bg-surface border border-border-subtle rounded-lg shadow-lg text-xs text-text-secondary z-50"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-bg-surface border-r border-b border-border-subtle rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return {
    tooltip,
    showTooltip: () => setShow(true),
    hideTooltip: () => setShow(false),
    toggleTooltip: () => setShow(!show),
  };
}

