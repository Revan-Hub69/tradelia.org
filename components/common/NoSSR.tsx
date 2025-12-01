'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * NoSSR - Component wrapper che previene COMPLETAMENTE il rendering sul server
 * e l'hydration. Renderizza solo dopo che il componente è montato sul client.
 * 
 * Questo è più aggressivo di ClientOnly - previene completamente l'hydration mismatch.
 */
interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Usa un timeout per assicurarsi che l'hydration sia completamente completata
    // prima di renderizzare il contenuto
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Non renderizzare NULLA sul server o durante l'hydration
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // Renderizza solo dopo che il componente è completamente montato
  return <div suppressHydrationWarning>{children}</div>;
}

