/**
 * Hook per determinare se il componente è montato sul client
 * Utile per evitare hydration mismatch tra server e client
 * IMPORTANTE: Restituisce sempre false durante SSR per evitare hydration mismatch
 */
import { useState, useEffect } from "react";

export function useIsClient(): boolean {
  // IMPORTANTE: Inizializza con false e usa useEffect per evitare hydration mismatch
  // Questo garantisce che il valore sia sempre false durante SSR
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Usa requestAnimationFrame per assicurarsi che React abbia completato l'hydration
    if (typeof window === "undefined") {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsClient(true);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return isClient;
}
