'use client';

import { useEffect } from 'react';

interface DeferScriptProps {
  id: string;
  children: string;
  type?: string;
}

/**
 * DeferScript - Carica script non critici dopo il rendering iniziale
 * Best Practice: Defer non-critical JavaScript per migliorare TBT e LCP
 */
export function DeferScript({ id, children, type = 'application/ld+json' }: DeferScriptProps) {
  useEffect(() => {
    // Carica script dopo che la pagina è stata renderizzata
    const script = document.createElement('script');
    script.id = id;
    script.type = type;
    script.textContent = children;
    script.defer = true;
    
    // Aggiungi al DOM dopo che tutto è stato caricato
    const loadScript = () => {
      if (!document.getElementById(id)) {
        document.head.appendChild(script);
      }
    };

    // Carica dopo che la pagina è interattiva
    if (document.readyState === 'complete') {
      loadScript();
    } else {
      window.addEventListener('load', loadScript, { once: true });
    }

    return () => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [id, children, type]);

  return null;
}
