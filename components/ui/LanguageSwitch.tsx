'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitchProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'dropdown';
}

/**
 * Language Switch Component
 * Allows users to switch between Italian and English
 * Maintains current path when switching language
 */
export function LanguageSwitch({ size = 'md', variant = 'dropdown' }: LanguageSwitchProps) {
  const { locale } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  // Calcola posizione per dropdown fixed
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLocale: 'it' | 'en') => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // PRIMA: Salva immediatamente in localStorage (priorità massima)
    try {
      localStorage.setItem('tradelia_locale', newLocale);
    } catch (e) {
      // localStorage non disponibile
    }

    // SECONDO: Dispatch custom event IMMEDIATAMENTE per aggiornare i componenti
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('localechange', { detail: { locale: newLocale } }));
    }

    // TERZO: Naviga al nuovo path
    const pathWithoutLocale = pathname.replace(/^\/(it|en)/, '') || '/';
    const newPath = buildLocalePath(newLocale, pathWithoutLocale);
    
    // Usa router.replace invece di push per evitare di aggiungere alla history
    router.replace(newPath);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const languages = [
    { code: 'it' as const, label: 'Italiano', flag: '🇮🇹' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  if (variant === 'button') {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              'border border-border-subtle',
              lang.code === locale
                ? 'bg-accent text-white border-accent'
                : 'bg-bg-soft text-text-secondary hover:bg-bg-surface hover:text-text-primary'
            )}
            aria-label={`Switch to ${lang.label}`}
            aria-pressed={lang.code === locale}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative z-[10000]">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-lg',
          'bg-bg-soft border border-border-subtle',
          'hover:bg-bg-surface hover:border-accent/40',
          'transition-colors',
          sizeClasses[size],
          'text-text-secondary hover:text-text-primary'
        )}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className={cn(size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />
        <span className="text-xs font-medium">{currentLanguage.flag}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed w-48 bg-bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-[10000]"
              style={dropdownPosition ? {
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
              } : undefined}
              role="menu"
              aria-orientation="vertical"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                    'hover:bg-bg-soft',
                    lang.code === locale
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                  role="menuitem"
                  aria-selected={lang.code === locale}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {lang.code === locale && (
                    <span className="w-2 h-2 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
