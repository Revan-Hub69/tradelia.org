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

    // Priorità 2: Widget TradingView Ticker (se simbolo disponibile)
    if (symbol) {
      this._showTradingViewTicker(body, symbol, timestamp);
      return;
    }

    // Priorità 3: Cerca immagine statica nel report (solo se non c'è simbolo)
    if (reportId) {
      const imageUrl = `/report/reports/${reportId}/chart-snapshot.png`;
      const imageExists = await this._checkImageExists(imageUrl);
      
      if (imageExists) {
        this._showStaticChart(body, imageUrl, timestamp);
        return;
      }
    }

    // Fallback: nascondi completamente il widget se non ci sono dati
    root.style.display = 'none';
    Logger.debug('ChartWidget', 'Nessun dato disponibile, widget nascosto');
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

    // Gestione errore immagine: fallback a TradingView o nascondi
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Chart snapshot';
    img.className = 'chart-widget-static-image';
    img.loading = 'lazy';
    
    img.onerror = () => {
      // Se l'immagine non carica, nascondi il widget invece di mostrare errore
      const root = body.closest('.chart-widget');
      if (root) {
        root.style.display = 'none';
        Logger.debug('ChartWidget', 'Immagine chart non disponibile, widget nascosto');
      }
    };

    body.innerHTML = `
      <div class="chart-widget-static">
        <div class="chart-widget-static-image-container">
        </div>
        ${timestampText ? `
          <div class="chart-widget-static-timestamp">
            Snapshot: ${timestampText}
          </div>
        ` : ''}
      </div>
    `;

    // Aggiungi immagine al container
    const container = body.querySelector('.chart-widget-static-image-container');
    if (container) {
      container.appendChild(img);
    }

    Logger.debug('ChartWidget', `Chart statico caricato: ${imageUrl}`);
  },

  // ===== TRADINGVIEW TICKER =====
  _showTradingViewTicker(body, symbol, timestamp) {
    // Normalizza simbolo per TradingView
    // Es: AAPL -> NASDAQ:AAPL, BTCUSD -> BINANCE:BTCUSD
    const normalizedSymbol = this._normalizeSymbol(symbol);
    
    if (!normalizedSymbol) {
      // Se il simbolo non può essere normalizzato, nascondi il widget
      const root = body.closest('.chart-widget');
      if (root) {
        root.style.display = 'none';
      }
      Logger.warn('ChartWidget', `Simbolo non valido: ${symbol}`);
      return;
    }
    
    // Container per il widget TradingView
    const containerId = `tradingview-${Date.now()}`;
    body.innerHTML = `
      <div class="chart-widget-ticker">
        <!-- TradingView Widget BEGIN -->
        <div class="tradingview-widget-container" id="${containerId}">
          <div class="tradingview-widget-container__widget"></div>
        </div>
        <!-- TradingView Widget END -->
      </div>
    `;

    // Carica script TradingView con delay per evitare errori
    const container = document.getElementById(containerId);
    if (container) {
      setTimeout(() => {
        this._loadTradingViewAdvancedChart(container, normalizedSymbol);
      }, 200);
    }

    Logger.debug('ChartWidget', `TradingView chart caricato: ${normalizedSymbol}`);
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

  // ===== LOAD TRADINGVIEW ADVANCED CHART =====
  _loadTradingViewAdvancedChart(container, symbol) {
    if (!container) {
      Logger.error('ChartWidget', 'Container non fornito per TradingView widget');
      return;
    }

    const widgetContainer = container.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) {
      Logger.error('ChartWidget', 'Widget container non trovato');
      return;
    }

    // Rimuovi script esistente se presente
    const existingScript = document.getElementById('tradingview-chart-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Crea nuovo script per Advanced Chart
    const script = document.createElement('script');
    script.id = 'tradingview-chart-script';
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "D",
      "timezone": "Europe/Rome",
      "theme": "dark",
      "style": "1",
      "locale": "it",
      "backgroundColor": "transparent",
      "hide_side_toolbar": false,
      "allow_symbol_change": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    widgetContainer.appendChild(script);

    Logger.debug('ChartWidget', `TradingView Advanced Chart caricato per ${symbol}`);
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

