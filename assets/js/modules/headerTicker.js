// /assets/js/modules/headerTicker.js
import { tone } from '../utils/tone.js';

export function initHeaderTicker(data){
  const el=document.getElementById('header-ticker');
  const P=(key,label)=>`
    <div class="pill">
      <span class="tonebar ${tone.toClass('neutral')}" data-bind="tone:${key}"></span>
      <div class="min-w-0">
        <div class="lab">${label} <button class="hx" data-k="${key==='State'?'StatoReport':key}">?</button></div>
        <div class="val truncate" data-bind="value:${key}">—</div>
      </div>
    </div>`;
  el.innerHTML=[
    P('DataStart','Inizio'), P('DataEnd','Fine'), P('Ticker','Ticker'), P('Venue','Venue'),
    P('Freshness','Freshness'), P('State','Stato'),
    P('ConfidenceFinal','Confidence'), P('OCR_Conf','OCR'), P('DataIntegrity','DataInt'), P('FeedSync','FeedSync')
  ].join('');

  const setField=(key,{value,toneName})=>{
    const v=el.querySelector(`[data-bind="value:${key}"]`);
    const t=el.querySelector(`[data-bind="tone:${key}"]`);
    if(v) v.textContent=(value ?? '—');
    if(t){ t.className='tonebar '+(tone.toClass(toneName||'neutral')); t.setAttribute('data-tone', toneName||'neutral'); }
  };

  const freshLabel = data?.FreshnessLabel ?? data?.Freshness;
  const conf = Number(data?.ConfidenceFinal);
  const ocr  = Number(data?.OCR_Conf);
  const di   = Number(data?.DataIntegrity);
  const fs   = Number(data?.FeedSync);
  const state= data?.State ?? data?.ReportState;

  setField('DataStart', { value:data?.Start, toneName:'neutral' });
  setField('DataEnd',   { value:data?.End,   toneName:'neutral' });
  setField('Ticker',    { value:data?.Ticker, toneName:'neutral' });
  setField('Venue',     { value:data?.Venue,  toneName:'neutral' });
  setField('Freshness', { value:freshLabel, toneName: tone.fromFreshness(freshLabel) });
  setField('ConfidenceFinal', { value:isFinite(conf)?conf.toFixed(2):'—', toneName:tone.fromConfidence(conf) });
  setField('OCR_Conf',      { value:isFinite(ocr)?ocr.toFixed(2):'—', toneName:tone.simple01(ocr) });
  setField('DataIntegrity', { value:isFinite(di)? di.toFixed(2): '—', toneName:tone.simple01(di) });
  setField('FeedSync',      { value:isFinite(fs)? fs.toFixed(2): '—', toneName:tone.simple01(fs) });
  setField('State', { value: state || '—', toneName: tone.fromState(state) });

  lucide.createIcons();
}
