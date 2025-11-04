/ /report/assets/js/components/header-ticker.js
// Header verbale Tradelia AI (JSON-driven, inline-metrics)
// - metriche = testo evidenziato (italic + underline)
// - punteggiatura/parentesi SI ATTACCANO al nodo precedente
// - footer con pulsanti dal JSON
// - Usa Logger centralizzato invece di console.log

import Logger from '../utils/logger.js';

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

// Apri drawer metriche usando funzione centralizzata da ui-runtime
async function openMetricsPanel(data) {
  const ui = window.__TradeliaUI;
  if (!ui) {
    Logger.warn('HeaderTicker', 'window.__TradeliaUI non disponibile');
    return Promise.resolve();
  }
  if (!ui.openMetricsDrawer) {
    Logger.warn('HeaderTicker', 'window.__TradeliaUI.openMetricsDrawer non disponibile');
    return Promise.resolve();
  }

  // Usa funzione centralizzata da ui-runtime
  return ui.openMetricsDrawer(data);
}

function renderTextPart(part) {
  const txt = part.text || '';
  const el = createEl('span', 'header-ticker-text', txt);

  // se è solo punteggiatura o parentesi → segniamo che va incollata
  if (/^[,.;:!?()—–\-«»""]+$/.test(txt.trim().replace(/\s+/g,''))) {
    el.dataset.glue = '1';
  }

  return el;
}

function renderMetricPart(part) {
  const wrap = createEl('button', `metric-inline ${metricToneClass(part.tone)}`);
  wrap.type = 'button';
  wrap.dataset.metric = part.key;
  wrap.dataset.metricKey = part.key;
  wrap.setAttribute('aria-label', part.label || part.key);
  wrap.style.cursor = 'pointer'; // Assicura che sia cliccabile

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

  wrap.dataset.metricKey = part.key;
  wrap.dataset.metricClickHandler = 'true';

  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    Logger.debug('HeaderTicker', `Click su metrica: ${part.key}`);
    try {
      const ui = window.__TradeliaUI;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      
      Logger.debug('HeaderTicker', `isMobile: ${isMobile}, ui disponibile: ${!!ui}`);
      
      if (isMobile) {
        // Mobile: apri drawer "Scopri tutte le metriche" e naviga a quella metrica
        const headerData = window.__headerTickerData;
        Logger.debug('HeaderTicker', `Mobile - headerData disponibile: ${!!headerData}`);
        if (headerData && ui?.openMetricsDrawer) {
          Logger.debug('HeaderTicker', 'Mobile - apri drawer');
          // Apri pannello metriche usando funzione centralizzata
          ui.openMetricsDrawer(headerData).then(() => {
            Logger.debug('HeaderTicker', 'Mobile - drawer aperto, naviga a metrica');
            // Usa requestAnimationFrame invece di setTimeout per navigare immediatamente
            requestAnimationFrame(() => {
              if (ui?.navigateToMetricInMobileDrawer) {
                ui.navigateToMetricInMobileDrawer(part.key);
              }
            });
          }).catch(err => {
            Logger.error('HeaderTicker', 'Mobile - errore apertura drawer', err);
          });
        } else {
          Logger.warn('HeaderTicker', 'Mobile - drawer non disponibile', {
            headerData: !!headerData,
            openMetricsDrawer: !!ui?.openMetricsDrawer
          });
        }
      } else {
        // Desktop: apri drawer e seleziona metrica
        Logger.debug('HeaderTicker', `Desktop - apri drawer con metrica: ${part.key}`);
        if (ui?.openMetricsDrawerFromMetric) {
          Logger.debug('HeaderTicker', 'Desktop - chiamando openMetricsDrawerFromMetric');
          try {
            ui.openMetricsDrawerFromMetric(part.key);
            Logger.debug('HeaderTicker', 'Desktop - openMetricsDrawerFromMetric chiamata con successo');
          } catch (err) {
            Logger.error('HeaderTicker', 'Desktop - errore in openMetricsDrawerFromMetric', err);
          }
        } else {
          Logger.warn('HeaderTicker', 'Desktop - openMetricsDrawerFromMetric non disponibile', {
            ui: !!ui
          });
        }
      }
    } catch (err) {
      Logger.error('HeaderTicker', 'Errore apertura metrica', err);
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

  // Wrapper per coppie label:value su mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let currentPair = null;
  
  (row.parts || []).forEach((part, idx, arr) => {
    if (part.kind === 'text' && part.text) {
      let remaining = String(part.text);

      // 1) Gluing: gestisce punteggiatura che può essere incollata prima o dopo
      // Se il testo è solo una parentesi aperta e il prossimo elemento è una metrica,
      // segna che va incollata alla metrica successiva (prefissa)
      const isOnlyPunct = /^\s*([(«"])/.test(remaining);
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
          const textEl = renderTextPart({ kind:'text', text: remaining });
          // Su mobile: se il testo termina con ":" e il prossimo elemento è una metrica, wrappa insieme
          // MA solo se il testo è breve (max 20 caratteri) per evitare di wrappare frasi lunghe
          const isShortLabel = remaining.trim().length <= 20;
          if (isMobile && idx + 1 < arr.length && arr[idx + 1]?.kind === 'metric' && /:\s*$/.test(remaining) && isShortLabel) {
            if (!currentPair) {
              currentPair = createEl('span', 'header-ticker-pair');
            }
            currentPair.appendChild(textEl);
          } else {
            // Chiudi pair se esiste
            if (currentPair) {
              rowEl.appendChild(currentPair);
              currentPair = null;
            }
            rowEl.appendChild(textEl);
          }
        }
      }
    } else {
      // Se è una metrica, controlla se c'è una parentesi pendente da aggiungere prima
      const pendingPunct = rowEl.dataset.pendingPunct;
      const metricEl = renderPart(part);
      
      if (pendingPunct) {
        delete rowEl.dataset.pendingPunct;
        // Aggiungi la parentesi prima del valore della metrica
        const metricTxt = metricEl.querySelector('.metric-inline-text');
        if (metricTxt) {
          metricTxt.textContent = pendingPunct + metricTxt.textContent;
        }
      }
      
      // Su mobile: se c'è un pair in corso, aggiungi la metrica al pair
      if (isMobile && currentPair) {
        currentPair.appendChild(metricEl);
        rowEl.appendChild(currentPair);
        currentPair = null;
      } else {
        // Chiudi pair se esiste
        if (currentPair) {
          rowEl.appendChild(currentPair);
          currentPair = null;
        }
        rowEl.appendChild(metricEl);
      }
    }
  });
  
  // Chiudi eventuale pair rimasto aperto
  if (currentPair) {
    rowEl.appendChild(currentPair);
  }

  return rowEl;
}

function renderFooter(node, data) {
  const footer = node._footer;
  if (!footer) return;
  
  footer.innerHTML = '';

  const links = data.footer?.links || [];
  links.forEach((link) => {
    const btn = createEl('button', 'btn btn-sm', link.label || 'Azione');
    // Usa una flag per evitare doppi trigger
    let isHandling = false;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isHandling) {
        Logger.debug('HeaderTicker', 'Footer button click già in gestione, skip');
        return;
      }
      isHandling = true;
      
      Logger.debug('HeaderTicker', `Footer button click: ${link.action}`);
      if (link.action === 'open-metrics-panel') {
        try {
          const ui = window.__TradeliaUI;
          if (!ui?.openMetricsDrawer) {
            Logger.warn('HeaderTicker', 'Footer - openMetricsDrawer non disponibile');
            isHandling = false;
            return;
          }
          
          // Usa sempre i dati globali per avere metricsPanel garantito
          const headerData = window.__headerTickerData || data;
          Logger.debug('HeaderTicker', `Footer - apri drawer con headerData, metricsPanel: ${headerData.metricsPanel?.length || 0}`);
          ui.openMetricsDrawer(headerData).then(() => {
            Logger.debug('HeaderTicker', 'Footer - drawer aperto con successo');
            isHandling = false;
          }).catch(err => {
            Logger.error('HeaderTicker', 'Footer - errore apertura drawer', err);
            isHandling = false;
          });
        } catch (err) {
          Logger.error('HeaderTicker', 'Footer - errore apertura metrics panel', err);
          isHandling = false;
        }
      } else {
        isHandling = false;
      }
    }, { once: false }); // Mantieni il listener ma usa flag per evitare doppi trigger
    footer.appendChild(btn);
  });
}

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

function update(node, data) {
  if (!node) {
    Logger.error('HeaderTicker', 'update: node non fornito');
    return;
  }
  
  if (!data || typeof data !== 'object') {
    Logger.error('HeaderTicker', 'update: data non valido', data);
    // Mostra messaggio di errore nel body
    if (node._body) {
      node._body.innerHTML = `
        <div style="padding: 1rem; color: var(--muted); font-size: 13px;">
          ⚠️ Dati header non validi
        </div>
      `;
    }
    return;
  }

  // Salva dati header globalmente per aprire drawer da click su metrica
  // IMPORTANTE: assicura che metricsPanel sia sempre presente
  if (typeof window !== 'undefined') {
    const headerData = { ...data };
    // Se metricsPanel non è presente, crealo da metricsPanel se esiste, altrimenti array vuoto
    if (!headerData.metricsPanel && data.metricsPanel) {
      headerData.metricsPanel = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
    } else if (!headerData.metricsPanel) {
      headerData.metricsPanel = [];
    }
    window.__headerTickerData = headerData;
    Logger.debug('HeaderTicker', `update - headerData salvato con metricsPanel: ${headerData.metricsPanel.length}`);
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
  if (!body) {
    Logger.error('HeaderTicker', 'update: body non trovato nel node');
    return;
  }
  
  body.innerHTML = '';

  const rows = Array.isArray(data.rows) ? data.rows : [];
  if (rows.length > 0) {
    Logger.debug('HeaderTicker', `Rendering ${rows.length} righe`);
    rows.forEach((row) => {
      try {
        const rowEl = renderRow(row);
        if (rowEl) {
          body.appendChild(rowEl);
        } else {
          Logger.warn('HeaderTicker', 'renderRow ritornato null', row);
        }
      } catch (err) {
        Logger.error('HeaderTicker', 'Errore rendering riga', err);
      }
    });
    
    // Verifica che almeno una riga sia stata renderizzata
    if (body.children.length === 0) {
      Logger.error('HeaderTicker', 'Nessuna riga renderizzata nonostante rows.length > 0');
      body.innerHTML = `
        <div style="padding: 1rem; color: var(--muted); font-size: 13px;">
          ⚠️ Errore rendering righe header
        </div>
      `;
    }
  } else {
    // Fallback legacy: costruisce righe base da campi flat (Ticker, Price, ChangePct, ...)
    Logger.debug('HeaderTicker', 'Usando fallback legacy', {
      Ticker: data.Ticker,
      CompanyName: data.CompanyName,
      Price: data.Price
    });
    
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

    [intro, quality, windowLine].forEach(r => {
      try {
        const rowEl = renderRow(r);
        if (rowEl) {
          body.appendChild(rowEl);
        }
      } catch (err) {
        Logger.error('HeaderTicker', 'Errore rendering riga legacy', err);
      }
    });
  }

  renderFooter(node, data);
  
  Logger.debug('HeaderTicker', `Update completato, elementi renderizzati: ${body.children.length}`);
}

export const headerTicker = {
  mount,
  update
};
