// modules/f1b/binder.js — mount + update + drawer on-demand

function pct(x, d=0){ if(x==null||isNaN(+x)) return '—'; return `${(+x*100).toFixed(d)}%`; }
function num(x, d=2){ if(x==null||isNaN(+x)) return '—'; return (+x).toFixed(d); }
function safe(x){ return (x==null || x==='') ? '—' : x; }

function buildSummary(m){
  const mode = m?.Metrics?.Classification?.StrategyMode || m?.Summary?.Mode || m?.Mode;
  const rs   = m?.Metrics?.RegimeScore?.score ?? m?.RegimeScore;
  const fs   = m?.Metrics?.FlowScore?.score ?? m?.FlowScore;
  const br   = m?.Metrics?.Breadth1M?.label || m?.Breadth;
  const vix  = m?.Inputs?.VIX_Close_T1 ?? m?.VIX;
  const bits = [];
  if(mode) bits.push(`Il modulo macro favorisce **${mode}**${(rs!=null)?` (RegimeScore ${num(rs)})`:''}.`);
  if(fs!=null) bits.push(`FlowScore ${num(fs)}.`);
  if(br) bits.push(`Breadth 1M ${br}.`);
  if(vix!=null) bits.push(`VIX ${typeof vix==='number'? num(vix): vix}.`);
  return bits.join(' ');
}

function drawerHTML(m){
  const mode = m?.Metrics?.Classification?.StrategyMode || m?.Mode || '—';
  const conf = m?.Meta?.StateBadge?.label || 'NEUTRO';
  const rs   = m?.Metrics?.RegimeScore?.score;
  const fs   = m?.Metrics?.FlowScore?.score;
  const br   = m?.Metrics?.Breadth1M?.label;
  const rt   = m?.Metrics?.RiskTilt?.label;
  const vix  = m?.Inputs?.VIX_Close_T1 ?? m?.UI?.Display?.VIX_Label;
  const summary = buildSummary(m);

  const rows = (m?.Inputs?.SectorETFs||[]).slice(0,16).map(r=>`
    <tr class="border-b last:border-0 hover:bg-slate-50/60">
      <td class="py-1 pr-2 font-semibold">${safe(r.ticker)}</td>
      <td class="py-1 pr-2">${safe(r.name)}</td>
      <td class="py-1 pr-2 text-slate-500">${safe(r.group)}</td>
      <td class="py-1 pr-2 text-right">${num(r.perf_1m_pct,2)}%</td>
      <td class="py-1 pr-2 text-right">${num(r.flow_5d_usd_M,2)} M</td>
      <td class="py-1 text-right">${safe(r.rank_flow_5d)}</td>
    </tr>`).join('');

  return `
    <div class="space-y-3">
      <div class="card p-3">
        <div class="sec-h"><i data-lucide="sparkles"></i><span>Overview</span></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div><b>StrategyMode:</b> ${safe(mode)}</div>
          <div><b>Confidence:</b> ${safe(conf)}</div>
          <div><b>RegimeScore:</b> ${num(rs)}</div>
          <div><b>FlowScore:</b> ${num(fs)}</div>
          <div><b>Breadth 1M:</b> ${safe(br)}</div>
          <div><b>Risk Tilt:</b> ${safe(rt)}</div>
          <div class="sm:col-span-2"><b>VIX:</b> ${safe(typeof vix==='number'? num(vix): vix)}</div>
        </div>
      </div>
      <div class="card p-3">
        <div class="sec-h"><i data-lucide="notes"></i><span>Resoconto</span></div>
        <div class="text-sm text-slate-700 leading-relaxed">${summary||'—'}</div>
      </div>
      <div class="card p-3 overflow-auto">
        <div class="sec-h"><i data-lucide="table-2"></i><span>Inputs (ETF settoriali)</span></div>
        <table class="w-full text-sm">
          <thead class="text-slate-500">
            <tr class="border-b">
              <th class="text-left py-1 pr-2">Ticker</th>
              <th class="text-left py-1 pr-2">Nome</th>
              <th class="text-left py-1 pr-2">Gruppo</th>
              <th class="text-right py-1 pr-2">Perf 1M %</th>
              <th class="text-right py-1 pr-2">Flow 5D (M$)</th>
              <th class="text-right py-1">Rank Flow</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="6" class="py-2 text-slate-400">n/d</td></tr>'}</tbody>
        </table>
      </div>
      <div class="card p-3">
        <div class="sec-h"><i data-lucide="badge-check"></i><span>Audit</span></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div><b>Version:</b> ${safe(m?.Meta?.Version||m?.Meta?.VersionTag)}</div>
          <div><b>Freshness:</b> ${safe(m?.Meta?.FreshnessLabel||m?.Meta?.Freshness)}</div>
          <div class="sm:col-span-2"><b>Sources:</b> ${(m?.Meta?.Sources||[]).join(', ')||'—'}</div>
          ${Array.isArray(m?.Audit?.Caveats)? `<div class="sm:col-span-2"><b>Caveat:</b> ${m.Audit.Caveats.join('; ')}</div>`:''}
        </div>
      </div>
    </div>`;
}

export function mount(root, data={}, ctx={}){
  const q = (sel)=> root.querySelector(sel);

  function update(m={}){
    q('[data-field="macro"]').textContent     = m?.Meta?.MacroLabel || m?.Metrics?.Regime || m?.Regime || '—';
    q('[data-field="strategy"]').textContent  = m?.Metrics?.Classification?.StrategyMode || m?.Strategy || '—';
    const wr = (m?.Meta?.WinRateEstimate != null) ? `${num(m.Meta.WinRateEstimate*100,0)}%` : (m?.WinRate ? pct(m.WinRate,0) : '—');
    q('[data-field="winrate"]').textContent   = wr;
    const conf = m?.Meta?.StateBadge?.label || (m?.Meta?.Confidence != null ? num(m.Meta.Confidence) : '—');
    q('[data-field="confidence"]').textContent = conf;
  }

  // Bind pulsante Dettagli → Drawer
  root.querySelector('.btn-open')?.addEventListener('click', ()=>{
    const html = drawerHTML(data||{});
    ctx.Drawer?.open({ title: 'F1B — Screening Macro-Settoriale', sub: 'Rotazione · Volatilità · Regime', html });
    if(window.lucide) window.lucide.createIcons();
  });

  update(data||{});

  // opzionale: ritorna API per runtime (se volessimo Data.feed in futuro)
  return { update };
}
