export type Currency = 'EUR' | 'USD';

export const currencies: Currency[] = ['EUR', 'USD'];

export const currencyNames: Record<Currency, string> = {
  EUR: 'Euro',
  USD: 'US Dollar',
};

export const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
};

// Tasso di cambio EUR/USD (può essere aggiornato dinamicamente in futuro)
// Default: 1 EUR = 1.10 USD (circa)
export const DEFAULT_EXCHANGE_RATE = 1.10;

// Funzione per convertire importo
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  
  if (from === 'EUR' && to === 'USD') {
    return amount * DEFAULT_EXCHANGE_RATE;
  }
  
  if (from === 'USD' && to === 'EUR') {
    return amount / DEFAULT_EXCHANGE_RATE;
  }
  
  return amount;
}

// Funzione per formattare importo con valuta
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = 'it-IT'
): string {
  const symbol = currencySymbols[currency];
  const localeMap: Record<Currency, string> = {
    EUR: 'it-IT',
    USD: 'en-US',
  };
  
  const formattedLocale = localeMap[currency] || locale;
  
  return `${symbol}${amount.toLocaleString(formattedLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
