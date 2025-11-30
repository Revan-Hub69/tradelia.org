'use client';

import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'general';
}

/**
 * Keyboard Shortcuts Modal
 * Best Practice: Documenta tutte le scorciatoie per accessibilità (WCAG 2.1 SC 2.1.1)
 */
export function KeyboardShortcuts() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useBodyScrollLock(isOpen);

  const shortcuts: Shortcut[] = [
    {
      keys: ['Ctrl', 'K'],
      description: t('dashboard.shortcuts.globalSearch') || 'Apri ricerca globale',
      category: 'navigation',
    },
    {
      keys: ['Esc'],
      description: t('dashboard.shortcuts.close') || 'Chiudi modale/drawer',
      category: 'general',
    },
    {
      keys: ['?'],
      description: t('dashboard.shortcuts.showShortcuts') || 'Mostra questa lista',
      category: 'general',
    },
    {
      keys: ['G', 'D'],
      description: t('dashboard.shortcuts.goToDashboard') || 'Vai alla dashboard',
      category: 'navigation',
    },
    {
      keys: ['G', 'R'],
      description: t('dashboard.shortcuts.goToReports') || 'Vai ai report',
      category: 'navigation',
    },
    {
      keys: ['G', 'C'],
      description: t('dashboard.shortcuts.goToCourses') || 'Vai ai corsi',
      category: 'navigation',
    },
    {
      keys: ['G', 'S'],
      description: t('dashboard.shortcuts.goToSettings') || 'Vai alle impostazioni',
      category: 'navigation',
    },
  ];

  const filteredShortcuts = shortcuts.filter((shortcut) =>
    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.keys.some((key) => key.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const shortcutsByCategory = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-title"
            >
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-6 h-6 text-accent" />
                  <h2 id="shortcuts-title" className="text-xl font-bold text-text-primary">
                    {t('dashboard.shortcuts.title') || 'Scorciatoie da Tastiera'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-bg-soft text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={t('common.close') || 'Chiudi'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashboard.shortcuts.search') || 'Cerca scorciatoia...'}
                  className="w-full mb-6 px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                  aria-label={t('dashboard.shortcuts.search') || 'Cerca scorciatoia'}
                />

                <div className="space-y-6">
                  {Object.entries(shortcutsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                        {category === 'navigation' && (t('dashboard.shortcuts.categories.navigation') || 'Navigazione')}
                        {category === 'actions' && (t('dashboard.shortcuts.categories.actions') || 'Azioni')}
                        {category === 'general' && (t('dashboard.shortcuts.categories.general') || 'Generale')}
                      </h3>
                      <div className="space-y-2">
                        {items.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-bg-soft rounded-lg border border-border-subtle hover:border-accent/40 transition-colors"
                          >
                            <span className="text-sm text-text-primary">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <span key={keyIndex}>
                                  <kbd className="px-2 py-1 bg-bg-surface border border-border-subtle rounded text-xs font-mono text-text-secondary">
                                    {key}
                                  </kbd>
                                  {keyIndex < shortcut.keys.length - 1 && (
                                    <span className="mx-1 text-text-tertiary">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

