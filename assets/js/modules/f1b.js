// /assets/js/modules/f1b.js
import { mountStateBadge } from '../utils/stateBadge.js';

function sparkline(svgEl, values) {
  if (!svgEl || !Array.isArray(values) || values.length < 2) return;
  svgEl.innerHTML = '';
  const w = 100, h = 32, p = 2;
  const min = Math.min(...values), max = Math.max(...values), rng = (max - min) || 1;
  const d = values.map((v, i) => {
    const x = p + (w - 2 * p) * (i / (values.length - 1));
    const y = h - p - (h - 2 * p) * ((v - min) / rng);
    return (i ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
  }).join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#0284c7'); // perché: palette consistente
  path.setAttribute('stroke-width', '1.4');
  svgEl.appendChild(path);
}

export function mountF1B() {
  const container = document.getElementById('mod-container');
  if (!container) {
    console.warn('[F1B] container #mod-container non trovato');
    return { __data: {}, update(){} };
  }

  const card = document.createElement('article');
  card.className = 'f1b-card'; // usa stile istituzionale da report.css
  card.innerHTML = `
    <header class="f1b-head">
      <h3 class="f1b-title">F1B — Screening Macro-Settoriale</h3>
      <span data-f1b="state-badge" class="badge badge--n">NEUTRO</span>
    </header>
    <div class="f1b-body">
      <div class="f1b-line">
        <div>
          <div class="f1b-sub">Modulo macro favorisce</div>
          <div class="f1b-mode" data-f1b="kpi-mode">—</div>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <span class="chip" data-f1b="chip-vix">VIX —</span>
          <span class="chip" data-f1b="chip-breadth">Breadth —</span>
        </div>
        <button class="sbtn" data-f1b="open"><i data-lucide="panel-right-open"></i><span>Apri scheda</span></button>
      </div>
    </div>
  `;
  container.appendChild(card);

  if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }

  function buildSummary(m) {
    const pre = m?.Meta?.Summary || m?.Summary?.Text;
    if (pre && String(pre).trim().length) return String(pre).trim();

    const mode = m?.Metrics?.Classification?.StrategyMode || '—';
    const rs   = m?.Metrics?.RegimeScore?.score;
    const fs   = m?.Metrics?.FlowScore?.score;
    const br   = m?.Metrics?.Breadth1M?.label;
    const rt   = m?.Metrics?.RiskTilt?.label;
    const vixL = m?.UI?.Display?.VIX_Label ?? m?.Inputs?.VIX_Close_T1;

    const bits = [];
    bits.push(`Il modulo macro favorisce **${mode}**${(rs!=null)?` (RegimeScore ${Number(rs).toFixed(2)})`:''}.`);
    if (fs!=null) bits.push(`FlowScore ${Number(fs).toFixed(2)}; ${rt?`Risk Tilt ${rt.toLowerCase()}`:'rotazione neutra'}.`);
    if (br) bits.push(`Breadth 1M ${br.toLowerCase()}.`);
    if (vixL!=null) bits.push(`VIX ${typeof vixL==='number'? vixL.toFixed(2): vixL}.`);
    bits.push(`Vedi tab per dettagli e audit.`);
    return bits.join(' ');
  }

  function renderDrawer(m) {
    const body = document.getElementById('drawer-body');
    if (!body) return;

    const titleEl = document.getElementById('drawer-title');
    const subEl   = document.getElementById('drawer-sub');
    if (titleEl) titleEl.textContent = 'F1B — Screening Macro-Settoriale';
    if (subEl)   subEl.textContent   = 'Rotazione · Volatilità · Regime';

    const fmt = (x, d = 2) => (x == null || x === '—') ? '—' : (typeof x === 'number' ? x.toFixed(d) : x);
    const rows = (m?.Inputs?.SectorETFs || []).map(r => `
      <tr class="border-b last:border-0 hover:bg-slate-50/60">
        <td class="py-1 pr-2 font-semibold">${r.ticker || '—'}</td>
        <td class="py-1 pr-2">${r.name || '—'}</td>
        <td class="py-1 pr-2 text-slate-500">${r.group || '—'}</td>
        <td class="py-1 pr-2 text-right">${fmt(r.perf_1m_pct, 2)}%</td>
        <td class="py-1 pr-2 text-right">${fmt(r.flow_5d_usd_M, 2)} M</td>
        <td class="py-1 text-right">${r.rank_flow_5d ?? '—'}</td>
      </tr>
    `).join('');

    body.innerHTML = `
      <div class="space-y-3">
        <div class="tabbar noprint">
          <button class="sbtn" data-tab="#f1b-ov" aria-pressed="true"><i data-lucide="layout-grid"></i><span>Overview</span></button>
          <button class="sbtn" data-tab="#f1b-mx"><i data-lucide="activity"></i><span>Metriche</span></button>
          <button class="sbtn" data-tab="#f1b-le"><i data-lucide="layers"></i><span>Leadership</span></button>
          <button class="sbtn" data-tab="#f1b-se"><i data-lucide="chart-line"></i><span>Serie</span></button>
          <button class="sbtn" data-tab="#f1b-in"><i data-lucide="table-2"></i><span>Inputs</span></button>
          <button class="sbtn" data-tab="#f1b-au"><i data-lucide="badge-check"></i><span>Audit</span></button>
          <button class="sbtn" data-tab="#f1b-rs"><i data-lucide="notes"></i><span>Resoconto</span></button>
        </div>

        <!-- OVERVIEW -->
        <section id="f1b-ov" class="tab">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="card p-3">
              <div><b>StrategyMode:</b> ${m?.Metrics?.Classification?.StrategyMode || '—'} <button class="hx" data-k="F1B_Mode" aria-label="Aiuto"></button></div>
              <div class="mt-1"><b>RegimeScore:</b> ${fmt(m?.Metrics?.RegimeScore?.score)} <button class="hx" data-k="F1B_Regime" aria-label="Aiuto"></button></div>
              <div class="mt-1"><b>FlowScore:</b> ${fmt(m?.Metrics?.FlowScore?.score)} <button class="hx" data-k="F1B_FlowScore" aria-label="Aiuto"></button></div>
            </div>
            <div class="card p-3 text-sm text-slate-700">${buildSummary(m)}</div>
          </div>
        </section>

        <!-- METRICHE -->
        <section id="f1b-mx" class="tab hidden">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="text-slate-500 text-xs">VIX <button class="hx" data-k="F1B_VIX" aria-label="Aiuto"></button></label>
              <div>${m?.UI?.Display?.VIX_Label ?? m?.Inputs?.VIX_Close_T1 ?? '—'}</div>
            </div>
            <div>
              <label class="text-slate-500 text-xs">Breadth 1M <button class="hx" data-k="F1B_Breadth" aria-label="Aiuto"></button></label>
              <div>${m?.Metrics?.Breadth1M?.label ?? '—'}</div>
            </div>
            <div>
              <label class="text-slate-500 text-xs">Risk Tilt <button class="hx" data-k="F1B_RiskTilt" aria-label="Aiuto"></button></label>
              <div>${m?.Metrics?.RiskTilt?.label ?? '—'}</div>
            </div>
          </div>
        </section>

        <!-- LEADERSHIP -->
        <section id="f1b-le" class="tab hidden">
          <div class="card p-3">
            <div class="flex flex-wrap gap-1.5">
              ${(m?.Leadership?.TopInflow || []).slice(0, 6).map(x =>
                `<span class="chip">${x.ticker || '—'} · ${x.name || '—'}</span>`
              ).join('')}
            </div>
            <div class="mt-2 text-sm text-slate-600">Deboli:
              ${(m?.Leadership?.WeakSectors || []).slice(0, 6).map(x =>
                `<span class="chip border-dashed">${x.ticker || '—'} · ${x.name || '—'}</span>`
              ).join(' ')}
            </div>
          </div>
        </section>

        <!-- SERIE -->
        <section id="f1b-se" class="tab hidden">
          <div class="card p-3">
            <svg id="f1b-spark" class="f1b-spark" preserveAspectRatio="none" viewBox="0 0 100 32"></svg>
            <div class="text-[11px] text-slate-500 mt-1">
              ${(Array.isArray(m?.Series?.VIX_Sparkline) && m.Series.VIX_Sparkline.length)
                ? `VIX · ultimi ${m.Series.VIX_Sparkline.length} gg`
                : 'VIX · n/d'}
            </div>
          </div>
        </section>

        <!-- INPUTS -->
        <section id="f1b-in" class="tab hidden">
          <div class="card p-3 overflow-auto">
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
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>

        <!-- AUDIT -->
        <section id="f1b-au" class="tab hidden">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><b>VersionTag:</b> ${m?.Meta?.Version || m?.Meta?.VersionTag || '—'}</div>
            <div><b>Timestamp:</b> ${m?.Meta?.Timestamp || '—'} (${m?.Meta?.Timezone || '—'})</div>
            <div><b>AuditPathID:</b> ${m?.Meta?.AuditPathID || '—'}</div>
            <div><b>Source Tier:</b> ${m?.Meta?.SourceTier || '—'}</div>
            <div class="sm:col-span-2"><b>Sources:</b> ${(m?.Meta?.Sources || []).join(', ') || '—'}</div>
          </div>
        </section>

        <!-- RESOCONTO -->
        <section id="f1b-rs" class="tab hidden">
          <div class="card p-3 text-sm text-slate-700">${buildSummary(m)}</div>
        </section>
      </div>
    `;

    // tabs (usa 'hidden' per evitare dipendenze da CSS mancanti)
    const btns = body.querySelectorAll('[data-tab]');
    const secs = ['#f1b-ov','#f1b-mx','#f1b-le','#f1b-se','#f1b-in','#f1b-au','#f1b-rs'];
    const show = (sel) => {
      secs.forEach(id => body.querySelector(id)?.classList.add('hidden'));
      body.querySelector(sel)?.classList.remove('hidden');
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-tab') === sel)));
    };
    btns.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-tab'))));
    show('#f1b-ov');

    if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }

    // spark
    const svg = document.getElementById('f1b-spark');
    if (svg && Array.isArray(m?.Series?.VIX_Sparkline)) sparkline(svg, m.Series.VIX_Sparkline);
  }

  card.querySelector('[data-f1b="open"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.Tradelia?.openDrawer?.();
    renderDrawer(api.__data || {});
  });

  const api = {
    __data: {},
    update(m = {}) {
      this.__data = m;

      // Mode
      const modeEl = card.querySelector('[data-f1b="kpi-mode"]');
      if (modeEl) modeEl.textContent = m?.Metrics?.Classification?.StrategyMode ?? '—';

      // Chips
      const vix = m?.Inputs?.VIX_Close_T1;
      const vixEl = card.querySelector('[data-f1b="chip-vix"]');
      if (vixEl) vixEl.textContent = `VIX ${typeof vix === 'number' ? vix.toFixed(2) : (m?.UI?.Display?.VIX_Label ?? '—')}`;

      const brEl = card.querySelector('[data-f1b="chip-breadth"]');
      if (brEl) brEl.textContent = `Breadth ${m?.Metrics?.Breadth1M?.label ?? '—'}`;

      // Badge stato (istituzionale)
      const badge = card.querySelector('[data-f1b="state-badge"]');
      if (badge) {
        const label = m?.Meta?.StateBadge?.label ?? (m?.Meta?.State || m?.State || 'NEUTRO');
        const state = m?.Meta?.StateBadge?.state ?? (m?.Meta?.State || m?.State || 'NEUTRO');
        mountStateBadge(badge, { state, label });
      }

      if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }
    }
  };

  return api;
}
