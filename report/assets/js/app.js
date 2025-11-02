// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI (versione shell minimale 2025)

(function(){
  const App = {};
  const ROOT = document.getElementById('app-root');

  // -----------------------------
  // Utility helpers
  // -----------------------------
  async function fetchJSON(path){
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch error: ${path}`);
    return await res.json();
  }

  function setText(id, val){
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
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

  // -----------------------------
  // Mount: header & footer info
  // -----------------------------
  async function mountHeaderFooter(reportId){
    try {
      const header = await fetchJSON(`/report/reports/${reportId}/header.json`);
      // HERO minimal: se esiste un titolo o ticker
      if (header?.Ticker) document.title = `Tradelia AI · ${header.Ticker}`;
      setText('footer-company', header?.CompanyName || header?.Ticker || '—');
      setText('footer-version', header?.Version || '—');
      setText('footer-snapshot', `${header?.Start ?? '—'} → ${header?.End ?? '—'}`);
      setText('footer-updated', fmtDate(header?.UpdatedAt));
    } catch(e){
      console.warn('Header footer error', e);
    }
  }

  // -----------------------------
  // Mount: moduli F*
  // -----------------------------
  async function mountModules(reportId){
    let manifest = { order: ['F1B','F2','F3o','F3','F4','F5','F5B','F6'] };
    try {
      const m = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
      if (m?.order) manifest = m;
    } catch(e){ console.warn('Manifest default used'); }

    for (const modId of manifest.order){
      try {
        const json = await fetchJSON(`/report/reports/${reportId}/${modId.toLowerCase()}.json`);
        const mod  = await import(`/report/assets/js/modules/${modId.toLowerCase()}.js`);
        const cardHTML = mod.renderCard(json, { reportId, modId });
        const wrap = document.createElement('article');
        wrap.id = `sec-${modId.toLowerCase()}`;
        wrap.className = 'report-section-block mb-8';
        wrap.innerHTML = cardHTML;
        ROOT.appendChild(wrap);

        if (typeof mod.bindCard === 'function'){
          try { mod.bindCard(wrap, json, { reportId, modId }); } catch(e){ console.warn(`Bind ${modId}`, e); }
        }
        if (window.__TradeliaUI?.bindMetricInfoButtons){
          try { window.__TradeliaUI.bindMetricInfoButtons(wrap); } catch(e){}
        }
      } catch(err){
        console.warn(`Modulo ${modId} non caricato`, err);
      }
    }
  }

  // -----------------------------
  // Mount report completo
  // -----------------------------
  async function mountReport(){
    const reportId = getReportIdFromURL();
    ROOT.innerHTML = ''; // pulisci
    await mountHeaderFooter(reportId);
    await mountModules(reportId);
  }

  // -----------------------------
  // Avvio
  // -----------------------------
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountReport);
  else mountReport();

  window.TradeliaApp = { mountReport, getReportIdFromURL };
})();
