// /report/assets/js/components/asset-selector.js
// Widget Selezione Asset Live - Design Istituzionale
// Versione 2025

import Logger from '../utils/logger.js';

const ASSET_SELECTOR = {
  // ===== MOUNT =====
  mount(containerEl) {
    if (!containerEl) {
      Logger.error('AssetSelector', 'Container non fornito');
      return null;
    }

    const root = document.createElement('div');
    root.className = 'asset-selector';
    root.innerHTML = `
      <div class="asset-selector-header">
        <div class="asset-selector-title">Asset Live</div>
        <div class="asset-selector-subtitle">Seleziona un asset per visualizzare dati in tempo reale</div>
      </div>
      <div class="asset-selector-body">
        <div class="asset-selector-search">
          <input 
            type="text" 
            class="asset-selector-input" 
            id="asset-selector-input"
            placeholder="Cerca asset (es. AAPL, BTCUSD, EURUSD...)"
            autocomplete="off"
            aria-label="Cerca asset"
          />
          <div class="asset-selector-suggestions" id="asset-selector-suggestions" role="listbox" aria-label="Suggerimenti asset"></div>
        </div>
        <div class="asset-selector-actions">
          <button class="asset-selector-btn asset-selector-btn-primary" id="asset-selector-load" aria-label="Carica asset">
            Carica Asset
          </button>
          <button class="asset-selector-btn asset-selector-btn-secondary" id="asset-selector-clear" aria-label="Cancella selezione">
            Cancella
          </button>
        </div>
      </div>
      <div class="asset-selector-status" id="asset-selector-status" role="status" aria-live="polite"></div>
    `;

    containerEl.appendChild(root);

    // Bind eventi
    this._bindEvents(root);

    Logger.debug('AssetSelector', 'Widget montato');
    return root;
  },

  // ===== BIND EVENTS =====
  _bindEvents(root) {
    const input = root.querySelector('#asset-selector-input');
    const suggestions = root.querySelector('#asset-selector-suggestions');
    const loadBtn = root.querySelector('#asset-selector-load');
    const clearBtn = root.querySelector('#asset-selector-clear');
    const status = root.querySelector('#asset-selector-status');

    if (!input || !suggestions || !loadBtn || !clearBtn || !status) {
      Logger.error('AssetSelector', 'Elementi DOM non trovati');
      return;
    }

    let currentAsset = null;
    let suggestionTimeout = null;

    // Suggerimenti durante la digitazione
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toUpperCase();

      clearTimeout(suggestionTimeout);
      suggestions.innerHTML = '';
      suggestions.classList.remove('asset-selector-suggestions--visible');

      if (query.length < 2) {
        return;
      }

      suggestionTimeout = setTimeout(() => {
        this._showSuggestions(query, suggestions, input);
      }, 300);
    });

    // Selezione suggerimento
    suggestions.addEventListener('click', (e) => {
      const item = e.target.closest('.asset-selector-suggestion-item');
      if (item) {
        const symbol = item.dataset.symbol;
        input.value = symbol;
        suggestions.innerHTML = '';
        suggestions.classList.remove('asset-selector-suggestions--visible');
        input.focus();
      }
    });

    // Carica asset
    loadBtn.addEventListener('click', () => {
      const symbol = input.value.trim().toUpperCase();
      if (!symbol) {
        this._showStatus(status, 'Inserisci un simbolo asset', 'error');
        return;
      }

      this._loadAsset(symbol, status, loadBtn);
    });

    // Enter per caricare
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadBtn.click();
      } else if (e.key === 'Escape') {
        suggestions.innerHTML = '';
        suggestions.classList.remove('asset-selector-suggestions--visible');
      }
    });

    // Cancella selezione
    clearBtn.addEventListener('click', () => {
      input.value = '';
      suggestions.innerHTML = '';
      suggestions.classList.remove('asset-selector-suggestions--visible');
      currentAsset = null;
      this._showStatus(status, 'Selezione cancellata', 'info');
      this._emitAssetChange(null);
    });

    // Click fuori per chiudere suggerimenti
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) {
        suggestions.classList.remove('asset-selector-suggestions--visible');
      }
    });
  },

  // ===== SUGGESTIONS =====
  _showSuggestions(query, container, input) {
    // Lista asset comuni (può essere espansa o caricata da API)
    const commonAssets = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock' },
      { symbol: 'BTCUSD', name: 'Bitcoin', type: 'Crypto' },
      { symbol: 'ETHUSD', name: 'Ethereum', type: 'Crypto' },
      { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'Forex' },
      { symbol: 'GBPUSD', name: 'British Pound / US Dollar', type: 'Forex' },
      { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'Forex' },
      { symbol: 'SPX', name: 'S&P 500 Index', type: 'Index' },
      { symbol: 'DJI', name: 'Dow Jones Industrial Average', type: 'Index' },
      { symbol: 'NAS100', name: 'NASDAQ 100', type: 'Index' },
      { symbol: 'GOLD', name: 'Gold', type: 'Commodity' },
      { symbol: 'OIL', name: 'Crude Oil', type: 'Commodity' },
    ];

    const filtered = commonAssets
      .filter(
        (asset) =>
          asset.symbol.includes(query) || asset.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="asset-selector-suggestion-item asset-selector-suggestion-item--empty">
          Nessun risultato per "${query}"
        </div>
      `;
    } else {
      container.innerHTML = filtered
        .map(
          (asset) => `
        <div class="asset-selector-suggestion-item" data-symbol="${asset.symbol}" role="option">
          <div class="asset-selector-suggestion-symbol">${asset.symbol}</div>
          <div class="asset-selector-suggestion-name">${asset.name}</div>
          <div class="asset-selector-suggestion-type">${asset.type}</div>
        </div>
      `
        )
        .join('');
    }

    container.classList.add('asset-selector-suggestions--visible');
  },

  // ===== LOAD ASSET =====
  async _loadAsset(symbol, statusEl, loadBtn) {
    loadBtn.disabled = true;
    loadBtn.textContent = 'Caricamento...';
    this._showStatus(statusEl, `Caricamento ${symbol}...`, 'loading');

    try {
      // TODO: Integrare con API reale per dati asset
      // Per ora simuliamo un caricamento
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Emetti evento cambio asset
      this._emitAssetChange(symbol);
      this._showStatus(statusEl, `Asset ${symbol} caricato`, 'success');

      Logger.debug('AssetSelector', `Asset ${symbol} caricato`);
    } catch (error) {
      Logger.error('AssetSelector', `Errore caricamento asset ${symbol}`, error);
      this._showStatus(statusEl, `Errore caricamento ${symbol}`, 'error');
    } finally {
      loadBtn.disabled = false;
      loadBtn.textContent = 'Carica Asset';
    }
  },

  // ===== EMIT EVENT =====
  _emitAssetChange(symbol) {
    const event = new CustomEvent('asset-changed', {
      detail: { symbol },
      bubbles: true,
    });
    document.dispatchEvent(event);
  },

  // ===== STATUS =====
  _showStatus(statusEl, message, type = 'info') {
    if (!statusEl) {return;}

    statusEl.textContent = message;
    statusEl.className = `asset-selector-status asset-selector-status--${type}`;
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');

    // Rimuovi status dopo 5 secondi (tranne errori)
    if (type !== 'error') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'asset-selector-status';
      }, 5000);
    }
  },
};

export { ASSET_SELECTOR as assetSelector };
