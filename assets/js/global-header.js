// /assets/js/global-header.js
// Header Globale per tutte le pagine (non-report)
// Versione 2025

// ===== INIZIALIZZA HEADER GLOBALE =====
async function initGlobalHeader() {
  try {
    // Carica i18n
    const { i18n } = await import('/report/assets/js/utils/i18n.js');
    
    // Inizializza i18n
    i18n.init();
    
    // Trova header slot
    const headerSlot = document.getElementById('site-header-slot');
    if (!headerSlot) {
      console.warn('GlobalHeader: Header slot non trovato');
      return;
    }
    
    // Carica site-header component
    const { siteHeader } = await import('/report/assets/js/components/site-header.js');
    if (siteHeader && typeof siteHeader.mount === 'function') {
      // Monta header SENZA export menu (solo per pagine report)
      siteHeader.mount(headerSlot, { showExport: false });
      console.log('GlobalHeader: Header montato');
    }
    
    // Applica traduzioni a tutta la pagina dopo un breve delay
    // per assicurarsi che tutti gli elementi siano nel DOM
    setTimeout(() => {
      i18n.translatePage();
    }, 100);
    
    // Ascolta cambiamenti lingua
    window.addEventListener('languageChanged', () => {
      setTimeout(() => {
        i18n.translatePage();
      }, 50);
    });
  } catch (err) {
    console.error('GlobalHeader: Errore inizializzazione', err);
  }
}

// Auto-inizializza se DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalHeader);
} else {
  initGlobalHeader();
}

