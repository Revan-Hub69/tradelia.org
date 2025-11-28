'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { locales, type Locale, localeNames } from '@/lib/i18n/config';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>('it');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Detect current locale from pathname
    const detectedLocale = pathname?.startsWith('/en') ? 'en' : 'it';
    setCurrentLocale(detectedLocale);
  }, [pathname, mounted]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, mounted]);

  // Close on escape key
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, mounted]);

  const handleLocaleChange = (locale: Locale) => {
    setIsOpen(false);
    if (locale === currentLocale) return;

    // Simple locale switching - replace /en prefix or add it
    let newPath = pathname || '/';
    
    if (locale === 'it') {
      // Remove /en prefix if present
      newPath = newPath.replace(/^\/en/, '') || '/';
    } else {
      // Add /en prefix if not present
      if (!newPath.startsWith('/en')) {
        newPath = `/en${newPath === '/' ? '' : newPath}`;
      }
    }
    
    router.push(newPath);
  };

  if (!mounted) {
    // Static version for SSR
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 min-w-[44px] min-h-[44px]"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-semibold uppercase">it</span>
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[44px] min-h-[44px] hover:bg-bg-surface/60 transition-all duration-200"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
          {currentLocale}
        </span>
        <ChevronDown 
          className={cn(
            'w-3 h-3 transition-transform duration-200 text-text-tertiary',
            isOpen && 'rotate-180'
          )} 
          aria-hidden="true" 
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full mt-2 w-48 bg-bg-surface border border-border rounded-lg shadow-xl z-50 py-2 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between',
                  'hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none',
                  'group',
                  currentLocale === locale
                    ? 'text-text-primary bg-bg-elevated/50'
                    : 'text-text-secondary hover:text-text-primary'
                )}
                role="menuitem"
                aria-current={currentLocale === locale ? 'true' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors duration-200" aria-hidden="true" />
                  <span>{localeNames[locale]}</span>
                </div>
                {currentLocale === locale && (
                  <Check className="w-4 h-4 text-accent" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
