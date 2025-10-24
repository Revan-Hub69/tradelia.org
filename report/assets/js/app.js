/* =========================================================
   Tradelia · Report Runtime
   Orchestratore moduli (F1…F6, F5B) — v2026
   Path: /report/assets/js/app.js
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------------------------------------------------
   UTILITIES
--------------------------------------------------------- */

const JsonCache = new Map();
async function loadJSON(path) {
  if (!path) return null;
  if (JsonCache.has(path)) return JsonCache.get(path);
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      JsonCache.set(path, null);
      return null;
    }
    const data = await res.json();
    JsonCache.set(path, data);
    return data;
  } catch {
    JsonCache.set(path, null);
    return null;
  }
}

const ModuleCache = new Map();
async function loadModule(path) {
  if (ModuleCache.has(path)) return ModuleCache.get(path);
  try {
    const mod = await import(path);
    ModuleCache.set(path, mod);
    return mod;
  } catch (e) {
    console.warn("[Tradelia] import fallito:", path, e);
    ModuleCache.set(path, null);
    return null;
  }
}

function toEl(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html || "").trim();
  return tpl.content.firstElementChild || document.createTextNode("");
}

function ensureEl(nodeOrHtml, fallbackTitle = "Modulo") {
  if (!nodeOrHtml || (typeof nodeOrHtml === "string" && !nodeOrHtml.trim())) {
    const el = document.createElement("article");
    el.className = "card-compact";
    el.innerHTML = `
      <div class="card-compact__head">
        <div class="card-compact__title">${fallbackTitle}</div>
        <span class="badge badge--n">placeholder</span>
      </div>
      <div class="card-compact__body">
        <p class="text-[12.6px] text-[color:var(--muted)]">
          Contenuto non disponibile.
        </p>
      </div>`;
    return el;
  }
  if (nodeOrHtml instanceof Element || nodeOrHtml instanceof Node) return nodeOrHtml;
  return toEl(nodeOrHtml);
}

function titleForKey(key) {
  const K = String(key).toUpperCase();
  switch (K) {
    case "F1":
    case "F1A":
    case "F1B": return "F1 · Contesto Iniziale";
    case "F2":  return "F2 · Sentiment / Ticker";
    case "F3":  return "F3 · Multi-TF Tecnico";
    case "F4":  return "F4 · Intermarket";
    case "F5":  return "F5 · Resoconto Tecnico";
    case "F5B": return "F5b · Validazione LT";
    case "F6":  return "F6 · Sezione Extra";
    default:    return K;
  }
}

function logDebug(...args) {
  try {
    const dbg = new URL(location.href).searchParams.get("debug");
    if (dbg === "1") console.warn("[Tradelia][debug]", ...args);
  } catch {}
}

function safeCreateIcons() {
  try { if (window.lucide) window.lucide.createIcons(); } catch {}
}

/* ---------------------------------------------------------
   VARIANTE F1 (F1A: ticker richiesto; F1B: regime→settori→ticker)
--------------------------------------------------------- */

/**
 * Regole:
 * - manifest.f1Variant = "F1A"|"F1B"|"F1" prende priorità
 * - manifest.modules.F1 (string) es: "f1a.json" o "F1B.json"
 * - probing: se esiste F1B.json → "F1B"; altrimenti F1A.json → "F1A";
 *            fallback legacy F1.json → "F1"; se nulla, default "F1B"
 */
async function resolveF1Variant(base, manifest) {
  const declared = String(manifest?.f1Variant || "").toUpperCase();
  if (declared === "F1A" || declared === "F1B" || declared === "F1") {
    return declared;
  }

  const mapped = manifest?.modules?.F1;
  if (typeof mapped === "string" && mapped) {
    const up = mapped.toUpperCase();
    if (up.includes("F1A")) return "F1A";
    if (up.includes("F1B")) return "F1B";
    if (up.includes("F1.")) return "F1";
  }

  const tryB = await loadJSON(`${base}/F1B.json`);
  if (tryB) return "F1B";
  const tryA = await loadJSON(`${base}/F1A.json`);
  if (tryA) return "F1A";
  const tryLegacy = await loadJSON(`${base}/F1.json`);
  if (tryLegacy) return "F1";

  // defaultiamo a F1B (la nostra lettura da regime)
  return "F1B";
}

/* ---------------------------------------------------------
   PATHS RISOLTI PER OGNI MODULO
--------------------------------------------------------- */

async function resolvePaths(base, rawKey, manifest) {
  const U = String(rawKey).toUpperCase();

  // F1 (variante)
  if (U === "F1" || U === "F1A" || U === "F1B") {
    const variant = await resolveF1Variant(base, manifest); // "F1A" | "F1B" | "F1"
    const resolvedKey = variant; // useremo questo per file e mountTarget
    const lower = resolvedKey.toLowerCase();

    // data path: rispetto a manifest.modules.F1 se presente
    const mapped = manifest?.modules?.F1;
    const dataPath = mapped ? `${base}/${mapped}` : `${base}/${lower}.json`;

    // modulo JS: /assets/js/modules/{f1a|f1b|f1}.js
    const modulePath = `/report/assets/js/modules/${lower}.js`;
    return { dataPath, modulePath, resolvedKey };
  }

  // Altri moduli (F2, F3, F4, F5, F5B, F6…)
  const lower = U.toLowerCase();
  const mapped = manifest?.modules?.[U];
  const dataPath = mapped ? `${base}/${mapped}` : `${base}/${lower}.json`;
  const modulePath = `/report/assets/js/modules/${lower}.js`;
  return { dataPath, modulePath, resolvedKey: U };
}

/* ---------------------------------------------------------
   MOUNT MODULO SINGOLO
--------------------------------------------------------- */

async function mountModule(base, rawKey, manifest, ctx) {
  const K = String(rawKey).toUpperCase();

  // Resolve
  let paths;
  try {
    paths = await resolvePaths(base, K, manifest);
  } catch (e) {
    logDebug(`resolvePaths error for ${K}`, e);
    const fallback = ensureEl(null, titleForKey(K));
    (document.body).appendChild(fallback);
    return;
  }

  const { dataPath, modulePath, resolvedKey } = paths;

  // Target di mount (con fallback)
  const mountSel =
    window.Tradelia?.mountTarget?.[resolvedKey] ||
    window.Tradelia?.mountTarget?.[K];
  const mountTarget = mountSel ? document.querySelector(mountSel) : null;
  const fallbackTarget = $("#cards-grid") || mountTarget || document.body;

  // Dati
  const data = await loadJSON(dataPath);
  if (!data) {
    logDebug(`Dati assenti per ${resolvedKey} @`, dataPath);
    const el = ensureEl(null, titleForKey(resolvedKey));
    el.setAttribute("data-card", resolvedKey);
    fallbackTarget.appendChild(el);
    safeCreateIcons();
    return;
  }

  // Modulo JS
  const mod = await loadModule(modulePath);
  if (!mod || typeof mod.renderCard !== "function") {
    logDebug(`Modulo renderer mancante per ${resolvedKey} @`, modulePath);
    const el = ensureEl(null, `${titleForKey(resolvedKey)} (modulo mancante)`);
    el.setAttribute("data-card", resolvedKey);
    fallbackTarget.appendChild(el);
    safeCreateIcons();
    return;
  }

  // Render
  let el;
  try {
    const rendered = mod.renderCard(data, {
      base,
      reportId: ctx.reportId,
      variant: resolvedKey, // utile per distinguere F1A/F1B nel renderer
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html }),
    });
    el = ensureEl(rendered, titleForKey(resolvedKey));
  } catch (e) {
    logDebug(`renderCard() errore: ${resolvedKey}`, e);
    el = ensureEl(null, `${titleForKey(resolvedKey)} (errore renderer)`);
  }

  el.setAttribute("data-card", resolvedKey);
  fallbackTarget.appendChild(el);

  // Bind opzionale
  try {
    if (typeof mod.bindCard === "function") {
      mod.bindCard(el, data, {
        base,
        reportId: ctx.reportId,
        variant: resolvedKey,
        openDrawer: (title, subtitle, html) =>
          window.Tradelia?.Drawer?.open({ title, subtitle, html }),
      });
    }
  } catch (e) {
    logDebug(`bindCard() errore: ${resolvedKey}`, e);
  }

  safeCreateIcons();
}

/* ---------------------------------------------------------
   MANIFEST
--------------------------------------------------------- */

function normalizeManifest(m, reportId) {
  const def = {
    id: reportId,
    title: "Tradelia · Report Runtime",
    // ordine "istituzionale" (F3 è centrale via layout)
    order: ["F1", "F2", "F4", "F3", "F5", "F5B"],
    modules: {},
    // opzionale: f1Variant: "F1A" | "F1B" | "F1"
  };
  if (!m || typeof m !== "object") return def;

  const out = { ...def, ...m };

  // Normalizza order in upper
  if (Array.isArray(m.order)) {
    out.order = m.order.map(k => String(k).toUpperCase());
  }

  // Normalizza modules: chiavi sempre upper (F1, F2, …)
  if (m.modules && typeof m.modules === "object") {
    const normalized = {};
    for (const [k, v] of Object.entries(m.modules)) {
      normalized[String(k).toUpperCase()] = v;
    }
    out.modules = normalized;
  }

  // Normalizza f1Variant
  if (typeof m.f1Variant === "string") {
    const v = m.f1Variant.toUpperCase();
    if (["F1A", "F1B", "F1"].includes(v)) out.f1Variant = v;
  }

  return out;
}

/* ---------------------------------------------------------
   EXPORT PUBBLICO
--------------------------------------------------------- */

export async function mountReport(reportId) {
  const base = `/report/reports/${reportId}`;

  // carica manifest (case-insensitive)
  const manifestRaw =
    (await loadJSON(`${base}/manifest.json`)) ||
    (await loadJSON(`${base}/MANIFEST.json`)) ||
    null;

  const manifest = normalizeManifest(manifestRaw, reportId);

  // Esponi manifest globalmente
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = manifest;

  // Ordine
  const order = Array.isArray(manifest.order) ? manifest.order : [];
  if (!order.length) {
    logDebug("Manifest.order vuoto: nessun modulo da montare");
    return;
  }

  // Monta in sequenza
  for (const key of order) {
    await mountModule(base, key, manifest, { reportId });
  }

  // pass icone
  safeCreateIcons();
}

/* ---------------------------------------------------------
   AUTO-BOOTSTRAP
--------------------------------------------------------- */

(function bootstrap() {
  try {
    const url = new URL(location.href);
    const reportId = url.searchParams.get("id") || "sample-id";
    mountReport(reportId).catch(e => logDebug("mountReport() error", e));
  } catch (e) {
    console.error("[Tradelia] bootstrap error", e);
  }
})();
