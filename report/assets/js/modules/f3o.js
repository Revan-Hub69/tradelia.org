// /report/assets/js/modules/f3o.js
//
// F3-Options · Options Overlay (derivati) — orizzonte 3–10 giorni
// Allineato al design system F1B/F2/F3: stessa grammatica UI (card compatte, info-btn, drawer con menu desktop / pills mobile)
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML (card snapshot con KPI + CTA)
//   bindCard(node, rawData, ctx?) -> wiring CTA + tooltip + drawer tabs
//
// Dipendenze globali attese:
//   window.__TradeliaUI.openPanel(opts)
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons(root?)
//
// NOTE METODOLOGICHE
// - Nessun calcolo su chain: il modulo è PRESENTAZIONALE. I valori arrivano già normalizzati dal feed JSON
// - Ogni metrica segue schema { raw:any, tone:'green|yellow|red|neutral', ai_note?:string }
// - Le sezioni interne (schede) sono 8, coerenti con il perimetro "Options Overlay" che precede F3 tecnico puro
// - Governance/MiFID rimane nel modulo F6 (o in Governance accorpata a fine report): non duplicata qui

export function renderCard(rawData, ctx = {}){
  const d = normalizeDataF3OPublic(rawData);

  // KPI snapshot (4 box) – coerenti con head
  const kpis = [
    { key: 'IV_ATM',   label: 'IV (ATM)',          desc: 'vol implicita prox-ATM',      metric: d.head?.IV_ATM },
    { key: 'IV_RANK',  label: 'IV Rank / %tile',   desc: 'posizione IV 1y',             metric: d.head?.IV_rank_pct },
    { key: 'GSR',      label: 'GSR (Γ/Vega)',      desc: 'regime dealer (tkr)',         metric: d.head?.GSR_tkr },
    { key: 'DEALER',   label: 'Dealer Regime',     desc: 'bias di copertura dealer',     metric: d.head?.DealerGamma }
  ];

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

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
            Regime di volatilità & posizionamento dealer (overlay derivati)
          </div>

          
<div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
  ${escapeHtml(d.meta.hero_intro || 'Lettura anticipativa su IV, skew, term structure, PCR, flow istituzionali e Gamma/Max Pain.')}
</div>

        </div>
      </header>

      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
          ${kpis.map(k=>metricBoxTrafficLightF3O(k)).join('')}
        </div>

        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f3o-cta-btn" data-open-f3o-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli Options →
            </button>
          </div>
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

/* -----------------------------------------------------------------------------
   DRAWER (8 schede) — desktop menu + mobile pills
----------------------------------------------------------------------------- */
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
    if (first && typeof first.click === 'function') first.click();

    // hint scroll mobile pills
    (function initScrollableTabsHint(){
      const scrollBox = root?.querySelector('.f1b-footer-tabs-scroll');
      const fadeRight = root?.querySelector('.f1b-tabs-fade-right');
      if(!scrollBox || !fadeRight) return;
      const needsScroll = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
      if(!needsScroll){
        fadeRight.style.display = 'none';
        const fadeLeft = root?.querySelector('.f1b-tabs-fade-left');
        if(fadeLeft) fadeLeft.style.display = 'none';
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

/* -----------------------------------------------------------------------------
   SEZIONI (8 schede coerenti con il dominio options)
   Ogni card usa schema: titolo (badge punto), valore/i, info-btn, ai_note
----------------------------------------------------------------------------- */
function buildF3OSectionsPublic(d){
  // 1) KPI & Regime (sintesi)
  const kpi = d.head || {};
  const kpiHTML = `
    <section class="tl-panel-section" data-f3o-section="kpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">KPI & Regime</div></header>
      <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
        ${metricBoxTrafficLightF3O({ key:'IV_ATM',   label:'IV (ATM)',        desc:'vol implicita prox-ATM', metric:kpi.IV_ATM })}
        ${metricBoxTrafficLightF3O({ key:'IV_RANK',  label:'IV Rank/%tile',   desc:'posizione IV 1y',       metric:kpi.IV_rank_pct })}
        ${metricBoxTrafficLightF3O({ key:'GSR',      label:'GSR (Γ/Vega)',    desc:'regime dealer tkr',     metric:kpi.GSR_tkr })}
        ${metricBoxTrafficLightF3O({ key:'DEALER',   label:'Dealer Regime',   desc:'bias copertura',         metric:kpi.DealerGamma })}
      </div>
      ${headlineBlockCardF3O('Nota AI (KPI)', kpi?.ai_note)}
    </section>`;

  // 2) Expected Move (EM) — tabella scadenze chiave
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
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Expected Move</div></header>
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
      ${headlineBlockCardF3O('Nota AI (EM)', em?.ai_note)}
    </section>`;

  // 3) Term Structure & IV Slope
  const term = d.term_structure || {};
  const termHTML = `
    <section class="tl-panel-section" data-f3o-section="term" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Term Structure & IV Slope</div></header>
      ${f3oCard({ tone:term?.tone||'neutral', title:'Term Structure', bodyHtml:`
        <div class="grid grid-cols-2 gap-3">
          <div><div class="text-[10px] text-[color:var(--muted)]">Slope</div><div class="font-mono text-[12px]">${escapeHtml(term?.slope?.raw || term?.slope || '—')}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">Contesto</div><div class="text-[12px]">${escapeHtml(term?.context || '')}</div></div>
        </div>` })}
      ${headlineBlockCardF3O('Nota AI (Term)', term?.ai_note)}
    </section>`;

  // 4) Skew 25Δ / Risk Reversal
  const skew = d.skew || {};
  const skewHTML = `
    <section class="tl-panel-section" data-f3o-section="skew" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Skew 25Δ / Risk Reversal</div></header>
      ${f3oCard({ tone:skew?.tone||'neutral', title:'Skew & RR', bodyHtml:`
        <div class="grid grid-cols-2 gap-3">
          <div><div class="text-[10px] text-[color:var(--muted)]">RR 25Δ</div><div class="font-mono text-[12px]">${fmtPct(skew?.rr_25d)}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">Forma</div><div class="text-[12px]">${escapeHtml(skew?.shape || '—')}</div></div>
        </div>` })}
      ${headlineBlockCardF3O('Nota AI (Skew)', skew?.ai_note)}
    </section>`;

  // 5) PCR & Open Interest (totali + per scadenza)
  const pcr = d.pcr || {};
  const pcrRight = (pcr.by_expiry||[]).slice(0,6).map(x=>`
    <div class="text-[12px] font-mono">${escapeHtml(x.exp||'')} · EM ${fmtPct(x.em)} · PCRv ${fmtNum(x.pcr_v)} · PCRoi ${fmtNum(x.pcr_oi)}</div>`).join('');
  const pcrHTML = `
    <section class="tl-panel-section" data-f3o-section="pcr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">PCR & Open Interest</div></header>
      ${f3oCard({ tone:'neutral', title:'Put/Call & OI', bodyHtml:`
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-[10px] text-[color:var(--muted)] mb-1">Totali</div>
            <div class="text-[12px] font-mono">Vol: ${fmtNum(pcr.total_vol)} · OI: ${fmtNum(pcr.total_oi)}</div>
            <div class="text-[12px]">PCR Vol <b>${fmtNum(pcr.pcr_vol)}</b> · PCR OI <b>${fmtNum(pcr.pcr_oi)}</b></div>
          </div>
          <div>
            <div class="text-[10px] text-[color:var(--muted)] mb-1">Per scadenza (top)</div>
            ${pcrRight || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}
          </div>
        </div>` })}
      ${headlineBlockCardF3O('Nota AI (PCR)', pcr?.ai_note)}
    </section>`;

  // 6) Gamma Exposure & Max Pain (incluso DealerGamma / GSR)
  const gamma = d.gamma || {};
  const gex = gamma.GEX || {};
  const gammaHTML = `
    <section class="tl-panel-section" data-f3o-section="gamma" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Gamma Exposure & Max Pain</div></header>
      ${f3oCard({ tone:gamma?.tone||'neutral', title:'Gamma / Dealer', bodyHtml:`
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-[12px]">Gamma Flip <b>${fmtNum(gex.gamma_flip)}</b></div>
            <div class="text-[12px]">Dealer Regime <b>${escapeHtml(gamma?.DealerGamma?.raw || '—')}</b></div>
            ${gamma?.DealerGamma?.ai_note ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(gamma.DealerGamma.ai_note)}</div>` : ''}
          </div>
          <div>
            <div class="text-[12px]">Max Pain <b>${fmtNum(gamma?.MaxPain?.strike)}</b> (exp ${escapeHtml(gamma?.MaxPain?.exp || '—')})</div>
            ${gamma?.MaxPain?.ai_note ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(gamma.MaxPain.ai_note)}</div>` : ''}
          </div>
        </div>` })}
      ${f3oCard({ tone:gamma?.GSR_tkr?.tone||'neutral', title:'Dealer Γ/Vega Board', bodyHtml:`
        <div class="grid grid-cols-3 gap-3">
          <div><div class="text-[10px] text-[color:var(--muted)]">Γ ATM</div><div class="font-mono text-[12px]">${escapeHtml(String(gamma?.Gamma_ATM?.raw ?? '—'))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">Vega ATM</div><div class="font-mono text-[12px]">${escapeHtml(String(gamma?.Vega_ATM?.raw ?? '—'))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">GSR</div><div class="font-mono text-[12px]">${escapeHtml(String(gamma?.GSR_tkr?.raw ?? '—'))}</div></div>
        </div>
        ${gamma?.ai_note_gsr ? `<div class="text-[11px] text-[color:var(--muted)] mt-1">${escapeHtml(gamma.ai_note_gsr)}</div>` : ''}` })}
      ${headlineBlockCardF3O('Nota AI (Gamma/MaxPain)', gamma?.ai_note)}
    </section>`;

  // 7) Flow istituzionale (blotter sintetico)
  const flow = d.flow || {};
  const flowTop = (flow.top||[]).slice(0,6).map(t=>`
    <div class="text-[12px] font-mono">${escapeHtml(String(t?.type||''))} ${fmtNum(t?.strike)} · ${escapeHtml(String(t?.exp||''))} · Δ ${escapeHtml(String(t?.delta||''))} · prem. ${fmtUsd(t?.premium)}</div>`).join('');
  const flowHTML = `
    <section class="tl-panel-section" data-f3o-section="flow" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Options Flow (istituzionali)</div></header>
      ${f3oCard({ tone:flow?.tone||'neutral', title:'Blotter / Sentiment', bodyHtml:`
        <div class="grid grid-cols-2 gap-3">
          <div>
            Net Sentiment: <b>${fmtUsd(flow?.net_usd)}</b><br/>
            Delta Imbalance: <b>${fmtNum(flow?.delta_imb)}</b>
          </div>
          <div>${flowTop || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}</div>
        </div>` })}
      ${headlineBlockCardF3O('Nota AI (Flow)', flow?.ai_note)}
    </section>`;

  // 8) Data Quality / Gaps & Sintesi AI
  const dq = d.data_quality || {};
  const gaps = Array.isArray(dq.DataGaps) && dq.DataGaps.length ? listBlockCardF3O('Data gaps', dq.DataGaps) : '';
  const dqHTML = `
    <section class="tl-panel-section" data-f3o-section="quality" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Qualità dati & Sintesi</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF3O('FreshnessScore', dq?.FreshnessScore || dq?.Coverage)}
        ${qualityChipF3O('ConfidenceFinal', dq?.ConfidenceFinal)}
        ${qualityChipF3O('DataIntegrity', dq?.DataIntegrity)}
        ${qualityChipF3O('FeedSync', dq?.FeedSync)}
      </div>
      ${gaps}
      ${headlineBlockCardF3O('AI Summary (Options)', dq?.ai_note)}
    </section>`;

  return { kpiHTML, emHTML, termHTML, skewHTML, pcrHTML, gammaHTML, flowHTML, dqHTML };
}

/* -----------------------------------------------------------------------------
   SHELL DESKTOP / MOBILE + TABS (root id="f3o-root")
----------------------------------------------------------------------------- */
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
${drawerBtnF3O('flow','Flow istituz.')}
${drawerBtnF3O('quality','Qualità & Sintesi')}
      </aside>
      <main id="f3o-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f3o-view="kpi">${sections.kpiHTML}</div>
        <div data-f3o-view="em" hidden>${sections.emHTML}</div>
        <div data-f3o-view="term" hidden>${sections.termHTML}</div>
        <div data-f3o-view="skew" hidden>${sections.skewHTML}</div>
        <div data-f3o-view="pcr" hidden>${sections.pcrHTML}</div>
        <div data-f3o-view="gamma" hidden>${sections.gammaHTML}</div>
        <div data-f3o-view="flow" hidden>${sections.flowHTML}</div>
        <div data-f3o-view="quality" hidden>${sections.dqHTML}</div>
      </main>
    </div>`;
}

function renderF3OMobileShell(sections){
  const pills = [
    ['kpi','KPI'],
    ['em','EM'],
    ['term','Term'],
    ['skew','Skew'],
    ['pcr','PCR & OI'],
    ['gamma','Gamma'],
    ['flow','Flow'],
    ['quality','Qualità']
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
        <div data-f3o-view="quality" hidden>${sections.dqHTML}</div>
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
        });
      }
    });
  }
  function activate(k){ styleTabs(k); show(k); }

  btns.forEach(b=>{
    if(b.__f3oBound) return;
    b.__f3oBound = true;
    b.addEventListener('click', ()=> activate(b.getAttribute('data-f3o-tab')));
  });
}

/* -----------------------------------------------------------------------------
   CARD BUILDERS (F3O)
----------------------------------------------------------------------------- */
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
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(metric?.raw || '—')}</div>
      ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : ''}
    </div>`;
}

function listBlockCardF3O(title, body){
  if (!body && body !== 0) return '';
  let tone='neutral', raw='';
  if (Array.isArray(body)){
    raw = body.map(x=>`• ${String(x)}`).join('\n');
  } else if (typeof body==='object'){
    tone = body?.tone || 'neutral';
    raw = body?.raw || '';
  } else {
    raw = String(body);
  }
  return f3oCard({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF3O(title, obj){
  if (obj===undefined || obj===null || obj==='') return '';
  let tone='neutral', raw='';
  if (typeof obj==='string'){ raw=obj; }
  else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
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
  return f3oCard({ tone: q.tone, title: key || '', bodyHtml, noteHtml: '' });
}

/* -----------------------------------------------------------------------------
   TONE HELPERS
----------------------------------------------------------------------------- */
function toneColorsF3O(tone){
  switch((tone||'').toLowerCase()){
    case 'green':  return { dotColor:'var(--tone-pos-fg)',  textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red':    return { dotColor:'var(--tone-neg-fg)',  textColor:'var(--tone-neg-fg)' };
    default:       return { dotColor:'var(--tone-neu-fg)',  textColor:'var(--tone-neu-fg)' };
  }
}

/* -----------------------------------------------------------------------------
   UTILS
----------------------------------------------------------------------------- */
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fmtPct(x){ return Number.isFinite(Number(x)) ? (Number(x).toFixed(2)+'%') : '—'; }
function fmtNum(x){ return Number.isFinite(Number(x)) ? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Number(x)) : '—'; }
function fmtUsd(x){ return Number.isFinite(Number(x)) ? ('$'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Number(x))) : '—'; }

/* -----------------------------------------------------------------------------
   NORMALIZZAZIONE DATI (F3-Options)
----------------------------------------------------------------------------- */
function normalizeDataF3OPublic(src={}){
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F3-Options · Options Overlay',
    moduleVersion: src?.meta?.moduleVersion ?? 'v1.0',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Contenuto informativo/formativo. Nessuna istruzione operativa.',
  };

  // Head KPI (usati sia in snapshot card sia nella scheda 1)
  const head = {
    IV_ATM:       src?.head?.IV_ATM       || src?.options?.IV_ATM       || { raw:'—', tone:'neutral' },
    IV_rank_pct:  src?.head?.IV_rank_pct  || src?.options?.IV_rank_pct  || { raw:'—', tone:'neutral' },
    GSR_tkr:      src?.head?.GSR_tkr      || src?.options?.GSR_tkr      || { raw:'—', tone:'neutral' },
    DealerGamma:  src?.head?.DealerGamma  || src?.options?.DealerGamma  || { raw:'—', tone:'neutral' },
    ai_note:      src?.head?.ai_note || src?.options?.ai_note || ''
  };

  // 2) Expected Move
  const expected_move = (function(){
    const o = src?.expected_move || src?.options || {};
    return {
      rows: Array.isArray(o.EM_rows) ? o.EM_rows : [],
      ai_note: o.ai_note_em || ''
    };
  })();

  // 3) Term Structure / IV slope
  const term_structure = (function(){
    const o = src?.term_structure || src?.options || {};
    return {
      slope: o.TermSlope || null,
      context: o.TermNotes || '',
      tone: o.TermSlope?.tone || 'neutral',
      ai_note: o.ai_note_term || ''
    };
  })();

  // 4) Skew 25Δ / RR
  const skew = (function(){
    const o = src?.skew || src?.options || {};
    return {
      rr_25d: o.Skew_detail?.rr_25d,
      shape:  o.Skew_detail?.shape,
      tone:   o.Skew_detail?.tone || o.Skew_set?.tone || 'neutral',
      ai_note: o.ai_note_skew || ''
    };
  })();

  // 5) PCR & OI
  const pcr = (function(){
    const o = src?.pcr || src?.options?.PCR_breakdown || {};
    const fromOptions = src?.options?.PCR_breakdown || {};
    return {
      total_vol: o.total_vol ?? fromOptions.total_vol,
      total_oi:  o.total_oi  ?? fromOptions.total_oi,
      pcr_vol:   o.pcr_vol   ?? fromOptions.pcr_vol,
      pcr_oi:    o.pcr_oi    ?? fromOptions.pcr_oi,
      by_expiry: o.by_expiry ?? fromOptions.by_expiry ?? [],
      ai_note:   o.ai_note   ?? ''
    };
  })();

  // 6) Gamma / Max Pain / Dealer / GSR board
  const gamma = (function(){
    const o = src?.gamma || src?.options || {};
    return {
      GEX: { gamma_flip: o.GEX?.gamma_flip },
      MaxPain: o.MaxPain || null,
      DealerGamma: o.DealerGamma || { raw:'—', tone:'neutral' },
      Gamma_ATM: o.Gamma_ATM || { raw:'—', tone:'neutral' },
      Vega_ATM:  o.Vega_ATM  || { raw:'—', tone:'neutral' },
      GSR_tkr:   o.GSR_tkr   || { raw:'—', tone:'neutral' },
      ai_note_gsr: o.ai_note_gsr || '',
      ai_note: o.ai_note || '',
      tone: o.tone || 'neutral'
    };
  })();

  // 7) Flow istituzionale
  const flow = (function(){
    const o = src?.flow || src?.options?.Flow || {};
    return {
      net_usd: o.net_usd,
      delta_imb: o.delta_imb,
      top: Array.isArray(o.top) ? o.top : [],
      tone: o.tone || 'neutral',
      ai_note: o.ai_note || ''
    };
  })();

  // 8) Data Quality / Summary
  const data_quality = (function(){
    const q = src?.data_quality || src?.governance?.QualityMetrics || {};
    const gaps = src?.options?.DataGaps || src?.data_quality?.DataGaps || [];
    return {
      FreshnessScore: q.FreshnessScore || q.Coverage || { raw:'—', tone:'neutral' },
      ConfidenceFinal: q.ConfidenceFinal || { raw:'—', tone:'neutral' },
      DataIntegrity: q.DataIntegrity || { raw:'—', tone:'neutral' },
      FeedSync: q.FeedSync || { raw:'—', tone:'neutral' },
      DataGaps: Array.isArray(gaps) ? gaps : [],
      ai_note: src?.sintesi_ai || src?.options?.ai_note_summary || ''
    };
  })();

  // Bridge out (per F3 tecnico puro — opzionale)
  const bridge_out = {
    VolatilityRegime: head?.IV_rank_pct?.raw ?? null,
    GammaBias: gamma?.DealerGamma?.raw ?? null,
    IV_Level: head?.IV_ATM?.raw ?? null,
    IV_Slope: term_structure?.slope?.raw ?? term_structure?.slope ?? null
  };

  return { meta, head, expected_move, term_structure, skew, pcr, gamma, flow, data_quality, bridge_out };
}
