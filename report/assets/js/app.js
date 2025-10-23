/* =========================================================
   Tradelia · Report Runtime
   Orchestratore moduli (F1…F6) con variante F1A/F1B
   Path: /report/assets/js/app.js
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);

/* -------------------------
   Utils base
------------------------- */
async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function probe(path) {
  try {
    const res = await fetch(path, { cache: "no-store", method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
function logDebug(...args) {
  try {
    const dbg = new URL(location.href).searchParams.get("debug");
    if (dbg === "1") console.warn("[Tradelia][debug]", ...args);
  } catch {}
}
function titleForKey(key) {
  const K = String(key).toUpperCase();
  switch (K) {
    case "F1":  return "F1 · Panorama Macro";
    case "F1A": return "F1A · Ticker Context";
    case "F1B": return "F1B · Market Strategy";
    case "F2":  return "F2 · Overview Ticker";
    case "F3":  return "F3 · Scheda Tecnica";
    case "F4":  return "F4 · Intermarket & Intra-Market";
    case "F5":  return "F5 · Resoconto Tecnico";
    case "F5B": return "F5b · Validazione LT";
    case "F6":  return "F6 · Broker Selezionati";
    default:    return K;
  }
}
function placeholderCard(title, note, featured = false) {
  const el = document.createElement(featured ? "section" : "article");
  if (featured) {
    el.style.border = "1px solid var(--br)";
    el.style.borderRadius = "18px";
    el.style.background = "var(--card)";
    el.style.boxShadow = "var(--shadow-2)";
    el.style.padding = "14px";
    el.style.marginBottom = "16px";
  } else {
    el.className = "card-compact";
  }
  el.innerHTML = `
    <div class="card-compact__head" style="display:flex;align-items:center;justify-content:space-between;gap:.6rem">
      <div class="card-compact__title" style="font-weight:800">${title}</div>
      <span class="badge badge--n">placeholder</span>
    </div>
    <div class="card-compact__body">
      <p class="text-muted-12" style="font-size:13px;opacity:.85">${note || "Modulo non disponibile o dati assenti."}</p>
    </div>`;
  return el;
}
async function importModuleRenderer(physKey) {
  const k = String(physKey).toLowerCase();
  const modPath = `/report/assets/js/modules/${k}.js`;
  try {
    return await import(modPath);
  } catch (e) {
    logDebug(`Import modulo fallito: ${physKey}`, e);
    return null;
  }
}

/* -------------------------
   SOLO F1: risoluzione variante (F1A vs F1B)
------------------------- */
/**
 * Regole:
 *  - header.ReportType === "ticker"  → F1A
 *  - header.ReportType === "market"  → F1B
 *  - se assente: auto-detect (f1b.json → F1B; f1a.json → F1A; fallback f1.json)
 */
async function resolveF1Variant({ base, header }) {
  const rt = String(header?.ReportType || header?.Type || "").toLowerCase();
  if (rt === "ticker")  return { physKey: "F1A", dataFile: `${base}/f1a.json` };
  if (rt === "market")  return { physKey: "F1B", dataFile: `${base}/f1b.json` };

  // Auto-detect (robusto)
  if (await probe(`${base}/f1b.json`)) return { physKey: "F1B", dataFile: `${base}/f1b.json` };
  if (await probe(`${base}/f1a.json`)) return { physKey: "F1A", dataFile: `${base}/f1a.json` };

  return { physKey: "F1", dataFile: `${base}/f1.json` };
}

/* -------------------------
   Montaggio modulo singolo
------------------------- */
async function mountModule({ grid, base, logicalKey, manifest, featuredKey, header }) {
  const LOG = String(logicalKey).toUpperCase();

  // Di default: mapping 1:1
  let physKey = LOG;
  let dataPath = `${base}/${LOG.toLowerCase()}.json`;

  // SOLO F1: switch su F1A/F1B secondo header
  if (LOG === "F1") {
    const r = await resolveF1Variant({ base, header });
    physKey = r.physKey;
    dataPath = r.dataFile;
    logDebug(`F1 → ${physKey} (${dataPath})`);
  } else if (manifest?.modules?.[LOG]) {
    // opzionale: consenti file JSON custom per altri moduli
    dataPath = `${base}/${manifest.modules[LOG]}`;
  }

  const isFeatured = featuredKey && LOG === String(featuredKey).toUpperCase();

  // 1) dati
  const data = await loadJSON(dataPath);

  // 2) renderer fisico
  const mod = await importModuleRenderer(physKey);

  // 3) render
  let el;
  if (!data) {
    el = placeholderCard(titleForKey(LOG), "Dati non presenti.", isFeatured);
  } else if (!mod || typeof mod.renderCard !== "function") {
    el = placeholderCard(`${titleForKey(LOG)} (modulo ${physKey} mancante)`, "Modulo non caricato.", isFeatured);
  } else {
    try {
      el = await mod.renderCard(data, {
        featured: isFeatured,
        title: titleForKey(LOG),
        logicalKey: LOG,
        physKey
      });
      if (!(el instanceof Element)) {
        const wrap = document.createElement(isFeatured ? "section" : "article");
        if (isFeatured) {
          wrap.style.border = "1px solid var(--br)";
          wrap.style.borderRadius = "18px";
          wrap.style.background = "var(--card)";
          wrap.style.boxShadow = "var(--shadow-2)";
          wrap.style.padding = "14px";
          wrap.style.marginBottom = "16px";
        } else {
          wrap.className = "card-compact";
        }
        wrap.innerHTML = String(el || "");
        el = wrap;
      }
    } catch (e) {
      logDebug(`renderCard() errore: ${physKey}`, e);
      el = placeholderCard(`${titleForKey(LOG)} (errore renderer)`, "Contenuto non renderizzato.", isFeatured);
    }
  }

  // Mantieni l'ID logico per le chip (data-card="F1" ecc.)
  el.setAttribute("data-card", LOG);

  // 4) inserimento in DOM (featured prima della grid)
  if (isFeatured) {
    const markerId = "tradelia-focus-anchor";
    let anchor = document.getElementById(markerId);
    if (!anchor) {
      anchor = document.createElement("div");
      anchor.id = markerId;
      grid.parentNode.insertBefore(anchor, grid);
    }
    anchor.replaceWith(el);
  } else {
    grid.appendChild(el);
  }

  // 5) bind
  try {
    mod && typeof mod.bindCard === "function" && mod.bindCard(el, data, {
      base,
      manifest,
      header,
      logicalKey: LOG,
      physKey,
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html })
    });
  } catch (e) {
    logDebug(`bindCard() errore: ${physKey}`, e);
  }
}

/* -------------------------
   Export principale
------------------------- */
export async function mountReport(reportId) {
  const base = `/report/reports/${reportId}`;
  const grid = $("#cards-grid");
  if (!grid) {
    logDebug("Grid non trovata (#cards-grid)");
    return;
  }

  // Header (serve solo a decidere F1A/F1B; l'hero lo gestisce l'index)
  const header = await loadJSON(`${base}/header.json`);

  // Manifest (facoltativo). Default: ordine standard e focus su F5
  const manifest =
    (await loadJSON(`${base}/manifest.json`)) || {
      id: reportId,
      title: "Tradelia · Report Runtime",
      order: ["F1", "F2", "F3", "F4", "F5", "F5B", "F6"],
      focus: "F5",
      modules: {} // es.: { "F2": "F2.custom.json" }
    };

  // Esponi a livello globale (chips, ecc.)
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = manifest;

  const order = Array.isArray(manifest.order) ? manifest.order.filter(Boolean) : [];
  if (!order.length) {
    logDebug("Manifest.order vuoto: nessun modulo da montare");
    return;
  }

  // Featured (es. F5 in evidenza sopra la griglia)
  const featuredKey = manifest.focus ? String(manifest.focus).toUpperCase() : null;
  if (featuredKey && order.includes(featuredKey)) {
    await mountModule({ grid, base, logicalKey: featuredKey, manifest, featuredKey, header });
  }

  // Monta gli altri, saltando il featured
  for (const key of order) {
    if (featuredKey && String(key).toUpperCase() === featuredKey) continue;
    await mountModule({ grid, base, logicalKey: key, manifest, featuredKey, header });
  }

  // Aggiorna icone Lucide alla fine
  if (window.lucide) {
    try { window.lucide.createIcons(); } catch {}
  }
}

/* -------------------------
   Bootstrap auto
------------------------- */
(function () {
  const url = new URL(location.href);
  const reportId = url.searchParams.get("id") || "sample-id";
  mountReport(reportId).catch((e) => logDebug("mountReport() error", e));

  // Helper debug: scroll to module
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.scrollToModule = (key) => {
    const K = String(key).toUpperCase();
    const el = document.querySelector(`[data-card="${K}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
})();
