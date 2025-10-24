// /report/assets/js/bootstrap-inline.js
// Ruolo: bootstrap finale del Report Runtime Tradelia
// Dipendenze attese:
// - window.Tradelia.mountReport(reportId) definita in app.js
// - window.Tradelia.headerData valorizzata da app.js (header.json)
// - window.Tradelia.glossary opzionale (glossary.json con spiegazioni metriche)
// - lucide global (caricata via <script src="https://unpkg.com/lucide@latest"></script>)

(function(){

  // =========================
  // 1. Utility per ricavare l'ID del report
  // =========================
  function getReportId(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id && id.trim() !== '' ? id.trim() : 'sample-id';
  }

  // =========================
  // 2. Popola info nel footer
  //    Usa headerData (che arriva da header.json del report)
  //    Campi attesi:
  //    - Version
  //    - Start
  //    - End
  //    - UpdatedAt
  // =========================
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
  }

  // =========================
  // 3. Sistema tooltip metriche (i bottoncini "?" con .info-btn)
  //
  //    Desktop:
  //    - apre #popover vicino al bottone
  //
  //    Mobile (<640px):
  //    - apre #metric-sheet-overlay come bottom sheet
  //
  //    Dati:
  //    - window.Tradelia.glossary deve essere un oggetto tipo:
  //        {
  //          "Freshness": {
  //            short: "Quanto è recente il dato",
  //            long:  "Misura quanto tempo è passato dall'ultimo aggiornamento...",
  //            source:"Internal / Header timestamp"
  //          },
  //          ...
  //        }
  //    Se non c'è glossary, mostriamo placeholder "—".
  // =========================
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
    const sheetCloseBtns  = document.querySelectorAll('[data-metric-close]');

    function getMetricInfo(key){
      const g = window.Tradelia?.glossary || {};
      // struttura attesa:
      // g[key] = { short:"...", long:"...", source:"..." }
      return g[key] || {
        short: '—',
        long: '—',
        source: ''
      };
    }

    function openPopover(btn){
      if (!popover || !btn) return;
      const key = btn.getAttribute('data-metric');
      const data = getMetricInfo(key);

      if (popoverTitle)  popoverTitle.textContent  = key || '—';
      if (popoverText)   popoverText.textContent   = data.short || '—';
      if (popoverSource) popoverSource.textContent = data.source || '';

      // posizioniamo il popover vicino al bottone
      const rect = btn.getBoundingClientRect();
      const popW = 320; // larghezza max stimata del popover (--pop-w)
      const margin = 8;

      let left = rect.left + window.scrollX;
      let top  = rect.bottom + window.scrollY + margin;

      // se sfora a destra, lo spostiamo a sinistra
      const maxLeft = window.scrollX + window.innerWidth - popW - 8;
      if (left > maxLeft){
        left = maxLeft;
      }

      // stile inline per posizione
      popover.style.position = 'absolute';
      popover.style.left = left + 'px';
      popover.style.top  = top + 'px';

      popover.setAttribute('aria-hidden','false');
    }

    function closePopover(){
      if (!popover) return;
      popover.setAttribute('aria-hidden','true');
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
      if (!sheetOverlay) return;
      sheetOverlay.setAttribute('aria-hidden','true');
    }

    // click sui bottoni "?"
    const infoBtns = document.querySelectorAll('.info-btn');
    infoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // mobile -> bottom sheet
        if (window.matchMedia('(max-width: 640px)').matches){
          openSheet(btn);
        } else {
          openPopover(btn);
        }
      });
    });

    // chiusura popover desktop
    if (popoverCloseBtn){
      popoverCloseBtn.addEventListener('click', closePopover);
    }

    // chiudi popover cliccando fuori
    document.addEventListener('click', (ev) => {
      if (!popover) return;
      if (popover.getAttribute('aria-hidden') === 'true') return;

      // se clicco dentro il popover, non chiudere
      if (popover.contains(ev.target)) return;

      // se clicco sul bottone info stesso, non chiudere prima di aprire
      if (ev.target.classList?.contains('info-btn')) return;

      // altrimenti chiudi
      closePopover();
    });

    // chiusura bottom sheet mobile
    sheetCloseBtns.forEach(btn => {
      btn.addEventListener('click', closeSheet);
    });
  }

  // =========================
  // 4. Boot principale
  //
  //    Passi:
  //    - trova reportId
  //    - chiama mountReport(reportId) (definito in app.js)
  //    - popola footer con headerData
  //    - attiva metric help
  //    - rigenera icone lucide
  // =========================
  async function boot(){
    const reportId = getReportId();

    // monta i moduli (F1..F6) e hero
    if (window.Tradelia && typeof window.Tradelia.mountReport === 'function'){
      try {
        await window.Tradelia.mountReport(reportId);
      } catch (err){
        console.error('Errore in mountReport:', err);
      }
    } else {
      console.error('Tradelia.mountReport non disponibile. Controlla app.js');
    }

    // popola footer con info header.json
    if (window.Tradelia && window.Tradelia.headerData){
      populateFooterInfo(window.Tradelia.headerData);
    }

    // attiva gestione tooltip / metric sheet
    initMetricHelp();

    // icone lucide (se app.js non le ha già create)
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
