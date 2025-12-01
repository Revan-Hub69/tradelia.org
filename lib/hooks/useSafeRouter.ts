/**
 * Safe Router Hook
 * Wraps useRouter with error handling to prevent "Node cannot be found" errors
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSafeRouter() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Assicurati che il router sia pronto prima di usarlo
    if (typeof window !== "undefined") {
      // Usa un piccolo delay per assicurarsi che Next.js router sia inizializzato
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Wrapper sicuro per i metodi del router
  const safeRouter = {
    ...router,
    push: (href: string, options?: any) => {
      if (isReady && typeof window !== "undefined") {
        try {
          router.push(href, options);
        } catch (error) {
          console.warn("Router push error:", error);
          // Fallback a window.location se router.push fallisce
          window.location.href = href;
        }
      }
    },
    replace: (href: string, options?: any) => {
      if (isReady && typeof window !== "undefined") {
        try {
          router.replace(href, options);
        } catch (error) {
          console.warn("Router replace error:", error);
          window.location.replace(href);
        }
      }
    },
    refresh: () => {
      if (isReady && typeof window !== "undefined") {
        try {
          router.refresh();
        } catch (error) {
          console.warn("Router refresh error:", error);
          window.location.reload();
        }
      }
    },
    back: () => {
      if (isReady && typeof window !== "undefined") {
        try {
          router.back();
        } catch (error) {
          console.warn("Router back error:", error);
          window.history.back();
        }
      }
    },
  };

  return safeRouter;
}
