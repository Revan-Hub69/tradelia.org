/* =========================================================
   Tradelia · Report Runtime
   Orchestratore moduli (F1…F6, F5b) — definitivo
   Path: /report/assets/js/app.js
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

function badge(tone = "n", text = "placeholder") {
  const m = {
    g: "badge--g",
    y: "badge--y",
    r: "badge--r",
    n: "badge--n",
  }[tone] || "badge--n";
  return `<span class="badge ${m}">${text}</span>`;
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

function placeholderCard(title, note) {
  const el = document.createElement("article");
  el.className = "card-compact";
  el.innerHTML = `
    <div class="card-compact__head">
      <div class="card-compact__title">${title}</div>
      ${badge("n", "placeholder")}
    </div>
    <div class="card-compact__body">
      <p class="text-muted-12">${note || "Modulo non disponibile o dati assenti."}</p>
    </div>`;
  return el;
}

/* -------------------------
   Loader modulo singolo
------------------------- */
async function mountModule(grid, base, key, manifest) {
  const K = String(key).toUpperCase();           // es. "F5B"
  const k = K.toLowerCase();                     // "f5b"
  const modPath  = `/report/assets/js/modules/${k}.js`;
  const dataPath = manifest?.modules?.[K]
    ? `${base}/${manifest.modules[K]}`
    : `${base}/${k}.json`;

  // 1) Carico dati
  const data = await loadJSON(dataPath);
  if (!data) {
    logDebug(`Dati assenti per ${K}`, dataPath);
    const el = placeholderCard(titleForKey(K), "Dati non presenti.");
    el.setAttribute("data-card", K);
    grid.appendChild(el);
    return;
  }

  // 2) Import dinamico del renderer
  let mod;
  try {
    mod = await import(modPath);
  } catch (e) {
    logDebug(`Import modulo fallito: ${K}`, e);
    const el = placeholderCard(`${titleForKey(K)} (errore modulo)`, "Modulo non caricato.");
    el.setAttribute("data-card", K);
    grid.appendChild(el);
    return;
  }

  // 3) Render
  let el;
  try {
    el = (mod.renderCard && mod.renderCard(data)) || placeholderCard(titleForKey(K), "Modulo senza renderer.");
  } catch (e) {
    logDebug(`renderCard() ha generato un errore: ${K}`, e);
    el = placeholderCard(`${titleForKey(K)} (errore renderer)`, "Contenuto non renderizzato.");
  }
  el.setAttribute("data-card", K);
  grid.appendChild(el);

  // 4) Bind opzionale (drawer, azioni, ecc.)
  try {
    mod.bindCard && mod.bindCard(el, data, {
      base,
      openDrawer: (title, subtitle, html) =>
        window.Tradelia?.Drawer?.open({ title, subtitle, html }),
    });
  } catch (e) {
    logDebug(`bindCard() ha generato un errore: ${K}`, e);
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
      modules: {} // opzionale
    };

  // Esponi per accensione chip (index se ne occupa)
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = manifest;

  // Ordine moduli
  const order = Array.isArray(manifest.order) ? manifest.order : [];
  if (!order.length) {
    logDebug("Manifest.order vuoto: nessun modulo da montare");
    return;
  }

  // Monta ogni modulo
  for (const key of order) {
    await mountModule(grid, base, key, manifest);
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
})();
