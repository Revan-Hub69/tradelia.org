// /report/assets/js/modules/f3o.js
//
// F3-Options · Options Overlay (derivati) — orizzonte 3–10 giorni
// Allineato al design F1B/F2 (card compatte, info-btn, drawer desktop/mobile).
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> listeners (CTA, tabs, tooltips)
//
// Dipendenze globali:
//   window.__TradeliaUI.openPanel(opts)
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons(root?)

export function renderCard(rawData, ctx = {}){
  const d = normalizeDataF3OPublic(rawData);

  // KPI snapshot (coerenti con head)
  const kpis = [
    { key:'IV_ATM',      label:'IV (ATM)',        desc:'', metric:d.head?.IV_ATM },
    { key:'IV_rank_pct', label:'IV Rank / %tile', desc:'', metric:d.head?.IV_rank_pct },
    { key:'GSR',         label:'GSR (Γ/Vega)',    desc:'', metric:d.head?.GSR_tkr },
    { key:'DealerGamma', label:'Dealer Regime',   desc:'', metric:d.head?.DealerGamma }
  ];

  return `
  <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]" style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <header class="section-headline mb-4">
      <div class="section-head-left">
        <div class="section-head-topline flex items-center flex-wrap gap-2">
          <span class="section-badge">F3O</span>
          <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Options Overlay · 3–10 giorni</span>
          <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
            data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
            style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
            ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
          </span>
          <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
        </div>

        <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
          Overlay derivati: IV, skew, term, PCR, Gamma/MaxPain, flow
        </div>

        <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
          ${escapeHtml(d.meta.hero_intro || '')}
        </div>
      </div>
    </header>

    <div class="relative flex flex-col gap-4 card-compact"
      style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">
      <div class="grid gap-3 grid-cols-2 md:grid-cols-2">
        ${kpis.map(k=>metricBoxTrafficLightF3O(k)).join('')}
      </div>

      <div class="mt-2 flex items-start gap-3">
        ${d.meta.hero_disclaimer ? `<p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer)}</p>` : '<div class="flex-1"></div>'}
        <button class="f3o-cta-btn ml-auto" data-open-f3o-details="true" type="button"
          style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
          Dettagli Options →
        </button>
      </div>
    </div>
  </section>`;
}

export function bindCard(node, rawData, ctx = {}){
  if (!node) return;
  const data = normalizeDataF3OPublic(rawData);

  if (!node.__f3oDelegated){
    node.__f3oDelegated = true;
    node.addEventListener('click', (ev)=>{
      const btn = ev.target && ev.target.closest('[data-open-f3o-details="true"]');
      if (!btn) return;
      try { openF3ODrawerPublic(data); } catch(e){ console.error('F3O drawer open error:', e); }
    }, { passive:true });
  }
  if (window.__TradeliaUI?.bindMetricInfoButtons){
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(_){}
  }
}

/* -------------------------------------------------------------------------- */
// DRAWER (9 schede) — Governance include Quality (come F2)
/* -------------------------------------------------------------------------- */
function openF3ODrawerPublic(d){
  if (!window.__TradeliaUI?.openPanel) return;
  const sections = buildF3OSectionsPublic(d);
  const mobile = isMobileViewport();
  const shell  = mobile ? renderF3OMobileShell(sections) : renderF3ODesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: 'F3-Options · Overlay derivati',
    subtitle: '',
    sections: [{ title:'', body:shell, meta:'' }],
    blocking: false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [{ label:'Chiudi', action:()=>window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  setTimeout(()=>{
    const root = document.getElementById('f3o-root');
    bindF3OTabsPublic();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3o-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3o-scroll-mobile')); } catch(e){}
    }
    const first = root?.querySelector('[data-f3o-tab="kpi"]');
    if (first?.click) first.click();

    // hint scroll mobile
    (function initScrollableTabsHint(){
      const scrollBox = root?.querySelector('.f1b-footer-tabs-scroll');
      const fadeRight = root?.querySelector('.f1b-tabs-fade-right');
      if(!scrollBox || !fadeRight) return;
      const needsScroll = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
      if(!needsScroll){
        fadeRight.style.display = 'none';
        const fadeLeft = root?.querySelector('.f1b-tabs-fade-left'); if(fadeLeft) fadeLeft.style.display='none';
        return;
      }
      const hintEl = fadeRight.querySelector('.f1b-tabs-scroll-hint');
      function updateHint(){
        const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
        if(hintEl) hintEl.style.opacity = atEnd ? '0' : '.9';
        const fadeLeft = root?.querySelector('.f1b-tabs-fade-left');
        if (fadeLeft) fadeLeft.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
      }
      updateHint();
      scrollBox.addEventListener('scroll', updateHint, { passive:true });
    })();
  }, 0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -------------------------------------------------------------------------- */
// SEZIONI (nessuna prosa hard-coded)
/* -------------------------------------------------------------------------- */
function buildF3OSectionsPublic(d){
  // 1) KPI & Regime
  const k = d.head || {};
  const kpiHTML = `
  <section class="tl-panel-section" data-f3o-section="kpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('KPI & Regime','', 'F3O_KPI_info')}
    <div class="grid gap-3 grid-cols-2 md:grid-cols-2">
      ${metricBoxTrafficLightF3O({ key:'IV_ATM',      label:'IV (ATM)',        desc:'', metric:k.IV_ATM })}
      ${metricBoxTrafficLightF3O({ key:'IV_rank_pct', label:'IV Rank / %tile', desc:'', metric:k.IV_rank_pct })}
      ${metricBoxTrafficLightF3O({ key:'GSR',         label:'GSR (Γ/Vega)',    desc:'', metric:k.GSR_tkr })}
      ${metricBoxTrafficLightF3O({ key:'DealerGamma', label:'Dealer Regime',   desc:'', metric:k.DealerGamma })}
    </div>
    ${headlineBlockF3OIfAny('Nota AI (KPI)', k?.ai_note)}
  </section>`;

  // 2) Expected Move
  const em = d.expected_move || {};
  const emRows = (em.rows||[]).slice(0,10).map(r=>`
    <tr>
      <td>${escapeHtml(r.expiration||'')}</td>
      <td class="text-right">${escapeHtml(String(r.dte??'—'))}</td>
      <td class="text-right">${escapeHtml(fmtPct(r.em_percent))}</td>
      <td class="text-right">${escapeHtml(fmtNum(r.upper))}</td>
      <td class="text-right">${escapeHtml(fmtNum(r.lower))}</td>
      <td class="text-right">${escapeHtml(fmtPct(r.iv_percent))}</td>
    </tr>`).join('');
  const emHTML = `
  <section class="tl-panel-section" data-f3o-section="em" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Expected Move','', 'F3O_EM_info')}
    ${f3oCard({ tone:'neutral', title:'EM · Scadenze chiave', bodyHtml:`
      <div class="overflow-auto" data-scrollable>
        <table class="min-w-full text-[12px]">
          <thead><tr>
            <th class="text-left">Exp</th><th class="text-right">DTE</th>
            <th class="text-right">EM%</th><th class="text-right">Upper</th>
            <th class="text-right">Lower</th><th class="text-right">IV%</th>
          </tr></thead>
          <tbody>${emRows}</tbody>
        </table>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (EM)', em?.ai_note)}
  </section>`;

  // 3) Term Structure
  const t = d.term_structure || {};
  const termHTML = `
  <section class="tl-panel-section" data-f3o-section="term" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Term Structure','', 'F3O_Term_info')}
    ${f3oCard({ tone:t?.tone||'neutral', title:'Term Structure', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-[10px] text-[color:var(--muted)]">Slope</div><div class="font-mono text-[12px]">${escapeHtml(valueRaw(t?.slope))}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">Note</div><div class="text-[12px]">${escapeHtml(t?.context || '')}</div></div>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (Term)', t?.ai_note)}
  </section>`;

  // 4) Skew / RR
  const s = d.skew || {};
  const skewHTML = `
  <section class="tl-panel-section" data-f3o-section="skew" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Skew 25Δ / RR','', 'F3O_Skew_info')}
    ${f3oCard({ tone:s?.tone||'neutral', title:'Skew & RR', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-[10px] text-[color:var(--muted)]">RR 25Δ</div><div class="font-mono text-[12px]">${fmtPct(s?.rr_25d)}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">Forma</div><div class="text-[12px]">${escapeHtml(s?.shape || '—')}</div></div>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (Skew)', s?.ai_note)}
  </section>`;

  // 5) PCR & OI
  const p = d.pcr || {};
  const perExp = (p.by_expiry||[]).slice(0,6).map(x=>
    `<div class="text-[12px] font-mono">${escapeHtml(x.exp||'')} · EM ${fmtPct(x.em)} · PCRv ${fmtNum(x.pcr_v)} · PCRoi ${fmtNum(x.pcr_oi)}</div>`
  ).join('');
  const pcrHTML = `
  <section class="tl-panel-section" data-f3o-section="pcr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('PCR & Open Interest','', 'F3O_PCR_info')}
    ${f3oCard({ tone:'neutral', title:'Put/Call & OI', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-[10px] text-[color:var(--muted)] mb-1">Totali</div>
          <div class="text-[12px] font-mono">Vol: ${fmtNum(p.total_vol)} · OI: ${fmtNum(p.total_oi)}</div>
          <div class="text-[12px]">PCR Vol <b class="font-mono">${fmtNum(p.pcr_vol)}</b> · PCR OI <b class="font-mono">${fmtNum(p.pcr_oi)}</b></div>
        </div>
        <div>
          <div class="text-[10px] text-[color:var(--muted)] mb-1">Per scadenza (top)</div>
          ${perExp || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}
        </div>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (PCR)', p?.ai_note)}
  </section>`;

  // 6) Gamma & Max Pain
  const g = d.gamma || {};
  const gex = g.GEX || {};
  const gammaHTML = `
  <section class="tl-panel-section" data-f3o-section="gamma" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Gamma Exposure & Max Pain','', 'F3O_Gamma_info')}
    ${f3oCard({ tone:g?.tone||'neutral', title:'Gamma / Dealer / Max Pain', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-[12px]">Gamma Flip <b class="font-mono">${fmtNum(gex.gamma_flip)}</b></div>
          <div class="text-[12px]">Dealer Regime <b>${escapeHtml(valueRaw(g?.DealerGamma))}</b></div>
        </div>
        <div>
          <div class="text-[12px]">Max Pain <b class="font-mono">${fmtNum(g?.MaxPain?.strike)}</b> ${g?.MaxPain?.exp ? `(exp ${escapeHtml(g.MaxPain.exp)})` : ''}</div>
        </div>
      </div>` })}
    ${f3oCard({ tone:g?.GSR_tkr?.tone||'neutral', title:'Dealer Γ/Vega Board', bodyHtml:`
      <div class="grid grid-cols-3 gap-3">
        <div><div class="text-[10px] text-[color:var(--muted)]">Γ ATM</div><div class="font-mono text-[12px]">${escapeHtml(valueRaw(g?.Gamma_ATM))}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">Vega ATM</div><div class="font-mono text-[12px]">${escapeHtml(valueRaw(g?.Vega_ATM))}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">GSR</div><div class="font-mono text-[12px]">${escapeHtml(valueRaw(g?.GSR_tkr))}</div></div>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (Gamma/MaxPain)', g?.ai_note || g?.ai_note_gsr)}
  </section>`;

  // 7) Options Flow (istituzionali)
  const f = d.flow || {};
  const flowTop = (f.top||[]).slice(0,6).map(t=>`
    <div class="text-[12px] font-mono">${escapeHtml(String(t?.type||''))} ${fmtNum(t?.strike)} · ${escapeHtml(String(t?.exp||''))} · Δ ${escapeHtml(String(t?.delta||''))} · prem. ${fmtUsd(t?.premium)}</div>`
  ).join('');
  const flowHTML = `
  <section class="tl-panel-section" data-f3o-section="flow" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Options Flow (istituzionali)','', 'F3O_Flow_info')}
    ${f3oCard({ tone:f?.tone||'neutral', title:'Blotter / Metriche', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div class="text-[12px]">
          <div>Net $: <b class="font-mono">${fmtUsd(f?.net_usd)}</b></div>
          <div>Δ-imbalance: <b class="font-mono">${fmtNum(f?.delta_imb)}</b></div>
        </div>
        <div>${flowTop || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}</div>
      </div>` })}
    ${headlineBlockF3OIfAny('Nota AI (Flow)', f?.ai_note)}
  </section>`;

  // 8) Sintesi (educational) — senza prosa fissa
  const syn = d.sintesi_ai || {};
  const synPoints = Array.isArray(syn.points) ? syn.points.map(p=> conclusionPointF3O(p)).join('') : '';
  const sintesiHTML = `
  <section class="tl-panel-section" data-f3o-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Sintesi (educational)','', 'F3O_Summary_info')}
    ${synPoints}
    ${headlineBlockF3OIfAny('Summary', syn?.summary)}
  </section>`;

  // 9) Governance (Quality + Audit + MiFID) — accorpata come F2
  const aq = d.audit_quality?.QualityMetrics || {};
  const governanceHTML = `
  <section class="tl-panel-section" data-f3o-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    ${sectionHeaderF3O('Governance · Audit & MiFID','', 'F3O_Governance_info')}
    <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
      ${qualityChipF3O('FreshnessScore', aq?.FreshnessScore || aq?.Coverage)}
      ${qualityChipF3O('ConfidenceFinal', aq?.ConfidenceFinal)}
      ${qualityChipF3O('DataIntegrity', aq?.DataIntegrity)}
      ${qualityChipF3O('FeedSync', aq?.FeedSync)}
    </div>
    ${headlineBlockF3OIfAny('AuditPath', d.audit_quality?.AuditPathID)}
    ${headlineBlockF3OIfAny('Informativa', d.mifid?.disclaimer)}
  </section>`;

  return { kpiHTML, emHTML, termHTML, skewHTML, pcrHTML, gammaHTML, flowHTML, sintesiHTML, governanceHTML };
}

/* -------------------------------------------------------------------------- */
// SHELL DESKTOP / MOBILE (root id="f3o-root")
/* -------------------------------------------------------------------------- */
function renderF3ODesktopShell(sections){
  return `
  <div id="f3o-root" class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
    <aside class="f1b-panel-menu" style="min-width:190px;max-width:210px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
${drawerBtnF3O('kpi','KPI & Regime')}
${drawerBtnF3O('em','Expected Move')}
${drawerBtnF3O('term','Term Structure')}
${drawerBtnF3O('skew','Skew / RR')}
${drawerBtnF3O('pcr','PCR & OI')}
${drawerBtnF3O('gamma','Gamma & Max Pain')}
${drawerBtnF3O('flow','Options Flow')}
${drawerBtnF3O('sintesi','Sintesi')}
${drawerBtnF3O('governance','Governance')}
    </aside>
    <main id="f3o-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
      <div data-f3o-view="kpi">${sections.kpiHTML}</div>
      <div data-f3o-view="em" hidden>${sections.emHTML}</div>
      <div data-f3o-view="term" hidden>${sections.termHTML}</div>
      <div data-f3o-view="skew" hidden>${sections.skewHTML}</div>
      <div data-f3o-view="pcr" hidden>${sections.pcrHTML}</div>
      <div data-f3o-view="gamma" hidden>${sections.gammaHTML}</div>
      <div data-f3o-view="flow" hidden>${sections.flowHTML}</div>
      <div data-f3o-view="sintesi" hidden>${sections.sintesiHTML}</div>
      <div data-f3o-view="governance" hidden>${sections.governanceHTML}</div>
    </main>
  </div>`;
}

function renderF3OMobileShell(sections){
  const pills = [
    ['kpi','KPI & Regime'],
    ['em','Expected Move'],
    ['term','Term Structure'],
    ['skew','Skew / RR'],
    ['pcr','PCR & OI'],
    ['gamma','Gamma & Max Pain'],
    ['flow','Options Flow'],
    ['sintesi','Sintesi'],
    ['governance','Governance']
  ].map(([k,l])=>mobileTabBtnF3O(k,l)).join('');

  const mobileTabsBar = `
    <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left" style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%, rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">
        ${pills}
      </div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);">
        <span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span>
      </div>
    </div>`;
  return `
  <div id="f3o-root" class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
    ${mobileTabsBar}
    <main id="f3o-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
      <div data-f3o-view="kpi">${sections.kpiHTML}</div>
      <div data-f3o-view="em" hidden>${sections.emHTML}</div>
      <div data-f3o-view="term" hidden>${sections.termHTML}</div>
      <div data-f3o-view="skew" hidden>${sections.skewHTML}</div>
      <div data-f3o-view="pcr" hidden>${sections.pcrHTML}</div>
      <div data-f3o-view="gamma" hidden>${sections.gammaHTML}</div>
      <div data-f3o-view="flow" hidden>${sections.flowHTML}</div>
      <div data-f3o-view="sintesi" hidden>${sections.sintesiHTML}</div>
      <div data-f3o-view="governance" hidden>${sections.governanceHTML}</div>
    </main>
  </div>`;
}

function drawerBtnF3O(key,label){
  return `<button class="f1b-tab-btn" data-f3o-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabBtnF3O(key,label){
  return `<button class="f1b-footer-tab-btn" data-f3o-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}

function bindF3OTabsPublic(){
  const btns  = document.querySelectorAll('[data-f3o-tab]');
  const views = document.querySelectorAll('[data-f3o-view]');
  const desk  = document.getElementById('f3o-scroll-desktop');
  const mob   = document.getElementById('f3o-scroll-mobile');

  function resetScroll(){ [desk, mob].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; }); }
  function styleTabs(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-f3o-tab')===active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f1b-footer-tab-btn')){
        if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
        else  { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
      }
    });
  }
  function show(active){
    views.forEach(v=>{
      const k=v.getAttribute('data-f3o-view');
      v.hidden = (k!==active);
      if(!v.hidden){
        requestAnimationFrame(()=>{
          resetScroll();
          v.querySelectorAll('[data-scrollable]').forEach(sc=>{ sc.scrollTop=0; sc.scrollLeft=0; });
          const hdr = v.querySelector('.tl-panel-section-title-text');
          if (hdr){ hdr.setAttribute('tabindex','-1'); try { hdr.focus({ preventScroll:true }); } catch(_){ hdr.focus(); } }
        });
      }
    });
  }
  function activate(k){ styleTabs(k); show(k); }
  btns.forEach(b=>{ if(b.__f3oBound) return; b.__f3oBound = true; b.addEventListener('click', ()=> activate(b.getAttribute('data-f3o-tab'))); });
}

/* -------------------------------------------------------------------------- */
// CARD BUILDERS
/* -------------------------------------------------------------------------- */
function f3oCard({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColorsF3O(tone);
  return `
  <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
    <div class="flex items-start gap-2 mb-1">
      <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title||'')}</div>
    </div>
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml||''}</div>
    ${ noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : '' }
  </div>`;
}

function metricBoxTrafficLightF3O({ key, label, desc, metric }){
  const { dotColor, textColor } = toneColorsF3O(metric?.tone);
  return `
  <div class="flex-1 min-w-[90px]" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:0.6rem 0.75rem;">
    <div class="flex items-start justify-between gap-1 mb-1">
      <div class="flex items-start gap-2">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
        <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(valueRaw(metric))}</div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : '' }
  </div>`;
}

function conclusionPointF3O(p = {}){
  const t = p.tone || 'neutral';
  const body = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(p.raw||'')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(p.ai_note||'')}</div>`;
  return f3oCard({ tone:t, title:p.title||'', bodyHtml:body, noteHtml:'' });
}

function headlineBlockF3OIfAny(title, obj){
  if (obj===undefined || obj===null || obj==='') return '';
  let tone='neutral', raw='';
  if (typeof obj==='string'){ raw=obj; } else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f3oCard({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function qualityChipF3O(key, q){
  if (!q) return '';
  const { textColor } = toneColorsF3O(q.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note || '')}</div>`;
  return f3oCard({ tone:q.tone, title:key||'', bodyHtml, noteHtml:'' });
}

/* -------------------------------------------------------------------------- */
// TONE / UTILS
/* -------------------------------------------------------------------------- */
function toneColorsF3O(tone){
  switch((tone||'').toLowerCase()){
    case 'green':  return { dotColor:'var(--tone-pos-fg)',  textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red':    return { dotColor:'var(--tone-neg-fg)',  textColor:'var(--tone-neg-fg)' };
    default:       return { dotColor:'var(--tone-neu-fg)',  textColor:'var(--tone-neu-fg)' };
  }
}
function sectionHeaderF3O(title, subtitle, infoKey){
  const info = infoKey ? `<button class="info-btn" data-metric="${escapeAttr(infoKey)}" aria-label="Info ${escapeAttr(infoKey)}">?</button>` : '';
  return `
  <header class="tl-panel-section-title">
    <div class="flex items-start justify-between gap-2">
      <div>
        <div class="tl-panel-section-title-text">${escapeHtml(title||'')}</div>
        ${ subtitle ? `<div class="text-[11px] text-[color:var(--muted)] leading-[1.3] mt-[2px]">${escapeHtml(subtitle)}</div>` : '' }
      </div>
      ${info}
    </div>
  </header>`;
}
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fmtPct(x){ return Number.isFinite(Number(x)) ? (Number(x).toFixed(2)+'%') : '—'; }
function fmtNum(x){ return Number.isFinite(Number(x)) ? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number(x)) : '—'; }
function fmtUsd(x){ return Number.isFinite(Number(x)) ? ('$'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Number(x))) : '—'; }
function valueRaw(obj){ if(!obj) return '—'; if (typeof obj==='object' && 'raw' in obj) return String(obj.raw ?? '—'); return String(obj); }

/* -------------------------------------------------------------------------- */
// NORMALIZZAZIONE DATI (F3O) — nessuna prosa di fallback
/* -------------------------------------------------------------------------- */
function normalizeDataF3OPublic(src = {}){
  const meta = {
    timestampET:   src?.meta?.timestampET ?? '—',
    module:        src?.meta?.module ?? 'F3-Options · Options Overlay',
    moduleVersion: src?.meta?.moduleVersion ?? 'v1.3',
    moduleStatus:  src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness:     src?.meta?.freshness ?? '≤ T-1',
    hero_intro:    src?.meta?.hero_intro ?? '',
    hero_disclaimer: src?.meta?.hero_disclaimer ?? ''
  };

  // Head KPI
  const head = {
    IV_ATM:       src?.head?.IV_ATM       || src?.options?.IV_ATM       || { raw:'—', tone:'neutral' },
    IV_rank_pct:  src?.head?.IV_rank_pct  || src?.options?.IV_rank_pct  || { raw:'—', tone:'neutral' },
    GSR_tkr:      src?.head?.GSR_tkr      || src?.options?.GSR_tkr      || { raw:'—', tone:'neutral' },
    DealerGamma:  src?.head?.DealerGamma  || src?.options?.DealerGamma  || { raw:'—', tone:'neutral' },
    ai_note:      src?.head?.ai_note || src?.options?.ai_note || ''
  };

  // Expected Move
  const expected_move = (function(){
    const o = src?.expected_move || src?.options || {};
    return { rows: Array.isArray(o.EM_rows) ? o.EM_rows : [], ai_note: o.ai_note_em || '' };
  })();

  // Term Structure
  const term_structure = (function(){
    const o = src?.term_structure || src?.options || {};
    return {
      slope:   o.TermSlope ?? null,
      context: o.TermNotes || '',
      tone:    (o.TermSlope && o.TermSlope.tone) ? o.TermSlope.tone : 'neutral',
      ai_note: o.ai_note_term || ''
    };
  })();

  // Skew / RR
  const skew = (function(){
    const o = src?.skew || src?.options || {};
    const detail = o.Skew_detail || {};
    return {
      rr_25d:  detail.rr_25d,
      shape:   detail.shape,
      tone:    detail.tone || (o.Skew_set?.tone) || 'neutral',
      ai_note: o.ai_note_skew || ''
    };
  })();

  // PCR & OI
  const pcr = (function(){
    const o = src?.pcr || src?.options?.PCR_breakdown || {};
    return {
      total_vol: o.total_vol,
      total_oi:  o.total_oi,
      pcr_vol:   o.pcr_vol,
      pcr_oi:    o.pcr_oi,
      by_expiry: Array.isArray(o.by_expiry) ? o.by_expiry : [],
      ai_note:   o.ai_note || ''
    };
  })();

  // Gamma / Max Pain / Board
  const gamma = (function(){
    const o = src?.gamma || src?.options || {};
    return {
      GEX:         { gamma_flip: o.GEX?.gamma_flip },
      MaxPain:     o.MaxPain || null,
      DealerGamma: o.DealerGamma || { raw:'—', tone:'neutral' },
      Gamma_ATM:   o.Gamma_ATM || { raw:'—', tone:'neutral' },
      Vega_ATM:    o.Vega_ATM  || { raw:'—', tone:'neutral' },
      GSR_tkr:     o.GSR_tkr   || { raw:'—', tone:'neutral' },
      ai_note_gsr: o.ai_note_gsr || '',
      ai_note:     o.ai_note || '',
      tone:        o.tone || 'neutral'
    };
  })();

  // Flow
  const flow = (function(){
    const o = src?.flow || src?.options?.Flow || {};
    return {
      net_usd:   o.net_usd,
      delta_imb: o.delta_imb,
      top:       Array.isArray(o.top) ? o.top : [],
      tone:      o.tone || 'neutral',
      ai_note:   o.ai_note || ''
    };
  })();

  // Governance (Quality + Audit + MiFID) — accorpato
  const audit_quality = (function(){
    const aq = src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} };
    const qm = aq?.QualityMetrics || {};
    if (qm.Coverage && !qm.FreshnessScore) { qm.FreshnessScore = qm.Coverage; }
    return { ...aq, QualityMetrics: qm };
  })();
  const mifid = src?.mifid || { disclaimer:'' };

  // Sintesi (educational)
  const sintesi_ai = src?.sintesi_ai || { points:[], summary:'' };

  // Bridge opzionale verso F3 tecnico
  const bridge_out = {
    VolatilityRegime: head?.IV_rank_pct?.raw ?? null,
    GammaBias:        (src?.gamma?.DealerGamma?.raw ?? src?.options?.DealerGamma?.raw ?? null),
    IV_Level:         head?.IV_ATM?.raw ?? null,
    IV_Slope:         (term_structure?.slope && term_structure.slope.raw !== undefined) ? term_structure.slope.raw : term_structure?.slope ?? null
  };

  return { meta, head, expected_move, term_structure, skew, pcr, gamma, flow, sintesi_ai, audit_quality, mifid, bridge_out };
}
