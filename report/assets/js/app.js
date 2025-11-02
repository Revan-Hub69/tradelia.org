// App Orchestrator v2.3 — manifest object/array, case-insensitive, HERO premium

const $ = (s, r=document) => r.querySelector(s);

async function fetchJSON(path){
  const r = await fetch(path, { cache:'no-store' });
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.json();
}
function getReportId(){ const u=new URL(location.href); return u.searchParams.get('id') || 'sample-id'; }

const normId = id => (id||'').toString().trim().toUpperCase();
const slotId = modId => `sec-${normId(modId).toLowerCase()}`;
async function importModule(modId){ return import(`./modules/${normId(modId).toLowerCase()}.js`); }

// Manifest normalizer (array o object)
function normalizeManifest(m){
  if(!m) return { order:[], list:[] };
  const map = new Map();
  if (m.modules && !Array.isArray(m.modules) && typeof m.modules === 'object'){
    for (const [k,v] of Object.entries(m.modules)){ if(!k||!v) continue; map.set(normId(k), { id:normId(k), data:v }); }
  }
  if (Array.isArray(m.modules)){
    for (const it of m.modules){ if(!it||!it.id||!it.data) continue; map.set(normId(it.id), { id:normId(it.id), data:it.data }); }
  }
  const order = Array.isArray(m.order)&&m.order.length ? m.order.map(normId).filter(id=>map.has(id)) : Array.from(map.keys());
  return { order, list: order.map(id=>map.get(id)), title:m.title, id:m.id };
}

// ---------------- HERO premium ----------------
function mountHero(h){
  const name = h?.CompanyName || 'Report';
  const tkr  = h?.Ticker || '';
  const ven  = h?.Venue || '';
  const cur  = h?.Currency || '';
  const px   = (typeof h?.Price === 'number') ? h.Price : null;
  const cp   = (typeof h?.ChangePct === 'number') ? h.ChangePct : null;
  const conf = (typeof h?.ConfidenceFinal === 'number') ? h.ConfidenceFinal : null;
  const state= h?.State || '';
  const fresh= h?.FreshnessLabel || h?.Freshness || '';
  const ver  = h?.Version;
  const upd  = h?.UpdatedAt;
  const win  = (h?.Start && h?.End) ? `${h.Start} → ${h.End}` : '';

  const tEl = $('#hero-title'); const sEl = $('#hero-sub');
  if (tEl) tEl.textContent = name;
  if (sEl) sEl.textContent = tkr && ven ? `${tkr} · ${ven}` : (tkr || ven || '');

  const tb = $('#hero-tonebar');
  if (tb){ const w = conf!=null ? Math.max(5, Math.min(100, Math.round(conf*100))) : 40; tb.style.width = w + '%'; }

  const pEl = $('#hero-price'); const ccy = $('#hero-ccy');
  if (pEl) pEl.textContent = (px!=null) ? (px.toLocaleString(undefined,{maximumFractionDigits:2})) : '—';
  if (ccy) ccy.textContent = cur || '';

  const delta = $('#hero-delta');
  if (delta){
    if (cp==null){ delta.textContent=''; delta.className='delta-chip neutral'; }
    else { const tone = cp>0?'ok':(cp<0?'alert':'neutral'); delta.className=`delta-chip ${tone} tabular`; delta.textContent=`${cp>0?'+':''}${cp.toFixed(2)}%`; }
  }

  const st = $('#hero-state');
  if (st){
    const tone = conf==null ? 'warn' : (conf>=0.85 ? 'ok' : conf>=0.65 ? 'warn' : 'alert');
    st.className = `badge ${tone}`; st.textContent = state || 'SNAPSHOT';
  }

  const kpi = $('#hero-kpi');
  if (kpi){
    kpi.innerHTML = '';
    const pills = [
      ['Ticker', tkr], ['Venue', ven], ['Freshness', fresh],
      ['Confidence', conf!=null ? conf.toFixed(2) : '—'],
      ['Version', ver], ['Updated', upd], ['Window', win]
    ].filter(([,v])=>v);
    for (const [k,v] of pills){
      const el = document.createElement('span'); el.className='pill';
      el.innerHTML = `<span class="k">${k}</span><span class="v tabular">${v}</span>`; kpi.appendChild(el);
    }
  }

  const note = $('#hero-note'); if (note && h?.hero_disclaimer) note.textContent = h.hero_disclaimer;
}

// --------------- Mount pipeline ----------------
async function mountModule(reportId, spec){
  const { id: modId, data } = spec;
  if(!document.getElementById(slotId(modId))){
    const art = document.createElement('article');
    art.id = slotId(modId); art.className='report-section'; art.setAttribute('data-card', normId(modId));
    $('#modules')?.appendChild(art);
  }
  const slotNode = document.getElementById(slotId(modId));
  const raw = await fetchJSON(`./reports/${reportId}/${data}`);
  const api = await importModule(modId);
  if(typeof api.renderCard !== 'function' || typeof api.bindCard !== 'function'){
    throw new Error(`${modId} non esporta renderCard/bindCard`);
  }
  slotNode.innerHTML = api.renderCard(raw, { modId: normId(modId), reportId });
  api.bindCard(slotNode, raw, { modId: normId(modId), reportId });
}

async function mountReport(){
  const id = getReportId();
  try { mountHero(await fetchJSON(`./reports/${id}/header.json`)); } catch { mountHero({}); }
  const manifestRaw = await fetchJSON(`./reports/${id}/manifest.json`);
  const manifest = normalizeManifest(manifestRaw);
  for (const spec of manifest.list){
    try { await mountModule(id, spec); } catch(err){ console.error('Mount fallito', spec?.id, err); }
  }
}

document.addEventListener('DOMContentLoaded', mountReport);
