// Tradelia App Orchestrator v2.2 — manifest object/array, case-insensitive IDs

const $ = (s, r=document) => r.querySelector(s);

async function fetchJSON(path){
  const r = await fetch(path, { cache: 'no-store' });
  if(!r.ok) throw new Error(`HTTP ${r.status} for ${path}`);
  return r.json();
}

function getReportId(){
  const u = new URL(location.href);
  return u.searchParams.get('id') || 'sample-id';
}

// ---- Normalizzazione ID (case-insensitive) ----
const normId = id => (id || '').toString().trim().toUpperCase();
const slotId = modId => `sec-${normId(modId).toLowerCase()}`;      // es. F3O -> sec-f3o
async function importModule(modId){                                  // es. /modules/f3o.js
  return import(`/report/assets/js/modules/${normId(modId).toLowerCase()}.js`);
}

// ---- Manifest normalizer: supporta array e object ----
function normalizeManifest(m){
  if(!m) return { order: [], list: [] };

  // 1) costruiamo una mappa id->data da entrambi i formati
  // - formato A (nuovo): { modules: { "F1B": "f1b.json", ... } }
  // - formato B (storico): { modules: [ { id:"F1B", data:"f1b.json" }, ... ] }
  const map = new Map();

  if (m.modules && !Array.isArray(m.modules) && typeof m.modules === 'object') {
    for (const [k, v] of Object.entries(m.modules)) {
      if (!k || !v) continue;
      map.set(normId(k), { id: normId(k), data: v });
    }
  }

  if (Array.isArray(m.modules)) {
    for (const it of m.modules) {
      if (!it || !it.id || !it.data) continue;
      map.set(normId(it.id), { id: normId(it.id), data: it.data });
    }
  }

  // 2) order: rispetta l’ordine se presente, altrimenti usa l’ordine di inserimento
  const order = Array.isArray(m.order) && m.order.length
    ? m.order.map(normId).filter(id => map.has(id))
    : Array.from(map.keys());

  // 3) lista finale
  const list = order.map(id => map.get(id));

  return { order, list, title: m.title, id: m.id };
}

async function mountModule(reportId, spec){
  const { id: modId, data } = spec;
  const slot = document.getElementById(slotId(modId));
  if(!slot){
    console.warn('Slot mancante per', modId, '— creo dinamicamente');
    // fallback: crea un <article> dinamico coerente
    const art = document.createElement('article');
    art.id = slotId(modId);
    art.className = 'report-section';
    art.setAttribute('data-card', normId(modId));
    $('#modules')?.appendChild(art);
  }
  const slotNode = document.getElementById(slotId(modId));
  const raw = await fetchJSON(`/report/reports/${reportId}/${data}`);
  const api = await importModule(modId);
  if(typeof api.renderCard !== 'function' || typeof api.bindCard !== 'function'){
    throw new Error(`${modId} non esporta renderCard/bindCard`);
  }
  slotNode.innerHTML = api.renderCard(raw, { modId: normId(modId), reportId });
  api.bindCard(slotNode, raw, { modId: normId(modId), reportId });
}

function mountHero(header){
  const t = $('#hero-title');
  const kpi = $('#hero-kpi');
  const note = $('#hero-note');
  if(t) t.textContent = header?.CompanyName || header?.Ticker || 'Report';
  if(kpi){
    kpi.innerHTML = '';
    const pills = [
      ['Ticker', header?.Ticker],
      ['Venue', header?.Venue],
      ['Price', header?.Price?.toString?.()],
      ['Δ%', header?.ChangePct?.toString?.()],
      ['Currency', header?.Currency],
      ['Freshness', header?.Freshness],
      ['Confidence', header?.ConfidenceFinal]
    ].filter(p=>p[1]);
    pills.forEach(([k,v])=>{
      const el = document.createElement('span');
      el.className = 'pill';
      el.innerHTML = `<span class="k">${k}</span><span class="v tabular">${v}</span>`;
      kpi.appendChild(el);
    });
  }
  if(note && header?.hero_disclaimer) note.textContent = header.hero_disclaimer;
}

async function mountReport(){
  const id = getReportId();

  // header
  try { mountHero(await fetchJSON(`/report/reports/${id}/header.json`)); }
  catch { mountHero({}); }

  // manifest
  const manifestRaw = await fetchJSON(`/report/reports/${id}/manifest.json`);
  const manifest = normalizeManifest(manifestRaw);

  for (const spec of manifest.list) {
    try { await mountModule(id, spec); }
    catch (err){ console.error('Mount fallito', spec?.id, err); }
  }
}

document.addEventListener('DOMContentLoaded', mountReport);
