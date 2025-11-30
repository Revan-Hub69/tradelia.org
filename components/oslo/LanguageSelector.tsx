'use client';

import { useOsloTranslations } from '@/lib/i18n/oslo/use-oslo-translations';
import { osloLocales, osloLocaleNames, osloLocaleFlags, type OsloLocale } from '@/lib/i18n/oslo/oslo-config';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { locale, changeLocale, loading } = useOsloTranslations();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="w-4 h-4 mr-2" />
        ...
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button variant="ghost" size="sm" className="gap-2">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{osloLocaleFlags[locale]}</span>
        <span className="hidden md:inline">{osloLocaleNames[locale]}</span>
      </Button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          {osloLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => changeLocale(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                locale === loc
                  ? 'bg-accent text-white'
                  : 'hover:bg-bg-elevated text-text-primary'
              }`}
            >
              <span>{osloLocaleFlags[loc]}</span>
              <span>{osloLocaleNames[loc]}</span>
              {locale === loc && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

