'use client';

import { useEffect } from 'react';

interface IndicatorCardSEOProps {
  indicatorId: string;
  currentValue?: string;
  chartType?: string;
}

/**
 * Minimal client-side SEO helper for indicator cards.
 * It updates document.title and a meta description and injects a JSON-LD
 * script so that client-rendered pages have basic SEO metadata available.
 *
 * This avoids using Next.js server-only metadata APIs inside client
 * components and is safe to use inside `use client` files.
 */
export function IndicatorCardSEO({ indicatorId, currentValue, chartType }: IndicatorCardSEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    const newTitle = `${indicatorId}${currentValue ? ` — ${currentValue}` : ''}`;
    if (newTitle) document.title = newTitle;

    const description = `${indicatorId}: valore attuale ${currentValue ?? 'N/A'}. Grafico: ${chartType ?? 'N/A'}.`;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = description;
    } else {
      meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    const scriptId = `indicator-seo-${indicatorId}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: indicatorId,
      description,
      measurementTechnique: chartType ?? 'unknown',
      variableMeasured: currentValue ?? undefined,
      dateModified: new Date().toISOString(),
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (script) {
      script.text = JSON.stringify(jsonLd);
    } else {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      const el = document.getElementById(scriptId);
      if (el && el.parentElement) el.parentElement.removeChild(el);
      // Keep meta description in place (may be global); removing it could be disruptive.
    };
  }, [indicatorId, currentValue, chartType]);

  return null;
}

export default IndicatorCardSEO;
