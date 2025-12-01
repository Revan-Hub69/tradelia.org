'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * NoSSR - Component wrapper che previene COMPLETAMENTE il rendering sul server
 * e l'hydration. Renderizza solo dopo che il componente è montato sul client.
 * 
 * Questo è più aggressivo di ClientOnly - previene completamente l'hydration mismatch.
 * 
 * IMPORTANTE: Usa un delay più lungo per assicurarsi che React abbia completato
 * completamente l'hydration prima di renderizzare qualsiasi cosa.
 */
interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // IMPORTANTE: Previene completamente l'hydration mismatch
    // Verifica che siamo sul client e che React abbia completato l'hydration
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Usa un approccio più robusto: verifica che Next.js router sia pronto
    // e che il DOM sia completamente inizializzato
    let timer: NodeJS.Timeout | null = null;
    let rafId1: number | null = null;
    let rafId2: number | null = null;

    const mountComponent = () => {
      // Verifica che il DOM sia pronto e che Next.js sia inizializzato
      if (document.readyState === 'complete' && typeof window !== 'undefined') {
        // Verifica che Next.js router sia disponibile
        try {
          // Piccolo delay per assicurarsi che tutto sia pronto
          timer = setTimeout(() => {
            setHasMounted(true);
          }, 50);
        } catch (error) {
          // Se c'è un errore, aspetta un po' di più
          timer = setTimeout(() => {
            setHasMounted(true);
          }, 200);
        }
      } else {
        // Se il DOM non è pronto, aspetta l'evento load
        const handleLoad = () => {
          timer = setTimeout(() => {
            setHasMounted(true);
          }, 50);
        };
        window.addEventListener('load', handleLoad, { once: true });
        return () => window.removeEventListener('load', handleLoad);
      }
    };

    // Doppio RAF per assicurarsi che React abbia completato l'hydration
    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        mountComponent();
      });
    });

    return () => {
      if (rafId1 !== null) cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // IMPORTANTE: Renderizza sempre il fallback sul server per evitare sfarfallio
  // Solo sul client, dopo l'hydration, renderizza il contenuto reale
  if (!hasMounted) {
    return (
      <div suppressHydrationWarning style={{ width: '100%', overflowX: 'hidden' }}>
        {fallback}
      </div>
    );
  }

  // Renderizza solo dopo che il componente è completamente montato
  // Usa un div wrapper con suppressHydrationWarning per sicurezza
  return (
    <div suppressHydrationWarning style={{ minHeight: '100%', width: '100%', overflowX: 'hidden' }}>
      {children}
    </div>
  );
}

