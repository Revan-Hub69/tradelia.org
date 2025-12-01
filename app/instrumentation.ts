/**
 * Next.js Instrumentation Hook
 * Eseguito una volta all'avvio del server
 * 
 * Configurazione in next.config.js:
 * experimental: { instrumentationHook: true }
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('[Instrumentation] Server-side monitoring initialized');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    console.log('[Instrumentation] Edge runtime monitoring initialized');
  }
}

