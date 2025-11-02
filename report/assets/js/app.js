// App Orchestrator v2.6 — manifest object/array, HERO premium, KPI con "?" dinamici

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

/* ---------- HERO ---------- */
function addPill(kpiRoot, label, value, infoId){
  if(!value && value !== 0) return;
  const el = document.createElement('span');
  el.className = 'pill';
  const infoBtn = infoId ? `<button class="info-btn" data-info="${infoId}" aria-label="${label} – info">?</button>` : '';
  el.innerHTML = `<span class="k">${label}</span>${infoBtn}<span class="v tabular">${value}</span>`;
  kpiRoot.appendChild(el);
}

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

  // title/sub
  const tEl = $('#hero-title'); const sEl = $('#hero-sub');
  if (tEl) tEl.textContent = name;
  if (sEl) sEl.textContent = tkr && ven ? `${tkr} · ${ven}` : (tkr || ven || '');

  // Confidence meter
  const confPct = (typeof h?.ConfidenceFinal === 'number') ? Math.round(h.ConfidenceFinal * 100) : null;
  const fill = document.getElementById('hero-meter-fill');
  const confVal = document.getElementById('hero-conf-val');
  const track = document.querySelector('.meter-track');
  if (confVal) confVal.textContent = confPct!=null ? `${confPct}%` : '—';
  if (fill && track){
    const w = confPct!=null ? Math.min(100, Math.max(5, confPct)) : 40;
    fill.style.width = w + '%';
    const tone = confPct==null ? 'warn' : (confPct>=85 ? 'ok' : confPct>=65 ? 'warn' : 'alert');
    fill.className = `meter-fill ${tone}`;
    track.setAttribute('aria-valuenow', confPct!=null ? confPct : 0);
  }

  // Price + delta + state
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

  // KPI pills con info-btn
  const kpi = $('#hero-kpi');
  if (kpi){
    kpi.innerHTML = '';
    addPill(kpi, 'Ticker',     tkr,  'Ticker_info');
    addPill(kpi, 'Venue',      ven,  'Venue_info');
    addPill(kpi, 'Freshness',  fresh,'Freshness');
    addPill(kpi, 'Confidence', conf!=null ? conf.toFixed(2) : '—', 'ConfidenceFinal');
    addPill(kpi, 'Version',    ver,  'Version_info');
    addPill(kpi, 'Updated',    upd,  'UpdatedAt_info');
    addPill(kpi, 'Window',     win,  'SnapshotWindow_info');
    addPill(kpi, 'Currency',   cur,  'Currency_info');
  }

  const note = $('#hero-note'); if (note && h?.hero_disclaimer) note.textContent = h.hero_disclaimer;
}

/* ---------- Mount pipeline ---------- */
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
