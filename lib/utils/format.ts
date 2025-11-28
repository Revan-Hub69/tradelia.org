/**
 * Utility functions for formatting
 */

export function formatDate(date: Date | string, locale: string = 'it-IT'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatNumber(value: number, locale: string = 'it-IT'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale: string = 'it-IT'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
