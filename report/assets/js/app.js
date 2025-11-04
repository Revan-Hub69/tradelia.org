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
    try {
      const url = path + __versionQS;
      console.log('[App] Fetching:', url);
      const res = await fetch(url, { cache: 'no-store' });
      
      if (!res.ok) {
        const errorMsg = `Fetch error: ${path} (${res.status})`;
        console.error('[App]', errorMsg);
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      
      // Validazione base: verifica che sia un oggetto
      if (!data || typeof data !== 'object') {
        console.warn('[App] JSON non valido o vuoto:', path);
        throw new Error(`Invalid JSON data from ${path}`);
      }
      
      return data;
    } catch (err) {
      // Se è un errore di fetch, rilancia
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.error('[App] Errore di rete:', err);
        throw new Error(`Network error: ${err.message}`);
      }
      throw err;
    }
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

  function showHeaderError(message) {
    const slot = ensureHeaderTickerSlot();
    if (!slot) return;
    
    slot.innerHTML = `
      <div style="padding: 1rem; background: var(--surface-card); border: 1px solid var(--br-card); border-radius: var(--radius-card); color: var(--muted);">
        <div style="font-size: 13px;">⚠️ ${message}</div>
        <div style="font-size: 11px; margin-top: 0.5rem; opacity: 0.8;">Report ID: ${getReportIdFromURL()}</div>
      </div>
    `;
  }

async function mountHeaderTicker(header) {
  try {
    if (!header) {
      console.warn('[HeaderTicker] header non fornito');
      showHeaderError('Header non fornito');
      return;
    }
    
    const slot = ensureHeaderTickerSlot();
    if (!slot) {
      console.error('[HeaderTicker] ERRORE CRITICO: slot non trovato nel DOM');
      return;
    }
    
    console.log('[HeaderTicker] Montando header ticker, slot:', slot);
    
    try {
      const { headerTicker } = await safeImport('/report/assets/js/components/header-ticker.js');
      
      if (!headerTicker || typeof headerTicker.mount !== 'function') {
        console.error('[HeaderTicker] ERRORE: headerTicker non esportato correttamente');
        showHeaderError('Errore caricamento componente header');
        return;
      }
      
      const node = headerTicker.mount(slot);
      
      if (!node) {
        console.error('[HeaderTicker] ERRORE: node non creato da mount()');
        showHeaderError('Errore creazione nodo header');
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
    } catch (importErr) {
      console.error('[HeaderTicker] Errore import componente:', importErr);
      showHeaderError(`Errore import componente: ${importErr.message}`);
    }
  } catch (err) {
    console.error('[HeaderTicker] Errore nel montaggio:', err);
    console.error('[HeaderTicker] Stack:', err.stack);
    showHeaderError(`Errore montaggio header: ${err.message}`);
  }
}

  // -----------------------------
  // Header/Footer (da header.json)
  // -----------------------------
  async function mountHeaderFooter(reportId) {
    try {
      const headerPath = `/report/reports/${reportId}/header.json`;
      console.log('[App] Caricamento header da:', headerPath);
      
      const header = await fetchJSON(headerPath);
      
      if (!header || (typeof header !== 'object')) {
        console.error('[App] Header non valido:', header);
        showHeaderError('Header non valido o vuoto');
        __versionQS = '';
        return;
      }
      
      // Verifica che ci siano almeno dati minimi (rows o campi legacy)
      const hasRows = Array.isArray(header?.rows) && header.rows.length > 0;
      const hasLegacyData = header?.Ticker || header?.CompanyName;
      
      if (!hasRows && !hasLegacyData) {
        console.warn('[App] Header senza dati utili:', header);
        showHeaderError('Header senza dati da visualizzare');
        __versionQS = '';
        return;
      }
      
      console.log('[App] Header caricato con successo:', {
        hasRows,
        rowsCount: hasRows ? header.rows.length : 0,
        hasLegacyData,
        ticker: header?.Ticker || header?.rows?.[0]?.parts?.find(p => p.key === 'Ticker')?.value
      });
      
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
      console.error('[App] Errore caricamento header/footer:', e);
      console.error('[App] Stack:', e.stack);
      
      // Messaggio di errore più specifico
      let errorMsg = 'Errore caricamento header';
      if (e.message.includes('404') || e.message.includes('404')) {
        errorMsg = `File header.json non trovato (404). Report ID: ${reportId}`;
      } else if (e.message.includes('Network error')) {
        errorMsg = 'Errore di rete. Verifica che il server sia attivo.';
      } else if (e.message.includes('Invalid JSON')) {
        errorMsg = 'File header.json non valido o corrotto';
      } else {
        errorMsg = `${errorMsg}: ${e.message || 'Errore sconosciuto'}`;
      }
      
      showHeaderError(errorMsg);
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
    console.log('[App] Inizio montaggio report, ID:', reportId);
    
    // Assicura che lo slot esista prima di iniziare
    const slot = ensureHeaderTickerSlot();
    if (!slot) {
      console.error('[App] ERRORE CRITICO: Impossibile creare header-ticker-slot');
      return;
    }
    
    // Pulisci solo ROOT, non lo slot (potrebbe avere contenuto di fallback)
    if (ROOT) ROOT.innerHTML = '';
    
    try {
      await mountHeaderFooter(reportId);
    } catch (err) {
      console.error('[App] Errore critico mountHeaderFooter:', err);
      // Non bloccare il montaggio dei moduli anche se l'header fallisce
    }
    
    try {
      await mountModules(reportId);
    } catch (err) {
      console.error('[App] Errore critico mountModules:', err);
    }
    
    console.log('[App] Montaggio report completato');
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
