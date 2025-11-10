// /report/assets/js/components/chart-widget.js
// Widget Chart - Screenshot statico o TradingView Ticker
// Versione 2025

import Logger from '../utils/logger.js';

const CHART_WIDGET = {
  // ===== MOUNT =====
  mount(containerEl, options = {}) {
    if (!containerEl) {
      Logger.error('ChartWidget', 'Container non fornito');
      return null;
    }

    const root = document.createElement('div');
    root.className = 'chart-widget';
    root.innerHTML = `
      <div class="chart-widget-header">
        <div class="chart-widget-title">Price Chart</div>
        <div class="chart-widget-subtitle" id="chart-widget-subtitle">Snapshot al momento del report</div>
      </div>
      <div class="chart-widget-body" id="chart-widget-body">
        <div class="chart-widget-loading">Caricamento chart...</div>
      </div>
    `;

    containerEl.appendChild(root);
    
    // Carica chart
    this._loadChart(root, options);
    
    Logger.debug('ChartWidget', 'Widget montato');
    return root;
  },

  // ===== LOAD CHART =====
  async _loadChart(root, options = {}) {
    const body = root.querySelector('#chart-widget-body');
    const subtitle = root.querySelector('#chart-widget-subtitle');
    
    if (!body) return;

    const { 
      reportId = null, 
      symbol = null, 
      timestamp = null,
      chartImageUrl = null 
    } = options;

    // Priorità 1: Immagine statica se fornita
    if (chartImageUrl) {
      this._showStaticChart(body, chartImageUrl, timestamp);
      return;
    }

    // Priorità 2: Cerca immagine statica nel report
    if (reportId) {
      const imageUrl = `/report/reports/${reportId}/chart-snapshot.png`;
      const imageExists = await this._checkImageExists(imageUrl);
      
      if (imageExists) {
        this._showStaticChart(body, imageUrl, timestamp);
        return;
      }
    }

    // Priorità 3: Widget TradingView Ticker
    if (symbol) {
      this._showTradingViewTicker(body, symbol, timestamp);
      return;
    }

    // Fallback: messaggio
    body.innerHTML = `
      <div class="chart-widget-empty">
        <div class="chart-widget-empty-icon">📊</div>
        <div class="chart-widget-empty-text">Chart non disponibile</div>
        <div class="chart-widget-empty-subtext">Inserisci un simbolo per visualizzare il ticker</div>
      </div>
    `;
  },

  // ===== STATIC CHART =====
  _showStaticChart(body, imageUrl, timestamp) {
    const timestampText = timestamp 
      ? new Date(timestamp).toLocaleString('it-IT', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : '';

    body.innerHTML = `
      <div class="chart-widget-static">
        <div class="chart-widget-static-image-container">
          <img 
            src="${imageUrl}" 
            alt="Chart snapshot" 
            class="chart-widget-static-image"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'chart-widget-error\\'>Errore caricamento immagine chart</div>'"
          />
        </div>
        ${timestampText ? `
          <div class="chart-widget-static-timestamp">
            Snapshot: ${timestampText}
          </div>
        ` : ''}
      </div>
    `;

    Logger.debug('ChartWidget', `Chart statico caricato: ${imageUrl}`);
  },

  // ===== TRADINGVIEW TICKER =====
  _showTradingViewTicker(body, symbol, timestamp) {
    // Normalizza simbolo per TradingView
    // Es: AAPL -> NASDAQ:AAPL, BTCUSD -> BINANCE:BTCUSD
    const normalizedSymbol = this._normalizeSymbol(symbol);
    
    body.innerHTML = `
      <div class="chart-widget-ticker">
        <!-- TradingView Widget BEGIN -->
        <div class="tradingview-widget-container">
          <div class="tradingview-widget-container__widget"></div>
          <div class="tradingview-widget-copyright">
            <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
              <span class="blue-text">TradingView</span>
            </a>
          </div>
        </div>
        <!-- TradingView Widget END -->
      </div>
    `;

    // Carica script TradingView
    this._loadTradingViewScript(normalizedSymbol);

    Logger.debug('ChartWidget', `TradingView ticker caricato: ${normalizedSymbol}`);
  },

  // ===== NORMALIZE SYMBOL =====
  _normalizeSymbol(symbol) {
    if (!symbol) return symbol;
    
    const upperSymbol = symbol.toUpperCase();
    
    // Stock USA (NASDAQ/NYSE)
    const nasdaqStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    const nyseStocks = ['JPM', 'BAC', 'WMT', 'JNJ', 'V', 'MA', 'PG', 'HD'];
    
    if (nasdaqStocks.includes(upperSymbol)) {
      return `NASDAQ:${upperSymbol}`;
    }
    if (nyseStocks.includes(upperSymbol)) {
      return `NYSE:${upperSymbol}`;
    }
    
    // Crypto
    if (upperSymbol.includes('BTC') || upperSymbol.includes('ETH')) {
      if (upperSymbol.includes('USD')) {
        return `BINANCE:${upperSymbol}`;
      }
      return `BINANCE:${upperSymbol}USD`;
    }
    
    // Forex
    if (upperSymbol.includes('EUR') || upperSymbol.includes('GBP') || upperSymbol.includes('USD') || upperSymbol.includes('JPY')) {
      return `FX:${upperSymbol}`;
    }
    
    // Default: prova NASDAQ
    return `NASDAQ:${upperSymbol}`;
  },

  // ===== LOAD TRADINGVIEW SCRIPT =====
  _loadTradingViewScript(symbol) {
    // Rimuovi script esistente se presente
    const existingScript = document.getElementById('tradingview-ticker-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Crea nuovo script
    const script = document.createElement('script');
    script.id = 'tradingview-ticker-script';
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": "auto",
      "locale": "it",
      "dateRange": "1D",
      "colorTheme": "dark",
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    });

    document.body.appendChild(script);

    Logger.debug('ChartWidget', `TradingView script caricato per ${symbol}`);
  },

  // ===== CHECK IMAGE EXISTS =====
  async _checkImageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (err) {
      return false;
    }
  },

  // ===== UPDATE =====
  update(node, options = {}) {
    if (!node) {
      Logger.error('ChartWidget', 'Node non fornito');
      return;
    }

    const body = node.querySelector('#chart-widget-body');
    if (!body) return;

    this._loadChart(node, options);
  }
};

export { CHART_WIDGET as chartWidget };

