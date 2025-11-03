// /report/assets/js/components/header-ticker.js
// Header verbale Tradelia AI (versione JSON-driven)
// - legge un json del tipo { meta, rows[], footer, metricsPanel[] }
// - rende righe testuali dove le parti "metric" sono pill cliccabili
// - apre un pannello con tutte le metriche
// dipendenze opzionali: window.__TradeliaUI, /report/assets/glossary.json

const metricToneClass = (tone) => {
  switch (tone) {
    case 'ok': return 'pill--ok';
    case 'warn': return 'pill--warn';
    case 'err': return 'pill--err';
    default: return 'pill--neutral';
  }
};

const createEl = (tag, cls, text) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
};

// carica dal glossario (può essere già in cache nel runtime ui)
async function fetchGlossaryEntry(key) {
  try {
    // se il runtime UI espone il Glossary via window, usiamolo
    if (window.__TradeliaUI && typeof window.__TradeliaUI._glossaryGet === 'function') {
      return await window.__TradeliaUI._glossaryGet(key);
    }
    // fallback: fetch diretto
    const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json[key] || null;
  } catch (err) {
    console.warn('[header-ticker] glossary fetch failed for', key, err);
    return null;
  }
}

// apre il pannello tabellare con tutte le metriche del json
async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui || typeof ui.openPanel !== 'function') {
    console.warn('[header-ticker] __TradeliaUI.openPanel non disponibile');
    return;
  }

  const list = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];

  // costruiamo le righe html
  const rowsHtml = await Promise.all(list.map(async (m) => {
    const g = await fetchGlossaryEntry(m.key);
    const what = g?.what || '—';
    const how = g?.how || '—';
    const source = g?.source || '—';
    const toneCls = metricToneClass(m.tone);
    return `
      <tr>
        <td class="align-top py-2 pr-3">
          <div class="pill ${toneCls} mb-1 inline-flex">${m.label || m.key}</div>
        </td>
        <td class="align-top py-2 pr-3"><div>${m.value ?? '—'}</div></td>
        <td class="align-top py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${what}</td>
        <td class="align-top py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${how}</td>
        <td class="align-top py-2 pr-3 text-[13px] text-[color:var(--muted)]">${source}</td>
      </tr>
    `;
  }));

  const bodyHtml = `
    <div class="overflow-auto">
      <p class="text-[13px] text-[color:var(--muted)] mb-3">
        Valori, definizioni e fonti per le metriche esposte nell’header. Dati a scopo informativo.
      </p>
      <table class="min-w-full text-left text-[13px]">
        <thead>
          <tr class="text-[color:var(--muted)]">
            <th class="py-2 pr-3 whitespace-nowrap">Metrica</th>
            <th class="py-2 pr-3 whitespace-nowrap">Valore</th>
            <th class="py-2 pr-3 whitespace-nowrap">What</th>
            <th class="py-2 pr-3 whitespace-nowrap">How</th>
            <th class="py-2 pr-3 whitespace-nowrap">Source</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml.join('')}
        </tbody>
      </table>
    </div>
  `;

  ui.openPanel({
    title: 'Metriche header',
    subtitle: data.meta?.auditPathId || '—',
    panelSize: 'xl',
    body: bodyHtml
  });
}

// rende una singola parte di riga
function renderPart(part) {
  if (part.kind === 'text') {
    return createEl('span', '', part.text || '');
  }
  if (part.kind === 'metric') {
    const btn = createEl(
      'button',
      `pill ${metricToneClass(part.tone)} inline-flex items-center gap-1 mr-1 mb-1 metric-btn`,
      part.value != null ? String(part.value) : '—'
    );
    btn.type = 'button';
    btn.dataset.metric = part.key;

    // tooltip/popup: lasciamo che il runtime li leghi
    // ma mettiamo un fallback minimale
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      // se il runtime ha i bind, li usiamo
      if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
        // il runtime si occupa da solo di aggiungere i listener
        // qui possiamo anche non fare nulla
      } else {
        // fallback: mostra un alert minimale
        const g = await fetchGlossaryEntry(part.key);
        if (g) {
          alert(`${g.title || part.key}\n\n${g.what || ''}\n\n${g.how || ''}\n\n${g.source || ''}`);
        } else {
          alert(part.key);
        }
      }
    });

    // label visiva
    if (part.label) {
      btn.setAttribute('aria-label', part.label);
    } else {
      btn.setAttribute('aria-label', part.key);
    }

    return btn;
  }
  // default
  return createEl('span', '', '');
}

// rende una riga intera
function renderRow(row) {
  const wrap = createEl('div', 'flex flex-wrap items-center gap-1 mb-1 header-ticker-row');
  (row.parts || []).forEach((part) => {
    wrap.appendChild(renderPart(part));
  });
  return wrap;
}

function renderFooter(node, data) {
  const footerEl = node._footer;
  footerEl.innerHTML = '';
  const links = data.footer?.links || [];
  links.forEach((link) => {
    const btn = createEl('button', 'btn btn-sm', link.label || 'Azione');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (link.action === 'open-metrics-panel') {
        openMetricsPanel(data);
      }
      // qui in futuro puoi aggiungere altre azioni
    });
    footerEl.appendChild(btn);
  });

  // audit opzionale
  if (data.meta?.auditPathId && window.__TradeliaUI?.openAuditPanel) {
    const auditBtn = createEl('button', 'btn btn-sm', 'Audit');
    auditBtn.type = 'button';
    auditBtn.addEventListener('click', () => {
      window.__TradeliaUI.openAuditPanel({
        AuditPathID: data.meta.auditPathId,
        QualityMetrics: {
          FreshnessScore: data.rows ? '—' : '—'
        },
        Notes: ['Header verbale generato da Swing master.']
      });
    });
    footerEl.appendChild(auditBtn);
  }
}

// API: mount
function mount(containerEl) {
  const root = createEl('section', 'card mb-6 header-ticker');
  const body = createEl('div', 'header-ticker-body flex flex-col gap-1');
  const footer = createEl('div', 'header-ticker-footer mt-3 flex flex-wrap gap-2');

  root.appendChild(body);
  root.appendChild(footer);
  containerEl.appendChild(root);

  // salviamo riferimenti per update
  root._body = body;
  root._footer = footer;

  return root;
}

// API: update
function update(node, data) {
  if (!node || !data) return;
  const body = node._body;
  body.innerHTML = '';

  const rows = Array.isArray(data.rows) ? data.rows : [];
  rows.forEach((row) => {
    const rowEl = renderRow(row);
    body.appendChild(rowEl);

    // dopo aver reso la riga, facciamo legare i tooltip dal runtime
    if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
      window.__TradeliaUI.bindMetricInfoButtons(rowEl);
    }
  });

  // footer
  renderFooter(node, data);
}

export const headerTicker = {
  mount,
  update
};
