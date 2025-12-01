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
    // IMPORTANTE: Usa un delay più lungo per assicurarsi che React abbia completato
    // completamente l'hydration prima di renderizzare. Questo previene completamente
    // qualsiasi hydration mismatch.
    // Usa requestAnimationFrame per assicurarsi che il DOM sia pronto
    if (typeof window === 'undefined') {
      return;
    }

    // Doppio requestAnimationFrame + timeout per assicurarsi che React
    // abbia completato l'hydration senza bloccare troppo a lungo
    let timer: NodeJS.Timeout | null = null;
    const rafId1 = requestAnimationFrame(() => {
      const rafId2 = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          // Verifica che il DOM sia completamente pronto
          if (document.readyState === 'complete') {
            setHasMounted(true);
          } else {
            // Se non è pronto, aspetta l'evento load
            window.addEventListener('load', () => {
              setTimeout(() => {
                setHasMounted(true);
              }, 50);
            }, { once: true });
          }
        }, 100); // Delay bilanciato per evitare hydration mismatch ma permettere funzionamento
      });
      
      return () => {
        cancelAnimationFrame(rafId2);
      };
    });

    return () => {
      cancelAnimationFrame(rafId1);
      if (timer) {
        clearTimeout(timer);
      }
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

