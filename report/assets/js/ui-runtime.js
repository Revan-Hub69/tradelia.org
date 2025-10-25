// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello informativo (Privacy / MiFID / Drawer F1B ecc.)
// - tooltip metriche ("?") desktop/mobile, alimentato da glossary.json
// - tema light/dark
// - share overlay
// - stampa
//
// VERSIONE REV FINAL
// ------------------
//
// NOTE IMPORTANTI:
// - Assumiamo che index.html abbia gli ID esatti usati qui
//   (#btn-print, #panel-overlay, #metric-popover, ecc).
// - Assumiamo che tokens.css sia quello "pulito" finale che gestisce
//   .onlyprint / .noprint / body--lock / z-index overlay.
//
// ---------------------------------------------------------------------------
// Utility DOM
// ---------------------------------------------------------------------------

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}
function setText(el, txt) {
  if (!el) return;
  el.textContent = txt;
}
function setHTML(el, html) {
  if (!el) return;
  el.innerHTML = html;
}
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// Safe escape (contro injection nel panel / tooltip)
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

// ---------------------------------------------------------------------------
// GLOSSARIO METRICHE
// ---------------------------------------------------------------------------
//
// /report/assets/glossary.json (esempio):
// {
//   "RiskTilt": {
//     "label": "RiskTilt",
//     "academic_def": "Indicatore oggettivo...",
//     "interpretation": "Se cresce → ...",
//     "source": "CBOE / FRED / paper etc"
//   }
// }
//
// Se una metrica non esiste nel glossario, mostriamo un placeholder istituzionale.
//

let __TradeliaGlossary = {};

async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (res.ok) {
      __TradeliaGlossary = await res.json();
    } else {
      console.warn("Glossary fetch non OK:", res.status);
      __TradeliaGlossary = {};
    }
  } catch (err) {
    console.warn("Glossary fetch error:", err);
    __TradeliaGlossary = {};
  }

  // debug console
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

  // fallback placeholder se non definita
  return {
    label:          metricKey || "—",
    academic_def:   "Questa metrica è in fase di definizione. Sarà documentata nel Glossario Tecnico Tradelia AI v1.",
    interpretation: "Interpretazione in corso di validazione.",
    source:         "In corso di validazione."
  };
}

// markup per tooltip corpo
function buildMetricHTML(info) {
  return `
    <div class="tl-metric-block text-[13px] leading-[1.45] text-[color:var(--ink)]">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Cos’è
      </div>
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)]">
        ${escapeHtml(info.academic_def)}
      </div>
    </div>

    <div class="tl-metric-block text-[13px] leading-[1.45] text-[color:var(--ink)] mt-3">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Come leggerla
      </div>
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)]">
        ${escapeHtml(info.interpretation)}
      </div>
    </div>

    <div class="tl-metric-block text-[12px] leading-[1.4] text-[color:var(--muted)] mt-3">
      <div class="font-semibold text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-1">
        Fonti / Metodo
      </div>
      <div class="text-[12px] leading-[1.4] text-[color:var(--muted)]">
        ${escapeHtml(info.source)}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// PANEL OVERLAY (drawer Privacy / MiFID / Audit / F1 console)
// ---------------------------------------------------------------------------
//
// openPanel(opts):
//   {
//     title: "string",
//     subtitle: "string",
//     sections: [ { title, body, meta }, ... ],
//     footerButtons: [ { label, action }, ... ],
//     blocking: bool,
//     panelSize: "wide" | undefined
//   }
//

function openPanel(opts) {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],
    footerButtons = [],
    blocking = false,
    panelSize // "wide" opzionale
  } = opts || {};

  // desktop refs
  const titleDeskEl    = qs("#panel-title");
  const subDeskEl      = qs("#panel-subtitle");
  const bodyDeskEl     = qs("#panel-body");
  const footerDeskEl   = qs("#panel-footer");

  // mobile refs
  const titleMobEl     = qs("#panel-title-mobile");
  const subMobEl       = qs("#panel-subtitle-mobile");
  const bodyMobEl      = qs("#panel-body-mobile");
  const footerMobEl    = qs("#panel-footer-mobile");

  // header
  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // corpo
  let bodyHTML = "";
  if (panelSize === "wide" && sections.length === 1) {
    // caso speciale F1B / console interna: prendiamo body raw
    bodyHTML = sections[0].body || "";
  } else {
    // caso standard: blocchetti tl-panel-section
    bodyHTML = sections.map(section => {
      const st  = section.title   || "";
      const bd  = section.body    || "";
      const mta = section.meta    || "";
      return `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${st
            ? `<div class="tl-panel-section-title text-[12px] font-semibold mb-1 text-[color:var(--ink)]">${st}</div>`
            : ``
          }
          <div class="tl-panel-section-text text-[13px] leading-[1.45] text-[color:var(--ink)]">${bd}</div>
          ${
            mta
              ? `<div class="tl-panel-section-meta text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${mta}</div>`
              : ``
          }
        </section>
      `;
    }).join("");
  }

  setHTML(bodyDeskEl, bodyHTML);
  setHTML(bodyMobEl,  bodyHTML);

  // footer bottoni
  function renderFooterBtns(arr) {
    if (!arr || !arr.length) {
      return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    }
    return arr.map((btn, idx) => {
      return `<button class="btn btn-sm" data-panel-btn="${idx}">${escapeHtml(btn.label || "OK")}</button>`;
    }).join("");
  }

  setHTML(footerDeskEl, renderFooterBtns(footerButtons));
  setHTML(footerMobEl,  renderFooterBtns(footerButtons));

  // bind footer actions custom
  qsa("[data-panel-btn]", footerDeskEl).forEach(btnEl => {
    const i = btnEl.getAttribute("data-panel-btn");
    if (footerButtons[i] && typeof footerButtons[i].action === "function") {
      btnEl.addEventListener("click", footerButtons[i].action);
    }
  });
  qsa("[data-panel-btn]", footerMobEl).forEach(btnEl => {
    const i = btnEl.getAttribute("data-panel-btn");
    if (footerButtons[i] && typeof footerButtons[i].action === "function") {
      btnEl.addEventListener("click", footerButtons[i].action);
    }
  });

  // blocking (se true: niente chiusura con click backdrop)
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // panelSize wide -> classe larga sul desktop
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    if (panelSize === "wide") {
      panelDesktop.classList.add("tl-panel--wide");
    } else {
      panelDesktop.classList.remove("tl-panel--wide");
    }
  }

  // blocca scroll della pagina dietro
  document.body.classList.add("body--lock");

  // mostra overlay
  overlayEl.setAttribute("aria-hidden", "false");

  // rebind dei tooltip "?" all'interno del panel appena creato
  bindMetricInfoButtons(bodyDeskEl);
  bindMetricInfoButtons(bodyMobEl);

  // icone lucide dentro al panel (se usate nel contenuto)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  overlayEl.setAttribute("aria-hidden", "true");

  // riabilita scroll del body
  document.body.classList.remove("body--lock");

  // rimuovi wide dal pannello desktop
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove("tl-panel--wide");
  }
}

// chiusura panel su click backdrop / [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  // 1. bottoni con data-panel-close
  const closeBtn = ev.target.closest("[data-panel-close]");
  if (closeBtn) {
    closePanel();
    return;
  }

  // 2. click sul backdrop (solo se non blocking)
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});

// ---------------------------------------------------------------------------
// CONTENUTO LEGAL (Privacy / MiFID) + Audit
// ---------------------------------------------------------------------------

function openPrivacyPanel() {
  openPanel({
    title: "Privacy & Trasparenza",
    subtitle: "Nessun tracciamento di profilazione. Preferenze salvate solo in locale.",
    sections: [
      {
        title: "Come gestiamo i dati",
        body: `
          <p>
            Tradelia AI adotta una politica di massima trasparenza e
            <strong>zero tracciamento di profilazione</strong>.
          </p>
          <ul style="margin:.5rem 0 .5rem 1rem;list-style:disc;font-size:12.5px;line-height:1.45;">
            <li>Nessun cookie di profilazione o advertising.</li>
            <li>Nessuna vendita o condivisione di dati personali con terze parti.</li>
            <li>Nessun analytics esterno invasivo.</li>
            <li>Le preferenze di tema, consenso, ecc. vivono solo nel tuo browser (<code>localStorage</code>).</li>
          </ul>
        `,
        meta: `
          Riferimenti normativi: GDPR (UE 2016/679), Direttiva ePrivacy,
          Linee Guida EDPB.
        `
      }
    ],
    footerButtons: [
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    blocking: false
  });
}

function openMifidPanel() {
  openPanel({
    title: "Informativa MiFID",
    subtitle: "Contenuto a scopo informativo/formativo. Non è consulenza personalizzata.",
    sections: [
      {
        title: "Chi è Tradelia AI",
        body: `
          <p>
            Tradelia AI è una piattaforma di analisi e alfabetizzazione finanziaria.
            L'obiettivo è aiutare l'utente a comprendere contesto di mercato,
            fattori di rischio e dinamiche tecniche, in modo chiaro e tracciabile.
          </p>
          <p style="margin-top:.5rem;">
            <strong>Non siamo un consulente finanziario abilitato all’offerta di raccomandazioni personalizzate.</strong>
            Non effettuiamo gestione di portafogli, non raccogliamo ordini di negoziazione,
            non sollecitiamo l’investimento in strumenti finanziari.
          </p>
        `,
        meta: `
          Rif. Direttiva MiFID II, regolamentazione ESMA su consulenza in materia di investimenti.
        `
      },
      {
        title: "Nessuna raccomandazione operativa",
        body: `
          <p>
            Le informazioni mostrate (F1, F2, F3, F4, F5, F5B, F6) descrivono scenari di mercato,
            forze di sentiment/flusso, fattori tecnici e riferimenti storici.
            Non costituiscono indicazione ad aprire/chiudere posizioni,
            né suggeriscono una strategia adatta a te come singolo investitore.
          </p>
          <p style="margin-top:.5rem;">
            Qualsiasi riferimento a livelli tecnici, volatilità, momentum,
            liquidità o broker esistenti è da intendersi
            come <strong>osservazione di mercato</strong> e non come invito operativo.
          </p>
        `,
        meta: `
          Prima di prendere decisioni reali, verifica sempre la tua situazione
          personale (obiettivi, orizzonte temporale, propensione al rischio)
          con un intermediario autorizzato o un consulente finanziario abilitato.
        `
      },
      {
        title: "Rischio e responsabilità",
        body: `
          <p>
            I mercati finanziari comportano rischio di perdita totale o parziale del capitale.
            La volatilità, gli shock macro, le condizioni di liquidità e gli eventi esogeni
            possono generare movimenti estremi in tempi molto brevi.
          </p>
          <p style="margin-top:.5rem;">
            <strong>Nulla di quanto visualizzato garantisce risultati futuri.</strong>
            Le performance storiche o gli scenari ipotetici non sono indicativi
            di rendimenti futuri.
          </p>
          <p style="margin-top:.5rem;">
            L’utente rimane sempre l’unico responsabile delle proprie decisioni.
          </p>
        `,
        meta: `
          Usa sempre un intermediario regolamentato e verifica condizioni di costo,
          protezioni, regime fiscale e aderenza normativa del servizio che utilizzi.
        `
      }
    ],
    footerButtons: [
      {
        label: "Ho letto",
        action: () => closePanel()
      }
    ],
    blocking: true
  });
}

// Audit panel generico richiamabile da moduli
function openAuditPanel(auditData) {
  const a = auditData || {};
  const lag   = (a.feed_lag_days ?? "—");
  const conf  = (a.confidence    ?? "—");
  const integ = (a.integrity     ?? "—");
  const src   = (a.source_sync   || "—");
  const notes = (a.notes         || "");

  openPanel({
    title: "Audit dati / Fonti",
    subtitle: "Qualità campione e latenza feed",
    sections: [
      {
        title: "Origine dati",
        body: `
          <p>
            <strong>Fonte primaria:</strong> ${escapeHtml(src)}<br/>
            <strong>Lag feed (giorni):</strong> ${escapeHtml(String(lag))}<br/>
            <strong>Confidence (0-1):</strong> ${escapeHtml(String(conf))}<br/>
            <strong>Integrità dataset:</strong> ${escapeHtml(String(integ))}
          </p>
          ${notes
            ? `<p style="margin-top:.5rem;">${escapeHtml(notes)}</p>`
            : ``
          }
        `,
        meta: `
          Questo pannello ha finalità informative/formative.
          Non è una validazione regolamentare e non sostituisce
          la due diligence dell'investitore.
        `
      },
      {
        title: "Avvertenza MiFID",
        body: `
          <p>
            Prima di qualsiasi scelta reale verifica sempre adeguatezza / appropriatezza
            con un consulente autorizzato in linea con MiFID II.
          </p>
        `,
        meta: `
          Tradelia AI non fornisce consulenza personalizzata
          e non raccoglie ordini o capitali.
        `
      }
    ],
    footerButtons: [
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    blocking: false,
    panelSize: "wide"
  });
}

// ---------------------------------------------------------------------------
// METRIC TOOLTIP SYSTEM (?)
// ---------------------------------------------------------------------------
//
// index.html deve avere:
//
// Desktop popover:
// <div id="metric-popover" class="tl-popover noprint" role="tooltip" aria-hidden="true">
//   <div class="tl-popover__head">
//     <div id="metric-popover-title" class="tl-popover__title">—</div>
//     <button id="metric-popover-close" class="tl-popover__close" aria-label="Chiudi">…</button>
//   </div>
//   <div id="metric-popover-body" class="tl-popover__body">—</div>
// </div>
//
// Mobile modal:
// <div id="metric-modal" class="tl-metric-modal-overlay noprint" aria-hidden="true">
//   <div class="tl-metric-modal-backdrop" data-metric-close></div>
//   <div class="tl-metric-modal">
//     <header class="tl-metric-modal__header">
//       <div class="min-w-0">
//         <div id="metric-modal-title" class="tl-metric-modal__title">—</div>
//       </div>
//       <button class="tl-metric-modal__close" data-metric-close aria-label="Chiudi">…</button>
//     </header>
//     <div id="metric-modal-body" class="tl-metric-modal__body">—</div>
//   </div>
// </div>
//

let currentPopoverOpen = false;

function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key  = btnEl.getAttribute("data-metric");
  const info = getMetricInfo(key);

  const titleEl = qs("#metric-popover-title");
  const bodyEl  = qs("#metric-popover-body");

  setText(titleEl, info.label || key || "—");
  setHTML(bodyEl, buildMetricHTML(info));

  // posizione vicino al bottone "?"
  const rect = btnEl.getBoundingClientRect();
  pop.style.position = "fixed";
  pop.style.maxWidth = "min(320px, 90vw)";
  pop.style.left = rect.left + "px";
  pop.style.top  = (rect.bottom + 8) + "px";

  // se sfora a destra, shiftala
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

  const titleEl = qs("#metric-modal-title");
  const bodyEl  = qs("#metric-modal-body");

  setText(titleEl, info.label || key || "—");
  setHTML(bodyEl, buildMetricHTML(info));

  modal.setAttribute("aria-hidden","false");

  // blocca scroll pagina dietro
  document.body.classList.add("body--lock");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden","true");

  // riabilita scroll
  document.body.classList.remove("body--lock");
}

// bind (?)
// evita doppio bind con flag __metricBound
function bindMetricInfoButtons(rootScope) {
  const scope = rootScope || document;

  qsa(".info-btn", scope).forEach(btn => {
    if (btn.__metricBound) return;
    btn.__metricBound = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (isMobile()) {
        openMetricMobile(btn);
      } else {
        // rimpiazzo popover se già aperto
        if (currentPopoverOpen) {
          closeMetricDesktop();
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiusura popover desktop (X)
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// click fuori dal popover desktop → chiudi
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  if (pop.contains(ev.target)) return;            // clic dentro, ok
  if (ev.target.closest(".info-btn")) return;     // clic su un altro "?", gestito sopra

  closeMetricDesktop();
});

// chiusura modal mobile metrica (X o backdrop)
qsa("[data-metric-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeMetricMobile();
  });
});

// ---------------------------------------------------------------------------
// THEME SWITCH (light / dark)
// ---------------------------------------------------------------------------

function initThemeToggle() {
  const btnTheme = qs("#btn-theme");
  if (!btnTheme) return;

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("tradelia-theme", theme);
    } catch(e){}
  }

  // init tema da localStorage
  (function initFromStorage(){
    try {
      const saved = localStorage.getItem("tradelia-theme");
      if (saved === "dark" || saved === "light") {
        applyTheme(saved);
      }
    } catch(e){}
  })();

  btnTheme.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = (cur === "light" ? "dark" : "light");
    applyTheme(next);
  });
}

// ---------------------------------------------------------------------------
// PRINT
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// SHARE OVERLAY
// ---------------------------------------------------------------------------

function initShareOverlay() {
  const overlay = qs("#share-overlay");
  const btnOpen = qs("#btn-share");
  if (!overlay || !btnOpen) return;

  const closeElems = qsa("[data-share-close]", overlay);
  const copyBtns   = qsa("[data-share-svc='copy'], #share-copy-btn", overlay);

  function openShare() {
    const linkField = qs("#share-link-field");
    if (linkField) {
      linkField.textContent = window.location.href;
    }
    overlay.setAttribute("aria-hidden","false");
  }

  function closeShare() {
    overlay.setAttribute("aria-hidden","true");
  }

  btnOpen.addEventListener("click", openShare);
  closeElems.forEach(el => el.addEventListener("click", closeShare));

  // copia link
  copyBtns.forEach(el => {
    el.addEventListener("click", () => {
      const url = window.location.href;
      try {
        navigator.clipboard.writeText(url);
        // opzionale: micro feedback visivo
      } catch(e){}
    });
  });
}

// ---------------------------------------------------------------------------
// BUTTON BINDING: Privacy / MiFID
// ---------------------------------------------------------------------------

function initLegalButtons() {
  const privBtn = qs("#btn-privacy-open");
  if (privBtn) {
    privBtn.addEventListener("click", () => {
      openPrivacyPanel();
    });
  }

  const mifidBtn = qs("#btn-mifid-open");
  if (mifidBtn) {
    mifidBtn.addEventListener("click", () => {
      openMifidPanel();
    });
  }
}

// ---------------------------------------------------------------------------
// EXPORT API GLOBALE
// ---------------------------------------------------------------------------

window.__TradeliaUI = {
  openPanel,
  closePanel,
  openPrivacyPanel,
  openMifidPanel,
  openAuditPanel,
  bindMetricInfoButtons
};

// retrocompat eventuale
window.openPanel  = openPanel;
window.closePanel = closePanel;

// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------

async function bootUIRuntime() {
  // 1. carica glossary (await per evitare tooltip vuoti sul primo click subito)
  await loadGlossary();

  // 2. init sistemi globali
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();

  // 3. bind tooltip (?) per contenuto già presente
  bindMetricInfoButtons(document);

  // 4. lucide icons global
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // 5. footer year se vuoto
  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    const now = new Date();
    footerYearEl.textContent = now.getFullYear();
  }
}

// fire subito
bootUIRuntime();
