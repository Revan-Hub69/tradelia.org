'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { Currency } from '@/lib/currency/config';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/currency/config';

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  isLoadingRate: boolean;
} | null>(null);

const CURRENCY_STORAGE_KEY = 'tradelia_currency';
const EXCHANGE_RATE_CACHE_KEY = 'tradelia_exchange_rate_cache';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  useEffect(() => {
    // Carica valuta salvata dal localStorage
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === 'EUR' || saved === 'USD') {
      setCurrencyState(saved);
    }

    // Carica tasso di cambio
    const loadExchangeRate = async () => {
      setIsLoadingRate(true);
      
      // Check cache first
      try {
        const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
        if (cached) {
          const { rate, timestamp } = JSON.parse(cached);
          const now = Date.now();
          // Cache valida per 24 ore
          if (now - timestamp < 24 * 60 * 60 * 1000) {
            setExchangeRate(rate);
            setIsLoadingRate(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Error reading exchange rate cache:', error);
      }

      // Fetch from API
      try {
        const response = await fetch('/api/currency/exchange-rate');
        if (response.ok) {
          const data = await response.json();
          const rate = data.rate || DEFAULT_EXCHANGE_RATE;
          setExchangeRate(rate);
          
          // Cache the rate
          localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify({
            rate,
            timestamp: Date.now(),
          }));
        } else {
          setExchangeRate(DEFAULT_EXCHANGE_RATE);
        }
      } catch (error) {
        console.warn('Error fetching exchange rate:', error);
        setExchangeRate(DEFAULT_EXCHANGE_RATE);
      } finally {
        setIsLoadingRate(false);
      }
    };

    loadExchangeRate();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, isLoadingRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
