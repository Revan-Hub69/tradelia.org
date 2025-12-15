'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

/**
 * Client component to update the html lang attribute dynamically
 * Best Practice W3C: lang attribute must reflect current content language
 * This prevents hydration mismatch while ensuring correct lang attribute
 */
export function HtmlLang() {
  const pathname = usePathname();
  const { locale } = useTranslations();
  
  useEffect(() => {
    // Best Practice: Use locale from translations hook (reads from localStorage first)
    // Fallback to pathname detection if hook not ready
    let detectedLocale: Locale = locale;
    
    if (!detectedLocale || detectedLocale === defaultLocale) {
      // Fallback: detect from pathname
      detectedLocale = pathname.startsWith('/en') ? 'en' : defaultLocale;
    }
    
    // Update HTML lang attribute - W3C Best Practice
    document.documentElement.lang = detectedLocale;
    
    // Update HTML dir attribute for RTL support (future-proofing)
    // Currently not needed for it/en, but ready for future languages
    const rtlLocales: Locale[] = []; // Add 'ar', 'he', etc. when needed
    document.documentElement.dir = rtlLocales.includes(detectedLocale) ? 'rtl' : 'ltr';
  }, [pathname, locale]);

  return null;
}
