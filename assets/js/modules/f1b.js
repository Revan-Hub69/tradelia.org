// /assets/js/modules/f1b.js
function sparkline(svgEl, values){
  if(!svgEl || !Array.isArray(values) || values.length<2) return;
  svgEl.innerHTML=''; const w=100,h=32,p=2,min=Math.min(...values),max=Math.max(...values),rng=(max-min)||1;
  const d=values.map((v,i)=>{ const x=p+(w-2*p)*(i/(values.length-1)); const y=h-p-(h-2*p)*((v-min)/rng); return (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2); }).join(' ');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d',d); path.setAttribute('fill','none'); path.setAttribute('stroke','#0284c7'); path.setAttribute('stroke-width','1.4'); svgEl.appendChild(path);
}

export function mountF1B(){
  const container=document.getElementById('mod-container');
  const card=document.createElement('article'); card.className='border border-slate-200 rounded-xl bg-white';
  card.innerHTML = `
    <header class="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
      <h3 class="font-semibold text-[13px] text-slate-900">F1B — Screening Macro-Settoriale</h3>
      <span class="text-[11px] px-2 py-[2px] rounded-full border border-slate-300" data-f1b="state-badge">NEUTRO</span>
    </header>
    <div class="p-3">
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="text-[11px] text-slate-500">Modulo macro favorisce</div>
          <div class="text-[13px] font-bold" data-f1b="kpi-mode">—</div>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <span class="text-[12px] border border-dashed border-slate-300 rounded-full px-2 py-[2px]" data-f1b="chip-vix">VIX —</span>
          <span class="text-[12px] border border-dashed border-slate-300 rounded-full px-2 py-[2px]" data-f1b="chip-breadth">Breadth —</span>
        </div>
        <button class="sbtn" data-f1b="open"><i data-lucide="panel-right-open"></i><span>Apri scheda</span></button>
      </div>
    </div>`;
  container.appendChild(card);
  lucide.createIcons();

  function setBadge(el, color='neutral', label='NEUTRO'){
    const map={green:'text-emerald-700 bg-emerald-50 border-emerald-200',yellow:'text-amber-700 bg-amber-50 border-amber-200',red:'text-red-700 bg-red-50 border-red-200',neutral:'text-slate-700 bg-slate-100 border-slate-300'};
    el.className='text-[11px] px-2 py-[2px] rounded-full border '+(map[color]||map.neutral); el.textContent=label;
  }

  function buildSummary(m){
    const pre=m?.Meta?.Summary || m?.Summary?.Text;
    if(pre && String(pre).trim().length) return String(pre).trim();
    const mode=m?.Metrics?.Classification?.StrategyMode || '—';
    const rs=m?.Metrics?.RegimeScore?.score;
    const fs=m?.Metrics?.FlowScore?.score;
    const br=m?.Metrics?.Breadth1M?.label;
    const rt=m?.Metrics?.RiskTilt?.label;
    const vixL=m?.UI?.Display?.VIX_Label ?? m?.Inputs?.VIX_Close_T1;
    const bits=[];
    bits.push(`Il modulo macro favorisce **${mode}**${(rs!=null)?` (RegimeScore ${Number(rs).toFixed(2)})`:''}.`);
    if (fs!=null) bits.push(`FlowScore ${Number(fs).toFixed(2)}; ${rt?`Risk Tilt ${rt.toLowerCase()}`:'rotazione neutra'}.`);
    if (br) bits.push(`Breadth 1M ${br.toLowerCase()}.`);
    if (vixL!=null) bits.push(`VIX ${typeof vixL==='number'? vixL.toFixed(2): vixL}.`);
    bits.push(`Vedi tab per dettagli e audit.`);
    return bits.join(' ');
  }

  function renderDrawer(m){
    const body=document.getElementById('drawer-body');
    document.getElementById('drawer-title').textContent='F1B — Screening Macro-Settoriale';
    document.getElementById('drawer-sub').textContent='Rotazione · Volatilità · Regime';
    const fmt=(x,d=2)=> (x==null||x==='—') ? '—' : (typeof x==='number'? x.toFixed(d):x);
    const rows=(m?.Inputs?.SectorETFs||[]).map(r=>`
      <tr class="border-b last:border-0 hover:bg-slate-50/60">
        <td class="py-1 pr-2 font-semibold">${r.ticker||'—'}</td>
        <td class="py-1 pr-2">${r.name||'—'}</td>
        <td class="py-1 pr-2 text-slate-500">${r.group||'—'}</td>
        <td class="py-1 pr-2 text-right">${fmt(r.perf_1m_pct,2)}%</td>
        <td class="py-1 pr-2 text-right">${fmt(r.flow_5d_usd_M,2)} M</td>
        <td class="py-1 text-right">${r.rank_flow_5d??'—'}</td>
      </tr>`).join('');

    body.innerHTML=`
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2 bg-slate-50 border border-slate-200 p-2 rounded">
          <button class="sbtn" data-tab="#f1b-ov" aria-pressed="true"><i data-lucide="layout-grid"></i><span>Overview</span></button>
          <button class="sbtn" data-tab="#f1b-mx"><i data-lucide="activity"></i><span>Metriche</span></button>
          <button class="sbtn" data-tab="#f1b-le"><i data-lucide="layers"></i><span>Leadership</span></button>
          <button class="sbtn" data-tab="#f1b-se"><i data-lucide="chart-line"></i><span>Serie</span></button>
          <button class="sbtn" data-tab="#f1b-in"><i data-lucide="table-2"></i><span>Inputs</span></button>
          <button class="sbtn" data-tab="#f1b-au"><i data-lucide="badge-check"></i><span>Audit</span></button>
          <button class="sbtn" data-tab="#f1b-rs"><i data-lucide="notes"></i><span>Resoconto</span></button>
        </div>

        <section id="f1b-ov" class="tab active">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="card p-3">
              <div><b>StrategyMode:</b> ${m?.Metrics?.Classification?.StrategyMode||'—'} <button class="hx" data-k="F1B_Mode">?</button></div>
              <div class="mt-1"><b>RegimeScore:</b> ${fmt(m?.Metrics?.RegimeScore?.score)} <button class="hx" data-k="F1B_Regime">?</button></div>
              <div class="mt-1"><b>FlowScore:</b> ${fmt(m?.Metrics?.FlowScore?.score)} <button class="hx" data-k="F1B_FlowScore">?</button></div>
            </div>
            <div class="card p-3 text-sm text-slate-700">${buildSummary(m)}</div>
          </div>
        </section>

        <section id="f1b-mx" class="tab">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div><label class="text-slate-500 text-xs">VIX <button class="hx" data-k="F1B_VIX">?</button></label><div>${m?.UI?.Display?.VIX_Label ?? m?.Inputs?.VIX_Close_T1 ?? '—'}</div></div>
            <div><label class="text-slate-500 text-xs">Breadth 1M <button class="hx" data-k="F1B_Breadth">?</button></label><div>${m?.Metrics?.Breadth1M?.label ?? '—'}</div></div>
            <div><label class="text-slate-500 text-xs">Risk Tilt <button class="hx" data-k="F1B_RiskTilt">?</button></label><div>${m?.Metrics?.RiskTilt?.label ?? '—'}</div></div>
          </div>
        </section>

        <section id="f1b-le" class="tab">
          <div class="card p-3">
            <div class="flex flex-wrap gap-1.5">
              ${(m?.Leadership?.TopInflow||[]).slice(0,6).map(x=>`<span class="chip">${x.ticker||'—'} · ${x.name||'—'}</span>`).join('')}
            </div>
            <div class="mt-2 text-sm text-slate-600">Deboli:
              ${(m?.Leadership?.WeakSectors||[]).slice(0,6).map(x=>`<span class="chip border-dashed">${x.ticker||'—'} · ${x.name||'—'}</span>`).join(' ')}
            </div>
          </div>
        </section>

        <section id="f1b-se" class="tab">
          <div class="card p-3">
            <svg id="f1b-spark" class="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 32"></svg>
            <div class="text-[11px] text-slate-500 mt-1">${(Array.isArray(m?.Series?.VIX_Sparkline)&&m.Series.VIX_Sparkline.length)? `VIX · ultimi ${m.Series.VIX_Sparkline.length} gg`:'VIX · n/d'}</div>
          </div>
        </section>

        <section id="f1b-in" class="tab">
          <div class="card p-3 overflow-auto">
            <table class="w-full text-sm">
              <thead class="text-slate-500">
                <tr class="border-b">
                  <th class="text-left py-1 pr-2">Ticker</th><th class="text-left py-1 pr-2">Nome</th>
                  <th class="text-left py-1 pr-2">Gruppo</th><th class="text-right py-1 pr-2">Perf 1M %</th>
                  <th class="text-right py-1 pr-2">Flow 5D (M$)</th><th class="text-right py-1">Rank Flow</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>

        <section id="f1b-au" class="tab">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><b>VersionTag:</b> ${m?.Meta?.Version||m?.Meta?.VersionTag||'—'}</div>
            <div><b>Timestamp:</b> ${m?.Meta?.Timestamp||'—'} (${m?.Meta?.Timezone||'—'})</div>
            <div><b>AuditPathID:</b> ${m?.Meta?.AuditPathID||'—'}</div>
            <div><b>Source Tier:</b> ${m?.Meta?.SourceTier||'—'}</div>
            <div class="sm:col-span-2"><b>Sources:</b> ${(m?.Meta?.Sources||[]).join(', ')||'—'}</div>
          </div>
        </section>

        <section id="f1b-rs" class="tab">
          <div class="card p-3 text-sm text-slate-700">${buildSummary(m)}</div>
        </section>
      </div>`;

    // tabs
    const btns = body.querySelectorAll('[data-tab]');
    const show = (sel)=>{ body.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); body.querySelector(sel)?.classList.add('active');
      btns.forEach(b=>{ b.setAttribute('aria-pressed', String(b.getAttribute('data-tab')===sel)); }); };
    btns.forEach(b=> b.addEventListener('click', ()=> show(b.getAttribute('data-tab'))));
    show('#f1b-ov');
    lucide.createIcons();

    // spark
    const svg=document.getElementById('f1b-spark');
    if(svg && Array.isArray(m?.Series?.VIX_Sparkline)) sparkline(svg, m.Series.VIX_Sparkline);
  }

  card.querySelector('[data-f1b="open"]').addEventListener('click',(e)=>{
    e.stopPropagation(); window.Tradelia?.openDrawer?.(); renderDrawer(api.__data||{});
  });

  const api = {
    __data:{},
    update(m={}) {
      this.__data=m;
      card.querySelector('[data-f1b="kpi-mode"]').textContent = m?.Metrics?.Classification?.StrategyMode ?? '—';
      const vix = m?.Inputs?.VIX_Close_T1;
      card.querySelector('[data-f1b="chip-vix"]').textContent = `VIX ${typeof vix==='number'? vix.toFixed(2): (m?.UI?.Display?.VIX_Label ?? '—')}`;
      card.querySelector('[data-f1b="chip-breadth"]').textContent = `Breadth ${m?.Metrics?.Breadth1M?.label ?? '—'}`;
      const badge = card.querySelector('[data-f1b="state-badge"]');
      setBadge(badge, (m?.Meta?.StateBadge?.color||'neutral'), (m?.Meta?.StateBadge?.label||'NEUTRO'));
      lucide.createIcons();
    }
  };
  return api;
}
