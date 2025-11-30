"use client";

import { useEffect } from "react";

/**
 * Hook per bloccare/sbloccare lo scroll del body quando modali/drawer sono aperti
 * Previene lo scroll della pagina principale quando un overlay è visibile
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isLocked) {
      // Salva la posizione corrente dello scroll
      const scrollY = window.scrollY;

      // Blocca lo scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Ripristina lo scroll
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // Ripristina la posizione dello scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
}
