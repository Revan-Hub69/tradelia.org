/* Tradelia · Report Runtime Loader (no build, ES modules)
   - carica JSON del report (?id=...)
   - render header pills
   - monta moduli come "islands" con lazy-load (view.html + binder.js)
   - HelpX unificato (helpx.dict.json)
   - Drawer globale (side/bottom)
   - Azioni header: print/share
*/

// ===== Helpers base =====
const BASE = (window.Tradelia && window.Tradelia.BASE) || ".";
const REPORT_ID = (window.Tradelia && window.Tradelia.REPORT_ID) || "sample";

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const el = (tag, cls) => { const n=document.createElement(tag); if(cls) n.className=cls; return n; };
const enc = encodeURIComponent;

// ===== Stato condiviso =====
const State = {
  data: null,
  helpx: null,
  modules: [
    { key: 'f1b',    title: 'F1B',    path: `${BASE}/modules/f1b`    },
    { key: 'f2',     title: 'F2',     path: `${BASE}/modules/f2`     },
    { key: 'f3',     title: 'F3',     path: `${BASE}/modules/f3`     },
    { key: 'f4',     title: 'F4',     path: `${BASE}/modules/f4`     },
    { key: 'f5',     title: 'F5',     path: `${BASE}/modules/f5`     },
    { key: 'broker', title: 'Broker', path: `${BASE}/modules/broker` },
  ],
  moduleMap: {
    F1B: 'f1b', F2: 'f2', F3: 'f3', F4: 'f4', F5: 'f5', Broker: 'broker'
  },
};

// ===== Data pipeline =====
const Data = {
  async load(id){
    const url = `${BASE}/data/reports/${id}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error(`Impossibile caricare report ${id}: HTTP ${res.status}`);
    State.data = await res.json();
    return State.data;
  },
  get(section){
    if(!State.data) return null;
    if(!section) return State.data;
    const key = section.toUpperCase();
    return State.data[key] || State.data[section] || null;
  },
};

// ===== Tone helpers (coerenti con badge/pill) =====
const Tone = {
  conf(x){ if(x==null || isNaN(x)) return 'neutral'; x=+x; return x>=0.80?'green': x>=0.60?'yellow':'red'; },
  simple01(x){ if(x==null || isNaN(x)) return 'neutral'; x=+x; return x>=0.85?'green': x>=0.65?'yellow':'red'; },
  fresh(lbl){ if(!lbl) return 'neutral'; const s=String(lbl).toUpperCase(); return s.includes('T-0')?'green': s.includes('T-1')?'yellow':'red'; },
  state(s){ const m={ACTIVE:'green',REVIEW:'yellow',HOLD:'red'}; return m[String(s||'').toUpperCase()]||'neutral'; }
};

// ===== Drawer globale =====
const Drawer = (()=>{
  const wrap = $('#mod-drawer');
  const panel = wrap?.querySelector('aside');
  const body  = wrap?.querySelector('#drawer-body');

  const isMobile = () => matchMedia('(max-width: 640px)').matches;

  function open({ title='Modulo', sub='—', html='' }={}){
    if(!wrap || !panel) return;
    $('#drawer-title').textContent = title;
    $('#drawer-sub').textContent = sub;
    body.innerHTML = html || body.innerHTML;
    wrap.classList.remove('hidden');
    wrap.setAttribute('data-mode', String(isMobile()));
    requestAnimationFrame(()=> panel.style.transform = isMobile()? 'translateY(0)' : 'translateX(0)');
  }
  function close(){
    if(!wrap || !panel) return;
    panel.style.transform = isMobile()? 'translateY(100%)' : 'translateX(100%)';
    panel.addEventListener('transitionend', ()=> wrap.classList.add('hidden'), { once:true });
  }
  wrap?.addEventListener('click', e=>{ if(e.target?.dataset?.close==='backdrop') close(); });
  $('#drawer-close')?.addEventListener('click', close);
  $('#drawer-print')?.addEventListener('click', ()=> window.print());

  return { open, close, el: body };
})();

// ===== HelpX (popup unificato) =====
const HelpX = (()=>{
  let dict = null, POP=null, prevOverflow='';

  async function load(){
    if(dict) return dict;
    try{
      const res = await fetch(`${BASE}/assets/helpx.dict.json`, { cache: 'force-cache' });
      dict = await res.json();
    }catch{ dict = {}; }
    return dict;
  }
  function close(){
    if(!POP) return; document.removeEventListener('keydown', POP.onEsc, true);
    document.documentElement.style.overflow = prevOverflow; POP.wrap.remove(); POP=null;
  }
  function open(key){
    const def = (dict && dict[key]) || { t:key, a:'—', s:'—' };
    if(POP){ POP.h.textContent = def.t; POP.src.textContent = `Fonte: ${def.s}`; POP.text.innerHTML = def.a; return; }
    const wrap=el('div','hx-pop'); wrap.role='dialog'; wrap.ariaModal='true'; wrap.tabIndex=-1;
    const card=el('div','hx-card'); card.addEventListener('click', ev=>ev.stopPropagation());
    const h=el('h3'); h.textContent=def.t; const src=el('div','src'); src.textContent=`Fonte: ${def.s}`;
    const text=el('div','text-sm text-slate-800'); text.innerHTML=def.a;
    const hint=el('div','hx-callout'); hint.textContent='Suggerimento: usa le soglie come semaforo; se rosso, verifica le fonti.';
    card.append(h,src,text,hint); wrap.append(card); document.body.appendChild(wrap);
    prevOverflow=document.documentElement.style.overflow||''; document.documentElement.style.overflow='hidden';
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) close(); });
    const onEsc=(e)=>{ if(e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); close(); } };
    document.addEventListener('keydown', onEsc, true);
    POP={wrap,card,h,src,text,onEsc}; wrap.focus();
  }
  // delega globale sui bottoni .hx
  document.addEventListener('click', async (e)=>{
    const btn = e.target.closest('.hx'); if(!btn) return;
    e.preventDefault(); e.stopPropagation(); await load(); open(btn.getAttribute('data-k'));
  }, true);

  return { load };
})();

// ===== Header binder (pills) =====
function renderHeaderPills(data){
  const host = $('#header-ticker'); if(!host) return;
  host.innerHTML = '';
  const fields = [
    { k:'Start',   lab:'Inizio',      tone:'neutral' },
    { k:'End',     lab:'Fine',        tone:'neutral' },
    { k:'Ticker',  lab:'Ticker',      tone:'neutral' },
    { k:'Venue',   lab:'Venue',       tone:'neutral' },
    { k:'FreshnessLabel', lab:'Freshness', tone: Tone.fresh(data?.FreshnessLabel||data?.Freshness) },
    { k:'State',   lab:'Stato',       tone: Tone.state(data?.State) },
    { k:'ConfidenceFinal', lab:'Confidence', tone: Tone.conf(+data?.ConfidenceFinal), fmt:(v)=> isFinite(+v)? (+v).toFixed(2):'—' },
    { k:'OCR_Conf', lab:'OCR',             tone: Tone.simple01(+data?.OCR_Conf),      fmt:(v)=> isFinite(+v)? (+v).toFixed(2):'—' },
    { k:'DataIntegrity', lab:'DataInt',    tone: Tone.simple01(+data?.DataIntegrity), fmt:(v)=> isFinite(+v)? (+v).toFixed(2):'—' },
    { k:'FeedSync', lab:'FeedSync',        tone: Tone.simple01(+data?.FeedSync),      fmt:(v)=> isFinite(+v)? (+v).toFixed(2):'—' },
  ];
  for(const f of fields){
    const valRaw = (f.k in data)? data[f.k] : (data?.[f.k] ?? '—');
    const val = f.fmt ? f.fmt(valRaw) : (valRaw ?? '—');
    const pill = el('div','pill');
    const tone = (typeof f.tone === 'string') ? f.tone : (f.tone||'neutral');
    const toneCls = {green:'tone-g',yellow:'tone-y',red:'tone-r',neutral:'tone-n'}[tone] || 'tone-n';
    pill.innerHTML = `
      <span class="tonebar ${toneCls}"></span>
      <div class="min-w-0">
        <div class="lab">${f.lab} <button class="hx" data-k="${f.k}">?</button></div>
        <div class="val truncate">${val ?? '—'}</div>
      </div>`;
    host.appendChild(pill);
  }
}

// ===== Moduli (islands) =====
function mountViewSwitcher(){
  const container = $('#mod-container');
  $('#view-grid')?.addEventListener('click', (e)=>{
    container.dataset.view='grid'; e.currentTarget.setAttribute('aria-pressed','true');
    $('#view-list').setAttribute('aria-pressed','false');
    container.className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3';
  });
  $('#view-list')?.addEventListener('click', (e)=>{
    container.dataset.view='list'; e.currentTarget.setAttribute('aria-pressed','true');
    $('#view-grid').setAttribute('aria-pressed','false');
    container.className='space-y-1.5';
  });
}

async function loadModule(mod){
  const container = $('#mod-container');
  const mountPoint = el('div');
  mountPoint.dataset.module = mod.key;
  mountPoint.className = 'mod-host';
  container.appendChild(mountPoint);

  // Lazy by viewport
  const io = new IntersectionObserver(async (entries)=>{
    const vis = entries.some(e=>e.isIntersecting);
    if(!vis) return;
    io.disconnect();
    try{
      // 1) view.html
      const viewRes = await fetch(`${mod.path}/view.html`, { cache: 'no-store' });
      const html = await viewRes.text();
      mountPoint.innerHTML = html;
      // 2) binder.js (ESM)
      const binder = await import(`${mod.path}/binder.js`);
      // 3) dati sezione
      const sectionKey = Object.keys(State.moduleMap).find(k=>State.moduleMap[k]===mod.key);
      const data = Data.get(sectionKey);
      // 4) mount
      if(typeof binder.mount === 'function') binder.mount(mountPoint, data, { Drawer, HelpX, Tone });
      if(window.lucide) window.lucide.createIcons();
    }catch(err){
      mountPoint.innerHTML = `<div class="p-3 border border-amber-300 bg-amber-50 rounded text-amber-900 text-sm">Modulo ${mod.key}: ${err.message||'errore di caricamento'}</div>`;
      console.error('Module load error', mod.key, err);
    }
  }, { rootMargin: '200px 0px' });
  io.observe(mountPoint);
}

// ===== Share & Print =====
function initHeaderActions(){
  $('#btn-print')?.addEventListener('click', ()=> window.print());
  $('#btn-share')?.addEventListener('click', async ()=>{
    const urlObj = new URL(window.location.href);
    if(!urlObj.searchParams.get('id')) urlObj.searchParams.set('id', REPORT_ID);
    const longUrl = urlObj.toString();
    const title = 'Tradelia · Report Runtime';
    const text  = 'Guarda il report completo su Tradelia AI';
    try{
      if(navigator.share){ await navigator.share({ title, text, url: longUrl }); return; }
    }catch{ /* fallback sotto */ }
    // fallback: copia negli appunti
    try{ await navigator.clipboard.writeText(longUrl); alert('Link copiato negli appunti'); }
    catch{ window.open(longUrl, '_blank'); }
  });
}

// ===== Boot =====
(async function boot(){
  try{
    mountViewSwitcher();
    initHeaderActions();
    await HelpX.load();

    const data = await Data.load(REPORT_ID);
    // Header
    renderHeaderPills(data.Header || data.HEADER || {});

    // API globali per moduli
    window.Tradelia = Object.assign(window.Tradelia||{}, { Drawer, Data, Tone });

    // Monta moduli dichiarati
    for(const mod of State.modules){ await loadModule(mod); }

    // icone iniziali (header)
    if(window.lucide) window.lucide.createIcons();
  }catch(err){
    console.error(err);
    const main = document.querySelector('main') || document.body;
    const box = el('div','max-w-3xl mx-auto my-6 p-3 border border-rose-300 bg-rose-50 text-rose-900 rounded');
    box.textContent = `Errore durante il caricamento del report: ${err.message||err}`;
    main.prepend(box);
  }
})();
