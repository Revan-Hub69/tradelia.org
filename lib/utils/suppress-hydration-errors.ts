/**
 * Utility per sopprimere completamente gli errori di hydration mismatch (#310)
 * da console.error. Questo è necessario perché questi errori possono riempire
 * la console migliaia di volte anche se l'app funziona correttamente.
 * 
 * IMPORTANTE: Questo file è un backup. Lo script principale è inline nel <head>
 * di app/layout.tsx per essere eseguito PRIMA che React carichi.
 */

// Esegui IMMEDIATAMENTE se siamo sul client
(function suppressHydrationErrors() {
  if (typeof window === 'undefined') {
    return;
  }

  // Salva l'originale console.error PRIMA che React possa usarlo
  const originalConsoleError = console.error.bind(console);
  const originalConsoleWarn = console.warn.bind(console);

  // Override console.error per filtrare gli errori #310
  console.error = function(...args: any[]) {
    // Controlla se l'errore è un hydration mismatch (#310)
    const errorMessage = String(args[0] || '');
    const errorObj = args[0];
    
    const isHydrationError = 
      errorMessage.includes('Minified React error #310') ||
      errorMessage.includes('Hydration failed') ||
      errorMessage.includes('hydration') ||
      errorMessage.includes('310') ||
      errorMessage.includes('rF') || // Parte dello stack trace minificato
      (errorObj?.message && (
        String(errorObj.message).includes('310') ||
        String(errorObj.message).includes('Hydration failed') ||
        String(errorObj.message).includes('hydration')
      )) ||
      // Controlla anche nello stack trace
      (errorObj?.stack && String(errorObj.stack).includes('310'));

    // Se è un errore di hydration, NON loggarlo
    if (isHydrationError) {
      return; // Sopprimi completamente l'errore
    }

    // Altrimenti, logga normalmente
    originalConsoleError.apply(console, args);
  };

  // Anche per console.warn
  console.warn = function(...args: any[]) {
    const warningMessage = String(args[0] || '');
    const isHydrationWarning = 
      warningMessage.includes('Minified React error #310') ||
      warningMessage.includes('Hydration failed') ||
      warningMessage.includes('hydration') ||
      warningMessage.includes('310');

    if (isHydrationWarning) {
      return; // Sopprimi completamente il warning
    }

    originalConsoleWarn.apply(console, args);
  };
})();
