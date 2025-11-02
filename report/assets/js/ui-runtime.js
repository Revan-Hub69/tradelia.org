// /report/assets/js/ui-runtime.js
// Runtime UI globale (nessun dato di mercato qui).
// - Drawer analitico (F1B/F2/F3...) -> #panel-overlay  **(LOGICA RIFATTA)**
// - Overlay legale separato (Privacy / MiFID) -> #legal-overlay
// - Tooltip metriche ("?") desktop/mobile
// - Tema light/dark (dark al primo accesso)
// - Stampa / Share overlay
// - Export API window.__TradeliaUI { openPanel, closePanel, openPrivacyPanel, openMifidPanel, openAuditPanel, bindMetricInfoButtons, openLegalPanel, closeLegalPanel }

// ------------------------------------------------------------
// Utils DOM
// ------------------------------------------------------------
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function setText(el, txt) { if (el) el.textContent = txt; }
function setHTML(el, html) { if (el) el.innerHTML = html; }
function isMobile() { return window.matchMedia("(max-width: 767px)").matches; }
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ------------------------------------------------------------
// Scroll lock ref-count (evita conflitti tra overlay)
// ------------------------------------------------------------
const __lockState = { count: 0 };
function __panelLockScroll(lock){
  if (lock) {
    if (++__lockState.count === 1) {
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('body--lock');
    }
  } else {
    if (__lockState.count > 0 && --__lockState.count === 0) {
      document.documentElement.style.overflow = '';
      document.body.classList.remove('body--lock');
    }
  }
}
function __resetScrollable(el){ try { if(el) el.scrollTop = 0; } catch(e){} }
function __clearNode(n){ if(!n) return; n.textContent=''; }
function __clearHTML(n){ if(!n) return; n.innerHTML=''; }

// ------------------------------------------------------------
// Drawer ANALITICO (#panel-overlay) — schede isolate & resize-aware
// ------------------------------------------------------------
let __panelTabs = {
  activeKey: null,
  sectionsByKey: {},
  resizeHandler: null,
  clickHandler: null,
  keyHandler: null
};

function __panelActiveTarget() {
  const overlay = qs('#panel-overlay');
  const mobile = isMobile();
  return mobile ? {
    aside: qs('.tl-panel--mobile', overlay),
    title: qs('#panel-title-mobile', overlay),
    sub:   qs('#panel-subtitle-mobile', overlay),
    body:  qs('#panel-body-mobile', overlay),
    foot:  qs('#panel-footer-mobile', overlay),
    other: {
      title: qs('#panel-title', overlay),
      sub:   qs('#panel-subtitle', overlay),
      body:  qs('#panel-body', overlay),
      foot:  qs('#panel-footer', overlay)
    }
  } : {
    aside: qs('.tl-panel--desktop', overlay),
    title: qs('#panel-title', overlay),
    sub:   qs('#panel-subtitle', overlay),
    body:  qs('#panel-body', overlay),
    foot:  qs('#panel-footer', overlay),
    other: {
      title: qs('#panel-title-mobile', overlay),
      sub:   qs('#panel-subtitle-mobile', overlay),
      body:  qs('#panel-body-mobile', overlay),
      foot:  qs('#panel-footer-mobile', overlay)
    }
  };
}

// OPEN PANEL analitico (schede isolate, render on demand)
function openPanel(opts) {
  closePanel(); // pulizia preventiva

  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],           // [{key?, title?, body, meta?}, ...]
    blocking = false,
    panelSize,               // 'wide' | 'xl'
    footerButtons = [],
    footerTabs = []          // [{key, label}, ...]
  } = opts || {};

  // target attivo + svuota l’altro (stop doppio pannello)
  const tgt = __panelActiveTarget();
  const oth = tgt.other || {};
  [oth.title, oth.sub].forEach(__clearNode);
  [oth.body, oth.foot].forEach(__clearHTML);

  // header
  setText(tgt.title, title);
  setText(tgt.sub, subtitle);

  // mappa sezioni per key coerente
  __panelTabs.sectionsByKey = {};
  sections.forEach((s, i) => {
    const k = s.key || (footerTabs[i] && footerTabs[i].key) || `sec${i}`;
    __panelTabs.sectionsByKey[k] = s;
  });

  // attiva prima tab disponibile (o prima sezione)
  __panelTabs.activeKey =
    (footerTabs[0] && footerTabs[0].key) ||
    (sections[0] && (sections[0].key || 'sec0')) ||
    null;

  // renderer sezione attiva (ricostruisce BODY ogni volta)
  function renderActiveSection() {
    const k = __panelTabs.activeKey;
    const s = k ? __panelTabs.sectionsByKey[k] : null;

    let html = "";
    if (!s) {
      html = `<section class="tl-panel-section"><div class="tl-panel-section-text">—</div></section>`;
    } else if (panelSize === "wide" && Object.keys(__panelTabs.sectionsByKey).length === 1) {
      // wide + singola sezione: body "nudo"
      html = s.body || "";
    } else {
      html = `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${ s.title ? `
            <div class="tl-panel-section-title">
              <div class="tl-panel-section-title-text">${escapeHtml(s.title)}</div>
            </div>` : `` }
          <div class="tl-panel-section-text">${s.body || ""}</div>
          ${ s.meta ? `<div class="tl-panel-section-meta">${s.meta}</div>` : `` }
        </section>
      `;
    }

    setHTML(tgt.body, html);
    __resetScrollable(tgt.body);

    // bind "?" perché il DOM è nuovo
    try { bindMetricInfoButtons(overlayEl); } catch(e){}
  }

  // FOOTER: tabs (mobile) o bottoni (desktop)
  function renderFooterBtns(arr) {
    if (!arr || !arr.length) return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    return arr.map((btn, i) => `<button class="btn btn-sm" data-panel-btn="${i}">${escapeHtml(btn.label || "OK")}</button>`).join("");
  }
  function renderFooterTabs(tabsArr, btnsArr) {
    if (!tabsArr || !tabsArr.length) return renderFooterBtns(btnsArr);
    const pills = tabsArr.map(t =>
      `<button class="f1b-footer-tab-btn${t.key===__panelTabs.activeKey?' is-active':''}" data-f1b-tab="${escapeHtml(t.key)}">${escapeHtml(t.label)}</button>`
    ).join("");
    const closeBtn = `<button class="f1b-footer-close-btn" data-panel-close>Chiudi</button>`;
    return `<div class="f1b-footer-tabs-wrap"><div class="f1b-footer-tabs-scroll">${pills}</div>${closeBtn}</div>`;
  }

  const mobileFooterHTML  = renderFooterTabs(footerTabs, footerButtons);
  const desktopFooterHTML = renderFooterBtns(footerButtons);

  if (isMobile()) {
    setHTML(tgt.foot, mobileFooterHTML);
    setHTML(oth.foot, "");
  } else {
    setHTML(tgt.foot, desktopFooterHTML);
    setHTML(oth.foot, "");
  }

  // bind footer (solo sull’attivo)
  function bindFooter(scopeEl) {
    if (!scopeEl) return;

    // bottoni azione
    qsa("[data-panel-btn]", scopeEl).forEach(btnEl => {
      const i = btnEl.getAttribute("data-panel-btn");
      if (footerButtons[i] && typeof footerButtons[i].action === "function") {
        btnEl.addEventListener("click", (ev) => { ev.stopPropagation(); footerButtons[i].action(); });
      }
    });

    // chiudi
    qsa("[data-panel-close]", scopeEl).forEach(btnEl => {
      btnEl.addEventListener("click", (ev) => { ev.stopPropagation(); closePanel(); });
    });

    // tabs (mobile)
    qsa('[data-f1b-tab]', scopeEl).forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-f1b-tab');
        if (!k || k === __panelTabs.activeKey) return;
        __panelTabs.activeKey = k;

        // aggiorna pill attiva
        qsa('[data-f1b-tab]', scopeEl).forEach(b => b.classList.toggle('is-active', b===btn));

        // re-render body per la nuova scheda
        renderActiveSection();
      });
    });
  }
  bindFooter(tgt.foot);

  // larghezza desktop
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove("tl-panel--wide","tl-panel--xl");
    if (panelSize === "wide") panelDesktop.classList.add("tl-panel--wide");
    else if (panelSize === "xl") panelDesktop.classList.add("tl-panel--xl");
  }

  // mostra overlay + primo render
  if (blocking) overlayEl.setAttribute("data-blocking","true"); else overlayEl.removeAttribute("data-blocking");
  __panelLockScroll(true);
  overlayEl.setAttribute("aria-hidden","false");
  renderActiveSection();

  // ESC/backdrop (scoped a questo root)
  __panelTabs.clickHandler = (ev)=>{
    const blockingFlag = overlayEl.getAttribute("data-blocking")==="true";
    if (ev.target.closest("[data-panel-close]")) { closePanel(); return; }
    const backdrop = ev.target.closest(".tl-panel-backdrop");
    if (backdrop && !blockingFlag) { closePanel(); }
  };
  __panelTabs.keyHandler = (e)=>{
    const blockingFlag = overlayEl.getAttribute("data-blocking")==="true";
    if (e.key === 'Escape' && !blockingFlag) closePanel();
  };
  document.addEventListener("click", __panelTabs.clickHandler);
  document.addEventListener("keydown", __panelTabs.keyHandler);

  // RESIZE: migra contenuto nel nuovo target mantenendo activeKey
  __panelTabs.resizeHandler = () => {
    if (overlayEl.getAttribute("aria-hidden")==="true") return;
    const curKey = __panelTabs.activeKey;

    const tgt2 = __panelActiveTarget();
    const oth2 = tgt2.other || {};
    [oth2.title, oth2.sub].forEach(__clearNode);
    [oth2.body, oth2.foot].forEach(__clearHTML);

    // ripristina header
    setText(tgt2.title, title);
    setText(tgt2.sub, subtitle);

    // rifoot coerente con breakpoint
    if (isMobile()) { setHTML(tgt2.foot, renderFooterTabs(footerTabs, footerButtons)); }
    else { setHTML(tgt2.foot, renderFooterBtns(footerButtons)); }
    bindFooter(tgt2.foot);

    // rerender sezione attiva
    __panelTabs.activeKey = curKey;
    // nota: renderActiveSection() usa tgt/body calcolati prima;
    // ricalcoliamo il target e poi renderizziamo
    const tmp = __panelActiveTarget(); // aggiorna riferimento
    setHTML(tmp.body, ""); // pulisci
    renderActiveSection();
  };
  window.addEventListener('resize', __panelTabs.resizeHandler);
}

// CLOSE PANEL analitico (pulizia completa)
function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  overlayEl.setAttribute("aria-hidden","true");
  overlayEl.removeAttribute("data-blocking");

  // pulizia DOM (entrambi i target)
  ["#panel-title","#panel-subtitle","#panel-title-mobile","#panel-subtitle-mobile"].forEach(id => __clearNode(qs(id)));
  ["#panel-body","#panel-footer","#panel-body-mobile","#panel-footer-mobile"].forEach(id => __clearHTML(qs(id)));

  // unbind handler locali
  if (__panelTabs.clickHandler) { document.removeEventListener("click", __panelTabs.clickHandler); __panelTabs.clickHandler = null; }
  if (__panelTabs.keyHandler)   { document.removeEventListener("keydown", __panelTabs.keyHandler); __panelTabs.keyHandler   = null; }
  if (__panelTabs.resizeHandler){ window.removeEventListener('resize', __panelTabs.resizeHandler); __panelTabs.resizeHandler = null; }

  // reset stato
  __panelTabs.activeKey = null;
  __panelTabs.sectionsByKey = {};

  __panelLockScroll(false);
}

// ------------------------------------------------------------
// LEGAL OVERLAY (#legal-overlay) — identico API, separato
// ------------------------------------------------------------
function openLegalPanel(opts) {
  closeLegalPanel();
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;

  const { title="Informativa", subtitle="", body="", blocking=false, footerButtons=[] } = opts || {};
  const tDesk=qs("#legal-title"), sDesk=qs("#legal-subtitle"), bDesk=qs("#legal-body"), fDesk=qs("#legal-footer");
  const tMob=qs("#legal-title-mobile"), sMob=qs("#legal-subtitle-mobile"), bMob=qs("#legal-body-mobile"), fMob=qs("#legal-footer-mobile");

  setText(tDesk,title); setText(sDesk,subtitle); setHTML(bDesk,body);
  setText(tMob,title);  setText(sMob,subtitle);  setHTML(bMob,body);

  function renderFooter(arr){
    if (!arr || !arr.length) return `<button class="btn btn-sm" data-legal-close>Chiudi</button>`;
    return arr.map((b,i)=>`<button class="btn btn-sm" data-legal-btn="${i}">${escapeHtml(b.label||"OK")}</button>`).join("");
  }
  const footerHTML = renderFooter(footerButtons);
  setHTML(fDesk, footerHTML); setHTML(fMob, footerHTML);

  function bind(scope, defs){
    if (!scope) return;
    qsa("[data-legal-btn]", scope).forEach(btn=>{
      const i = btn.getAttribute("data-legal-btn");
      if (defs[i] && typeof defs[i].action==="function") {
        btn.addEventListener("click", ev=>{ ev.stopPropagation(); defs[i].action(); });
      }
    });
    qsa("[data-legal-close]", scope).forEach(btn=>{
      btn.addEventListener("click", ev=>{ ev.stopPropagation(); closeLegalPanel(); });
    });
  }
  bind(fDesk, footerButtons); bind(fMob, footerButtons);

  if (blocking) overlayEl.setAttribute("data-blocking","true"); else overlayEl.removeAttribute("data-blocking");
  __panelLockScroll(true);
  overlayEl.setAttribute("aria-hidden","false");

  // ESC/backdrop scoped al root legale
  function onDocClick(ev){
    const blockingFlag = overlayEl.getAttribute("data-blocking")==="true";
    if (ev.target.closest("[data-legal-close]")) { closeLegalPanel(); return; }
    const backdrop = ev.target.closest(".tl-panel-backdrop");
    if (backdrop && !blockingFlag && overlayEl.contains(backdrop)) { closeLegalPanel(); return; }
  }
  function onKeydown(e){
    const blockingFlag = overlayEl.getAttribute("data-blocking")==="true";
    if (e.key === 'Escape' && !blockingFlag) closeLegalPanel();
  }
  overlayEl.__clickHandler = onDocClick;
  overlayEl.__keyHandler   = onKeydown;
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeydown);
}
function closeLegalPanel() {
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden","true");
  overlayEl.removeAttribute("data-blocking");

  // pulizia testo/HTML
  ["#legal-title","#legal-subtitle","#legal-title-mobile","#legal-subtitle-mobile"].forEach(id => __clearNode(qs(id)));
  ["#legal-body","#legal-footer","#legal-body-mobile","#legal-footer-mobile"].forEach(id => __clearHTML(qs(id)));

  if (overlayEl.__clickHandler) { document.removeEventListener("click", overlayEl.__clickHandler); overlayEl.__clickHandler = null; }
  if (overlayEl.__keyHandler)   { document.removeEventListener("keydown", overlayEl.__keyHandler); overlayEl.__keyHandler   = null; }

  __panelLockScroll(false);
}

// ------------------------------------------------------------
// Pannelli predefiniti: Privacy / MiFID / Audit
// ------------------------------------------------------------
function openPrivacyPanel() {
  openLegalPanel({
    title: "Privacy & Trasparenza",
    subtitle: "Dati minimi. Nessun tracciamento pubblicitario.",
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
      </section>`,
    blocking: false,
    footerButtons: [{ label: "Chiudi", action: () => closeLegalPanel() }]
  });
}
function openMifidPanel() {
  openLegalPanel({
    title: "Informativa MiFID",
    subtitle: "Contenuto educativo/informativo. Non è consulenza personalizzata.",
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
      </section>`,
    blocking: true,
    footerButtons: [{
      label: "Ho letto",
      action: () => { try { localStorage.setItem("mifidAcknowledged","yes"); } catch(e){} closeLegalPanel(); }
    }]
  });
}
function openAuditPanel(a) {
  a = a || {};
  openPanel({
    title: "Audit dati / Fonti",
    subtitle: "Qualità campione e latenza feed",
    sections: [{
      title: "Origine dati",
      body: `
        <p><strong>Fonte primaria:</strong> ${escapeHtml(a.source_sync || "—")}<br/>
        <strong>Lag feed (giorni):</strong> ${escapeHtml(String(a.feed_lag_days ?? "—"))}<br/>
        <strong>Confidence (0-1):</strong> ${escapeHtml(String(a.confidence ?? "—"))}<br/>
        <strong>Integrità dataset:</strong> ${escapeHtml(String(a.integrity ?? "—"))}</p>
        ${ a.notes ? `<p style="margin-top:.5rem;">${escapeHtml(a.notes)}</p>` : `` }
      `,
      meta: `Pannello informativo, non è una validazione regolamentare.`
    },{
      title: "Avvertenza MiFID",
      body: `<p>Verifica adeguatezza/appropriatezza con consulente autorizzato.</p>`,
      meta: `Tradelia AI non fornisce consulenza personalizzata.`
    }],
    panelSize: "wide",
    footerButtons: [{ label: "Chiudi", action: () => closePanel() }]
  });
}

// ------------------------------------------------------------
// Tooltip metriche (“?”) — popover desktop / modal mobile
// ------------------------------------------------------------
let __TradeliaGlossary = {};
async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (res.ok) {
      const data = await res.json();
      __TradeliaGlossary = (data && typeof data === "object") ? data : {};
    }
  } catch(e) {
    console.warn("Glossary load error", e);
    __TradeliaGlossary = {};
  }
}
function getGlossaryEntry(key){
  const raw = __TradeliaGlossary[key] || {};
  return { title: raw.title || key || "—", what: raw.what || "—", how: raw.how || "—", source: raw.source || "" };
}
let currentPopoverOpen = false;
function buildMetricHTML(info){
  return `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;margin-bottom:.25rem;">Cosa mostra</div>
      <div>${escapeHtml(info.what)}</div>
    </div>
    <div style="font-size:13px;line-height:1.45;color:var(--ink);">
      <div style="font-weight:600;margin-bottom:.25rem;">Come si usa</div>
      <div>${escapeHtml(info.how)}</div>
    </div>
  `;
}
function openMetricDesktop(btnEl){
  const pop = qs("#metric-popover"); if (!pop) return;
  const key = btnEl.getAttribute("data-metric"); const info = getGlossaryEntry(key);
  setText(qs("#metric-popover-title"), info.title || key || "—");
  setHTML(qs("#metric-popover-body"), buildMetricHTML(info));
  setHTML(qs("#metric-popover-source"), info.source ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}` : "");

  const rect = btnEl.getBoundingClientRect(); const OFFSET_X=8, OFFSET_Y=4;
  let left = rect.left + window.scrollX + OFFSET_X;
  let top  = rect.bottom + window.scrollY + OFFSET_Y;

  pop.style.position="absolute"; pop.style.maxWidth="320px";
  pop.style.left = left+"px"; pop.style.top = top+"px";
  pop.setAttribute("aria-hidden","false");

  const vpW = window.innerWidth, vpH = window.innerHeight;
  const pr = pop.getBoundingClientRect();
  if (pr.right > vpW-8) left -= (pr.right - (vpW-8));
  if (left < window.scrollX+8) left = window.scrollX+8;
  if (pr.bottom > vpH-8) top = rect.top + window.scrollY - pr.height - OFFSET_Y;
  if (top < window.scrollY+8) top = window.scrollY+8;
  pop.style.left = left+"px"; pop.style.top = top+"px";
  currentPopoverOpen = true;
}
function closeMetricDesktop(){ const pop = qs("#metric-popover"); if (pop) pop.setAttribute("aria-hidden","true"); currentPopoverOpen=false; }
function openMetricMobile(btnEl){
  const modal = qs("#metric-modal"); if (!modal) return;
  const key = btnEl.getAttribute("data-metric"); const info = getGlossaryEntry(key);
  setText(qs("#metric-modal-title"), info.title || key || "—");
  setHTML(qs("#metric-modal-body"), buildMetricHTML(info));
  setHTML(qs("#metric-modal-source"), info.source ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}` : "");
  modal.setAttribute("aria-hidden","false");
}
function closeMetricMobile(){ const m=qs("#metric-modal"); if (m) m.setAttribute("aria-hidden","true"); }

function bindMetricInfoButtons(scope){
  const root = scope || document;
  qsa(".info-btn", root).forEach(btn=>{
    if (btn.__metricBound) return;
    btn.__metricBound = true;
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      if (isMobile()) openMetricMobile(btn);
      else { if (currentPopoverOpen) closeMetricDesktop(); openMetricDesktop(btn); }
    });
  });
}
const popClose = qs("#metric-popover-close");
if (popClose) popClose.addEventListener("click", (e)=>{ e.stopPropagation(); closeMetricDesktop(); });
document.addEventListener("click", (ev)=>{
  const pop = qs("#metric-popover"); if (!pop || pop.getAttribute("aria-hidden")==="true") return;
  if (pop.contains(ev.target)) return;
  if (ev.target.closest(".info-btn")) return;
  closeMetricDesktop();
});
qsa("[data-metric-close]").forEach(btn => btn.addEventListener("click", ()=> closeMetricMobile()));

// ------------------------------------------------------------
// Tema
// ------------------------------------------------------------
function initThemeToggle(){
  const btn = qs("#btn-theme");
  function applyTheme(theme){ document.documentElement.setAttribute("data-theme", theme); try { localStorage.setItem("tradelia-theme", theme); } catch(e){} }
  (function firstLoad(){
    let stored=null; try { stored = localStorage.getItem("tradelia-theme"); } catch(e){}
    if (stored==="dark" || stored==="light") applyTheme(stored); else applyTheme("dark");
  })();
  if (btn) btn.addEventListener("click", ()=>{
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(cur==="light" ? "dark" : "light");
  });
}

// ------------------------------------------------------------
// Print
// ------------------------------------------------------------
function initPrintButtons(){
  [qs("#btn-print"), qs("#btn-print-2")].forEach(btn=>{
    if (!btn) return;
    btn.addEventListener("click", ()=> window.print());
  });
}

// ------------------------------------------------------------
// Share overlay (opzionale)
// ------------------------------------------------------------
function initShareOverlay(){
  const overlay = qs("#share-overlay"); const btnOpen = qs("#btn-share");
  if (!overlay || !btnOpen) return;
  const closeElems = qsa("[data-share-close]", overlay);
  const copyBtns   = qsa("[data-share-svc='copy'], #share-copy-btn", overlay);
  function openShare(){
    const field = qs("#share-link-field"); if (field) field.textContent = window.location.href;
    overlay.setAttribute("aria-hidden","false");
  }
  function closeShare(){ overlay.setAttribute("aria-hidden","true"); }
  btnOpen.addEventListener("click", openShare);
  closeElems.forEach(el => el.addEventListener("click", closeShare));
  copyBtns.forEach(el => el.addEventListener("click", ()=>{ try { navigator.clipboard.writeText(window.location.href); } catch(e){} }));
}

// ------------------------------------------------------------
// Bottoni legali footer
// ------------------------------------------------------------
function initLegalButtons(){
  const privBtn = qs("#btn-privacy-open"); if (privBtn) privBtn.addEventListener("click", ()=> openPrivacyPanel());
  const mifidBtn = qs("#btn-mifid-open");  if (mifidBtn)  mifidBtn.addEventListener("click", ()=> openMifidPanel());
}

// ------------------------------------------------------------
// Export API globale
// ------------------------------------------------------------
window.__TradeliaUI = {
  openPanel, closePanel,
  openPrivacyPanel, openMifidPanel, openAuditPanel,
  bindMetricInfoButtons,
  openLegalPanel, closeLegalPanel
};
// retrocompat
window.openPanel = openPanel; window.closePanel = closePanel;

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
async function bootUIRuntime(){
  await loadGlossary();
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();
  bindMetricInfoButtons(document);

  // icone lucide
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try { window.lucide.createIcons(); } catch(e){ console.warn("lucide.createIcons() error:", e); }
  }
  // footer year
  const fy = qs("#footer-year"); if (fy && !fy.textContent.trim()) fy.textContent = new Date().getFullYear();
}
bootUIRuntime();

// Harden export
if (!window.__TradeliaUI) window.__TradeliaUI = {};
window.__TradeliaUI.openPanel = openPanel;
window.__TradeliaUI.closePanel = closePanel;
window.__TradeliaUI.openPrivacyPanel = openPrivacyPanel;
window.__TradeliaUI.openMifidPanel = openMifidPanel;
window.__TradeliaUI.openAuditPanel = openAuditPanel;
window.__TradeliaUI.bindMetricInfoButtons = bindMetricInfoButtons;
window.__TradeliaUI.openLegalPanel = openLegalPanel;
window.__TradeliaUI.closeLegalPanel = closeLegalPanel;

// ------------------------------------------------------------
// MiFID obbligatorio primo accesso
// ------------------------------------------------------------
(function enforceMifidFirstVisit(){
  try {
    const ok = localStorage.getItem("mifidAcknowledged");
    if (!ok) {
      if (window.__TradeliaUI && typeof window.__TradeliaUI.openMifidPanel === "function") {
        window.__TradeliaUI.openMifidPanel();
      }
    }
  } catch(e){ console.warn("enforceMifidFirstVisit error:", e); }
})();
// =============== PATCH DIAGNOSTICA (incolla alla fine del file) ===============

// elenco ganci richiesti dal drawer analitico
const __PANEL_REQUIRED = [
  '#panel-overlay',
  '#panel-title', '#panel-subtitle', '#panel-body', '#panel-footer',
  '#panel-title-mobile', '#panel-subtitle-mobile', '#panel-body-mobile', '#panel-footer-mobile',
  '.tl-panel--desktop', '.tl-panel--mobile', '.tl-panel-backdrop'
];

// validator: controlla ganci, aria-hidden e z-index visibilità
function __validatePanelStructure() {
  const missing = [];
  const info = [];
  __PANEL_REQUIRED.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) missing.push(sel);
    info.push({
      selector: sel,
      present: !!el,
      display: el ? getComputedStyle(el).display : '—',
      visibility: el ? getComputedStyle(el).visibility : '—',
      opacity: el ? getComputedStyle(el).opacity : '—',
      zIndex: el ? getComputedStyle(el).zIndex : '—'
    });
  });

  const root = document.querySelector('#panel-overlay');
  const aria = root ? root.getAttribute('aria-hidden') : '—';
  const blocking = root ? root.getAttribute('data-blocking') : '—';

  console.group('%c[TradeliaUI] Panel Validator', 'color:#12b886;font-weight:600;');
  console.log('aria-hidden:', aria, 'data-blocking:', blocking);
  console.table(info);
  if (missing.length) {
    console.error('MANCANO QUESTI SELECTOR:', missing);
  } else {
    console.log('OK: struttura base presente.');
  }
  console.groupEnd();

  return { missing, aria, blocking };
}

// helper: prende il target attivo (clona la logica runtime)
function __getActivePanelTarget() {
  const overlay = document.querySelector('#panel-overlay');
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  return mobile ? {
    mode: 'mobile',
    aside: overlay?.querySelector('.tl-panel--mobile'),
    title: overlay?.querySelector('#panel-title-mobile'),
    sub:   overlay?.querySelector('#panel-subtitle-mobile'),
    body:  overlay?.querySelector('#panel-body-mobile'),
    foot:  overlay?.querySelector('#panel-footer-mobile'),
  } : {
    mode: 'desktop',
    aside: overlay?.querySelector('.tl-panel--desktop'),
    title: overlay?.querySelector('#panel-title'),
    sub:   overlay?.querySelector('#panel-subtitle'),
    body:  overlay?.querySelector('#panel-body'),
    foot:  overlay?.querySelector('#panel-footer'),
  };
}

// espone due utility per debug live
window.__TradeliaUI = window.__TradeliaUI || {};

// 1) self-test: apre un drawer con 3 schede reali
window.__TradeliaUI.selfTest = function selfTest() {
  const v = __validatePanelStructure();
  if (v.missing.length) {
    alert('Markup drawer incompleto. Guarda la console (Panel Validator).');
    return;
  }
  try {
    window.__TradeliaUI.openPanel({
      title: "Self-Test Drawer",
      subtitle: "Se vedi il contenuto sotto e cambiano le schede, è OK.",
      footerTabs: [
        { key:"dataset",    label:"Dataset" },
        { key:"signals",    label:"Segnali" },
        { key:"governance", label:"Governance" }
      ],
      sections: [
        { key:"dataset",    title:"Dataset",    body:`<p>Tab 1 · Dataset</p><button class="info-btn" data-metric="Dataset_info">?</button>` },
        { key:"signals",    title:"Segnali",    body:`<p>Tab 2 · Segnali</p><button class="info-btn" data-metric="Signals_info">?</button>` },
        { key:"governance", title:"Governance", body:`<p>Tab 3 · Governance</p><button class="info-btn" data-metric="Governance_info">?</button>`, meta:"MiFID/Qualità" }
      ],
      footerButtons: [{ label:"Chiudi", action: ()=> window.__TradeliaUI.closePanel() }],
      panelSize: "xl"
    });
  } catch (e) {
    console.error('openPanel ha lanciato eccezione:', e);
    alert('openPanel ha fallito. Vedi console per errore.');
  }
};

// 2) dumpState: mostra target attivo e visibilità
window.__TradeliaUI.dumpState = function dumpState() {
  const t = __getActivePanelTarget();
  const root = document.querySelector('#panel-overlay');
  const aria = root ? root.getAttribute('aria-hidden') : '—';
  const out = {
    mode: t.mode,
    haveTitle: !!t.title,
    haveSub: !!t.sub,
    haveBody: !!t.body,
    haveFoot: !!t.foot,
    ariaHidden: aria,
    bodyScrollTop: t.body ? t.body.scrollTop : '—'
  };
  console.group('%c[TradeliaUI] Panel State', 'color:#228be6;font-weight:600;');
  console.table(out);
  console.groupEnd();
  return out;
};

// kick: se vuoi autovalidare a runtime
setTimeout(() => {
  __validatePanelStructure();
}, 0);

// ============= FINE PATCH DIAGNOSTICA =======================
