'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

/**
 * Client component to update the html lang attribute dynamically
 * This prevents hydration mismatch while ensuring correct lang attribute
 */
export function HtmlLang() {
  const pathname = usePathname();
  
  useEffect(() => {
    const locale: Locale = pathname.startsWith('/en') ? 'en' : defaultLocale;
    document.documentElement.lang = locale;
  }, [pathname]);

  return null;
}
