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

async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui) {
    console.warn('[HeaderTicker] window.__TradeliaUI non disponibile');
    return;
  }
  if (!ui.openPanel) {
    console.warn('[HeaderTicker] window.__TradeliaUI.openPanel non disponibile');
    return;
  }

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

  const txt = createEl(
    'span',
    `metric-inline-text metric-inline-text--${part.tone || 'neutral'}`,
    part.value != null ? String(part.value) : '—'
  );

  // stile che avevi tu
  txt.style.fontWeight = '600';
  txt.style.fontStyle = 'italic';
  txt.style.textDecoration = 'underline';

  wrap.appendChild(txt);

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const ui = window.__TradeliaUI;
      if (ui?.openMetricPopup) {
        ui.openMetricPopup(part.key);
      } else {
        console.warn('[HeaderTicker] __TradeliaUI.openMetricPopup non disponibile');
      }
    } catch (err) {
      console.warn('[HeaderTicker] Errore apertura popup metrica:', err);
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

  if (row.id === 'intro-line') rowEl.classList.add('header-ticker-row--intro');
  else if (row.id === 'quality-line') rowEl.classList.add('header-ticker-row--quality');
  else if (row.id === 'window-line') rowEl.classList.add('header-ticker-row--meta');

  (row.parts || []).forEach((part) => {
    if (part.kind === 'text' && part.text) {
      let remaining = String(part.text);

      // 1) Gluing: se il testo INIZIA con spazi + punteggiatura, incolla la punteggiatura al nodo precedente
      let matched = false;
      while (true) {
        const m = remaining.match(/^\s*([,.;:!?()—–\-«»“”])\s*(.*)$/);
        if (!m) break;
        matched = true;
        const punct = m[1];
        const rest  = m[2] || '';
        const last = rowEl.lastElementChild;
        if (last) {
          const metricTxt = last.querySelector('.metric-inline-text');
          const spacer = (punct === '(' || punct === '«' || punct === '“') ? '' : '\u00A0';
          if (metricTxt) metricTxt.textContent = (metricTxt.textContent || '') + punct + spacer;
          else last.textContent = (last.textContent || '') + punct + spacer;
        } else {
          // se non c'è precedente, appendiamo la punteggiatura come testo semplice (raro)
          rowEl.appendChild(renderTextPart({ kind:'text', text: punct }));
        }
        remaining = rest;
        // continua a consumare punteggiatura iniziale, poi esci
        if (!/^\s*([,.;:!?()—–\-«»“”])/.test(remaining)) break;
      }

      // 2) Se resta contenuto non-punteggiatura, appendi come testo normale
      if (remaining && remaining.trim() !== '' || !matched) {
        rowEl.appendChild(renderTextPart({ kind:'text', text: remaining }));
      }
    } else {
      rowEl.appendChild(renderPart(part));
    }
  });

  // Bind metric info buttons (se disponibile)
  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(rowEl);
    } catch (e) {
      console.warn('[HeaderTicker] bindMetricInfoButtons error:', e);
    }
  }

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
