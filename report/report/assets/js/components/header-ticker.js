// /report/assets/js/components/header-ticker.js
// Header Ticker - Versione 2.0 (Semplificata e Robusta)
// - Rendering metriche inline
// - Gestione errori robusta
// - Usa Logger centralizzato

import Logger from '../utils/logger.js';

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== null) el.textContent = text;
  return el;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getToneClass(tone) {
  switch (tone) {
    case 'ok': return 'metric-inline--ok';
    case 'warn': return 'metric-inline--warn';
    case 'err': return 'metric-inline--err';
    default: return 'metric-inline--neutral';
  }
}

// ===== RENDERING =====
function renderTextPart(part) {
  const el = createEl('span', 'header-ticker-text');
  el.textContent = part.text || '';
  
  // Marca punteggiatura per gluing
  if (/^[,.;:!?()—–\-«»""]+$/.test((part.text || '').trim().replace(/\s+/g, ''))) {
    el.dataset.glue = '1';
  }
  
  return el;
}

function renderMetricPart(part) {
  const wrap = createEl('button', `metric-inline ${getToneClass(part.tone)}`);
  wrap.type = 'button';
  wrap.dataset.metric = part.key;
  wrap.setAttribute('aria-label', part.label || part.key);
  wrap.style.cursor = 'pointer';
  
  // Formatta valore
  let displayValue = '—';
  if (part.value != null && part.value !== '') {
    if (typeof part.value === 'number') {
      displayValue = Number.isInteger(part.value)
        ? String(part.value)
        : Number(part.value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      displayValue = String(part.value);
    }
  }
  
  const txt = createEl('span', `metric-inline-text metric-inline-text--${part.tone || 'neutral'}`, displayValue);
  txt.style.fontWeight = '600';
  txt.style.fontStyle = 'italic';
  txt.style.textDecoration = 'underline';
  
  wrap.appendChild(txt);
  
  // Click handler
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleMetricClick(part.key);
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
  
  // Classi per tipo riga
  if (row.id === 'company-line' || row.id === 'intro-line' || row.id === 'price-line') {
    rowEl.classList.add('header-ticker-row--intro');
  } else if (row.id === 'quality-line') {
    rowEl.classList.add('header-ticker-row--quality');
  } else if (row.id === 'window-line') {
    rowEl.classList.add('header-ticker-row--meta');
  }
  
  // Rendering parts con gluing intelligente
  const parts = row.parts || [];
  let pendingPunct = null;
  
  parts.forEach((part, idx) => {
    if (part.kind === 'text') {
      let text = String(part.text || '');
      
      // Gluing: punteggiatura iniziale
      const punctMatch = text.match(/^\s*([,.;:!?)—–\-«»""])\s*(.*)$/);
      if (punctMatch && idx > 0) {
        const punct = punctMatch[1];
        const rest = punctMatch[2] || '';
        const last = rowEl.lastElementChild;
        
        if (last) {
          const metricTxt = last.querySelector('.metric-inline-text');
          if (metricTxt) {
            metricTxt.textContent = (metricTxt.textContent || '') + punct + '\u00A0';
          } else {
            last.textContent = (last.textContent || '') + punct + '\u00A0';
          }
        }
        
        text = rest;
      }
      
      // Gluing: parentesi prima di metrica
      const openPunctMatch = text.match(/^\s*([(«"])\s*$/);
      const nextIsMetric = idx + 1 < parts.length && parts[idx + 1]?.kind === 'metric';
      
      if (openPunctMatch && nextIsMetric) {
        pendingPunct = openPunctMatch[1];
        return; // Salta questo part
      }
      
      // Aggiungi testo rimanente
      if (text.trim()) {
        rowEl.appendChild(renderTextPart({ kind: 'text', text }));
      }
    } else if (part.kind === 'metric') {
      const metricEl = renderPart(part);
      
      // Aggiungi parentesi pendente
      if (pendingPunct) {
        const metricTxt = metricEl.querySelector('.metric-inline-text');
        if (metricTxt) {
          metricTxt.textContent = pendingPunct + metricTxt.textContent;
        }
        pendingPunct = null;
      }
      
      rowEl.appendChild(metricEl);
    }
  });
  
  return rowEl;
}

function renderFooter(node, data) {
  const footer = node._footer;
  if (!footer) return;
  
  // Footer vuoto - pulsante "Scopri tutte le metriche" rimosso
  footer.innerHTML = '';
  footer.style.display = 'none';
}

// ===== METRIC CLICK HANDLER =====
function handleMetricClick(metricKey) {
  Logger.debug('HeaderTicker', `Click su metrica: ${metricKey}`);
  
  try {
    const ui = window.__TradeliaUI;
    const headerData = window.__headerTickerData;
    
    if (!headerData) {
      Logger.warn('HeaderTicker', 'headerData non disponibile');
      return;
    }
    
    // Usa popup semplice
    if (ui?.openMetricPopup) {
      const allMetrics = headerData.metricsPanel || [];
      ui.openMetricPopup(metricKey, allMetrics);
    } else {
      Logger.warn('HeaderTicker', 'Popup non disponibile');
    }
  } catch (err) {
    Logger.error('HeaderTicker', 'Errore gestione click metrica', err);
  }
}

// ===== MOUNT =====
function mount(containerEl) {
  if (!containerEl) {
    Logger.error('HeaderTicker', 'mount: containerEl non fornito');
    return null;
  }
  
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

// ===== UPDATE =====
function update(node, data) {
  if (!node) {
    Logger.error('HeaderTicker', 'update: node non fornito');
    return;
  }
  
  if (!data || typeof data !== 'object') {
    Logger.error('HeaderTicker', 'update: data non valido', data);
    if (node._body) {
      node._body.innerHTML = `
        <div style="padding: 1rem; color: var(--muted); font-size: 13px;">
          ⚠️ Dati header non validi
        </div>
      `;
    }
    return;
  }
  
  // Salva dati globalmente
  if (typeof window !== 'undefined') {
    const headerData = { ...data };
    if (!headerData.metricsPanel) {
      headerData.metricsPanel = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
    }
    window.__headerTickerData = headerData;
    Logger.debug('HeaderTicker', `headerData salvato con ${headerData.metricsPanel.length} metriche`);
  }
  
  // State classes
  node.classList.remove('header-ticker--state-ok', 'header-ticker--state-warn', 'header-ticker--state-err');
  const st = data.meta?.state || data.State?.raw || data.State;
  if (st === 'ACTIVE') node.classList.add('header-ticker--state-ok');
  else if (st === 'HOLD') node.classList.add('header-ticker--state-warn');
  else if (st === 'REVIEW') node.classList.add('header-ticker--state-err');
  
  const body = node._body;
  if (!body) {
    Logger.error('HeaderTicker', 'update: body non trovato');
    return;
  }
  
  body.innerHTML = '';
  
  // Rendering rows
  const rows = Array.isArray(data.rows) ? data.rows : [];
  
  if (rows.length > 0) {
    Logger.debug('HeaderTicker', `Rendering ${rows.length} righe`);
    
    rows.forEach((row) => {
      try {
        const rowEl = renderRow(row);
        if (rowEl) {
          body.appendChild(rowEl);
        }
      } catch (err) {
        Logger.error('HeaderTicker', 'Errore rendering riga', err);
      }
    });
    
    if (body.children.length === 0) {
      Logger.error('HeaderTicker', 'Nessuna riga renderizzata');
      body.innerHTML = `
        <div style="padding: 1rem; color: var(--muted); font-size: 13px;">
          ⚠️ Errore rendering righe
        </div>
      `;
    }
  } else {
    // Fallback legacy
    Logger.debug('HeaderTicker', 'Usando fallback legacy');
    
    const intro = {
      id: 'intro-line',
      parts: [
        { kind: 'text', text: data.Ticker ? String(data.Ticker) : '—' },
        ...(data.Venue ? [
          { kind: 'text', text: '(' },
          { kind: 'text', text: String(data.Venue) },
          { kind: 'text', text: ')' }
        ] : [])
      ]
    };
    
    const priceStr = (data.Price == null || isNaN(data.Price))
      ? '—'
      : Number(data.Price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const chgVal = (data.ChangePct != null && !isNaN(Number(data.ChangePct))) ? Number(data.ChangePct) : null;
    const chgTone = chgVal == null ? 'neutral' : (chgVal > 0 ? 'ok' : (chgVal < 0 ? 'err' : 'neutral'));
    const chgStr = chgVal == null ? '—%' : `${chgVal > 0 ? '+' : ''}${chgVal.toFixed(2)}%`;
    
    const quality = {
      id: 'quality-line',
      parts: [
        { kind: 'text', text: 'Price ' },
        { kind: 'metric', key: 'Price', value: priceStr, tone: 'neutral', label: 'Price' },
        { kind: 'text', text: ', Change ' },
        { kind: 'metric', key: 'ChangePct', value: chgStr, tone: chgTone, label: 'ChangePct' },
        { kind: 'text', text: ', CCY ' },
        { kind: 'metric', key: 'Currency', value: data.Currency || '—', tone: 'neutral', label: 'Currency' }
      ]
    };
    
    const windowLine = {
      id: 'window-line',
      parts: [
        { kind: 'text', text: `Snapshot ${data.Start ?? '—'} → ${data.End ?? '—'}` },
        { kind: 'text', text: ' · ' },
        { kind: 'text', text: `Updated ${(() => {
          try {
            return new Date(data.UpdatedAt).toISOString().slice(11, 16) + '\u00A0UTC';
          } catch {
            return data.UpdatedAt || '—';
          }
        })()}` }
      ]
    };
    
    [intro, quality, windowLine].forEach(r => {
      try {
        const rowEl = renderRow(r);
        if (rowEl) body.appendChild(rowEl);
      } catch (err) {
        Logger.error('HeaderTicker', 'Errore rendering riga legacy', err);
      }
    });
  }
  
  // Footer
  renderFooter(node, data);
  
  Logger.debug('HeaderTicker', `Update completato: ${body.children.length} righe`);
}

// ===== EXPORT =====
export const headerTicker = {
  mount,
  update
};
