'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface UsePriceUpdatesOptions {
  symbols: string[];
  interval?: number; // ms, default 30000 (30s)
  enabled?: boolean;
  onUpdate?: (updates: PriceUpdate[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook per aggiornamenti real-time dei prezzi
 * Usa polling con cache intelligente per ridurre chiamate API
 * 
 * Best Practices:
 * - Polling ogni 30s per balance tra real-time e rate limits
 * - Cache locale per evitare chiamate duplicate
 * - Exponential backoff su errori
 * - Cleanup automatico su unmount
 */
export function usePriceUpdates({
  symbols,
  interval = 30000, // 30 secondi
  enabled = true,
  onUpdate,
  onError,
}: UsePriceUpdatesOptions) {
  const { t } = useTranslations();
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const lastFetchRef = useRef<Map<string, number>>(new Map());

  const fetchPrices = useCallback(async () => {
    if (!enabled || symbols.length === 0) return;

    // Evita chiamate duplicate per lo stesso simbolo entro 5 secondi
    const now = Date.now();
    const symbolsToFetch = symbols.filter((symbol) => {
      const lastFetch = lastFetchRef.current.get(symbol);
      return !lastFetch || now - lastFetch > 5000;
    });

    if (symbolsToFetch.length === 0) return;

    // Cancella richiesta precedente se ancora in corso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Chiama API per ottenere prezzi
      const response = await fetch(
        `/api/prices?symbols=${symbolsToFetch.join(',')}`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }

      const data = await response.json();
      const updates: PriceUpdate[] = [];

      // Aggiorna cache
      const newPrices = new Map(prices);
      for (const symbol of symbolsToFetch) {
        const priceData = data[symbol];
        if (priceData) {
          const update: PriceUpdate = {
            symbol,
            price: priceData.price,
            change: priceData.change || 0,
            changePercent: priceData.changePercent || 0,
            timestamp: Date.now(),
          };
          newPrices.set(symbol, update);
          updates.push(update);
          lastFetchRef.current.set(symbol, now);
        }
      }

      setPrices(newPrices);
      retryCountRef.current = 0; // Reset retry count su successo

      if (onUpdate && updates.length > 0) {
        onUpdate(updates);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const error = err as Error;
        setError(error);
        retryCountRef.current += 1;

        // Exponential backoff: 30s, 60s, 120s, max 300s
        const backoffDelay = Math.min(30000 * Math.pow(2, retryCountRef.current - 1), 300000);

        if (onError) {
          onError(error);
        } else {
          console.error('Error fetching prices:', error);
        }

        // Riprova dopo backoff
        if (retryCountRef.current < 5) {
          setTimeout(() => {
            fetchPrices();
          }, backoffDelay);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [symbols, enabled, prices, onUpdate, onError]);

  // Setup polling
  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fetch immediato
    fetchPrices();

    // Setup interval
    intervalRef.current = setInterval(() => {
      fetchPrices();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, symbols.join(','), interval, fetchPrices]);

  // Cleanup su unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    prices: Array.from(prices.values()),
    pricesMap: prices,
    loading,
    error,
    refetch: fetchPrices,
  };
}

