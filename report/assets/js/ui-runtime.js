// /report/assets/js/ui-runtime.js
// Runtime UI globale Tradelia (versione corretta per metriche header)

(function () {
  const UI = {};
  const ROOT = document.documentElement;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const isMobile = () => matchMedia('(max-width: 899px)').matches;

  // ------------------------------------------------------------
  // Overlay open/close
  // ------------------------------------------------------------
  function openPanel() {
    const ov = qs('#panel-overlay');
    if (!ov) return;
    ov.classList.add('active');
  }
  function closePanel() {
    const ov = qs('#panel-overlay');
    if (!ov) return;
    ov.classList.remove('active');
  }

  // ------------------------------------------------------------
  // Helper: costruisce metricsPanel da rows se manca
  // ------------------------------------------------------------
  function buildMetricsPanelFromHeader(headerData) {
    if (!headerData || !Array.isArray(headerData.rows)) return [];
    const out = [];
    headerData.rows.forEach((row) => {
      if (!row.parts) return;
      row.parts.forEach((p) => {
        if (p.kind === 'metric') {
          out.push({
            key: p.key,
            label: p.label || p.key,
            value: p.value ?? '—',
            tone: p.tone || 'neutral',
            source: headerData.meta?.auditPathId || headerData.meta?.id || ''
          });
        }
      });
    });
    return out;
  }

  // ------------------------------------------------------------
  // Drawer desktop renderer
  // ------------------------------------------------------------
  function renderDesktopMetricsDrawer(list) {
    const wrap = document.createElement('div');
    wrap.className = 'metrics-drawer-desktop';

    const cat = document.createElement('div');
    cat.className = 'metrics-drawer-desktop__categories';

    const content = document.createElement('div');
    content.className = 'metrics-drawer-desktop__content';

    list.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.textContent = m.label || m.key;
      btn.dataset.metricKey = m.key;
      if (idx === 0) btn.classList.add('active');
      btn.addEventListener('click', () => {
        selectDesktopMetric(content, list, m.key);
        qsa('button', cat).forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      cat.appendChild(btn);
    });

    wrap.appendChild(cat);
    wrap.appendChild(content);

    // prima render
    if (list[0]) {
      selectDesktopMetric(content, list, list[0].key);
    }

    return wrap;
  }

  function selectDesktopMetric(contentNode, list, metricKey) {
    const metric = list.find((m) => m.key === metricKey);
    if (!metric) return;
    contentNode.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'metric-detail';
    box.innerHTML = `
      <h3>${metric.label || metric.key}</h3>
      <div class="metric-detail__val">${metric.value ?? '—'}</div>
      <p class="metric-detail__tone">Tono: ${metric.tone || 'neutral'}</p>
      <p class="metric-detail__src">Fonte: ${metric.source || 'header.json'}</p>
    `;
    contentNode.appendChild(box);
  }

  // ------------------------------------------------------------
  // Drawer mobile renderer
  // ------------------------------------------------------------
  function renderMobileMetricsDrawer(list) {
    const wrap = document.createElement('div');
    wrap.className = 'metrics-drawer-mobile';

    const layer1 = document.createElement('div');
    layer1.className = 'metrics-drawer-1 active';

    const tabs = document.createElement('nav');
    tabs.className = 'metric-category-tabs';

    const layer2 = document.createElement('div');
    layer2.className = 'metrics-drawer-2';

    list.forEach((m, idx) => {
      const b = document.createElement('button');
      b.className = 'metric-category-tab' + (idx === 0 ? ' active' : '');
      b.textContent = m.label || m.key;
      b.dataset.metricKey = m.key;
      b.addEventListener('click', () => {
        tabs.querySelectorAll('.metric-category-tab').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        showMobileMetric(layer2, m);
        // passa allo strato 2
        layer1.classList.remove('active');
        layer2.classList.add('active');
      });
      tabs.appendChild(b);
    });

    layer1.appendChild(tabs);
    wrap.appendChild(layer1);
    wrap.appendChild(layer2);

    // prima metrica
    if (list[0]) {
      showMobileMetric(layer2, list[0]);
    }

    return wrap;
  }

  function showMobileMetric(layer2, metric) {
    layer2.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'metric-detail';
    box.innerHTML = `
      <h3>${metric.label || metric.key}</h3>
      <div class="metric-detail__val" style="margin-bottom:.4rem">${metric.value ?? '—'}</div>
      <p class="metric-detail__tone">Tono: ${metric.tone || 'neutral'}</p>
      <p class="metric-detail__src">Fonte: ${metric.source || 'header.json'}</p>
    `;
    layer2.appendChild(box);
  }

  // ------------------------------------------------------------
  // API pubbliche
  // ------------------------------------------------------------
  UI.openMetricsDrawer = function (headerData) {
    const list =
      (headerData && Array.isArray(headerData.metricsPanel) && headerData.metricsPanel.length
        ? headerData.metricsPanel
        : buildMetricsPanelFromHeader(headerData)) || [];

    if (!list.length) {
      console.warn('[UI Runtime] Nessuna metrica trovata per il drawer.');
      return;
    }

    openPanel();

    if (isMobile()) {
      const body = qs('#panel-body-mobile');
      const panel = renderMobileMetricsDrawer(list);
      body.innerHTML = '';
      body.appendChild(panel);
    } else {
      const body = qs('#panel-body-desktop');
      const panel = renderDesktopMetricsDrawer(list);
      body.innerHTML = '';
      body.appendChild(panel);
    }

    // salviamo l’ultima lista per selezione successiva
    UI.__lastMetricsList = list;
  };

  UI.openMetricsDrawerFromMetric = function (metricKey) {
    // prendiamo dati dal ticker globale
    const headerData = window.__headerTickerData;
    if (!headerData) {
      console.warn('[UI Runtime] openMetricsDrawerFromMetric: nessun headerData globale.');
      return;
    }
    UI.openMetricsDrawer(headerData);

    // dopo aperto, proviamo a selezionare
    setTimeout(() => {
      if (isMobile()) {
        UI.navigateToMetricInMobileDrawer(metricKey);
      } else {
        const list = UI.__lastMetricsList || [];
        const body = qs('#panel-body-desktop');
        const content = body ? body.querySelector('.metrics-drawer-desktop__content') : null;
        if (!content) return;
        // attiva la categoria
        const btn = body.querySelector(`.metrics-drawer-desktop__categories button[data-metric-key="${metricKey}"]`);
        if (btn) btn.click();
        else if (list[0]) {
          selectDesktopMetric(content, list, list[0].key);
        }
      }
    }, 150);
  };

  UI.navigateToMetricInMobileDrawer = function (metricKey) {
    const body = qs('#panel-body-mobile');
    if (!body) return;
    const tab = body.querySelector(`.metric-category-tab[data-metric-key="${metricKey}"]`);
    if (!tab) return;
    tab.click();
  };

  // ------------------------------------------------------------
  // Bind chiusure
  // ------------------------------------------------------------
  function bindPanelButtons() {
    const c1 = qs('#panel-close');
    const c2 = qs('#panel-close-bottom');
    const c3 = qs('#panel-close-desktop');
    [c1, c2, c3].forEach((btn) => {
      if (btn) btn.addEventListener('click', closePanel);
    });
  }

  bindPanelButtons();

  // tema / stampa basici
  const btnPrint = qs('#btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }
  const btnTheme = qs('#btn-theme');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      ROOT.classList.toggle('tl-theme-dark');
    });
  }

  window.__TradeliaUI = UI;
})();
