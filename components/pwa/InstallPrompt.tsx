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

      // Mostra banner anche se il prompt non è ancora disponibile
      // (per dispositivi che supportano PWA ma non hanno ancora triggerato beforeinstallprompt)
      // Attendi 3 secondi dopo il load per non essere invasivo
      const timer = setTimeout(() => {
        // Verifica se è un dispositivo mobile o desktop che supporta PWA
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (!isStandalone && !isInstalled) {
          // Mostra banner anche senza prompt (l'utente può installare manualmente)
          setShowBanner(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
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

  // Non mostrare se già installata
  if (isInstalled) {
    return null;
  }

  // Mostra banner anche se non c'è ancora il prompt (per dispositivi che lo supportano)
  // Il prompt verrà mostrato quando disponibile
  if (!showBanner && !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="relative bg-gradient-to-br from-bg-surface via-bg-surface to-bg-soft border border-border-subtle rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 backdrop-blur-sm overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />
            
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <Download className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary mb-1.5">
                  Installa Tradelia
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  Installa l'app per accedere rapidamente e ricevere notifiche anche quando il browser è chiuso.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    aria-label="Installa app"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Installa
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2.5 text-text-tertiary hover:text-text-secondary text-sm font-medium transition-colors min-h-[44px]"
                    aria-label="Chiudi"
                  >
                    Più tardi
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-all duration-200 min-h-[44px] min-w-[44px]"
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

