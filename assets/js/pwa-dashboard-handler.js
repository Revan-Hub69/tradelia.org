/**
 * PWA Dashboard Handler
 * Gestisce installazione e apertura della dashboard PWA
 * Sostituisce tutti i link online alla dashboard
 */

(function() {
  'use strict';
  
  const PWA_MANIFEST_URL = '/dashboard.webmanifest';
  const DASHBOARD_URL = '/dashboard.html';
  
  /**
   * Verifica se la PWA è installata (standalone mode)
   */
  function isPWAInstalled() {
    // Verifica display mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    ) {
      return true;
    }
    
    // Verifica flag localStorage (backup)
    try {
      return localStorage.getItem('tradelia-pwa-installed') === 'true';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Verifica se il browser supporta l'installazione PWA
   */
  function isPWAInstallable() {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  }
  
  /**
   * Apre la dashboard PWA installata
   */
  function openPWA() {
    if (isPWAInstalled()) {
      // Se già in PWA, ricarica
      window.location.href = DASHBOARD_URL;
      return;
    }
    
    // Prova ad aprire come PWA
    const pwaUrl = `${window.location.origin}${DASHBOARD_URL}?pwa=1`;
    
    // Su mobile iOS
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Apri in nuovo tab (iOS non supporta window.open per PWA)
      window.open(pwaUrl, '_blank');
      return;
    }
    
    // Su Android/Desktop
    window.location.href = pwaUrl;
  }
  
  /**
   * Mostra prompt installazione PWA
   */
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Aggiorna testi CTA quando prompt diventa disponibile
    updateCTATexts();
  });
  
  function installPWA() {
    if (!deferredPrompt) {
      // Se non c'è deferredPrompt, mostra istruzioni
      showInstallInstructions();
      return;
    }
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installata con successo');
        // Salva flag installazione
        try {
          localStorage.setItem('tradelia-pwa-installed', 'true');
        } catch (e) {
          console.warn('Impossibile salvare flag installazione:', e);
        }
        // Aggiorna testi CTA
        updateCTATexts();
        // Dopo installazione, apri la PWA
        setTimeout(() => {
          openPWA();
        }, 500);
      }
      deferredPrompt = null;
    });
  }
  
  // Listener per appinstalled event
  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem('tradelia-pwa-installed', 'true');
    } catch (e) {
      console.warn('Impossibile salvare flag installazione:', e);
    }
    updateCTATexts();
    deferredPrompt = null;
  });
  
  /**
   * Mostra istruzioni per installazione manuale
   */
  function showInstallInstructions() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    let message = '';
    
    if (isIOS) {
      message = 'Per installare la dashboard:\n\n1. Tocca il pulsante Condividi\n2. Seleziona "Aggiungi alla schermata Home"\n3. Apri dalla schermata Home';
    } else if (isAndroid) {
      message = 'Per installare la dashboard:\n\n1. Apri il menu del browser (tre puntini)\n2. Seleziona "Aggiungi alla schermata Home" o "Installa app"\n3. Apri dalla schermata Home';
    } else {
      message = 'Per installare la dashboard:\n\n1. Cerca l\'icona di installazione nella barra degli indirizzi\n2. Oppure apri il menu del browser e cerca "Installa app" o "Aggiungi alla schermata Home"';
    }
    
    alert(message);
    
    // Apri comunque la dashboard
    openPWA();
  }
  
  /**
   * Handler principale: installa o apre PWA
   */
  function handleDashboardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Se PWA già installata, apri
    if (isPWAInstalled()) {
      openPWA();
      return;
    }
    
    // Se installabile, mostra prompt
    if (deferredPrompt) {
      installPWA();
      return;
    }
    
    // Altrimenti, mostra istruzioni e apri
    showInstallInstructions();
  }
  
  /**
   * Aggiorna testi CTA in base allo stato PWA (Best Practice)
   */
  function updateCTATexts() {
    const installed = isPWAInstalled();
    const installable = !!deferredPrompt;
    
    // Testi secondo best practice PWA
    const textMap = {
      installed: {
        default: 'Apri la dashboard',
        short: 'Apri dashboard',
        app: 'Apri l\'app'
      },
      notInstalled: {
        default: 'Installa la dashboard',
        short: 'Installa dashboard',
        app: 'Installa l\'app'
      },
      fallback: {
        default: 'Apri la dashboard',
        short: 'Apri dashboard',
        app: 'Apri dashboard'
      }
    };
    
    let texts;
    if (installed) {
      texts = textMap.installed;
    } else if (installable) {
      texts = textMap.notInstalled;
    } else {
      texts = textMap.fallback;
    }
    
    // Trova tutti i link/pulsanti dashboard
    const dashboardLinks = document.querySelectorAll(
      'a[href="/dashboard.html"], ' +
      'a[href*="dashboard.html"], ' +
      'button[data-dashboard], ' +
      '.dashboard-link, ' +
      '[data-action="dashboard"], ' +
      '[data-dashboard-handler="true"]'
    );
    
    dashboardLinks.forEach(link => {
      const text = link.textContent.trim();
      const originalText = link.getAttribute('data-original-text') || text;
      
      // Salva testo originale se non presente
      if (!link.getAttribute('data-original-text')) {
        link.setAttribute('data-original-text', text);
      }
      
      // Pattern matching per aggiornare testi comuni (solo se contiene "dashboard")
      if (text.toLowerCase().includes('dashboard')) {
        if (text.includes('Apri la dashboard') || text.includes('Apri la dashboard gratuita') || text.includes('Apri subito la dashboard')) {
          link.textContent = installed ? 'Apri la dashboard' : (installable ? 'Installa la dashboard' : 'Apri la dashboard');
        } else if (text.includes('Vai alla dashboard') || text.includes('Vai alla dashboard delle pubblicazioni')) {
          link.textContent = installed ? 'Apri la dashboard' : (installable ? 'Installa la dashboard' : 'Apri la dashboard');
        } else if (text === 'Dashboard' || text === 'dashboard') {
          // Footer link corto - aggiorna solo aria-label
          // Non cambiare il testo per mantenere coerenza UI
        }
      }
      
      // Aggiorna aria-label se presente (sempre)
      const ariaLabel = link.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.toLowerCase().includes('dashboard')) {
        link.setAttribute('aria-label', installed ? 'Apri la dashboard' : (installable ? 'Installa la dashboard' : 'Apri la dashboard'));
      }
    });
  }
  
  /**
   * Inizializza tutti i link dashboard
   */
  function initDashboardLinks() {
    // Trova tutti i link/pulsanti dashboard
    const dashboardLinks = document.querySelectorAll(
      'a[href="/dashboard.html"], ' +
      'a[href*="dashboard.html"], ' +
      'button[data-dashboard], ' +
      '.dashboard-link, ' +
      '[data-action="dashboard"]'
    );
    
    dashboardLinks.forEach(link => {
      // Rimuovi href se è un link
      if (link.tagName === 'A') {
        link.href = '#';
        link.setAttribute('data-dashboard-handler', 'true');
      }
      
      // Aggiungi handler
      link.addEventListener('click', handleDashboardClick);
    });
    
    // Handler per pulsanti specifici
    const goDashboardBtn = document.getElementById('go-dashboard-btn');
    if (goDashboardBtn) {
      goDashboardBtn.addEventListener('click', handleDashboardClick);
    }
    
    const accessGoDashboard = document.getElementById('access-go-dashboard');
    if (accessGoDashboard) {
      accessGoDashboard.addEventListener('click', handleDashboardClick);
    }
    
    // Aggiorna testi CTA
    updateCTATexts();
    
    // Aggiorna quando deferredPrompt diventa disponibile
    if (!deferredPrompt) {
      const checkPrompt = setInterval(() => {
        if (deferredPrompt) {
          updateCTATexts();
          clearInterval(checkPrompt);
        }
      }, 500);
      
      // Timeout dopo 5 secondi
      setTimeout(() => clearInterval(checkPrompt), 5000);
    }
  }
  
  /**
   * Inizializza quando DOM è pronto
   */
  function init() {
    initDashboardLinks();
    
    // Observer per elementi aggiunti dinamicamente (es. footer)
    const observer = new MutationObserver(() => {
      initDashboardLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Aggiorna testi periodicamente (per elementi caricati dopo)
    setTimeout(updateCTATexts, 1000);
    setTimeout(updateCTATexts, 3000);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Esponi funzioni globali per uso manuale
  window.installDashboardPWA = installPWA;
  window.openDashboardPWA = function() {
    handleDashboardClick({ preventDefault: () => {}, stopPropagation: () => {} });
  };
  window.updateDashboardCTAs = updateCTATexts;
  window.isDashboardPWAInstalled = isPWAInstalled;
})();

