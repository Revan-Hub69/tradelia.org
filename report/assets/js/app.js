// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI — shell minimale (2025)

(function(){
  const ROOT = document.getElementById('app-root');
  let __versionQS = ""; // cache-buster, valorizzato dopo header.json

  // -----------------------------
  // Utils
  // -----------------------------
  async function fetchJSON(path){
    const res = await fetch(path + __versionQS, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch error: ${path} (${res.status})`);
    return await res.json();
  }
  async function safeImport(path){
    return import(path + __versionQS);
  }
  function setText(id, val){
    const el = document.getElementById(id);
    if (el) el.textContent = (val ?? '—');
  }
  function fmtDate(str){
    if(!str) return '—';
    try { return new Date(str).toLocaleDateString('it-IT'); }
    catch(e){ return str; }
  }
  function getReportIdFromURL(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'sample-id';
  }
  function sectionPlaceholder(modId, msg){
    const wrap = document.createElement('article');
    wrap.id = `sec-${modId.toLowerCase()}`;
    wrap.className = 'report-section-block mb-8';
    wrap.innerHTML = `
      <div class="card-compact">
        <div class="text-[13px] text-[color:var(--muted)]">
          Modulo <strong>${modId}</strong> non disponibile: ${msg}
        </div>
      </div>`;
    ROOT.appendChild(wrap);
  }

  // -----------------------------
  // Header/Footer info (da header.json)
  // -----------------------------
  async function mountHeaderFooter(reportId){
    try {
      const header = await fetchJSON(`/report/reports/${reportId}/header.json`);
      // cache-buster (se c'è una Version la usiamo per invalidare cache)
      __versionQS = header?.Version ? `?v=${encodeURIComponent(header.Version)}` : "";

      if (header?.Ticker) document.title = `Tradelia AI · ${header.Ticker}`;
      setText('footer-company', header?.CompanyName || header?.Ticker || '—');
      setText('footer-version', header?.Version || '—');
      setText('footer-snapshot', `${header?.Start ?? '—'} → ${header?.End ?? '—'}`);
      setText('footer-updated', fmtDate(header?.UpdatedAt));
    } catch(e){
      console.warn('Header/footer non disponibili:', e);
      __versionQS = ""; // fallback
    }
  }

  // -----------------------------
  // Moduli F* (da manifest.json)
  // -----------------------------
  async function mountModules(reportId){
    let manifest = { order: ['F1B','F2','F3o','F3','F4','F5','F5B','F6','F7'] };
    try {
      const m = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
      if (Array.isArray(m?.order) && m.order.length) manifest = m;
    } catch(e){
      console.warn('Manifest mancante, uso ordine di default.');
    }

    for (const modId of manifest.order){
      const idLower = String(modId).toLowerCase();
      const jsonPath = `/report/reports/${reportId}/${idLower}.json`;
      const modPath  = `/report/assets/js/modules/${idLower}.js`;

      try {
        const json = await fetchJSON(jsonPath);
        const mod  = await safeImport(modPath);

        if (typeof mod.renderCard !== 'function'){
          sectionPlaceholder(modId, 'renderCard() non esportata');
          continue;
        }

        const cardHTML = mod.renderCard(json, { reportId, modId });
        const wrap = document.createElement('article');
        wrap.id = `sec-${idLower}`;
        wrap.className = 'report-section-block mb-8';
        wrap.innerHTML = cardHTML;
        ROOT.appendChild(wrap);

        if (typeof mod.bindCard === 'function'){
          try { mod.bindCard(wrap, json, { reportId, modId }); }
          catch(e){ console.warn(`bindCard ${modId} errore:`, e); }
        }

        // Tooltip metriche "?"
        try { window.__TradeliaUI?.bindMetricInfoButtons?.(wrap); } catch(e){}
      } catch(err){
        console.warn(`Modulo ${modId} non caricato:`, err);
        sectionPlaceholder(modId, 'file mancante o errore di parsing');
      }
    }
  }

  // -----------------------------
  // Mount completo
  // -----------------------------
  async function mountReport(){
    const reportId = getReportIdFromURL();
    if (ROOT) ROOT.innerHTML = '';
    await mountHeaderFooter(reportId);
    await mountModules(reportId);
  }

  // -----------------------------
  // Avvio
  // -----------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountReport);
  } else {
    mountReport();
  }

  // API debug opzionale
  window.TradeliaApp = { mountReport, getReportIdFromURL };

})();
