'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * Provider client-side per registrare automaticamente il service worker
 * Da usare nel layout della dashboard
 */
export function ServiceWorkerProvider() {
  const { isSupported, registerServiceWorker, error } = useServiceWorker();

  useEffect(() => {
    if (isSupported) {
      registerServiceWorker();
    }
  }, [isSupported, registerServiceWorker]);

  // Log errori in console (non mostriamo UI per non disturbare)
  useEffect(() => {
    if (error) {
      console.warn('Service Worker:', error);
    }
  }, [error]);

  // Componente invisibile - solo side effects
  return null;
}

