// Orchestrator - Esegue workflow completo automaticamente
// Ticker → Header → F1B → Output JSON

import { processF1BComplete } from './f1b-enhanced-complete.js';
import { saveCompleteReport, generateReportID } from './f1b-report-saver.js';

/**
 * Fetch dati completi ticker (prezzo + info azienda)
 */
async function fetchTickerFullData(ticker) {
  try {
    // Fetch da Yahoo Finance (free API)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const result = data.chart.result[0];
    
    if (!result || !result.meta) {
      throw new Error('Invalid data structure');
    }
    
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const currentPrice = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.previousClose;
    const changePct = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : null;
    
    // Fetch company info (se disponibile)
    const companyName = meta.longName || meta.shortName || ticker;
    const exchange = meta.exchangeName || meta.fullExchangeName || 'NASDAQ';
    const currency = meta.currency || 'USD';
    const sector = meta.sector || null;
    const industry = meta.industry || null;
    
    return {
      ticker: ticker,
      companyName: companyName,
      price: currentPrice,
      changePct: changePct,
      currency: currency,
      exchange: exchange,
      sector: sector,
      industry: industry,
      isin: null, // Non disponibile da Yahoo, lasciare null
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return {
      ticker: ticker,
      companyName: ticker,
      price: null,
      changePct: null,
      currency: 'USD',
      exchange: 'NASDAQ',
      sector: null,
      industry: null,
      isin: null
    };
  }
}

/**
 * Genera header.json completo per ticker (come formato esempio)
 * @param {string} ticker - Ticker symbol (es: "AAPL")
 * @param {Object} config - Configurazione
 * @returns {Promise<Object>} Header data completo
 */
export async function generateHeader(ticker, config = {}) {
  const reportID = config.reportID || generateReportID();
  const timestamp = new Date().toISOString();
  const startDate = config.startDate || new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = config.endDate || new Date().toISOString().split('T')[0];
  
  // Fetch dati completi ticker
  console.log(`  Fetching data for ${ticker}...`);
  const tickerData = await fetchTickerFullData(ticker);
  
  // Genera versione
  const version = `v${endDate.replace(/-/g, '.')}-rc1`;
  
  const header = {
    meta: {
      module: 'HEADER',
      version: version,
      auditPathId: `RPT-${endDate.replace(/-/g, '-')}-${ticker}-HEAD`,
      state: 'ACTIVE',
      generatedAt: timestamp,
      reportID: reportID,
      changes: [
        {
          timestamp: timestamp,
          version: version,
          changes: ['Header generato automaticamente']
        }
      ],
      moduleVersions: {
        header: '1.0.0',
        f1b: 'v19-Dynamic'
      }
    },
    
    rows: [
      {
        id: 'company-line',
        parts: [
          { kind: 'text', text: 'Report Framework Accademico AI, Tradelia Swing Master 5.0 su ' },
          { kind: 'metric', key: 'CompanyName', value: tickerData.companyName, tone: 'neutral', label: 'CompanyName' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Ticker: ' },
          { kind: 'metric', key: 'Ticker', value: ticker, tone: 'neutral', label: 'Ticker' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Borsa principale: ' },
          { kind: 'metric', key: 'Venue', value: tickerData.exchange, tone: 'neutral', label: 'Venue' },
          ...(tickerData.isin ? [
            { kind: 'text', text: '. ' },
            { kind: 'text', text: 'ISIN: ' },
            { kind: 'metric', key: 'ISIN', value: tickerData.isin, tone: 'neutral', label: 'ISIN' }
          ] : []),
          ...(tickerData.sector ? [
            { kind: 'text', text: '. ' },
            { kind: 'text', text: 'Settore: ' },
            { kind: 'metric', key: 'Sector', value: tickerData.sector, tone: 'neutral', label: 'Sector' },
            { kind: 'text', text: '.' }
          ] : [])
        ]
      },
      {
        id: 'price-line',
        parts: [
          { kind: 'text', text: 'Prezzo al momento dello start: ' },
          { kind: 'metric', key: 'Price', value: tickerData.price || '—', tone: tickerData.price ? 'ok' : 'neutral', label: 'Price' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Cambiamento di prezzo registrato dall\'ultima chiusura di mercato: ' },
          { kind: 'metric', key: 'ChangePct', value: tickerData.changePct ? `${tickerData.changePct > 0 ? '+' : ''}${tickerData.changePct.toFixed(2)}%` : '—%', tone: tickerData.changePct > 0 ? 'ok' : (tickerData.changePct < 0 ? 'err' : 'neutral'), label: 'ChangePct' },
          { kind: 'text', text: '.' }
        ]
      },
      {
        id: 'quality-line',
        parts: [
          { kind: 'text', text: 'Freshness dei dati: ' },
          { kind: 'metric', key: 'Freshness', value: '< 24h', tone: 'ok', label: 'Freshness' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Stato del report: ' },
          { kind: 'metric', key: 'State', value: 'ACTIVE', tone: 'ok', label: 'State' },
          { kind: 'text', text: '.' }
        ]
      },
      {
        id: 'window-line',
        parts: [
          { kind: 'text', text: 'Report iniziato il ' },
          { kind: 'metric', key: 'Start', value: startDate, tone: 'neutral', label: 'Start' },
          { kind: 'text', text: ' e concluso il ' },
          { kind: 'metric', key: 'End', value: endDate, tone: 'neutral', label: 'End' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Ultimo aggiornamento: ' },
          { kind: 'metric', key: 'UpdatedAt', value: timestamp, tone: 'neutral', label: 'UpdatedAt' },
          { kind: 'text', text: '. ' },
          { kind: 'text', text: 'Versione: ' },
          { kind: 'metric', key: 'Version', value: version, tone: 'neutral', label: 'Version' },
          { kind: 'text', text: '.' }
        ]
      }
    ],
    
    footer: {
      links: [
        {
          label: 'Scopri tutte le metriche',
          action: 'open-metrics-panel'
        }
      ]
    },
    
    metricsPanel: [
      { key: 'CompanyName', label: 'Nome azienda', value: tickerData.companyName, tone: 'neutral' },
      { key: 'Ticker', label: 'Ticker', value: ticker, tone: 'neutral' },
      { key: 'Venue', label: 'Borsa principale', value: tickerData.exchange, tone: 'neutral' },
      ...(tickerData.isin ? [{ key: 'ISIN', label: 'ISIN', value: tickerData.isin, tone: 'neutral' }] : []),
      ...(tickerData.sector ? [{ key: 'Sector', label: 'Settore', value: tickerData.sector, tone: 'neutral' }] : []),
      { key: 'Price', label: 'Prezzo allo start', value: tickerData.price || '—', tone: tickerData.price ? 'ok' : 'neutral' },
      { key: 'ChangePct', label: 'Variazione dall\'ultima chiusura', value: tickerData.changePct ? `${tickerData.changePct > 0 ? '+' : ''}${tickerData.changePct.toFixed(2)}%` : '—%', tone: tickerData.changePct > 0 ? 'ok' : (tickerData.changePct < 0 ? 'err' : 'neutral') },
      { key: 'Freshness', label: 'Freshness dei dati', value: '< 24h', tone: 'ok' },
      { key: 'State', label: 'Stato del report', value: 'ACTIVE', tone: 'ok' },
      { key: 'Start', label: 'Inizio report', value: startDate, tone: 'neutral' },
      { key: 'End', label: 'Fine report', value: endDate, tone: 'neutral' },
      { key: 'UpdatedAt', label: 'Ultimo aggiornamento', value: timestamp, tone: 'neutral' },
      { key: 'Version', label: 'Versione del report', value: version, tone: 'neutral' }
    ]
  };
  
  return header;
}


/**
 * Aggiorna header con timestamp e versione
 */
export function updateHeaderVersion(header, changes = []) {
  const timestamp = new Date().toISOString();
  const currentVersion = header.meta?.version || '1.0.0';
  
  // Incrementa patch version
  const versionParts = currentVersion.split('.');
  const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;
  
  header.meta = {
    ...header.meta,
    version: newVersion,
    lastUpdated: timestamp,
    changes: [
      ...(header.meta?.changes || []),
      {
        timestamp: timestamp,
        version: newVersion,
        changes: changes.length > 0 ? changes : ['Automatic update']
      }
    ]
  };
  
  header.UpdatedAt = timestamp;
  
  return header;
}

/**
 * Workflow completo: Ticker → Header → F1B → Save
 * @param {string} ticker - Ticker symbol
 * @param {Object} config - Configurazione
 * @returns {Promise<Object>} Complete report
 */
export async function executeFullWorkflow(ticker, config = {}) {
  const reportID = config.reportID || generateReportID();
  const timestamp = new Date().toISOString();
  
  console.log(`🚀 Starting workflow for ticker: ${ticker}`);
  console.log(`📋 Report ID: ${reportID}\n`);
  
  try {
    // Step 1: Genera Header
    console.log(`📊 Step 1: Generating header for ${ticker}...`);
    const header = await generateHeader(ticker, {
      ...config,
      reportID: reportID
    });
    
    // Step 2: Esegui F1B (automatico, senza intervento umano)
    console.log(`\n📊 Step 2: Executing F1B (automatic)...`);
    const f1bOutput = await processF1BComplete({
      saveReport: false,  // Salveremo tutto insieme
      reportID: reportID,
      ...config
    });
    
    // Step 3: Aggiorna header con info F1B (versioning)
    const f1bStrategyMode = f1bOutput.f1bSnapshot?.regime_state?.StrategyMode_macro || 'N/A';
    const f1bRegimeScore = f1bOutput.f1bSnapshot?.regime_state?.RegimeScore || 'N/A';
    
    updateHeaderVersion(header, [
      `F1B processed: StrategyMode=${f1bStrategyMode}, RegimeScore=${f1bRegimeScore}`,
      `F1B version: ${f1bOutput.meta?.moduleVersion || 'v19-Dynamic'}`
    ]);
    
    // Step 4: Salva tutto
    console.log(`\n💾 Step 3: Saving reports...`);
    
    const basePath = config.basePath || '../../report';
    const reportPath = `${basePath}/reports/${reportID}`;
    
    // Salva header.json
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Crea directory
      await fs.mkdir(path.resolve(reportPath), { recursive: true });
      
      // Salva header.json
      await fs.writeFile(
        path.resolve(`${reportPath}/header.json`),
        JSON.stringify(header, null, 2),
        'utf8'
      );
      console.log(`✅ Header salvato: ${reportPath}/header.json`);
      
      // Salva f1b.json
      await fs.writeFile(
        path.resolve(`${reportPath}/f1b.json`),
        JSON.stringify(f1bOutput, null, 2),
        'utf8'
      );
      console.log(`✅ F1B salvato: ${reportPath}/f1b.json`);
      
      // Salva manifest.json
      const manifest = {
        reportID: reportID,
        ticker: ticker,
        timestamp: timestamp,
        modules: ['Header', 'F1B'],
        versions: {
          header: header.meta.version,
          f1b: f1bOutput.meta?.moduleVersion || 'v19-Dynamic'
        },
        changes: header.meta.changes
      };
      
      await fs.writeFile(
        path.resolve(`${reportPath}/manifest.json`),
        JSON.stringify(manifest, null, 2),
        'utf8'
      );
      console.log(`✅ Manifest salvato: ${reportPath}/manifest.json`);
    } else {
      // Browser: download files
      console.log('Browser mode: files would be downloaded');
    }
    
    console.log(`\n✅ Workflow completato!`);
    console.log(`📁 Report salvato in: reports/${reportID}/`);
    
    return {
      reportID: reportID,
      ticker: ticker,
      header: header,
      f1b: f1bOutput,
      reportPath: reportPath
    };
    
  } catch (error) {
    console.error('❌ Errore workflow:', error);
    throw error;
  }
}

/**
 * Esempio utilizzo
 */
export async function example() {
  // Esegui tutto automaticamente per un ticker
  const result = await executeFullWorkflow('AAPL', {
    saveReport: true
  });
  
  console.log('Report completo:', result);
  return result;
}

