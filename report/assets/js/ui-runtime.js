// /report/assets/js/ui-runtime.js
// Runtime UI globale (nessun dato di mercato qui).
// - Drawer analitico (F1B/F2/F3...) -> #panel-overlay
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
// Drawer ANALITICO (#panel-overlay) — FIX: singolo target attivo
// ------------------------------------------------------------
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
      aside: qs('.tl-panel--desktop', overlay),
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
      aside: qs('.tl-panel--mobile', overlay),
      title: qs('#panel-title-mobile', overlay),
      sub:   qs('#panel-subtitle-mobile', overlay),
      body:  qs('#panel-body-mobile', overlay),
      foot:  qs('#panel-footer-mobile', overlay)
    }
  };
}
function __panelLockScroll(lock){
  document.body.classList.toggle('body--lock', !!lock);
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
function __resetScrollable(el){ try { if(el) el.scrollTop = 0; } catch(e){} }

// openPanel API identica alle versioni precedenti
function openPanel(opts) {
  closePanel(); // pulizia sempre
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],
    blocking = false,
    panelSize,
    footerButtons = [],
    footerTabs = []
  } = opts || {};

  // target attivo (SOLO UNO) + svuotiamo l'altro per evitare "doppio pannello"
  const tgt = __panelActiveTarget();
  const oth = tgt.other || {};
  [oth.title, oth.sub].forEach(n => setText(n, ""));
  [oth.body, oth.foot].forEach(n => setHTML(n, ""));

  // header
  setText(tgt.title, title);
  setText(tgt.sub, subtitle);

  // corpo
  let bodyHTML = "";
  if (panelSize === "wide" && sections.length === 1) {
    bodyHTML = sections[0].body || "";
  } else {
    bodyHTML = sections.map(section => {
      const st  = section.title || "";
      const bd  = section.body  || "";
      const mta = section.meta  || "";
      return `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${ st ? `
            <div class="tl-panel-section-title">
              <div class="tl-panel-section-title-text">${escapeHtml(st)}</div>
            </div>` : `` }
          <div class="tl-panel-section-text">${bd}</div>
          ${ mta ? `<div class="tl-panel-section-meta">${mta}</div>` : `` }
        </section>
      `;
    }).join("");
  }
  setHTML(tgt.body, bodyHTML);
  __resetScrollable(tgt.body);

  // footer
  function renderFooterBtns(arr) {
    if (!arr || !arr.length) return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    return arr.map((btn, i) => `<button class="btn btn-sm" data-panel-btn="${i}">${escapeHtml(btn.label || "OK")}</button>`).join("");
  }
  function renderFooterTabs(tabsArr) {
    if (!tabsArr || !tabsArr.length) return renderFooterBtns(footerButtons);
    const pills = tabsArr.map(t =>
      `<button class="f1b-footer-tab-btn" data-f1b-tab="${escapeHtml(t.key)}">${escapeHtml(t.label)}</button>`
    ).join("");
    const closeBtn = `<button class="f1b-footer-close-btn" data-panel-close>Chiudi</button>`;
    return `
      <div class="f1b-footer-tabs-wrap">
        <div class="f1b-footer-tabs-scroll">${pills}</div>
        ${closeBtn}
      </div>
    `;
  }
  const mobileFooterHTML  = renderFooterTabs(footerTabs);
  const desktopFooterHTML = renderFooterBtns(footerButtons);

  // scrivi SOLO nel target attivo; svuota l'altro
  if (isMobile()) {
    setHTML(tgt.foot, mobileFooterHTML);
    setHTML(oth.foot, "");
  } else {
    setHTML(tgt.foot, desktopFooterHTML);
    setHTML(oth.foot, "");
  }

  // bind footer actions (solo target attivo)
  function bindFooterButtons(scopeEl, buttonsDefArr) {
    if (!scopeEl) return;
    qsa("[data-panel-btn]", scopeEl).forEach(btnEl => {
      const i = btnEl.getAttribute("data-panel-btn");
      if (buttonsDefArr[i] && typeof buttonsDefArr[i].action === "function") {
        btnEl.addEventListener("click", (ev) => { ev.stopPropagation(); buttonsDefArr[i].action(); });
      }
    });
    qsa("[data-panel-close]", scopeEl).forEach(btnEl => {
      btnEl.addEventListener("click", (ev) => { ev.stopPropagation(); closePanel(); });
    });

    // reset scroll al cambio tab (mobile)
    qsa('[data-f1b-tab]', scopeEl).forEach(btn => {
      btn.addEventListener('click', () => __resetScrollable(tgt.body));
    });
  }
  bindFooterButtons(tgt.foot, footerButtons);

  // blocking + larghezza
  if (blocking) overlayEl.setAttribute("data-blocking","true"); else overlayEl.removeAttribute("data-blocking");
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove("tl-panel--wide","tl-panel--xl");
    if (panelSize === "wide") panelDesktop.classList.add("tl-panel--wide");
    else if (panelSize === "xl") panelDesktop.classList.add("tl-panel--xl");
  }

  // mostra overlay
  __panelLockScroll(true);
  overlayEl.setAttribute("aria-hidden","false");

  // bind "?" apparsi dentro il drawer
  bindMetricInfoButtons(overlayEl);
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden","true");
  // pulizia contenuti (evita "fantasmi" su riaperture)
  const allBodies = ["#panel-body","#panel-body-mobile"].map(id=>qs(id));
  const allTitles = ["#panel-title","#panel-title-mobile"].map(id=>qs(id));
  const allSubs   = ["#panel-subtitle","#panel-subtitle-mobile"].map(id=>qs(id));
  const allFoot   = ["#panel-footer","#panel-footer-mobile"].map(id=>qs(id));
  [...allBodies,...allFoot].forEach(n=> setHTML(n,""));
  [...allTitles,...allSubs].forEach(n=> setText(n,""));
  overlayEl.removeAttribute("data-blocking");
  __panelLockScroll(false);
}

// chiusure generiche
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl || overlayEl.getAttribute("aria-hidden")==="true") return;
  const blocking = overlayEl.getAttribute("data-blocking")==="true";
  if (ev.target.closest("[data-panel-close]")) { closePanel(); return; }
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) { closePanel(); return; }
});

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
}
function closeLegalPanel() {
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden","true");
  overlayEl.removeAttribute("data-blocking");
  __panelLockScroll(false);
}
document.addEventListener("click", ev=>{
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl || overlayEl.getAttribute("aria-hidden")==="true") return;
  const blocking = overlayEl.getAttribute("data-blocking")==="true";
  if (ev.target.closest("[data-legal-close]")) { closeLegalPanel(); return; }
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking && overlayEl.contains(backdrop)) { closeLegalPanel(); return; }
});

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
  copyBtns.forEach(el => el.addEventListener("click", ()=>{
    try { navigator.clipboard.writeText(window.location.href); } catch(e){}
  }));
}

// ------------------------------------------------------------
// Bottoni legali footer
// ------------------------------------------------------------
function initLegalButtons(){
  const privBtn = qs("#btn-privacy-open"); if (privBtn) privBtn.addEventListener("click", ()=> openPrivacyPanel());
  const mifidBtn = qs("#btn-mifid-open");  if (mifidBtn) mifidBtn.addEventListener("click", ()=> openMifidPanel());
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
