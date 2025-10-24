// /report/assets/js/app.js
// Orchestratore principale del Report Runtime Tradelia
// - carica i dati JSON (header, F1..F6, manifest, glossary)
// - renderizza i moduli F1 / F2 / F3 / F4 / F5 / F5B / F6 dentro i contenitori giusti
// - popola l'header hero (ticker, prezzo, metriche qualità dati)
// - espone mountReport(reportId) su window.Tradelia
// - espone headerData e glossary su window.Tradelia
//
// Dipendenze lato pagina:
//   - index.html definisce window.Tradelia.mountTarget = { F1:'#mod-f1', ..., F6:'#mod-f6' }
//   - index.html ha i contenitori (#mod-f1, #mod-f2, ecc.)
//   - index.html include già Tailwind, lucide, ecc.
//   - bootstrap-inline.js chiamerà window.Tradelia.mountReport(...)
//     e poi farà footer, tooltip metriche ecc.
//
// Dipendenze lato filesystem (convenzione):
//   /report/reports/<reportId>/header.json
//   /report/reports/<reportId>/manifest.json        (opzionale)
//   /report/reports/<reportId>/F1.json
//   /report/reports/<reportId>/F2.json
//   /report/reports/<reportId>/F3.json
//   /report/reports/<reportId>/F4.json
//   /report/reports/<reportId>/F5.json
//   /report/reports/<reportId>/F5B.json             (validazione LT)
//   /report/reports/<reportId>/F6.json              (broker selezionati)
//
//   /report/assets/js/modules/f1.js     (o f1b.js se variante F1B, ecc.)
//   /report/assets/js/modules/f2.js
//   /report/assets/js/modules/f3.js
//   /report/assets/js/modules/f4.js
//   /report/assets/js/modules/f5.js
//   /report/assets/js/modules/f5b.js
//   /report/assets/js/modules/f6.js
//
//   /report/assets/glossary.json        (descrizioni metriche per i "?" info-btn)

(() => {

  // -------------------------------------------------
  // Fetch JSON helper (robusta, con gestione errori)
  // -------------------------------------------------
  async function loadJSON(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
      return await res.json();
    } catch (err) {
      console.error(`loadJSON fallita per ${url}:`, err);
      return null;
    }
  }

  // -------------------------------------------------
  // Paths per un dato reportId
  // -------------------------------------------------
  function resolvePaths(reportId) {
    const base = `/report/reports/${encodeURIComponent(reportId)}`;
    return {
      base,
      header:   `${base}/header.json`,
      manifest: `${base}/manifest.json`,
      F1:       `${base}/F1.json`,
      F2:       `${base}/F2.json`,
      F3:       `${base}/F3.json`,
      F4:       `${base}/F4.json`,
      F5:       `${base}/F5.json`,
      F5B:      `${base}/F5B.json`,  // validazione LT
      F6:       `${base}/F6.json`    // broker selezionati
    };
  }

  // -------------------------------------------------
  // Determina ordine e mapping moduli dal manifest
  // Il manifest può contenere:
  // {
  //   "order": ["F1","F2","F4","F3","F5","F5B","F6"],
  //   "modules": { "F1":"F1B", ... }  // override chiavi / varianti
  // }
  //
  // Se manca, usiamo default istituzionale 2026.
  // -------------------------------------------------
  function normalizeManifest(manifest) {
    const defaultOrder = ["F1","F2","F4","F3","F5","F5B","F6"];
    if (!manifest || typeof manifest !== 'object') {
      return {
        order: defaultOrder,
        modulesMap: {} // nessun override
      };
    }
    const order = Array.isArray(manifest.order) && manifest.order.length
      ? manifest.order.slice()
      : defaultOrder.slice();

    const modulesMap = (manifest.modules && typeof manifest.modules === 'object')
      ? { ...manifest.modules }
      : {};

    return { order, modulesMap };
  }

  // -------------------------------------------------
  // F1 può avere varianti (F1, F1A, F1B...)
  // Regola:
  // - Se manifest.modules.F1 è settato (es. "F1B"), usiamo quella
  // - Altrimenti se headerData.F1Variant esiste, usiamo quella
  // - Altrimenti "F1"
  // -------------------------------------------------
  function resolveF1Variant(modulesMap, headerData) {
    if (modulesMap && modulesMap.F1) {
      return modulesMap.F1;
    }
    if (headerData && headerData.F1Variant) {
      return headerData.F1Variant; // tipo "F1B"
    }
    return "F1";
  }

  // -------------------------------------------------
  // Restituisce il path JSON per un certo blocco logico
  // Nota: se F1 effettiva è "F1B", i dati li leggiamo comunque da F1.json
  // perché tipicamente header/F1.json contiene i dati base settore/regime.
  // Se in futuro ogni variante ha il suo JSON separato, qui è dove gestirlo.
  // -------------------------------------------------
  function resolveDataPath(paths, keyLogical) {
    switch (keyLogical.toUpperCase()) {
      case "F1":
      case "F1A":
      case "F1B":
        return paths.F1;
      case "F2":
        return paths.F2;
      case "F3":
        return paths.F3;
      case "F4":
        return paths.F4;
      case "F5":
        return paths.F5;
      case "F5B":
        return paths.F5B;
      case "F6":
        return paths.F6;
      default:
        return null;
    }
  }

  // -------------------------------------------------
  // Restituisce il file JS del modulo da importare dinamicamente
  // (renderer + binder)
  // -------------------------------------------------
  function resolveModuleFile(keyLogical) {
    // normalizziamo in upper per coerenza
    const k = keyLogical.toUpperCase();
    switch (k) {
      case "F1":   return "/report/assets/js/modules/f1.js";
      case "F1A":  return "/report/assets/js/modules/f1a.js";
      case "F1B":  return "/report/assets/js/modules/f1b.js";
      case "F2":   return "/report/assets/js/modules/f2.js";
      case "F3":   return "/report/assets/js/modules/f3.js";
      case "F4":   return "/report/assets/js/modules/f4.js";
      case "F5":   return "/report/assets/js/modules/f5.js";
      case "F5B":  return "/report/assets/js/modules/f5b.js";
      case "F6":   return "/report/assets/js/modules/f6.js";
      default:     return null;
    }
  }

  // -------------------------------------------------
  // Svuota stato "is-loading" su un nodo appena popolato
  // -------------------------------------------------
  function clearLoadingState(node) {
    if (!node) return;
    node.classList.remove('is-loading');
  }

  // -------------------------------------------------
  // Aggiorna HERO (ticker, venue, prezzo, stato ecc.)
  // headerData atteso qualcosa tipo:
  // {
  //   "Ticker": "AAPL",
  //   "Venue": "NASDAQ",
  //   "Price": 227.15,
  //   "ChangePct": -1.23,   // in %
  //   "Currency": "USD",
  //   "State": "ACTIVE",    // ACTIVE / REVIEW / HOLD ...
  //   "Start": "2025-10-01",
  //   "End": "2025-10-24",
  //   "FreshnessLabel": "T-0",
  //   "ConfidenceFinal": "High" (oppure numero tipo 0.78)
  //   ...
  // }
  //
  // Se alcuni campi mancano, mettiamo "—".
  // -------------------------------------------------
  function updateHero(headerData) {
    if (!headerData || typeof headerData !== 'object') return;

    // Grab elementi
    const elTicker      = document.getElementById('hero-ticker');
    const elVenue       = document.getElementById('hero-venue');
    const elPrice       = document.getElementById('hero-price');
    const elChange      = document.getElementById('hero-change');
    const elState       = document.getElementById('hero-state');

    const elStart       = document.getElementById('hero-start');
    const elEnd         = document.getElementById('hero-end');
    const elPrice2      = document.getElementById('hero-price2');
    const elChange2     = document.getElementById('hero-change2');
    const elCcy         = document.getElementById('hero-ccy');
    const elFresh       = document.getElementById('hero-freshness');
    const elConf        = document.getElementById('hero-confidence');

    // tonebars
    const tbSnap        = document.getElementById('tone-snap');
    const tbPrice       = document.getElementById('tone-price');
    const tbChg         = document.getElementById('tone-chg');
    const tbCcy         = document.getElementById('tone-ccy');
    const tbFresh       = document.getElementById('tone-fresh');
    const tbConf        = document.getElementById('tone-conf');

    // Helpers di formattazione
    function fmtNum(v, dec = 2) {
      if (v === null || v === undefined || v === '') return '—';
      const n = Number(v);
      if (Number.isNaN(n)) return String(v);
      return n.toLocaleString('en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
      });
    }

    function fmtPct(v, dec = 2) {
      if (v === null || v === undefined || v === '') return '—';
      const n = Number(v);
      if (Number.isNaN(n)) return String(v);
      const sign = n > 0 ? '+' : '';
      return sign + n.toFixed(dec) + '%';
    }

    function toneForChange(valPct) {
      const n = Number(valPct);
      if (Number.isNaN(n)) return 'var(--tone-n)';
      if (n > 0) return 'var(--tone-g)';
      if (n < 0) return 'var(--tone-r)';
      return 'var(--tone-n)';
    }

    function toneForConfidence(val) {
      // Se abbiamo numerico [0..1]
      if (val === null || val === undefined) return 'var(--tone-n)';
      const num = Number(val);
      if (!Number.isNaN(num)) {
        if (num >= 0.7) return 'var(--tone-g)';
        if (num >= 0.4) return 'var(--tone-y)';
        return 'var(--tone-r)';
      }
      // Se è stringa tipo "High" / "Medium" / "Low"
      const s = String(val).toLowerCase();
      if (s.includes('high') || s.includes('alta')) return 'var(--tone-g)';
      if (s.includes('med')) return 'var(--tone-y)';
      if (s.includes('low') || s.includes('bassa')) return 'var(--tone-r)';
      return 'var(--tone-n)';
    }

    function toneNeutral() {
      return 'var(--tone-n)';
    }

    // Dati base
    const ticker     = headerData.Ticker        || '—';
    const venue      = headerData.Venue         || '—';
    const price      = headerData.Price;
    const chgPct     = headerData.ChangePct;
    const currency   = headerData.Currency      || '—';
    const stateLabel = headerData.State         || '—';

    const startLbl   = headerData.Start         || '—';
    const endLbl     = headerData.End           || '—';
    const freshLbl   = headerData.FreshnessLabel || headerData.Freshness || '—';
    const confLbl    = headerData.ConfidenceFinal !== undefined
      ? headerData.ConfidenceFinal
      : '—';

    // Aggiorna hero top
    if (elTicker) elTicker.textContent = ticker;
    if (elVenue)  elVenue.textContent  = venue;

    if (elPrice)  elPrice.textContent  = fmtNum(price, 2);
    if (elPrice2) elPrice2.textContent = fmtNum(price, 2);

    if (elChange) {
      elChange.textContent = fmtPct(chgPct, 2);
      elChange.classList.remove('chg--up','chg--down');
      if (Number(chgPct) > 0)  elChange.classList.add('chg--up');
      if (Number(chgPct) < 0)  elChange.classList.add('chg--down');
    }
    if (elChange2) {
      elChange2.textContent = fmtPct(chgPct, 2);
    }

    if (elState)  elState.textContent  = stateLabel;
    if (elCcy)    elCcy.textContent    = currency;
    if (elStart)  elStart.textContent  = startLbl;
    if (elEnd)    elEnd.textContent    = endLbl;
    if (elFresh)  elFresh.textContent  = freshLbl;
    if (elConf)   elConf.textContent   = String(confLbl);

    // Tonebars
    const toneChg  = toneForChange(chgPct);
    const toneConf = toneForConfidence(confLbl);

    if (tbSnap)  tbSnap.style.background  = toneNeutral();
    if (tbPrice) tbPrice.style.background = toneNeutral();
    if (tbChg)   tbChg.style.background   = toneChg;
    if (tbCcy)   tbCcy.style.background   = toneNeutral();
    if (tbFresh) tbFresh.style.background = toneNeutral();
    if (tbConf)  tbConf.style.background  = toneConf;
  }

  // -------------------------------------------------
  // Context passato ai moduli (F1B, F4, F6, ecc.)
  // I moduli lo usano per aprire il drawer con dettagli.
  // -------------------------------------------------
  function buildModuleContext() {
    function openDrawerFromModule({ title, subtitle, html, blocking=false }) {
      const drawer      = document.getElementById('drawer');
      const drawerTitle = document.getElementById('drawer-title');
      const drawerSub   = document.getElementById('drawer-subtitle');
      const drawerBody  = document.getElementById('drawer-content');

      if (!drawer) return;
      drawer.setAttribute('aria-hidden','false');
      drawer.setAttribute('data-blocking', blocking ? 'true':'false');

      const span = drawerTitle?.querySelector('span');
      if (span) span.textContent = title || 'Dettagli';

      if (drawerSub)  drawerSub.textContent = subtitle || '—';
      if (drawerBody) drawerBody.innerHTML  = html || '';

      if (blocking) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
    }

    return {
      openDrawer: openDrawerFromModule
    };
  }

  // -------------------------------------------------
  // Monta un singolo modulo (F1, F2, ..., F6)
  // - Carica dinamicamente il JS del modulo (renderCard/bindCard)
  // - Renderizza l'HTML nel target corretto
  // - Chiama bindCard per wiring azioni (drawer, ecc.)
  // -------------------------------------------------
  async function mountModule(keyLogical, data, ctx) {
    if (!data) return;

    const moduleFile = resolveModuleFile(keyLogical);
    if (!moduleFile) {
      console.warn(`Nessun file modulo noto per ${keyLogical}`);
      return;
    }

    // Target DOM da window.Tradelia.mountTarget
    const targetSel  = window.Tradelia?.mountTarget?.[keyLogical] ||
                       window.Tradelia?.mountTarget?.[keyLogical.toUpperCase()];
    if (!targetSel) {
      console.warn(`Nessun mountTarget per ${keyLogical}`);
      return;
    }
    const targetNode = document.querySelector(targetSel);
    if (!targetNode) {
      console.warn(`Container DOM mancante (${targetSel}) per ${keyLogical}`);
      return;
    }

    // import dinamico del modulo renderer/binder
    let mod;
    try {
      mod = await import(moduleFile);
    } catch (err) {
      console.error(`Import modulo ${keyLogical} da ${moduleFile} fallito:`, err);
      return;
    }

    // renderCard -> string HTML
    if (typeof mod.renderCard === 'function') {
      // alcuni moduli (tipo F1B Strategy Terminal) accettano param ctx come {featured,...}
      // qui gli passiamo solo info base. Se serve di più, i moduli lo ignorano o gestiscono.
      const html = mod.renderCard(data, { title: keyLogical });
      if (html !== undefined && html !== null) {
        targetNode.innerHTML = html;
      }
    }

    // bindCard per eventi (openDrawer, ecc.)
    if (typeof mod.bindCard === 'function') {
      try {
        mod.bindCard(targetNode, data, ctx);
      } catch (err) {
        console.error(`bindCard errore per ${keyLogical}:`, err);
      }
    }

    clearLoadingState(targetNode);

    // caso speciale F3:
    // se il modulo F3 fornisce anche tiles top/bottom, potremmo popolarli qui.
    // in questa versione base non forziamo nulla:
    //  - se il modulo esporta updateTiles(topIds,bottomIds) lo chiamiamo.
    if (keyLogical.toUpperCase() === 'F3' && typeof mod.updateTiles === 'function') {
      try {
        // ipotizziamo che updateTiles sappia trovare #f3-tiles-top / bottom da solo
        mod.updateTiles(data, ctx);
      } catch (err) {
        console.warn('updateTiles(F3) errore:', err);
      }
    }
  }

  // -------------------------------------------------
  // Funzione pubblica: mountReport(reportId)
  // Questa è quella chiamata da bootstrap-inline.js
  // -------------------------------------------------
  async function mountReport(reportId) {

    // 1. Risolviamo tutti i path file
    const paths = resolvePaths(reportId);

    // 2. Carichiamo header.json (dati hero, metadati report)
    const headerData = await loadJSON(paths.header);
    window.Tradelia.headerData = headerData || {};

    // 3. Carichiamo il manifest (ordine moduli / override varianti)
    const manifestData = await loadJSON(paths.manifest);
    const { order, modulesMap } = normalizeManifest(manifestData);

    // 4. Carichiamo il glossario metriche (tooltip "?" ecc.)
    const glossaryData = await loadJSON('/report/assets/glossary.json');
    if (glossaryData) {
      window.Tradelia.glossary = glossaryData;
    }

    // 5. Decidiamo quale F1 effettiva usare (F1 / F1B...)
    const resolvedF1 = resolveF1Variant(modulesMap, headerData);

    // 6. Aggiorna hero con i dati header.json
    updateHero(headerData);

    // 7. Costruiamo il contesto (per drawer ecc.)
    const ctx = buildModuleContext();

    // 8. Loop sui moduli nell'ordine stabilito dal manifest
    //    NB: se nel manifest.modules esiste un override tipo { "F1":"F1B" },
    //    vogliamo montare "F1B" (quindi la card F1B) ma i dati vengono dal JSON F1.json.
    for (const logicalKey of order) {

      // Determina la chiave effettiva da montare (es. "F1B" invece di "F1")
      let keyToLoad = logicalKey;
      if (logicalKey.toUpperCase() === 'F1') {
        keyToLoad = resolvedF1; // es. "F1B"
      } else if (modulesMap && modulesMap[logicalKey]) {
        keyToLoad = modulesMap[logicalKey];
      }

      // Path dati JSON per quel blocco
      const dataPath = resolveDataPath(paths, keyToLoad);
      if (!dataPath) {
        console.warn(`Nessun dataPath per ${keyToLoad} (logical ${logicalKey})`);
        continue;
      }

      // Carica dati blocco (F1/F2/.../F6)
      const data = await loadJSON(dataPath);
      if (!data) {
        console.warn(`Dati mancanti per ${keyToLoad} da ${dataPath}`);
        continue;
      }

      // Monta modulo
      await mountModule(keyToLoad, data, ctx);
    }

    // 9. Fine. Il resto (footer, tooltip, icone lucide) viene gestito da bootstrap-inline.js
  }

  // -------------------------------------------------
  // Espone la funzione pubblica su window.Tradelia
  // -------------------------------------------------
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.mountReport = mountReport;
  // headerData / glossary vengono riempiti runtime in mountReport()

})();
