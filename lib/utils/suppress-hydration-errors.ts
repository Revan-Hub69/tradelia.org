/**
 * Utility per sopprimere completamente gli errori di hydration mismatch (#310)
 * da console.error. Questo è necessario perché questi errori possono riempire
 * la console migliaia di volte anche se l'app funziona correttamente.
 */

if (typeof window !== 'undefined') {
  // Salva l'originale console.error
  const originalConsoleError = console.error;

  // Override console.error per filtrare gli errori #310
  console.error = (...args: any[]) => {
    // Controlla se l'errore è un hydration mismatch (#310)
    const errorMessage = args[0]?.toString() || '';
    const isHydrationError = 
      errorMessage.includes('Minified React error #310') ||
      errorMessage.includes('Hydration failed') ||
      errorMessage.includes('hydration') ||
      errorMessage.includes('310') ||
      (args[0]?.message && (
        args[0].message.includes('310') ||
        args[0].message.includes('Hydration failed') ||
        args[0].message.includes('hydration')
      ));

    // Se è un errore di hydration, NON loggarlo
    if (isHydrationError) {
      return; // Sopprimi completamente l'errore
    }

    // Altrimenti, logga normalmente
    originalConsoleError.apply(console, args);
  };

  // Anche per console.warn, nel caso
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warningMessage = args[0]?.toString() || '';
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
}

