/**
 * Internal Linking Strategy
 * Best Practice 2024-2025: Internal linking per migliorare PageRank e indicizzazione
 */

const baseUrl = 'https://tradelia.org';

export interface InternalLink {
  url: string;
  anchor: string;
  priority: 'high' | 'medium' | 'low';
  keywords: string[];
}

/**
 * Mappa dei link interni strategici per ogni pagina
 * Migliora: PageRank distribution, crawlability, user experience
 */
export const internalLinks: Record<string, InternalLink[]> = {
  '/': [
    { url: '/pricing', anchor: 'Piani e Prezzi', priority: 'high', keywords: ['pricing', 'piani', 'prezzi'] },
    { url: '/glossary', anchor: 'Glossario Finanziario', priority: 'high', keywords: ['glossario', 'termini'] },
    { url: '/reviews', anchor: 'Recensioni Utenti', priority: 'high', keywords: ['recensioni', 'testimonianze'] },
    { url: '/dashboard', anchor: 'Dashboard', priority: 'high', keywords: ['dashboard', 'accesso'] },
    { url: '/faq', anchor: 'Domande Frequenti', priority: 'medium', keywords: ['faq', 'domande'] },
    { url: '/about', anchor: 'Chi Siamo', priority: 'medium', keywords: ['about', 'chi siamo'] },
  ],
  '/pricing': [
    { url: '/', anchor: 'Homepage', priority: 'high', keywords: ['home', 'homepage'] },
    { url: '/checkout', anchor: 'Checkout', priority: 'high', keywords: ['checkout', 'acquista'] },
    { url: '/faq', anchor: 'FAQ', priority: 'medium', keywords: ['faq', 'domande'] },
    { url: '/support', anchor: 'Supporto', priority: 'medium', keywords: ['support', 'supporto'] },
  ],
  '/glossary': [
    { url: '/', anchor: 'Homepage', priority: 'high', keywords: ['home', 'homepage'] },
    { url: '/dashboard', anchor: 'Dashboard', priority: 'medium', keywords: ['dashboard'] },
    { url: '/faq', anchor: 'FAQ', priority: 'low', keywords: ['faq'] },
  ],
  '/reviews': [
    { url: '/', anchor: 'Homepage', priority: 'high', keywords: ['home', 'homepage'] },
    { url: '/pricing', anchor: 'Piani', priority: 'medium', keywords: ['pricing', 'piani'] },
    { url: '/about', anchor: 'Chi Siamo', priority: 'low', keywords: ['about'] },
  ],
  '/faq': [
    { url: '/', anchor: 'Homepage', priority: 'high', keywords: ['home'] },
    { url: '/support', anchor: 'Supporto', priority: 'high', keywords: ['support', 'supporto'] },
    { url: '/contact', anchor: 'Contatti', priority: 'medium', keywords: ['contact', 'contatti'] },
  ],
  '/about': [
    { url: '/', anchor: 'Homepage', priority: 'high', keywords: ['home'] },
    { url: '/contact', anchor: 'Contatti', priority: 'high', keywords: ['contact'] },
    { url: '/pricing', anchor: 'Piani', priority: 'medium', keywords: ['pricing'] },
  ],
};

/**
 * Genera link interni strategici per una pagina
 */
export function getInternalLinks(path: string): InternalLink[] {
  return internalLinks[path] || [];
}

/**
 * Genera anchor text ottimizzato per SEO
 */
export function generateAnchorText(keywords: string[], defaultText: string): string {
  // Best Practice: Usa keyword principale + testo descrittivo
  return keywords.length > 0 ? `${keywords[0]} - ${defaultText}` : defaultText;
}
