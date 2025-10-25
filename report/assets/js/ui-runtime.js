// /report/assets/js/ui-runtime.js
//
// Runtime UI globale Tradelia Premium (coerente con tokens.css premium + index.html riservato)
//
// Gestisce:
// - Drawer/panel (Privacy / MiFID / Audit / console F1B ecc.)
// - Tab strip sticky del drawer, pill di stato, sezione attiva
// - Tooltip metriche ("?") desktop/mobile con glossary.json
// - Tema light/dark
// - Stampa
// - Footer year
//
// IMPORTANTE
// ----------
// Assumiamo l'index con:
//  - #panel-overlay, .tl-panel--desktop, .tl-panel--mobile, ecc.
//  - #metric-popover / #metric-modal
//  - #btn-print, #btn-print-2
//  - #btn-theme
//  - #btn-privacy-open, #btn-mifid-open
//
// Assumiamo tokens.css premium.
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

// Escape anti-injection (inutile per testo nostro statico, ma per sicurezza su dati runtime)
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
// /report/assets/glossary.json esempio:
// {
//   "Snapshot": {
//     "label":"Snapshot",
//     "academic_def":"Indicatore sulla fase di mercato...",
//     "interpretation":"Se aumenta → risk-on...",
//     "source":"CBOE / FRED / feed proprietari"
//   }
// }
//
// Se la chiave manca usiamo fallback istituzionale.
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

  // debug dev
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

  // fallback dignitoso
  return {
    label:          metricKey || "—",
    academic_def:   "Metrica proprietaria in validazione interna. Sarà inserita nel Glossario Tecnico Tradelia AI.",
    interpretation: "Indicazione interpretativa in corso di calibrazione.",
    source:         "Fonte e metodologia in fase di audit."
  };
}

// markup corpo tooltip/overlay metrica
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
// PANEL OVERLAY / DRAWER
// ---------------------------------------------------------------------------
//
// openPanel(opts)
// opts = {
//   title: "string",
//   subtitle: "string",
//   blocking: bool,              // se true non chiudi cliccando backdrop
//   panelSize: "wide"|undefined, // se "wide" aggiunge .tl-panel--wide al desktop
//
//   mode: "simple" | "sections",
//
//   // mode:"simple"  -> sezioni stile blocchetti base (Privacy, MiFID)
//   //   simpleSections: [ { title, body, meta }, ... ]
//
//   // mode:"sections" -> stile premium con tab sticky, pill stato, ecc.
//   //   tabs: [
//   //     { id:"sec-f1b", label:"F1 Regime", badge:"OK", tone:"pos", active:true },
//   //     { id:"sec-risk", label:"Rischio", badge:"High", tone:"warn" },
//   //     ...
//   //   ]
//   //
//   //   sections: [
//   //     {
//   //       id:"sec-f1b",
//   //       active:true,
//   //       title:"Regime attuale",
//   //       pill:{ tone:"pos", label:"Stabile / OK" },
//   //       bodyHTML:"<p>...</p>",
//   //       metaHTML:"<p>Audit feed...</p>"
//   //     },
//   //     ...
//   //   ]
//   //
//   //   NOTE: tone può essere "pos" | "warn" | "neg" | "neu"
//   //
// }
//
// In entrambi i casi bindiamo metric "?" interni e lucide icons.
//

function openPanel(opts) {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    blocking = false,
    panelSize,
    mode = "simple",

    simpleSections = [],

    tabs = [],
    sections = []
  } = opts || {};

  // refs desktop
  const titleDeskEl    = qs("#panel-title");
  const subDeskEl      = qs("#panel-subtitle");
  const bodyDeskEl     = qs("#panel-body");
  const footerDeskEl   = qs("#panel-footer");

  // refs mobile
  const titleMobEl     = qs("#panel-title-mobile");
  const subMobEl       = qs("#panel-subtitle-mobile");
  const bodyMobEl      = qs("#panel-body-mobile");
  const footerMobEl    = qs("#panel-footer-mobile");

  // header text
  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // build footer (per ora: solo bottone Chiudi)
  const footerHTML = `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
  setHTML(footerDeskEl, footerHTML);
  setHTML(footerMobEl,  footerHTML);

  // panelSize wide?
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    if (panelSize === "wide") {
      panelDesktop.classList.add("tl-panel--wide");
    } else {
      panelDesktop.classList.remove("tl-panel--wide");
    }
  }

  // blocking?
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // CONTENT BUILD
  let builtHTML = "";

  if (mode === "sections") {
    // premium: tab sticky + wrapper sezioni
    builtHTML = buildPanelWithTabsHTML({ tabs, sections });
  } else {
    // fallback semplice: blocchi informativi stacked
    builtHTML = buildPanelSimpleHTML(simpleSections);
  }

  // inject contenuto
  setHTML(bodyDeskEl, builtHTML);
  setHTML(bodyMobEl,  builtHTML);

  // blocca scroll body esterno
  document.body.classList.add("body--lock");
  overlayEl.setAttribute("aria-hidden", "false");

  // attacca comportamenti interni al panel:
  bindMetricInfoButtons(bodyDeskEl);
  bindMetricInfoButtons(bodyMobEl);
  initPanelTabsNavigation(overlayEl);

  // icone lucide nel drawer (se usi <i data-lucide="..."></i>)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }
}

// genera HTML per mode:"simple"
function buildPanelSimpleHTML(simpleSections) {
  if (!simpleSections || !simpleSections.length) {
    return `
      <section class="tl-panel-section">
        <div class="tl-panel-section-title text-[12px] font-semibold mb-1 text-[color:var(--ink)]">
          Informazioni
        </div>
        <div class="tl-panel-section-text text-[13px] leading-[1.45] text-[color:var(--ink)]">
          Contenuto non disponibile.
        </div>
      </section>
    `;
  }

  return `
    <div class="tl-panel-sections-wrapper">
      ${simpleSections.map(sec => {
        const st  = sec.title   || "";
        const bd  = sec.body    || "";
        const mta = sec.meta    || "";

        return `
          <section class="tl-panel-section" style="margin-bottom:.5rem;">
            <header class="tl-panel-section-title">
              <div class="tl-panel-section-title-text">
                ${escapeHtml(st)}
              </div>
            </header>

            <div class="tl-panel-section-text">${bd}</div>

            ${mta
              ? `<div class="tl-panel-section-meta">${mta}</div>`
              : ``
            }
          </section>
        `;
      }).join("")}
    </div>
  `;
}

// genera HTML per mode:"sections" (tabs premium + sezioni con pill stato)
function buildPanelWithTabsHTML({ tabs = [], sections = [] }) {

  // nav tabs
  const tabsHTML = `
    <nav class="tl-panel-tabs" role="tablist">
      ${tabs.map(t => {
        const isAct = !!t.active;
        const tone  = t.tone || "neu";
        return `
          <button
            class="tl-panel-tab ${isAct ? "is-active" : ""}"
            role="tab"
            data-panel-tab="${escapeHtml(t.id || "")}"
            data-tone="${escapeHtml(tone)}"
            aria-selected="${isAct ? "true" : "false"}"
          >
            <span class="truncate">${escapeHtml(t.label || "")}</span>
            ${t.badge
              ? `<span class="tl-panel-tab-badge">${escapeHtml(t.badge)}</span>`
              : ``
            }
          </button>
        `;
      }).join("")}
    </nav>
  `;

  // sezioni dettagliate
  const secsHTML = `
    <div class="tl-panel-sections-wrapper">
      ${sections.map(sec => {
        const isAct   = !!sec.active;
        const tone    = sec.pill?.tone || "neu";
        const pillLbl = sec.pill?.label || "";
        const idAttr  = sec.id ? `id="${escapeHtml(sec.id)}"` : "";

        // mini icona "sketch" tono
        const iconSVG = getMiniSketchSVG(tone);

        return `
          <section
            class="tl-panel-section ${isAct ? "is-active" : ""}"
            ${idAttr}
          >
            <header class="tl-panel-section-title">
              <div class="tl-panel-section-title-text">
                ${escapeHtml(sec.title || "")}
              </div>

              ${
                pillLbl
                  ? `
                    <div class="tl-panel-section-pill">
                      <span class="pill-icon" data-tone="${escapeHtml(tone)}">
                        ${iconSVG}
                      </span>

                      <span class="tl-panel-section-pill-dot" data-tone="${escapeHtml(tone)}"></span>

                      <span>${escapeHtml(pillLbl)}</span>
                    </div>
                  `
                  : ``
              }
            </header>

            <div class="tl-panel-section-text">
              ${sec.bodyHTML || ""}
            </div>

            ${
              sec.metaHTML
                ? `<div class="tl-panel-section-meta">${sec.metaHTML}</div>`
                : ``
            }
          </section>
        `;
      }).join("")}
    </div>
  `;

  return tabsHTML + secsHTML;
}

// piccola icona tono stato (match pill-icon / regime-sketch-icon mood)
function getMiniSketchSVG(tone) {
  // niente lucide qui: disegniamo un segnale "hand-drawn" / 2-path
  // neutro = linee grigie, pos = up arrow, warn = !, neg = x
  // noi usiamo stroke="currentColor" e lasciamo che CSS colori .pill-icon[data-tone]

  if (tone === "pos") {
    // check / arrowish
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12l5 5 11-11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 12l5 5 11-11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".5" stroke-dasharray="2 2"/>
      </svg>
    `;
  }
  if (tone === "warn") {
    // !
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".7" stroke-dasharray="2 1.2 .5 1.4"/>
        <path d="M12 8v5" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 17h0" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  if (tone === "neg") {
    // X
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".7" stroke-dasharray="2 1.2 .5 1.4"/>
        <path d="M9 9l6 6M15 9l-6 6"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>
    `;
  }
  // neu
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".7" stroke-dasharray="2 1.2 .5 1.4"/>
      <path d="M9 12h6"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </svg>
  `;
}

// chiusura panel
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

// backdrop / [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  // close button
  if (ev.target.closest("[data-panel-close]")) {
    closePanel();
    return;
  }

  // backdrop click (se non blocking)
  if (ev.target.closest(".tl-panel-backdrop") && !blocking) {
    closePanel();
    return;
  }
});

// ---------------------------------------------------------------------------
// PANEL TABS BEHAVIOR
// ---------------------------------------------------------------------------
//
// - click su .tl-panel-tab => scroll alla sezione corrispondente e highlight
// - mentre scrolli nel body del panel, aggiorna is-active tab + sezione
//

function initPanelTabsNavigation(overlayEl) {
  if (!overlayEl) return;

  const desktopBody = qs("#panel-body", overlayEl);
  const mobileBody  = qs("#panel-body-mobile", overlayEl);

  [desktopBody, mobileBody].forEach(panelBody => {
    if (!panelBody) return;

    const tabBar = qs(".tl-panel-tabs", panelBody);
    if (!tabBar) return; // se è un panel "simple" non abbiamo tabs

    const tabs = qsa(".tl-panel-tab", tabBar);
    const sections = qsa(".tl-panel-section", panelBody);

    // click tab -> scrollIntoView
    tabs.forEach(tabEl => {
      if (tabEl.__tabBound) return;
      tabEl.__tabBound = true;

      tabEl.addEventListener("click", () => {
        const targetId = tabEl.getAttribute("data-panel-tab");
        if (!targetId) return;
        const tgt = qs(`#${CSS.escape(targetId)}`, panelBody);
        if (!tgt) return;

        tgt.scrollIntoView({ behavior: "smooth", block: "start" });
        // highlight immediata
        setActiveSection(panelBody, tgt.id);
      });
    });

    // scroll listener -> attiva sezione visibile
    panelBody.addEventListener("scroll", () => {
      const topY = panelBody.getBoundingClientRect().top;

      // troviamo la sezione più vicina al top del body
      let currentId = null;
      let minDist = Infinity;
      sections.forEach(sec => {
        const r = sec.getBoundingClientRect();
        const dist = Math.abs(r.top - topY - 60); // offset sticky tabs ~56px
        if (dist < minDist) {
          minDist = dist;
          currentId = sec.id || null;
        }
      });

      if (currentId) {
        setActiveSection(panelBody, currentId);
      }
    });
  });
}

// helper: aggiorna classi .is-active su sezioni e tab
function setActiveSection(panelBodyEl, activeId) {
  if (!panelBodyEl) return;

  const allSections = qsa(".tl-panel-section", panelBodyEl);
  const allTabs     = qsa(".tl-panel-tab", panelBodyEl);

  allSections.forEach(sec => {
    if (sec.id === activeId) {
      sec.classList.add("is-active");
    } else {
      sec.classList.remove("is-active");
    }
  });

  allTabs.forEach(tab => {
    const tId = tab.getAttribute("data-panel-tab");
    if (tId === activeId) {
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected","true");
    } else {
      tab.classList.remove("is-active");
      tab.setAttribute("aria-selected","false");
    }
  });
}

// ---------------------------------------------------------------------------
// CONTENUTO LEGAL STANDARD
// ---------------------------------------------------------------------------

function openPrivacyPanel() {
  openPanel({
    title: "Privacy & Trasparenza",
    subtitle: "Zero profilazione. Preferenze salvate localmente sul tuo browser.",
    blocking: false,
    panelSize: undefined,
    mode: "simple",
    simpleSections: [
      {
        title: "Come gestiamo i dati",
        body: `
          <p>
            Tradelia AI adotta una politica di massima trasparenza e
            <strong>nessuna profilazione pubblicitaria</strong>.
          </p>
          <ul style="margin:.5rem 0 .5rem 1rem;list-style:disc;font-size:12.5px;line-height:1.45;">
            <li>Nessun cookie di advertising.</li>
            <li>Nessuna vendita di dati personali a terzi.</li>
            <li>Nessun analytics invasivo esterno.</li>
            <li>Le preferenze (tema, ack normativo, ecc.) restano in <code>localStorage</code>.</li>
          </ul>
        `,
        meta: `
          Riferimenti normativi: GDPR (UE 2016/679), Direttiva ePrivacy,
          Linee Guida EDPB.
        `
      }
    ]
  });
}

function openMifidPanel() {
  openPanel({
    title: "Informativa MiFID",
    subtitle: "Contenuto esclusivamente informativo/formativo. Non è consulenza personalizzata.",
    blocking: true,
    panelSize: undefined,
    mode: "simple",
    simpleSections: [
      {
        title: "Chi è Tradelia AI",
        body: `
          <p>
            Tradelia AI è una piattaforma di analisi e alfabetizzazione finanziaria.
            Obiettivo: contestualizzare regime di mercato, sentiment, fattori tecnici,
            rischio e struttura di liquidità.
          </p>
          <p style="margin-top:.5rem;">
            <strong>Non siamo un consulente finanziario abilitato all’offerta di raccomandazioni personalizzate.</strong>
            Non raccogliamo ordini, non gestiamo capitali per conto terzi.
          </p>
        `,
        meta: `
          Rif. Direttiva MiFID II e linee guida ESMA su consulenza in materia di investimenti.
        `
      },
      {
        title: "Nessuna raccomandazione operativa",
        body: `
          <p>
            I moduli F1…F6 descrivono scenari e fattori di rischio/contesto.
            Non sono un invito ad aprire o chiudere posizioni né a utilizzare
            un intermediario specifico.
          </p>
          <p style="margin-top:.5rem;">
            Qualsiasi riferimento a livelli tecnici, momentum, volatilità
            o nomi broker è da intendersi come <strong>osservazione di mercato</strong>,
            non come istruzione operativa su misura per te.
          </p>
        `,
        meta: `
          Prima di agire, confronta sempre orizzonte temporale,
          propensione al rischio e obiettivi con un intermediario regolamentato.
        `
      },
      {
        title: "Rischio e responsabilità",
        body: `
          <p>
            I mercati finanziari comportano rischio di perdita totale o parziale
            del capitale. Shock macro, volatilità, liquidità ridotta
            possono portare a movimenti estremi.
          </p>
          <p style="margin-top:.5rem;">
            <strong>Nulla garantisce risultati futuri.</strong>
            Le performance storiche o gli scenari ipotetici non sono predittivi.
          </p>
          <p style="margin-top:.5rem;">
            L’utente resta l’unico responsabile delle proprie decisioni.
          </p>
        `,
        meta: `
          Usa sempre un intermediario autorizzato e verifica costi,
          protezioni, fiscalità e compliance MiFID.
        `
      }
    ]
  });
}

// Pannello Audit fonte dati (richiamabile da codice dati F1/F2/... tipo "Vedi audit")
function openAuditPanel(auditData) {
  const a = auditData || {};
  const lag   = (a.feed_lag_days ?? "—");
  const conf  = (a.confidence    ?? "—");
  const integ = (a.integrity     ?? "—");
  const sync  = (a.source_sync   || "—");
  const notes = (a.notes         || "");

  openPanel({
    title: "Audit dati / Fonti",
    subtitle: "Qualità campione, coerenza feed e latenza.",
    blocking: false,
    panelSize: "wide",
    mode: "simple",
    simpleSections: [
      {
        title: "Origine dati",
        body: `
          <p>
            <strong>Fonte primaria:</strong> ${escapeHtml(sync)}<br/>
            <strong>Lag feed (giorni):</strong> ${escapeHtml(String(lag))}<br/>
            <strong>Confidence (0–1):</strong> ${escapeHtml(String(conf))}<br/>
            <strong>Integrità dataset:</strong> ${escapeHtml(String(integ))}
          </p>
          ${notes
            ? `<p style="margin-top:.5rem;">${escapeHtml(notes)}</p>`
            : ``
          }
        `,
        meta: `
          Questo pannello è informativo/formativo.
          Non sostituisce la due diligence dell’investitore e non costituisce
          validazione regolamentare.
        `
      },
      {
        title: "Avvertenza MiFID",
        body: `
          <p>
            Prima di qualsiasi azione reale: verifica adeguatezza/appropriatezza
            con un consulente autorizzato (MiFID II).
          </p>
          <p style="margin-top:.5rem;">
            Tradelia AI non fornisce consulenza personalizzata,
            non raccoglie ordini e non gestisce capitali di terzi.
          </p>
        `
      }
    ]
  });
}

// ---------------------------------------------------------------------------
// METRIC TOOLTIP SYSTEM (?)
// ---------------------------------------------------------------------------

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

  // posiziona vicino al bottone
  const rect = btnEl.getBoundingClientRect();
  pop.style.position = "fixed";
  pop.style.maxWidth = "min(320px, 90vw)";
  pop.style.left = rect.left + "px";
  pop.style.top  = (rect.bottom + 8) + "px";

  // evita overflow destra
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

// bind "(?)" alle metriche
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
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiudi popover desktop (X)
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// click fuori popover desktop => chiudi
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  if (pop.contains(ev.target)) return;        // click dentro popover ok
  if (ev.target.closest(".info-btn")) return; // click su altro "?" -> gestito sopra

  closeMetricDesktop();
});

// chiusura modal metric mobile (X o backdrop)
qsa("[data-metric-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeMetricMobile();
  });
});

// ---------------------------------------------------------------------------
// THEME SWITCH (light/dark)
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

  // init da localStorage se presente
  try {
    const saved = localStorage.getItem("tradelia-theme");
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    }
  } catch(e){}

  btnTheme.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = (cur === "light" ? "dark" : "light");
    applyTheme(next);
  });
}

// ---------------------------------------------------------------------------
// PRINT BUTTONS
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
// LEGAL BUTTONS (Privacy / MiFID)
// ---------------------------------------------------------------------------

function initLegalButtons() {
  const privBtn = qs("#btn-privacy-open");
  if (privBtn && !privBtn.__legalBound) {
    privBtn.__legalBound = true;
    privBtn.addEventListener("click", () => {
      openPrivacyPanel();
    });
  }

  const mifidBtn = qs("#btn-mifid-open");
  if (mifidBtn && !mifidBtn.__legalBound) {
    mifidBtn.__legalBound = true;
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

// retrocompat se ci sono vecchie chiamate
window.openPanel  = openPanel;
window.closePanel = closePanel;

// ---------------------------------------------------------------------------
// BOOTSTRAP
// ---------------------------------------------------------------------------

async function bootUIRuntime() {
  // carica il glossario prima che clicchino sul primo "?"
  await loadGlossary();

  initThemeToggle();
  initPrintButtons();
  initLegalButtons();

  // bind tooltip (?) per il DOM già presente
  bindMetricInfoButtons(document);

  // lucide icons global (solo se presente)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // footer anno (se vuoto)
  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    footerYearEl.textContent = new Date().getFullYear();
  }
}

// kick
bootUIRuntime();
