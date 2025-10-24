// /report/assets/js/app.js
//
// Orchestratore del Report Runtime (hero + sezioni F1..F6)
//
// Assunzioni:
//  - index.html ha gli id:
//      hero-* (per l'intestazione)
//      sec-f1, sec-f2, sec-f3, sec-f4, sec-f5, sec-f5b, sec-f6 (contenitori moduli)
//      footer-version, footer-snapshot, footer-updated, footer-year
//  - report data sono in /report/reports/{reportId}/header.json, {f1b.json,...}, manifest.json
//  - window.__TradeliaUI (da ui-runtime.js) esiste per attachAuditData
//
// Nota: questo file NON gestisce MiFID, tooltip, ecc. Quello è ui-runtime.js

//--------------------------------------------------
// Helpers
//--------------------------------------------------

function getReportIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id || "sample-id";
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

function fmtNum(v, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  return n.toFixed(decimals).replace('.', ',');
}

function fmtPct(v, decimals = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(decimals).replace('.', ',') + "%";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setYearNow() {
  const yEl = document.getElementById("footer-year");
  if (yEl) {
    const now = new Date();
    yEl.textContent = now.getFullYear();
  }
}

//--------------------------------------------------
// HERO
//--------------------------------------------------

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
  setText("hero-ticker", Ticker || "—");
  setText("hero-venue", Venue || "—");

  // price + change
  const chgPctStr = fmtPct(ChangePct, 2);
  setText("hero-price", Price !== undefined ? fmtNum(Price, 2) : "—");
  setText("hero-change", chgPctStr);

  // badge stato
  setText("hero-state", State || "—");

  // meta snapshot
  setText("hero-start", Start || "—");
  setText("hero-end", End || "—");

  // meta price
  const hp2 = document.getElementById("hero-price2");
  if (hp2) hp2.textContent = Price !== undefined ? fmtNum(Price, 2) : "—";

  // meta Δ%
  setText("hero-change2", chgPctStr);

  // meta currency
  setText("hero-ccy", Currency || "—");

  // meta freshness
  setText("hero-freshness", FreshnessLabel || "—");

  // meta confidence
  const confStr = ConfidenceFinal !== undefined ? fmtNum(ConfidenceFinal, 2) : "—";
  setText("hero-confidence", confStr);

  // footer snapshot / updated
  setText("footer-snapshot", Start && End ? `${Start} → ${End}` : (Start || "—"));
  setText("footer-updated", UpdatedAt || End || Start || "—");
  setText("footer-version", Version || "v1.0");

  // footer year
  setYearNow();

  // colore up/down per change
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

  // tonebars semplici
  const toneChg   = document.getElementById("tone-chg");
  const toneConf  = document.getElementById("tone-conf");
  const toneSnap  = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneCcy   = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");

  if (toneChg) {
    if (typeof ChangePct === "number") {
      toneChg.style.backgroundColor = ChangePct >= 0 ? "var(--tone-g)" : "var(--tone-r)";
    } else {
      toneChg.style.backgroundColor = "var(--tone-n)";
    }
  }
  if (toneConf) {
    const cf = Number(ConfidenceFinal);
    if (!isNaN(cf)) {
      toneConf.style.backgroundColor = (
        cf >= 0.75 ? "var(--tone-g)" :
        cf < 0.5   ? "var(--tone-r)" :
                     "var(--tone-n)"
      );
    } else {
      toneConf.style.backgroundColor = "var(--tone-n)";
    }
  }
  if (toneSnap)  toneSnap.style.backgroundColor  = "var(--tone-n)";
  if (tonePrice) tonePrice.style.backgroundColor = "var(--tone-n)";
  if (toneCcy)   toneCcy.style.backgroundColor   = "var(--tone-n)";
  if (toneFresh) toneFresh.style.backgroundColor = "var(--tone-n)";
}

//--------------------------------------------------
// MANIFEST
//--------------------------------------------------

async function loadManifest(reportId) {
  const url = `/report/reports/${reportId}/manifest.json`;
  const mf = await fetchJSON(url);
  if (mf) return mf;

  // fallback se manifest.json non esiste
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

// normalizza percorsi moduli
function normalizeManifest(manifest, reportId) {
  const order = Array.isArray(manifest.order)
    ? manifest.order.slice()
    : Object.keys(manifest.modules || {});
  const outMods = {};
  for (const key of Object.keys(manifest.modules || {})) {
    let path = manifest.modules[key];
    if (typeof path === "string" && !path.startsWith("http") && !path.startsWith("/")) {
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

//--------------------------------------------------
// MOUNT MODULI
//--------------------------------------------------

function getSectionSelectorForModule(modId) {
  // mappa modulo -> sezione nel nuovo layout verticale
  // Nota:
  //  - F1A e F1B montano SEMPRE su #sec-f1 (solo uno dei due verrà fornito in manifest)
  //  - F5B monta su #sec-f5b
  //  - F6 monta su #sec-f6
  const lower = modId.toLowerCase(); // "f1a", "f2", ...
  if (lower === "f1a" || lower === "f1b") return "#sec-f1";
  if (lower === "f2")  return "#sec-f2";
  if (lower === "f3")  return "#sec-f3";
  if (lower === "f4")  return "#sec-f4";
  if (lower === "f5")  return "#sec-f5";
  if (lower === "f5b") return "#sec-f5b";
  if (lower === "f6")  return "#sec-f6";
  // fallback (non dovrebbe servire ma evitiamo crash)
  return "#sec-f6";
}

async function mountSingleModule(modId, jsonUrl, reportId) {
  // target dom (nuovo layout verticale)
  const selector = getSectionSelectorForModule(modId);
  const container = document.querySelector(selector);
  if (!container) {
    console.warn(`Container ${selector} non trovato per ${modId}`);
    return;
  }

  // dati modulo (es. f1b.json)
  const data = await fetchJSON(jsonUrl);

  // import del renderer dinamico
  // convenzione: F1B -> /report/assets/js/modules/f1b.js
  const moduleFile = modId.toLowerCase();
  let renderer;
  try {
    renderer = await import(`/report/assets/js/modules/${moduleFile}.js`);
  } catch (err) {
    console.error("Import modulo fallita:", modId, err);
    container.innerHTML = `
      <div class="text-body-sm">
        <div class="font-extrabold text-[14px] leading-[1.4] mb-2">${modId}</div>
        <p class="text-body-xs text-[color:var(--muted)]">
          Modulo non disponibile.
        </p>
      </div>`;
    container.classList.remove("is-loading");
    return;
  }

  // renderCard => HTML della sezione finita (titolo F1/F2..., metriche principali, tasto Audit ...)
  if (typeof renderer.renderCard === "function") {
    const html = renderer.renderCard(data, { modId, reportId });
    container.innerHTML = html;
    container.classList.remove("is-loading");

    // bindCard => attacca eventi extra (es Audit / Fonti -> openAuditPanel)
    if (typeof renderer.bindCard === "function") {
      try {
        renderer.bindCard(container, data, { modId, reportId });
      } catch (bindErr) {
        console.warn("bindCard error per", modId, bindErr);
      }
    }
  } else {
    // modulo importato ma senza renderCard
    container.innerHTML = `
      <div class="text-body-sm">
        <div class="font-extrabold text-[14px] leading-[1.4] mb-2">${modId}</div>
        <p class="text-body-xs text-[color:var(--muted)]">
          Modulo caricato ma nessun renderer disponibile.
        </p>
      </div>`;
    container.classList.remove("is-loading");
  }
}

//--------------------------------------------------
// MAIN BOOT
//--------------------------------------------------

async function mountReport() {
  const reportId = getReportIdFromURL();

  // 1. header (hero + footer info)
  const headerData = await fetchJSON(`/report/reports/${reportId}/header.json`);
  if (headerData) {
    // salviamo in window.Tradelia (es. per glossary, timestamp, ecc.)
    window.Tradelia = window.Tradelia || {};
    window.Tradelia.headerData = headerData;
    mountHero(headerData);
  } else {
    console.warn("Header mancante per", reportId);
    setYearNow();
  }

  // 2. manifest
  const rawManifest = await loadManifest(reportId);
  const manifest = normalizeManifest(rawManifest, reportId);

  // 3. loop moduli
  for (const modId of manifest.order) {
    const jsonUrl = manifest.modules[modId];
    if (!jsonUrl) {
      console.warn(`Nessun jsonUrl per ${modId}`);
      continue;
    }
    mountSingleModule(modId, jsonUrl, reportId);
  }

  // 4. lucide icons (fallback, se serve)
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try { window.lucide.createIcons(); } catch(e){ console.warn("lucide error:",e); }
  }
}

// kick immediato
mountReport();
