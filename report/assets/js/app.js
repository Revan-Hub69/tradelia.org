// Tradelia · App Orchestrator v4.0 — manifest, hero, moduli

const App = (() => {
  const $ = (s, r=document) => r.querySelector(s);

  async function fetchJSON(path){
    const res = await fetch(path, {cache:'no-store'});
    if (!res.ok) throw new Error(`HTTP ${res.status} @ ${path}`);
    return await res.json();
  }

  /* ---------- HERO ---------- */
  function toneClass(v){
    if (v >= .85) return 'ok';
    if (v <= .65) return 'alert';
    return ''; // warn is color of bar by default
  }
  function fmtPct(x){ return (x>0?'+':'') + x.toFixed(2) + '%'; }
  function mountHero(h){
    $('#hero-title').textContent = h.CompanyName || h.Ticker || 'Report';
    $('#hero-sub').textContent = `${h.Ticker || '—'} · ${h.Venue || '—'}`;

    // Confidence
    const conf = Number(h.ConfidenceFinal ?? 0);
    const bar = $('#hero-meter-fill');
    bar.style.width = `${Math.max(0, Math.min(conf*100, 100))}%`;
    bar.className = `meter-fill ${toneClass(conf)}`;
    $('#hero-conf-val').textContent = Math.round(conf*100) + '%';
    $('.meter-track').setAttribute('aria-valuenow', String(Math.round(conf*100)));

    // Prezzo, delta, stato
    $('#hero-price').textContent = (h.Price ?? 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    $('#hero-ccy').textContent = h.Currency || '';
    $('#hero-hint').textContent = h.FreshnessLabel || '';
    const d = Number(h.ChangePct ?? 0);
    const delta = $('#hero-delta');
    delta.textContent = fmtPct(d);
    delta.className = `delta tabular ${d<0 ? 'alert' : d>0 ? 'ok' : ''}`;

    const st = $('#hero-state');
    st.textContent = h.State || '—';
    st.className = `state ${h.State?.includes('LIVE') ? 'ok' : h.State?.includes('REVIEW') ? 'warn' : h.State?.includes('HOLD') ? 'alert' : ''}`;

    // KPI table
    const kpi = $('#hero-kpi');
    const rows = [
      ['Updated', `${h.UpdatedAt || '—'} UTC`, 'Updated_info'],
      ['Window', `${h.Start || '—'} → ${h.End || '—'}`, 'Window_info'],
      ['Freshness', h.FreshnessLabel || '—', 'Freshness_info'],
      ['Confidence', (h.ConfidenceFinal!=null? h.ConfidenceFinal.toFixed(2) : '—'), 'ConfidenceFinal'],
      ['Version', h.Version || '—', 'Version_info'],
      ['Ticker', h.Ticker || '—', 'Ticker_info'],
      ['Venue', h.Venue || '—', 'Venue_info'],
      ['Currency', h.Currency || '—', 'Currency_info'],
    ];
    kpi.innerHTML = rows.map(([k,v,id]) => `
      <div class="k">${k}</div>
      <div class="v">${v} <button class="info-btn" data-info="${id}" aria-label="${k}">?</button></div>
    `).join('');
    window.__TradeliaUI?.bindInfoButtons(kpi);
  }

  /* ---------- MODULI ---------- */
  function placeholderCard(modId, path){
    return `
      <article class="report-section">
        <div class="card">
          <div class="section-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div>
              <h3 style="margin:0 0 4px 0">${modId}</h3>
              <div style="color:var(--muted);font-size:14px">Sezione modulare</div>
            </div>
            <button class="btn" data-open-panel>Dettagli →</button>
          </div>
          <p style="margin:0">Dati: <code>${path}</code></p>
        </div>
      </article>
    `;
  }

  async function mountModules(reportId){
    const manifest = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
    const grid = $('#modules');
    grid.innerHTML = '';
    const order = Array.isArray(manifest.order) ? manifest.order : Object.keys(manifest.modules||{});
    for (const mod of order){
      const file = manifest.modules?.[mod];
      if (!file) continue;
      // prova import dinamico / fallback placeholder
      const jsonPath = `/report/reports/${reportId}/${file}`;
      try {
        // se c'è un renderer dedicato: /report/assets/js/modules/<mod>.js
        const modUrl = `/report/assets/js/modules/${mod.toLowerCase()}.js`;
        const renderer = await import(modUrl).catch(()=>null);
        const data = await fetchJSON(jsonPath).catch(()=>({}));
        if (renderer?.renderCard){
          const html = renderer.renderCard(data, {modId:mod, reportId});
          const node = document.createElement('article');
          node.className = 'report-section';
          node.innerHTML = html;
          grid.appendChild(node);
          renderer.bindCard?.(node, data, {openPanel:()=>window.__TradeliaUI?.openPanel()});
        } else {
          grid.insertAdjacentHTML('beforeend', placeholderCard(mod, jsonPath));
        }
      } catch {
        grid.insertAdjacentHTML('beforeend', placeholderCard(mod, jsonPath));
      }
    }
    grid.querySelectorAll('[data-open-panel]')?.forEach(b=>b.addEventListener('click', ()=>window.__TradeliaUI?.openPanel()));
  }

  /* ---------- BOOT ---------- */
  function getReportIdFromURL(){
    const u=new URL(location.href);
    return u.searchParams.get('id') || 'sample-id';
  }
  async function mountReport(){
    const id = getReportIdFromURL();
    const header = await fetchJSON(`/report/reports/${id}/header.json`);
    mountHero(header);
    await mountModules(id);
    // title
    document.title = `Tradelia · ${header.CompanyName || header.Ticker || 'Report'}`;
  }

  return { mountReport, getReportIdFromURL };
})();

window.TradeliaApp = App;
document.addEventListener('DOMContentLoaded', () => App.mountReport().catch(console.error));
