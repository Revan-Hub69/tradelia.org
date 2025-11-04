// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI — con HEADER TICKER integrato (2025-11-03)
// - Legge header.json -> aggiorna <title>/footer e monta HeaderTicker
// - Legge manifest.json -> monta i moduli F*
// - Usa cache-buster ?v=Version (se presente in header.json)

(function () {
  const ROOT = document.getElementById('app-root');
  let __versionQS = '';      // cache-buster aggiunto dopo lettura header.json
  let __header = null;       // copia in memoria dell'header.json

  // -----------------------------
  // Utils
  // -----------------------------
  async function fetchJSON(path) {
    const res = await fetch(path + __versionQS, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch error: ${path} (${res.status})`);
    return await res.json();
  }

  async function safeImport(path) {
    return import(path + __versionQS);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = (val ?? '—');
  }

  function fmtDate(str) {
    if (!str) return '—';
    try { return new Date(str).toLocaleDateString('it-IT'); }
    catch { return String(str); }
  }

  function getReportIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'sample-id';
  }

  function sectionPlaceholder(modId, msg) {
    const wrap = document.createElement('article');
    wrap.id = `sec-${String(modId).toLowerCase()}`;
    wrap.className = 'report-section-block mb-8';
    wrap.innerHTML = `
      <div class="card-compact">
        <div class="text-[13px] text-[color:var(--muted)]">
          Modulo <strong>${modId}</strong> non disponibile: ${msg}
        </div>
      </div>`;
    ROOT.appendChild(wrap);
  }

  // -----------------------------
  // HeaderTicker (slot + mount)
  // -----------------------------
  function ensureHeaderTickerSlot() {
    let slot = document.getElementById('header-ticker-slot');
    if (!slot) {
      // Se il template non lo ha, lo creiamo sopra a ROOT
      slot = document.createElement('div');
      slot.id = 'header-ticker-slot';
      slot.className = 'container';
      // Rimuovi marginTop inline, usa CSS invece
      // Inserisci prima di ROOT se esiste, altrimenti nel body
      if (ROOT && ROOT.parentNode) {
        ROOT.parentNode.insertBefore(slot, ROOT);
      } else {
        // Se ROOT non ha parent, inserisci all'inizio del body
        document.body.insertBefore(slot, document.body.firstChild);
      }
    }
    return slot;
  }

async function mountHeaderTicker(header) {
  try {
    if (!header) {
      console.warn('[HeaderTicker] header non fornito');
      return;
    }
    
    const slot = ensureHeaderTickerSlot();
    if (!slot) {
      console.warn('[HeaderTicker] slot non trovato');
      return;
    }
    
    console.log('[HeaderTicker] Montando header ticker, slot:', slot);
    const { headerTicker } = await safeImport('/report/assets/js/components/header-ticker.js');
    const node = headerTicker.mount(slot);
    
    if (!node) {
      console.warn('[HeaderTicker] node non creato');
      return;
    }
    
    console.log('[HeaderTicker] Node creato, aggiornando con dati:', header);

    // se è già il nuovo json verbale (ha rows) lo passo diretto
    if (Array.isArray(header?.rows)) {
      await headerTicker.update(node, header);
    } else {
      // altrimenti è il vecchio header, faccio la compat
      await headerTicker.update(node, {
        Ticker:          header?.Ticker,
        Venue:           header?.Venue,
        CompanyName:     header?.CompanyName,
        Price:           header?.Price,
        ChangePct:       header?.ChangePct,
        Currency:        header?.Currency,
        Start:           header?.Start,
        End:             header?.End,
        Freshness:       header?.Freshness ?? header?.FreshnessLabel,
        ConfidenceFinal: header?.ConfidenceFinal,
        DataIntegrity:   header?.DataIntegrity,
        FeedSync:        header?.FeedSync,
        State:           header?.State,
        Version:         header?.Version,
        UpdatedAt:       header?.UpdatedAt
      });
    }
    
    console.log('[HeaderTicker] Header montato con successo');
  } catch (err) {
    console.error('[HeaderTicker] Errore nel montaggio:', err);
    console.error('[HeaderTicker] Stack:', err.stack);
  }
}

  // -----------------------------
  // Header/Footer (da header.json)
  // -----------------------------
  async function mountHeaderFooter(reportId) {
    try {
      const header = await fetchJSON(`/report/reports/${reportId}/header.json`);
      __header = header;

      // cache-buster basato su Version (se presente)
      __versionQS = header?.Version ? `?v=${encodeURIComponent(header.Version)}` : '';

      if (header?.Ticker) document.title = `Framework Accademico AI, Tradelia Swing Master 5.0 · ${header.Ticker}`;
      setText('footer-company', header?.CompanyName || header?.Ticker || '—');
      setText('footer-version', header?.Version || '—');
      setText('footer-snapshot', `${header?.Start ?? '—'} → ${header?.End ?? '—'}`);
      setText('footer-updated', fmtDate(header?.UpdatedAt));

      await mountHeaderTicker(header);
    } catch (e) {
      console.warn('Header/footer non disponibili:', e);
      __versionQS = ''; // fallback senza cache-buster
    }
  }

  // -----------------------------
  // Montaggio moduli F* (manifest)
  // -----------------------------
  async function mountModules(reportId) {
    let manifest = { order: ['F1B', 'F2', 'F3o', 'F3', 'F4', 'F5', 'F5B', 'F6'] };
    try {
      const m = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
      if (Array.isArray(m?.order) && m.order.length) manifest = m;
    } catch {
      console.warn('Manifest mancante, uso ordine di default.');
    }

    for (const modId of manifest.order) {
      const idLower = String(modId).toLowerCase();
      const jsonPath = `/report/reports/${reportId}/${idLower}.json`;
      const modPath  = `/report/assets/js/modules/${idLower}.js`;

      try {
        const json = await fetchJSON(jsonPath);
        const mod  = await safeImport(modPath);

        if (typeof mod.renderCard !== 'function') {
          sectionPlaceholder(modId, 'renderCard() non esportata');
          continue;
        }

        const cardHTML = mod.renderCard(json, { reportId, modId, header: __header });
        const wrap = document.createElement('article');
        wrap.id = `sec-${idLower}`;
        wrap.className = 'report-section-block mb-8';
        wrap.innerHTML = cardHTML;
        ROOT.appendChild(wrap);

        if (typeof mod.bindCard === 'function') {
          try { mod.bindCard(wrap, json, { reportId, modId, header: __header }); }
          catch (e) { console.warn(`bindCard ${modId} errore:`, e); }
        }

        // Tooltip metriche "?" (se il runtime UI è presente)
        try { window.__TradeliaUI?.bindMetricInfoButtons?.(wrap); } catch {}
      } catch (err) {
        console.warn(`Modulo ${modId} non caricato:`, err);
        sectionPlaceholder(modId, 'file mancante o errore di parsing');
      }
    }
  }

  // -----------------------------
  // Mount completo
  // -----------------------------
  async function mountReport() {
    const reportId = getReportIdFromURL();
    if (ROOT) ROOT.innerHTML = '';
    await mountHeaderFooter(reportId);
    await mountModules(reportId);
  }

  // -----------------------------
  // Avvio
  // -----------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountReport);
  } else {
    mountReport();
  }

  // API opzionale
  window.TradeliaApp = { mountReport, getReportIdFromURL };
})();
