'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { type Locale } from '@/lib/i18n/config';

/**
 * Hreflang Tags Component
 * Best Practice W3C/Google: Add hreflang tags for multilingual SEO
 * Helps search engines understand language versions of pages
 */
export function HreflangTags() {
  const pathname = usePathname();
  const { locale } = useTranslations();
  const baseUrl = 'https://tradelia.org';
  
  // Get current path without locale prefix
  const pathWithoutLocale = pathname.replace(/^\/(it|en)/, '') || '/';
  
  // Build URLs for each locale
  const itUrl = `${baseUrl}${buildLocalePath('it', pathWithoutLocale)}`;
  const enUrl = `${baseUrl}${buildLocalePath('en', pathWithoutLocale)}`;
  
  // Current page URL
  const currentUrl = `${baseUrl}${pathname}`;
  
  return (
    <>
      <link rel="alternate" hreflang="it" href={itUrl} />
      <link rel="alternate" hreflang="en" href={enUrl} />
      <link rel="alternate" hreflang="x-default" href={itUrl} />
      {/* Self-referential hreflang for current page */}
      <link rel="alternate" hreflang={locale} href={currentUrl} />
    </>
  );
}
