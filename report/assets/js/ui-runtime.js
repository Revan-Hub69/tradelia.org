// /report/assets/js/ui-runtime.js
//
// UI runtime globale (zero dati di mercato).
// - Drawer analitico (F1B, F2, …): #panel-overlay  → mostra solo 1 pannello (mobile O desktop)
// - Overlay legale (Privacy/MiFID): #legal-overlay
// - Tooltip metriche "?" (popover desktop / modal mobile) con /report/assets/glossary.json
// - Tema light/dark (dark by default), stampa, share overlay
// - API globale window.__TradeliaUI { openPanel, closePanel, openPrivacyPanel, openMifidPanel, openAuditPanel, bindMetricInfoButtons, ... }
//
// Non monta i moduli (lo fa app.js)

///////////////////////////////
// Helpers DOM + env
///////////////////////////////
function qs(sel, root = document)       { return root.querySelector(sel); }
function qsa(sel, root = document)      { return [...root.querySelectorAll(sel)]; }
function setText(el, txt)               { if (el) el.textContent = txt; }
function setHTML(el, html)              { if (el) el.innerHTML = html; }
function isMobile()                     { return window.matchMedia('(max-width: 767px)').matches; }
function escapeHtml(str){ if(str==null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

///////////////////////////////
// Drawer analitico (#panel-overlay)
///////////////////////////////

// Gestione modalità unica (evita doppio pannello)
const __panelMQ = window.matchMedia('(max-width: 767px)');
let __panelModeBound = false;
function __applyPanelVisibility() {
  const overlay = qs('#panel-overlay');
  if (!overlay) return;
  const desk = qs('.tl-panel--desktop', overlay);
  const mob  = qs('.tl-panel--mobile', overlay);
  if (!desk || !mob) return;

  const mobile = __panelMQ.matches;
  // mostra SOLO il pannello coerente col viewport
  mob.style.display  = mobile ? 'block' : 'none';
  desk.style.display = mobile ? 'none'  : 'block';
}

function openPanel(opts = {}) {
  closePanel(); // pulizia

  const overlayEl = qs('#panel-overlay');
  if (!overlayEl) return;

  const {
    title = 'Dettagli',
    subtitle = '',
    sections = [],           // [{title, body, meta}]
    blocking = false,
    panelSize,               // 'wide' | 'xl' | undefined (desktop only)
    footerButtons = [],      // [{label, action}]
    footerTabs = []          // [{key,label}]  (mobile: tabbar sticky)
  } = opts;

  // refs desktop
  const titleDeskEl  = qs('#panel-title');
  const subDeskEl    = qs('#panel-subtitle');
  const bodyDeskEl   = qs('#panel-body');
  const footerDeskEl = qs('#panel-footer');

  // refs mobile
  const titleMobEl   = qs('#panel-title-mobile');
  const subMobEl     = qs('#panel-subtitle-mobile');
  const bodyMobEl    = qs('#panel-body-mobile');
  const footerMobEl  = qs('#panel-footer-mobile');

  // Header
  setText(titleDeskEl, title);  setText(subDeskEl, subtitle);
  setText(titleMobEl,  title);  setText(subMobEl,  subtitle);

  // Body
  let bodyHTML = '';
  if (panelSize === 'wide' && sections.length === 1) {
    bodyHTML = sections[0].body || '';
  } else {
    bodyHTML = sections.map(s => `
      <section class="tl-panel-section" style="margin-bottom:1rem;">
        ${s.title ? `
          <div class="tl-panel-section-title">
            <div class="tl-panel-section-title-text">${escapeHtml(s.title)}</div>
          </div>` : ``}
        <div class="tl-panel-section-text">${s.body || ''}</div>
        ${s.meta ? `<div class="tl-panel-section-meta">${s.meta}</div>` : ``}
      </section>
    `).join('');
  }
  setHTML(bodyDeskEl, bodyHTML);
  setHTML(bodyMobEl,  bodyHTML);

  // Footer
  function renderFooterBtns(arr){
    if (!arr || !arr.length) return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    return arr.map((b,i)=>`<button class="btn btn-sm" data-panel-btn="${i}">${escapeHtml(b.label||'OK')}</button>`).join('');
  }
  function renderFooterTabs(tabsArr){
    if (!tabsArr || !tabsArr.length) return renderFooterBtns(footerButtons);
    const pills = tabsArr.map(t=>`
      <button class="f1b-footer-tab-btn" data-f1b-tab="${escapeHtml(t.key)}"
        style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:8px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);">
        ${escapeHtml(t.label)}
      </button>`).join('');
    const closeBtn = `
      <button class="f1b-footer-close-btn" data-panel-close
        style="position:sticky;right:0;flex-shrink:0;font-size:11.5px;font-weight:600;border-radius:8px;border:1px solid var(--ink);background:var(--ink);color:var(--surface-page);padding:.45rem .8rem;box-shadow:var(--shadow-card);">
        Chiudi
      </button>`;
    return `
      <div class="f1b-footer-tabs-wrap"
        style="display:flex;align-items:center;border-top:1px solid var(--br-panel-divider);background:var(--surface-panel-head);
               background-image:radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%, transparent 60%);
               padding:.6rem .75rem;box-shadow:0 -6px 12px rgba(0,0,0,.12);max-width:100%;overflow:hidden;gap:.5rem;">
        <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
          ${pills}
        </div>
        ${closeBtn}
      </div>`;
  }
  setHTML(footerMobEl,  renderFooterTabs(footerTabs));
  setHTML(footerDeskEl, renderFooterBtns(footerButtons));

  // Bind footer
  function bindFooter(scope, defs){
    if (!scope) return;
    qsa('[data-panel-btn]', scope).forEach(btn=>{
      const i = +btn.getAttribute('data-panel-btn');
      const def = defs[i];
      if (def && typeof def.action==='function') btn.addEventListener('click', e=>{ e.stopPropagation(); def.action(); });
    });
    qsa('[data-panel-close]', scope).forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation(); closePanel(); });
    });
  }
  bindFooter(footerDeskEl, footerButtons);
  bindFooter(footerMobEl,  footerButtons);

  // blocking
  if (blocking) overlayEl.setAttribute('data-blocking','true');
  else          overlayEl.removeAttribute('data-blocking');

  // panel width (desktop)
  const panelDesktop = qs('.tl-panel--desktop', overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove('tl-panel--wide','tl-panel--xl');
    if (panelSize==='wide') panelDesktop.classList.add('tl-panel--wide');
    if (panelSize==='xl')   panelDesktop.classList.add('tl-panel--xl');
  }

  // Show overlay
  document.body.classList.add('body--lock');
  overlayEl.setAttribute('aria-hidden','false');

  // Mostra SOLO un pannello coerente col viewport
  __applyPanelVisibility();
  if (!__panelModeBound) {
    __panelModeBound = true;
    __panelMQ.addEventListener('change', __applyPanelVisibility);
  }

  // Bind "?" che compaiono nel drawer
  bindMetricInfoButtons(overlayEl);
}

function closePanel(){
  const overlayEl = qs('#panel-overlay');
  if (!overlayEl) return;
  overlayEl.setAttribute('aria-hidden','true');
  document.body.classList.remove('body--lock');
}

// Chiudi su backdrop o [data-panel-close]
document.addEventListener('click', (ev)=>{
  const overlayEl = qs('#panel-overlay');
  if (!overlayEl || overlayEl.getAttribute('aria-hidden')==='true') return;
  const blocking = overlayEl.getAttribute('data-blocking')==='true';
  if (ev.target.closest('[data-panel-close]')) { closePanel(); return; }
  if (ev.target.closest('.tl-panel-backdrop') && !blocking) { closePanel(); return; }
});

///////////////////////////////
// Overlay legale (#legal-overlay)
///////////////////////////////
function openLegalPanel(opts = {}) {
  closeLegalPanel();

  const overlayEl = qs('#legal-overlay');
  if (!overlayEl) return;

  const { title='Informativa', subtitle='', body='', blocking=false, footerButtons=[] } = opts;

  const tD=qs('#legal-title'), sD=qs('#legal-subtitle'), bD=qs('#legal-body'), fD=qs('#legal-footer');
  const tM=qs('#legal-title-mobile'), sM=qs('#legal-subtitle-mobile'), bM=qs('#legal-body-mobile'), fM=qs('#legal-footer-mobile');

  setText(tD,title); setText(sD,subtitle); setHTML(bD,body);
  setText(tM,title); setText(sM,subtitle); setHTML(bM,body);

  const footerHTML = (footerButtons.length? footerButtons.map((b,i)=>`<button class="btn btn-sm" data-legal-btn="${i}">${escapeHtml(b.label||'OK')}</button>`).join('') : `<button class="btn btn-sm" data-legal-close>Chiudi</button>`);
  setHTML(fD, footerHTML); setHTML(fM, footerHTML);

  function bind(scope, defs){
    if (!scope) return;
    qsa('[data-legal-btn]', scope).forEach(btn=>{
      const i = +btn.getAttribute('data-legal-btn'); const def = defs[i];
      if (def && typeof def.action==='function') btn.addEventListener('click', e=>{ e.stopPropagation(); def.action(); });
    });
    qsa('[data-legal-close]', scope).forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation(); closeLegalPanel(); });
    });
  }
  bind(fD, footerButtons); bind(fM, footerButtons);

  if (blocking) overlayEl.setAttribute('data-blocking','true'); else overlayEl.removeAttribute('data-blocking');

  document.body.classList.add('body--lock');
  overlayEl.setAttribute('aria-hidden','false');
}

function closeLegalPanel(){
  const overlayEl = qs('#legal-overlay');
  if (!overlayEl) return;
  overlayEl.setAttribute('aria-hidden','true');
  document.body.classList.remove('body--lock');
}

document.addEventListener('click', (ev)=>{
  const overlayEl = qs('#legal-overlay');
  if (!overlayEl || overlayEl.getAttribute('aria-hidden')==='true') return;
  const blocking = overlayEl.getAttribute('data-blocking')==='true';
  if (ev.target.closest('[data-legal-close]')) { closeLegalPanel(); return; }
  const backdrop = ev.target.closest('.tl-panel-backdrop');
  if (backdrop && !blocking && overlayEl.contains(backdrop)) { closeLegalPanel(); }
});

///////////////////////////////
// Pannelli predefiniti: Privacy / MiFID / Audit
///////////////////////////////
function openPrivacyPanel(){
  openLegalPanel({
    title:'Privacy & Trasparenza',
    subtitle:'Dati minimi. Nessun tracciamento pubblicitario.',
    body: `
      <section style="font-size:13px;line-height:1.5;color:var(--ink);">
        <div class="legal-callout">
          <div class="legal-callout-title">Trasparenza dati</div>
          <div class="legal-callout-text">Nessuna profilazione pubblicitaria. Le preferenze restano sul tuo dispositivo.</div>
        </div>
        <p>Preferenze (tema, consenso) salvate localmente in <code>localStorage</code>.</p>
        <p>Fonti di mercato (Bloomberg, Reuters, CBOE, FRED, Finviz, ETFdb) usate a scopo didattico.</p>
      </section>`,
    footerButtons:[{label:'Chiudi', action:()=>closeLegalPanel()}]
  });
}

function openMifidPanel(){
  openLegalPanel({
    title:'Informativa MiFID',
    subtitle:'Contenuto educativo/informativo. Non è consulenza personalizzata.',
    body: `
      <section style="font-size:13px;line-height:1.5;color:var(--ink);">
        <div class="legal-callout"><div class="legal-callout-title">Importante</div>
        <div class="legal-callout-text">Non è un invito a comprare o vendere. Verifica sempre con un intermediario abilitato.</div></div>
        <p>Indicatori e “tone” sono descrittivi e non garantiscono risultati futuri.</p>
      </section>`,
    blocking:true,
    footerButtons:[{label:'Ho letto', action:()=>{ try{localStorage.setItem('mifidAcknowledged','yes');}catch(e){} closeLegalPanel(); }}]
  });
}

function openAuditPanel(audit = {}){
  openPanel({
    title:'Audit dati / Fonti',
    subtitle:'Qualità campione e latenza feed',
    sections:[{
      title:'Origine dati',
      body: `
        <p><strong>Fonte primaria:</strong> ${escapeHtml(audit.source_sync || '—')}<br/>
        <strong>Lag feed (giorni):</strong> ${escapeHtml(String(audit.feed_lag_days ?? '—'))}<br/>
        <strong>Confidence (0-1):</strong> ${escapeHtml(String(audit.confidence ?? '—'))}<br/>
        <strong>Integrità dataset:</strong> ${escapeHtml(String(audit.integrity ?? '—'))}</p>
        ${audit.notes? `<p style="margin-top:.5rem;">${escapeHtml(audit.notes)}</p>`:''}
      `,
      meta:'Uso informativo/educativo. Non è validazione regolamentare.'
    }],
    panelSize:'wide',
    footerButtons:[{label:'Chiudi', action:()=>closePanel()}]
  });
}

///////////////////////////////
// Tooltip metriche (glossario)
///////////////////////////////
let __TradeliaGlossary = {};
async function loadGlossary(){
  try{
    const r = await fetch('/report/assets/glossary.json', {cache:'no-cache'});
    if (!r.ok) throw new Error('HTTP '+r.status);
    const data = await r.json();
    __TradeliaGlossary = (data && typeof data==='object') ? data : {};
  }catch(e){ console.warn('Glossary load fail', e); __TradeliaGlossary = {}; }
}
function getGlossaryEntry(key){
  const raw = __TradeliaGlossary[key] || {};
  return { title: raw.title||key||'—', what: raw.what||'—', how: raw.how||'—', source: raw.source||'' };
}
let currentPopoverOpen = false;
function buildMetricHTML(info){
  return `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;margin-bottom:.25rem;">Cosa mostra</div>${escapeHtml(info.what)}
    </div>
    <div style="font-size:13px;line-height:1.45;color:var(--ink);">
      <div style="font-weight:600;margin-bottom:.25rem;">Come si usa</div>${escapeHtml(info.how)}
    </div>`;
}
function openMetricDesktop(btn){
  const pop = qs('#metric-popover'); if(!pop) return;
  const key = btn.getAttribute('data-metric'); const info = getGlossaryEntry(key);
  setText(qs('#metric-popover-title'), info.title);
  setHTML(qs('#metric-popover-body'),  buildMetricHTML(info));
  setHTML(qs('#metric-popover-source'), info.source? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}` : '');

  const r = btn.getBoundingClientRect(); const OFFSET_X=8, OFFSET_Y=4;
  let left = r.left + window.scrollX + OFFSET_X;
  let top  = r.bottom + window.scrollY + OFFSET_Y;

  pop.style.position='absolute'; pop.style.maxWidth='320px';
  pop.style.left = left+'px'; pop.style.top = top+'px';
  pop.setAttribute('aria-hidden','false');

  const vpW = innerWidth, vpH = innerHeight, pr = pop.getBoundingClientRect();
  if (pr.right > vpW-8) left -= (pr.right - (vpW-8));
  if (left < window.scrollX+8) left = window.scrollX+8;
  if (pr.bottom > vpH-8) top = r.top + window.scrollY - pr.height - OFFSET_Y;
  if (top < window.scrollY+8) top = window.scrollY+8;
  pop.style.left = left+'px'; pop.style.top = top+'px';
  currentPopoverOpen = true;
}
function closeMetricDesktop(){ const pop = qs('#metric-popover'); if(pop) pop.setAttribute('aria-hidden','true'); currentPopoverOpen=false; }
function openMetricMobile(btn){
  const modal = qs('#metric-modal'); if(!modal) return;
  const key = btn.getAttribute('data-metric'); const info = getGlossaryEntry(key);
  setText(qs('#metric-modal-title'), info.title);
  setHTML(qs('#metric-modal-body'),  buildMetricHTML(info));
  setHTML(qs('#metric-modal-source'), info.source? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}` : '');
  modal.setAttribute('aria-hidden','false');
}
function closeMetricMobile(){ const modal = qs('#metric-modal'); if(modal) modal.setAttribute('aria-hidden','true'); }

function bindMetricInfoButtons(root){
  const scope = root || document;
  qsa('.info-btn', scope).forEach(btn=>{
    if (btn.__metricBound) return; btn.__metricBound = true;
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if (isMobile()) openMetricMobile(btn);
      else { if (currentPopoverOpen) closeMetricDesktop(); openMetricDesktop(btn); }
    });
  });
}
const popClose = qs('#metric-popover-close');
if (popClose) popClose.addEventListener('click', (e)=>{ e.stopPropagation(); closeMetricDesktop(); });
document.addEventListener('click', (ev)=>{
  const pop = qs('#metric-popover'); if(!pop || pop.getAttribute('aria-hidden')==='true') return;
  if (pop.contains(ev.target)) return;
  if (ev.target.closest('.info-btn')) return;
  closeMetricDesktop();
});
qsa('[data-metric-close]').forEach(btn=>btn.addEventListener('click', closeMetricMobile));

///////////////////////////////
// Tema, stampa, share, legal buttons
///////////////////////////////
function initThemeToggle(){
  const btnTheme = qs('#btn-theme');
  function apply(theme){ document.documentElement.setAttribute('data-theme', theme); try{localStorage.setItem('tradelia-theme', theme);}catch(e){} }
  (function firstLoad(){
    let stored=null; try{stored=localStorage.getItem('tradelia-theme');}catch(e){}
    apply(stored==='light' || stored==='dark' ? stored : 'dark');
  })();
  if (btnTheme) btnTheme.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(cur==='light' ? 'dark' : 'light');
  });
}
function initPrintButtons(){ ['#btn-print','#btn-print-2'].forEach(sel=>{ const b=qs(sel); if(b) b.addEventListener('click',()=>window.print()); }); }
function initShareOverlay(){
  const overlay = qs('#share-overlay'); const btnOpen = qs('#btn-share');
  if (!overlay || !btnOpen) return;
  const closeEls = qsa('[data-share-close]', overlay);
  const copyBtns = qsa('[data-share-svc="copy"], #share-copy-btn', overlay);
  function open(){ const f=qs('#share-link-field'); if(f) f.textContent = location.href; overlay.setAttribute('aria-hidden','false'); }
  function close(){ overlay.setAttribute('aria-hidden','true'); }
  btnOpen.addEventListener('click', open); closeEls.forEach(el=>el.addEventListener('click', close));
  copyBtns.forEach(el=>el.addEventListener('click', ()=>{ try{navigator.clipboard.writeText(location.href);}catch(e){} }));
}
function initLegalButtons(){
  const p=qs('#btn-privacy-open'); if (p) p.addEventListener('click', ()=>openPrivacyPanel());
  const m=qs('#btn-mifid-open');   if (m) m.addEventListener('click', ()=>openMifidPanel());
}

///////////////////////////////
// Export API globale
///////////////////////////////
window.__TradeliaUI = {
  openPanel, closePanel,
  openPrivacyPanel, openMifidPanel, openAuditPanel,
  bindMetricInfoButtons,
  openLegalPanel, closeLegalPanel
};
window.openPanel = openPanel; window.closePanel = closePanel;

///////////////////////////////
// Boot
///////////////////////////////
async function bootUIRuntime(){
  await loadGlossary();
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();
  bindMetricInfoButtons(document);

  if (window.lucide && typeof window.lucide.createIcons==='function') {
    try{ window.lucide.createIcons(); }catch(e){ console.warn('lucide.createIcons() error:', e); }
  }
  const fy = qs('#footer-year'); if (fy && !fy.textContent.trim()) fy.textContent = new Date().getFullYear();
}
bootUIRuntime();

// Harden export (in caso di override)
if (!window.__TradeliaUI) window.__TradeliaUI = {};
Object.assign(window.__TradeliaUI, { openPanel, closePanel, openPrivacyPanel, openMifidPanel, openAuditPanel, bindMetricInfoButtons, openLegalPanel, closeLegalPanel });

///////////////////////////////
// MiFID obbligatorio alla prima visita
///////////////////////////////
(function enforceMifidFirstVisit(){
  try{
    const ok = localStorage.getItem('mifidAcknowledged');
    if (!ok && window.__TradeliaUI?.openMifidPanel) window.__TradeliaUI.openMifidPanel();
  }catch(e){ console.warn('MiFID check error', e); }
})();
