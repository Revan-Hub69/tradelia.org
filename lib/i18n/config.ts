export const locales = ['it', 'en'] as const;
export const defaultLocale = 'it' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
};

export const localePaths: Record<Locale, string> = {
  it: '/',
  en: '/en',
};
