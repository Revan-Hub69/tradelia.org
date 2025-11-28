"use client";

import { useEffect } from "react";

export function UnregisterServiceWorker() {
  useEffect(() => {
    // Only run on client, after mount
    if (typeof window === "undefined") {
      return;
    }

    // Use requestIdleCallback or setTimeout to avoid blocking hydration
    const cleanup = () => {
      // Unregister all service workers
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {
              // Silently fail if unregister fails
            });
          });
        });
      }

      // Clear service worker cache
      if ("caches" in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName).catch(() => {
              // Silently fail if delete fails
            });
          });
        });
      }
    };

    // Defer cleanup to avoid hydration issues
    if ("requestIdleCallback" in window) {
      requestIdleCallback(cleanup, { timeout: 2000 });
    } else {
      setTimeout(cleanup, 100);
    }
  }, []);

  return null;
}
