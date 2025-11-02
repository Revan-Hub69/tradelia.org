// App Orchestrator v3 — manifest object/array, HERO minimale premium

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
function mountHero(h){
  const name=h?.CompanyName||'Report', tkr=h?.Ticker||'', ven=h?.Venue||'',
        cur=h?.Currency||'', px=Number.isFinite(h?.Price)?h.Price:null,
        cp=Number.isFinite(h?.ChangePct)?h.ChangePct:null,
        conf=Number.isFinite(h?.ConfidenceFinal)?h.ConfidenceFinal:null,
        state=h?.State||'', fresh=h?.FreshnessLabel||h?.Freshness||'',
        ver=h?.Version, upd=h?.UpdatedAt,
        win=(h?.Start&&h?.End)?`${h.Start} → ${h.End}`:'';

  $('#hero-title').textContent = name;
  $('#hero-sub').textContent = tkr && ven ? `${tkr} · ${ven}` : (tkr||ven||'');

  const pct = conf!=null ? Math.round(conf*100) : null;
  $('#hero-conf-val').textContent = pct!=null ? `${pct}%` : '—';
  const fill = $('#hero-meter-fill'); const track = document.querySelector('.meter-track');
  const tone = pct==null ? 'warn' : (pct>=85?'ok':pct>=65?'warn':'alert');
  fill.className = `meter-fill ${tone}`;
  fill.style.width = (pct!=null ? Math.max(4, Math.min(100, pct)) : 40) + '%';
  track.setAttribute('aria-valuenow', pct!=null ? pct : 0);

  $('#hero-price').textContent = (px!=null) ? px.toLocaleString(undefined,{maximumFractionDigits:2}) : '—';
  $('#hero-ccy').textContent = cur || '';
  $('#hero-hint').textContent = fresh || '';

  const d = $('#hero-delta');
  if(cp==null){ d.textContent='—'; d.className='delta'; }
  else{ const t = cp>0?'ok':cp<0?'alert':''; d.className=`delta ${t} tabular`; d.textContent = `${cp>0?'+':''}${cp.toFixed(2)}%`; }
  const st = $('#hero-state');
  st.textContent = state || 'SNAPSHOT'; st.className=`state ${tone}`;

  const kpi = $('#hero-kpi'); kpi.innerHTML='';
  const add = (k,v,id)=>{ if(!v && v!==0) return;
    const kEl=document.createElement('div'); kEl.className='k'; kEl.textContent=k;
    const vEl=document.createElement('div'); vEl.className='v';
    vEl.innerHTML = `<span class="tabular">${v}</span>${id?` <button class="info-btn" data-info="${id}">?</button>`:''}`;
    kpi.appendChild(kEl); kpi.appendChild(vEl);
  };
  add('Updated',upd,'UpdatedAt_info');
  add('Window',win,'SnapshotWindow_info');
  add('Freshness',fresh,'Freshness');
  add('Confidence',conf!=null?conf.toFixed(2):'—','ConfidenceFinal');
  add('Version',ver,'Version_info');
  add('Ticker',tkr,'Ticker_info');
  add('Venue',ven,'Venue_info');
  add('Currency',cur,'Currency_info');

  const note=$('#hero-note'); if(note && h?.hero_disclaimer) note.textContent = h.hero_disclaimer;
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
