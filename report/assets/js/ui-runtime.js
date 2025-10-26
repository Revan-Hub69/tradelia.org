// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati mercato):
// - drawer premium con tabs (openPanelPremium)
// - tooltip metriche (?)
// - tema light/dark
// - share overlay
// - stampa
// - footer year
//
// ATTENZIONE: questo file sostituisce la versione precedente.
// Mantiene le parti utili ma aggiorna la gestione del panel
// per usare il markup premium (.tl-panel-tabs / .tl-panel-section ...)

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}
function setText(el, txt) {
  if (el) el.textContent = txt ?? "";
}
function setHTML(el, html) {
  if (el) el.innerHTML = html ?? "";
}
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// ---------------------------------------------------------
// GLOSSARIO METRICHE
// ---------------------------------------------------------
let __TradeliaGlossary = {};

async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (res.ok) {
      __TradeliaGlossary = await res.json();
    } else {
      __TradeliaGlossary = {};
    }
  } catch {
    __TradeliaGlossary = {};
  }
  // debug
  window.__TradeliaGlossary = __TradeliaGlossary;
}

function getMetricInfo(metricKey) {
  const raw = __TradeliaGlossary?.[metricKey];
  if (raw && typeof raw === "object") {
    return {
      label:          raw.label || metricKey || "—",
      academic_def:   raw.academic_def || "",
      interpretation: raw.interpretation || "",
      source:         raw.source || ""
    };
  }
  return {
    label:          metricKey || "—",
    academic_def:   "Metrica in definizione. Sarà documentata nel Glossario Tecnico Tradelia AI.",
    interpretation: "Interpretazione in corso di validazione.",
    source:         "In corso di validazione."
  };
}

function buildMetricHTML(info) {
  return `
    <div class="tl-metric-block">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Cos’è
      </div>
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)]">
        ${escapeHtml(info.academic_def)}
      </div>
    </div>

    <div class="tl-metric-block mt-3">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Come leggerla
      </div>
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)]">
        ${escapeHtml(info.interpretation)}
      </div>
    </div>

    <div class="tl-metric-block mt-3">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Fonti / Metodo
      </div>
      <div class="text-[12px] leading-[1.4] text-[color:var(--muted)]">
        ${escapeHtml(info.source)}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------
// PANEL OVERLAY - PREMIUM
// ---------------------------------------------------------
//
// openPanelPremium({
//   title: "string",
//   subtitle: "string",
//   tabs: [
//     {
//       id: "regime",
//       label: "Regime attuale",
//       active: true/false,
//       sections: [
//          {
//            title: "Blocco X",
//            tone: "pos" | "warn" | "neg" | "neu" | undefined,
//            pillLabel: "Risk ON"   (facoltativo),
//            bodyHTML: "<p> ... </p>",
//            metaHTML: "<div> ... </div>" (facoltativo)
//          },
//          ...
//       ]
//     },
//     ...
//   ],
//   footerButtons: [ {label:"Chiudi", action:fn}, ... ],
//   blocking: false,
//   wide: true/false
// })
//
// NOTE: costruiamo markup premium con:
//  - .tl-panel-tabs
//  - .tl-panel-sections-wrapper
//  - .tl-panel-section + .tl-panel-section-pill
//  - attivazione tab -> mostra/nasconde wrapper
//
// Dark mode: tutto usa var() quindi niente inline colori fissi.
//

function openPanelPremium(cfg) {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    tabs = [],
    footerButtons = [],
    blocking = false,
    wide = false
  } = cfg || {};

  // refs desktop/mobile
  const titleDeskEl    = qs("#panel-title");
  const subDeskEl      = qs("#panel-subtitle");
  const bodyDeskEl     = qs("#panel-body");
  const footerDeskEl   = qs("#panel-footer");

  const titleMobEl     = qs("#panel-title-mobile");
  const subMobEl       = qs("#panel-subtitle-mobile");
  const bodyMobEl      = qs("#panel-body-mobile");
  const footerMobEl    = qs("#panel-footer-mobile");

  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // markup del contenuto "console" con tabs premium
  const panelInnerHTML = buildPremiumPanelTabsHTML(tabs);

  setHTML(bodyDeskEl, panelInnerHTML);
  setHTML(bodyMobEl,  panelInnerHTML);

  // footer
  setHTML(footerDeskEl, renderFooterBtns(footerButtons));
  setHTML(footerMobEl,  renderFooterBtns(footerButtons));

  // attacca azioni custom ai bottoni footer
  bindFooterButtonActions(footerDeskEl, footerButtons);
  bindFooterButtonActions(footerMobEl,  footerButtons);

  // blocking?
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // wide panel desktop (tl-panel--wide usa token panel-width-desktop-wide)
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.toggle("tl-panel--wide", !!wide);
  }

  // blocca scroll body sotto
  document.body.classList.add("body--lock");

  // mostra overlay
  overlayEl.setAttribute("aria-hidden", "false");

  // bind interazioni runtime nel contenuto appena creato
  initPremiumTabs(bodyDeskEl);
  initPremiumTabs(bodyMobEl);

  // collega i tooltip "?" appena inseriti
  bindMetricInfoButtons(bodyDeskEl);
  bindMetricInfoButtons(bodyMobEl);

  // icone lucide (se l'html le usa)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try { window.lucide.createIcons(); } catch(e){}
  }
}

// chiudi panel premium
function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  overlayEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body--lock");

  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove("tl-panel--wide");
  }
}

// build footer button markup
function renderFooterBtns(arr) {
  if (!arr || !arr.length) {
    return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
  }
  return arr.map((btn, idx) => {
    return `<button class="btn btn-sm" data-panel-btn="${idx}">${escapeHtml(btn.label || "OK")}</button>`;
  }).join("");
}

function bindFooterButtonActions(footerRoot, footerButtons) {
  qsa("[data-panel-btn]", footerRoot).forEach(btnEl => {
    const i = btnEl.getAttribute("data-panel-btn");
    const spec = footerButtons[i];
    if (spec && typeof spec.action === "function") {
      btnEl.addEventListener("click", spec.action);
    }
  });
}

// costruisce il markup premium tabs + sections wrapper
function buildPremiumPanelTabsHTML(tabs) {
  // tabs strip
  const tabsStripHTML = tabs.map(t => {
    return `
      <button
        class="tl-panel-tab ${t.active ? "is-active":""}"
        data-premtab="${escapeHtml(t.id)}"
        type="button"
      >
        <span>${escapeHtml(t.label || t.id)}</span>
        ${
          t.badge
            ? `<span class="tl-panel-tab-badge">${escapeHtml(t.badge)}</span>`
            : ``
        }
      </button>
    `;
  }).join("");

  // sezioni per ogni tab (ognuno ha wrapper suo)
  const allTabSectionsHTML = tabs.map(t => {
    // ogni tab => wrapper con data-premview
    const sectionsHTML = (t.sections||[]).map(sec => {
      const pillTone   = sec.tone || "neu"; // pos|warn|neg|neu
      const pillLabel  = sec.pillLabel || sec.toneLabel || "status";
      const safeTitle  = sec.title || "";
      const bodyHTML   = sec.bodyHTML || "";
      const metaHTML   = sec.metaHTML || "";

      return `
        <section class="tl-panel-section ${sec.active ? "is-active":""}">
          <div class="tl-panel-section-title">
            <div class="tl-panel-section-title-text">
              ${escapeHtml(safeTitle)}
            </div>

            <div class="tl-panel-section-pill">
              <span class="pill-icon" data-tone="${escapeHtml(pillTone)}">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
                  <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </span>
              <span class="tl-panel-section-pill-dot" data-tone="${escapeHtml(pillTone)}"></span>
              <span>${escapeHtml(pillLabel)}</span>
            </div>
          </div>

          <div class="tl-panel-section-text">
            ${bodyHTML}
          </div>

          ${
            metaHTML
              ? `<div class="tl-panel-section-meta">${metaHTML}</div>`
              : ``
          }
        </section>
      `;
    }).join("");

    return `
      <div class="tl-panel-sections-wrapper"
           data-premview="${escapeHtml(t.id)}"
           ${t.active ? "" : "hidden"}
      >
        ${sectionsHTML}
      </div>
    `;
  }).join("");

  return `
    <div class="tl-panel-tabs">
      ${tabsStripHTML}
    </div>

    ${allTabSectionsHTML}
  `;
}

// logica di switch tab premium
function initPremiumTabs(rootScope) {
  if (!rootScope) return;

  const tabsBtn = qsa(".tl-panel-tab", rootScope);
  const viewsWraps = qsa("[data-premview]", rootScope);

  tabsBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-premtab");

      // attiva bottone cliccato
      tabsBtn.forEach(b => {
        b.classList.toggle("is-active", b.getAttribute("data-premtab") === key);
      });

      // mostra wrapper giusto
      viewsWraps.forEach(vw => {
        const me = vw.getAttribute("data-premview");
        const active = (me === key);
        vw.hidden = !active;
        // opzionale: scroll top all'apertura tab
        if (active) {
          vw.scrollTop = 0;
        }
      });
    });
  });
}

// chiusura panel premium tramite backdrop / [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  // bottone esplicito close
  const closeBtn = ev.target.closest("[data-panel-close]");
  if (closeBtn) {
    closePanel();
    return;
  }

  // backdrop (solo se !blocking)
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});

// ---------------------------------------------------------
// TOOLTIP METRICHE (?)
// ---------------------------------------------------------

let currentPopoverOpen = false;

function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key  = btnEl.getAttribute("data-metric");
  const info = getMetricInfo(key);

  setText(qs("#metric-popover-title"), info.label || key || "—");
  setHTML(qs("#metric-popover-body"), buildMetricHTML(info));

  const rect = btnEl.getBoundingClientRect();
  pop.style.left = rect.left + "px";
  pop.style.top  = (rect.bottom + 8) + "px";

  // se sfora a destra
  const estWidth = 320;
  const overflowX = rect.left + estWidth + 16 - window.innerWidth;
  if (overflowX > 0) {
    const newLeft = Math.max(16, rect.left - overflowX);
    pop.style.left = newLeft + "px";
  }

  pop.setAttribute("aria-hidden", "false");
  currentPopoverOpen = true;
}

function closeMetricDesktop() {
  const pop = qs("#metric-popover");
  if (!pop) return;
  pop.setAttribute("aria-hidden", "true");
  currentPopoverOpen = false;
}

function openMetricMobile(btnEl) {
  const modal = qs("#metric-modal");
  if (!modal) return;

  const key  = btnEl.getAttribute("data-metric");
  const info = getMetricInfo(key);

  setText(qs("#metric-modal-title"), info.label || key || "—");
  setHTML(qs("#metric-modal-body"), buildMetricHTML(info));

  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("body--lock");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;

  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("body--lock");
}

// bind "?" (riusabile su tutto il DOM o dentro panel aperto)
function bindMetricInfoButtons(scope) {
  const root = scope || document;
  qsa(".info-btn", root).forEach(btn => {
    if (btn.__metricBound) return;
    btn.__metricBound = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isMobile()) {
        openMetricMobile(btn);
      } else {
        if (currentPopoverOpen) {
          closeMetricDesktop();
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiusura popover metriche desktop
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// click fuori popover desktop
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;
  if (pop.contains(ev.target)) return;
  if (ev.target.closest(".info-btn")) return;
  closeMetricDesktop();
});

// chiusura metric modal mobile
qsa("[data-metric-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeMetricMobile();
  });
});

// ---------------------------------------------------------
// THEME SWITCH
// ---------------------------------------------------------
function initThemeToggle() {
  const btnTheme = qs("#btn-theme");
  if (!btnTheme) return;

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tradelia-theme", theme); } catch(e){}
  }

  // init da localStorage
  try {
    const saved = localStorage.getItem("tradelia-theme");
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    }
  } catch(e){}

  btnTheme.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "light" ? "dark" : "light";
    applyTheme(next);
  });
}

// ---------------------------------------------------------
// PRINT
// ---------------------------------------------------------
function initPrintButtons() {
  const p1 = qs("#btn-print");
  const p2 = qs("#btn-print-2");
  [p1,p2].forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.print();
    });
  });
}

// ---------------------------------------------------------
// SHARE OVERLAY
// ---------------------------------------------------------
function initShareOverlay() {
  const overlay = qs("#share-overlay");
  const btnOpen = qs("#btn-share");
  if (!overlay || !btnOpen) return;

  const closeElems = qsa("[data-share-close]", overlay);
  const copyBtns   = qsa("[data-share-svc='copy'], #share-copy-btn", overlay);

  function openShare() {
    const linkField = qs("#share-link-field");
    if (linkField) linkField.textContent = window.location.href;
    overlay.setAttribute("aria-hidden","false");
  }

  function closeShare() {
    overlay.setAttribute("aria-hidden","true");
  }

  btnOpen.addEventListener("click", openShare);
  closeElems.forEach(el => el.addEventListener("click", closeShare));

  copyBtns.forEach(el => {
    el.addEventListener("click", () => {
      const url = window.location.href;
      try { navigator.clipboard.writeText(url); } catch(e){}
    });
  });
}

// ---------------------------------------------------------
// LEGAL BUTTONS (Privacy / MiFID)
// ---------------------------------------------------------

function openPrivacyPanel() {
  openPanelPremium({
    title: "Privacy & Trasparenza",
    subtitle: "Nessun tracking di profilazione. Preferenze salvate solo in locale.",
    tabs: [
      {
        id: "privacy",
        label: "Privacy",
        active: true,
        sections: [
          {
            title: "Come gestiamo i dati",
            tone: "neu",
            pillLabel: "trasparenza",
            bodyHTML: `
              <p>
                Tradelia AI adotta <strong>zero tracciamento di profilazione</strong>.
                Nessuna vendita di dati personali. Nessun cookie pubblicitario.
              </p>
              <ul class="list-disc pl-4 text-[12.5px] leading-[1.45] mt-2">
                <li>Nessuna profilazione marketing.</li>
                <li>Nessun analytics invasivo di terze parti.</li>
                <li>Preferenze (tema ecc.) solo nel tuo browser (<code>localStorage</code>).</li>
              </ul>
            `,
            metaHTML: `
              Riferimenti: GDPR (UE 2016/679), Direttiva ePrivacy,
              Linee Guida EDPB.
            `
          }
        ]
      }
    ],
    footerButtons: [
      {
        label:"Chiudi",
        action: () => closePanel()
      }
    ],
    blocking:false,
    wide:false
  });
}

function openMifidPanel() {
  openPanelPremium({
    title: "Informativa MiFID",
    subtitle: "Contenuto informativo/formativo. Non è consulenza personalizzata.",
    tabs: [
      {
        id:"mifid",
        label:"MiFID",
        active:true,
        sections:[
          {
            title:"Chi è Tradelia AI",
            tone:"neu",
            pillLabel:"contesto",
            bodyHTML:`
              <p>
                Tradelia AI è una piattaforma di analisi e alfabetizzazione finanziaria.
                Non raccogliamo ordini, non gestiamo capitali di terzi,
                non forniamo raccomandazioni personalizzate.
              </p>
              <p class="mt-2">
                L'obiettivo è aiutarti a leggere regime di mercato,
                volatilità implicita, flussi e fattori tecnici, in modo tracciabile.
              </p>`,
            metaHTML:`Direttiva MiFID II · ESMA.`,
          },
          {
            title:"Nessuna raccomandazione operativa",
            tone:"warn",
            pillLabel:"attenzione",
            bodyHTML:`
              <p>
                I moduli F1–F6 descrivono scenari, contesto e fattori di rischio.
                <strong>Non</strong> sono un invito ad aprire/chiudere posizioni
                o a modificare l’allocazione del portafoglio.
              </p>`,
            metaHTML:`Verifica adeguatezza/appropriatezza col tuo intermediario regolamentato.`,
          },
          {
            title:"Rischio",
            tone:"neg",
            pillLabel:"rischio",
            bodyHTML:`
              <p>
                Ogni strumento finanziario comporta rischio di perdita totale
                o parziale del capitale. Le performance storiche o simulate
                non garantiscono risultati futuri.
              </p>`,
            metaHTML:`Shock macro e liquidità possono generare movimenti estremi
                      in tempi molto brevi.`,
          }
        ]
      }
    ],
    footerButtons:[
      { label:"Ho letto", action: () => closePanel() }
    ],
    blocking:true,
    wide:false
  });
}

// bind bottoni footer legali
function initLegalButtons() {
  const privBtn = qs("#btn-privacy-open");
  if (privBtn) {
    privBtn.addEventListener("click", openPrivacyPanel);
  }

  const mifidBtn = qs("#btn-mifid-open");
  if (mifidBtn) {
    mifidBtn.addEventListener("click", openMifidPanel);
  }
}

// ---------------------------------------------------------
// EXPORT PUBBLICO
// ---------------------------------------------------------
window.__TradeliaUI = {
  openPanelPremium,
  closePanel,
  bindMetricInfoButtons
};

// retrocompat minimale
window.closePanel = closePanel;

// ---------------------------------------------------------
// BOOT
// ---------------------------------------------------------
async function bootUIRuntime() {
  await loadGlossary();         // servono i tooltip

  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();

  bindMetricInfoButtons(document);

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try { window.lucide.createIcons(); } catch(e){}
  }

  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    footerYearEl.textContent = new Date().getFullYear();
  }
}

bootUIRuntime();
