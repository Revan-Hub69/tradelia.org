"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Verifica se già installata
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInStandaloneMode = (window.navigator as any).standalone === true;

    if (isStandalone || isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<{ success: boolean; error?: string }> => {
    if (!deferredPrompt) {
      return {
        success: false,
        error: "Installazione non disponibile. Usa il menu del browser per installare l'app.",
      };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstallable(false);
        return { success: true };
      }

      return { success: false, error: "Installazione annullata" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Errore durante l'installazione",
      };
    }
  };

  return {
    isInstalled,
    isInstallable: isInstallable || !!deferredPrompt,
    install,
    deferredPrompt,
  };
}
