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

// format numeri per hero
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
// HERO
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

  // Ticker / venue
  setText("hero-ticker", Ticker || "—");
  setText("hero-venue", Venue || "—");

  // Prezzo / Δ%
  const chgPctStr = fmtPct(ChangePct, 2);
  setText("hero-price", Price !== undefined ? fmtNum(Price, 2) : "—");
  setText("hero-change", chgPctStr);

  // Badge stato
  setText("hero-state", State || "—");

  // Snapshot
  setText("hero-start", Start || "—");
  setText("hero-end", End || "—");

  // Price (meta)
  const heroPrice2 = document.getElementById("hero-price2");
  if (heroPrice2) heroPrice2.textContent = (Price !== undefined ? fmtNum(Price,2) : "—");

  // Δ% (meta)
  const heroChg2 = document.getElementById("hero-change2");
  if (heroChg2) heroChg2.textContent = chgPctStr;

  // Currency / Freshness / Confidence
  setText("hero-ccy", Currency || "—");
  setText("hero-freshness", FreshnessLabel || "—");
  setText("hero-confidence", ConfidenceFinal !== undefined ? fmtNum(ConfidenceFinal,2) : "—");

  // footer snapshot / updated
  setText("footer-snapshot", Start || "—");
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

  // tonebars
  const toneChg  = document.getElementById("tone-chg");
  const toneConf = document.getElementById("tone-conf");

  if (toneChg) {
    toneChg.style.backgroundColor =
      typeof ChangePct === "number"
        ? (ChangePct >= 0 ? "var(--tone-g)" : "var(--tone-r)")
        : "var(--tone-n)";
  }

  if (toneConf) {
    const cf = Number(ConfidenceFinal);
    toneConf.style.backgroundColor =
      !isNaN(cf)
        ? (cf >= 0.75
            ? "var(--tone-g)"
            : (cf < 0.5 ? "var(--tone-r)" : "var(--tone-n)"))
        : "var(--tone-n)";
  }

  // altri neutri
  const toneSnap  = document.getElementById("tone-snap");
  const tonePrice = document.getElementById("tone-price");
  const toneCcy   = document.getElementById("tone-ccy");
  const toneFresh = document.getElementById("tone-fresh");
  if (toneSnap)  toneSnap.style.backgroundColor  = "var(--tone-n)";
  if (tonePrice) tonePrice.style.backgroundColor = "var(--tone-n)";
  if (toneCcy)   toneCcy.style.backgroundColor   = "var(--tone-n)";
  if (toneFresh) toneFresh.style.backgroundColor = "var(--tone-n)";
}

// ------------------------------------------------------------
// Manifest
// ------------------------------------------------------------
async function loadManifest(reportId) {
  const url = `/report/reports/${reportId}/manifest.json`;
  const mf = await fetchJSON(url);
  if (mf) return mf;

  // fallback se manca manifest.json
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
    order,
    modules: outMods
  };
}

// ------------------------------------------------------------
// Sezione Header builder (riusabile per ogni capitolo F1..F6)
// ------------------------------------------------------------

function renderSectionHeader({ badge, title, desc, state }) {
  // state: "active" | "dev"
  // badge: "F1", "F2", ...
  // title: es. "Contesto iniziale / Regime di mercato"
  // desc:  paragrafo descrizione
  // state pill:
  const pillState = state === "active"
    ? `<span class="module-status-pill" data-state="active">ATTIVO</span>`
    : `<span class="module-status-pill">IN SVILUPPO</span>`;

  return `
    <header class="section-headline">
      <div class="section-head-left">
        <div class="section-head-topline">
          <span class="section-badge">${escapeHtml(badge)}</span>
          <span class="section-title-main">${escapeHtml(title)}</span>
        </div>
        <div class="section-desc">
          ${escapeHtml(desc || "")}
        </div>
      </div>
      <div class="section-head-right">
        ${pillState}
      </div>
    </header>
  `;
}

// ------------------------------------------------------------
// F1 content builder (usa F1A o F1B dinamico)
// ------------------------------------------------------------

async function mountF1Section(manifest, reportId) {
  const sec = document.getElementById("sec-f1");
  if (!sec) return;

  // qual è il primo modulo in order? (F1A o F1B)
  const firstModId = manifest.order[0] || "F1B";
  const jsonUrl    = manifest.modules[firstModId];

  // header della sezione F1 (sempre stesso titolo per l'utente)
  const f1HeaderHTML = renderSectionHeader({
    badge: "F1",
    title: "Contesto iniziale / Regime di mercato",
    desc: "Quadro di rischio e contesto del titolo/mercato al momento dello snapshot. Dati descrittivi, finalità informative.",
    state: "active"
  });

  // proviamo a importare dinamicamente la logica del modulo vero
  let modData = null;
  if (jsonUrl) {
    modData = await fetchJSON(jsonUrl);
  }

  let mod;
  try {
    mod = await import(`/report/assets/js/modules/${firstModId.toLowerCase()}.js`);
  } catch (err) {
    console.warn("F1 import fallita per", firstModId, err);
    mod = null;
  }

  let bodyHTML = "";
  if (mod && typeof mod.renderCard === "function") {
    // lasciamo al modulo F1A/F1B il compito di costruire il body
    // ma ATTENZIONE: vogliamo solo il contenuto, non di nuovo l'intestazione F1.
    bodyHTML = mod.renderCard(modData, { modId: firstModId, reportId });
  } else {
    bodyHTML = `
      <div class="text-[13px] leading-[1.45] text-[color:var(--muted)]">
        Dati di contesto non disponibili.
      </div>
    `;
  }

  sec.innerHTML = f1HeaderHTML + bodyHTML;
  sec.classList.remove("is-loading");

  // se il modulo esporta bindCard lo eseguiamo (per drawer, tooltip, ecc.)
  if (mod && typeof mod.bindCard === "function") {
    try {
      mod.bindCard(sec, modData, { modId: firstModId, reportId });
    } catch (bindErr) {
      console.warn("bindCard error in F1:", bindErr);
    }
  }
}

// ------------------------------------------------------------
// Altre sezioni placeholder istituzionali
// ------------------------------------------------------------

function sectionCopy(modId) {
  switch (modId) {
    case "F2":
      return {
        title: "Sentiment e flussi",
        desc:  "Sentiment aggregato e flussi rilevanti sul titolo / settore, per capire se il mercato sta accumulando rischio o riducendo esposizione. Nessuna raccomandazione operativa.",
      };
    case "F3":
      return {
        title: "Analisi tecnica multi-timeframe",
        desc:  "Lettura tecnica su più orizzonti temporali (es. daily / weekly). Focus su struttura, momentum, zone di interesse. Linguaggio descrittivo, non esecutivo.",
      };
    case "F4":
      return {
        title: "Relazioni intermarket",
        desc:  "Confronto fra equity, bond, FX e commodity per valutare dove si sta spostando il rischio macro e se il contesto favorisce o frena il tema osservato.",
      };
    case "F5":
      return {
        title: "Resoconto tecnico",
        desc:  "Sintesi del quadro tecnico attuale: fattori di forza/debolezza da monitorare. Materiale a scopo informativo/formativo, senza indicazioni di entrata o uscita.",
      };
    case "F5B":
      return {
        title: "Validazione LT (orizzonte medio-lungo)",
        desc:  "Verifica se il quadro è sostenibile nel tempo o se è puramente tattico. Attenzione a fattori macro-strutturali, non solo al movimento di breve.",
      };
    case "F6":
      return {
        title: "Broker selezionati",
        desc:  "Panoramica di intermediari vigilati/autorizzati. Nessuna promozione commerciale. Prima di qualsiasi operatività reale valgono adeguatezza/appropriatezza MiFID.",
      };
    default:
      return {
        title: modId,
        desc:  "Modulo in sviluppo.",
      };
  }
}

function mountGenericSection(modId) {
  const secMap = {
    "F2": "sec-f2",
    "F3": "sec-f3",
    "F4": "sec-f4",
    "F5": "sec-f5",
    "F5B":"sec-f5b",
    "F6": "sec-f6"
  };
  const secId = secMap[modId];
  if (!secId) return;

  const secEl = document.getElementById(secId);
  if (!secEl) return;

  const { title, desc } = sectionCopy(modId);

  const headerHTML = renderSectionHeader({
    badge: modId,
    title,
    desc,
    state: "dev"
  });

  // corpo placeholder istituzionale (descrizione soltanto)
  const bodyHTML = `
    <div class="text-[13px] leading-[1.45] text-[color:var(--muted)]">
      Modulo in sviluppo.
    </div>
  `;

  secEl.innerHTML = headerHTML + bodyHTML;
  secEl.classList.remove("is-loading");
}

// ------------------------------------------------------------
// MAIN ORCHESTRATION
// ------------------------------------------------------------

async function mountReport() {
  const reportId = getReportIdFromURL();

  // header.json -> hero
  const headerData = await fetchJSON(`/report/reports/${reportId}/header.json`);
  if (headerData) {
    mountHero(headerData);
    window.Tradelia = window.Tradelia || {};
    window.Tradelia.headerData = headerData;
  } else {
    console.warn("Header mancante per", reportId);
  }

  // manifest
  const rawManifest = await loadManifest(reportId);
  const manifest = normalizeManifest(rawManifest, reportId);

  // salva manifest globalmente (facoltativo, utile a debug)
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.manifest = manifest;

  // F1 dinamico (F1A o F1B)
  await mountF1Section(manifest, reportId);

  // F2..F6 placeholder istituzionali
  // Notare: anche se manifest.order è tipo ["F1B","F2","F3",...]
  // noi montiamo sempre tutte le altre sezioni note, in ordine fisso.
  ["F2","F3","F4","F5","F5B","F6"].forEach(id => {
    mountGenericSection(id);
  });

  // footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl){
    yearEl.textContent = new Date().getFullYear();
  }
}

// kick
mountReport();

// ------------------------------------------------------------
// Escape helper (usato nei template di intestazione sezione)
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
