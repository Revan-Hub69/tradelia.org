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
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
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
        // Dopo installazione, apri la PWA
        setTimeout(() => {
          openPWA();
        }, 500);
      }
      deferredPrompt = null;
    });
  }
  
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
  }
  
  /**
   * Inizializza quando DOM è pronto
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardLinks);
  } else {
    initDashboardLinks();
  }
  
  // Esponi funzioni globali per uso manuale
  window.installDashboardPWA = installPWA;
  window.openDashboardPWA = function() {
    handleDashboardClick({ preventDefault: () => {}, stopPropagation: () => {} });
  };
})();

