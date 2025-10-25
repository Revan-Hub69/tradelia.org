// /report/assets/js/app.js
//
// Ruolo: orchestratore dati runtime del Report
// - legge header.json e manifest.json dal report corrente
// - popola hero e footer base
// - monta le sezioni F1...F6 caricando i moduli dinamici
//
// Dipendenze richieste già caricate in index.html PRIMA di questo file:
//   - /report/assets/js/ui-runtime.js  (per __TradeliaUI.bindMetricInfoButtons)
//
// Convenzioni path dati:
//   /report/reports/{reportId}/header.json
//   /report/reports/{reportId}/manifest.json
//   poi i singoli moduli es. f1b.json, f2.json, ...
//
// Convenzioni renderer modulo:
//   /report/assets/js/modules/f1b.js (o f2.js, ...)
//   export function renderCard(data, ctx) -> string HTML
//   export function bindCard(node, data, ctx) -> opzionale, per listener ecc.

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

// piccolo helper per color bar "tonebar" nel hero in stile premium
// invece di scrivere inline style.backgroundColor, usiamo data-tone
// e poi nel CSS (se vuoi) puoi fare:
//   .tonebar[data-tone="pos"]  { background:var(--tone-g); }
//   .tonebar[data-tone="neg"]  { background:var(--tone-r); }
//   ecc.
function setTone(el, tone) {
  if (!el) return;
  if (!tone) {
    el.removeAttribute("data-tone");
  } else {
    el.setAttribute("data-tone", tone);
  }
}

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

  // Confidence -> g / n / r
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

    // hook interazione modulo
    if (typeof mod.bindCard === "function") {
      try {
        mod.bindCard(container, data, { modId, reportId });
      } catch (bindErr) {
        console.warn("bindCard error per", modId, bindErr);
      }
    }

    // Tooltip "?" sulle metriche interne
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
  getReportIdFromURL
};
