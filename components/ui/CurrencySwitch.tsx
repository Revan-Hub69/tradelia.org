'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';
import { currencies, currencySymbols, currencyNames } from '@/lib/currency/config';
import { cn } from '@/lib/utils/cn';

interface CurrencySwitchProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencySwitch({ className, size = 'md' }: CurrencySwitchProps) {
  const { currency, setCurrency } = useCurrency();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-bg-soft border border-border-subtle rounded-lg p-1',
        className
      )}
      role="group"
      aria-label="Seleziona valuta"
    >
      {currencies.map((curr) => (
        <button
          key={curr}
          onClick={() => setCurrency(curr)}
          className={cn(
            'flex items-center gap-1.5 rounded-md transition-all font-medium',
            sizeClasses[size],
            currency === curr
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
          )}
          aria-pressed={currency === curr}
          aria-label={`Cambia valuta a ${currencyNames[curr]}`}
        >
          <span>{currencySymbols[curr]}</span>
          <span className="hidden sm:inline">{curr}</span>
        </button>
      ))}
    </div>
  );
}
