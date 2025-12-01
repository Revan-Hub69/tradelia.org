'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * ClientOnly - Component wrapper che previene il rendering sul server
 * Utile per componenti che causano hydration mismatch
 * 
 * Usage:
 * <ClientOnly>
 *   <YourComponent />
 * </ClientOnly>
 */
interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

