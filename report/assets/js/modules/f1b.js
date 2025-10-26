// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello informativo (Privacy / MiFID / Drawer F1B ecc.)
// - metric help ("?" tooltip) desktop/mobile
// - tema light/dark
// - share overlay
// - stampa
//
// Questo file NON monta i moduli F1/F2/..., quello resta app.js

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

// escaper per evitare XSS quando riempiamo dinamico
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
// PANEL OVERLAY (drawer / legal / etc.)
// ------------------------------------------------------------
//
// Struttura HTML in index:
// <div id="panel-overlay" class="tl-panel-overlay" aria-hidden="true" data-blocking="false">
//   <div class="tl-panel-backdrop" data-panel-close></div>
//
//   <aside class="tl-panel tl-panel--desktop" ...>
//     <header>...</header>
//     <div id="panel-body" class="tl-panel__body"></div>
//     <footer id="panel-footer" class="tl-panel__footer"></footer>
//   </aside>
//
//   <aside class="tl-panel tl-panel--mobile" ...>
//     <header>...</header>
//     <div id="panel-body-mobile" class="tl-panel__body"></div>
//     <footer id="panel-footer-mobile" class="tl-panel__footer"></footer>
//   </aside>
// </div>
//
// openPanel(opts):
//   {
//     title: "string",
//     subtitle: "string",
//     sections: [ { title, body, meta }, ... ],
//     blocking: bool,
//     panelSize: "wide" | undefined,
//     footerButtons: [ { label, action }, ... ],   // usato per DESKTOP
//     footerTabs:    [ { key,label }, ... ]        // usato per MOBILE
//   }
//
// closePanel(): chiude overlay, riabilita scroll.

function openPanel(opts) {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],
    blocking = false,
    panelSize, // "wide" opzionale
    footerButtons = [], // desktop
    footerTabs = []     // mobile tabbar scrollabile
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

  // corpo:
  //
  // Caso standard (legal/privacy/MiFID standalone):
  //   - mappiamo ogni section in un blocco .tl-panel-section con titolo/body/meta
  //
  // Caso "wide"/console (es. F1B drawer):
  //   - l'app ci passa UNA sola sezione già strutturata (html intero con sidebar/tab ecc.)
  //   - non vogliamo wrapper extra che rompano layout
  //
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

  // helper: footer mobile con tab scrollabili e pulsante Chiudi sticky
  // footerTabs è [{key:"regime", label:"Regime"}, ...]
  function renderFooterTabs(tabsArr) {
    // se non esistono tab → ricadiamo sul footer classico
    if (!tabsArr || !tabsArr.length) {
      return renderFooterBtns(footerButtons);
    }

    // pill per ognuna
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

    // bottone Chiudi sticky a destra
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

    // wrapper scrollabile orizzontale + sticky Chiudi
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

  // scegli markup da mettere in ciascun footer
  // MOBILE: usa footerTabs se presenti, altrimenti footerButtons
  // DESKTOP: sempre e solo footerButtons
  const mobileFooterHTML  = renderFooterTabs(footerTabs);
  const desktopFooterHTML = renderFooterBtns(footerButtons);

  setHTML(footerMobEl,  mobileFooterHTML);
  setHTML(footerDeskEl, desktopFooterHTML);

  // bind azioni custom dei bottoni desktop footerButtons
  qsa("[data-panel-btn]", footerDeskEl).forEach(btnEl => {
    const i = btnEl.getAttribute("data-panel-btn");
    if (footerButtons[i] && typeof footerButtons[i].action === "function") {
      btnEl.addEventListener("click", footerButtons[i].action);
    }
  });

  // blocking (true = niente close su backdrop)
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // panelSize wide -> aggiungi classe di larghezza sulla versione desktop
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    if (panelSize === "wide") {
      panelDesktop.classList.add("tl-panel--wide");
    } else {
      panelDesktop.classList.remove("tl-panel--wide");
    }
  }

  // impedisci scroll del body dietro al panel
  document.body.classList.add("body--lock");

  // mostra overlay
  overlayEl.setAttribute("aria-hidden", "false");
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  overlayEl.setAttribute("aria-hidden", "true");

  // riattiva scroll della pagina sotto
  document.body.classList.remove("body--lock");
}

// click global per chiudere pannello
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  // chiudi se clicco qualcosa con data-panel-close
  const closeBtn = ev.target.closest("[data-panel-close]");
  if (closeBtn) {
    closePanel();
    return;
  }

  // se backdrop click e non blocking -> close
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});

// ------------------------------------------------------------
// CONTENUTO: PRIVACY PANEL
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
            <li>Le preferenze di tema, consenso, ecc. vivono solo nel tuo browser (<code>localStorage</code>).</li>
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
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    footerTabs: [] // niente tab nel footer mobile per Privacy
  });
}

// ------------------------------------------------------------
// CONTENUTO: MiFID PANEL
// ------------------------------------------------------------
//
// blocking: true → niente tap fuori per chiudere, devi esplicitamente tappare "Ho letto"
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
    blocking: true,
    panelSize: undefined,
    footerButtons: [
      {
        label: "Ho letto",
        action: () => closePanel()
      }
    ],
    footerTabs: [] // niente tab mobile qui
  });
}

// ------------------------------------------------------------
// AUDIT PANEL utility (richiamabile dai moduli F* se serve)
// ------------------------------------------------------------
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
          ${
            notes
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
    blocking: false,
    panelSize: "wide", // look console se serve
    footerButtons: [
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    footerTabs: [] // niente tab mobile qui
  });
}

// ------------------------------------------------------------
// METRIC TOOLTIP SYSTEM (usa glossary.json esterno)
// ------------------------------------------------------------
//
// Il glossario delle metriche NON è più hardcoded qui.
// Viene caricato da /report/assets/glossary.json.
//
// Formato atteso del JSON:
// {
//   "MetricKey": {
//     "title": "Titolo breve",
//     "long": "Spiegazione lunga da mostrare nel popup",
//     "source": "Fonte / origine del dato"
//   },
//   ...
// }

let __TradeliaGlossary = {}; // popolato da loadGlossary()

async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (json && typeof json === "object") {
      __TradeliaGlossary = json;
    } else {
      __TradeliaGlossary = {};
    }
  } catch (e) {
    console.warn("⚠️ Glossary non caricato /report/assets/glossary.json", e);
    __TradeliaGlossary = {};
  }
}

function getGlossaryEntry(key) {
  return __TradeliaGlossary[key] || {
    title: key || "—",
    long:  "—",
    source:""
  };
}

// Stato corrente popover desktop (per gestione toggle/close)
let currentPopoverOpen = false;

// Desktop: pop vicino al bottone cliccato, MA clampato al viewport
function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-popover-title");
  const bodyEl   = qs("#metric-popover-body");
  const sourceEl = qs("#metric-popover-source");

  setText(titleEl, info.title || key || "—");
  setText(bodyEl,  info.long  || "—");
  setText(sourceEl, info.source || "");

  const rect = btnEl.getBoundingClientRect();

  const OFFSET_X = 8;
  const OFFSET_Y = 4;

  let left = rect.left + window.scrollX + OFFSET_X;
  let top  = rect.bottom + window.scrollY + OFFSET_Y;

  // posizione preliminare
  pop.style.position = "absolute";
  pop.style.maxWidth = "320px";
  pop.style.left = left + "px";
  pop.style.top  = top  + "px";
  pop.style.right = "auto";
  pop.style.bottom = "auto";
  pop.setAttribute("aria-hidden", "false");

  // calcolo bounding e clamp
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const popRect = pop.getBoundingClientRect();

  // se esce a destra -> shift a sinistra
  if (popRect.right > vpW - 8) {
    const diffX = popRect.right - (vpW - 8);
    left = left - diffX;
  }
  // se va fuori a sinistra -> clamp 8px
  if (left < window.scrollX + 8) {
    left = window.scrollX + 8;
  }

  // se esce in basso -> apri sopra
  if (popRect.bottom > vpH - 8) {
    top = rect.top + window.scrollY - popRect.height - OFFSET_Y;
  }
  // se va troppo su -> clamp 8px dall'alto viewport
  if (top < window.scrollY + 8) {
    top = window.scrollY + 8;
  }

  // applica correzioni
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

// Mobile: modal centrale/bottom
function openMetricMobile(btnEl) {
  const modal = qs("#metric-modal");
  if (!modal) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-modal-title");
  const bodyEl   = qs("#metric-modal-body");
  const sourceEl = qs("#metric-modal-source");

  setText(titleEl, info.title || key || "—");
  setText(sourceEl, info.source || "");
  bodyEl.innerHTML = escapeHtml(info.long || "—");

  modal.setAttribute("aria-hidden","false");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden","true");
}

// bindMetricInfoButtons(root) -> aggancia i click sui bottoni "?"
// può essere chiamata su un subtree specifico (es. panel appena aperto)
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
        // toggle semplice: chiudo se aperto, poi riapro sul nuovo click
        if (currentPopoverOpen) {
          closeMetricDesktop();
          currentPopoverOpen = false;
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiusura popover desktop (icona X)
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// click fuori: chiudi popover desktop
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  if (pop.contains(ev.target)) return;            // clic dentro → niente
  if (ev.target.closest(".info-btn")) return;     // clic su altro ? → lo gestiamo lì

  closeMetricDesktop();
});

// chiusura mobile modal (X o backdrop)
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

  // init from localStorage
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
      } catch(e){}
    });
  });
}

// ------------------------------------------------------------
// BUTTON BINDING: Privacy / MiFID
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
//
// I moduli (es. F1B) useranno queste funzioni:
// - openPanel / closePanel
// - openPrivacyPanel / openMifidPanel / openAuditPanel
// - bindMetricInfoButtons
//
// compat legacy: esponiamo anche su window.openPanel / window.closePanel

window.__TradeliaUI = {
  openPanel,
  closePanel,
  openPrivacyPanel,
  openMifidPanel,
  openAuditPanel,
  bindMetricInfoButtons
};

// compat legacy
window.openPanel = openPanel;
window.closePanel = closePanel;

// ------------------------------------------------------------
// BOOT
// ------------------------------------------------------------
async function bootUIRuntime() {
  // 1. carica glossary.json prima di bindare i tooltip
  await loadGlossary();

  // 2. init vari sistemi UI
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();

  // 3. bind tooltip sui contenuti già presenti in pagina (hero, card, ecc.)
  bindMetricInfoButtons(document);

  // 4. lucide icons render (se presente)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // 5. init footer year se non già settato da app.js
  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    const now = new Date();
    footerYearEl.textContent = now.getFullYear();
  }
}

// esegui subito
bootUIRuntime();

// ridichiariamo nel caso qualcuno sovrascriva window.__TradeliaUI dopo
if (!window.__TradeliaUI) window.__TradeliaUI = {};
window.__TradeliaUI.openPanel = openPanel;
window.__TradeliaUI.closePanel = closePanel;
window.__TradeliaUI.openPrivacyPanel = openPrivacyPanel;
window.__TradeliaUI.openMifidPanel = openMifidPanel;
window.__TradeliaUI.bindMetricInfoButtons = bindMetricInfoButtons;
