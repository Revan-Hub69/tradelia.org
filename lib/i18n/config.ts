/**
 * Simplified i18n config - Always Italian
 * 
 * Maintained for API compatibility and future migration to external libraries
 * 
 * TODO: Replace with next-intl or similar library when ready
 */
export const locales = ['it'] as const;
export const defaultLocale = 'it' as const;

export type Locale = 'it';

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
};

export const localePaths: Record<Locale, string> = {
  it: '/',
};
