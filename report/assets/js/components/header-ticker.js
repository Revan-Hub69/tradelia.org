// /report/assets/js/components/header-ticker.js
// Header verbale Tradelia AI (JSON-driven, inline-metrics)
// - niente dot
// - metriche = testo evidenziato (italic + underline)
// - punteggiatura/parentesi SI ATTACCANO al nodo precedente
// - footer con pulsanti dal JSON

const metricToneClass = (tone) => {
  switch (tone) {
    case 'ok':
      return 'metric-inline--ok';
    case 'warn':
      return 'metric-inline--warn';
    case 'err':
      return 'metric-inline--err';
    default:
      return 'metric-inline--neutral';
  }
};

const createEl = (tag, cls, text) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
};

async function fetchGlossaryEntry(key) {
  try {
    const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json[key] || null;
  } catch {
    return null;
  }
}

// Categorie metriche
function getMetricCategory(key) {
  const categories = {
    'azienda': ['CompanyName', 'Ticker', 'ISIN', 'Sector', 'Venue'],
    'prezzo': ['Price', 'ChangePct'],
    'qualità': ['Freshness', 'ConfidenceFinal', 'DataIntegrity', 'FeedSync', 'State'],
    'temporale': ['Start', 'End', 'UpdatedAt', 'Version']
  };
  
  for (const [cat, keys] of Object.entries(categories)) {
    if (keys.includes(key)) return cat;
  }
  return 'altro';
}

// Libri consigliati per categoria (hardcoded)
const RECOMMENDED_BOOKS = {
  'azienda': [
    { title: 'Analisi fondamentale', url: 'https://example.com/fundamental', author: 'Autore 1' },
    { title: 'Valutazione aziende', url: 'https://example.com/valuation', author: 'Autore 2' }
  ],
  'prezzo': [
    { title: 'Trading tecnico', url: 'https://example.com/technical', author: 'Autore 3' },
    { title: 'Mercati finanziari', url: 'https://example.com/markets', author: 'Autore 4' }
  ],
  'qualità': [
    { title: 'Data quality', url: 'https://example.com/data-quality', author: 'Autore 5' },
    { title: 'Analisi dati', url: 'https://example.com/data-analysis', author: 'Autore 6' }
  ],
  'temporale': [
    { title: 'Time series analysis', url: 'https://example.com/time-series', author: 'Autore 7' }
  ],
  'altro': [
    { title: 'Finanza generale', url: 'https://example.com/finance', author: 'Autore 8' }
  ]
};

async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui) {
    console.warn('[HeaderTicker] window.__TradeliaUI non disponibile');
    return Promise.resolve();
  }
  if (!ui.openPanel) {
    console.warn('[HeaderTicker] window.__TradeliaUI.openPanel non disponibile');
    return Promise.resolve();
  }

  const list = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // Carica tutte le definizioni del glossario e aggiungi categoria
  const metricsWithGlossary = await Promise.all(
    list.map(async (m) => {
      const g = await fetchGlossaryEntry(m.key);
      const category = getMetricCategory(m.key);
      return { ...m, glossary: g || {}, category };
    })
  );

  // Raggruppa metriche per categoria
  const metricsByCategory = {};
  metricsWithGlossary.forEach(m => {
    if (!metricsByCategory[m.category]) {
      metricsByCategory[m.category] = [];
    }
    metricsByCategory[m.category].push(m);
  });

  const categories = ['azienda', 'prezzo', 'qualità', 'temporale', 'altro'].filter(cat => 
    metricsByCategory[cat] && metricsByCategory[cat].length > 0
  );

  // Mobile: doppio drawer con swipe
  if (isMobile) {
    const activeCategory = categories[0] || 'azienda';
    const activeMetrics = metricsByCategory[activeCategory] || [];
    
    const categoryTabs = categories.map(cat => `
      <button class="metric-category-tab ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    const metricsList = activeMetrics.map((m, idx) => `
      <div class="metric-list-item swipeable" data-metric-key="${m.key}" data-metric-index="${idx}">
        <div class="metric-list-item__content">
          <div class="metric-list-item__label">${m.label || m.key}</div>
          <div class="metric-list-item__value">${m.value ?? '—'}</div>
        </div>
        <div class="metric-list-item__swipe-hint">→</div>
      </div>
    `).join('');

    const body = `
      <div class="metrics-drawer-mobile">
        <div class="metrics-drawer-1 active">
          <nav class="metric-category-tabs">
            ${categoryTabs}
          </nav>
          <div class="metrics-list-container">
            <div class="metrics-list" data-category="${activeCategory}">
              ${metricsList}
            </div>
          </div>
        </div>
        <div class="metrics-drawer-2" id="metrics-drawer-2">
          <div class="metrics-drawer-2__header">
            <button class="metrics-drawer-2__back" aria-label="Torna all'elenco">←</button>
            <div class="metrics-drawer-2__title"></div>
          </div>
          <div class="metrics-drawer-2__content"></div>
        </div>
      </div>
    `;

    ui.openPanel({
      title: 'Metriche header',
      subtitle: data.meta?.auditPathId || '—',
      panelSize: 'xl',
      body: body
    });

    // Bind drawer mobile
    setTimeout(() => {
      setupMobileDrawer(metricsWithGlossary, metricsByCategory, categories, ui);
    }, 0);
    
    return Promise.resolve();
  }

  // Desktop: drawer 3 colonne (Categorie | Metriche | Contenuto)
  const firstCategory = categories[0] || 'azienda';
  const firstCategoryMetrics = metricsByCategory[firstCategory] || [];
  const firstMetric = firstCategoryMetrics[0] || metricsWithGlossary[0] || {};

  const categoryList = categories.map(cat => `
    <button class="metric-category-item ${cat === firstCategory ? 'active' : ''}" data-category="${cat}">
      ${cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>
  `).join('');

  const metricsList = firstCategoryMetrics.map(m => `
    <button class="metric-item ${m.key === firstMetric.key ? 'active' : ''}" data-metric-key="${m.key}">
      <div class="metric-item__label">${m.label || m.key}</div>
      <div class="metric-item__value">${m.value ?? '—'}</div>
    </button>
  `).join('');

  const books = RECOMMENDED_BOOKS[firstMetric.category || 'altro'] || [];
  const booksHtml = books.map(book => `
    <div class="recommended-book">
      <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
        <div class="recommended-book__title">${book.title}</div>
        <div class="recommended-book__author">${book.author}</div>
      </a>
    </div>
  `).join('');

  const body = `
    <div class="metrics-drawer-desktop">
      <div class="metrics-drawer-desktop__categories">
        <div class="metrics-drawer-desktop__section-title">Categorie</div>
        <nav class="metrics-drawer-desktop__categories-list">
          ${categoryList}
        </nav>
      </div>
      <div class="metrics-drawer-desktop__metrics">
        <div class="metrics-drawer-desktop__section-title">Metriche</div>
        <div class="metrics-drawer-desktop__metrics-list" data-category="${firstCategory}">
          ${metricsList}
        </div>
      </div>
      <div class="metrics-drawer-desktop__content">
        <div class="metrics-drawer-desktop__content-header">
          <div class="metrics-drawer-desktop__content-title">${firstMetric.label || firstMetric.key || '—'}</div>
        </div>
        <div class="metrics-drawer-desktop__content-body">
          <div class="metric-tabs-container" data-key="${firstMetric.key || ''}">
            <nav class="metric-tabs-nav" role="tablist">
              <button class="metric-tab active" role="tab" data-tab="what" aria-selected="true">What</button>
              <button class="metric-tab" role="tab" data-tab="how" aria-selected="false">How</button>
              <button class="metric-tab" role="tab" data-tab="source" aria-selected="false">Source</button>
            </nav>
            <div class="metric-tabs-content">
              <div class="metric-tab-panel active" data-panel="what" role="tabpanel">
                <div class="metric-tab-panel-content">${firstMetric.glossary.what || '—'}</div>
              </div>
              <div class="metric-tab-panel" data-panel="how" role="tabpanel" hidden>
                <div class="metric-tab-panel-content">${firstMetric.glossary.how || '—'}</div>
              </div>
              <div class="metric-tab-panel" data-panel="source" role="tabpanel" hidden>
                <div class="metric-tab-panel-content">${firstMetric.glossary.source || '—'}</div>
              </div>
            </div>
          </div>
          ${books.length > 0 ? `
            <div class="recommended-books">
              <div class="recommended-books__title">Libri consigliati</div>
              <div class="recommended-books__list">
                ${booksHtml}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  ui.openPanel({
    title: 'Metriche header',
    subtitle: data.meta?.auditPathId || '—',
    panelSize: 'xl',
    body: body
  });

  // Store globale per aprire da click su metrica
  currentMetricsData = {
    metricsWithGlossary,
    metricsByCategory,
    categories,
    ui
  };

  // Bind drawer desktop - aspetta che il DOM sia pronto
  return new Promise((resolve) => {
    setTimeout(() => {
      const drawer = document.querySelector('.metrics-drawer-desktop');
      if (drawer) {
        currentMetricsDrawer = setupDesktopDrawer(metricsWithGlossary, metricsByCategory, categories, ui);
        resolve();
      } else {
        // Retry se il drawer non è ancora nel DOM
        setTimeout(() => {
          const drawer2 = document.querySelector('.metrics-drawer-desktop');
          if (drawer2) {
            currentMetricsDrawer = setupDesktopDrawer(metricsWithGlossary, metricsByCategory, categories, ui);
          }
          resolve();
        }, 100);
      }
    }, 50);
  });
}

// Apri drawer desktop da metrica specifica (per click su metrica nel testo)
function openMetricsPanelFromMetric(metricKey) {
  console.log('[HeaderTicker] openMetricsPanelFromMetric chiamata con:', metricKey);
  // Se drawer non aperto, apri il pannello metriche prima
  const headerData = window.__headerTickerData;
  if (!headerData || !window.__TradeliaUI?.openPanel) {
    console.warn('[HeaderTicker] Dati header non disponibili', {
      headerData: !!headerData,
      openPanel: !!window.__TradeliaUI?.openPanel
    });
    return;
  }

  const drawerExists = document.querySelector('.metrics-drawer-desktop');
  console.log('[HeaderTicker] Drawer esistente:', !!drawerExists, 'currentMetricsDrawer:', !!currentMetricsDrawer);

  // Se il drawer non è ancora aperto, apri prima
  if (!currentMetricsDrawer || !drawerExists) {
    console.log('[HeaderTicker] Drawer non aperto, apro...');
    openMetricsPanel(headerData).then(() => {
      console.log('[HeaderTicker] Drawer aperto, seleziono metrica...');
      // Aspetta che il drawer sia montato
      setTimeout(() => {
        selectMetricInDesktopDrawer(metricKey);
      }, 400);
    }).catch(err => {
      console.error('[HeaderTicker] Errore apertura drawer:', err);
    });
    return;
  }

  // Se il drawer è già aperto, seleziona direttamente la metrica
  console.log('[HeaderTicker] Drawer già aperto, seleziono metrica direttamente');
  selectMetricInDesktopDrawer(metricKey);
}

// Seleziona metrica nel drawer desktop
function selectMetricInDesktopDrawer(metricKey) {
  console.log('[HeaderTicker] selectMetricInDesktopDrawer chiamata con:', metricKey);
  const drawer = document.querySelector('.metrics-drawer-desktop');
  if (!drawer) {
    console.warn('[HeaderTicker] Drawer desktop non trovato');
    return;
  }

  // Usa i dati dal container se disponibili
  const containerData = drawer._metricsData;
  if (!containerData) {
    console.warn('[HeaderTicker] Dati container non disponibili, uso dati globali');
    // Fallback: usa dati globali
    if (!currentMetricsData) {
      console.error('[HeaderTicker] Nessun dato disponibile');
      return;
    }
    const { metricsWithGlossary } = currentMetricsData;
    const metric = metricsWithGlossary.find(m => m.key === metricKey);
    if (!metric) {
      console.error('[HeaderTicker] Metrica non trovata nei dati globali:', metricKey);
      return;
    }
    // Retry dopo un po'
    setTimeout(() => selectMetricInDesktopDrawer(metricKey), 200);
    return;
  }

  const { metricsWithGlossary, metricsByCategory, contentTitle, contentBody, tabsContainer } = containerData;
  const metric = metricsWithGlossary.find(m => m.key === metricKey);
  
  if (!metric) {
    console.warn('[HeaderTicker] Metrica non trovata:', metricKey);
    return;
  }

  console.log('[HeaderTicker] Metrica trovata, categoria:', metric.category);

  // Seleziona categoria
  const category = metric.category || 'altro';
  const categoryItem = drawer.querySelector(`.metric-category-item[data-category="${category}"]`);
  console.log('[HeaderTicker] Categoria item trovato:', !!categoryItem);
  
  if (categoryItem) {
    // Trigger click per aggiornare lista metriche
    console.log('[HeaderTicker] Click su categoria:', category);
    categoryItem.click();
    
    // Aspetta che la lista metriche sia aggiornata
    setTimeout(() => {
      // Seleziona metrica
      const metricItem = drawer.querySelector(`.metric-item[data-metric-key="${metricKey}"]`);
      console.log('[HeaderTicker] Metrica item trovato:', !!metricItem);
      if (metricItem) {
        // Trigger click per aggiornare contenuto
        console.log('[HeaderTicker] Click su metrica:', metricKey);
        metricItem.click();
      } else {
        console.warn('[HeaderTicker] Metrica item non trovato, aggiorno contenuto direttamente');
        // Fallback: aggiorna direttamente il contenuto
        updateMetricContent(metric, contentTitle, contentBody, tabsContainer);
      }
    }, 200);
  } else {
    console.warn('[HeaderTicker] Categoria item non trovato, aggiorno contenuto direttamente');
    // Fallback: aggiorna direttamente il contenuto
    updateMetricContent(metric, contentTitle, contentBody, tabsContainer);
  }
}

// Esporta funzione per UI runtime
if (typeof window !== 'undefined') {
  window.__TradeliaUI = window.__TradeliaUI || {};
  window.__TradeliaUI.openMetricsPanelFromMetric = openMetricsPanelFromMetric;
}

// Setup drawer mobile con swipe gesture
function setupMobileDrawer(metricsWithGlossary, metricsByCategory, categories, ui) {
  const container = document.querySelector('.metrics-drawer-mobile');
  if (!container) return;

  const drawer1 = container.querySelector('.metrics-drawer-1');
  const drawer2 = container.querySelector('#metrics-drawer-2');
  const categoryTabs = container.querySelectorAll('.metric-category-tab');
  const metricsList = container.querySelector('.metrics-list');
  const listItems = container.querySelectorAll('.metric-list-item');
  const backBtn = drawer2.querySelector('.metrics-drawer-2__back');
  const drawer2Title = drawer2.querySelector('.metrics-drawer-2__title');
  const drawer2Content = drawer2.querySelector('.metrics-drawer-2__content');

  // Tabs categoria
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const category = tab.getAttribute('data-category');
      const metrics = metricsByCategory[category] || [];
      
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update metrics list
      metricsList.setAttribute('data-category', category);
      metricsList.innerHTML = metrics.map((m, idx) => `
        <div class="metric-list-item swipeable" data-metric-key="${m.key}" data-metric-index="${idx}">
          <div class="metric-list-item__content">
            <div class="metric-list-item__label">${m.label || m.key}</div>
            <div class="metric-list-item__value">${m.value ?? '—'}</div>
          </div>
          <div class="metric-list-item__swipe-hint">→</div>
        </div>
      `).join('');
      
      // Re-bind swipe gesture
      setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content);
    });
  });

  // Swipe gesture per aprire drawer 2
  setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content);

  // Back button
  backBtn.addEventListener('click', () => {
    drawer1.classList.add('active');
    drawer2.classList.remove('active');
  });
}

// Setup swipe gesture per mobile drawer
function setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content) {
  const drawer1 = container.querySelector('.metrics-drawer-1');
  const listItems = container.querySelectorAll('.metric-list-item.swipeable');
  
  listItems.forEach(item => {
    let startX = 0, startY = 0, isDragging = false;
    
    item.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });
    
    item.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Solo swipe orizzontale right
      if (diffX > 0 && Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
        e.preventDefault();
        const key = item.getAttribute('data-metric-key');
        const metric = metricsWithGlossary.find(m => m.key === key);
        if (metric) {
          openMetricDetail(metric, drawer2, drawer2Title, drawer2Content);
          drawer1.classList.remove('active');
          drawer2.classList.add('active');
        }
        isDragging = false;
      }
    }, { passive: false });
    
    item.addEventListener('touchend', () => {
      isDragging = false;
    }, { passive: true });
  });
}

// Apri dettaglio metrica nel drawer 2
function openMetricDetail(metric, drawer2, drawer2Title, drawer2Content) {
  const books = RECOMMENDED_BOOKS[metric.category || 'altro'] || [];
  const booksHtml = books.map(book => `
    <div class="recommended-book">
      <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
        <div class="recommended-book__title">${book.title}</div>
        <div class="recommended-book__author">${book.author}</div>
      </a>
    </div>
  `).join('');

  drawer2Title.textContent = metric.label || metric.key;
  drawer2Content.innerHTML = `
    <div class="metric-tabs-container" data-key="${metric.key}">
      <nav class="metric-tabs-nav" role="tablist">
        <button class="metric-tab active" role="tab" data-tab="what" aria-selected="true">What</button>
        <button class="metric-tab" role="tab" data-tab="how" aria-selected="false">How</button>
        <button class="metric-tab" role="tab" data-tab="source" aria-selected="false">Source</button>
      </nav>
      <div class="metric-tabs-content">
        <div class="metric-tab-panel active" data-panel="what" role="tabpanel">
          <div class="metric-tab-panel-content">${metric.glossary.what || '—'}</div>
        </div>
        <div class="metric-tab-panel" data-panel="how" role="tabpanel" hidden>
          <div class="metric-tab-panel-content">${metric.glossary.how || '—'}</div>
        </div>
        <div class="metric-tab-panel" data-panel="source" role="tabpanel" hidden>
          <div class="metric-tab-panel-content">${metric.glossary.source || '—'}</div>
        </div>
      </div>
    </div>
    ${books.length > 0 ? `
      <div class="recommended-books">
        <div class="recommended-books__title">Libri consigliati</div>
        <div class="recommended-books__list">
          ${booksHtml}
        </div>
      </div>
    ` : ''}
  `;

  // Bind tabs
  if (window.__TradeliaUI?.bindMetricTabs) {
    window.__TradeliaUI.bindMetricTabs(drawer2Content, metric.key);
  }

  // Swipe left per tornare
  let startX = 0;
  drawer2Content.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  drawer2Content.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    if (diffX < -50) {
      e.preventDefault();
      const drawer1 = document.querySelector('.metrics-drawer-1');
      const drawer2 = document.querySelector('#metrics-drawer-2');
      if (drawer1 && drawer2) {
        drawer1.classList.add('active');
        drawer2.classList.remove('active');
      }
    }
  }, { passive: false });
}

// Setup drawer desktop 3 colonne
function setupDesktopDrawer(metricsWithGlossary, metricsByCategory, categories, ui) {
  const container = document.querySelector('.metrics-drawer-desktop');
  if (!container) return container;

  const categoryItems = container.querySelectorAll('.metric-category-item');
  const metricsList = container.querySelector('.metrics-drawer-desktop__metrics-list');
  const contentTitle = container.querySelector('.metrics-drawer-desktop__content-title');
  const contentBody = container.querySelector('.metrics-drawer-desktop__content-body');
  const tabsContainer = container.querySelector('.metric-tabs-container');

  // Store per accesso globale
  if (!container._metricsData) {
    container._metricsData = { metricsWithGlossary, metricsByCategory, contentTitle, contentBody, tabsContainer };
  }

  // Click su categoria
  categoryItems.forEach(catItem => {
    catItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const category = catItem.getAttribute('data-category');
      console.log('[HeaderTicker] Click categoria:', category);
      const metrics = metricsByCategory[category] || [];
      
      // Update active category
      categoryItems.forEach(c => c.classList.remove('active'));
      catItem.classList.add('active');
      
      // Update metrics list
      metricsList.setAttribute('data-category', category);
      metricsList.innerHTML = metrics.map(m => `
        <button class="metric-item" data-metric-key="${m.key}">
          <div class="metric-item__label">${m.label || m.key}</div>
          <div class="metric-item__value">${m.value ?? '—'}</div>
        </button>
      `).join('');
      
      // Select first metric
      if (metrics.length > 0) {
        const firstMetric = metrics[0];
        updateMetricContent(firstMetric, contentTitle, contentBody, tabsContainer);
        const firstItem = metricsList.querySelector('.metric-item');
        if (firstItem) {
          firstItem.classList.add('active');
          console.log('[HeaderTicker] Prima metrica selezionata:', firstMetric.key);
        }
      }
      
      // Re-bind metric items
      setTimeout(() => {
        bindMetricItems(metricsWithGlossary, contentTitle, contentBody, tabsContainer);
      }, 0);
    });
  });

  // Bind metric items
  bindMetricItems(metricsWithGlossary, contentTitle, contentBody, tabsContainer);
  
  return container;
}

// Bind metric items per desktop
function bindMetricItems(metricsWithGlossary, contentTitle, contentBody, tabsContainer) {
  // Trova gli elementi dal container per evitare problemi di scope
  const container = document.querySelector('.metrics-drawer-desktop');
  if (!container) {
    console.warn('[HeaderTicker] bindMetricItems: container non trovato');
    return;
  }
  
  const metricItems = container.querySelectorAll('.metric-item');
  console.log('[HeaderTicker] bindMetricItems: trovati', metricItems.length, 'elementi');
  
  metricItems.forEach(item => {
    // Rimuovi listener esistenti creando nuovo elemento
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    newItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = newItem.getAttribute('data-metric-key');
      console.log('[HeaderTicker] Click metrica nel drawer:', key);
      const metric = metricsWithGlossary.find(m => m.key === key);
      
      if (metric && contentTitle && contentBody && tabsContainer) {
        console.log('[HeaderTicker] Aggiorna contenuto per:', key);
        // Update active metric
        container.querySelectorAll('.metric-item').forEach(m => m.classList.remove('active'));
        newItem.classList.add('active');
        
        // Update content
        updateMetricContent(metric, contentTitle, contentBody, tabsContainer);
      } else {
        console.warn('[HeaderTicker] bindMetricItems: metrica o elementi non trovati', {
          metric: !!metric,
          contentTitle: !!contentTitle,
          contentBody: !!contentBody,
          tabsContainer: !!tabsContainer
        });
      }
    });
  });
}

// Naviga a metrica nel drawer mobile
function navigateToMetricInMobileDrawer(metricKey) {
  // Retry se il drawer non è ancora nel DOM
  const drawer = document.querySelector('.metrics-drawer-mobile');
  if (!drawer) {
    setTimeout(() => navigateToMetricInMobileDrawer(metricKey), 100);
    return;
  }
  
  const drawer1 = drawer.querySelector('.metrics-drawer-1');
  const drawer2 = drawer.querySelector('#metrics-drawer-2');
  if (!drawer1 || !drawer2) {
    setTimeout(() => navigateToMetricInMobileDrawer(metricKey), 100);
    return;
  }
  
  const categoryTabs = drawer.querySelectorAll('.metric-category-tab');
  const metricsList = drawer.querySelector('.metrics-list');
  
  // Trova categoria della metrica
  const category = getMetricCategory(metricKey);
  const categoryTab = Array.from(categoryTabs).find(tab => tab.getAttribute('data-category') === category);
  
  if (categoryTab) {
    // Click su categoria tab per aggiornare lista
    categoryTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    
    // Dopo che la lista è aggiornata, trova la metrica e apri drawer 2
    setTimeout(() => {
      const metricItem = drawer.querySelector(`[data-metric-key="${metricKey}"]`);
      if (metricItem) {
        // Trova la metrica nei dati
        const metricsWithGlossary = currentMetricsData?.metricsWithGlossary || [];
        const metric = metricsWithGlossary.find(m => m.key === metricKey);
        if (metric) {
          const drawer2Title = drawer2.querySelector('.metrics-drawer-2__title');
          const drawer2Content = drawer2.querySelector('.metrics-drawer-2__content');
          if (drawer2Title && drawer2Content) {
            openMetricDetail(metric, drawer2, drawer2Title, drawer2Content);
            drawer1.classList.remove('active');
            drawer2.classList.add('active');
          }
        }
      }
    }, 200);
  }
}

// Update metric content per desktop
function updateMetricContent(metric, contentTitle, contentBody, tabsContainer) {
  const books = RECOMMENDED_BOOKS[metric.category || 'altro'] || [];
  const booksHtml = books.map(book => `
    <div class="recommended-book">
      <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
        <div class="recommended-book__title">${book.title}</div>
        <div class="recommended-book__author">${book.author}</div>
      </a>
    </div>
  `).join('');

  contentTitle.textContent = metric.label || metric.key;
  
  tabsContainer.setAttribute('data-key', metric.key);
  const whatPanel = tabsContainer.querySelector('[data-panel="what"]');
  const howPanel = tabsContainer.querySelector('[data-panel="how"]');
  const sourcePanel = tabsContainer.querySelector('[data-panel="source"]');
  
  if (whatPanel) whatPanel.querySelector('.metric-tab-panel-content').textContent = metric.glossary.what || '—';
  if (howPanel) howPanel.querySelector('.metric-tab-panel-content').textContent = metric.glossary.how || '—';
  if (sourcePanel) sourcePanel.querySelector('.metric-tab-panel-content').textContent = metric.glossary.source || '—';
  
  // Reset to What tab
  const tabs = tabsContainer.querySelectorAll('.metric-tab');
  const panels = tabsContainer.querySelectorAll('.metric-tab-panel');
  tabs.forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  tabs[0].classList.add('active');
  tabs[0].setAttribute('aria-selected', 'true');
  panels.forEach(p => {
    if (p.getAttribute('data-panel') === 'what') {
      p.classList.add('active');
      p.removeAttribute('hidden');
    } else {
      p.classList.remove('active');
      p.setAttribute('hidden', '');
    }
  });

  // Update books
  const booksContainer = contentBody.querySelector('.recommended-books');
  if (books.length > 0) {
    if (!booksContainer) {
      const booksHtml = `
        <div class="recommended-books">
          <div class="recommended-books__title">Libri consigliati</div>
          <div class="recommended-books__list">
            ${booksHtml}
          </div>
        </div>
      `;
      contentBody.insertAdjacentHTML('beforeend', booksHtml);
    } else {
      booksContainer.querySelector('.recommended-books__list').innerHTML = booksHtml;
    }
  } else if (booksContainer) {
    booksContainer.remove();
  }
  
  // Bind tabs
  if (window.__TradeliaUI?.bindMetricTabs) {
    window.__TradeliaUI.bindMetricTabs(contentBody, metric.key);
  }
}

function renderTextPart(part) {
  const txt = part.text || '';
  const el = createEl('span', 'header-ticker-text', txt);

  // se è solo punteggiatura o parentesi → segniamo che va incollata
  if (/^[,.;:!?()—–\-«»“”]+$/.test(txt.trim().replace(/\s+/g,''))) {
    el.dataset.glue = '1';
  }

  return el;
}

function renderMetricPart(part) {
  const wrap = createEl('button', `metric-inline ${metricToneClass(part.tone)}`);
  wrap.type = 'button';
  wrap.dataset.metric = part.key;
  wrap.setAttribute('aria-label', part.label || part.key);

  // Formatta il valore: se è un numero, formattalo correttamente
  let displayValue = '—';
  if (part.value != null && part.value !== '') {
    if (typeof part.value === 'number') {
      // Se è un numero decimale, formattalo con 2 decimali
      displayValue = Number.isInteger(part.value) 
        ? String(part.value)
        : Number(part.value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      displayValue = String(part.value);
    }
  }

  const txt = createEl(
    'span',
    `metric-inline-text metric-inline-text--${part.tone || 'neutral'}`,
    displayValue
  );

  // stile che avevi tu
  txt.style.fontWeight = '600';
  txt.style.fontStyle = 'italic';
  txt.style.textDecoration = 'underline';

  wrap.appendChild(txt);

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('[HeaderTicker] Click su metrica:', part.key);
    try {
      const ui = window.__TradeliaUI;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      console.log('[HeaderTicker] isMobile:', isMobile, 'ui:', !!ui, 'openPanel:', !!ui?.openPanel);
      
      if (isMobile) {
        // Mobile: apri drawer "Scopri tutte le metriche" e naviga a quella metrica
        const headerData = window.__headerTickerData;
        console.log('[HeaderTicker] Mobile - headerData:', !!headerData);
        if (headerData && ui?.openPanel) {
          console.log('[HeaderTicker] Mobile - apri drawer');
          // Apri pannello metriche
          openMetricsPanel(headerData).then(() => {
            console.log('[HeaderTicker] Mobile - drawer aperto, naviga a metrica');
            setTimeout(() => {
              navigateToMetricInMobileDrawer(part.key);
            }, 500);
          });
        } else {
          console.warn('[HeaderTicker] Mobile - fallback popup');
          // Fallback: apri popup se drawer non disponibile
          if (ui?.openMetricPopup) {
            ui.openMetricPopup(part.key);
          }
        }
      } else {
        // Desktop: apri drawer e seleziona metrica
        console.log('[HeaderTicker] Desktop - openMetricsPanelFromMetric:', !!ui?.openMetricsPanelFromMetric);
        if (ui?.openMetricsPanelFromMetric) {
          console.log('[HeaderTicker] Desktop - apri drawer con metrica');
          ui.openMetricsPanelFromMetric(part.key);
        } else {
          console.warn('[HeaderTicker] Desktop - fallback popup');
          // Fallback: apri popup se drawer non disponibile
          if (ui?.openMetricPopup) {
            ui.openMetricPopup(part.key);
          }
        }
      }
    } catch (err) {
      console.error('[HeaderTicker] Errore apertura metrica:', err);
    }
  });

  return wrap;
}

function renderPart(part) {
  if (part.kind === 'text') return renderTextPart(part);
  if (part.kind === 'metric') return renderMetricPart(part);
  return createEl('span', 'header-ticker-text', '');
}

function renderRow(row) {
  const rowEl = createEl('div', 'header-ticker-row');

  if (row.id === 'company-line' || row.id === 'intro-line') rowEl.classList.add('header-ticker-row--intro');
  else if (row.id === 'price-line') rowEl.classList.add('header-ticker-row--intro');
  else if (row.id === 'quality-line') rowEl.classList.add('header-ticker-row--quality');
  else if (row.id === 'window-line') rowEl.classList.add('header-ticker-row--meta');

  (row.parts || []).forEach((part, idx, arr) => {
    if (part.kind === 'text' && part.text) {
      let remaining = String(part.text);

      // 1) Gluing: gestisce punteggiatura che può essere incollata prima o dopo
      // Se il testo è solo una parentesi aperta e il prossimo elemento è una metrica,
      // segna che va incollata alla metrica successiva (prefissa)
      const isOnlyPunct = /^\s*([(«"])\s*$/.test(remaining);
      const nextIsMetric = idx + 1 < arr.length && arr[idx + 1]?.kind === 'metric';
      
      if (isOnlyPunct && nextIsMetric) {
        // Salta questo part text, la parentesi verrà aggiunta alla metrica successiva
        // Rimuovi eventuali spazi prima della parentesi
        const punctMatch = remaining.match(/^\s*([(«"])/);
        if (punctMatch) {
          rowEl.dataset.pendingPunct = punctMatch[1];
          // Rimuovi spazio finale dal testo precedente se c'è
          const last = rowEl.lastElementChild;
          if (last) {
            // Se l'ultimo elemento è un part text, rimuovi spazio finale
            if (last.classList.contains('header-ticker-text') && last.textContent && last.textContent.endsWith(' ')) {
              last.textContent = last.textContent.slice(0, -1);
            }
            // Se l'ultimo elemento è una metrica, rimuovi spazio dal textContent
            const metricTxt = last.querySelector('.metric-inline-text');
            if (metricTxt && metricTxt.textContent && metricTxt.textContent.endsWith(' ')) {
              metricTxt.textContent = metricTxt.textContent.slice(0, -1);
            }
          }
        }
        return; // Salta questo part, verrà gestito dalla metrica successiva
      }

      // 2) Gluing: se il testo INIZIA con spazi + punteggiatura, incolla la punteggiatura al nodo precedente
      let matched = false;
      while (true) {
        // Match: spazi opzionali + punteggiatura + resto
        const m = remaining.match(/^\s*([,.;:!?)—–\-«»""])\s*(.*)$/);
        if (!m) break;
        matched = true;
        const punct = m[1];
        const rest  = m[2] || '';
        const last = rowEl.lastElementChild;
        if (last) {
          const metricTxt = last.querySelector('.metric-inline-text');
          // Altre punteggiature: aggiungi spazio non-breaking dopo
          const spacer = '\u00A0';
          if (metricTxt) {
            metricTxt.textContent = (metricTxt.textContent || '') + punct + spacer;
          } else {
            last.textContent = (last.textContent || '') + punct + spacer;
          }
        } else {
          // se non c'è precedente, appendiamo la punteggiatura come testo semplice (raro)
          rowEl.appendChild(renderTextPart({ kind:'text', text: punct }));
        }
        remaining = rest;
        // continua a consumare punteggiatura iniziale, poi esci
        if (!/^\s*([,.;:!?)—–\-«»""])/.test(remaining)) break;
      }

      // 3) Se resta contenuto non-punteggiatura, appendi come testo normale
      // Rimuovi spazi iniziali che potrebbero essere rimasti dopo la punteggiatura
      if (remaining && remaining.trim() !== '' || !matched) {
        // Se matched è true e remaining inizia con spazi dopo punteggiatura, rimuovili
        if (matched && /^\s+/.test(remaining)) {
          remaining = remaining.trimStart();
        }
        if (remaining) {
          rowEl.appendChild(renderTextPart({ kind:'text', text: remaining }));
        }
      }
    } else {
      // Se è una metrica, controlla se c'è una parentesi pendente da aggiungere prima
      const pendingPunct = rowEl.dataset.pendingPunct;
      if (pendingPunct) {
        delete rowEl.dataset.pendingPunct;
        // Aggiungi la parentesi prima del valore della metrica
        const metricEl = renderPart(part);
        const metricTxt = metricEl.querySelector('.metric-inline-text');
        if (metricTxt) {
          metricTxt.textContent = pendingPunct + metricTxt.textContent;
        }
        rowEl.appendChild(metricEl);
      } else {
        rowEl.appendChild(renderPart(part));
      }
    }
  });

  // NON bind metric info buttons - le metriche nel testo hanno già il loro click handler
  // bindMetricInfoButtons sovrascriverebbe il nostro handler personalizzato

  return rowEl;
}

function renderFooter(node, data) {
  const footer = node._footer;
  footer.innerHTML = '';

  const links = data.footer?.links || [];
  links.forEach((link) => {
    const btn = createEl('button', 'btn btn-sm', link.label || 'Azione');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (link.action === 'open-metrics-panel') {
        try {
          openMetricsPanel(data);
        } catch (err) {
          console.warn('[HeaderTicker] Errore apertura metrics panel:', err);
        }
      }
    });
    footer.appendChild(btn);
  });

  if (data.meta?.auditPathId) {
    const ui = window.__TradeliaUI;
    if (ui?.openAuditPanel) {
      const auditBtn = createEl('button', 'btn btn-sm', 'Audit');
      auditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          ui.openAuditPanel({
            AuditPathID: data.meta.auditPathId,
            Notes: ['Header verbale generato da Swing master.']
          });
        } catch (err) {
          console.warn('[HeaderTicker] Errore apertura audit panel:', err);
        }
      });
      footer.appendChild(auditBtn);
    }
  }
}

function mount(containerEl) {
  const root = createEl('section', 'header-ticker');
  const body = createEl('div', 'header-ticker-body');
  const footer = createEl('div', 'header-ticker-footer');

  root.appendChild(body);
  root.appendChild(footer);

  root._body = body;
  root._footer = footer;

  containerEl.appendChild(root);
  return root;
}

function update(node, data) {
  if (!node || !data) return;

  // Salva dati header globalmente per aprire drawer da click su metrica
  if (typeof window !== 'undefined') {
    window.__headerTickerData = data;
  }

  node.classList.remove(
    'header-ticker--state-ok',
    'header-ticker--state-warn',
    'header-ticker--state-err'
  );
  const st = data.meta?.state || data.State?.raw || data.State;
  if (st === 'ACTIVE') node.classList.add('header-ticker--state-ok');
  else if (st === 'HOLD') node.classList.add('header-ticker--state-warn');
  else if (st === 'REVIEW') node.classList.add('header-ticker--state-err');

  const body = node._body;
  body.innerHTML = '';

  const rows = Array.isArray(data.rows) ? data.rows : [];
  if (rows.length > 0) {
    rows.forEach((row) => {
      body.appendChild(renderRow(row));
    });
  } else {
    // Fallback legacy: costruisce righe base da campi flat (Ticker, Price, ChangePct, ...)
    const intro = {
      id: 'intro-line',
      parts: [
        { kind: 'text', text: data.Ticker ? String(data.Ticker) : '—' },
        // parentesi senza spazio prima (si incolla al ticker) e con chiusura separata
        ...(data.Venue ? [
          { kind: 'text', text: '(' },
          { kind: 'text', text: String(data.Venue) },
          { kind: 'text', text: ')' }
        ] : [])
      ]
    };

    const priceStr = (data.Price==null || isNaN(data.Price))
      ? '—'
      : Number(data.Price).toLocaleString('it-IT',{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const chgVal = (data.ChangePct!=null && !isNaN(Number(data.ChangePct))) ? Number(data.ChangePct) : null;
    const chgTone = chgVal==null ? 'neutral' : (chgVal>0 ? 'ok' : (chgVal<0 ? 'err' : 'neutral'));
    const chgStr  = chgVal==null ? '—%' : `${chgVal>0?'+':''}${chgVal.toFixed(2)}%`;

    const quality = {
      id: 'quality-line',
      parts: [
        { kind: 'text', text: 'Price ' },
        { kind: 'metric', key: 'Price', value: priceStr, tone: 'neutral', label: 'Price' },
        { kind: 'text', text: ',' },
        { kind: 'text', text: 'Change ' },
        { kind: 'metric', key: 'ChangePct', value: chgStr, tone: chgTone, label: 'ChangePct' },
        { kind: 'text', text: ',' },
        { kind: 'text', text: 'CCY ' },
        { kind: 'metric', key: 'Currency', value: data.Currency || '—', tone: 'neutral', label: 'Currency' }
      ]
    };

    const windowLine = {
      id: 'window-line',
      parts: [
        { kind: 'text', text: `Snapshot ${data.Start ?? '—'} → ${data.End ?? '—'}` },
        { kind: 'text', text: ' · ' },
        { kind: 'text', text: `Updated ${(()=>{ try{ return new Date(data.UpdatedAt).toISOString().slice(11,16)+'\u00A0UTC'; }catch(e){ return (data.UpdatedAt || '—'); } })()}` }
      ]
    };

    [intro, quality, windowLine].forEach(r => body.appendChild(renderRow(r)));
  }

  renderFooter(node, data);
}

export const headerTicker = {
  mount,
  update
};
