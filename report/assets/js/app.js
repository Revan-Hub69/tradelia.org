// /report/assets/js/app.js
//
// Ruolo: orchestratore dati runtime del Report
// - legge header.json e manifest.json dal report corrente
// - popola hero e footer base
// - monta le sezioni F1...F6 caricando i moduli dinamici
//
// Dipendenze: nessuna libreria esterna, solo fetch + dynamic import
//
// Convenzioni di path:
// /report/reports/{reportId}/header.json
// /report/reports/{reportId}/manifest.json
// e poi i singoli dati modulo: es. f1b.json, f2.json...
//
// Convenzioni dei moduli UI:
// /report/assets/js/modules/f1b.js, f1a.js, f2.js, ...
//   export function renderCard(data, ctx) -> string HTML
//   export function bindCard(node, data, ctx) -> attach listeners (opzionale)
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

// numeri / percentuali per hero
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
  setText("hero-confidence",
    ConfidenceFinal !== undefined ? fmtNum(ConfidenceFinal, 2) : "—"
  );

  // colorazione up/down
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

  // tonebars in hero
  // snapshot neutro
  const toneSnap  = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneChg   = document.getElementById("tone-chg");
  const toneCcy   = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");
  const toneConf  = document.getElementById("tone-conf");

  if (toneSnap)  toneSnap.style.backgroundColor  = "var(--tone-n)";
  if (tonePrice) tonePrice.style.backgroundColor = "var(--tone-n)";
  if (toneCcy)   toneCcy.style.backgroundColor   = "var(--tone-n)";
  if (toneFresh) toneFresh.style.backgroundColor = "var(--tone-n)";

  // chg: verde se >=0 , rosso se <0
  if (toneChg) {
    if (typeof ChangePct === "number") {
      toneChg.style.backgroundColor =
        ChangePct >= 0 ? "var(--tone-g)" : "var(--tone-r)";
    } else {
      toneChg.style.backgroundColor = "var(--tone-n)";
    }
  }

  // conf: >=0.75 verde, <0.5 rosso, altro neutro
  if (toneConf) {
    const cf = Number(ConfidenceFinal);
    if (!isNaN(cf)) {
      if (cf >= 0.75) {
        toneConf.style.backgroundColor = "var(--tone-g)";
      } else if (cf < 0.5) {
        toneConf.style.backgroundColor = "var(--tone-r)";
      } else {
        toneConf.style.backgroundColor = "var(--tone-n)";
      }
    } else {
      toneConf.style.backgroundColor = "var(--tone-n)";
    }
  }

  // footer info
  // version
  if (Version) {
    setText("footer-version", Version);
  }
  // snapshot
  setText("footer-snapshot",
    (Start && End) ? (Start + " → " + End) : (Start || End || "—")
  );
  // updated
  // preferisci UpdatedAt se presente, altrimenti End, altrimenti Start
  const upd = UpdatedAt || End || Start || "—";
  setText("footer-updated", upd);

  // footer year dinamico
  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    const now = new Date();
    yearEl.textContent = now.getFullYear();
  }
}

// ------------------------------------------------------------
// MANIFEST LOADING / NORMALIZATION
// ------------------------------------------------------------

async function loadManifest(reportId) {
  // tenta manifest.json custom del report
  const url = `/report/reports/${reportId}/manifest.json`;
  const mf = await fetchJSON(url);
  if (mf) return mf;

  // fallback se non esiste manifest.json
  // ordine verticale F1 -> F6
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
// NOTA: sia F1A che F1B montano dentro #sec-f1
function getSectionSelectorForModule(modId) {
  const upper = modId.toUpperCase();

  if (upper === "F1A" || upper === "F1B") return "#sec-f1";
  if (upper === "F2")  return "#sec-f2";
  if (upper === "F3")  return "#sec-f3";
  if (upper === "F4")  return "#sec-f4";
  if (upper === "F5")  return "#sec-f5";
  if (upper === "F5B") return "#sec-f5b";
  if (upper === "F6")  return "#sec-f6";

  // default fallback se arriva roba sconosciuta
  return null;
}

// normalizza i path dei json modulo
function normalizeManifest(manifest, reportId) {
  const order = Array.isArray(manifest.order)
    ? manifest.order.slice()
    : Object.keys(manifest.modules || {});

  const outMods = {};
  for (const key of Object.keys(manifest.modules || {})) {
    let path = manifest.modules[key];
    // se è relativo tipo "f1b.json", prepend cartella del report
    if (
      typeof path === "string" &&
      !path.startsWith("http") &&
      !path.startsWith("/")
    ) {
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
// MOUNT DI UN SINGOLO MODULO (F1A/F1B/F2/...)
// ------------------------------------------------------------

async function mountSingleModule(modId, jsonUrl, reportId) {
  // trova il contenitore giusto
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
  // convenzione: "F1B" -> "f1b.js", "F5B" -> "f5b.js"
  const fileBase = modId.toLowerCase(); // "f1b"
  let mod;
  try {
    mod = await import(`/report/assets/js/modules/${fileBase}.js`);
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
            Modulo non disponibile.
          </div>
        </div>
      </div>
      <div class="tl-panel-section-text text-[13px] leading-[1.45] text-[color:var(--muted)]">
        Impossibile caricare il renderer ${fileBase}.js
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

    // bind interazioni (Audit / Fonti -> openPanel ecc.)
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

  // 3. scorri i moduli in ordine e montali
  for (const modId of manifest.order) {
    const jsonUrl = manifest.modules[modId];
    if (!jsonUrl) {
      console.warn(`Nessun jsonUrl per ${modId}`);
      continue;
    }
    await mountSingleModule(modId, jsonUrl, reportId);
  }
}

// kick immediato
mountReport();

// (opzionale) esponiamo qualcosa su window per debug
window.TradeliaApp = {
  mountReport,
  getReportIdFromURL
};
