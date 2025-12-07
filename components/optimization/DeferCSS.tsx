'use client';

import { useEffect } from 'react';

/**
 * DeferCSS Component - Performance Optimization
 * 
 * Defers non-critical CSS loading to improve LCP and FCP.
 * This component loads CSS asynchronously after initial render.
 * 
 * Best Practice: Load critical CSS inline, defer non-critical CSS
 */
export function DeferCSS() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Function to load CSS asynchronously
    const loadDeferredCSS = () => {
      // Find all stylesheets marked for defer
      const deferredStylesheets = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"][data-defer]'
      );

      deferredStylesheets.forEach((link) => {
        // Create new link element
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = link.href;
        newLink.media = 'all';
        
        // Insert after the deferred link
        link.parentNode?.insertBefore(newLink, link.nextSibling);
        
        // Remove the deferred link
        link.remove();
      });
    };

    // Load deferred CSS after initial render
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadDeferredCSS, { timeout: 2000 });
    } else {
      setTimeout(loadDeferredCSS, 100);
    }
  }, []);

  return null; // This component doesn't render anything
}
