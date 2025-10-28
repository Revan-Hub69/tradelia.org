// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello informativo (Privacy / MiFID / Drawer F1B ecc.)
// - metric help ("?" tooltip) desktop/mobile
// - tema light/dark
// - share overlay
// - stampa
//
// Questo file NON monta i moduli F1/F2/...: quello è app.js

// ------------------------------------------------------------
// Utility DOM
// ------------------------------------------------------------
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

// escape base per prevenire XSS nei testi dinamici
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

// ------------------------------------------------------------
// PANEL OVERLAY (drawer / legal / ecc.)
// ------------------------------------------------------------
//
// Struttura HTML attesa in index.html:
//
// <div id="panel-overlay" class="tl-panel-overlay noprint" aria-hidden="true">
//   <div class="tl-panel-backdrop" data-panel-close></div>
//
//   <!-- desktop -->
//   <aside class="tl-panel tl-panel--desktop" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">
//       <div class="min-w-0">
//         <h2 id="panel-title" class="tl-panel__title">—</h2>
//         <p id="panel-subtitle" class="tl-panel__subtitle">—</p>
//       </div>
//       <button class="tl-panel__close" data-panel-close aria-label="Chiudi">…</button>
//     </header>
//
//     <div id="panel-body" class="tl-panel__body"></div>
//
//     <footer class="tl-panel__footer" id="panel-footer"></footer>
//   </aside>
//
//   <!-- mobile -->
//   <aside class="tl-panel tl-panel--mobile" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">
//       <div class="min-w-0">
//         <h2 id="panel-title-mobile" class="tl-panel__title">—</h2>
//         <p id="panel-subtitle-mobile" class="tl-panel__subtitle">—</p>
//       </div>
//       <button class="tl-panel__close" data-panel-close aria-label="Chiudi">…</button>
//     </header>
//
//     <div id="panel-body-mobile" class="tl-panel__body"></div>
//
//     <footer class="tl-panel__footer" id="panel-footer-mobile"></footer>
//   </aside>
// </div>
//
// openPanel(opts):
//   {
//     title: "string",
//     subtitle: "string",
//     sections: [
//       { title:"...", body:"<p>html</p>", meta:"<small>html</small>" },
//       ...
//     ],
//     blocking: bool,          // se true non puoi chiudere toccando backdrop
//     panelSize: "wide" | "xl" | undefined,
//     footerButtons: [ { label:"Chiudi", action: fn }, ... ],
//     footerTabs:    [ { key:"...", label:"..." }, ... ] // solo mobile
//   }
//
// closePanel(): chiude overlay, riabilita scroll body

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body--lock");
}

// PATCH PRINCIPALE MOBILE
function openPanel(opts) {
  // 1. sempre resettiamo lo stato del pannello precedente
  closePanel();

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

  // refs desktop
  const titleDeskEl  = qs("#panel-title");
  const subDeskEl    = qs("#panel-subtitle");
  const bodyDeskEl   = qs("#panel-body");
  const footerDeskEl = qs("#panel-footer");

  // refs mobile
  const titleMobEl   = qs("#panel-title-mobile");
  const subMobEl     = qs("#panel-subtitle-mobile");
  const bodyMobEl    = qs("#panel-body-mobile");
  const footerMobEl  = qs("#panel-footer-mobile");

  // header
  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // corpo:
  // - caso "wide" con UNA sezione => usiamo direttamente section.body (layout libero)
  // - altrimenti generiamo blocchi tl-panel-section standard
  let bodyHTML = "";
  if (panelSize === "wide" && sections.length === 1) {
    bodyHTML = sections[0].body || "";
  } else {
    bodyHTML = sections.map(section => {
      const st  = section.title   || "";
      const bd  = section.body    || "";
      const mta = section.meta    || "";
      return `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${
            st
              ? `<div class="tl-panel-section-title">
                   <div class="tl-panel-section-title-text">${escapeHtml(st)}</div>
                 </div>`
              : ``
          }
          <div class="tl-panel-section-text">${bd}</div>
          ${
            mta
              ? `<div class="tl-panel-section-meta">${mta}</div>`
              : ``
          }
        </section>
      `;
    }).join("");
  }

  setHTML(bodyDeskEl, bodyHTML);
  setHTML(bodyMobEl,  bodyHTML);

  // ---------- FOOTER RENDERING ----------

  // helper: footer classico (desktop o fallback mobile se niente tabs)
  function renderFooterBtns(arr) {
    if (!arr || !arr.length) {
      return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    }
    return arr.map((btn, idx) => {
      return `<button class="btn btn-sm" data-panel-btn="${idx}">${escapeHtml(btn.label || "OK")}</button>`;
    }).join("");
  }

  // helper: footer mobile con tab scrollabili e bottone Chiudi sticky
  function renderFooterTabs(tabsArr) {
    if (!tabsArr || !tabsArr.length) {
      return renderFooterBtns(footerButtons);
    }

    const pills = tabsArr.map(t => {
      return `
        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="${escapeHtml(t.key)}"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          ${escapeHtml(t.label)}
        </button>
      `;
    }).join("");

    const closeBtnHTML = `
      <button
        class="f1b-footer-close-btn"
        data-panel-close
        style="
          position:sticky;
          right:0;
          flex-shrink:0;

          font-size:11.5px;
          line-height:1.2;
          font-weight:600;

          border-radius:8px;
          border:1px solid var(--ink);
          background:var(--ink);
          color:var(--surface-page);

          padding:.45rem .8rem;
          box-shadow:var(--shadow-card);
        "
      >
        Chiudi
      </button>
    `;

    return `
      <div
        class="f1b-footer-tabs-wrap"
        style="
          display:flex;
          align-items:center;

          border-top:1px solid var(--br-panel-divider);
          background:var(--surface-panel-head);
          background-image:
            radial-gradient(
              circle at 0% 0%,
              color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%,
              transparent 60%
            );

          padding:.6rem .75rem;
          box-shadow:0 -6px 12px rgba(0,0,0,.12);
          max-width:100%;
          overflow:hidden;
          gap:.5rem;
        "
      >
        <div
          class="f1b-footer-tabs-scroll"
          style="
            flex:1 1 auto;
            min-width:0;
            display:flex;
            align-items:center;
            gap:.5rem;
            overflow-x:auto;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;
          "
        >
          ${pills}
        </div>

        ${closeBtnHTML}
      </div>
    `;
  }

  const mobileFooterHTML  = renderFooterTabs(footerTabs);
  const desktopFooterHTML = renderFooterBtns(footerButtons);

  setHTML(footerMobEl,  mobileFooterHTML);
  setHTML(footerDeskEl, desktopFooterHTML);

  // bind azioni custom dei bottoni desktop
  qsa("[data-panel-btn]", footerDeskEl).forEach(btnEl => {
    const i = btnEl.getAttribute("data-panel-btn");
    if (footerButtons[i] && typeof footerButtons[i].action === "function") {
      btnEl.addEventListener("click", footerButtons[i].action);
    }
  });

  // blocking mode
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // gestisci varianti di larghezza desktop ("wide", "xl", default)
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    // pulizia classi vecchie
    panelDesktop.classList.remove("tl-panel--wide");
    panelDesktop.classList.remove("tl-panel--xl");

    if (panelSize === "wide") {
      panelDesktop.classList.add("tl-panel--wide");
    } else if (panelSize === "xl") {
      panelDesktop.classList.add("tl-panel--xl");
    }
  }

  // lock scroll pagina dietro + mostra overlay
  document.body.classList.add("body--lock");
  overlayEl.setAttribute("aria-hidden", "false");

  // bind dei nuovi "?" apparsi dentro il drawer
  bindMetricInfoButtons(overlayEl);
}

// listener globale: chiudi panel su backdrop o [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  const btnClose = ev.target.closest("[data-panel-close]");
  if (btnClose) {
    closePanel();
    return;
  }

  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});

// ------------------------------------------------------------
// PANNELLI: PRIVACY / MIFID / AUDIT
// ------------------------------------------------------------
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
            <li>Le preferenze di tema/consenso vivono solo nel tuo browser (<code>localStorage</code>).</li>
          </ul>
        `,
        meta: `
          Riferimenti normativi: GDPR (UE 2016/679), Direttiva ePrivacy,
          Linee Guida EDPB.
        `
      }
    ],
    blocking: false,
    panelSize: undefined,
    footerButtons: [
      { label: "Chiudi", action: () => closePanel() }
    ],
    footerTabs: []
  });
}

// blocking: true → l'utente deve premere "Ho letto"
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
            sentiment/flussi, fattori tecnici e riferimenti storici.
            Non costituiscono indicazione ad aprire o chiudere posizioni,
            né suggeriscono una strategia adatta a te come singolo investitore.
          </p>
          <p style="margin-top:.5rem;">
            Qualsiasi riferimento a livelli tecnici, volatilità, momentum,
            liquidità o broker esistenti è da intendersi
            come <strong>osservazione di mercato</strong>
            e non come invito operativo.
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
    blocking: true,
    panelSize: undefined,
    footerButtons: [
      { label: "Ho letto", action: () => closePanel() }
    ],
    footerTabs: []
  });
}

// pannello Audit/Qualità dati generico richiamabile dai moduli
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
          ${ notes
              ? `<p style="margin-top:.5rem;">${escapeHtml(notes)}</p>`
              : `` }
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
    blocking: false,
    panelSize: "wide",
    footerButtons: [
      { label: "Chiudi", action: () => closePanel() }
    ],
    footerTabs: []
  });
}

// ------------------------------------------------------------
// METRIC TOOLTIP SYSTEM
// ------------------------------------------------------------
//
// NUOVO FORMATO GLOSSARIO ( /report/assets/glossary.json )
//
// {
//   "Snapshot": {
//     "title":  "Snapshot",
//     "what":   "Testo 'Cosa mostra' ...",
//     "how":    "Testo 'Come si usa' ...",
//     "source": "Fonte / provenienza"
//   },
//   "Price": { ... },
//   ...
// }

let __TradeliaGlossary = {};

async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data && typeof data === "object") {
      __TradeliaGlossary = data;
    } else {
      __TradeliaGlossary = {};
    }
  } catch (err) {
    console.warn("⚠️ Impossibile caricare /report/assets/glossary.json", err);
    __TradeliaGlossary = {};
  }
}

function getGlossaryEntry(key) {
  const raw = __TradeliaGlossary[key] || {};
  return {
    title:  raw.title  || key || "—",
    what:   raw.what   || "—",
    how:    raw.how    || "—",
    source: raw.source || ""
  };
}

// stato popover desktop aperto
let currentPopoverOpen = false;

// helper: costruisce l'HTML strutturato del contenuto tooltip
function buildMetricHTML(info) {
  // blocco "Cosa mostra" + "Come si usa"
  const whatHTML = `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;color:var(--ink);margin-bottom:.25rem;">Cosa mostra</div>
      <div style="color:var(--ink);">${escapeHtml(info.what)}</div>
    </div>
  `;

  const howHTML = `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;color:var(--ink);margin-bottom:.25rem;">Come si usa</div>
      <div style="color:var(--ink);">${escapeHtml(info.how)}</div>
    </div>
  `;

  return whatHTML + howHTML;
}

// --- desktop popover ---
function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-popover-title");
  const bodyEl   = qs("#metric-popover-body");
  const sourceEl = qs("#metric-popover-source");

  // titolo
  setText(titleEl, info.title || key || "—");

  // corpo
  bodyEl.innerHTML = buildMetricHTML(info);

  // fonte
  sourceEl.innerHTML = info.source
    ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}`
    : "";

  // posizionamento
  const rect = btnEl.getBoundingClientRect();
  const OFFSET_X = 8;
  const OFFSET_Y = 4;

  let left = rect.left + window.scrollX + OFFSET_X;
  let top  = rect.bottom + window.scrollY + OFFSET_Y;

  pop.style.position = "absolute";
  pop.style.maxWidth = "320px";
  pop.style.left = left + "px";
  pop.style.top  = top  + "px";
  pop.style.right = "auto";
  pop.style.bottom = "auto";
  pop.setAttribute("aria-hidden", "false");

  // clamp a viewport
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const popRect = pop.getBoundingClientRect();

  if (popRect.right > vpW - 8) {
    const diffX = popRect.right - (vpW - 8);
    left = left - diffX;
  }
  if (left < window.scrollX + 8) {
    left = window.scrollX + 8;
  }

  if (popRect.bottom > vpH - 8) {
    top = rect.top + window.scrollY - popRect.height - OFFSET_Y;
  }
  if (top < window.scrollY + 8) {
    top = window.scrollY + 8;
  }

  pop.style.left = left + "px";
  pop.style.top  = top  + "px";

  currentPopoverOpen = true;
}

function closeMetricDesktop() {
  const pop = qs("#metric-popover");
  if (!pop) return;
  pop.setAttribute("aria-hidden", "true");
  currentPopoverOpen = false;
}

// --- mobile modal ---
function openMetricMobile(btnEl) {
  const modal = qs("#metric-modal");
  if (!modal) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-modal-title");
  const bodyEl   = qs("#metric-modal-body");
  const sourceEl = qs("#metric-modal-source");

  setText(titleEl, info.title || key || "—");

  // corpo = what + how
  bodyEl.innerHTML = buildMetricHTML(info);

  // fonte
  sourceEl.innerHTML = info.source
    ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}`
    : "";

  modal.setAttribute("aria-hidden","false");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden","true");
}

// bind dei bottoni "?" in uno scope (document, overlay ecc.)
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
        if (currentPopoverOpen) {
          closeMetricDesktop();
          currentPopoverOpen = false;
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiusura popover desktop (bottone X nel popover)
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// chiusura popover desktop clic fuori
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  if (pop.contains(ev.target)) return;
  if (ev.target.closest(".info-btn")) return;

  closeMetricDesktop();
});

// chiusura modal mobile (backdrop o [data-metric-close])
qsa("[data-metric-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeMetricMobile();
  });
});

// ------------------------------------------------------------
// THEME SWITCH (light / dark)
// ------------------------------------------------------------
function initThemeToggle() {
  const btnTheme = qs("#btn-theme");
  if (!btnTheme) return;

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("tradelia-theme", theme);
    } catch(e){}
  }

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

// ------------------------------------------------------------
// PRINT
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// SHARE OVERLAY
// ------------------------------------------------------------
//
// HTML opzionale (se esiste #share-overlay):
// <div id="share-overlay" class="share-overlay" aria-hidden="true">…</div>
// <button id="btn-share">Condividi</button>

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

  copyBtns.forEach(el => {
    el.addEventListener("click", () => {
      const url = window.location.href;
      try {
        navigator.clipboard.writeText(url);
      } catch(e){}
    });
  });
}

// ------------------------------------------------------------
// BOTTONI LEGALI (Privacy / MiFID)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// EXPORT API GLOBALE
// ------------------------------------------------------------
window.__TradeliaUI = {
  openPanel,
  closePanel,
  openPrivacyPanel,
  openMifidPanel,
  openAuditPanel,
  bindMetricInfoButtons
};

// retrocompat
window.openPanel = openPanel;
window.closePanel = closePanel;

// ------------------------------------------------------------
// BOOT
// ------------------------------------------------------------
async function bootUIRuntime() {
  // 1. Glossario prima di bindare i tooltip
  await loadGlossary();

  // 2. init UI globali
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();

  // 3. bind tooltip "?" già presenti
  bindMetricInfoButtons(document);

  // 4. icone lucide
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // 5. footer year auto se vuoto
  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    const now = new Date();
    footerYearEl.textContent = now.getFullYear();
  }
}

// run
bootUIRuntime();

// Harden export in caso qualcuno sovrascriva
if (!window.__TradeliaUI) window.__TradeliaUI = {};
window.__TradeliaUI.openPanel = openPanel;
window.__TradeliaUI.closePanel = closePanel;
window.__TradeliaUI.openPrivacyPanel = openPrivacyPanel;
window.__TradeliaUI.openMifidPanel = openMifidPanel;
window.__TradeliaUI.openAuditPanel = openAuditPanel;
window.__TradeliaUI.bindMetricInfoButtons = bindMetricInfoButtons;
