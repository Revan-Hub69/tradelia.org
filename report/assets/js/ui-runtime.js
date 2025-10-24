// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello MiFID / Privacy / Audit (desktop side panel + mobile bottom sheet)
// - metric help (tooltip "?" desktop popover + mobile modal centrale)
// - tema light/dark
// - share overlay
// - stampa
//
// ATTENZIONE: questo file non monta i moduli F1/F2/... (quello è app.js)
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

// ------------------------------------------------------------
// PANEL OVERLAY (MiFID, Privacy, Audit/Fonti, ecc.)
// ------------------------------------------------------------
//
// Struttura HTML prevista in index:
// <div id="panel-overlay" class="tl-panel-overlay" aria-hidden="true">
//   backdrop ...
//   <aside class="tl-panel tl-panel--desktop">...</aside>
//   <aside class="tl-panel tl-panel--mobile">...</aside>
// </div>
//
// Ogni aside ha:
//   #panel-title / #panel-subtitle / #panel-body / #panel-footer
//   #panel-title-mobile / #panel-subtitle-mobile / #panel-body-mobile / #panel-footer-mobile
//
// openPanel(opts) => apre e popola
// closePanel()    => chiude
//

function openPanel(opts) {
  // opts:
  // {
  //   title: "string",
  //   subtitle: "string",
  //   sections: [ { title, body, meta }, ... ],
  //   footerButtons: [ { label, action }, ... ],
  //   blocking: false|true  (se true, niente chiudi "soft")
  // }

  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],
    footerButtons = [],
    blocking = false
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

  // header text
  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // corpo: costruiamo le sezioni
  const bodyHTML = sections.map(section => {
    const st  = section.title   || "";
    const bd  = section.body    || "";
    const mta = section.meta    || "";
    return `
      <section class="tl-panel-section">
        ${st
          ? `<div class="tl-panel-section-title">${st}</div>`
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

  setHTML(bodyDeskEl, bodyHTML);
  setHTML(bodyMobEl,  bodyHTML);

  // footer: bottoni custom (es. "Accetto", "Chiudi")
  function renderFooterBtns(arr) {
    if (!arr || !arr.length) {
      return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    }
    return arr.map((btn, idx) => {
      return `<button class="btn btn-sm" data-panel-btn="${idx}">${btn.label || "OK"}</button>`;
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

  // se blocking === true togliamo i [data-panel-close] "soft"
  // => cioè non vogliamo che chiuda toccando sfondo accidentalmente
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // blocca scroll sotto al pannello
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  // mostra overlay
  overlayEl.setAttribute("aria-hidden", "false");
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  // ripristina scroll
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";

  overlayEl.setAttribute("aria-hidden", "true");
}

// click global per chiudere pannello
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  // chiudi se clicchi su qualcosa con data-panel-close
  const closeBtn = ev.target.closest("[data-panel-close]");
  if (closeBtn) {
    closePanel();
    return;
  }

  // se clicchi su backdrop e NON è blocking
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
    blocking: true // eviti tap fuori per chiudere
  });
}

// ------------------------------------------------------------
// AUDIT PANEL (per i moduli tipo F1B -> "Audit / Fonti")
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
    blocking: false
  });
}

// escapeHtml di supporto (serve sia per audit che per metriche, evitiamo XSS)
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
// METRIC TOOLTIP: "?" bottoncini delle metriche
// ------------------------------------------------------------
//
// Desktop:
//   - mostriamo #metric-popover ancorato al bottone cliccato
//
// Mobile (<768px):
//   - mostriamo #metric-modal come modale centrale scrollabile
//
// Richiede nel DOM:
//   #metric-popover  (con metric-popover-title/body/source)
//   #metric-modal    (con metric-modal-title/body/source)
//

const glossary = {
  Snapshot: {
    title: "Snapshot",
    short: "Intervallo temporale coperto dal report.",
    long:  "Intervallo di osservazione dei dati che stai leggendo. Tipicamente Start → End nel fuso di riferimento richiesto.",
    source:"Timestamp interno di acquisizione."
  },
  Price: {
    title: "Price",
    short: "Ultimo prezzo rilevato sul mercato indicato.",
    long:  "Prezzo ultimo disponibile al momento dello snapshot, non necessariamente prezzo ufficiale di chiusura.",
    source:"Feed di mercato · fonte esterna tier-1."
  },
  ChangePct: {
    title: "Δ%",
    short: "Variazione percentuale sul periodo di riferimento.",
    long:  "Rendimento relativo rispetto allo snapshot di partenza. Positivo = rialzo, negativo = ribasso.",
    source:"Calcolo interno sul differenziale di prezzo."
  },
  Currency: {
    title: "Currency",
    short: "Valuta di quotazione utilizzata nei dati di prezzo.",
    long:  "Valuta base in cui è espresso il prezzo/valore mostrato. Importante per confronti cross-market.",
    source:"Mercato di negoziazione indicato nel report."
  },
  Freshness: {
    title: "Freshness",
    short: "Quanto è recente il dato rispetto ad ora.",
    long:  "Indicatore di latenza del feed e di quanto i numeri sono attuali. 'T-0' = dati del giorno corrente.",
    source:"Timestamp interno + lag feed."
  },
  ConfidenceFinal: {
    title: "Confidence",
    short: "Confidenza interna sulla qualità del dato.",
    long:  "Stima (0-1) della robustezza del campione e dell'allineamento tra più fonti. Non è garanzia di accuratezza.",
    source:"Heuristics interne di coerenza / OCR / integrità dataset."
  }
};

// stato runtime per popover (desktop)
let currentPopoverBtn = null;

function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key = btnEl.getAttribute("data-metric");
  const info = glossary[key] || {
    title: key || "—",
    short: "—",
    long:  "—",
    source:""
  };

  const titleEl  = qs("#metric-popover-title");
  const bodyEl   = qs("#metric-popover-body");
  const sourceEl = qs("#metric-popover-source");

  setText(titleEl, info.title || key || "—");
  setText(bodyEl,  info.long || info.short || "—");
  setText(sourceEl, info.source || "");

  // posizione accanto al bottone
  const rect = btnEl.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  const popW = 320;
  const margin = 8;

  let left = rect.left + scrollX;
  let top  = rect.bottom + scrollY + margin;

  const maxLeft = scrollX + window.innerWidth - popW - 8;
  if (left > maxLeft) left = maxLeft;

  pop.style.position = "absolute";
  pop.style.left = left + "px";
  pop.style.top  = top + "px";

  pop.setAttribute("aria-hidden", "false");
  currentPopoverBtn = btnEl;
}

function closeMetricDesktop() {
  const pop = qs("#metric-popover");
  if (!pop) return;
  pop.setAttribute("aria-hidden", "true");
  currentPopoverBtn = null;
}

function openMetricMobile(btnEl) {
  const modal = qs("#metric-modal");
  if (!modal) return;

  const key = btnEl.getAttribute("data-metric");
  const info = glossary[key] || {
    title: key || "—",
    short: "—",
    long:  "—",
    source:""
  };

  const titleEl  = qs("#metric-modal-title");
  const bodyEl   = qs("#metric-modal-body");
  const sourceEl = qs("#metric-modal-source");

  setText(titleEl, info.title || key || "—");
  setText(sourceEl, info.source || "");
  bodyEl.innerHTML = escapeHtml(info.long || info.short || "—");

  modal.setAttribute("aria-hidden","false");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden","true");
}

// bind globale click per info-btn
function bindMetricInfoButtons() {
  // click sui bottoni "?"
  qsa(".info-btn").forEach(btn => {
    // evitiamo di bindare due volte lo stesso bottone
    if (btn.__tlBound) return;
    btn.__tlBound = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isMobile()) {
        openMetricMobile(btn);
      } else {
        // toggle popover se riclick sullo stesso
        if (currentPopoverBtn === btn) {
          closeMetricDesktop();
        } else {
          openMetricDesktop(btn);
        }
      }
    });
  });

  // chiusura popover desktop (icona X)
  const popClose = qs("#metric-popover-close");
  if (popClose && !popClose.__tlBound) {
    popClose.__tlBound = true;
    popClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMetricDesktop();
    });
  }

  // chiusura tapping fuori popover desktop
  if (!document.__tlGlobalMetricOutsideClick) {
    document.__tlGlobalMetricOutsideClick = true;
    document.addEventListener("click", (ev) => {
      const pop = qs("#metric-popover");
      if (!pop) return;
      if (pop.getAttribute("aria-hidden") === "true") return;

      if (pop.contains(ev.target)) return;
      if (ev.target.closest(".info-btn")) return;

      closeMetricDesktop();
    });
  }

  // chiusura mobile modal (X o backdrop)
  qsa("[data-metric-close]").forEach(btn => {
    if (btn.__tlBound) return;
    btn.__tlBound = true;
    btn.addEventListener("click", () => {
      closeMetricMobile();
    });
  });
}

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
      // TODO: eventuale feedback utente
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
// ESPORTIAMO API PER I MODULI
// ------------------------------------------------------------
//
// I moduli possono fare:
// window.__TradeliaUI.openPanel({ ... })
// window.__TradeliaUI.openAuditPanel(data)
// window.__TradeliaUI.bindMetricInfoButtons()
//

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
  bindMetricInfoButtons();

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

// run subito
bootUIRuntime();
