/**
 * Hook per determinare se il componente è montato sul client
 * Utile per evitare hydration mismatch tra server e client
 */
import { useState, useEffect } from 'react';

export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

