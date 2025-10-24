// /report/assets/js/app.js

// ------------------------------------------------------------
// Helpers base
// ------------------------------------------------------------

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

// formattazioni base numeriche (hero ecc.)
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

function setHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value;
}

// ------------------------------------------------------------
// HERO MOUNT
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
    State
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
  setText("hero-price2", Price !== undefined ? fmtNum(Price, 2) : "—");

  // meta Δ%
  setText("hero-change2", chgPctStr);

  // meta currency
  setText("hero-ccy", Currency || "—");

  // meta freshness
  setText("hero-freshness", FreshnessLabel || "—");

  // meta confidence
  setText("hero-confidence", ConfidenceFinal !== undefined ? fmtNum(ConfidenceFinal,2) : "—");

  // footer snapshot / updated
  setText("footer-snapshot", Start || "—");
  // "Ultimo aggiornamento": se abbiamo End mettiamo End, sennò Start
  setText("footer-updated", End || Start || "—");

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

  // tonebars di base nel hero
  // snapshot tone
  const toneSnap = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneChg = document.getElementById("tone-chg");
  const toneCcy = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");
  const toneConf = document.getElementById("tone-conf");

  // logica semplice:
  // ChangePct >=0 -> verde, <0 -> rosso
  if (toneChg) {
    toneChg.style.backgroundColor =
      typeof ChangePct === "number"
        ? (ChangePct >= 0 ? "var(--tone-g)" : "var(--tone-r)")
        : "var(--tone-n)";
  }

  // ConfidenceFinal >=0.75 -> verde, <0.5 -> rosso, altrimenti neutro
  if (toneConf) {
    const cf = Number(ConfidenceFinal);
    toneConf.style.backgroundColor =
      !isNaN(cf)
        ? (cf >= 0.75
            ? "var(--tone-g)"
            : (cf < 0.5 ? "var(--tone-r)" : "var(--tone-n)"))
        : "var(--tone-n)";
  }

  // gli altri li mettiamo neutri o brand
  if (toneSnap)  toneSnap.style.backgroundColor  = "var(--tone-n)";
  if (tonePrice) tonePrice.style.backgroundColor = "var(--tone-n)";
  if (toneCcy)   toneCcy.style.backgroundColor   = "var(--tone-n)";
  if (toneFresh) toneFresh.style.backgroundColor = "var(--tone-n)";
}

// ------------------------------------------------------------
// MANIFEST LOADING / NORMALIZATION
// ------------------------------------------------------------

async function loadManifest(reportId) {
  // prova a leggere manifest.json dal report
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

function normalizeManifest(manifest, reportId) {
  // costruiamo lista finale dei moduli in ordine
  const order = Array.isArray(manifest.order)
    ? manifest.order.slice()
    : Object.keys(manifest.modules || {});

  // normalizziamo i path json per modulo
  const outMods = {};
  for (const key of Object.keys(manifest.modules || {})) {
    let path = manifest.modules[key];
    // se è un path relativo tipo "f1b.json", prepend della cartella report
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

// ------------------------------------------------------------
// MODULE MOUNT
// ------------------------------------------------------------

async function mountModule(modId, jsonUrl, reportId) {
  // 1. trova container DOM
  const targetMap = (window.Tradelia && window.Tradelia.mountTarget) || {};
  const selector = targetMap[modId];
  if (!selector) {
    console.warn(`Nessun mountTarget per ${modId}`);
    return;
  }
  const container = document.querySelector(selector);
  if (!container) {
    console.warn(`Container ${selector} non trovato per ${modId}`);
    return;
  }

  // 2. fetch dei dati del modulo (es. /report/reports/sample-id/f1b.json)
  const data = await fetchJSON(jsonUrl);

  // 3. importa dinamicamente il renderer JS del modulo
  //    convenzione: modId in minuscolo = nome file
  //    F1B -> f1b.js, F5B -> f5b.js, ecc.
  const moduleFile = modId.toLowerCase();
  let mod;
  try {
    mod = await import(`/report/assets/js/modules/${moduleFile}.js`);
  } catch (err) {
    console.error("Import modulo fallita:", modId, err);
    container.innerHTML = `
      <div class="text-[13px] text-[color:var(--ink)]">
        <div class="text-[14px] font-extrabold leading-[1.4] mb-2">
          ${modId}
        </div>
        <p class="text-[12.5px] text-[color:var(--muted)] leading-[1.4]">
          Modulo non disponibile.
        </p>
      </div>
    `;
    container.classList.remove("is-loading");
    return;
  }

  // 4. render
  if (typeof mod.renderCard === "function") {
    const html = mod.renderCard(data, { modId, reportId });
    container.innerHTML = html;
    container.classList.remove("is-loading");

    // 5. bind interazioni (drawer audit ecc.)
    if (typeof mod.bindCard === "function") {
      try {
        mod.bindCard(container, data, { modId, reportId });
      } catch (bindErr) {
        console.warn("bindCard error per", modId, bindErr);
      }
    }
  } else {
    // modulo importato ma senza renderCard
    container.innerHTML = `
      <div class="text-[13px] text-[color:var(--ink)]">
        <div class="text-[14px] font-extrabold leading-[1.4] mb-2">${modId}</div>
        <p class="text-[12.5px] text-[color:var(--muted)] leading-[1.4]">
          Modulo caricato ma nessun renderer disponibile.
        </p>
      </div>
    `;
    container.classList.remove("is-loading");
  }
}

// ------------------------------------------------------------
// MAIN ORCHESTRATION
// ------------------------------------------------------------

async function mountReport() {
  const reportId = getReportIdFromURL();

  // 1. header
  const headerData = await fetchJSON(`/report/reports/${reportId}/header.json`);
  if (headerData) {
    mountHero(headerData);
  } else {
    console.warn("Header mancante per", reportId);
  }

  // 2. manifest
  const rawManifest = await loadManifest(reportId);
  const manifest = normalizeManifest(rawManifest, reportId);

  // 3. moduli
  for (const modId of manifest.order) {
    const jsonUrl = manifest.modules[modId];
    if (!jsonUrl) {
      console.warn(`Nessun jsonUrl per ${modId}`);
      continue;
    }
    mountModule(modId, jsonUrl, reportId);
  }
}

// kick
mountReport();
