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

    const rafId = requestAnimationFrame(() => {
      const timer = setTimeout(() => {
        setHasMounted(true);
      }, 100); // Delay più lungo per sicurezza

      return () => clearTimeout(timer);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Non renderizzare NULLA sul server o durante l'hydration
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // Renderizza solo dopo che il componente è completamente montato
  // Usa un div wrapper con suppressHydrationWarning per sicurezza
  return (
    <div suppressHydrationWarning style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}

