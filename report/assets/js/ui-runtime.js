// UI Runtime v2.6 — overlay analitico, legale, tooltips 3-sezioni, footer year

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Footer year
(function(){ const y = $('#footer-year'); if(y) y.textContent = new Date().getFullYear(); })();

/* ---------- Overlay Analitico ---------- */
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

/* ---------- Overlay Legale ---------- */
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

/* ---------- Tooltips 3 sezioni (Cos’è / Come si usa / Fonte) ---------- */
async function fetchGlossary(){ try { return await (await fetch('./assets/glossary.json',{cache:'no-store'})).json(); } catch { return {}; } }

function bindMetricInfoButtons(root=document){
  let openRef = null, openBtn = null;

  const close = () => {
    if (openRef){ openRef.remove(); openRef = null; }
    if (openBtn){ openBtn.removeAttribute('aria-describedby'); openBtn = null; }
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onDocClick, true);
  };

  const onKey = (e) => { if (e.key === 'Escape') close(); };

  const onDocClick = (e) => {
    if (!openRef) return;
    const inside = openRef.contains(e.target);
    const isBtn = e.target === openBtn || e.target.closest('[data-info]') === openBtn;
    if (!inside && !isBtn) close();
  };

  root.addEventListener('click', async (e)=>{
    const btn = e.target.closest('[data-info]');
    if (!btn) return;

    // toggle
    if (openBtn === btn){ close(); return; } else { close(); }

    const id = btn.getAttribute('data-info');
    const g  = await fetchGlossary();
    const it = g?.[id] || { title:id, what:'—', how:'', source:'' };

    // Node
    const n = document.createElement('div');
    n.className = 'tt';
    n.setAttribute('role', 'dialog');
    const ttId = `tt-${Math.random().toString(36).slice(2,8)}`;
    n.id = ttId;

    n.innerHTML = `
      <div class="tt-arrow" aria-hidden="true"></div>
      ${ it.title ? `<h4>${it.title}</h4>` : '' }
      ${ it.what  ? `<section><h5>Cos’è</h5><p>${it.what}</p></section>` : '' }
      ${ it.how   ? `<section><h5>Come si usa</h5><p>${it.how}</p></section>` : '' }
      ${ it.source? `<section class="src"><h5>Fonte</h5><p class="meta">${it.source}</p></section>` : '' }
    `;

    document.body.appendChild(n);

    // Positioning (prefer top, fallback bottom) + clamp
    const b = btn.getBoundingClientRect();
    const margin = 10;
    const prefTop = b.top > (window.innerHeight/2);
    const nRect0 = n.getBoundingClientRect();
    let left = Math.min(Math.max(b.left + (b.width/2) - (nRect0.width/2), margin), window.innerWidth - nRect0.width - margin);
    let top  = prefTop ? (b.top - nRect0.height - 10) : (b.bottom + 10);

    // clamp Y and recompute arrow
    top  = Math.max(margin, Math.min(top, window.innerHeight - nRect0.height - margin));
    n.style.left = `${left}px`; n.style.top = `${top}px`;
    const nRect = n.getBoundingClientRect();
    const arrow = n.querySelector('.tt-arrow');
    const arrowLeft = Math.min(Math.max((b.left + b.width/2) - nRect.left - 6, 8), nRect.width - 8);
    arrow.style.left = `${arrowLeft}px`;
    arrow.style.top  = `${prefTop ? (nRect.height - 6) : -6}px`;

    // Wire close
    openRef = n; openBtn = btn;
    btn.setAttribute('aria-describedby', ttId);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick, true);
  });
}

// API globale
window.__TradeliaUI = { openPanel: Panel.open, closePanel: Panel.close, bindMetricInfoButtons };

// Bootstrap
(function boot(){ bindMetricInfoButtons(document); })();
