// Tradelia UI Runtime v2.1 — singleton overlay, legal overlay, tooltips, tema, stampa
const overlay = $('#legal-overlay');
const body = $('#legal-body');
function close(){ overlay.hidden = true; body.innerHTML=''; document.body.style.overflow=''; }
function open(html){ body.innerHTML = html || ''; overlay.hidden = false; document.body.style.overflow='hidden'; }
document.addEventListener('click', (e)=>{
if(e.target.matches('#btn-privacy')) open(`<h3>Privacy</h3><p>Trattamento dati limitato al device. Nessun tracking esterno.</p>`);
if(e.target.matches('#btn-mifid')) open(`<h3>MiFID II</h3><p>Materiale informativo/educativo. Nessuna raccomandazione personale.</p>`);
if(e.target.matches('[data-legal-close], #legal-overlay .overlay-backdrop')) close();
});
return { open, close };
})();


// -------- Tooltips metriche (glossario) --------
async function fetchGlossary(){
try { return await (await fetch('/report/assets/glossary.json', {cache:'no-store'})).json(); }
catch { return {}; }
}


function bindMetricInfoButtons(root=document){
root.addEventListener('click', async (e)=>{
const btn = e.target.closest('[data-info]');
if(!btn) return;
const id = btn.getAttribute('data-info');
const g = await fetchGlossary();
const item = g?.[id] || { title: id, what: '—' };
const html = `<h3>${item.title||id}</h3><p>${item.what||''}</p>`;
// semplice popover inline
const pop = document.createElement('div');
pop.className = 'card';
pop.style.position = 'absolute';
pop.style.zIndex = 200;
pop.style.maxWidth = '320px';
pop.innerHTML = html;
document.body.appendChild(pop);
const r = btn.getBoundingClientRect();
pop.style.left = Math.min(r.left, window.innerWidth-340) + 'px';
pop.style.top = (r.bottom + 8) + 'px';
const close = ()=>{ pop.remove(); document.removeEventListener('click', onDoc); };
const onDoc = (ev)=>{ if(!pop.contains(ev.target) && ev.target!==btn) close(); };
setTimeout(()=>document.addEventListener('click', onDoc),0);
});
}


// -------- Share / Print / Footer --------
function bindShareAndPrint(){
$('#btn-print')?.addEventListener('click', ()=> window.print());
$('#btn-share')?.addEventListener('click', ()=>{
navigator.clipboard?.writeText(location.href);
alert('Link copiato negli appunti');
});
const y = $('#footer-year'); if(y) y.textContent = new Date().getFullYear();
}


// -------- API globale --------
window.__TradeliaUI = {
openPanel: Panel.open,
closePanel: Panel.close,
openPrivacy: (html)=>Legal.open(html),
closePrivacy: Legal.close,
bindMetricInfoButtons,
};


// -------- Bootstrap --------
(function boot(){
initTheme();
bindShareAndPrint();
bindMetricInfoButtons(document);
})();
