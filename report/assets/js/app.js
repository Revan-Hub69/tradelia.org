// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI - Versione 3.0 (DA ZERO, senza runtime)
// - Carica header.json e monta HeaderTicker
// - Carica manifest.json e monta moduli F*
// - Nessun runtime complesso
// - Solo metriche colorate inline

import Logger from './utils/logger.js';
import { metricPopup } from './components/metric-popup.js';
import { reportNavigation } from './components/report-navigation.js';
import { userPreferences } from './utils/user-preferences.js';
import { i18n } from './utils/i18n.js';
import {
  getFrameworkInfo,
  formatFrameworkTitle,
  formatFrameworkDescription,
} from './utils/frameworks.js';
import { supabase, getSignedChartUrl } from './supabase-client.js';

(function () {
  'use strict';

  const ROOT = document.getElementById('app-root');
  const MODULES_CONTAINER = document.getElementById('report-modules-container') || ROOT;
  const TICKER_SLOT = document.getElementById('header-ticker-slot');
  const CHART_SLOT = document.getElementById('chart-slot');
  const MARKET_CONTEXT_SNAPSHOT_SLOT = document.getElementById('market-context-snapshot-slot');
  const HEADER_SLOT = document.getElementById('site-header-slot');
  const FOOTER_SLOT = document.getElementById('site-footer-slot');
  const INDEX_SLOT = document.getElementById('report-index-slot');
  const BREADCRUMB_SLOT = document.getElementById('report-breadcrumb-slot');
  const SEARCH_SLOT = document.getElementById('report-search-slot');
  const NAVIGATION_CONTAINER = document.getElementById('report-navigation-container');

  if (!ROOT || !TICKER_SLOT) {
    Logger.error('App', 'DOM non valido');
    return;
  }

  const DEFAULT_MODULE_ORDER = [
    'header',
    'f1',
    'f1b',
    'f2',
    'f3',
    'f3o',
    'f4',
    'f5',
    'f5o',
    'f5lt',
  ];
  let __versionQS = '';
  let __header = null;
  let __reportRecord = null;
  let __moduleRecords = [];
  let __moduleMap = {};
  window.__tradeliaReportContext = window.__tradeliaReportContext || {};

  // ===== ERROR STATES =====
  function showErrorState(container, error, title = null) {
    const errorTitle = title || i18n.t('error.loading');
    const message = error?.message || i18n.t('error.temporary');
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-title">${escapeHtml(errorTitle)}</div>
        <div class="error-state-message">${escapeHtml(message)}</div>
        <button class="btn btn-sm" onclick="location.reload()">${i18n.t('error.reload')}</button>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (str == null) {return '';}
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  // ===== UTILITIES =====
  async function fetchJSON(path, options = {}) {
    const { silent = false } = options;
    try {
      const url = path + __versionQS;
      Logger.debug('App', `Fetching: ${url}`);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        // 404 è normale quando un file non esiste (modulo opzionale)
        if (res.status === 404 && silent) {
          throw new Error(`HTTP ${res.status}: ${path}`);
        }
        throw new Error(`HTTP ${res.status}: ${path}`);
      }
      const data = await res.json();
      if (!data || typeof data !== 'object') {throw new Error(`Invalid JSON: ${path}`);}
      return data;
    } catch (err) {
      // Log come errore solo se non è silenzioso (moduli opzionali)
      if (!silent) {
        Logger.error('App', `Errore fetch ${path}`, err);
      } else {
        Logger.debug('App', `File non trovato (normale): ${path}`);
      }
      throw err;
    }
  }

  async function safeImport(path) {
    try {
      return await import(path + __versionQS);
    } catch (err) {
      Logger.error('App', `Errore import ${path}`, err);
      throw err;
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) {el.textContent = val ?? '—';}
  }

  function fmtDate(str) {
    if (!str) {return '—';}
    try {
      return new Date(str).toLocaleDateString('it-IT');
    } catch {
      return String(str);
    }
  }

  function getReportId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'sample-id';
  }

  // ===== META TAGS DINAMICI =====
  function updateMetaTags(ticker, companyName, version, frameworkType) {
    const info = getFrameworkInfo(frameworkType);
    const title = formatFrameworkTitle(frameworkType, ticker || companyName);
    const description = `${info.description} · Caso studio: ${companyName || ticker}. Versione framework: ${version || 'N/D'}.`;
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const imageUrl = `${window.location.origin}/img/tradelia_og_vC_white_clean.png`;
    const imageAlt = `${companyName} (${ticker}) - Analisi Tradelia AI`;

    // Update title
    document.title = title;

    // Update meta description (ottimizzato per AI)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {metaDesc.content = description;}

    // Update keywords
    updateMetaName(
      'keywords',
      `Tradelia AI, ${ticker}, ${companyName}, analisi finanziaria, report finanziario, analisi tecnica, analisi fondamentale, trading, investimenti`
    );

    // Update Open Graph
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:url', url);
    updateMetaProperty('og:image', imageUrl);
    updateMetaProperty('og:image:alt', imageAlt);
    updateMetaProperty('og:type', 'article');

    // Update Twitter Card
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:url', url);
    updateMetaName('twitter:image', imageUrl);
    updateMetaName('twitter:image:alt', imageAlt);

    // Update structured data (FinancialProduct)
    updateFinancialProductStructuredData(
      ticker,
      companyName,
      description,
      url,
      version,
      frameworkType
    );
  }

  // ===== UPDATE FINANCIAL PRODUCT STRUCTURED DATA =====
  function updateFinancialProductStructuredData(
    ticker,
    companyName,
    description,
    url,
    version,
    frameworkType
  ) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: formatFrameworkTitle(frameworkType, ticker || companyName),
      description: description,
      provider: {
        '@type': 'Organization',
        name: 'Tradelia AI',
        url: 'https://tradelia.org',
      },
      tickerSymbol: ticker,
      url: url,
      datePublished: new Date().toISOString(),
      category: 'Financial Analysis',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
    };

    // Rimuovi structured data esistente
    const existing = document.querySelector('script[type="application/ld+json"]#structured-data');
    if (existing) {
      existing.remove();
    }

    // Inietta nuovo structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
  }

  function updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  function updateMetaName(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  // ===== STRUCTURED DATA DINAMICO =====
  function updateStructuredData(ticker, companyName, version, start, end, frameworkType) {
    const structuredDataScript = document.getElementById('structured-data');
    if (!structuredDataScript) {return;}

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'FinancialProduct',
      name: formatFrameworkTitle(frameworkType, ticker || companyName),
      description: formatFrameworkDescription(frameworkType, companyName, ticker),
      provider: {
        '@type': 'Organization',
        name: 'Tradelia AI',
        url: 'https://tradelia.org',
      },
      additionalType: 'https://schema.org/InvestmentOrDeposit',
      category: 'Analisi Finanziaria',
      applicationCategory: 'FinanceApplication',
      version: version || undefined,
      ...(start && end
        ? {
            validFrom: start,
            validThrough: end,
          }
        : {}),
    };

    structuredDataScript.textContent = JSON.stringify(structuredData, null, 2);
  }

  // ===== HEADER TICKER =====
  async function mountHeaderTicker(headerData) {
    if (!headerData || typeof headerData !== 'object') {
      showErrorState(TICKER_SLOT, new Error('Dati header non validi'), 'Dati non disponibili');
      return;
    }

    try {
      const { headerTicker } = await safeImport('/report/assets/js/components/header-ticker.js');

      if (!headerTicker || typeof headerTicker.mount !== 'function') {
        throw new Error('headerTicker.mount non disponibile');
      }

      const node = headerTicker.mount(TICKER_SLOT);
      if (!node) {
        throw new Error('headerTicker.mount ha restituito null');
      }

      await headerTicker.update(node, headerData);
      Logger.debug('App', 'Header ticker montato');
    } catch (err) {
      Logger.error('App', 'Errore montaggio header ticker', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento metriche');
    }
  }

  // ===== CARICAMENTO HEADER =====
  async function loadHeader() {
    try {
      const header = getModuleContent('header');
      if (!header) {
        throw new Error('Modulo header non disponibile');
      }

      const hasRows = Array.isArray(header?.rows) && header.rows.length > 0;
      const hasLegacy = header?.Ticker || header?.CompanyName;
      if (!hasRows && !hasLegacy) {
        throw new Error('Header senza dati validi');
      }

      __header = header;

      const extractMetric = (key) => {
        for (const row of header.rows || []) {
          for (const part of row.parts || []) {
            if (part.kind === 'metric' && part.key === key) {
              return part.value;
            }
          }
        }
        return null;
      };

      const companyName = extractMetric('CompanyName');
      const ticker = extractMetric('Ticker');
      const version = extractMetric('Version') || header?.meta?.version || '—';
      const start = extractMetric('Start');
      const end = extractMetric('End');

      __versionQS = version && version !== '—' ? `?v=${encodeURIComponent(version)}` : '';

      const frameworkType = __reportRecord?.report_type;

      if (ticker) {
        document.title = formatFrameworkTitle(frameworkType, ticker);
        updateMetaTags(ticker, companyName || ticker, version, frameworkType);
        updateStructuredData(ticker, companyName || ticker, version, start, end, frameworkType);
      }

      await mountHeaderTicker(header);

      if (FOOTER_SLOT && window.__TradeliaFooter) {
        window.__TradeliaFooter.update(header);
      }
      Logger.debug('App', 'Header caricato');
      return header;
    } catch (err) {
      Logger.error('App', 'Errore caricamento header', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento dati');
      return null;
    }
  }

  // ===== CARICAMENTO MODULI =====
  async function loadModules() {
    const modulePathMap = {
      header: { js: 'header', skip: true },
      f3o: { js: 'f3o', label: 'F3O' },
      f5o: { js: 'f5o', label: 'F5O' },
      f5lt: { js: 'f5lt', label: 'F5-LT+' },
    };

    const sorted = [...__moduleRecords]
      .filter((record) => record.module_key !== 'header')
      .sort((a, b) => {
        const orderA = resolveModuleOrder(a);
        const orderB = resolveModuleOrder(b);
        return orderA - orderB;
      });

    const modulesInfo = [];
    let loadedCount = 0;
    const totalModules = sorted.length;

    for (const record of sorted) {
      const key = record.module_key;
      const mapping = modulePathMap[key] || {};
      const jsModuleName = mapping.js || key.replace(/[^a-z0-9]/g, '');
      const modPath = `/report/assets/js/modules/${jsModuleName}.js`;

      const json = record.content;
      if (
        !json ||
        typeof json !== 'object' ||
        Object.keys(json).length === 0 ||
        json._placeholder
      ) {
        Logger.debug('App', `Modulo ${key}: contenuto vuoto, salto`);
        continue;
      }

      let mod;
      try {
        mod = await safeImport(modPath);
      } catch (modErr) {
        Logger.warn('App', `Modulo ${modPath} non trovato, uso placeholder`, modErr);
        const placeholderModule = await safeImport('/report/assets/js/modules/_placeholder.js');
        mod = placeholderModule;
      }

      if (typeof mod.renderCard !== 'function') {
        Logger.warn('App', `Modulo ${key}: renderCard non disponibile, uso placeholder`);
        const placeholderModule = await safeImport('/report/assets/js/modules/_placeholder.js');
        mod = placeholderModule;
      }

      const modId = mapping.label || key.toUpperCase();
      const cardHTML = mod.renderCard(json, {
        reportId: __reportRecord?.slug,
        modId,
        header: __header,
      });
      const wrap = document.createElement('article');
      wrap.id = `sec-${jsModuleName}`;
      wrap.className = 'report-section-block mb-8';
      wrap.innerHTML = cardHTML;
      MODULES_CONTAINER.appendChild(wrap);

      const moduleInfo = {
        id: `sec-${jsModuleName}`,
        badge: json?.ui_labels?.badge || modId,
        title: json?.ui_labels?.hero_title || json?.meta?.module || modId,
        desc: json?.ui_labels?.hero_desc || json?.meta?.hero_intro || '',
        status: json?.meta?.moduleStatus || 'ACTIVE',
        isActive: false,
      };
      modulesInfo.push(moduleInfo);

      if (typeof mod.bindCard === 'function') {
        try {
          mod.bindCard(wrap, json, { reportId: __reportRecord?.slug, modId, header: __header });
        } catch (bindErr) {
          Logger.warn('App', `Modulo ${key}: errore bindCard`, bindErr);
        }
      }

      if (typeof metricPopup?.init === 'function') {
        metricPopup.init(wrap);
      }

      loadedCount++;
      Logger.debug('App', `Modulo ${key} montato (${loadedCount}/${totalModules})`);
    }

    initializeNavigation(modulesInfo);
  }

  function resolveModuleOrder(record) {
    const index = DEFAULT_MODULE_ORDER.indexOf(record.module_key);
    const fallback = index >= 0 ? (index + 1) * 10 : 1000;
    return typeof record.order_index === 'number' ? record.order_index : fallback;
  }

  function initializeNavigation(modulesInfo) {
    if (modulesInfo.length > 0 && (INDEX_SLOT || BREADCRUMB_SLOT || SEARCH_SLOT)) {
      try {
        reportNavigation.init({
          modules: modulesInfo,
          indexContainer: INDEX_SLOT,
          breadcrumbContainer: BREADCRUMB_SLOT,
          searchContainer: SEARCH_SLOT,
        });

        if (NAVIGATION_CONTAINER) {
          NAVIGATION_CONTAINER.style.display = 'block';
        }

        Logger.debug('App', 'Navigazione inizializzata', { modulesCount: modulesInfo.length });
      } catch (err) {
        Logger.warn('App', 'Errore inizializzazione navigazione', err);
      }
    }
  }

  // ===== MOUNT HEADER & FOOTER =====
  async function mountSiteHeader(options = {}) {
    if (!HEADER_SLOT) {
      Logger.warn('App', 'Header slot non trovato, skip');
      return;
    }

    try {
      const { siteHeader } = await safeImport('/report/assets/js/components/site-header.js');
      if (siteHeader && typeof siteHeader.mount === 'function') {
        siteHeader.mount(HEADER_SLOT, { showExport: true, ...options });
        Logger.debug('App', 'Site header montato');
      }
    } catch (err) {
      Logger.warn('App', 'Errore montaggio site header', err);
    }
  }

  async function mountSiteFooter(headerData) {
    if (!FOOTER_SLOT) {
      Logger.warn('App', 'Footer slot non trovato, skip');
      return;
    }

    try {
      const { siteFooter } = await safeImport('/report/assets/js/components/site-footer.js');
      if (siteFooter && typeof siteFooter.mount === 'function') {
        siteFooter.mount(FOOTER_SLOT);
        // Aggiorna footer con dati da header.json
        if (headerData) {
          siteFooter.update(headerData);
        }
        Logger.debug('App', 'Site footer montato');
      }
    } catch (err) {
      Logger.warn('App', 'Errore montaggio site footer', err);
    }
  }

  // ===== INIZIALIZZAZIONE =====
  let _isInitializing = false;
  let _isInitialized = false;

  async function init() {
    // Evita inizializzazioni multiple
    if (_isInitializing) {
      Logger.warn('App', 'Inizializzazione già in corso, ignoro chiamata duplicata');
      return;
    }

    if (_isInitialized) {
      Logger.warn('App', 'App già inizializzata, ignoro chiamata duplicata');
      return;
    }

    _isInitializing = true;
    const reportId = getReportId();
    Logger.debug('App', `Inizializzazione: ${reportId}`);

    // Pulisci TUTTI i container prima di iniziare (evita duplicati)
    if (TICKER_SLOT) {TICKER_SLOT.innerHTML = '';}
    if (MARKET_CONTEXT_SNAPSHOT_SLOT) {MARKET_CONTEXT_SNAPSHOT_SLOT.innerHTML = '';}
    if (CHART_SLOT) {CHART_SLOT.innerHTML = '';}
    if (MODULES_CONTAINER) {
      MODULES_CONTAINER.innerHTML = '';
    } else if (ROOT) {
      ROOT.innerHTML = '';
    }

    // Monta header (statico, non dipende da reportId)
    await mountSiteHeader();

    try {
      const bundle = await fetchReportBundle(reportId);
      __reportRecord = bundle.report;
      const { normalized, map } = buildModuleState(bundle.modules);
      __moduleRecords = normalized;
      __moduleMap = map;
      window.__tradeliaReportContext.report = __reportRecord;
      window.dispatchEvent(
        new CustomEvent('tradelia:reportLoaded', { detail: { report: __reportRecord } })
      );
    } catch (err) {
      Logger.error('App', 'Report non disponibile', err);
      showErrorState(ROOT, err, 'Report non disponibile');
      _isInitializing = false;
      return;
    }

    // Error boundary globale per inizializzazione
    let headerData = null;
    try {
      headerData = await loadHeader();
    } catch (err) {
      Logger.error('App', 'Errore loadHeader', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento header');
      // Continua comunque con i moduli
    }

    // Monta market context snapshot (subito dopo header ticker, prima del chart)
    await mountMarketContextSnapshot();

    // Monta chart widget (dopo market context snapshot, prima dei moduli)
    await mountChartWidget(headerData);

    // Carica moduli (dopo chart e market context snapshot)
    try {
      await loadModules();
    } catch (err) {
      Logger.error('App', 'Errore loadModules', err);
      // Se container è vuoto, mostra errore globale
      const container = MODULES_CONTAINER || ROOT;
      if (!container.innerHTML) {
        showErrorState(container, err, 'Errore caricamento moduli');
      }
    }

    // Monta footer DOPO il contenuto (con dati dinamici)
    await mountSiteFooter(headerData);

    _isInitializing = false;
    _isInitialized = true;
    Logger.debug('App', 'Inizializzazione completata');
  }

  // ===== MOUNT CHART WIDGET =====
  async function mountChartWidget(headerData) {
    if (!CHART_SLOT) {
      Logger.warn('App', 'Chart slot non trovato');
      return;
    }

    // Pulisci container prima di montare (evita duplicati)
    CHART_SLOT.innerHTML = '';

    try {
      const { chartWidget } = await safeImport('/report/assets/js/components/chart-widget.js');

      if (!chartWidget || typeof chartWidget.mount !== 'function') {
        throw new Error('chartWidget.mount non disponibile');
      }

      // Estrai simbolo da headerData
      let symbol = null;
      if (headerData && headerData.rows) {
        Logger.debug('App', 'HeaderData rows:', headerData.rows.length);
        for (const row of headerData.rows) {
          for (const part of row.parts || []) {
            if (part.kind === 'metric' && part.key === 'Ticker') {
              symbol = part.value;
              Logger.debug('App', `Ticker estratto: ${symbol}`);
              break;
            }
          }
          if (symbol) {break;}
        }
      } else {
        Logger.warn('App', 'headerData o headerData.rows non disponibile');
      }

      if (!symbol) {
        Logger.warn('App', 'Ticker non trovato in headerData. Chart widget non sarà mostrato.');
        // Mostra messaggio informativo invece di nascondere
        CHART_SLOT.innerHTML = `
          <div style="padding: var(--sp-4); text-align: center; color: var(--muted); font-size: var(--fs-12);">
            Chart non disponibile: Ticker non trovato nel report header
          </div>
        `;
        return;
      }

      const timestamp =
        headerData?.meta?.timestamp ||
        headerData?.meta?.created_at ||
        headerData?.meta?.UpdatedAt ||
        null;

      const reportSlug = __reportRecord?.slug;
      let chartImageUrl = null;
      if (__reportRecord?.chart_path) {
        if (/^https?:\/\//i.test(__reportRecord.chart_path)) {
          chartImageUrl = __reportRecord.chart_path;
        } else {
          chartImageUrl = await getSignedChartUrl(__reportRecord.chart_path);
        }
      }

      Logger.debug(
        'App',
        `Montaggio chart widget: reportId=${reportSlug}, symbol=${symbol}, timestamp=${timestamp}`
      );

      const node = chartWidget.mount(CHART_SLOT, {
        reportId: reportSlug,
        symbol,
        timestamp,
        chartImageUrl,
      });

      if (!node) {
        throw new Error('chartWidget.mount ha restituito null');
      }

      // Salva istanza globalmente per aggiornamenti
      window.chartWidgetInstance = {
        node: node,
        update: chartWidget.update.bind(chartWidget),
      };

      Logger.debug('App', `Chart widget montato con successo per ${symbol}`);
    } catch (err) {
      Logger.error('App', 'Errore montaggio chart widget', err);
      if (CHART_SLOT) {
        CHART_SLOT.innerHTML = `
          <div class="error-state">
            <div class="error-state-title">Errore caricamento chart</div>
            <div class="error-state-message">${escapeHtml(err.message)}</div>
          </div>
        `;
      }
    }
  }

  async function fetchReportBundle(slug) {
    const { data: report, error } = await supabase
      .from('reports')
      .select(
        'id, slug, title, status, report_type, chart_path, notes, created_at, updated_at, published_at'
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !report) {
      Logger.warn('App', `Report ${slug} non trovato su Supabase, provo fallback legacy`);
      const legacy = await fetchLegacyBundle(slug);
      if (legacy) {return legacy;}
      throw new Error('Report non trovato o non pubblicato');
    }

    const { data: modules, error: modulesError } = await supabase
      .from('report_modules')
      .select('module_key, content, order_index')
      .eq('report_id', report.id)
      .order('order_index', { ascending: true, nullsFirst: true });

    if (modulesError) {
      throw modulesError;
    }

    return {
      report,
      modules: Array.isArray(modules) ? modules : [],
    };
  }

  async function fetchLegacyBundle(slug) {
    try {
      const manifest = await fetchJSON(`/report/reports/${slug}/manifest.json`, { silent: true });
      const legacyOrder =
        Array.isArray(manifest?.order) && manifest.order.length
          ? manifest.order
          : ['HEADER', 'F1', 'F1B', 'F2', 'F3', 'F3O', 'F4', 'F5', 'F5O', 'F5-LT+'];

      const modules = [];
      const moduleMap = {
        HEADER: { json: 'header' },
        'F5-LT+': { json: 'f5-lt+' },
        F5O: { json: 'f5o' },
        F3O: { json: 'f3o' },
      };

      for (let index = 0; index < legacyOrder.length; index++) {
        const modId = String(legacyOrder[index]);
        const normalized = modId.toLowerCase();
        const mapEntry = moduleMap[modId] || {};
        const jsonName = mapEntry.json || normalized;
        const moduleKey = normalized.replace(/[^a-z0-9]/g, '');

        try {
          const jsonData = await fetchJSON(`/report/reports/${slug}/${jsonName}.json`, {
            silent: true,
          });
          if (!jsonData || Object.keys(jsonData).length === 0) {continue;}
          modules.push({
            module_key: moduleKey,
            order_index: (index + 1) * 10,
            content: jsonData,
          });
        } catch (err) {
          Logger.debug('App', `Modulo legacy ${modId} non trovato`, err);
          continue;
        }
      }

      if (!modules.length) {
        return null;
      }

      return {
        report: {
          id: slug,
          slug,
          status: 'legacy',
          report_type: 'legacy',
          chart_path: null,
          published_at: null,
          updated_at: null,
          created_at: null,
        },
        modules,
      };
    } catch (err) {
      Logger.warn('App', `Fallback legacy fallito per ${slug}`, err);
      return null;
    }
  }

  function normalizeModuleRecord(record) {
    if (!record || !record.module_key) {return null;}
    const moduleKey = String(record.module_key).toLowerCase();
    let content = record.content ?? {};
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (err) {
        Logger.warn('App', `JSON modulo ${moduleKey} non valido`, err);
        content = {};
      }
    }
    return {
      module_key: moduleKey,
      order_index: record.order_index,
      content,
    };
  }

  function buildModuleState(records) {
    const normalized = [];
    const map = {};
    for (const rec of records) {
      const norm = normalizeModuleRecord(rec);
      if (!norm) {continue;}
      normalized.push(norm);
      map[norm.module_key] = norm.content;
    }
    return { normalized, map };
  }

  function getModuleContent(moduleKey) {
    if (!moduleKey) {return null;}
    return __moduleMap[moduleKey.toLowerCase()] || null;
  }

  // ===== MOUNT MARKET CONTEXT SNAPSHOT =====
  async function mountMarketContextSnapshot() {
    if (!MARKET_CONTEXT_SNAPSHOT_SLOT) {
      Logger.warn('App', 'Market context snapshot slot non trovato');
      return;
    }

    // Pulisci container prima di montare (evita duplicati)
    MARKET_CONTEXT_SNAPSHOT_SLOT.innerHTML = '';

    try {
      const { marketContextSnapshot } = await safeImport(
        '/report/assets/js/components/market-context-snapshot.js'
      );

      if (!marketContextSnapshot || typeof marketContextSnapshot.mount !== 'function') {
        throw new Error('marketContextSnapshot.mount non disponibile');
      }

      // Carica dati F1B per estrarre RegimeScore
      let regimeScore = null;
      let strategyMode = null;
      let timestamp = null;

      const f1bData = getModuleContent('f1b');
      if (f1bData) {
        Logger.debug('App', 'F1B dati ricevuti, chiavi:', Object.keys(f1bData || {}));

        if (f1bData?.regime_and_risk?.RegimeScore) {
          const scoreData = f1bData.regime_and_risk.RegimeScore;
          const scoreStr = scoreData?.raw || scoreData;
          if (typeof scoreStr === 'string') {
            regimeScore = parseFloat(scoreStr.replace(/[+\s]/g, '')) || null;
          } else if (typeof scoreStr === 'number') {
            regimeScore = scoreStr;
          }
          Logger.debug(
            'App',
            `RegimeScore estratto da regime_and_risk: ${scoreStr} -> ${regimeScore}`
          );
        } else if (f1bData?.f1bSnapshot?.regime_state?.RegimeScore) {
          const scoreData = f1bData.f1bSnapshot.regime_state.RegimeScore;
          regimeScore = typeof scoreData === 'number' ? scoreData : parseFloat(scoreData) || null;
          Logger.debug('App', `RegimeScore estratto da f1bSnapshot: ${regimeScore}`);
        } else if (f1bData?.RegimeScore != null) {
          regimeScore =
            typeof f1bData.RegimeScore === 'number'
              ? f1bData.RegimeScore
              : parseFloat(String(f1bData.RegimeScore).replace(/[+\s]/g, '')) || null;
        } else {
          Logger.warn('App', 'RegimeScore non trovato in F1B', {
            hasRegimeAndRisk: !!f1bData?.regime_and_risk,
            hasF1bSnapshot: !!f1bData?.f1bSnapshot,
            keys: Object.keys(f1bData || {}),
          });
        }

        if (f1bData?.regime_and_risk?.StrategyMode_macro) {
          const modeData = f1bData.regime_and_risk.StrategyMode_macro;
          strategyMode = modeData?.raw || modeData;
        } else if (f1bData?.f1bSnapshot?.regime_state?.StrategyMode_macro) {
          strategyMode = f1bData.f1bSnapshot.regime_state.StrategyMode_macro;
        }

        timestamp =
          f1bData?.meta?.timestampET ||
          f1bData?.meta?.timestamp ||
          f1bData?.meta?.created_at ||
          f1bData?.timestamp ||
          null;

        Logger.debug(
          'App',
          `F1B dati finali: RegimeScore=${regimeScore}, StrategyMode=${strategyMode}, timestamp=${timestamp}`
        );
      } else {
        Logger.warn('App', 'Modulo F1B non disponibile per market context snapshot');
      }

      const node = marketContextSnapshot.mount(MARKET_CONTEXT_SNAPSHOT_SLOT, {
        regimeScore: regimeScore,
        strategyMode: strategyMode,
        timestamp: timestamp,
      });

      if (!node) {
        throw new Error('marketContextSnapshot.mount ha restituito null');
      }

      Logger.debug('App', `Market context snapshot montato: RegimeScore=${regimeScore}`);
    } catch (err) {
      Logger.error('App', 'Errore montaggio market context snapshot', err);
      // Non mostrare errore, semplicemente non mostrare il widget
      if (MARKET_CONTEXT_SNAPSHOT_SLOT) {
        MARKET_CONTEXT_SNAPSHOT_SLOT.innerHTML = '';
      }
    }
  }

  // ===== AVVIO =====
  // Sistema traduzione disabilitato - sempre italiano
  // i18n.init(); // Disabilitato
  userPreferences.applyToDOM();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===== EXPOSE UI API =====
  window.__TradeliaUI = {
    openMetricPopup: (metricKey, allMetrics = []) => {
      metricPopup.open(metricKey, allMetrics);
    },
    closeMetricPopup: () => {
      metricPopup.close();
    },
    bindMetricInfoButtons: (container) => {
      // Trova tutti i pulsanti info-btn con data-metric e collega al glossario
      if (!container) {return;}

      const infoButtons = container.querySelectorAll('.info-btn[data-metric]');
      infoButtons.forEach((btn) => {
        // Rimuovi listener esistenti per evitare duplicati
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();

          const metricKey = newBtn.getAttribute('data-metric');
          if (!metricKey) {return;}

          // Rimuovi suffisso "_info" se presente
          const cleanKey = metricKey.replace(/_info$/, '');

          // Apri drawer glossario (stesso sistema di glossario.html)
          try {
            const { glossaryPopup } = await import('./components/glossary-popup.js');
            if (glossaryPopup && glossaryPopup.openTerm) {
              await glossaryPopup.openTerm(cleanKey);
            }
          } catch (err) {
            Logger.warn('App', 'Errore apertura drawer glossario', err);
          }
        });
      });

      Logger.debug('App', `Collegati ${infoButtons.length} pulsanti metriche al glossario`);
    },
  };

  window.TradeliaApp = {
    init,
    getReportId,
    loadHeader,
    loadModules,
  };
})();
