// /report/assets/js/components/header-ticker.js
// Header verbale Tradelia AI (JSON-driven, inline-metrics)

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

async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui?.openPanel) return;

  const list = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
  const rowsHtml = await Promise.all(
    list.map(async (m) => {
      const g = await fetchGlossaryEntry(m.key);
      return `
        <tr>
          <td class="py-2 pr-3"><div class="metric-btn pill--neutral">${m.label || m.key}</div></td>
          <td class="py-2 pr-3">${m.value ?? '—'}</td>
          <td class="py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${g?.what || '—'}</td>
          <td class="py-2 pr-3 text-[13px] text-[color:var(--ink-soft)]">${g?.how || '—'}</td>
          <td class="py-2 pr-3 text-[13px] text-[color:var(--muted)]">${g?.source || '—'}</td>
        </tr>
      `;
    })
  );

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

function renderTextPart(part) {
  const txt = part.text || '';
  const el = createEl('span', 'header-ticker-text', txt);

  // se è solo punteggiatura o parentesi la incolliamo
  if (/^[,.;:!?)]$/.test(txt.trim())) {
    el.dataset.glue = '1';
  }

  return el;
}

function renderMetricPart(part) {
  const wrap = createEl('button', `metric-inline ${metricToneClass(part.tone)}`);
  wrap.type = 'button';
  wrap.dataset.metric = part.key;
  wrap.setAttribute('aria-label', part.label || part.key);

  const txt = createEl(
    'span',
    `metric-inline-text metric-inline-text--${part.tone || 'neutral'}`,
    part.value != null ? String(part.value) : '—'
  );

  txt.style.fontWeight = '600';
  txt.style.fontStyle = 'italic';
  txt.style.textDecoration = 'underline';

  wrap.appendChild(txt);

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
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

  if (row.id === 'intro-line') rowEl.classList.add('header-ticker-row--intro');
  else if (row.id === 'quality-line') rowEl.classList.add('header-ticker-row--quality');
  else if (row.id === 'window-line') rowEl.classList.add('header-ticker-row--meta');

  (row.parts || []).forEach((part) => {
    rowEl.appendChild(renderPart(part));
  });

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
      if (link.action === 'open-metrics-panel') openMetricsPanel(data);
    });
    footer.appendChild(btn);
  });

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

  // testo hint rimosso
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
  rows.forEach((row) => {
    body.appendChild(renderRow(row));
  });

  renderFooter(node, data);
}

export const headerTicker = {
  mount,
  update
};
