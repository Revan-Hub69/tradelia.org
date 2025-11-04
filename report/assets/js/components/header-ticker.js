// /report/assets/js/components/header-ticker.js
// Header ticker con click metriche → drawer

(function () {
  const mountTarget = document.getElementById('header-ticker-mount');
  if (!mountTarget) return;

  function createEl(tag, cls, txt) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt != null) el.textContent = txt;
    return el;
  }

  function metricToneClass(tone) {
    if (tone === 'green') return 'green';
    if (tone === 'red') return 'red';
    if (tone === 'yellow') return 'yellow';
    return '';
  }

  function renderTextPart(part) {
    return createEl('span', 'header-ticker-text', part.text);
  }

  function renderMetricPart(part) {
    const wrap = createEl('button', `metric-inline ${metricToneClass(part.tone)}`);
    wrap.type = 'button';
    wrap.dataset.metric = part.key;
    wrap.setAttribute('aria-label', part.label || part.key);
    const txt = createEl('span', 'metric-inline-text', part.value != null ? String(part.value) : '—');
    wrap.appendChild(txt);

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.__TradeliaUI && typeof window.__TradeliaUI.openMetricsDrawerFromMetric === 'function') {
        window.__TradeliaUI.openMetricsDrawerFromMetric(part.key);
      } else {
        console.warn('[HeaderTicker] UI runtime non disponibile.');
      }
    });

    return wrap;
  }

  function renderPart(part) {
    if (part.kind === 'text') return renderTextPart(part);
    if (part.kind === 'metric') return renderMetricPart(part);
    return createEl('span', '', '');
  }

  function renderRow(row) {
    const rowEl = createEl('div', 'header-ticker-row');
    if (row.parts && row.parts.length) {
      row.parts.forEach((p) => {
        rowEl.appendChild(renderPart(p));
      });
    }
    return rowEl;
  }

  function ensureMetricsPanel(data) {
    if (Array.isArray(data.metricsPanel) && data.metricsPanel.length) return data;
    // costruiamo da rows
    const list = [];
    if (Array.isArray(data.rows)) {
      data.rows.forEach((row) => {
        (row.parts || []).forEach((p) => {
          if (p.kind === 'metric') {
            list.push({
              key: p.key,
              label: p.label || p.key,
              value: p.value ?? '—',
              tone: p.tone || 'neutral',
              source: data.meta?.auditPathId || ''
            });
          }
        });
      });
    }
    data.metricsPanel = list;
    return data;
  }

  function renderHeaderTicker(data) {
    mountTarget.innerHTML = '';
    const wrap = createEl('div', 'header-ticker');
    (data.rows || []).forEach((row) => {
      wrap.appendChild(renderRow(row));
    });

    // footer con bottone "tutte le metriche"
    const footer = createEl('div', 'header-ticker-footer');
    const btn = createEl('button', 'btn-sm', 'Tutte le metriche');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMobile = matchMedia('(max-width: 899px)').matches;
      if (window.__TradeliaUI && typeof window.__TradeliaUI.openMetricsDrawer === 'function') {
        // passiamo i dati già completati
        window.__TradeliaUI.openMetricsDrawer(window.__headerTickerData);
      }
    });
    footer.appendChild(btn);
    wrap.appendChild(footer);

    mountTarget.appendChild(wrap);
  }

  // API globale: chiamata da app.js
  window.__HeaderTicker = {
    mount(data) {
      const ready = ensureMetricsPanel(data);
      // salvo globale per il runtime
      window.__headerTickerData = ready;
      renderHeaderTicker(ready);
    }
  };
})();
