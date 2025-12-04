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

// Tasso di cambio EUR/USD (default fallback)
// Il tasso reale viene caricato da API
export const DEFAULT_EXCHANGE_RATE = 1.10;

// Funzione per ottenere il tasso di cambio (carica da API o usa cache)
export async function getCurrentExchangeRate(): Promise<number> {
  try {
    const response = await fetch('/api/currency/exchange-rate', {
      next: { revalidate: 3600 }, // Cache per 1 ora
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.rate;
    }
  } catch (error) {
    console.warn('Error fetching exchange rate:', error);
  }
  
  return DEFAULT_EXCHANGE_RATE;
}

// Funzione per convertire importo
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): number {
  if (from === to) return amount;
  
  if (from === 'EUR' && to === 'USD') {
    return amount * exchangeRate;
  }
  
  if (from === 'USD' && to === 'EUR') {
    return amount / exchangeRate;
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
