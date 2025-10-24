// /report/assets/js/bootstrap-inline.js
//
// Bootstrap runtime del Report Tradelia
//
// Cosa fa:
// - recupera l'id del report e chiama mountReport(id) (app.js)
// - aggiorna footer con headerData
// - inizializza help tooltip per le metriche "globali" (quelle con data-metric)
// - espone openDrawer/closeDrawer per i moduli (es. F1B)
// - gestisce chiusura drawer, popover e bottom sheet
//
// Nota importante:
//   F1B gestisce da solo i propri tooltip con data-tooltip.
//   Qui NON tocchiamo data-tooltip. Qui tocchiamo SOLO data-metric.
//   Così non sovrascriviamo la logica di F1B.
//
// Requisiti nel DOM (già presenti in index.html):
//   #drawer
//   #popover
//   #metric-sheet-overlay
//
// Requisiti globali:
//   window.Tradelia.mountReport(reportId) definita in app.js
//   window.Tradelia.headerData valorizzata da app.js
//   window.Tradelia.glossary opzionale (per i tooltip "data-metric")
//   lucide (icone)

(function(){

  /* ---------------------------------------
   * 1. Utility: prendi ID report da ?id=
   * ------------------------------------- */
  function getReportId(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id && id.trim() !== '' ? id.trim() : 'sample-id';
  }

  /* ---------------------------------------
   * 2. Footer info (Version, Snapshot ecc.)
   *    headerData arriva da app.js
   * ------------------------------------- */
  function populateFooterInfo(headerData){
    if (!headerData) return;

    const vEl   = document.getElementById('footer-version');
    const snap  = document.getElementById('footer-snapshot');
    const upEl  = document.getElementById('footer-updated');

    if (vEl && headerData.Version) {
      vEl.textContent = headerData.Version;
    }
    if (snap && headerData.Start && headerData.End){
      snap.textContent = headerData.Start + " → " + headerData.End;
    }
    if (upEl && headerData.UpdatedAt){
      upEl.textContent = headerData.UpdatedAt;
    }

    // anno footer
    const yearEl = document.getElementById('footer-year');
    if (yearEl){
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------------------------------------
   * 3. DRAWER (pannello laterale/bottom che usiamo
   *    per "Dettagli regime", MiFID, Audit ecc.)
   * ------------------------------------- */

  const drawerEl = document.getElementById('drawer');

  function ensureDrawerFooter(showAccept) {
    if (!drawerEl) return;
    const panelEl = drawerEl.querySelector('.drawer__panel');
    if (!panelEl) return;

    // se non esiste un footer .drawer__footer aggiungilo in fondo al panel
    let footerEl = drawerEl.querySelector('.drawer__footer');
    if (!footerEl) {
        footerEl = document.createElement('footer');
        footerEl.className = 'drawer__footer';
        panelEl.appendChild(footerEl);
    }

    // render pulsanti footer
    footerEl.innerHTML = `
      ${showAccept ? `
        <button class="drawer-accept-btn btn btn-sm" data-drawer-accept type="button">
          Accetto
        </button>
      ` : ''}

      <button class="drawer-close-btn btn btn-sm" data-drawer-close type="button">
        Chiudi
      </button>
    `;

    // click "Chiudi"
    const closeBtn = footerEl.querySelector('[data-drawer-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    // click "Accetto" (se presente)
    const acceptBtn = footerEl.querySelector('[data-drawer-accept]');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        // per ora: chiude soltanto
        closeDrawer();
      });
    }
  }

  function openDrawer({ title, subtitle, html, blocking = false, showAccept = false }) {
    if (!drawerEl) return;

    // header -> titolo e sottotitolo
    const titleWrap = drawerEl.querySelector('#drawer-title');
    const titleSpan = titleWrap ? titleWrap.querySelector('span') : null;
    if (titleSpan){
      titleSpan.textContent = title || 'Dettagli';
    }

    const subEl = drawerEl.querySelector('#drawer-subtitle');
    if (subEl){
      subEl.textContent = subtitle || '';
    }

    // contenuto corpo
    const contentEl = drawerEl.querySelector('#drawer-content');
    if (contentEl){
      contentEl.innerHTML = html || '';
    }

    // attributi ARIA / stato
    drawerEl.setAttribute('aria-hidden','false');
    drawerEl.setAttribute('data-blocking', blocking ? 'true' : 'false');

    // footer sticky
    ensureDrawerFooter(showAccept);
  }

  function closeDrawer(){
    if (!drawerEl) return;
    drawerEl.setAttribute('aria-hidden','true');
  }

  // chiusura drawer cliccando backdrop o bottoni data-drawer-close
  if (drawerEl){
    drawerEl.addEventListener('click', (ev) => {
      const wantsClose =
        ev.target.matches('[data-drawer-close]') ||
        ev.target.closest?.('[data-drawer-close]') ||
        ev.target.matches('.drawer__backdrop');

      if (wantsClose){
        closeDrawer();
      }
    });
  }

  // esportiamo globalmente, così i moduli (tipo f1b.js) possono chiamare window.openDrawer()
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  /* ---------------------------------------
   * 4. Tooltip "vecchi" con data-metric
   *    (hero, snapshot, Freshness, Confidence...)
   *
   *    Funziona così:
   *    - su desktop → #popover vicino al bottone
   *    - su mobile  → #metric-sheet-overlay come bottom sheet
   *
   *    Questo blocco NON tocca i bottoni F1B,
   *    perché F1B usa data-tooltip e si autogestisce.
   * ------------------------------------- */

  function initMetricHelp(){
    // DOM global tooltip elements
    const popover         = document.getElementById('popover');
    const popoverTitle    = document.getElementById('popover-title');
    const popoverText     = document.getElementById('popover-text');
    const popoverSource   = document.getElementById('popover-source');
    const popoverCloseBtn = document.getElementById('popover-close');

    const sheetOverlay    = document.getElementById('metric-sheet-overlay');
    const sheetTitle      = document.getElementById('metric-sheet-title');
    const sheetSource     = document.getElementById('metric-sheet-source');
    const sheetBody       = document.getElementById('metric-sheet-body');

    // helper: prendi testo metrica dal glossary globale
    // window.Tradelia.glossary è opzionale e ha forma tipo:
    // glossary["Freshness"] = { short:"...", long:"...", source:"..." }
    function getMetricInfo(key){
      const g = window.Tradelia?.glossary || {};
      return g[key] || {
        short: '—',
        long: '—',
        source: ''
      };
    }

    function openPopover(btn){
      if (!popover || !btn) return;
      const key  = btn.getAttribute('data-metric');
      const data = getMetricInfo(key);

      if (popoverTitle)  popoverTitle.textContent  = key || '—';
      if (popoverText)   popoverText.textContent   = data.short || '—';
      if (popoverSource) popoverSource.textContent = data.source || '';

      // posizione popover vicino al bottone
      const rect   = btn.getBoundingClientRect();
      const popW   = 320; // stimato = --pop-w
      const margin = 8;

      let left = rect.left + window.scrollX;
      let top  = rect.bottom + window.scrollY + margin;

      // clamp a destra
      const maxLeft = window.scrollX + window.innerWidth - popW - 8;
      if (left > maxLeft){
        left = maxLeft;
      }

      popover.style.position = 'absolute';
      popover.style.left = left + 'px';
      popover.style.top  = top  + 'px';

      popover.setAttribute('aria-hidden','false');
    }

    function closePopover(){
      if (popover){
        popover.setAttribute('aria-hidden','true');
      }
    }

    function openSheet(btn){
      if (!sheetOverlay || !btn) return;
      const key  = btn.getAttribute('data-metric');
      const data = getMetricInfo(key);

      if (sheetTitle)  sheetTitle.textContent  = key || '—';
      if (sheetBody)   sheetBody.textContent   = data.long || data.short || '—';
      if (sheetSource) sheetSource.textContent = data.source || '';

      sheetOverlay.setAttribute('aria-hidden','false');
    }

    function closeSheet(){
      if (sheetOverlay){
        sheetOverlay.setAttribute('aria-hidden','true');
      }
    }

    // 4a. bind click SOLO sui bottoni con data-metric
    // (questo è importante per non interferire con F1B,
    //  che usa data-tooltip e li gestisce da solo)
    const infoBtns = document.querySelectorAll('.info-btn[data-metric]');
    infoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        if (isMobile){
          openSheet(btn);
        } else {
          openPopover(btn);
        }
      });
    });

    // 4b. chiusura popover (desktop)
    if (popoverCloseBtn){
      popoverCloseBtn.addEventListener('click', closePopover);
    }

    // chiudi popover cliccando fuori / scroll
    document.addEventListener('click', (ev) => {
      if (!popover) return;
      if (popover.getAttribute('aria-hidden') === 'true') return;

      // se clicco dentro al popover → non chiudere
      if (popover.contains(ev.target)) return;

      // se clicco su .info-btn[data-metric] → gestito sopra, non chiudere prima
      if (ev.target.closest && ev.target.closest('.info-btn[data-metric]')) return;

      closePopover();
    });

    window.addEventListener('scroll', () => {
      if (popover){
        popover.setAttribute('aria-hidden','true');
      }
    }, { passive: true });

    // 4c. chiusura bottom sheet (mobile)
    // elementi che chiudono: [data-metric-close] e il backdrop sheet stesso
    if (sheetOverlay){
      sheetOverlay.addEventListener('click', (ev) => {
        const wantsClose =
          ev.target.matches('[data-metric-close]') ||
          ev.target.closest?.('[data-metric-close]') ||
          ev.target === sheetOverlay;

        if (wantsClose){
          closeSheet();
        }
      });
    }
  }

  /* ---------------------------------------
   * 5. Avvio complessivo ("boot")
   *
   *    - Legge reportId
   *    - mountReport(reportId)
   *    - popola footer
   *    - setup tooltip metriche globali
   *    - lucide icons
   * ------------------------------------- */
  async function boot(){
    const reportId = getReportId();

    // monta hero + moduli (F1..F6)
    if (window.Tradelia && typeof window.Tradelia.mountReport === 'function'){
      try {
        await window.Tradelia.mountReport(reportId);
      } catch (err){
        console.error('Errore in mountReport:', err);
      }
    } else {
      console.error('Tradelia.mountReport non disponibile. Controlla app.js');
    }

    // aggiorna footer (Version, snapshot, updatedAt)
    if (window.Tradelia && window.Tradelia.headerData){
      populateFooterInfo(window.Tradelia.headerData);
    }

    // attiva tooltip per metriche globali (Freshness, Confidence ecc.)
    initMetricHelp();

    // lucide icons refresh
    if (window.lucide && typeof window.lucide.createIcons === 'function'){
      try {
        window.lucide.createIcons();
      } catch(e){
        console.warn('lucide.createIcons() ha dato errore:', e);
      }
    }
  }

  // kickstart immediato
  boot();

})();
