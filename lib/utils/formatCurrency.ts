import { useTranslations } from '@/lib/i18n/use-translations';

/**
 * Hook per formattare importi in EUR
 * Formatta sempre in Euro (EUR) senza conversione
 */
export function useFormatCurrency() {
  const { locale } = useTranslations();

  return (amount: number) => {
    return `€${amount.toLocaleString(locale === 'it' ? 'it-IT' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
}
