// /report/assets/js/components/header-ticker.js
// Header verbale Tradelia AI (JSON-driven, premium)

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

// opzionale: glossario
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

async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui?.openPanel) return;

  const list = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
  const rowsHtml = await Promise.all(list.map(async (m) => {
    const g = await fetchGlossaryEntry(m.key);
    return `
      <tr>
        <td class="py-2 pr-3"><div class="metric-btn ${metricToneClass(m.tone)}">${m.label || m.key}</div></td>
        <td class="py-2 pr-3">${m.value ?? '—'}</td>
        <td class="py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${g?.what || '—'}</td>
        <td class="py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${g?.how || '—'}</td>
        <td class="py-2 pr-3 text-[13px] text-[color:var(--muted)]">${g?.source || '—'}</td>
      </tr>
    `;
  }));

  ui.openPanel({
    title: 'Metriche header',
    subtitle: data.meta?.auditPathId || '—',
    panelSize: 'xl',
    body: `
      <div class="overflow-auto">
        <table class="min-w-full text-left text-[13px]">
          <thead>
            <tr class="text-[color:var(--muted)]">
              <th class="py-2 pr-3">Metrica</th>
              <th class="py-2 pr-3">Valore</th>
              <th class="py-2 pr-3">What</th>
              <th class="py-2 pr-3">How</th>
              <th class="py-2 pr-3">Source</th>
            </tr>
          </thead>
          <tbody>${rowsHtml.join('')}</tbody>
        </table>
      </div>
    `
  });
}

// crea uno span di testo
function renderTextPart(part) {
  const span = createEl('span', 'header-ticker-text', part.text || '');
  return span;
}

// crea una pill metrica
function renderMetricPart(part) {
  const btn = createEl(
    'button',
    `metric-btn ${metricToneClass(part.tone)}`,
    part.value != null ? String(part.value) : '—'
  );
  btn.type = 'button';
  btn.dataset.metric = part.key;
  btn.setAttribute('aria-label', part.label || part.key);

  // il runtime legherà i popup
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // se non c'è il runtime, facciamo un fallback minimo
    if (!window.__TradeliaUI?.bindMetricInfoButtons) return;
  });

  return btn;
}

function renderPart(part) {
  if (part.kind === 'text') return renderTextPart(part);
  if (part.kind === 'metric') return renderMetricPart(part);
  return createEl('span', 'header-ticker-text', '');
}

function renderRow(row) {
  const rowEl = createEl('div', 'header-ticker-row');
  // mappa l'id in una classe
  if (row.id === 'intro-line') rowEl.classList.add('header-ticker-row--intro');
  else if (row.id === 'quality-line') rowEl.classList.add('header-ticker-row--quality');
  else if (row.id === 'window-line') rowEl.classList.add('header-ticker-row--meta');

  (row.parts || []).forEach((part) => {
    rowEl.appendChild(renderPart(part));
  });

  // attiva i tooltip del runtime anche qui
  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    window.__TradeliaUI.bindMetricInfoButtons(rowEl);
  }

  return rowEl;
}

function renderFooter(node, data) {
  const footer = node._footer;
  footer.innerHTML = '';

  const links = data.footer?.links || [];
  links.forEach((link) => {
    const btn = createEl('button', 'btn btn-sm', link.label || 'Azione');
    btn.addEventListener('click', () => {
      if (link.action === 'open-metrics-panel') {
        openMetricsPanel(data);
      }
    });
    footer.appendChild(btn);
  });

  // Audit opzionale
  if (data.meta?.auditPathId && window.__TradeliaUI?.openAuditPanel) {
    const auditBtn = createEl('button', 'btn btn-sm', 'Audit');
    auditBtn.addEventListener('click', () => {
      window.__TradeliaUI.openAuditPanel({
        AuditPathID: data.meta.auditPathId,
        Notes: ['Header verbale generato da Swing master.']
      });
    });
    footer.appendChild(auditBtn);
  }
}

// API: mount
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

// API: update
function update(node, data) {
  if (!node || !data) return;
  // classe di stato per la tonebar
  node.classList.remove('header-ticker--state-ok', 'header-ticker--state-warn', 'header-ticker--state-err');
  const st = data.meta?.state || data.State?.raw || data.State;
  if (st === 'ACTIVE') node.classList.add('header-ticker--state-ok');
  else if (st === 'HOLD') node.classList.add('header-ticker--state-warn');
  else if (st === 'REVIEW') node.classList.add('header-ticker--state-err');

  const body = node._body;
  body.innerHTML = '';

  const rows = Array.isArray(data.rows) ? data.rows : [];
  rows.forEach((row) => {
    body.appendChild(renderRow(row));
  });

  renderFooter(node, data);
}

export const headerTicker = {
  mount,
  update
};
