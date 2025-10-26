// Header-Ticker Module (istituzionale, con Price / Change% / Currency + tooltip fisso top-right)

const toneToClass = (tone)=>({
  green:'var(--tone-g)',
  yellow:'var(--tone-y)',
  red:'var(--tone-r)',
  neutral:'var(--tone-n)'
}[tone]||'var(--tone-n)');

// pill() ora crea una card KPI con il pulsante "?" in alto a destra assoluto
function pill(label, key, opts = {}) {
  const pr = opts.priority ? ` data-priority="${opts.priority}"` : '';

  // se vogliamo mostrare tooltip su questa metrica, usiamo data-metric = key
  // NB: se non vuoi tooltip per certe pill puoi fare condizionale, ma per ora lo mettiamo sempre
  const metricAttr = `data-metric="${key}"`;

  return `
  <div class="pill relative"${pr} data-key="${key}"
       style="
         background:var(--surface-card);
         border:1px solid var(--br-card);
         border-radius:var(--radius-card);
         box-shadow:var(--shadow-card);
         padding:0.75rem 0.75rem 0.75rem 0.75rem;
       ">

    <!-- barra tono a sinistra -->
    <span class="tonebar"
      style="
        position:absolute;
        left:0;
        top:0;
        bottom:0;
        width:4px;
        border-radius:var(--radius-card) 0 0 var(--radius-card);
        background:${toneToClass('neutral')};
      ">
    </span>

    <!-- bottone tooltip fisso top-right -->
    <button
      class="info-btn info-btn--mini"
      ${metricAttr}
      aria-label="Info ${key}"
      style="
        position:absolute;
        top:0.5rem;
        right:0.5rem;
        z-index:1;
      "
    >?</button>

    <div class="min-w-0">
      <!-- label metrica: padding-right per non andare sotto il ? -->
      <div class="lab text-[11px] uppercase tracking-wide font-semibold leading-[1.3] text-[color:var(--muted)]"
           style="padding-right:1.5rem;">
        ${label}
      </div>

      <!-- valore -->
      <div class="val truncate text-[13px] font-semibold leading-[1.4] text-[color:var(--ink)] mt-2"
           data-bind="value:${key}">—</div>
    </div>
  </div>`;
}

// l'ordine di visualizzazione rimane lo stesso
function markup(){
  return [
    pill('Snapshot','Snapshot'),
    pill('Price','Price'),
    pill('Δ%','ChangePct'),
    pill('Currency','Currency', { priority:'low' }),

    pill('Freshness','Freshness'),
    pill('Confidence','ConfidenceFinal'),
    pill('OCR','OCR_Conf', { priority:'low' }),
    pill('DataInt','DataIntegrity', { priority:'low' }),
    pill('FeedSync','FeedSync', { priority:'low' }),

    pill('Stato','State'),

    // temporali
    pill('Inizio','DataStart', { priority:'low' }),
    pill('Fine','DataEnd', { priority:'low' })
  ].join('');
}

function setField(root,key,{value,tone}){
  const valEl  = root.querySelector(`[data-bind="value:${key}"]`);
  const toneEl = root.querySelector(`.pill[data-key="${key}"] .tonebar`);
  if (valEl)  valEl.textContent = (value ?? '—');
  if (toneEl) toneEl.style.background = toneToClass(tone||'neutral');
}

// Semafori (uguali)
const tone = {
  confidence: (v)=> (v==null||isNaN(v)) ? 'neutral' : v>=0.80 ? 'green' : v>=0.60 ? 'yellow' : 'red',
  freshness:  (label)=> !label ? 'neutral' : /T-0/i.test(label) ? 'green' : /T-1/i.test(label) ? 'yellow' : 'red',
  simple01:   (v)=> (v==null||isNaN(v)) ? 'neutral' : v>=0.85 ? 'green' : v>=0.65 ? 'yellow' : 'red',
  state:      (s)=> ({ACTIVE:'green', REVIEW:'yellow', HOLD:'red'})[(String(s||'').toUpperCase())] || 'neutral',
  changePct:  (v)=> (v==null||isNaN(v)) ? 'neutral' : (v>0 ? 'green' : v<0 ? 'red' : 'neutral')
};

export function mount(slot){
  // Montiamo il markup delle pill
  slot.innerHTML = markup();

  // Mettiamo skeleton sui valori
  slot.querySelectorAll('.val').forEach(v=>v.classList.add('skel'));

  // IMPORTANTISSIMO:
  // qui bindiamo i tooltip "?" usando la stessa funzione globale dell'app,
  // così non devi fare altro.
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(slot);
    } catch(e){}
  }
}

export function update(d={}){
  const root = document.getElementById('header-ticker');
  root.querySelectorAll('.val').forEach(v=>v.classList.remove('skel'));

  // Costruiamo testo Snapshot come due righe Start/End combinate
  const snapStart = d?.Start || d?.DataStart || '—';
  const snapEnd   = d?.End   || d?.DataEnd   || '—';
  const snapText  = `${snapStart}\n${snapEnd}`;
  setField(root,'Snapshot', { value:snapText, tone:'neutral' });

  // Price
  const px = (d?.Price!=null && isFinite(Number(d.Price))) ? Number(d.Price).toFixed(2).replace('.',',') : null;
  setField(root,'Price',     { value: px ?? '—', tone:'neutral' });

  // Δ%
  const ch = (d?.ChangePct!=null) ? Number(d.ChangePct) : null;
  const chText = (ch!=null && isFinite(ch))
    ? `${ch > 0 ? '+' : ''}${ch.toFixed(2).replace('.',',')}%`
    : '—';
  setField(root,'ChangePct', { value: chText, tone: tone.changePct(ch) });

  // Currency
  setField(root,'Currency',  { value:d?.Currency, tone:'neutral' });

  // Freshness
  const freshLabel = d?.FreshnessLabel ?? d?.Freshness;
  setField(root,'Freshness', { value:freshLabel || '—', tone: tone.freshness(freshLabel) });

  // Confidence
  const conf = Number(d?.ConfidenceFinal);
  setField(root,'ConfidenceFinal',{ value: isFinite(conf)? conf.toFixed(2).replace('.',',') : '—', tone: tone.confidence(conf) });

  // OCR Conf
  const ocr = Number(d?.OCR_Conf);
  setField(root,'OCR_Conf',      { value: isFinite(ocr)? ocr.toFixed(2).replace('.',',') : '—', tone: tone.simple01(ocr) });

  // DataIntegrity
  const di  = Number(d?.DataIntegrity);
  setField(root,'DataIntegrity', { value: isFinite(di)?  di.toFixed(2).replace('.',',')  : '—', tone: tone.simple01(di) });

  // FeedSync
  const fs  = Number(d?.FeedSync);
  setField(root,'FeedSync',      { value: isFinite(fs)?  fs.toFixed(2).replace('.',',')  : '—', tone: tone.simple01(fs) });

  // Stato
  const state = d?.State ?? d?.ReportState;
  setField(root,'State', { value: state || '—', tone: tone.state(state) });

  // Inizio / Fine (campi dedicati in coda)
  setField(root,'DataStart',{ value:d?.Start || '—', tone:'neutral' });
  setField(root,'DataEnd',  { value:d?.End   || '—', tone:'neutral' });
}


// Utility: se già ce l'hai altrove puoi rimuoverle da qui, ma le lascio locali per sicurezza.
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
