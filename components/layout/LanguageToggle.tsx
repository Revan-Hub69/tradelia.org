'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { locales, type Locale, localeNames, localePaths } from '@/lib/i18n/config';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>('it');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only detect locale after mount to avoid hydration issues
    if (!mounted) return;
    
    // Detect current locale from pathname
    const detectedLocale = pathname?.startsWith('/en') ? 'en' : 'it';
    setCurrentLocale(detectedLocale);
  }, [pathname, mounted]);

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

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[44px] min-h-[44px]"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-semibold uppercase">
          {currentLocale}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full mt-2 w-40 bg-bg-surface border border-border rounded-lg shadow-lg z-50 py-2"
            role="menu"
            aria-orientation="vertical"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-200',
                  'hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none',
                  currentLocale === locale
                    ? 'text-text-primary bg-bg-elevated/50'
                    : 'text-text-secondary'
                )}
                role="menuitem"
                aria-current={currentLocale === locale ? 'true' : undefined}
              >
                <div className="flex items-center justify-between">
                  <span>{localeNames[locale]}</span>
                  {currentLocale === locale && (
                    <span className="text-accent" aria-hidden="true">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
