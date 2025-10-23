/* =========================================================
   Tradelia · Report Runtime
   Orchestratore moduli (F1…F6, F5b) — definitivo
   Path: /report/assets/js/app.js
   Compatibile con index.html aggiornato (chips, drawer, hero separato)
   ========================================================= */

const $  = (s, r = document) => r.querySelector(s);

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

function titleForKey(key) {
  const K = String(key).toUpperCase();
  switch (K) {
    case "F1":  return "F1 · Panorama Macro";
    case "F2":  return "F2 · Overview Ticker";
    case "F3":  return "F3 · Scheda Tecnica";
    case "F4":  return "F4 · Intermarket & Intra-Market";
    case "F5":  return "F5 · Resoconto Tecnico";
    case "F5B": return "F5b · Validazione LT";
    case "F6":  return "F6 · Broker Selezionati";
    default:    return K;
  }
}

function placeholderCard(title, note, kind = "normal") {
  const el = document.createElement(kind === "featured" ? "section" : "article");
  if (kind === "featured") {
    el.style.border    = "1px solid var(--br)";
    el.style.borderRadius = "18px";
    el.style.background   = "var(--card)";
    el.style.boxShadow    = "var(--shadow-2)";
    el.style.padding      = "14px";
    el.style.marginBottom = "16px";
  } else {
    el.className = "card-compact";
  }
  el.innerHTML = `
    <div class="card-compact__head" style="display:flex;align-items:center;justify-content:space-between;gap:.6rem">
      <div class="card-compact__title" style="font-weight:800">${title}</div>
      <span class="hero__badge" style="font-size:12.5px">${"placeholder"}</span>
    </div>
    <div class="card-compact__body">
      <p class="text-muted-12" style="font-size:13px;opacity:.85">${note || "Modulo non disponibile o dati assenti."}</p>
    </div>`;
  return el;
}

/* -------------------------
   Import dinamico di un modulo
------------------------- */
async function importModuleRenderer(keyUpper) {
  const k = String(keyUpper).toLowerCase();
  const modPath = `/report/assets/js/modules/${k}.js`;
  try {
    const mod = await import(modPath);
    return mod;
  } catch (e) {
    logDebug(`Import modulo fallito: ${keyUpper}`, e);
    return null;
  }
}

/* -------------------------
   Montaggio modulo singolo
------------------------- */
async function mountModule({ grid, base, key, manifest, featuredKey }) {
  const K = String(key).toUpperCase();

  // path dati: se manifest.modules[K] presente, usa quello, altrimenti <base>/<k>.json
  const k = K.toLowerCase();
  const dataPath = manifest?.modules?.[K]
    ? `${base}/${manifest.modules[K]}`
    : `${base}/${k}.json`;

  // 1) Dati
  const data = await loadJSON(dataPath);
  const isFeatured = (featuredKey && K === String(featuredKey).toUpperCase());

  // 2) Renderer
  const mod = await importModuleRenderer(K);

  // 3) Render
  let el;
  if (!data) {
    el = placeholderCard(
      titleForKey(K),
      "Dati non presenti.",
      isFeatured ? "featured" : "normal"
    );
  } else if (!mod || typeof mod.renderCard !== "function") {
    el = placeholderCard(
      `${titleForKey(K)}${mod ? "" : " (modulo mancante)"}`,
      mod ? "renderCard() non disponibile." : "Modulo non caricato.",
      isFeatured ? "featured" : "normal"
    );
  } else {
    try {
      // Passo un options per consentire ai moduli di rendere in "featured" mode
      el = await mod.renderCard(data, {
        featured: isFeatured,
        title: titleForKey(K),
      });
      if (!(el instanceof Element)) {
        // Il renderer ha restituito stringa → wrappo
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
      logDebug(`renderCard() errore: ${K}`, e);
      el = placeholderCard(
        `${titleForKey(K)} (errore renderer)`,
        "Contenuto non renderizzato.",
        isFeatured ? "featured" : "normal"
      );
    }
  }

  el.setAttribute("data-card", K);
  if (isFeatured) {
    // inserisco il featured PRIMA della grid (se non già inserito)
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

  // 4) Bind opzionale
  try {
    mod && typeof mod.bindCard === "function" && mod.bindCard(el, data, {
      base,
      manifest,
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html }),
    });
  } catch (e) {
    logDebug(`bindCard() errore: ${K}`, e);
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

  // Manifest (fallback minimo)
  const manifest =
    (await loadJSON(`${base}/manifest.json`)) || {
      id: reportId,
      title: "Tradelia · Report Runtime",
      order: ["F1", "F2", "F3", "F4", "F5", "F5B", "F6"],
      focus: "F5",
      modules: {} // opzionale: { F1: "custom-F1.json", ... }
    };

  // Esponi per chips e per altri script
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = manifest;

  // Ordine moduli
  const order = Array.isArray(manifest.order) ? manifest.order.filter(Boolean) : [];
  if (!order.length) {
    logDebug("Manifest.order vuoto: nessun modulo da montare");
    return;
  }

  // Focus (opzionale) — lo renderemo prima della griglia
  const featuredKey = manifest.focus ? String(manifest.focus).toUpperCase() : null;

  // Prima montiamo l'eventuale featured, poi gli altri (evitando duplicati)
  if (featuredKey && order.includes(featuredKey)) {
    await mountModule({ grid, base, key: featuredKey, manifest, featuredKey });
  }

  for (const key of order) {
    if (featuredKey && String(key).toUpperCase() === featuredKey) continue;
    await mountModule({ grid, base, key, manifest, featuredKey });
  }

  // Icone Lucide dopo vernice
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

  // Espongo helper per debug: scroll a modulo
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.scrollToModule = (key) => {
    const K = String(key).toUpperCase();
    const el = document.querySelector(`[data-card="${K}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
})();
