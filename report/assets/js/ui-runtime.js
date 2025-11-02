// Tradelia · UI Runtime v4.1 — tooltips istituzionali, overlay, theme toggle

const UI = (() => {
  const S = { glossary: null, tt: null };

  /* THEME */
  function setTheme(t){ document.documentElement.setAttribute('data-theme', t); try{localStorage.setItem('tradelia-theme',t);}catch{}; const b=document.getElementById('btn-theme'); if(b) b.setAttribute('aria-pressed',String(t==='light')); }
  function toggleTheme(){ setTheme((document.documentElement.getAttribute('data-theme')||'dark')==='dark'?'light':'dark'); }
  function initTheme(){ let t='dark'; try{t=localStorage.getItem('tradelia-theme')||'dark';}catch{} setTheme(t); document.getElementById('btn-theme')?.addEventListener('click',toggleTheme); }

  /* GLOSSARY */
  async function loadGlossary(){ if(S.glossary) return S.glossary; try{ const r=await fetch('/report/assets/glossary.json',{cache:'no-store'}); S.glossary=await r.json(); }catch{ S.glossary={}; } return S.glossary; }

  /* TOOLTIP (popover desktop, bottom-sheet-like semplice su mobile) */
  function closeTT(){ if(!S.tt) return; S.tt.btn?.setAttribute('aria-expanded','false'); S.tt.node.remove(); S.tt=null; }
  function place(node, btn){
    const b=btn.getBoundingClientRect(), n=node.getBoundingClientRect(), pad=8;
    const top = b.bottom + pad, left = Math.min(Math.max(b.left + b.width/2 - n.width/2, pad), innerWidth - n.width - pad);
    node.style.top = `${top}px`; node.style.left = `${left}px`;
    const a=document.createElement('div'); a.className='tt-arrow'; a.style.left=`${Math.min(Math.max((b.left+b.width/2)-left-5,10),n.width-20)}px`; a.style.top = `-5px`; node.appendChild(a);
  }
  function buildTT(id, titleFallback){
    const g=S.glossary?.[id]||{}; const t=g.title||titleFallback||id;
    const root=document.createElement('div'); root.className='tt'; root.setAttribute('role','dialog');
    root.innerHTML = `
      <h4>${t}</h4>
      ${g.what?`<section><h5>Cos’è</h5><p>${g.what}</p></section>`:''}
      ${g.how?`<section><h5>Come si usa</h5><p>${g.how}</p></section>`:''}
      ${g.source?`<section class="meta"><h5>Fonti</h5><p>${g.source}</p></section>`:''}
    `;
    return root;
  }
  async function onInfoClick(e){
    const btn=e.currentTarget, id=btn.getAttribute('data-info'); if(!id) return;
    if(S.tt?.btn===btn){ closeTT(); return; }
    closeTT(); await loadGlossary();
    const n=buildTT(id, btn.getAttribute('aria-label')); document.body.appendChild(n); place(n,btn);
    S.tt={node:n, btn}; btn.setAttribute('aria-expanded','true');
  }
  function bindInfoButtons(root=document){
    root.querySelectorAll('.info-btn').forEach(b=>{ b.setAttribute('aria-expanded','false'); b.removeEventListener('click',onInfoClick); b.addEventListener('click',onInfoClick); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeTT(); });
    document.addEventListener('click',e=>{ if(!S.tt) return; const inside=S.tt.node.contains(e.target)||S.tt.btn.contains(e.target); if(!inside) closeTT(); }, true);
    addEventListener('resize',()=>{ if(S.tt) place(S.tt.node,S.tt.btn); });
  }

  /* OVERLAYS */
  function open(id){ document.getElementById(id)?.removeAttribute('hidden'); }
  function close(id){ document.getElementById(id)?.setAttribute('hidden',''); }
  function bindOverlays(){
    const p=document.getElementById('panel-overlay'); p?.querySelectorAll('[data-overlay-close]').forEach(x=>x.addEventListener('click',()=>close('panel-overlay')));
    const l=document.getElementById('legal-overlay'); l?.querySelectorAll('[data-legal-close]').forEach(x=>x.addEventListener('click',()=>close('legal-overlay')));
    document.getElementById('btn-privacy')?.addEventListener('click',()=>{ document.getElementById('legal-title').textContent='Privacy'; document.getElementById('legal-body').innerHTML='<p>Informativa breve: nessun tracciamento esterno.</p>'; open('legal-overlay'); });
    document.getElementById('btn-mifid')?.addEventListener('click',()=>{ document.getElementById('legal-title').textContent='MiFID'; document.getElementById('legal-body').innerHTML='<p>Materiale informativo/educativo. Non è raccomandazione personalizzata (MiFID II).</p>'; open('legal-overlay'); });
  }

  return {
    init(){ initTheme(); bindOverlays(); bindInfoButtons(document); const y=document.getElementById('footer-year'); if(y) y.textContent=new Date().getFullYear(); },
    bindInfoButtons, openPanel:()=>open('panel-overlay'), closePanel:()=>close('panel-overlay')
  };
})();

window.__TradeliaUI = UI;
document.addEventListener('DOMContentLoaded', UI.init);
