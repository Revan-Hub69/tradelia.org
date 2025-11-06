// /report/assets/js/components/glossary-embedded.js
// Componente glossario embedded per metric-popup
// Design coerente con glossario.html ma senza header/footer sito

import Logger from '../utils/logger.js';

const GLOSSARY = {
  _container: null,
  _panel: null,
  _data: null,
  _backCallback: null,
  _isMounted: false,
};

// ===== UTILITIES =====
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== DATA LOADING =====
async function loadGlossaryData() {
  if (GLOSSARY._data) return GLOSSARY._data;
  
  try {
    // Prova prima il glossario completo, poi fallback a quello report
    let res = await fetch('/glossario.json', { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    }
    
    if (res.ok) {
      GLOSSARY._data = await res.json();
      Logger.debug('GlossaryEmbedded', 'Glossario caricato');
      return GLOSSARY._data;
    }
  } catch (err) {
    Logger.warn('GlossaryEmbedded', 'Errore caricamento glossario', err);
  }
  
  GLOSSARY._data = {};
  return GLOSSARY._data;
}

// ===== RENDERING =====
function renderGlossary() {
  if (!GLOSSARY._container || !GLOSSARY._data) return;
  
  const data = GLOSSARY._data;
  const terms = Object.entries(data).filter(([key]) => !key.startsWith('_'));
  
  // Filtri dinamici
  const universi = [...new Set(terms.map(([, term]) => term.universo || term.category).filter(Boolean))];
  const difficolta = [...new Set(terms.map(([, term]) => term.difficolta).filter(Boolean))];
  
  GLOSSARY._container.innerHTML = `
    <header class="glossary-embedded-header">
      <div class="glossary-embedded-header-content">
        <h2 class="glossary-embedded-title">Glossario Finanziario</h2>
        <p class="glossary-embedded-subtitle">${terms.length} termini disponibili</p>
      </div>
      <button class="glossary-embedded-back" aria-label="Torna indietro" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Torna indietro
      </button>
    </header>
    
    <div class="glossary-embedded-body">
      <!-- Search -->
      <div class="glossary-embedded-search">
        <div class="glossary-embedded-search-wrapper">
          <svg class="glossary-embedded-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            id="glossary-embedded-search-input" 
            class="glossary-embedded-search-input" 
            placeholder="Cerca un termine..."
            aria-label="Cerca nel glossario"
          />
        </div>
      </div>
      
      <!-- Filters -->
      <div class="glossary-embedded-filters">
        <div class="glossary-embedded-filter-group">
          <label class="glossary-embedded-filter-label">Universo</label>
          <div class="glossary-embedded-filter-buttons" data-filter="universo">
            <button class="glossary-embedded-filter-btn active" data-value="all" type="button">Tutti</button>
            ${universi.map(u => `
              <button class="glossary-embedded-filter-btn" data-value="${escapeHtml(u)}" type="button">${escapeHtml(u)}</button>
            `).join('')}
          </div>
        </div>
        
        <div class="glossary-embedded-filter-group">
          <label class="glossary-embedded-filter-label">Difficoltà</label>
          <div class="glossary-embedded-filter-buttons" data-filter="difficolta">
            <button class="glossary-embedded-filter-btn active" data-value="all" type="button">Tutte</button>
            ${difficolta.map(d => `
              <button class="glossary-embedded-filter-btn" data-value="${escapeHtml(d)}" type="button">${escapeHtml(d)}</button>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- Terms List -->
      <div class="glossary-embedded-stats">
        <span id="glossary-embedded-stats-text">${terms.length} termini</span>
      </div>
      
      <div id="glossary-embedded-terms" class="glossary-embedded-terms">
        ${renderTermsList(terms)}
      </div>
    </div>
    
    <!-- Term Popup (reutilizzo design glossario) -->
    <div id="glossary-embedded-popup-overlay" class="glossary-popup-overlay" hidden>
      <div class="glossary-popup-panel">
        <!-- Popup content verrà inserito qui dinamicamente -->
      </div>
    </div>
  `;
  
  // Event listeners
  setupEventListeners();
}

function renderTermsList(terms) {
  if (!terms || terms.length === 0) {
    return `
      <div class="glossary-embedded-empty">
        <div class="glossary-embedded-empty-title">Nessun termine trovato</div>
        <div class="glossary-embedded-empty-text">Prova a modificare i filtri o la ricerca</div>
      </div>
    `;
  }
  
  return terms
    .map(([key, term]) => {
      const title = term.nomeTecnico || term.title || key;
      const universo = term.universo || term.category;
      
      return `
        <button class="glossary-embedded-term-item" data-key="${escapeHtml(key)}" type="button">
          <div class="glossary-embedded-term-content">
            <h3 class="glossary-embedded-term-title">${escapeHtml(title)}</h3>
            <div class="glossary-embedded-term-badges">
              ${universo ? `
                <span class="glossary-embedded-term-badge glossary-embedded-term-badge--universo">${escapeHtml(universo)}</span>
              ` : ''}
              ${term.difficolta ? `
                <span class="glossary-embedded-term-badge glossary-embedded-term-badge--difficolta ${term.difficolta.toLowerCase()}">${escapeHtml(term.difficolta)}</span>
              ` : ''}
            </div>
          </div>
          <svg class="glossary-embedded-term-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      `;
    })
    .join('');
}

function setupEventListeners() {
  // Back button
  const backBtn = GLOSSARY._container.querySelector('.glossary-embedded-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (GLOSSARY._backCallback) GLOSSARY._backCallback();
    });
  }
  
  // Search
  const searchInput = GLOSSARY._container.querySelector('#glossary-embedded-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterTerms);
  }
  
  // Filter buttons
  const filterButtons = GLOSSARY._container.querySelectorAll('.glossary-embedded-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.glossary-embedded-filter-buttons');
      group.querySelectorAll('.glossary-embedded-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTerms();
    });
  });
  
  // Term items
  const termItems = GLOSSARY._container.querySelectorAll('.glossary-embedded-term-item');
  termItems.forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.key;
      openTermPopup(key);
    });
  });
}

function filterTerms() {
  if (!GLOSSARY._data || !GLOSSARY._container) return;
  
  const searchQuery = GLOSSARY._container.querySelector('#glossary-embedded-search-input')?.value.toLowerCase().trim() || '';
  
  const universoFilter = GLOSSARY._container.querySelector('[data-filter="universo"] .glossary-embedded-filter-btn.active')?.dataset.value || 'all';
  const difficoltaFilter = GLOSSARY._container.querySelector('[data-filter="difficolta"] .glossary-embedded-filter-btn.active')?.dataset.value || 'all';
  
  const terms = Object.entries(GLOSSARY._data).filter(([key, term]) => {
    if (key.startsWith('_')) return false;
    
    // Filtro universo
    if (universoFilter !== 'all') {
      const termUniverso = term.universo || term.category;
      if (termUniverso !== universoFilter) return false;
    }
    
    // Filtro difficoltà
    if (difficoltaFilter !== 'all') {
      if (term.difficolta !== difficoltaFilter) return false;
    }
    
    // Filtro ricerca
    if (searchQuery) {
      const searchable = [
        key.toLowerCase(),
        term.nomeTecnico?.toLowerCase() || term.title?.toLowerCase() || '',
        term.definizioneAccademica?.toLowerCase() || term.what?.toLowerCase() || '',
        term.spiegazioneAI?.toLowerCase() || term.how?.toLowerCase() || '',
        term.universo?.toLowerCase() || term.category?.toLowerCase() || '',
        term.difficolta?.toLowerCase() || ''
      ].join(' ');
      
      if (!searchable.includes(searchQuery)) return false;
    }
    
    return true;
  });
  
  // Render filtered terms
  const termsContainer = GLOSSARY._container.querySelector('#glossary-embedded-terms');
  if (termsContainer) {
    termsContainer.innerHTML = renderTermsList(terms);
    
    // Re-attach event listeners
    const termItems = termsContainer.querySelectorAll('.glossary-embedded-term-item');
    termItems.forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.key;
        openTermPopup(key);
      });
    });
  }
  
  // Update stats
  const statsText = GLOSSARY._container.querySelector('#glossary-embedded-stats-text');
  if (statsText) {
    const total = Object.keys(GLOSSARY._data).filter(k => !k.startsWith('_')).length;
    statsText.textContent = terms.length === total 
      ? `${total} termini` 
      : `Mostrando ${terms.length} di ${total} termini`;
  }
}

function openTermPopup(key) {
  if (!GLOSSARY._data || !key) return;
  
  const term = GLOSSARY._data[key];
  if (!term) return;
  
  const overlay = GLOSSARY._container.querySelector('#glossary-embedded-popup-overlay');
  const panel = overlay.querySelector('.glossary-popup-panel');
  
  if (!overlay || !panel) return;
  
  const title = term.nomeTecnico || term.title || key;
  const universo = term.universo || term.category;
  
  panel.innerHTML = `
    <header class="glossary-popup-header">
      <div class="glossary-popup-header-content">
        <h2 class="glossary-popup-title">${escapeHtml(title)}</h2>
        <div class="glossary-popup-badges">
          ${universo ? `
            <span class="glossary-popup-badge glossary-popup-badge--universo">${escapeHtml(universo)}</span>
          ` : ''}
          ${term.difficolta ? `
            <span class="glossary-popup-badge glossary-popup-badge--difficolta ${term.difficolta.toLowerCase()}">${escapeHtml(term.difficolta)}</span>
          ` : ''}
        </div>
      </div>
      <button class="glossary-popup-close" aria-label="Chiudi" type="button">×</button>
    </header>
    <div class="glossary-popup-body">
      ${term.definizioneAccademica ? `
        <div class="glossary-popup-section">
          <h3 class="glossary-popup-section-title">Definizione Accademica</h3>
          <p class="glossary-popup-section-text">${escapeHtml(term.definizioneAccademica)}</p>
        </div>
      ` : ''}
      
      ${term.spiegazioneAI ? `
        <div class="glossary-popup-section">
          <h3 class="glossary-popup-section-title">Spiegazione AI</h3>
          <p class="glossary-popup-section-text">${escapeHtml(term.spiegazioneAI)}</p>
        </div>
      ` : ''}
      
      ${term.fonteAccademica ? `
        <div class="glossary-popup-source">
          <strong>Fonte:</strong> ${escapeHtml(term.fonteAccademica)}
        </div>
      ` : term.source ? `
        <div class="glossary-popup-source">
          <strong>Fonte:</strong> ${escapeHtml(term.source)}
        </div>
      ` : ''}
    </div>
    <footer class="glossary-popup-footer">
      <button class="glossary-popup-close-bottom" type="button">Chiudi</button>
    </footer>
  `;
  
  // Close handlers
  const closeBtn = panel.querySelector('.glossary-popup-close');
  const closeBtnBottom = panel.querySelector('.glossary-popup-close-bottom');
  
  const closePopup = () => {
    overlay.hidden = true;
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (closeBtnBottom) closeBtnBottom.addEventListener('click', closePopup);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
  
  // ESC gestito dal popup parent (overlay-manager), non gestire qui per evitare conflitti
  
  overlay.hidden = false;
  // Overflow gestito dal popup/drawer parent (non gestire qui)
}

// ===== PUBLIC API =====
async function mount(panel, backCallback) {
  if (GLOSSARY._isMounted) {
    Logger.warn('GlossaryEmbedded', 'Già montato, unmount prima');
    return;
  }
  
  GLOSSARY._panel = panel;
  GLOSSARY._backCallback = backCallback;
  
  // Svuota il panel e crea container
  GLOSSARY._container = document.createElement('div');
  GLOSSARY._container.className = 'glossary-embedded-container';
  
  panel.innerHTML = '';
  panel.appendChild(GLOSSARY._container);
  
  // Carica dati
  await loadGlossaryData();
  
  // Render
  renderGlossary();
  
  GLOSSARY._isMounted = true;
  Logger.debug('GlossaryEmbedded', 'Glossario embedded montato');
}

function unmount() {
  if (!GLOSSARY._isMounted) return;
  
  if (GLOSSARY._container) {
    GLOSSARY._container.remove();
    GLOSSARY._container = null;
  }
  
  GLOSSARY._panel = null;
  GLOSSARY._backCallback = null;
  GLOSSARY._isMounted = false;
  
  Logger.debug('GlossaryEmbedded', 'Glossario embedded smontato');
}

// Export
const glossaryEmbedded = {
  mount,
  unmount,
};

export { glossaryEmbedded };

