// /report/assets/js/ui-runtime.js
// Tradelia UI Runtime — SUPER PREMIUM (v2025-11-02)
// ------------------------------------------------------------
// Architettura:
// - Controller indipendenti: Analitico (#panel-overlay) e Legale (#legal-overlay)
// - Schede/tab render on-demand (mobile & desktop), reset scroll, resize-aware
// - Focus trap + ritorno focus, scroll-lock con ref-count
// - Backdrop/ESC scoped, blocking rispettato
// - Tooltip metriche “?”: popover desktop clamp + modal mobile
// - Tema light/dark, Print, Share overlay
// - API pubblica: window.__TradeliaUI

/* ============================================================
   Utils DOM & Core
   ============================================================ */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
const escapeHTML = (s)=> (s==null?'':String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;'));

function setText(el, t){ if(el) el.textContent = t; }
function setHTML(el, h){ if(el) el.innerHTML = h; }
function clearText(el){ if(!el) return; el.textContent = ""; }
function clearHTML(el){ if(!el) return; el.innerHTML = ""; }
function resetScroll(el){ try{ if(el) el.scrollTop = 0; }catch(_){} }

/* ============================================================
   Body scroll-lock (ref-count)
   ============================================================ */
const BodyLock = (()=>{ let n=0;
  return {
    lock(){ if(++n===1){ document.documentElement.style.overflow='hidden'; document.body.classList.add('body--lock'); } },
    unlock(){ if(n>0 && --n===0){ document.documentElement.style.overflow=''; document.body.classList.remove('body--lock'); } },
    count(){ return n; }
  };
})();

/* ============================================================
   Focus management (trap + restore)
   ============================================================ */
function trapFocus(scope){
  const sel = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const nodes = $$(sel, scope).filter(n=>!n.disabled && n.offsetParent!==null);
  if(!nodes.length) return ()=>{};
  const first = nodes[0], last = nodes[nodes.length-1];
  function onKey(e){
    if(e.key!=='Tab') return;
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  scope.addEventListener('keydown', onKey);
  (first||scope).focus();
  return ()=> scope.removeEventListener('keydown', onKey);
}

/* ============================================================
   Overlay Controller (scoped)
   ============================================================ */
class OverlayController {
  constructor(rootId, {withTabs=false}={}){
    this.root = $(rootId);
    if(!this.root) throw new Error(`Overlay root ${rootId} non trovato`);
    this.withTabs = withTabs;
    this.state = { activeKey:null, sections:{}, opener:null, off:{}, resize:null };
  }

  // resolve target attivo (mobile/desktop) e quello non attivo
  _targets(){
    const mobile = isMobile();
    const t = mobile ? {
      aside: $('.tl-panel--mobile', this.root),
      title: $('#panel-title-mobile', this.root),
      sub:   $('#panel-subtitle-mobile', this.root),
      body:  $('#panel-body-mobile', this.root),
      foot:  $('#panel-footer-mobile', this.root)
    } : {
      aside: $('.tl-panel--desktop', this.root),
      title: $('#panel-title', this.root),
      sub:   $('#panel-subtitle', this.root),
      body:  $('#panel-body', this.root),
      foot:  $('#panel-footer', this.root)
    };
    const o = mobile ? {
      title: $('#panel-title', this.root), sub: $('#panel-subtitle', this.root),
      body:  $('#panel-body', this.root),  foot: $('#panel-footer', this.root)
    } : {
      title: $('#panel-title-mobile', this.root), sub: $('#panel-subtitle-mobile', this.root),
      body:  $('#panel-body-mobile', this.root),  foot: $('#panel-footer-mobile', this.root)
    };
    return {t, o};
  }

  _renderBody(panelSize){
    const {t} = this._targets();
    const k = this.state.activeKey;
    const s = k ? this.state.sections[k] : null;

    let html = "";
    if(!s){
      html = `<section class="tl-panel-section"><div class="tl-panel-section-text">—</div></section>`;
    } else if(panelSize==='wide' && Object.keys(this.state.sections).length===1){
      html = s.body || "";
    } else {
      html = `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${ s.title ? `
            <div class="tl-panel-section-title">
              <div class="tl-panel-section-title-text">${escapeHTML(s.title)}</div>
            </div>` : `` }
          <div class="tl-panel-section-text">${s.body||""}</div>
          ${ s.meta ? `<div class="tl-panel-section-meta">${s.meta}</div>` : `` }
        </section>
      `;
    }
    setHTML(t.body, html);
    resetScroll(t.body);
    try { window.__TradeliaUI?.bindMetricInfoButtons(this.root); } catch(_) {}
  }

  _renderFooter(footerTabs, footerButtons, panelSize){
    const {t,o} = this._targets();
    const pills = (tabs)=> tabs.map(x=>`
      <button class="f1b-footer-tab-btn${x.key===this.state.activeKey?' is-active':''}" data-tab-key="${escapeHTML(x.key)}">${escapeHTML(x.label)}</button>
    `).join("");
    const renderBtns = (arr)=> (!arr||!arr.length)
      ? `<button class="btn btn-sm" data-ovl-close>Chiudi</button>`
      : arr.map((b,i)=>`<button class="btn btn-sm" data-ovl-btn="${i}">${escapeHTML(b.label||'OK')}</button>`).join("");

    const mobileFooter = this.withTabs && footerTabs?.length
      ? `<div class="f1b-footer-tabs-wrap"><div class="f1b-footer-tabs-scroll">${pills(footerTabs)}</div><button class="f1b-footer-close-btn" data-ovl-close>Chiudi</button></div>`
      : renderBtns(footerButtons);

    const desktopFooter = renderBtns(footerButtons);

    if(isMobile()){
      setHTML(t.foot, mobileFooter); setHTML(o.foot, "");
    } else {
      setHTML(t.foot, desktopFooter); setHTML(o.foot, "");
    }

    // bind footer scoped
    const scope = t.foot;
    if(!scope) return;
    $$('[data-ovl-btn]', scope).forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const i = +btn.getAttribute('data-ovl-btn');
        const def = (footerButtons||[])[i];
        if(def && typeof def.action==='function') def.action();
      });
    });
    $$('[data-ovl-close]', scope).forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); this.close(); });
    });
    if(this.withTabs){
      $$('[data-tab-key]', scope).forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const k = btn.getAttribute('data-tab-key');
          if(!k || k===this.state.activeKey) return;
          this.state.activeKey = k;
          $$('[data-tab-key]', scope).forEach(b=> b.classList.toggle('is-active', b===btn));
          this._renderBody(panelSize);
        });
      });
    }
  }

  open(opts={}){
    this.close(); // hard reset
    const {
      title="Dettagli",
      subtitle="",
      sections=[],
      blocking=false,
      panelSize,               // 'wide' | 'xl'
      footerButtons=[],
      footerTabs=[]            // [{key,label}]
    } = opts;

    this.state.opener = document.activeElement || null;

    // map sezioni per key
    this.state.sections = {};
    sections.forEach((s,i)=>{
      const key = s.key || (footerTabs[i] && footerTabs[i].key) || `sec${i}`;
      this.state.sections[key] = s;
    });
    this.state.activeKey =
      (footerTabs[0] && footerTabs[0].key) ||
      (sections[0] && (sections[0].key||'sec0')) ||
      null;

    // header & target
    const {t,o} = this._targets();
    [o.title,o.sub].forEach(clearText);
    [o.body,o.foot].forEach(clearHTML);
    setText(t.title, title);
    setText(t.sub, subtitle);

    // larghezza desktop
    const desktopPanel = $('.tl-panel--desktop', this.root);
    if(desktopPanel){
      desktopPanel.classList.remove('tl-panel--wide','tl-panel--xl');
      if(panelSize==='wide') desktopPanel.classList.add('tl-panel--wide');
      else if(panelSize==='xl') desktopPanel.classList.add('tl-panel--xl');
    }

    // mostra
    if(blocking) this.root.setAttribute('data-blocking','true'); else this.root.removeAttribute('data-blocking');
    BodyLock.lock();
    this.root.setAttribute('aria-hidden','false');

    // corpo + footer
    this._renderBody(panelSize);
    this._renderFooter(footerTabs, footerButtons, panelSize);

    // focus trap
    const activeAside = isMobile() ? $('.tl-panel--mobile', this.root) : $('.tl-panel--desktop', this.root);
    this.state.off.focus = trapFocus(activeAside);

    // handlers scoped
    const onDocClick = (ev)=>{
      const blockingFlag = this.root.getAttribute('data-blocking')==='true';
      if (ev.target.closest('[data-ovl-close]')) { this.close(); return; }
      const backdrop = ev.target.closest('.tl-panel-backdrop');
      if (backdrop && !blockingFlag && this.root.contains(backdrop)) this.close();
    };
    const onKey = (e)=>{
      const blockingFlag = this.root.getAttribute('data-blocking')==='true';
      if (e.key==='Escape' && !blockingFlag) this.close();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    this.state.off.click = ()=> document.removeEventListener('click', onDocClick);
    this.state.off.key   = ()=> document.removeEventListener('keydown', onKey);

    // resize-aware: migra contenuto preservando activeKey
    const onResize = ()=>{
      if(this.root.getAttribute('aria-hidden')==='true') return;
      const {t:oT, o:oO} = this._targets(); // recalculated
      [oO.title,oO.sub].forEach(clearText);
      [oO.body,oO.foot].forEach(clearHTML);
      setText(oT.title, title);
      setText(oT.sub, subtitle);
      this._renderFooter(footerTabs, footerButtons, panelSize);
      this._renderBody(panelSize);
    };
    window.addEventListener('resize', onResize);
    this.state.resize = ()=> window.removeEventListener('resize', onResize);
  }

  close(){
    // hide
    this.root.setAttribute('aria-hidden','true');
    this.root.removeAttribute('data-blocking');

    // cleanup DOM
    ['#panel-title','#panel-subtitle','#panel-title-mobile','#panel-subtitle-mobile'].forEach(sel=> clearText($(sel,this.root)));
    ['#panel-body','#panel-footer','#panel-body-mobile','#panel-footer-mobile'].forEach(sel=> clearHTML($(sel,this.root)));

    // unbind
    if(this.state.off.click) this.state.off.click();
    if(this.state.off.key)   this.state.off.key();
    if(this.state.resize)    this.state.resize();
    if(this.state.off.focus) this.state.off.focus();
    this.state.off = {}; this.state.resize = null;

    // restore focus
    try{ this.state.opener && this.state.opener.focus(); }catch(_){}
    this.state.opener = null;

    BodyLock.unlock();
  }
}

/* ============================================================
   Tooltip metriche (“?”) — desktop popover / mobile modal
   ============================================================ */
let __Glossary = {};
async function loadGlossary(){
  try{
    const r = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if(r.ok){ const j = await r.json(); __Glossary = (j && typeof j==='object') ? j : {}; }
  }catch(e){ console.warn("Glossary load error", e); __Glossary = {}; }
}
function glossaryEntry(id){
  const g = __Glossary[id] || {};
  return { title: g.title || id || "—", what: g.what || "—", how: g.how || "—", source: g.source || "" };
}
function metricHTML(info){
  return `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;margin-bottom:.25rem;">Cosa mostra</div>
      <div>${escapeHTML(info.what)}</div>
    </div>
    <div style="font-size:13px;line-height:1.45;color:var(--ink);">
      <div style="font-weight:600;margin-bottom:.25rem;">Come si usa</div>
      <div>${escapeHTML(info.how)}</div>
    </div>
  `;
}
let __metricPopoverOpen = false;
function openMetricDesktop(btn){
  const pop = $("#metric-popover"); if(!pop) return;
  const key = btn.getAttribute("data-metric"); const info = glossaryEntry(key);
  setText($("#metric-popover-title"), info.title || key || "—");
  setHTML($("#metric-popover-body"), metricHTML(info));
  setHTML($("#metric-popover-source"), info.source ? `<span style="font-weight:600;">Fonte</span>: ${escapeHTML(info.source)}` : "");

  const r = btn.getBoundingClientRect(); const ox=8, oy=4;
  let L = r.left + window.scrollX + ox;
  let T = r.bottom + window.scrollY + oy;

  pop.style.position = "absolute";
  pop.style.maxWidth = "320px";
  pop.style.left = L+"px";
  pop.style.top  = T+"px";
  pop.setAttribute("aria-hidden","false");

  const vw=window.innerWidth, vh=window.innerHeight, pr=pop.getBoundingClientRect();
  if (pr.right > vw-8) L -= (pr.right-(vw-8));
  if (L < window.scrollX+8) L = window.scrollX+8;
  if (pr.bottom > vh-8) T = r.top + window.scrollY - pr.height - oy;
  if (T < window.scrollY+8) T = window.scrollY+8;
  pop.style.left = L+"px"; pop.style.top = T+"px";
  __metricPopoverOpen = true;
}
function closeMetricDesktop(){ const pop=$("#metric-popover"); if(pop) pop.setAttribute("aria-hidden","true"); __metricPopoverOpen=false; }
function openMetricMobile(btn){
  const modal = $("#metric-modal"); if(!modal) return;
  const key = btn.getAttribute("data-metric"); const info = glossaryEntry(key);
  setText($("#metric-modal-title"), info.title || key || "—");
  setHTML($("#metric-modal-body"), metricHTML(info));
  setHTML($("#metric-modal-source"), info.source ? `<span style="font-weight:600;">Fonte</span>: ${escapeHTML(info.source)}` : "");
  modal.setAttribute("aria-hidden","false");
}
function closeMetricMobile(){ const m=$("#metric-modal"); if(m) m.setAttribute("aria-hidden","true"); }
function bindMetricInfoButtons(scope){
  const root = scope || document;
  $$(".info-btn", root).forEach(btn=>{
    if(btn.__boundInfo) return; btn.__boundInfo = true;
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      if(isMobile()) openMetricMobile(btn);
      else { if(__metricPopoverOpen) closeMetricDesktop(); openMetricDesktop(btn); }
    });
  });
}
const _metricClose = $("#metric-popover-close");
if(_metricClose) _metricClose.addEventListener("click",(e)=>{ e.stopPropagation(); closeMetricDesktop(); });
document.addEventListener("click", (e)=>{
  const pop = $("#metric-popover"); if(!pop || pop.getAttribute("aria-hidden")==="true") return;
  if(pop.contains(e.target)) return;
  if(e.target.closest(".info-btn")) return;
  closeMetricDesktop();
});
$$("[data-metric-close]").forEach(b=> b.addEventListener("click", ()=> closeMetricMobile()));

/* ============================================================
   Controller istanze: Analitico & Legale
   ============================================================ */
let Panel, Legal;
function initControllers(){
  Panel = new OverlayController("#panel-overlay", { withTabs:true });
  Legal = new OverlayController("#legal-overlay", { withTabs:false });
}

/* ============================================================
   Pannelli predefiniti (Privacy / MiFID / Audit)
   ============================================================ */
function openPrivacyPanel(){
  Legal.open({
    title: "Privacy & Trasparenza",
    subtitle: "Dati minimi. Nessun tracciamento pubblicitario.",
    sections: [{
      title: "Principi",
      body: `
        <section style="font-size:13px;line-height:1.5;color:var(--ink);">
          <div class="legal-callout">
            <div class="legal-callout-title">Trasparenza dati</div>
            <div class="legal-callout-text">Niente profilazione pubblicitaria. Le preferenze restano sul tuo dispositivo.</div>
          </div>
          <p>Tradelia AI adotta un approccio “privacy first”.</p>
          <p><strong>Nessun cookie di profilazione.</strong></p>
          <p><strong>Preferenze locali</strong> in localStorage (tema, consenso UI).</p>
          <p><strong>Dati finanziari personali:</strong> non raccolti automaticamente.</p>
          <p><strong>Fonti di mercato:</strong> Bloomberg, Reuters, CBOE, FRED, ecc.</p>
          <p style="font-size:12px;color:var(--muted);margin-top:1rem;">GDPR (UE 2016/679), Direttiva ePrivacy.</p>
        </section>
      `
    }],
    footerButtons: [{ label:"Chiudi", action: ()=> Legal.close() }]
  });
}
function openMifidPanel(){
  Legal.open({
    title: "Informativa MiFID",
    subtitle: "Contenuto educativo/informativo. Non è consulenza personalizzata.",
    sections: [{
      title: "Avvertenze",
      body: `
        <section style="font-size:13px;line-height:1.5;color:var(--ink);">
          <div class="legal-callout">
            <div class="legal-callout-title">Importante</div>
            <div class="legal-callout-text">Le informazioni hanno scopo didattico. Non sono un invito ad operare.</div>
          </div>
          <p>Non gestiamo portafogli né eseguiamo ordini.</p>
          <p><strong>Nessuna raccomandazione personalizzata ai sensi MiFID II.</strong></p>
          <p>I mercati sono volatili; possibili perdite totali del capitale.</p>
          <p style="font-size:12px;color:var(--muted);margin-top:1rem;">Regolamentazione ESMA / MiFID II.</p>
        </section>
      `
    }],
    footerButtons: [{
      label: "Ho letto",
      action: ()=>{ try{ localStorage.setItem("mifidAcknowledged","yes"); }catch(_){} Legal.close(); }
    }],
    blocking: true
  });
}
function openAuditPanel(a){
  a = a || {};
  Panel.open({
    title: "Audit dati / Fonti",
    subtitle: "Qualità campione e latenza feed",
    sections: [{
      key: "audit",
      title: "Origine dati",
      body: `
        <p><strong>Fonte primaria:</strong> ${escapeHTML(a.source_sync || "—")}<br>
        <strong>Lag feed (giorni):</strong> ${escapeHTML(String(a.feed_lag_days ?? "—"))}<br>
        <strong>Confidence (0-1):</strong> ${escapeHTML(String(a.confidence ?? "—"))}<br>
        <strong>Integrità dataset:</strong> ${escapeHTML(String(a.integrity ?? "—"))}</p>
        ${ a.notes ? `<p style="margin-top:.5rem;">${escapeHTML(a.notes)}</p>` : `` }
      `,
      meta: "Pannello informativo, non è una validazione regolamentare."
    },{
      key: "mifid",
      title: "Avvertenza MiFID",
      body: `<p>Verifica adeguatezza/appropriatezza con consulente autorizzato.</p>`,
      meta: "Tradelia AI non fornisce consulenza personalizzata."
    }],
    panelSize: "wide",
    footerButtons: [{ label:"Chiudi", action: ()=> Panel.close() }]
  });
}

/* ============================================================
   Tema, Print, Share, Footer legal
   ============================================================ */
function initThemeToggle(){
  const btn = $("#btn-theme");
  function apply(theme){ document.documentElement.setAttribute('data-theme', theme); try{ localStorage.setItem('tradelia-theme', theme); }catch(_){} }
  (function firstLoad(){
    let t=null; try{ t = localStorage.getItem('tradelia-theme'); }catch(_){}
    apply( (t==='light'||t==='dark') ? t : 'dark' );
  })();
  if(btn) btn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    apply(cur==='light'?'dark':'light');
  });
}
function initPrintButtons(){
  [$("#btn-print"), $("#btn-print-2")].forEach(b=> b && b.addEventListener('click', ()=> window.print()));
}
function initShareOverlay(){
  const overlay = $("#share-overlay"); const btn = $("#btn-share");
  if(!overlay || !btn) return;
  const closeEls = $$("[data-share-close]", overlay);
  const copyEls  = $$("[data-share-svc='copy'], #share-copy-btn", overlay);
  function open(){ const f=$("#share-link-field"); if(f) f.textContent = window.location.href; overlay.setAttribute('aria-hidden','false'); }
  function close(){ overlay.setAttribute('aria-hidden','true'); }
  btn.addEventListener('click', open);
  closeEls.forEach(n=> n.addEventListener('click', close));
  copyEls.forEach(n=> n.addEventListener('click', ()=>{ try{ navigator.clipboard.writeText(window.location.href); }catch(_){}}));
}
function initLegalButtons(){
  const p = $("#btn-privacy-open"); const m = $("#btn-mifid-open");
  if(p) p.addEventListener('click', ()=> openPrivacyPanel());
  if(m) m.addEventListener('click', ()=> openMifidPanel());
}

/* ============================================================
   API pubblica
   ============================================================ */
window.__TradeliaUI = {
  openPanel: (...a)=> Panel.open(...a),
  closePanel: ()=> Panel.close(),
  openLegalPanel: (...a)=> Legal.open(...a),
  closeLegalPanel: ()=> Legal.close(),
  openPrivacyPanel, openMifidPanel, openAuditPanel,
  bindMetricInfoButtons: bindMetricInfoButtons
};
// retrocompat
window.openPanel  = (...a)=> Panel.open(...a);
window.closePanel = ()=> Panel.close();

/* ============================================================
   Boot
   ============================================================ */
async function bootUIRuntime(){
  initControllers();
  await loadGlossary();
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();
  bindMetricInfoButtons(document);

  // icone Lucide
  if(window.lucide && typeof window.lucide.createIcons==='function'){
    try{ window.lucide.createIcons(); }catch(e){ console.warn("lucide.createIcons() error:", e); }
  }
  const fy = $("#footer-year"); if(fy && !fy.textContent.trim()) fy.textContent = new Date().getFullYear();
}
bootUIRuntime();

/* ============================================================
   MiFID obbligatorio primo accesso
   ============================================================ */
(function enforceMifidFirstVisit(){
  try{
    const ok = localStorage.getItem('mifidAcknowledged');
    if(!ok){ window.__TradeliaUI.openMifidPanel?.(); }
  }catch(e){ console.warn("MiFID enforce error:", e); }
})();
