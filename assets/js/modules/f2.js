// /assets/js/modules/f2.js
import { mountStateBadge, mountConfidenceBadge } from '../utils/stateBadge.js';

const safe = (x) => (x == null || x === '') ? '—' : x;

const toneByConcord = (s) => {
  const v = String(s || '').toLowerCase();
  if (/alta|high|strong|bull/.test(v)) return 'g';
  if (/media|mid|neutral|neutro/.test(v)) return 'y';
  if (/bassa|low|weak|bear/.test(v)) return 'r';
  return 'n';
};

export function mountF2() {
  const container = document.getElementById('mod-container');
  if (!container) {
    console.warn('[F2] container #mod-container non trovato');
    return { __data: {}, update(){} };
  }

  const card = document.createElement('article');
  card.className = 'f2-card';
  card.innerHTML = `
    <header class="f2-head">
      <h3 class="f2-title">F2 — Sguardo Principale (Ownership · Short · News)</h3>
      <span class="badge badge--n" data-f2="state-badge">NEUTRO</span>
    </header>

    <div class="f2-body">
      <div class="f2-line">
        <div class="flex items-center gap-2 min-w-0">
          <span class="f2-dot f2-dot-n" data-f2="mc-dot"></span>
          <div class="min-w-0 f2-k">
            <div class="f2-lab">Ticker <button class="hx" data-k="F2_Ticker" aria-label="Aiuto"></button></div>
            <div class="f2-val truncate" data-f2="ticker">—</div>
          </div>
        </div>

        <div class="min-w-0 f2-k">
          <div class="f2-lab">Concordanza <button class="hx" data-k="F2_MacroConcordance" aria-label="Aiuto"></button></div>
          <div class="f2-val" data-f2="mc">—</div>
        </div>

        <button class="sbtn" data-f2="open"><i data-lucide="panel-right-open"></i><span>Apri scheda</span></button>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] text-slate-500">Confidence <button class="hx" data-k="F2_Conf" aria-label="Aiuto"></button>:</span>
        <span class="badge badge--n" data-f2="conf">—</span>
        <span class="chip" data-f2="iv-chip">IV —</span>
        <span class="chip" data-f2="pcr-chip">PCR —</span>
      </div>
    </div>
  `;
  container.appendChild(card);

  if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }

  function renderDrawer(d) {
    const body = document.getElementById('drawer-body');
    if (!body) return;

    const titleEl = document.getElementById('drawer-title');
    const subEl   = document.getElementById('drawer-sub');
    if (titleEl) titleEl.textContent = `F2 — ${safe(d.ticker)}`;
    if (subEl)   subEl.textContent   = 'Ownership · Short · Options · News · Eventi · ETF · Peers';

    const row = (k, v) => `<tr class="border-b last:border-0"><td class="py-1 pr-2">${k}</td><td class="py-1 text-right">${safe(v)}</td></tr>`;
    const tbl = (rows) => rows && rows.length ? rows.map(([k, v]) => row(k, v)).join('') : row('n/d', '');

    const newsLi = (arr) =>
      (arr || []).slice(0, 10).map(n => `
        <li class="mb-1.5">
          <span class="font-semibold">${safe(n.headline || n.title)}</span>
          <span class="text-slate-500 text-xs"> · ${safe(n.source)} · ${safe(n.time)}</span>
          ${n.note ? `<div class="text-sm text-slate-700">${n.note}</div>` : ''}
        </li>`
      ).join('') || '<li class="text-slate-400">n/d</li>';

    body.innerHTML = `
      <div class="space-y-3">
        <div class="tabbar noprint">
          <button class="sbtn" data-tab="#f2-ov"    aria-pressed="true"><i data-lucide="layout-grid"></i><span>Overview</span></button>
          <button class="sbtn" data-tab="#f2-own"><i data-lucide="user-check"></i><span>Ownership</span></button>
          <button class="sbtn" data-tab="#f2-short"><i data-lucide="shield-alert"></i><span>Short & Options</span></button>
          <button class="sbtn" data-tab="#f2-news"><i data-lucide="newspaper"></i><span>News</span></button>
          <button class="sbtn" data-tab="#f2-events"><i data-lucide="calendar-days"></i><span>Eventi</span></button>
          <button class="sbtn" data-tab="#f2-etf"><i data-lucide="boxes"></i><span>ETF & Peers</span></button>
          <button class="sbtn" data-tab="#f2-audit"><i data-lucide="badge-check"></i><span>Audit</span></button>
        </div>

        <!-- OVERVIEW -->
        <section id="f2-ov" class="tab">
          <div class="card p-3">
            <table class="w-full text-sm">
              <tr><td class="text-slate-500 w-1/2">Ticker</td><td class="text-right"><b>${safe(d.ticker)}</b></td></tr>
              <tr><td class="text-slate-500">Price headline</td><td class="text-right">${safe(d.price_headline)}</td></tr>
              <tr><td class="text-slate-500">Concordanza Macro</td><td class="text-right">${safe(d.concordanza)}</td></tr>
              <tr><td class="text-slate-500">Confidence (F2)</td><td class="text-right">${safe(d.confidence_label || d.confidence)}</td></tr>
              <tr><td class="text-slate-500">IV / PCR</td><td class="text-right">${safe(d.iv)} · ${safe(d.pcr)}</td></tr>
              <tr><td class="text-slate-500">Profilo</td><td class="text-right">${safe(d.profile)}</td></tr>
            </table>
          </div>
        </section>

        <!-- OWNERSHIP -->
        <section id="f2-own" class="tab hidden">
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
                ${(d.insider_tx || []).slice(0, 8).map(t =>
                  `<li>${safe(t.when)} · ${safe(t.actor)} · ${safe(t.action)} · ${safe(t.amount)}</li>`
                ).join('') || '<li class="text-slate-400">n/d</li>'}
              </ul>
            </div>
          </div>
        </section>

        <!-- SHORT & OPTIONS -->
        <section id="f2-short" class="tab hidden">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div class="font-semibold mb-1">Short metrics</div>
              <table class="w-full text-sm">
                ${tbl([
                  ['Short Float %',        d.short_float],
                  ['Short Interest (DTC)', d.short_interest_ratio],
                  ['Short Volume Ratio',   d.short_vol_ratio]
                ])}
              </table>
            </div>
            <div>
              <div class="font-semibold mb-1">Derivati (sentiment)</div>
              <table class="w-full text-sm">
                ${tbl([
                  ['Implied Volatility (IV)', d.iv],
                  ['Put/Call Ratio (PCR)',    d.pcr],
                  ['IV Percentile/Rank',      (d.iv_percentile || d.iv_rank) ? `${safe(d.iv_percentile)} / ${safe(d.iv_rank)}` : '—']
                ])}
              </table>
            </div>
          </div>
        </section>

        <!-- NEWS -->
        <section id="f2-news" class="tab hidden">
          <div class="card p-3">
            <div class="font-semibold mb-1">Ultime news</div>
            <ul class="text-sm">${newsLi(d.news)}</ul>
          </div>
        </section>

        <!-- EVENTI -->
        <section id="f2-events" class="tab hidden">
          <div class="card p-3">
            <div class="font-semibold mb-1">Eventi vicini</div>
            <ul class="list-disc ml-5 text-sm">
              ${(d.events || []).slice(0, 10).map(e =>
                `<li>${safe(e.when)} · ${safe(e.title)}${e.scope ? ` · <span class="text-slate-500">${safe(e.scope)}</span>` : ''}</li>`
              ).join('') || '<li class="text-slate-400">n/d</li>'}
            </ul>
          </div>
        </section>

        <!-- ETF & PEERS -->
        <section id="f2-etf" class="tab hidden">
          <div class="card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div class="font-semibold mb-1">ETF collegati</div>
              <table class="w-full text-sm">
                ${tbl((d.etfs || []).slice(0, 12).map(e =>
                  [`${safe(e.symbol)} · ${safe(e.name)}`, `${safe(e.weight)}%`]
                ))}
              </table>
            </div>
            <div>
              <div class="font-semibold mb-1">Peers</div>
              <ul class="list-disc ml-5 text-sm">
                ${(d.peers || []).slice(0, 20).map(p => `<li>${safe(p)}</li>`).join('') || '<li class="text-slate-400">n/d</li>'}
              </ul>
            </div>
          </div>
        </section>

        <!-- AUDIT -->
        <section id="f2-audit" class="tab hidden">
          <div class="card p-3">
            <table class="w-full text-sm">
              <tr><td class="text-slate-500 w-1/2">Freshness</td><td class="text-right">${safe(d.freshness)}</td></tr>
              <tr><td class="text-slate-500">Sources</td><td class="text-right">${(d.sources || []).join(', ') || '—'}</td></tr>
              <tr><td class="text-slate-500">Note</td><td class="text-right">${safe(d.notes)}</td></tr>
            </table>
          </div>
        </section>
      </div>
    `;

    // Tabs -> toggle 'hidden'
    const btns = body.querySelectorAll('[data-tab]');
    const secs = ['#f2-ov','#f2-own','#f2-short','#f2-news','#f2-events','#f2-etf','#f2-audit'];
    const show = (sel) => {
      secs.forEach(id => body.querySelector(id)?.classList.add('hidden'));
      body.querySelector(sel)?.classList.remove('hidden');
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-tab') === sel)));
    };
    btns.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-tab'))));
    show('#f2-ov');

    if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }
  }

  card.querySelector('[data-f2="open"]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.Tradelia?.openDrawer?.();
    renderDrawer(api.__data || {});
  });

  const api = {
    __data: {},
    update(d = {}) {
      this.__data = d;

      // Ticker
      const tkEl = card.querySelector('[data-f2="ticker"]');
      if (tkEl) tkEl.textContent = d.ticker ?? '—';

      // Concordanza + dot tone
      const conc = d.concordanza ?? '—';
      const concEl = card.querySelector('[data-f2="mc"]');
      if (concEl) concEl.textContent = conc;

      const tone = toneByConcord(conc);
      const dot  = card.querySelector('[data-f2="mc-dot"]');
      if (dot) {
        dot.className = 'f2-dot ' + (
          { g: 'f2-dot-g', y: 'f2-dot-y', r: 'f2-dot-r', n: 'f2-dot-n' }[tone] || 'f2-dot-n'
        );
      }

      // State badge (istituzionale)
      const stateEl = card.querySelector('[data-f2="state-badge"]');
      if (stateEl) {
        const label = (d.state_label || d.state || 'NEUTRO');
        const state = (d.state || label);
        mountStateBadge(stateEl, { state, label });
      }

      // Confidence badge (istituzionale)
      const confEl = card.querySelector('[data-f2="conf"]');
      if (confEl) {
        const val   = (typeof d.confidence === 'number') ? d.confidence : undefined;
        const label = d.confidence_label;
        mountConfidenceBadge(confEl, { value: val, label });
      }

      // Chips IV / PCR
      const ivEl  = card.querySelector('[data-f2="iv-chip"]');
      const pcrEl = card.querySelector('[data-f2="pcr-chip"]');
      if (ivEl)  ivEl.textContent  = `IV ${safe(d.iv)}`;
      if (pcrEl) pcrEl.textContent = `PCR ${safe(d.pcr)}`;

      if (window.lucide?.createIcons) { try { window.lucide.createIcons(); } catch {} }
    }
  };

  return api;
}
