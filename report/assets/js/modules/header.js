// Header-Ticker Module (istituzionale, indipendente)
// API: mount(slotEl), update(data)


const toneToClass = (tone)=>({green:'var(--tone-g)',yellow:'var(--tone-y)',red:'var(--tone-r)',neutral:'var(--tone-n)'}[tone]||'var(--tone-n)');


function pill(label,key){
return `
<div class="pill" data-key="${key}">
<span class="tonebar" style="background:${toneToClass('neutral')}"></span>
<div class="min-w-0">
<div class="lab">${label}</div>
<div class="val truncate" data-bind="value:${key}">—</div>
</div>
</div>`;
}


function markup(){
return [
pill('Inizio','DataStart'),
pill('Fine','DataEnd'),
pill('Ticker','Ticker'),
pill('Venue','Venue'),
pill('Freshness','Freshness'),
pill('Stato','State'),
pill('Confidence','ConfidenceFinal'),
pill('OCR','OCR_Conf'),
pill('DataInt','DataIntegrity'),
pill('FeedSync','FeedSync')
].join('');
}


function setField(root,key,{value,tone}){
const valEl = root.querySelector(`[data-bind="value:${key}"]`);
const toneEl = root.querySelector(`.pill[data-key="${key}"] .tonebar`);
if(valEl) valEl.textContent = (value ?? '—');
if(toneEl) toneEl.style.background = toneToClass(tone||'neutral');
}


// policy colore (puoi esternalizzare in JSON se vuoi)
const tone = {
confidence:(v)=> (v==null||isNaN(v))?'neutral': v>=0.80?'green': v>=0.60?'yellow':'red',
freshness:(label)=> !label?'neutral': /T-0/i.test(label)?'green': /T-1/i.test(label)?'yellow':'red',
simple01:(v)=> (v==null||isNaN(v))?'neutral': v>=0.85?'green': v>=0.65?'yellow':'red',
state:(s)=>({ACTIVE:'green',REVIEW:'yellow',HOLD:'red'})[(String(s||'').toUpperCase())]||'neutral'
};


export function mount(slot){
slot.innerHTML = markup();
// Skeleton veloce
slot.querySelectorAll('.val').forEach(v=>v.classList.add('skel'));
}


export function update(data={}){
const root = document.getElementById('header-ticker');
// pulizia skeleton
root.querySelectorAll('.val').forEach(v=>v.classList.remove('skel'));


setField(root,'DataStart',{ value:data?.Start, tone:'neutral' });
setField(root,'DataEnd', { value:data?.End, tone:'neutral' });
setField(root,'Ticker', { value:data?.Ticker,tone:'neutral' });
setField(root,'Venue', { value:data?.Venue, tone:'neutral' });


const freshLabel = data?.FreshnessLabel ?? data?.Freshness;
setField(root,'Freshness',{ value:freshLabel, tone: tone.freshness(freshLabel) });


const conf = Number(data?.ConfidenceFinal);
setField(root,'ConfidenceFinal',{ value: isFinite(conf)? conf.toFixed(2):'—', tone: tone.confidence(conf) });


const ocr=Number(data?.OCR_Conf), di=Number(data?.DataIntegrity), fs=Number(data?.FeedSync);
setField(root,'OCR_Conf', { value:isFinite(ocr)? ocr.toFixed(2):'—', tone:tone.simple01(ocr) });
setField(root,'DataIntegrity',{ value:isFinite(di)? di.toFixed(2): '—', tone:tone.simple01(di) });
setField(root,'FeedSync', { value:isFinite(fs)? fs.toFixed(2): '—', tone:tone.simple01(fs) });


const state = data?.State ?? data?.ReportState;
setField(root,'State',{ value: state || '—', tone: tone.state(state) });
}
