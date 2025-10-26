// /report/assets/js/app.js
//
// Ruolo: orchestratore dati runtime del Report
// - legge header.json e manifest.json dal report corrente
// - popola hero e footer base
// - monta le sezioni F1...F6 caricando i moduli dinamici
// - collega le sezioni al drawer premium (panel overlay)
//
// Dipendenze richieste già caricate in index.html PRIMA di questo file:
//   - /report/assets/js/ui-runtime.js  (per __TradeliaUI.bindMetricInfoButtons)
//
// Convenzioni path dati:
//   /report/reports/{reportId}/header.json
//   /report/reports/{reportId}/manifest.json
//   poi i singoli moduli es. f1b.json, f2.json, ...
//
// Convenzioni renderer modulo (modules/f1b.js, ecc):
//   export function renderCard(data, ctx) -> string HTML (il blocco nella pagina principale)
//   export function bindCard(node, data, ctx) -> opzionale, per listener ecc.
//
//   [opzionale premium drawer]
//   export function buildPanelData(data, ctx) -> {
//       title: string,
//       subtitle: string,
//       tabs: Array<{ id:string, label:string, tone?:'pos'|'warn'|'neg'|'neu', badge?:string }>,
//       sectionsByTab: {
//          [tabId]: Array<{
//              title:string,
//              tone?:'pos'|'warn'|'neg'|'neu',
//              pillLabel?:string,
//              pillTone?:'pos'|'warn'|'neg'|'neu'|'neu',
//              bodyHtml:string,
//              metaHtml?:string
//          }>
//       }
//   }
//
// Se buildPanelData non esiste, usiamo un fallback generico.
//

// ------------------------------------------------------------
// Helpers base
// ------------------------------------------------------------
function getReportIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return (id && id.trim() !== "") ? id.trim() : "sample-id";
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status + " @ " + url);
    return await res.json();
  } catch (err) {
    console.warn("fetchJSON fail", url, err);
    return null;
  }
}

// format numeri
function fmtNum(v, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  return n
    .toFixed(decimals)
    .replace('.', ',');
}

function fmtPct(v, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  const sign = n > 0 ? "+" : "";
  return (
    sign +
    n.toFixed(decimals).replace('.', ',') +
    "%"
  );
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// premium tone: usiamo data-tone, CSS fa il resto
function setTone(el, tone) {
  if (!el) return;
  if (!tone) {
    el.removeAttribute("data-tone");
  } else {
    el.setAttribute("data-tone", tone);
  }
}

// ------------------------------------------------------------
// PANEL CONTROLLER (drawer premium)
// ------------------------------------------------------------

// DOM refs del panel (desktop/mobile sono due copie dello stesso contenuto logico)
const panelOverlayEl         = document.getElementById("panel-overlay");
const panelBackdropEl        = document.querySelector(".tl-panel-backdrop");

const panelDesktopEl         = document.querySelector(".tl-panel--desktop");
const panelMobileEl          = document.querySelector(".tl-panel--mobile");

const panelCloseBtns         = document.querySelectorAll("[data-panel-close]");

const panelTitleDesktopEl    = document.getElementById("panel-title");
const panelSubtitleDesktopEl = document.getElementById("panel-subtitle");
const panelTabsDesktopEl     = document.getElementById("panel-tabs-desktop");
const panelBodyDesktopEl     = document.getElementById("panel-body");

const panelTitleMobileEl     = document.getElementById("panel-title-mobile");
const panelSubtitleMobileEl  = document.getElementById("panel-subtitle-mobile");
const panelTabsMobileEl      = document.getElementById("panel-tabs-mobile");
const panelBodyMobileEl      = document.getElementById("panel-body-mobile");

// helper: costruisce HTML di una tab
function renderTabButton(tab) {
  // tab: {id,label,tone?,badge?}
  const toneAttr = tab.tone ? ` data-tone="${tab.tone}"` : "";
  const badge = tab.badge
    ? `<span class="tl-panel-tab-badge">${tab.badge}</span>`
    : "";
  return `
    <button
      class="tl-panel-tab"
      data-panel-tab="${tab.id}"
      ${toneAttr}
      type="button"
    >
      <span class="tl-panel-tab-label">${tab.label}</span>
      ${badge}
    </button>
  `;
}

// helper: costruisce HTML delle sezioni dentro il tab
function renderTabSections(sectionsArr) {
  // each section: {title, tone?, pillLabel?, pillTone?, bodyHtml, metaHtml?}
  const blocks = (sectionsArr || []).map(sec => {
    const pillToneAttr = sec.pillTone ? ` data-tone="${sec.pillTone}"` : ` data-tone="neu"`;
    const pillHtml = sec.pillLabel
      ? `
        <span class="tl-panel-section-pill"${pillToneAttr}>
          <span class="pill-icon" data-tone="${sec.pillTone || 'neu'}">
            <!-- icona mini può essere iniettata dal modulo oppure fallback -->
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </span>
          <span class="tl-panel-section-pill-dot" data-tone="${sec.pillTone || 'neu'}"></span>
          <span>${sec.pillLabel}</span>
        </span>
      `
      : "";

    return `
      <section class="tl-panel-section" data-panel-section="${sec.title}">
        <header class="tl-panel-section-title">
          <div class="tl-panel-section-title-text">${sec.title}</div>
          ${pillHtml}
        </header>
        <div class="tl-panel-section-text">
          ${sec.bodyHtml || ""}
        </div>
        ${
          sec.metaHtml
            ? `<div class="tl-panel-section-meta">${sec.metaHtml}</div>`
            : ""
        }
      </section>
    `;
  });

  return `
    <div class="tl-panel-sections-wrapper">
      ${blocks.join("")}
    </div>
  `;
}

// costruisce un oggetto dati di fallback per il panel se il modulo non fornisce buildPanelData
function buildPanelDataFallback(modId, data) {
  return {
    title: `${modId} · Dettaglio`,
    subtitle: "Analisi approfondita del modulo",
    tabs: [
      {
        id: "overview",
        label: "Overview",
        tone: "neu",
        badge: "BASE"
      }
    ],
    sectionsByTab: {
      "overview": [
        {
          title: "Contenuto",
          pillLabel: "INFO",
          pillTone: "neu",
          bodyHtml: `<pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;">${escapeHtml(
            JSON.stringify(data, null, 2)
          )}</pre>`
        }
      ]
    }
  };
}

// basic escaper per fallback pre
function escapeHtml(str) {
  return (str || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

// riempie il panel DOM con i dati preparati
function fillPanelContent(panelData) {
  if (!panelData) return;

  const {
    title,
    subtitle,
    tabs,
    sectionsByTab
  } = panelData;

  // header copy
  if (panelTitleDesktopEl)    panelTitleDesktopEl.textContent    = title || "—";
  if (panelSubtitleDesktopEl) panelSubtitleDesktopEl.textContent = subtitle || "—";
  if (panelTitleMobileEl)     panelTitleMobileEl.textContent     = title || "—";
  if (panelSubtitleMobileEl)  panelSubtitleMobileEl.textContent  = subtitle || "—";

  // tabs
  const tabsHTML = (tabs || []).map(renderTabButton).join("");
  if (panelTabsDesktopEl) panelTabsDesktopEl.innerHTML = tabsHTML;
  if (panelTabsMobileEl)  panelTabsMobileEl.innerHTML  = tabsHTML;

  // body: di default montiamo il primo tab
  const firstTabId = tabs && tabs.length ? tabs[0].id : null;
  mountTabContent(firstTabId, {tabs, sectionsByTab});

  // bind click sulle tab per cambiare sezione
  bindTabSwitching({tabs, sectionsByTab});
}

// attiva visivamente una tab e mostra le sue sezioni
function mountTabContent(tabId, ctx) {
  if (!tabId) {
    if (panelBodyDesktopEl) panelBodyDesktopEl.innerHTML = "";
    if (panelBodyMobileEl)  panelBodyMobileEl.innerHTML  = "";
    return;
  }

  const { sectionsByTab } = ctx;
  const sects = sectionsByTab[tabId] || [];
  const html = renderTabSections(sects);

  if (panelBodyDesktopEl) panelBodyDesktopEl.innerHTML = html;
  if (panelBodyMobileEl)  panelBodyMobileEl.innerHTML  = html;

  // highlight tab attiva
  const allTabs = document.querySelectorAll('.tl-panel-tab');
  allTabs.forEach(btn => {
    const thisId = btn.getAttribute('data-panel-tab');
    if (thisId === tabId) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  // se la tab attiva ha un data-tone, lo vogliamo mantenere sulla .is-active
  // (CSS gestisce il colore in base al data-tone)
  const activeTab = document.querySelector(`.tl-panel-tab[data-panel-tab="${tabId}"]`);
  if (activeTab) {
    const tone = activeTab.getAttribute("data-tone") || "neu";
    activeTab.classList.add("is-active");
    activeTab.setAttribute("data-tone", tone);
  }

  // NB: se nelle sezioni ci sono bottoni "?" metriche interne,
  // rilanciamo i binder tooltips
  if (
    window.__TradeliaUI &&
    typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
  ) {
    try {
      // usa body desktop che ha appena ricevuto html
      window.__TradeliaUI.bindMetricInfoButtons(panelBodyDesktopEl || document);
    } catch (e) {
      console.warn("bindMetricInfoButtons (panel body) error:", e);
    }
  }
}

// click sui tab
function bindTabSwitching(ctx) {
  const tabButtons = document.querySelectorAll('.tl-panel-tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-panel-tab');
      mountTabContent(tabId, ctx);
    });
  });
}

// open / close overlay
function openPanel(panelData) {
  fillPanelContent(panelData);

  // lock scroll sotto
  document.body.classList.add("body--lock");

  // mostra overlay
  if (panelOverlayEl) {
    panelOverlayEl.setAttribute("aria-hidden", "false");
    panelOverlayEl.dataset.blocking = "true";
  }
}

function closePanel() {
  // nascondi overlay
  if (panelOverlayEl) {
    panelOverlayEl.setAttribute("aria-hidden", "true");
    panelOverlayEl.dataset.blocking = "false";
  }

  // sblocca scroll
  document.body.classList.remove("body--lock");

  // pulizia base body per evitare vecchi contenuti lampeggiando al prossimo open
  if (panelBodyDesktopEl) panelBodyDesktopEl.innerHTML = "";
  if (panelBodyMobileEl)  panelBodyMobileEl.innerHTML  = "";
  if (panelTabsDesktopEl) panelTabsDesktopEl.innerHTML = "";
  if (panelTabsMobileEl)  panelTabsMobileEl.innerHTML  = "";
  if (panelTitleDesktopEl)    panelTitleDesktopEl.textContent    = "—";
  if (panelSubtitleDesktopEl) panelSubtitleDesktopEl.textContent = "—";
  if (panelTitleMobileEl)     panelTitleMobileEl.textContent     = "—";
  if (panelSubtitleMobileEl)  panelSubtitleMobileEl.textContent  = "—";
}

// chiusura overlay su X, su backdrop ecc.
if (panelBackdropEl) {
  panelBackdropEl.addEventListener("click", closePanel);
}
panelCloseBtns.forEach(btn=>{
  btn.addEventListener("click", closePanel);
});

// Esponiamo controller globale (debug / eventuale richiamo dai moduli)
const PanelController = {
  openPanel,
  closePanel
};
window.TradeliaPanel = PanelController;


// ------------------------------------------------------------
// HERO + footer snapshot
// ------------------------------------------------------------
function mountHero(headerData) {
  if (!headerData) return;

  const {
    Start,
    End,
    Ticker,
    Venue,
    Price,
    ChangePct,
    Currency,
    FreshnessLabel,
    ConfidenceFinal,
    State,
    Version,
    UpdatedAt
  } = headerData;

  // ticker / venue
  setTextById("hero-ticker", Ticker || "—");
  setTextById("hero-venue", Venue || "—");

  // price + change
  const chgPctStr = fmtPct(ChangePct, 2);
  setTextById("hero-price", Price !== undefined ? fmtNum(Price, 2) : "—");
  setTextById("hero-change", chgPctStr);

  // badge stato
  setTextById("hero-state", State || "—");

  // snapshot intervallo
  setTextById("hero-start", Start || "—");
  setTextById("hero-end", End || "—");

  // meta price
  setTextById("hero-price2", Price !== undefined ? fmtNum(Price, 2) : "—");

  // meta Δ%
  setTextById("hero-change2", chgPctStr);

  // meta currency
  setTextById("hero-ccy", Currency || "—");

  // meta freshness
  setTextById("hero-freshness", FreshnessLabel || "—");

  // meta confidence
  setTextById(
    "hero-confidence",
    ConfidenceFinal !== undefined ? fmtNum(ConfidenceFinal, 2) : "—"
  );

  // colorazione up/down sul testo Δ%
  const heroChangeEl  = document.getElementById("hero-change");
  const heroChangeEl2 = document.getElementById("hero-change2");

  if (heroChangeEl) {
    heroChangeEl.classList.remove("chg--up","chg--down");
    if (typeof ChangePct === "number") {
      heroChangeEl.classList.add(ChangePct >= 0 ? "chg--up" : "chg--down");
    }
  }
  if (heroChangeEl2) {
    heroChangeEl2.classList.remove("chg--up","chg--down");
    if (typeof ChangePct === "number") {
      heroChangeEl2.classList.add(ChangePct >= 0 ? "chg--up" : "chg--down");
    }
  }

  // tonebars nel hero
  const toneSnap  = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneChg   = document.getElementById("tone-chg");
  const toneCcy   = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");
  const toneConf  = document.getElementById("tone-conf");

  // default neutro
  setTone(toneSnap,  "neu");
  setTone(tonePrice, "neu");
  setTone(toneCcy,   "neu");
  setTone(toneFresh, "neu");

  // Δ% -> verde/rosso
  if (typeof ChangePct === "number") {
    setTone(toneChg, ChangePct >= 0 ? "pos" : "neg");
  } else {
    setTone(toneChg, "neu");
  }

  // Confidence -> pos / neu / neg
  const cf = Number(ConfidenceFinal);
  if (!isNaN(cf)) {
    if (cf >= 0.75) {
      setTone(toneConf, "pos");
    } else if (cf < 0.5) {
      setTone(toneConf, "neg");
    } else {
      setTone(toneConf, "neu");
    }
  } else {
    setTone(toneConf, "neu");
  }

  // footer info
  if (Version) {
    setTextById("footer-version", Version);
  }

  setTextById(
    "footer-snapshot",
    (Start && End) ? (Start + " → " + End) : (Start || End || "—")
  );

  const upd = UpdatedAt || End || Start || "—";
  setTextById("footer-updated", upd);

  // anno footer se non già messo da ui-runtime
  const yearEl = document.getElementById("footer-year");
  if (yearEl && !yearEl.textContent.trim()) {
    const now = new Date();
    yearEl.textContent = now.getFullYear();
  }
}

// ------------------------------------------------------------
// MANIFEST LOADING / NORMALIZATION
// ------------------------------------------------------------
async function loadManifest(reportId) {
  const url = `/report/reports/${reportId}/manifest.json`;
  const mf = await fetchJSON(url);
  if (mf) return mf;

  // fallback se non esiste manifest.json
  return {
    id: reportId,
    title: "Tradelia · Report Runtime",
    order: ["F1B","F2","F3","F4","F5","F5B","F6"],
    modules: {
      "F1B": "f1b.json",
      "F2":  "f2.json",
      "F3":  "f3.json",
      "F4":  "f4.json",
      "F5":  "f5.json",
      "F5B": "f5b.json",
      "F6":  "f6.json"
    }
  };
}

// mappa modulo -> section DOM id
function getSectionSelectorForModule(modId) {
  const upper = modId.toUpperCase();

  if (upper === "F1A" || upper === "F1B") return "#sec-f1";
  if (upper === "F2")  return "#sec-f2";
  if (upper === "F3")  return "#sec-f3";
  if (upper === "F4")  return "#sec-f4";
  if (upper === "F5")  return "#sec-f5";
  if (upper === "F5B") return "#sec-f5b";
  if (upper === "F6")  return "#sec-f6";

  return null;
}

// normalizza i path json modulo rispetto al reportId
function normalizeManifest(manifest, reportId) {
  const order = Array.isArray(manifest.order)
    ? manifest.order.slice()
    : Object.keys(manifest.modules || {});

  const outMods = {};
  for (const key of Object.keys(manifest.modules || {})) {
    let path = manifest.modules[key];
    if (
      typeof path === "string" &&
      !path.startsWith("http") &&
      !path.startsWith("/")
    ) {
      // path relativo -> sotto /report/reports/{id}/
      path = `/report/reports/${reportId}/${path}`;
    }
    outMods[key] = path;
  }

  return {
    id: manifest.id || reportId,
    title: manifest.title || "",
    order,
    modules: outMods
  };
}

// ------------------------------------------------------------
// COLLEGA LA CARD DEL MODULO AL PANEL PREMIUM
// ------------------------------------------------------------
function attachOpenPanelHandler(container, data, ctx, mod) {
  // container è <article id="sec-fX" ...>
  if (!container) return;

  // di default apriamo panel cliccando tutto il blocco
  container.addEventListener("click", () => {
    // 1. chiediamo al modulo i dati per il panel
    let panelData;
    if (mod && typeof mod.buildPanelData === "function") {
      try {
        panelData = mod.buildPanelData(data, ctx);
      } catch (err) {
        console.warn("buildPanelData error", ctx.modId, err);
      }
    }

    if (!panelData) {
      panelData = buildPanelDataFallback(ctx.modId, data);
    }

    // 2. apriamo overlay con quei dati
    PanelController.openPanel(panelData);
  }, { once:false }); // vogliamo che funzioni a ogni click
}

// ------------------------------------------------------------
// MOUNT DI UN SINGOLO MODULO (F1B/F2/...)
// ------------------------------------------------------------
async function mountSingleModule(modId, jsonUrl, reportId) {
  const selector = getSectionSelectorForModule(modId);
  if (!selector) {
    console.warn(`Nessun section selector per ${modId}`);
    return;
  }

  const container = document.querySelector(selector);
  if (!container) {
    console.warn(`Container DOM ${selector} non trovato per ${modId}`);
    return;
  }

  // carica i dati del modulo (es. /report/reports/{id}/f1b.json)
  const data = await fetchJSON(jsonUrl);

  // importa dinamicamente il renderer JS del modulo
  const fileBase = modId.toLowerCase();
  let mod;
  try {
    // cache-busting minimo
    mod = await import(`/report/assets/js/modules/${fileBase}.js?v=2`);
  } catch (err) {
    console.error("Import modulo fallita:", modId, err);
    container.innerHTML = `
      <div class="section-headline">
        <div class="section-head-left">
          <div class="section-head-topline">
            <span class="section-badge">${modId}</span>
            <span class="module-status-pill" data-state="error">DATA</span>
          </div>
          <div class="section-title-main">${modId}</div>
          <div class="section-desc">
            Modulo non disponibile o renderer mancante.
          </div>
        </div>
      </div>
      <div class="tl-panel-section-text text-[13px] leading-[1.45] text-[color:var(--muted)]">
        Impossibile caricare <code>${fileBase}.js</code>.
      </div>
    `;
    container.classList.remove("is-loading");
    return;
  }

  // render effettivo
  if (typeof mod.renderCard === "function") {
    const html = mod.renderCard(data, { modId, reportId });
    container.innerHTML = html;
    container.classList.remove("is-loading");

    // hook interazione modulo custom
    if (typeof mod.bindCard === "function") {
      try {
        mod.bindCard(container, data, { modId, reportId });
      } catch (bindErr) {
        console.warn("bindCard error per", modId, bindErr);
      }
    }

    // collega apertura panel premium
    attachOpenPanelHandler(container, data, { modId, reportId }, mod);

    // Tooltip "?" sulle metriche interne (MAIN PAGE)
    if (
      window.__TradeliaUI &&
      typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
    ) {
      try {
        window.__TradeliaUI.bindMetricInfoButtons(container);
      } catch (e) {
        console.warn("bindMetricInfoButtons error:", e);
      }
    }

  } else {
    // modulo importato ma senza renderCard
    container.innerHTML = `
      <div class="section-headline">
        <div class="section-head-left">
          <div class="section-head-topline">
            <span class="section-badge">${modId}</span>
            <span class="module-status-pill" data-state="error">VIEW</span>
          </div>
          <div class="section-title-main">${modId}</div>
          <div class="section-desc">
            Modulo caricato ma nessun renderer disponibile.
          </div>
        </div>
      </div>
      <div class="tl-panel-section-text text-[13px] leading-[1.45] text-[color:var(--muted)]">
        Definisci <code>renderCard()</code> in /report/assets/js/modules/${fileBase}.js
        per renderizzare questo blocco.
      </div>
    `;
    container.classList.remove("is-loading");

    // anche qui comunque aggancio apertura panel fallback
    attachOpenPanelHandler(container, data, { modId, reportId }, mod);
  }
}

// ------------------------------------------------------------
// FLUSSO PRINCIPALE
// ------------------------------------------------------------
async function mountReport() {
  const reportId = getReportIdFromURL();

  // 1. header -> hero
  const headerData = await fetchJSON(`/report/reports/${reportId}/header.json`);
  if (headerData) {
    mountHero(headerData);
  } else {
    console.warn("Header mancante per", reportId);
  }

  // 2. manifest -> ordine moduli + path json
  const rawManifest = await loadManifest(reportId);
  const manifest = normalizeManifest(rawManifest, reportId);

  // 3. montaggio moduli in parallelo
  const promises = manifest.order.map(modId => {
    const jsonUrl = manifest.modules[modId];
    if (!jsonUrl) {
      console.warn(`Nessun jsonUrl per ${modId}`);
      return Promise.resolve();
    }
    return mountSingleModule(modId, jsonUrl, reportId);
  });

  await Promise.all(promises);
}

// kick immediato
mountReport();

// debug globale
window.TradeliaApp = {
  mountReport,
  getReportIdFromURL,
  PanelController // esponiamo così eventualmente i moduli possono aprire/chiudere panel da soli
};
