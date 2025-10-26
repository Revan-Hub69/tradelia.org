// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello informativo (Privacy / MiFID / Drawer F1B ecc.)
// - metric help ("?" tooltip) desktop/mobile
// - tema light/dark
// - share overlay
// - stampa
//
// NOVITÀ VS VERSIONE PRECEDENTE
// -----------------------------
// 1. openPanel() ora accetta opts.panelSize ("wide") per pannello largo tipo console
//    e blocca lo scroll del body quando è aperto.
// 2. closePanel() rimuove il blocco scroll.
// 3. body del panel: se panelSize === "wide" non wrappiamo il contenuto con troppi layer
//    per non rompere il layout flex del drawer desktop e la nav bottom mobile.
// 4. Tooltip unificati:
//    - tutte le .info-btn[data-metric="..."] usano binding comune
//    - DESKTOP: ora il popover viene ancorato visualmente vicino al bottone "?" cliccato
//      (prima era fisso in alto a destra)
//    - MOBILE: usiamo la modal verticale
// 5. bindMetricInfoButtons(root) è esposta globalmente in window.__TradeliaUI
//    così i moduli (tipo f1b.js) possono richiamarla dopo aver aperto il panel.
// 6. Miglior gestione blocking: se blocking===true ignora click sul backdrop.
//
// NOTE
// ----
// - Alcune classi usate qui (.body--lock, .tl-panel--wide) vanno definite a livello CSS/tokens:
//   .body--lock { overflow:hidden; }
//   .tl-panel--desktop.tl-panel--wide { width:560px; max-width:90vw; }
//   (Puoi metterle in share.css o tokens.css.)
// - Le strutture HTML base (panel-overlay, metric-popover, metric-modal, ecc.)
//   restano le stesse definite in index.html.
//
// ATTENZIONE
// ----------
// Questo file NON monta i moduli F1/F2/..., quello resta app.js
//

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
//     footerButtons: [ { label, action }, ... ],
//     blocking: bool,
//     panelSize: "wide" | undefined
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

  // corpo:
  //
  // Caso standard (legal/privacy/MiFID standalone):
  //   - mappiamo ogni section in un blocco .tl-panel-section con titolo/body/meta
  //
  // Caso "wide"/console (es. F1B drawer):
  //   - l'applicazione ci passa UNA sola sezione già strutturata internamente con layout complesso
  //   - non vogliamo ulteriori wrapper che rompano il flex (sidebar+content, bottom nav, ecc.)
  //
  let bodyHTML = "";
  if (panelSize === "wide" && sections.length === 1) {
    // prendi il body direttamente, senza wrapper aggiuntivo
    bodyHTML = sections[0].body || "";
  } else {
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

  // bind footer custom actions
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
    footerButtons: [
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    blocking: false
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
    footerButtons: [
      {
        label: "Ho letto",
        action: () => closePanel()
      }
    ],
    blocking: true,
    panelSize: undefined
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
    footerButtons: [
      {
        label: "Chiudi",
        action: () => closePanel()
      }
    ],
    blocking: false,
    panelSize: "wide" // look console se serve
  });
}

// ------------------------------------------------------------
// METRIC TOOLTIP SYSTEM
// ------------------------------------------------------------
//
// Glossario centrale delle metriche.
// Le chiavi devono combaciare con data-metric="Chiave" nei bottoni "?".
const glossary = {
  Snapshot: {
    title: "Snapshot",
    long:  "Intervallo di osservazione dei dati mostrati nel report. Tipicamente Start → End nel fuso richiesto.",
    source:"Timestamp interno di acquisizione / normalizzazione feed."
  },
  Price: {
    title: "Price",
    long:  "Ultimo prezzo disponibile al momento dello snapshot, non necessariamente la chiusura ufficiale.",
    source:"Feed di mercato · fonte esterna tier-1."
  },
  ChangePct: {
    title: "Δ%",
    long:  "Rendimento relativo rispetto allo snapshot di partenza. Positivo = rialzo, negativo = ribasso.",
    source:"Calcolo interno sul differenziale di prezzo."
  },
  Currency: {
    title: "Currency",
    long:  "Valuta base in cui è espresso il prezzo. Serve per confronti cross-market.",
    source:"Mercato di negoziazione indicato."
  },
  Freshness: {
    title: "Freshness",
    long:  "Quanto è recente il dato rispetto ad ora. 'T-0' = dato odierno. Valori più alti = feed più aggiornato.",
    source:"Timestamp interno + lag feed."
  },
  ConfidenceFinal: {
    title: "Confidence",
    long:  "Stima interna della robustezza del campione e dell'allineamento tra più fonti (0-1). Non è una garanzia.",
    source:"Heuristics interne."
  },
  StrategyMode: {
    title: "StrategyMode",
    long:  "Classificazione del regime corrente di mercato basata su flussi settoriali, ampiezza del rialzo e volatilità implicita.",
    source:"Elaborazione interna da fonti ETFdb / CBOE / Reuters."
  },
  RegimeScore: {
    title: "RegimeScore",
    long:  "Indice sintetico risk-on vs risk-off. Valori più alti indicano maggiore appetito per il rischio.",
    source:"Flows settoriali + volatilità implicita."
  },
  Breadth: {
    title: "Breadth (1M)",
    long:  "Percentuale dei principali settori azionari positivi negli ultimi 30 giorni. Alta = rialzo ampio.",
    source:"Performance settoriale rolling 1M."
  },
  RiskTilt: {
    title: "RiskTilt",
    long:  "Forza relativa dei settori ciclici/growth rispetto ai difensivi. >0 = mercato orientato al rischio.",
    source:"ETF settoriali (ciclici vs difensivi)."
  },
  VIX: {
    title: "VIX",
    long:  "Volatilità implicita sull’S&P500 (~30 giorni). Alto = mercato prezza stress, Basso = mercato prezza stabilità.",
    source:"CBOE."
  }
};

// Stato corrente popover desktop (per gestione toggle/close)
let currentPopoverOpen = false;

// Desktop: pop vicino al bottone cliccato
function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key = btnEl.getAttribute("data-metric");
  const info = glossary[key] || {
    title: key || "—",
    long:  "—",
    source:""
  };

  const titleEl  = qs("#metric-popover-title");
  const bodyEl   = qs("#metric-popover-body");
  const sourceEl = qs("#metric-popover-source");

  setText(titleEl, info.title || key || "—");
  setText(bodyEl,  info.long  || "—");
  setText(sourceEl, info.source || "");

  // calcoliamo posizione dell'icona "?"
  const rect = btnEl.getBoundingClientRect();

  // offset per non coprire il bottone
  const OFFSET_X = 8;
  const OFFSET_Y = 4;

  const left = rect.left + window.scrollX + OFFSET_X;
  const top  = rect.bottom + window.scrollY + OFFSET_Y;

  // posizioniamo il popover accanto al bottone
  pop.style.position = "absolute";
  pop.style.left = left + "px";
  pop.style.top  = top  + "px";
  pop.style.right = "auto";

  pop.setAttribute("aria-hidden", "false");
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
  const info = glossary[key] || {
    title: key || "—",
    long:  "—",
    source:""
  };

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
  if (ev.target.closest(".info-btn")) return;     // clic su altro ? → gestito sopra

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
function bootUIRuntime() {
  initThemeToggle();
  initPrintButtons();
  initShareOverlay();
  initLegalButtons();

  // bind tooltip sui contenuti già presenti in pagina (hero, card, ecc.)
  bindMetricInfoButtons(document);

  // lucide icons render (se presente)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // init footer year se non già settato da app.js
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
