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
  const toneSnap  = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneChg   = document.getElementById("tone-chg");
  const toneCcy   = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");
  const toneConf  = document.getElementById("tone-conf");

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

  // gli altri li mettiamo neutri
  if (toneSnap)  toneSnap.style.backgroundColor  = "var(--tone-n)";
  if (tonePrice) tonePrice.style.backgroundColor = "var(--tone-n)";
  if (toneCcy)   toneCcy.style.backgroundColor   = "var(--tone-n)";
  if (toneFresh) toneFresh.style.backgroundColor = "var(--tone-n)";
}

// ------------------------------------------------------------
// PLACEHOLDER MODULES
// ------------------------------------------------------------
//
// Quando un modulo (F2, F3, F4, F5, F5B, F6...) non è ancora implementato
// o non ha dati, invece di lasciare "CARICAMENTO..." brutto
// mostriamo una card pulita e consistente.
//
// L'idea è dare contesto ("cos'è questo modulo") e far capire che è in sviluppo.
// ------------------------------------------------------------

function renderModulePlaceholder(modId) {
  // Contenuti descrittivi personalizzati per ciascun modulo.
  // Qui ci mettiamo dei testi MiFID-safe e informativi.
  let title   = modId;
  let desc    = "Modulo in sviluppo.";
  let pill    = "in sviluppo";
  let pillClr = "var(--muted)"; // testo scuro su bg soft

  switch (modId) {
    case "F2":
      title = "F2 · Sentiment / Flussi";
      desc  = "Mostrerà sentiment aggregato e flussi sul ticker / settore per validare o contraddire il regime di mercato.";
      break;
    case "F3":
      title = "F3 · Multi-TF Tecnico";
      desc  = "Mostrerà la lettura tecnica su più timeframe (es. daily / weekly) senza raccomandazioni operative.";
      break;
    case "F4":
      title = "F4 · Intermarket";
      desc  = "Metterà in relazione equity, bond, FX e commodity per capire dove si sta spostando il rischio.";
      break;
    case "F5":
      title = "F5 · Resoconto Tecnico";
      desc  = "Riassumerà i punti tecnici chiave e le aree di attenzione, con linguaggio descrittivo MiFID-friendly.";
      break;
    case "F5B":
      title = "F5B · Validazione LT";
      desc  = "Valuterà se il quadro attuale è sostenibile nel medio-lungo periodo o se è solo tattico/temporaneo.";
      break;
    case "F6":
      title = "F6 · Broker Regolamentati";
      desc  = "Panoramica di intermediari autorizzati e requisiti di adeguatezza/appropriatezza. Nessuna promozione commerciale.";
      break;
    default:
      // fallback generico
      title = modId + " · In sviluppo";
      desc  = "Questo modulo non è ancora disponibile in questa build.";
      break;
  }

  // struttura visiva:
  // - titolo bold + pill
  // - testo descrizione
  // - bottone disabled "Anteprima"
  //
  // card look coerente con le altre (border, radius, shadow)
  // ma height contenuta (non pare un buco vuoto gigante)
  return `
    <div
      class="flex flex-col justify-between h-full text-[13px] leading-[1.45] text-[color:var(--ink)]"
      style="
        min-height:140px;
        font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
      "
    >
      <div>
        <div class="flex flex-wrap items-start gap-2 mb-2">
          <div class="text-[14px] font-extrabold leading-[1.4] text-[color:var(--ink)]">
            ${escapeHtml(title)}
          </div>
          <span
            class="px-[6px] py-[3px] rounded-md text-[11px] font-semibold leading-none border"
            style="
              background:var(--surface-card-alt);
              border:1px solid var(--br-card);
              color:${pillClr};
            "
          >
            ${escapeHtml(pill)}
          </span>
        </div>
        <div class="text-[12.5px] text-[color:var(--muted)] leading-[1.45]">
          ${escapeHtml(desc)}
        </div>
      </div>

      <div class="mt-4">
        <button
          class="btn btn-sm opacity-60 cursor-not-allowed"
          type="button"
          disabled
          aria-disabled="true"
        >
          Anteprima
        </button>
      </div>
    </div>
  `;
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
//
// 1. recupera il container (#mod-f1, #mod-f2, ecc.) da window.Tradelia.mountTarget
// 2. scarica i dati JSON del modulo
// 3. prova ad importare dinamicamente /report/assets/js/modules/{modId in lower}.js
// 4. se esiste renderCard() → usa il modulo vero
//    se non esiste → card placeholder bella invece di "CARICAMENTO..." brutto
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

  // 3. import dinamico del renderer specifico (F1B -> f1b.js, F5B -> f5b.js, ecc.)
  const moduleFile = modId.toLowerCase();
  let mod;
  let importFailed = false;

  try {
    mod = await import(`/report/assets/js/modules/${moduleFile}.js`);
  } catch (err) {
    importFailed = true;
    console.warn("Import modulo fallita:", modId, err);
  }

  // Se l'import è fallito, o se il modulo importato NON espone renderCard,
  // usiamo il placeholder "in sviluppo".
  if (importFailed || !mod || typeof mod.renderCard !== "function") {
    container.innerHTML = renderModulePlaceholder(modId);
    container.classList.remove("is-loading");
    return;
  }

  // 4. Se abbiamo renderCard(), usiamo il modulo vero
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

  // 3. moduli in ordine
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


// ------------------------------------------------------------
// MINI ESCAPE HELPERS USATI DA renderModulePlaceholder
// ------------------------------------------------------------

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
