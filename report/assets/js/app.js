/* =========================================================
   Tradelia · Report Runtime
   Orchestratore moduli (F1…F6, F5b) — v2026 definitive
   Path: /report/assets/js/app.js
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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
function logDebug(...args) {
  try {
    const dbg = new URL(location.href).searchParams.get("debug");
    if (dbg === "1") console.warn("[Tradelia][debug]", ...args);
  } catch {}
}
function toEl(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html).trim();
  return tpl.content.firstElementChild;
}
function ensureEl(nodeOrHtml, fallbackTitle = "Modulo") {
  if (!nodeOrHtml) {
    const el = document.createElement("article");
    el.className = "card-compact";
    el.innerHTML = `
      <div class="card-compact__head">
        <div class="card-compact__title">${fallbackTitle}</div>
        <span class="badge badge--n">placeholder</span>
      </div>
      <div class="card-compact__body">
        <p class="text-muted-12">Contenuto non disponibile.</p>
      </div>`;
    return el;
  }
  if (nodeOrHtml instanceof Element) return nodeOrHtml;
  return toEl(nodeOrHtml);
}
function titleForKey(key) {
  const K = String(key).toUpperCase();
  switch (K) {
    case "F1":
    case "F1A":
    case "F1B": return "F1 · Panorama Macro";
    case "F2":  return "F2 · Overview Ticker";
    case "F3":  return "F3 · Scheda Tecnica";
    case "F4":  return "F4 · Intermarket & Intra-Market";
    case "F5":  return "F5 · Resoconto Tecnico";
    case "F5B": return "F5b · Validazione LT";
    case "F6":  return "F6 · Broker Selezionati";
    default:    return K;
  }
}

/* -------------------------
   Risoluzione moduli / dati
------------------------- */

/**
 * Determina la variante per F1 (F1A o F1B) secondo priorità:
 * 1) manifest.f1Variant ("F1A" | "F1B")
 * 2) manifest.modules.F1 che punti a "F1A.json"/"F1B.json"
 * 3) probing file: prova F1B.json, poi F1A.json, poi F1.json
 */
async function resolveF1Variant(base, manifest) {
  const declared = String(manifest?.f1Variant || "").toUpperCase();
  if (declared === "F1A" || declared === "F1B") return declared;

  const modMapEntry = manifest?.modules?.F1;
  if (typeof modMapEntry === "string") {
    const up = modMapEntry.toUpperCase();
    if (up.includes("F1B")) return "F1B";
    if (up.includes("F1A")) return "F1A";
  }

  // probing
  const tryB = await loadJSON(`${base}/F1B.json`);
  if (tryB) return "F1B";
  const tryA = await loadJSON(`${base}/F1A.json`);
  if (tryA) return "F1A";
  // fallback storico
  const tryLegacy = await loadJSON(`${base}/F1.json`);
  return tryLegacy ? "F1" : "F1B"; // defaulta B (nostre analisi) se non trova altro
}

/**
 * Restituisce { dataPath, modulePath, resolvedKey } per un K generico.
 * Gestisce la variante F1A/F1B e la mappa manifest.modules.
 */
async function resolvePaths(base, K, manifest) {
  const U = String(K).toUpperCase();

  // F1 speciale (variante)
  if (U === "F1" || U === "F1A" || U === "F1B") {
    const variant = await resolveF1Variant(base, manifest); // "F1A"|"F1B"|"F1"
    const resolvedKey = variant; // useremo questo per i file
    const lower = resolvedKey.toLowerCase(); // f1a | f1b | f1

    const mapped = manifest?.modules?.F1;
    const dataPath = mapped
      ? `${base}/${mapped}`
      : `${base}/${lower}.json`;

    // modulo js: /report/assets/js/modules/f1a.js | f1b.js | f1.js
    const modulePath = `/report/assets/js/modules/${lower}.js`;
    return { dataPath, modulePath, resolvedKey };
  }

  // Altri moduli (F2, F3, F4, F5, F5B, F6…)
  const lower = U.toLowerCase();
  const mapped = manifest?.modules?.[U]; // es. "F5": "qualcosa.json"
  const dataPath = mapped ? `${base}/${mapped}` : `${base}/${lower}.json`;
  const modulePath = `/report/assets/js/modules/${lower}.js`;
  return { dataPath, modulePath, resolvedKey: U };
}

/* -------------------------
   Mount singolo modulo
------------------------- */
async function mountModule(base, rawKey, manifest, ctx) {
  const gridFallback = $("#cards-grid") || document.body; // retrocompat
  const K = String(rawKey).toUpperCase();

  let paths;
  try {
    paths = await resolvePaths(base, K, manifest);
  } catch (e) {
    logDebug(`resolvePaths error for ${K}`, e);
    const el = ensureEl(null, titleForKey(K));
    (gridFallback).appendChild(el);
    return;
  }

  const { dataPath, modulePath, resolvedKey } = paths;
  const mountSel = window.Tradelia?.mountTarget?.[resolvedKey] || window.Tradelia?.mountTarget?.[K];
  const mountTarget = mountSel ? document.querySelector(mountSel) : null;

  // 1) Carico dati JSON
  const data = await loadJSON(dataPath);
  if (!data) {
    logDebug(`Dati assenti per ${resolvedKey}`, dataPath);
    const el = ensureEl(null, titleForKey(resolvedKey));
    el.setAttribute("data-card", resolvedKey);
    (mountTarget || gridFallback).appendChild(el);
    return;
  }

  // 2) Import dinamico del renderer
  let mod;
  try {
    mod = await import(modulePath);
  } catch (e) {
    logDebug(`Import modulo fallito: ${resolvedKey}`, e);
    const el = ensureEl(null, `${titleForKey(resolvedKey)} (modulo mancante)`);
    el.setAttribute("data-card", resolvedKey);
    (mountTarget || gridFallback).appendChild(el);
    return;
  }

  // 3) Render
  let el;
  try {
    const rendered = mod.renderCard ? mod.renderCard(data, {
      base,
      reportId: ctx.reportId,
      variant: resolvedKey, // utile a F1
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html }),
    }) : null;

    el = ensureEl(rendered, titleForKey(resolvedKey));
  } catch (e) {
    logDebug(`renderCard() errore: ${resolvedKey}`, e);
    el = ensureEl(null, `${titleForKey(resolvedKey)} (errore renderer)`);
  }

  el.setAttribute("data-card", resolvedKey);
  (mountTarget || gridFallback).appendChild(el);

  // 4) Bind opzionale
  try {
    mod.bindCard && mod.bindCard(el, data, {
      base,
      reportId: ctx.reportId,
      variant: resolvedKey,
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html }),
    });
  } catch (e) {
    logDebug(`bindCard() errore: ${resolvedKey}`, e);
  }
}

/* -------------------------
   Manifest & ordine
------------------------- */
function normalizeManifest(m, reportId) {
  const def = {
    id: reportId,
    title: "Tradelia · Report Runtime",
    // Ordine default "istituzionale" 2026 con F1/F1B davanti, F3 centrale
    order: ["F1", "F2", "F4", "F3", "F5", "F5B"],
    modules: {},
  };
  if (!m || typeof m !== "object") return def;
  const out = { ...def, ...m };
  // supportiamo anche array semplice ["F1B","F2",...]
  if (Array.isArray(m.order)) out.order = m.order.map(x => String(x).toUpperCase());
  return out;
}

/* -------------------------
   Export principale
------------------------- */
export async function mountReport(reportId) {
  const base = `/report/reports/${reportId}`;

  // Carica manifest se presente
  const manifestRaw =
    (await loadJSON(`${base}/manifest.json`)) ||
    (await loadJSON(`${base}/MANIFEST.json`)) ||
    null;

  const manifest = normalizeManifest(manifestRaw, reportId);

  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = manifest;

  const order = Array.isArray(manifest.order) ? manifest.order : [];
  if (!order.length) {
    logDebug("Manifest.order vuoto: nessun modulo da montare");
    return;
  }

  // Monta in sequenza: F3 al centro è già gestito dal routing target dell'index
  for (const key of order) {
    await mountModule(base, key, manifest, { reportId });
  }

  // Aggiorna icone Lucide post-render
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
})();
