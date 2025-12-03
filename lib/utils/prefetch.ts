/**
 * Prefetch utilities for performance optimization
 * Best Practice 2024-2025: Intelligent prefetching for critical navigation
 */

/**
 * Prefetch a route when user hovers over a link
 * Best Practice: Prefetch on hover (not on mount) to avoid unnecessary requests
 */
export function prefetchOnHover(href: string) {
  if (typeof window === 'undefined') return;
  
  // Only prefetch if not already prefetched
  const link = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (link) return;

  // Create prefetch link
  const prefetchLink = document.createElement('link');
  prefetchLink.rel = 'prefetch';
  prefetchLink.href = href;
  prefetchLink.as = 'document';
  document.head.appendChild(prefetchLink);
}

/**
 * Prefetch critical routes on mount
 * Best Practice: Only prefetch routes that are likely to be visited
 */
export function prefetchCriticalRoutes() {
  if (typeof window === 'undefined') return;

  const criticalRoutes = [
    '/pricing',
    '/dashboard',
    '/glossary',
  ];

  criticalRoutes.forEach((route) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    document.head.appendChild(link);
  });
}
