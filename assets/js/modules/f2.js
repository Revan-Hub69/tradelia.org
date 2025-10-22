// /assets/js/modules/f2.js
function badge(el, tone='n', label='NEUTRO'){
  const map={g:'text-emerald-700 bg-emerald-50 border-emerald-200', y:'text-amber-700 bg-amber-50 border-amber-200', r:'text-red-700 bg-red-50 border-red-200', n:'text-slate-700 bg-slate-100 border-slate-300'};
  el.className='badge inline-block text-[11px] px-2 py-[2px] rounded-full border '+(map[tone]||map.n); el.textContent=label;
}
const toneByConcord=(s)=>{ const v=String(s||'').toLowerCase(); if(/alta|high|strong|bull/.test(v)) return 'g'; if(/media|mid|neutral|neutro/.test(v)) return 'y'; if(/bassa|low|weak|bear/.test(v)) return 'r'; return 'n'; };
const safe=(x)=> (x==null||x==='')?'—':x;

export function mountF2(){
  const container=document.getElementById('mod-container');
  const card=document.createElement('article'); card.className='border border-slate-200 rounded-xl bg-white';
  card.innerHTML=`
    <header class="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
      <h3 class="font-semibold text-[13px] text-slate-900">F2 — Sguardo Principale (Ownership · Short · News)</h3>
      <span class="badge" data-f2="state-badge">NEUTRO</span>
    </header>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-400 flex-none" data-f2="mc-dot"></span>
          <div class="min-w-0">
            <div class="text-[11px] text-slate-500">Ticker <button class="hx" data-k="F2_Ticker">?</button></div>
            <div class="text-[13px] font-mono font-bold truncate" data-f2="ticker">—</div>
          </div>
        </div>
        <div>
          <div class="text-[11px] text-slate-500">Concordanza <button class="hx" data-k="F2_MacroConcordance">?</button></div>
          <div class="text-[13px] font-mono font-bold" data-f2="mc">—</div>
        </div>
        <button class="sbtn" data-f2="open"><i data-lucide="panel-right-open"></i><span>Apri scheda</span></button>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] text-slate-500">Confidence <button class="hx" data-k="F2_Conf">?</button>:</span>
        <span class="badge" data-f2="conf">—</span>
        <span class="chip border border-slate-200 rounded-full px-2 py-[2px]" data-f2="iv-chip">IV —</span>
        <span class="chip border border-slate-200 rounded-full px-2 py-[2px]" data-f2="pcr-chip">PCR —</span>
      </div>
    </div>`;
  container.appendChild(card);
  lucide.createIcons();

  function renderDrawer(d){
    const body=document.getElementById('drawer-body');
    document.getElementById('drawer-title').textContent=`F2 — ${safe(d.ticker)}`;
    document.getElementById('drawer-sub').textContent='Ownership · Short · Options · News · Eventi · ETF · Peers';
    const row=(k,v)=> `<tr class="border-b last:border-0"><td class="py-1 pr-2">${k}</td><td class="py-1 text-right">${safe(v)}</td></tr>`;
    const tbl=(rows)=> rows && rows.length ? rows.map(([k,v])=>row(k,v)).join("") : row('n/d','');

    const newsLi=(arr)=> (arr||[]).slice(0,10).map(n=>`
      <li class="mb-1.5">
        <span class="font-semibold">${safe(n.headline||n.title)}</span>
        <span class="text-slate-500 text-xs"> · ${safe(n.source)} · ${safe(n.time)}</span>
        ${n.note?`<div class="text-sm text-slate-700">${n.note}</div>`:''}
      </li>`).join('') || '<li class="text-slate-400">n/d</li>';

    body.innerHTML=`
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2 bg-slate-50 border border-slate-200 p-2 rounded">
          <button class="sbtn" data-tab="#f2-ov" aria-pressed="true"><i data-lucide="layout-grid"></i><span>Overview</span></button>
          <button class="sbtn" data-tab="#f2-own"><i data-lucide="user-check"></i><span>Ownership</span></button>
          <button class="sbtn" data-tab="#f2-short"><i data-lucide="shield-alert"></i><span>Short & Options</span></button>
          <button class="sbtn" data-tab="#f2-news"><i data-lucide="newspaper"></i><span>News</span></button>
          <button class="sbtn" data-tab="#f2-events"><i data-lucide="calendar-days"></i><span>Eventi</span></button>
          <button class="sbtn" data-tab="#f2-etf"><i data-lucide="boxes"></i><span>ETF & Peers</span></button>
          <button class="sbtn" data-tab="#f2-audit"><i data-lucide="badge-check"></i><span>Audit</span></button>
        </div>

        <section id="f2-ov" class="tab active">
          <div class="card p-3">
            <table class="w-full text-sm">
              <tr><td class="text-slate-500 w-1/2">Ticker</td><td class="text-right"><b>${safe(d.ticker)}</b></td></tr>
              <tr><td class="text-slate-500">Price headline</td><td class="text-right">${safe(d.price_headline)}</td></tr>
              <tr><td class="text-slate-500">Concordanza Macro</td><td class="text-right">${safe(d.concordanza)}</td></tr>
              <tr><td class="text-slate-500">Confidence (F2)</td><td class="text-right">${safe(d.confidence_label||d.confidence)}</td></tr>
              <tr><td class="text-slate-500">IV / PCR</td><td class="text-right">${safe(d.iv)} · ${safe(d.pcr)}</td></tr>
              <tr><td class="text-slate-500">Profilo</td><td class="text-right">${safe(d.profile)}</td></tr>
            </table>
          </div>
        </section>

        <section id="f2-own" class="tab">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div class="font-semibold mb-1">Azionariato</div>
              <table class="w-full text-sm">
                ${tbl([
                  ['Institutional Ownership %', d.inst_own],
                  ['Insider Ownership %',      d.insid_own],
                  ['Float %',                  d.float_pct]
                ])}
              </table>
            </div>
            <div>
              <div class="font-semibold mb-1">Movimenti insider</div>
              <ul class="list-disc ml-5 text-sm">
                ${(d.insider_tx||[]).slice(0,8).map(t=>`<li>${safe(t.when)} · ${safe(t.actor)} · ${safe(t.action)} · ${safe(t.amount)}</li>`).join('') || '<li class="text-slate-400">n/d</li>'}
              </ul>
            </div>
          </div>
        </section>

        <section id="f2-short" class="tab">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div class="font-semibold mb-1">Short metrics</div>
              <table class="w-full text-sm">
                ${tbl([
                  ['Short Float %',          d.short_float],
                  ['Short Interest (DTC)',   d.short_interest_ratio],
                  ['Short Volume Ratio',     d.short_vol_ratio]
                ])}
              </table>
            </div>
            <div>
              <div class="font-semibold mb-1">Derivati (sentiment)</div>
              <table class="w-full text-sm">
                ${tbl([
                  ['Implied Volatility (IV)', d.iv],
                  ['Put/Call Ratio (PCR)',    d.pcr],
                  ['IV Percentile/Rank',      (d.iv_percentile||d.iv_rank)? `${safe(d.iv_percentile)} / ${safe(d.iv_rank)}` : '—']
                ])}
              </table>
            </div>
          </div>
        </section>

        <section id="f2-news" class="tab">
          <div class="card p-3">
            <div class="font-semibold mb-1">Ultime news</div>
            <ul class="text-sm">${newsLi(d.news)}</ul>
          </div>
        </section>

        <section id="f2-events" class="tab">
          <div class="card p-3">
            <div class="font-semibold mb-1">Eventi vicini</div>
            <ul class="list-disc ml-5 text-sm">
              ${(d.events||[]).slice(0,10).map(e=>`<li>${safe(e.when)} · ${safe(e.title)}${e.scope?` · <span class="text-slate-500">${safe(e.scope)}</span>`:''}</li>`).join('') || '<li class="text-slate-400">n/d</li>'}
            </ul>
          </div>
        </section>

        <section id="f2-etf" class="tab">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div class="font-semibold mb-1">ETF collegati</div>
              <table class="w-full text-sm">
                ${tbl((d.etfs||[]).slice(0,12).map(e=>[`${safe(e.symbol)} · ${safe(e.name)}`, `${safe(e.weight)}%`]))}
              </table>
            </div>
            <div>
              <div class="font-semibold mb-1">Peers</div>
              <ul class="list-disc ml-5 text-sm">
                ${(d.peers||[]).slice(0,20).map(p=>`<li>${safe(p)}</li>`).join('') || '<li class="text-slate-400">n/d</li>'}
              </ul>
            </div>
          </div>
        </section>

        <section id="f2-audit" class="tab">
          <div class="card p-3">
            <table class="w-full text-sm">
              <tr><td class="text-slate-500 w-1/2">Freshness</td><td class="text-right">${safe(d.freshness)}</td></tr>
              <tr><td class="text-slate-500">Sources</td><td class="text-right">${(d.sources||[]).join(', ')||'—'}</td></tr>
              <tr><td class="text-slate-500">Note</td><td class="text-right">${safe(d.notes)}</td></tr>
            </table>
          </div>
        </section>
      </div>`;

    const btns=body.querySelectorAll('[data-tab]');
    const show=(sel)=>{ body.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); body.querySelector(sel)?.classList.add('active');
      btns.forEach(b=>b.setAttribute('aria-pressed', String(b.getAttribute('data-tab')===sel))); };
    btns.forEach(b=> b.addEventListener('click', ()=> show(b.getAttribute('data-tab'))));
    show('#f2-ov'); lucide.createIcons();
  }

  card.querySelector('[data-f2="open"]').addEventListener('click',(e)=>{
    e.stopPropagation(); window.Tradelia?.openDrawer?.(); renderDrawer(api.__data||{});
  });

  const api = {
    __data:{},
    update(d={}){
      this.__data=d;
      card.querySelector('[data-f2="ticker"]').textContent = d.ticker ?? '—';
      const conc = d.concordanza ?? '—';
      card.querySelector('[data-f2="mc"]').textContent = conc;
      const tone=toneByConcord(conc);
      const dot=card.querySelector('[data-f2="mc-dot"]');
      dot.className = 'w-2.5 h-2.5 rounded-full flex-none ' + ({g:'bg-emerald-500',y:'bg-amber-500',r:'bg-red-500',n:'bg-slate-400'}[tone]||'bg-slate-400');
      badge(card.querySelector('[data-f2="state-badge"]'), tone, (d.state_label||'NEUTRO').toUpperCase());
      badge(card.querySelector('[data-f2="conf"]'), tone, d.confidence_label ?? (d.confidence!=null? String(d.confidence): '—'));
      card.querySelector('[data-f2="iv-chip"]').textContent = `IV ${safe(d.iv)}`;
      card.querySelector('[data-f2="pcr-chip"]').textContent = `PCR ${safe(d.pcr)}`;
      lucide.createIcons();
    }
  };
  return api;
}
