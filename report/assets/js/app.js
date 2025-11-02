// Tradelia App Orchestrator v2.1 — manifest-driven, slots per moduli, hero snapshot


function slotId(modId){ return `sec-${modId.toLowerCase()}`; }
async function importModule(modId){ return import(`/report/assets/js/modules/${modId.toLowerCase()}.js`); }


async function mountModule(reportId, spec){
const { id: modId, data } = spec;
const slot = document.getElementById(slotId(modId));
if(!slot) { console.warn('Slot mancante', modId); return; }
const raw = await fetchJSON(`/report/reports/${reportId}/${data}`);
const api = await importModule(modId);
if(typeof api.renderCard !== 'function' || typeof api.bindCard !== 'function'){
throw new Error(`${modId} non esporta renderCard/bindCard`);
}
slot.innerHTML = api.renderCard(raw, { modId, reportId });
api.bindCard(slot, raw, { modId, reportId });
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
let header = {};
try { header = await fetchJSON(`/report/reports/${id}/header.json`); } catch {}
mountHero(header);


const manifest = await fetchJSON(`/report/reports/${id}/manifest.json`);
const list = Array.isArray(manifest.modules) ? manifest.modules.filter(m=>m && m.id && m.data) : [];
const order = Array.isArray(manifest.order) && manifest.order.length ? manifest.order : list.map(m=>m.id);
const byId = Object.fromEntries(list.map(m=>[m.id,m]));
for(const modId of order){
const spec = byId[modId];
if(!spec) continue;
try { await mountModule(id, spec); }
catch(err){ console.error('Mount fallito', modId, err); }
}
}


document.addEventListener('DOMContentLoaded', mountReport);
