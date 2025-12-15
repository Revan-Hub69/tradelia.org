'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: object | object[];
  id?: string;
}

/**
 * Structured Data Component
 * Best Practice 2024-2025: Inietta JSON-LD structured data nel DOM
 * Supporta: Google Rich Snippets, AI Search, Social Media
 */
export function StructuredData({ data, id }: StructuredDataProps) {
  useEffect(() => {
    // Crea script element per JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id || 'structured-data';
    script.text = JSON.stringify(data);
    
    // Rimuovi script esistente se presente
    const existing = document.getElementById(script.id);
    if (existing) {
      existing.remove();
    }
    
    // Aggiungi al head
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const scriptToRemove = document.getElementById(script.id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
}
