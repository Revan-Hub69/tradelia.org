'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se l'app è già installata
    if (typeof window !== 'undefined') {
      // Controlla se è in standalone mode (PWA installata)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Oppure se è stata aggiunta alla home screen
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      
      if (isStandalone || isInStandaloneMode) {
        setIsInstalled(true);
        return;
      }

      // Controlla se l'utente ha già rifiutato (localStorage)
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Mostra di nuovo dopo 7 giorni
        if (daysSinceDismissed < 7) {
          return;
        }
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Previeni il prompt automatico del browser
      e.preventDefault();
      // Salva l'evento per usarlo dopo
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra il prompt di installazione
    await deferredPrompt.prompt();

    // Attendi la scelta dell'utente
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    }

    // Pulisci
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Salva il timestamp del rifiuto
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Non mostrare se già installata o se non c'è il prompt
  if (isInstalled || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  Installa Tradelia
                </h3>
                <p className="text-xs text-text-secondary mb-3">
                  Installa l'app per accedere rapidamente e ricevere notifiche anche quando il browser è chiuso.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
                    aria-label="Installa app"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Installa
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-text-tertiary hover:text-text-secondary text-sm transition-colors min-h-[44px]"
                    aria-label="Chiudi"
                  >
                    Più tardi
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-text-tertiary hover:text-text-secondary transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Chiudi banner"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

