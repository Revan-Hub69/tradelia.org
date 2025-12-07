'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useReducedMotion } from '@/lib/animations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const LANGUAGE_SELECTED_KEY = 'tradelia_language_selected';

export function InitialLanguageSelector() {
  const { locale } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      // Verifica se l'utente ha già selezionato una lingua
      const languageSelected = localStorage.getItem(LANGUAGE_SELECTED_KEY);
      const savedLocale = localStorage.getItem('tradelia_locale');
      
      // Se non c'è una preferenza salvata, mostra il selettore
      if (!languageSelected && !savedLocale) {
        // Mostra dopo un breve delay per permettere al layout di caricare
        const timer = setTimeout(() => setIsOpen(true), 300);
        return () => clearTimeout(timer);
      } else {
        // Se c'è già una preferenza, non mostrare il selettore
        setIsOpen(false);
      }
    } catch (e) {
      // localStorage non disponibile, non mostrare il selettore
      setIsOpen(false);
    }
  }, [mounted]);

  // Lock body scroll when selector is open
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    
    const originalOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleLanguageSelect = (selectedLocale: 'it' | 'en') => {
    // PRIMA: Salva immediatamente in localStorage (priorità massima)
    try {
      localStorage.setItem('tradelia_locale', selectedLocale);
      localStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
    } catch (e) {
      // localStorage non disponibile
    }

    // SECONDO: Dispatch custom event IMMEDIATAMENTE per aggiornare i componenti
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localechange', { detail: { locale: selectedLocale } }));
    }

    // TERZO: Naviga al nuovo path
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const pathWithoutLocale = currentPath.replace(/^\/(it|en)/, '') || '/';
    const newPath = buildLocalePath(selectedLocale, pathWithoutLocale);
    
    // Usa router.replace invece di push per evitare di aggiungere alla history
    router.replace(newPath);

    // Chiudi il selettore dopo un breve delay per permettere la navigazione
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const languages = [
    { code: 'it' as const, label: 'Italiano', flag: '🇮🇹', description: 'Scegli italiano' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧', description: 'Choose English' },
  ];

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[199]"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.98)',
              backdropFilter: 'blur(12px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          />
          
          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-selector-title"
            aria-describedby="language-selector-description"
          >
            <motion.div
              className="w-full max-w-md"
              initial={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { y: 20, opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0, scale: 0.95 } : { y: 20, opacity: 0, scale: 0.95 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.3 }
                  : { type: 'spring', damping: 25, stiffness: 200 }
              }
            >
              <div className="bg-bg-surface border border-border-strong rounded-2xl shadow-2xl p-8 md:p-10 text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent border border-border-accent flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-400" aria-hidden="true" />
                </div>

                {/* Title */}
                <h2 id="language-selector-title" className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                  Scegli la lingua / Choose language
                </h2>
                <p id="language-selector-description" className="text-sm md:text-base text-text-secondary mb-8">
                  Seleziona la tua lingua preferita per continuare
                </p>

                {/* Language Buttons */}
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 transition-all duration-200',
                        'flex items-center justify-center gap-3',
                        'hover:scale-[1.02] hover:shadow-lg',
                        'bg-bg-soft border-border-subtle text-text-primary hover:border-accent/40 hover:bg-bg-surface'
                      )}
                      aria-label={lang.description}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-lg font-semibold">{lang.label}</span>
                    </button>
                  ))}
                </div>

                {/* Info */}
                <p className="text-xs text-text-secondary mt-6">
                  Puoi cambiare lingua in qualsiasi momento / You can change language anytime
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

