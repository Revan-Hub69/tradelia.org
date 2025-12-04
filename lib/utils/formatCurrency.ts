import { useCurrency } from '@/lib/hooks/useCurrency';
import { formatCurrency as formatCurrencyUtil, convertCurrency } from '@/lib/currency/config';
import { useTranslations } from '@/lib/i18n/use-translations';

/**
 * Hook per formattare importi con la valuta selezionata
 * Converte automaticamente da EUR (default) alla valuta selezionata
 * Usa il tasso di cambio reale da API
 */
export function useFormatCurrency() {
  const { currency, exchangeRate } = useCurrency();
  const { locale } = useTranslations();

  return (amount: number, sourceCurrency: 'EUR' | 'USD' = 'EUR') => {
    const converted = convertCurrency(amount, sourceCurrency, currency, exchangeRate);
    return formatCurrencyUtil(converted, currency, locale === 'it' ? 'it-IT' : 'en-US');
  };
}
