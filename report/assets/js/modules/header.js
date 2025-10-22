// Header-Ticker Module (istituzionale, con Price / Change% / Currency)

const toneToClass = (tone)=>({
  green:'var(--tone-g)', yellow:'var(--tone-y)', red:'var(--tone-r)', neutral:'var(--tone-n)'
}[tone]||'var(--tone-n)');

function pill(label,key,opts={}){
  const pr = opts.priority ? ` data-priority="${opts.priority}"` : '';
  return `
  <div class="pill"${pr} data-key="${key}">
    <span class="tonebar" style="background:${toneToClass('neutral')}"></span>
    <div class="min-w-0">
      <div class="lab">${label}</div>
      <div class="val truncate" data-bind="value:${key}">—</div>
    </div>
  </div>`;
}

function markup(){
  // Ordine consigliato desktop; su mobile puoi nascondere alcune con CSS se vuoi
  return [
    pill('Ticker','Ticker'),
    pill('Venue','Venue'),
    pill('Price','Price'),
    pill('Δ%','ChangePct'),
    pill('Currency','Currency', { priority:'low' }),

    pill('Freshness','Freshness'),
    pill('Confidence','ConfidenceFinal'),
    pill('OCR','OCR_Conf', { priority:'low' }),
    pill('DataInt','DataIntegrity', { priority:'low' }),
    pill('FeedSync','FeedSync', { priority:'low' }),

    pill('Stato','State'),

    // temporali (se vuoi possono stare in coda)
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

// Semafori
const tone = {
  confidence: (v)=> (v==null||isNaN(v)) ? 'neutral' : v>=0.80 ? 'green' : v>=0.60 ? 'yellow' : 'red',
  freshness:  (label)=> !label ? 'neutral' : /T-0/i.test(label) ? 'green' : /T-1/i.test(label) ? 'yellow' : 'red',
  simple01:   (v)=> (v==null||isNaN(v)) ? 'neutral' : v>=0.85 ? 'green' : v>=0.65 ? 'yellow' : 'red',
  state:      (s)=> ({ACTIVE:'green', REVIEW:'yellow', HOLD:'red'})[(String(s||'').toUpperCase())] || 'neutral',
  changePct:  (v)=> (v==null||isNaN(v)) ? 'neutral' : (v>0 ? 'green' : v<0 ? 'red' : 'neutral')
};

export function mount(slot){
  slot.innerHTML = markup();
  // skeleton breve in attesa dei dati
  slot.querySelectorAll('.val').forEach(v=>v.classList.add('skel'));
}

export function update(d={}){
  const root = document.getElementById('header-ticker');
  root.querySelectorAll('.val').forEach(v=>v.classList.remove('skel'));

  // Identificativi / temporali
  setField(root,'Ticker',   { value:d?.Ticker, tone:'neutral' });
  setField(root,'Venue',    { value:d?.Venue,  tone:'neutral' });
  setField(root,'DataStart',{ value:d?.Start,  tone:'neutral' });
  setField(root,'DataEnd',  { value:d?.End,    tone:'neutral' });

  // Mercato: Price / Change% / Currency
  const px = (d?.Price!=null && isFinite(Number(d.Price))) ? Number(d.Price).toFixed(2) : null;
  setField(root,'Price',     { value: px ?? '—', tone:'neutral' });

  const ch = (d?.ChangePct!=null) ? Number(d.ChangePct) : null;
  const chText = (ch!=null && isFinite(ch)) ? `${ch.toFixed(2)}%` : '—';
  setField(root,'ChangePct', { value: chText, tone: tone.changePct(ch) });

  setField(root,'Currency',  { value:d?.Currency, tone:'neutral' });

  // Qualità dati
  const freshLabel = d?.FreshnessLabel ?? d?.Freshness;
  setField(root,'Freshness', { value:freshLabel, tone: tone.freshness(freshLabel) });

  const conf = Number(d?.ConfidenceFinal);
  setField(root,'ConfidenceFinal',{ value: isFinite(conf)? conf.toFixed(2) : '—', tone: tone.confidence(conf) });

  const ocr = Number(d?.OCR_Conf);
  setField(root,'OCR_Conf',      { value: isFinite(ocr)? ocr.toFixed(2) : '—', tone: tone.simple01(ocr) });

  const di  = Number(d?.DataIntegrity);
  setField(root,'DataIntegrity', { value: isFinite(di)?  di.toFixed(2)  : '—', tone: tone.simple01(di) });

  const fs  = Number(d?.FeedSync);
  setField(root,'FeedSync',      { value: isFinite(fs)?  fs.toFixed(2)  : '—', tone: tone.simple01(fs) });

  // Stato
  const state = d?.State ?? d?.ReportState;
  setField(root,'State', { value: state || '—', tone: tone.state(state) });
}
