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
      // Se PWA è installata, naviga alla dashboard
      // Il browser aprirà automaticamente la PWA se configurato così
      // Altrimenti la dashboard verificherà se è standalone e reindirizzerà se necessario
      window.location.href = DASHBOARD_URL;
      return;
    }
    
    // Se PWA non installata, mostra prompt installazione
    if (deferredPrompt) {
      installPWA();
    } else {
      showInstallInstructions();
    }
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
    
    // NON aprire la dashboard come pagina web - solo PWA installata
  }
  
  /**
   * Verifica se PWA è installata (anche se non in standalone mode)
   */
  function hasPWAInstalled() {
    // Se siamo in standalone mode, PWA è installata e aperta
    if (isPWAInstalled()) {
      return true;
    }
    
    // Verifica flag localStorage (PWA installata ma aperta nel browser)
    try {
      return localStorage.getItem('tradelia-pwa-installed') === 'true';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Handler principale: installa o apre PWA
   */
  function handleDashboardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Se PWA già installata (standalone o flag), apri
    if (hasPWAInstalled()) {
      openPWA();
      return;
    }
    
    // Se installabile, mostra prompt
    if (deferredPrompt) {
      installPWA();
      return;
    }
    
    // Altrimenti, mostra istruzioni installazione
    showInstallInstructions();
  }
  
  /**
   * Aggiorna testi CTA in base allo stato PWA (Best Practice)
   */
  function updateCTATexts() {
    const installed = hasPWAInstalled();
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
    // Trova tutti i link/pulsanti dashboard non ancora gestiti
    const dashboardLinks = document.querySelectorAll(
      'a[href="/dashboard.html"]:not([data-dashboard-handler="true"]), ' +
      'a[href*="dashboard.html"]:not([data-dashboard-handler="true"]), ' +
      'a[href="#"]:not([data-listener-added])[data-dashboard-handler="true"], ' +
      'button[data-dashboard]:not([data-dashboard-handler="true"]), ' +
      '.dashboard-link:not([data-dashboard-handler="true"]), ' +
      '[data-action="dashboard"]:not([data-dashboard-handler="true"])'
    );
    
    dashboardLinks.forEach(link => {
      // Rimuovi href se è un link
      if (link.tagName === 'A') {
        link.href = '#';
        link.setAttribute('data-dashboard-handler', 'true');
      } else {
        link.setAttribute('data-dashboard-handler', 'true');
      }
      
      // Aggiungi handler solo se non già presente
      if (!link.hasAttribute('data-listener-added')) {
        link.addEventListener('click', handleDashboardClick);
        link.setAttribute('data-listener-added', 'true');
      }
    });
    
    // Handler per pulsanti specifici (solo se non già gestiti)
    const goDashboardBtn = document.getElementById('go-dashboard-btn');
    if (goDashboardBtn && !goDashboardBtn.hasAttribute('data-listener-added')) {
      goDashboardBtn.addEventListener('click', handleDashboardClick);
      goDashboardBtn.setAttribute('data-listener-added', 'true');
    }
    
    const accessGoDashboard = document.getElementById('access-go-dashboard');
    if (accessGoDashboard && !accessGoDashboard.hasAttribute('data-listener-added')) {
      accessGoDashboard.addEventListener('click', handleDashboardClick);
      accessGoDashboard.setAttribute('data-listener-added', 'true');
    }
    
    // Aggiorna testi CTA (solo se ci sono nuovi link)
    if (dashboardLinks.length > 0) {
      updateCTATexts();
    }
  }
  
  /**
   * Inizializza quando DOM è pronto
   */
  let initTimeout = null;
  let isInitializing = false;
  
  function init() {
    if (isInitializing) return;
    isInitializing = true;
    
    initDashboardLinks();
    
    // Observer per elementi aggiunti dinamicamente (es. footer) con debounce
    const observer = new MutationObserver(() => {
      if (initTimeout) clearTimeout(initTimeout);
      initTimeout = setTimeout(() => {
        // Solo se ci sono nuovi link dashboard non ancora gestiti
        const unhandledLinks = document.querySelectorAll(
          'a[href="/dashboard.html"]:not([data-dashboard-handler="true"]), ' +
          'a[href*="dashboard.html"]:not([data-dashboard-handler="true"])'
        );
        if (unhandledLinks.length > 0) {
          initDashboardLinks();
          updateCTATexts();
        }
      }, 300);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Aggiorna testi periodicamente (per elementi caricati dopo)
    setTimeout(() => {
      updateCTATexts();
      isInitializing = false;
    }, 1000);
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
  window.isDashboardPWAInstalled = hasPWAInstalled;
})();

