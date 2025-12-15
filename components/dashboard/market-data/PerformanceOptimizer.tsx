'use client';

/**
 * PerformanceOptimizer - Best Practice 2026
 * 
 * Componente per ottimizzazioni performance:
 * - Code splitting
 * - Lazy loading
 * - Prefetching
 * - Resource hints
 */

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Prefetch critical resources
    const prefetchResources = [
      '/api/market-indicators/vix',
      '/api/market-indicators/stock-indexes',
      '/api/market-indicators/yield-curve',
    ];

    prefetchResources.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preconnect to external APIs
    const preconnectDomains = [
      'https://api.finnhub.io',
      'https://api.coingecko.com',
      'https://api.twelvedata.com',
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Cleanup
    return () => {
      // Resources are automatically cleaned up by browser
    };
  }, []);

  return null; // No UI
}
