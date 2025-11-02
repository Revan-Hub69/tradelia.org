// UI Runtime v2.2 — tema, share, print, overlay, legal, tooltips

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

function initTheme(){
  const html = document.documentElement;
  const saved = localStorage.getItem('tradelia-theme');
  const start = saved || 'dark';
  html.setAttribute('data-theme', start);
  const btn = $('#btn-theme');
  if(btn){
    btn.setAttribute('aria-pressed', start === 'dark' ? 'false' : 'true');
    btn.addEventListener('click', ()=>{
      const cur = html.getAttribute('data-theme');
      const next = (cur === 'dark') ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('tradelia-theme', next);
      btn.setAttribute('aria-pressed', next === 'dark' ? 'false' : 'true');
    });
  }
}

function initShareAndPrint(){
  $('#btn-print')?.addEventListener('click', ()=> window.print());
  $('#btn-share')?.addEventListener('click', async ()=>{
    const shareData = { title: document.title, url: location.href };
    if (navigator.share){
      try { await navigator.share(shareData); }
      catch { /* utente ha annullato */ }
    } else {
      try { await navigator.clipboard.writeText(location.href); toast('Link copiato'); }
      catch { alert(location.href); }
    }
  });
  const y = $('#footer-year'); if(y) y.textContent = new Date().getFullYear();
}

function toast(msg){
  const n = document.createElement('div');
  n.textContent = msg;
  n.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#1f2328;color:#fff;border:1px solid #333;padding:8px 12px;border-radius:10px;z-index:999;opacity:0;transition:opacity .2s ease';
  document.body.appendChild(n); requestAnimationFrame(()=>{n.style.opacity=1}); setTimeout(()=>{n.style.opacity=0; setTimeout(()=>n.remove(),200)},1600);
}

// -------- Overlay Analitico --------
const Panel = (() =>{
  const overlay = $('#panel-overlay'); const tabs = $('#panel-tabs');
  const body = $('#panel-body'); const title = $('#panel-title'); const foot = $('#panel-foot');
  let renderFn = null;
  function close(){ overlay.hidden=true; tabs.innerHTML=''; body.innerHTML=''; foot.innerHTML=''; renderFn=null; document.body.style.overflow=''; }
  function open(opts){
    const { title: t, tabs: ts=[], render } = opts || {};
    renderFn = render; title.textContent = t || 'Dettaglio'; tabs.innerHTML = '';
    ts.forEach((tb,i)=>{
      const b = document.createElement('button'); b.className='tab'; b.type='button';
      b.setAttribute('role','tab'); b.setAttribute('data-tab', tb.id); b.setAttribute('aria-selected', i===0?'true':'false'); b.textContent=tb.label;
      tabs.appendChild(b);
    });
    overlay.hidden=false; document.body.style.overflow='hidden'; if(ts[0]) renderTab(ts[0].id);
  }
  function renderTab(id){ if(!renderFn) return; body.scrollTop=0; body.innerHTML = renderFn(id) || ''; }
  tabs?.addEventListener('click', e=>{ const b=e.target.closest('[data-tab]'); if(!b) return; $$('.tab',tabs).forEach(x=>x.setAttribute('aria-selected','false')); b.setAttribute('aria-selected','true'); renderTab(b.getAttribute('data-tab'));});
  overlay?.addEventListener('click', e=>{ if(e.target.matches('.overlay-backdrop,[data-overlay-close]')) close(); });
  window.addEventListener('keydown', e=>{ if(!overlay || overlay.hidden) return; if(e.key==='Escape') close(); });
  return { open, close };
})();

// -------- Overlay Legale --------
(function legal(){
  const overlay = $('#legal-overlay'); const body = $('#legal-body');
  function close(){ overlay.hidden=true; body.innerHTML=''; document.body.style.overflow=''; }
  function open(html){ body.innerHTML= html || ''; overlay.hidden=false; document.body.style.overflow='hidden'; }
  document.addEventListener('click', (e)=>{
    if(e.target.matches('#btn-privacy')) open('<h3>Privacy</h3><p>Nessun tracking esterno. Dati locali.</p>');
    if(e.target.matches('#btn-mifid')) open('<h3>MiFID II</h3><p>Materiale informativo/educativo. Nessuna raccomandazione personale.</p>');
    if(e.target.matches('[data-legal-close], #legal-overlay .overlay-backdrop')) close();
  });
  window.__Legal = { open, close };
})();

// -------- Tooltips metriche --------
async function fetchGlossary(){ try { return await (await fetch('./assets/glossary.json',{cache:'no-store'})).json(); } catch { return {}; } }
function bindMetricInfoButtons(root=document){
  root.addEventListener('click', async (e)=>{
    const btn = e.target.closest('[data-info]'); if(!btn) return;
    const id = btn.getAttribute('data-info'); const g = await fetchGlossary(); const it = g?.[id] || { title:id, what:'—' };
    const pop = document.createElement('div'); pop.className='card'; pop.style.position='absolute'; pop.style.zIndex=200; pop.style.maxWidth='320px';
    pop.innerHTML = `<h3 style="margin:0 0 6px 0">${it.title||id}</h3><p style="margin:0;color:var(--muted)">${it.what||''}</p>`;
    document.body.appendChild(pop); const r = btn.getBoundingClientRect();
    pop.style.left = Math.min(r.left, window.innerWidth-340) + 'px'; pop.style.top = (r.bottom + 8) + 'px';
    const close = ()=>{ pop.remove(); document.removeEventListener('click', onDoc); };
    const onDoc = ev => { if(!pop.contains(ev.target) && ev.target!==btn) close(); };
    setTimeout(()=>document.addEventListener('click', onDoc),0);
  });
}

// API globale
window.__TradeliaUI = { openPanel: Panel.open, closePanel: Panel.close, bindMetricInfoButtons };

// Bootstrap
(function boot(){
  initTheme();
  initShareAndPrint();
  bindMetricInfoButtons(document);
})();
