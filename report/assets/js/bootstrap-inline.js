// /report/assets/js/bootstrap-inline.js
//
// Bootstrap runtime del Report Tradelia
//
// Cosa fa:
// - recupera l'id del report e chiama mountReport(id) (app.js)
// - aggiorna il footer con headerData
// - inizializza i tooltip "globali" con data-metric (Freshness, Confidence...)
// - espone openDrawer/closeDrawer per i moduli (es. F1B)
// - gestisce chiusura drawer, popover e bottom sheet
//
// NOTE IMPORTANTI:
// - F1B usa data-tooltip e gestisce i suoi tooltip da solo (openMetricTooltip in f1b.js).
//   Qui NON tocchiamo data-tooltip. Qui tocchiamo SOLO data-metric.
// - Il listener che chiude il popover su desktop è stato aggiornato per NON chiudere
//   quando clicchi un bottone data-tooltip (F1B).
//
// Requisiti nel DOM:
//   #drawer
//   #popover
//   #metric-sheet-overlay
//
// Requisiti globali:
//   window.Tradelia.mountReport(reportId) definita in app.js
//   window.Tradelia.headerData valorizzata in app.js
//   window.Tradelia.glossary opzionale (per data-metric)
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

    const yearEl = document.getElementById('footer-year');
    if (yearEl){
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------------------------------------
   * 3. DRAWER (Dettagli regime, MiFID, Audit ecc.)
   * ------------------------------------- */

  const drawerEl = document.getElementById('drawer');

  function ensureDrawerFooter(showAccept) {
    if (!drawerEl) return;
    const panelEl = drawerEl.querySelector('.drawer__panel');
    if (!panelEl) return;

    let footerEl = drawerEl.querySelector('.drawer__footer');
    if (!footerEl) {
      footerEl = document.createElement('footer');
      footerEl.className = 'drawer__footer';
      panelEl.appendChild(footerEl);
    }

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

    const closeBtn = footerEl.querySelector('[data-drawer-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    const acceptBtn = footerEl.querySelector('[data-drawer-accept]');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        // per ora "Accetto" = chiudi
        closeDrawer();
      });
    }
  }

  function openDrawer({ title, subtitle, html, blocking = false, showAccept = false }) {
    if (!drawerEl) return;

    // titolo
    const titleWrap = drawerEl.querySelector('#drawer-title');
    const titleSpan = titleWrap ? titleWrap.querySelector('span') : null;
    if (titleSpan){
      titleSpan.textContent = title || 'Dettagli';
    }

    // sottotitolo
    const subEl = drawerEl.querySelector('#drawer-subtitle');
    if (subEl){
      subEl.textContent = subtitle || '';
    }

    // contenuto
    const contentEl = drawerEl.querySelector('#drawer-content');
    if (contentEl){
      contentEl.innerHTML = html || '';
    }

    // mostra drawer
    drawerEl.setAttribute('aria-hidden','false');
    drawerEl.setAttribute('data-blocking', blocking ? 'true' : 'false');

    // footer sticky
    ensureDrawerFooter(showAccept);
  }

  function closeDrawer(){
    if (!drawerEl) return;
    drawerEl.setAttribute('aria-hidden','true');
  }

  // chiusura drawer cliccando backdrop o pulsanti con data-drawer-close
  if (drawerEl){
    drawerEl.addEventListener('click', (ev) => {
      const wantsClose =
        ev.target.matches('[data-drawer-close]') ||
        (ev.target.closest && ev.target.closest('[data-drawer-close]')) ||
        ev.target.matches('.drawer__backdrop');

      if (wantsClose){
        closeDrawer();
      }
    });
  }

  // esponi global
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  /* ---------------------------------------
   * 4. Tooltip "globali" con data-metric
   *    (Freshness, Confidence nell'hero, ecc.)
   *
   *    Desktop → #popover vicino al bottone
   *    Mobile  → #metric-sheet-overlay come bottom sheet
   *
   *    Questo blocco NON tocca i bottoni con data-tooltip (F1B).
   *    F1B si gestisce da solo.
   * ------------------------------------- */
  function initMetricHelp(){
    const popover         = document.getElementById('popover');
    const popoverTitle    = document.getElementById('popover-title');
    const popoverText     = document.getElementById('popover-text');
    const popoverSource   = document.getElementById('popover-source');
    const popoverCloseBtn = document.getElementById('popover-close');

    const sheetOverlay    = document.getElementById('metric-sheet-overlay');
    const sheetTitle      = document.getElementById('metric-sheet-title');
    const sheetSource     = document.getElementById('metric-sheet-source');
    const sheetBody       = document.getElementById('metric-sheet-body');

    // glossary globale:
    // Tradelia.glossary["Freshness"] = { short:"...", long:"...", source:"..." }
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

      // posiziona popover sotto il bottone
      const rect   = btn.getBoundingClientRect();
      const popW   = 320; // approx --pop-w
      const margin = 8;

      let left = rect.left + window.scrollX;
      let top  = rect.bottom + window.scrollY + margin;

      // evita overflow a destra
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

    // bind click SOLO ai bottoni globali (hero ecc.) che hanno data-metric
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

    // chiusura popover manuale
    if (popoverCloseBtn){
      popoverCloseBtn.addEventListener('click', closePopover);
    }

    // chiudi popover cliccando fuori o scrollando
    document.addEventListener('click', (ev) => {
      if (!popover) return;
      if (popover.getAttribute('aria-hidden') === 'true') return;

      // se clicco DENTRO il popover, non chiudere
      if (popover.contains(ev.target)) return;

      // se clicco su un bottone info-btn[data-metric] (hero) -> non chiudere in anticipo
      if (ev.target.closest && ev.target.closest('.info-btn[data-metric]')) return;

      // se clicco su un bottone info-btn[data-tooltip] (F1B) -> non chiudere in anticipo
      // questo evita che il popover dei tooltip F1B si chiuda immediatamente su desktop
      if (ev.target.closest && ev.target.closest('.info-btn[data-tooltip]')) return;

      // altrimenti chiudi
      closePopover();
    });

    window.addEventListener('scroll', () => {
      if (popover){
        popover.setAttribute('aria-hidden','true');
      }
    }, { passive: true });

    // bottom sheet mobile chiusura:
    // chiudiamo se clicco backdrop o pulsante con data-metric-close
    if (sheetOverlay){
      sheetOverlay.addEventListener('click', (ev) => {
        const wantsClose =
          ev.target.matches('[data-metric-close]') ||
          (ev.target.closest && ev.target.closest('[data-metric-close]')) ||
          ev.target === sheetOverlay;

        if (wantsClose){
          closeSheet();
        }
      });
    }
  }

  /* ---------------------------------------
   * 5. Boot totale:
   *    - mountReport
   *    - footer
   *    - tooltip globali
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

    // aggiorna footer
    if (window.Tradelia && window.Tradelia.headerData){
      populateFooterInfo(window.Tradelia.headerData);
    }

    // attiva tooltip globali (Freshness, Confidence...)
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

  // kickstart
  boot();

})();
