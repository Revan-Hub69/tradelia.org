// Tradelia · App Orchestrator v4.1 — hero istituzionale + manifest loader

const App = (() => {
  const $ = (s, r=document) => r.querySelector(s);
  async function j(path){ const r=await fetch(path,{cache:'no-store'}); if(!r.ok) throw new Error(`${r.status} @ ${path}`); return r.json(); }
  function rid(){ const u=new URL(location.href); return u.searchParams.get('id')||'sample-id'; }

  /* HERO */
  function toneFromConf(c){ if(c>=0.85) return 'ok'; if(c<=0.65) return 'alert'; return 'warn'; }
  function fmtPct(x){ const s = (x>0?'+':'') + (Number.isFinite(x)?x.toFixed(2):'0.00') + '%'; return s; }

  function mountHero(h){
    const name=h?.CompanyName||h?.Ticker||'Report', tkr=h?.Ticker||'—', ven=h?.Venue||'—';
    $('#hero-title').textContent = `${name}`;
    $('#hero-sub').textContent = `${tkr} · ${ven}`;

    // Prezzo / Delta / Stato
    const price = Number.isFinite(h?.Price) ? h.Price : null;
    $('#hero-price').textContent = price!=null ? price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : '—';
    $('#hero-ccy').textContent = h?.Currency||'';
    $('#hero-hint').textContent = h?.FreshnessLabel||'';

    const d = Number(h?.ChangePct);
    const delta = $('#hero-delta');
    delta.textContent = Number.isFinite(d) ? fmtPct(d) : '—';
    delta.className = `badge delta tabular ${d<0?'alert':d>0?'ok':''}`;

    const st = $('#hero-state');
    const state = h?.State||'—';
    st.textContent = state;
    st.className = `badge state ${state.includes('LIVE')?'ok':state.includes('REVIEW')?'warn':state.includes('HOLD')?'alert':''}`;

    // Confidence (solo numero + ticks testuali)
    const c = Number(h?.ConfidenceFinal);
    const pct = Number.isFinite(c) ? Math.round(c*100) : null;
    $('#hero-conf-val').textContent = (pct!=null?`${pct}%`:'—');
    $('#hero-conf-val').className = `conf-val tabular ${toneFromConf(c)}`;

    // KPI tabellari (valori a destra, icone info sul valore)
    const kpi = $('#hero-kpi'); const rows = [];
    const windowLabel = (h?.Start&&h?.End) ? `${h.Start} → ${h.End}`:'—';
    rows.push(['Updated', (h?.UpdatedAt?`${h.UpdatedAt} UTC`:'—'), 'Updated_info']);
    rows.push(['Window', windowLabel, 'Window_info']);
    rows.push(['Freshness', h?.FreshnessLabel||'—', 'Freshness_info']);
    rows.push(['Confidence', Number.isFinite(c)?c.toFixed(2):'—', 'ConfidenceFinal']);
    rows.push(['Version', h?.Version||'—', 'Version_info']);
    rows.push(['Ticker', tkr, 'Ticker_info']);
    rows.push(['Venue', ven, 'Venue_info']);
    rows.push(['Currency', h?.Currency||'—', 'Currency_info']);
    kpi.innerHTML = rows.map(([k,v,id]) => `
      <div class="k">${k}</div>
      <div class="v">${v} <button class="info-btn" data-info="${id}" aria-label="${k}">?</button></div>
    `).join('');
    window.__TradeliaUI?.bindInfoButtons(kpi);

    document.title = `Tradelia · ${name}`;
  }

  /* MODULI */
  function sectionCard(mod, path){
    return `
      <article class="report-section">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div><h3 style="margin:0 0 4px 0">${mod}</h3><div style="color:var(--muted);font-size:14px">Sezione modulare</div></div>
            <button class="btn" data-open-panel>Dettagli →</button>
          </div>
          <p style="margin:0">Dati: <code>${path}</code></p>
        </div>
      </article>`;
  }

  async function mountModules(reportId){
    const manifest = await j(`/report/reports/${reportId}/manifest.json`);
    const grid = $('#modules'); grid.innerHTML='';
    const order = Array.isArray(manifest.order) ? manifest.order : Object.keys(manifest.modules||{});
    for(const mod of order){
      const dataFile = manifest.modules?.[mod]; if(!dataFile) continue;
      const dataPath = `/report/reports/${reportId}/${dataFile}`;
      try{
        const modUrl = `/report/assets/js/modules/${mod.toLowerCase()}.js`;
        const modAPI = await import(modUrl).catch(()=>null);
        const data = await j(dataPath).catch(()=>({}));
        if(modAPI?.renderCard){
          const node = document.createElement('article'); node.className='report-section';
          node.innerHTML = modAPI.renderCard(data,{modId:mod,reportId});
          grid.appendChild(node); modAPI.bindCard?.(node,data,{openPanel:()=>window.__TradeliaUI?.openPanel()});
        }else{
          grid.insertAdjacentHTML('beforeend', sectionCard(mod, dataPath));
        }
      }catch{
        grid.insertAdjacentHTML('beforeend', sectionCard(mod, dataPath));
      }
    }
    grid.querySelectorAll('[data-open-panel]').forEach(b=>b.addEventListener('click',()=>window.__TradeliaUI?.openPanel()));
  }

  /* BOOT */
  async function mountReport(){
    const id = rid();
    try{ mountHero(await j(`/report/reports/${id}/header.json`)); }catch{ mountHero({}); }
    await mountModules(id);
    const y=document.getElementById('footer-year'); if(y) y.textContent=new Date().getFullYear();
  }

  return { mountReport, rid };
})();

window.TradeliaApp = App;
document.addEventListener('DOMContentLoaded', ()=>App.mountReport().catch(console.error));
