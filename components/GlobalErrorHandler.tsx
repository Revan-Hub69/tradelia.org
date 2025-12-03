'use client';

import { useEffect } from 'react';

/**
 * Global Error Handler Component
 * Cattura errori non gestiti a livello globale (window.onerror, unhandledrejection)
 * e li logga o mostra un notifica all'utente
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handler per errori JavaScript non catturati
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      // In production, log to error reporting service
      if (process.env.NODE_ENV === 'production') {
        // Example: logErrorToService(event.error);
      }

      // Non blocchiamo l'evento, lasciamo che ErrorBoundary o global-error.tsx lo gestisca
    };

    // Handler per Promise rejection non gestite
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // In production, log to error reporting service
      if (process.env.NODE_ENV === 'production') {
        // Example: logErrorToService(event.reason);
      }

      // Preveniamo il default behavior (che mostra l'errore in console)
      event.preventDefault();
    };

    // Aggiungi listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      }
    };
  }, []);

  return null; // Questo componente non renderizza nulla
}
