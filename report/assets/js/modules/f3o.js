// /report/assets/js/modules/f3o.js
//
// F3-Options · Options Overlay (3–10 giorni)
// UI e grammatica coerenti con F1B/F2:
// - metriche a card uniformi (nome → valore → ai_note → '?')
// - nessuna descrizione testuale hard-coded: tutto da JSON
// - Governance include anche Data Quality (come F2)
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> listeners + drawer
//
// Dipendenze globali:
//   window.__TradeliaUI.openPanel/closePanel/bindMetricInfoButtons

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF3OPublic(rawData);

  const kpis = [
    { key:'IV_ATM',      label:'IV (ATM)',        desc:'', metric:d.head.IV_ATM,       info:'F3O_IV_ATM_info' },
    { key:'IV_rank_pct', label:'IV Rank / %tile', desc:'', metric:d.head.IV_rank_pct,  info:'F3O_IV_RANK_info' },
    { key:'GSR_tkr',     label:'GSR (Γ/Vega)',    desc:'', metric:d.head.GSR_tkr,      info:'F3O_GSR_info' },
    { key:'DealerGamma', label:'Dealer Regime',   desc:'', metric:d.head.DealerGamma,  info:'F3O_DEALER_info' },
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
              data-state="${escapeAttr(d.meta.moduleStatus)}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus)}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness)}</span>
          </div>
          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Overlay volatilità & posizionamento dealer
          </div>
        </div>
      </header>

      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <div class="grid gap-3 grid-cols-2 md:grid-cols-2">
          ${kpis.map(metricBoxTrafficLightF3O).join('')}
        </div>

        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          ${d.meta.hero_disclaimer ? `<p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer)}</p>` : `<div class="flex-1"></div>`}
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

export function bindCard(node, rawData, ctx = {}) {
  if (!node) return;
  const data = normalizeDataF3OPublic(rawData);

  if (!node.__f3oDelegated) {
    node.__f3oDelegated = true;
    node.addEventListener('click', (ev)=>{
      const btn = ev.target && ev.target.closest('[data-open-f3o-details="true"]');
      if (!btn) return;
      openF3ODrawerPublic(data);
    }, { passive:true });
  }

  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(_){}
  }
}

/* -----------------------------------------------------------------------------
   DRAWER (8 sezioni operative + Governance con Data Quality)
----------------------------------------------------------------------------- */
function openF3ODrawerPublic(d){
  if (!window.__TradeliaUI?.openPanel) return;
  const sections = buildF3OSectionsPublic(d);
  const mobile   = isMobileViewport();
  const shell    = mobile ? renderF3OMobileShell(sections) : renderF3ODesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: 'F3-Options · Overlay derivati',
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
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3o-scroll-desktop')); } catch(_){}
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3o-scroll-mobile')); } catch(_){}
    }
    const first = root?.querySelector('[data-f3o-tab="kpi"]');
    if (first?.click) first.click();

    // hint pill scroll mobile
    const scrollBox = root?.querySelector('.f1b-footer-tabs-scroll');
    const fadeRight = root?.querySelector('.f1b-tabs-fade-right');
    if (scrollBox && fadeRight){
      const update = ()=>{
        const end = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
        fadeRight.style.opacity = end ? '0' : '.6';
      };
      update();
      scrollBox.addEventListener('scroll', update, { passive:true });
    }
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -----------------------------------------------------------------------------
   SEZIONI (metrica → valore → ai_note → '?')
----------------------------------------------------------------------------- */
function buildF3OSectionsPublic(d){
  // 1) KPI & Regime
  const k = d.head;
  const kpiHTML = `
    <section class="tl-panel-section" data-f3o-section="kpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('IV (ATM)',           k.IV_ATM,      'F3O_IV_ATM_info')}
      ${metricCard('IV Rank / %tile',    k.IV_rank_pct, 'F3O_IV_RANK_info')}
      ${metricCard('GSR (Γ/Vega)',       k.GSR_tkr,     'F3O_GSR_info')}
      ${metricCard('Dealer Regime',      k.DealerGamma, 'F3O_DEALER_info')}
      ${headlineBlockCardF3O('Nota AI', k.ai_note)}
    </section>`;

  // 2) Expected Move
  const emRows = (d.expected_move.rows||[]).slice(0,10).map(r=>`
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
      ${metricCard('Expected Move · Table', { raw:'', tone:'neutral', ai_note:d.expected_move.ai_note }, 'F3O_EM_info',
        `<div class="overflow-auto" data-scrollable>
          <table class="min-w-full text-[12px]">
            <thead><tr>
              <th class="text-left">Exp</th><th class="text-right">DTE</th>
              <th class="text-right">EM%</th><th class="text-right">Upper</th>
              <th class="text-right">Lower</th><th class="text-right">IV%</th>
            </tr></thead>
            <tbody>${emRows}</tbody>
          </table>
        </div>`)}
    </section>`;

  // 3) Term Structure
  const term = d.term_structure;
  const termHTML = `
    <section class="tl-panel-section" data-f3o-section="term" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('Term Slope',   toMetric(term.slope), 'F3O_TermSlope_info')}
      ${metricCard('Contesto',     { raw: term.context||'—', tone:term.tone, ai_note:term.ai_note }, 'F3O_TermContext_info')}
    </section>`;

  // 4) Skew / Risk Reversal
  const skew = d.skew;
  const skewHTML = `
    <section class="tl-panel-section" data-f3o-section="skew" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('RR 25Δ',   toMetric(skew.rr_25d), 'F3O_SkewRR_info')}
      ${metricCard('Forma',    { raw:skew.shape||'—', tone:skew.tone, ai_note:skew.ai_note }, 'F3O_SkewShape_info')}
    </section>`;

  // 5) PCR & Open Interest
  const pcr = d.pcr;
  const pcrHTML = `
    <section class="tl-panel-section" data-f3o-section="pcr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('PCR Vol',  toMetric(pcr.pcr_vol), 'F3O_PCRVol_info')}
      ${metricCard('PCR OI',   toMetric(pcr.pcr_oi),  'F3O_PCROI_info')}
      ${metricCard('Volumi Totali',  toMetric(pcr.total_vol), 'F3O_TotalVol_info')}
      ${metricCard('OI Totale',      toMetric(pcr.total_oi),  'F3O_TotalOI_info')}
      ${metricCard('Top per scadenza', { raw:(pcr.by_expiry||[]).map(x=>`${x.exp} · EM ${fmtPct(x.em)} · PCRv ${fmtNum(x.pcr_v)} · PCRoi ${fmtNum(x.pcr_oi)}`).join('\n') || '—', tone:'neutral', ai_note:pcr.ai_note }, 'F3O_PCRByExp_info')}
    </section>`;

  // 6) Gamma & Max Pain
  const g = d.gamma;
  const gammaHTML = `
    <section class="tl-panel-section" data-f3o-section="gamma" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('Gamma Flip',   toMetric(g.GEX?.gamma_flip), 'F3O_GammaFlip_info')}
      ${metricCard('Dealer Regime', g.DealerGamma,               'F3O_DealerRegime_info')}
      ${metricCard('Max Pain',     { raw:`${fmtNum(g?.MaxPain?.strike)} ${g?.MaxPain?.exp?`(exp ${g.MaxPain.exp})`:''}`, tone:g.tone, ai_note:g?.MaxPain?.ai_note||'' }, 'F3O_MaxPain_info')}
      ${metricCard('Γ/Vega Board', { raw:`Γ ATM: ${fmtNum(g.Gamma_ATM?.raw)}\nVega ATM: ${fmtNum(g.Vega_ATM?.raw)}\nGSR: ${String(g.GSR_tkr?.raw??'—')}`, tone:g.GSR_tkr?.tone||'neutral', ai_note:g.ai_note_gsr }, 'F3O_GSRBoard_info')}
      ${headlineBlockCardF3O('Nota AI', g.ai_note)}
    </section>`;

  // 7) Options Flow (istituzionali) – metrica per card
  const flow = d.flow;
  const topLines = (flow.top||[]).slice(0,8).map(t=>{
    const typ = String(t?.type||'').toUpperCase();
    const s   = fmtNum(t?.strike);
    const ex  = escapeHtml(String(t?.exp||''));
    const de  = escapeHtml(String(t?.delta||''));
    const pr  = fmtUsd(t?.premium);
    return `${typ} ${s} · ${ex} · Δ ${de} · prem. ${pr}`;
  }).join('\n');

  const flowHTML = `
    <section class="tl-panel-section" data-f3o-section="flow" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('Net $',          toMetric(flow.net_usd),    'F3O_FlowNetUSD_info')}
      ${metricCard('Δ-imbalance',    toMetric(flow.delta_imb),  'F3O_FlowDelta_info')}
      ${metricCard('Top prints',     { raw: topLines || '—', tone:flow.tone, ai_note:flow.ai_note }, 'F3O_FlowTop_info')}
    </section>`;

  // 8) Bridge (opzionale verso F3 tecnico)
  const br = d.bridge_out || {};
  const bridgeHTML = `
    <section class="tl-panel-section" data-f3o-section="bridge" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${metricCard('Bridge · VolatilityRegime', toMetric(br.VolatilityRegime), 'F3O_BridgeVolRegime_info')}
      ${metricCard('Bridge · GammaBias',        toMetric(br.GammaBias),        'F3O_BridgeGammaBias_info')}
      ${metricCard('Bridge · IV Level',         toMetric(br.IV_Level),         'F3O_BridgeIVLevel_info')}
      ${metricCard('Bridge · IV Slope',         toMetric(br.IV_Slope),         'F3O_BridgeIVSlope_info')}
    </section>`;

  // 9) Governance (include Data Quality)
  const aq = d.audit_quality?.QualityMetrics || {};
  const governanceHTML = `
    <section class="tl-panel-section" data-f3o-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      ${qualityChipF3O('FreshnessScore', aq?.FreshnessScore || aq?.Coverage)}
      ${qualityChipF3O('ConfidenceFinal', aq?.ConfidenceFinal)}
      ${qualityChipF3O('DataIntegrity',   aq?.DataIntegrity)}
      ${qualityChipF3O('FeedSync',        aq?.FeedSync)}
      ${d.data_quality?.DataGaps?.length ? listBlockCardF3O('Data gaps', d.data_quality.DataGaps) : ''}
      ${headlineBlockCardF3O('AuditPath', d.audit_quality?.AuditPathID || '—')}
      ${headlineBlockCardF3O('Informativa', d.mifid?.disclaimer || '')}
    </section>`;

  return { kpiHTML, emHTML, termHTML, skewHTML, pcrHTML, gammaHTML, flowHTML, bridgeHTML, governanceHTML };
}

/* -----------------------------------------------------------------------------
   SHELLS + TABS
----------------------------------------------------------------------------- */
function renderF3ODesktopShell(sections){
  return `
    <div id="f3o-root" class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:190px;max-width:210px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
${drawerBtnF3O('kpi','KPI & Regime')}
${drawerBtnF3O('em','Expected Move')}
${drawerBtnF3O('term','Term Structure')}
${drawerBtnF3O('skew','Skew / RR')}
${drawerBtnF3O('pcr','PCR & Open Interest')}
${drawerBtnF3O('gamma','Gamma & Max Pain')}
${drawerBtnF3O('flow','Options Flow')}
${drawerBtnF3O('bridge','Bridge → F3')}
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
        <div data-f3o-view="bridge" hidden>${sections.bridgeHTML}</div>
        <div data-f3o-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function renderF3OMobileShell(sections){
  const pills = [
    ['kpi','KPI'],['em','EM'],['term','Term'],['skew','Skew'],
    ['pcr','PCR/OI'],['gamma','Gamma'],['flow','Flow'],['bridge','Bridge'],['governance','Gov']
  ].map(([k,l])=>mobileTabBtnF3O(k,l)).join('');
  return `
    <div id="f3o-root" class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
        <div class="f1b-tabs-fade-left" style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%, rgba(0,0,0,0) 80%);opacity:.6;"></div>
        <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">
          ${pills}
        </div>
        <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);">
          <span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span>
        </div>
      </div>
      <main id="f3o-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f3o-view="kpi">${sections.kpiHTML}</div>
        <div data-f3o-view="em" hidden>${sections.emHTML}</div>
        <div data-f3o-view="term" hidden>${sections.termHTML}</div>
        <div data-f3o-view="skew" hidden>${sections.skewHTML}</div>
        <div data-f3o-view="pcr" hidden>${sections.pcrHTML}</div>
        <div data-f3o-view="gamma" hidden>${sections.gammaHTML}</div>
        <div data-f3o-view="flow" hidden>${sections.flowHTML}</div>
        <div data-f3o-view="bridge" hidden>${sections.bridgeHTML}</div>
        <div data-f3o-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function drawerBtnF3O(key,label){ return `<button class="f1b-tab-btn" data-f3o-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`; }
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
  btns.forEach(b=>{ if(b.__f3oBound) return; b.__f3oBound=true; b.addEventListener('click', ()=> activate(b.getAttribute('data-f3o-tab'))); });
}

/* -----------------------------------------------------------------------------
   CARD BUILDERS & METRIC GRAMMAR
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

// METRICA UNIFORME (Nome → Valore → ai_note → '?')
function metricCard(title, metricObj, infoId, customBodyHtml){
  const m = toMetric(metricObj);
  const { textColor } = toneColorsF3O(m.tone);
  const valueHtml = `<span class="font-mono font-bold text-[13px]" style="color:${textColor};">${escapeHtml(formatMetricValue(m))}</span>`;
  const body = customBodyHtml ?? `
    <div class="flex items-start justify-between gap-2 mb-1">
      ${valueHtml}
      ${infoId ? `<button class="info-btn" data-metric="${escapeAttr(infoId)}" aria-label="Info ${escapeAttr(infoId)}">?</button>` : ''}
    </div>
    ${ m.ai_note ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(m.ai_note)}</div>` : '' }`;
  return f3oCard({ tone:m.tone, title, bodyHtml:body, noteHtml:'' });
}

function metricBoxTrafficLightF3O({ label, desc, metric, info }){
  const m = toMetric(metric);
  const { dotColor, textColor } = toneColorsF3O(m.tone);
  return `
    <div class="flex-1 min-w-[90px]" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:0.6rem 0.75rem;">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
        </div>
        ${info ? `<button class="info-btn" data-metric="${escapeAttr(info)}" aria-label="Info ${escapeAttr(info)}">?</button>` : ''}
      </div>
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(formatMetricValue(m))}</div>
      ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : '' }
    </div>`;
}

function listBlockCardF3O(title, body){
  if (!body && body !== 0) return '';
  let tone='neutral', raw='';
  if (Array.isArray(body)) raw = body.map(x=>`• ${String(x)}`).join('\n');
  else if (typeof body==='object'){ tone = body?.tone || 'neutral'; raw = body?.raw || ''; }
  else raw = String(body);
  return f3oCard({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF3O(title, obj){
  if (obj===undefined || obj===null || obj==='') return '';
  let tone='neutral', raw='';
  if (typeof obj==='string') raw=obj; else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f3oCard({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function qualityChipF3O(key, q){
  if (!q) return '';
  const m = toMetric(q);
  const { textColor } = toneColorsF3O(m.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <span class="font-mono font-bold text-[13px]" style="color:${textColor};">${escapeHtml(formatMetricValue(m))}</span>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    ${ m.ai_note ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(m.ai_note)}</div>` : '' }`;
  return f3oCard({ tone:m.tone, title:key, bodyHtml, noteHtml:'' });
}

/* -----------------------------------------------------------------------------
   NORMALIZZAZIONE DATI
----------------------------------------------------------------------------- */
function normalizeDataF3OPublic(src = {}){
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module:       src?.meta?.module ?? 'F3-Options · Options Overlay',
    moduleVersion:src?.meta?.moduleVersion ?? 'v1.3',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness:    src?.meta?.freshness ?? '≤ T-1',
    hero_intro:   src?.meta?.hero_intro ?? '',
    hero_disclaimer: src?.meta?.hero_disclaimer ?? ''
  };

  const head = {
    IV_ATM:       toMetric(src?.head?.IV_ATM ?? src?.options?.IV_ATM),
    IV_rank_pct:  toMetric(src?.head?.IV_rank_pct ?? src?.options?.IV_rank_pct),
    GSR_tkr:      toMetric(src?.head?.GSR_tkr ?? src?.options?.GSR_tkr),
    DealerGamma:  toMetric(src?.head?.DealerGamma ?? src?.options?.DealerGamma),
    ai_note:      src?.head?.ai_note || src?.options?.ai_note || ''
  };

  const expected_move = {
    rows: Array.isArray(src?.expected_move?.rows) ? src.expected_move.rows
         : Array.isArray(src?.options?.EM_rows)   ? src.options.EM_rows : [],
    ai_note: src?.expected_move?.ai_note ?? src?.options?.ai_note_em ?? ''
  };

  const term_structure = (()=>{
    const slopeVal = src?.term_structure?.slope ?? src?.options?.TermSlope ?? null;
    const tone     = src?.term_structure?.tone  ?? src?.options?.TermSlope?.tone ?? toneFromIVSlope(slopeVal);
    return {
      slope: slopeVal,
      context: src?.term_structure?.context ?? src?.options?.TermNotes ?? '',
      ai_note: src?.term_structure?.ai_note ?? src?.options?.ai_note_term ?? '',
      tone
    };
  })();

  const skew = {
    rr_25d: src?.skew?.rr_25d ?? src?.options?.Skew_detail?.rr_25d,
    shape:  src?.skew?.shape  ?? src?.options?.Skew_detail?.shape,
    tone:   src?.skew?.tone   ?? src?.options?.Skew_detail?.tone ?? src?.options?.Skew_set?.tone ?? 'neutral',
    ai_note: src?.skew?.ai_note ?? src?.options?.ai_note_skew ?? ''
  };

  const pcr = (()=>{
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

  const gamma = {
    GEX:           { gamma_flip: src?.gamma?.GEX?.gamma_flip ?? src?.options?.GEX?.gamma_flip },
    MaxPain:       src?.gamma?.MaxPain ?? src?.options?.MaxPain ?? null,
    DealerGamma:   toMetric(src?.gamma?.DealerGamma ?? src?.options?.DealerGamma),
    Gamma_ATM:     toMetric(src?.gamma?.Gamma_ATM ?? src?.options?.Gamma_ATM),
    Vega_ATM:      toMetric(src?.gamma?.Vega_ATM  ?? src?.options?.Vega_ATM),
    GSR_tkr:       toMetric(src?.gamma?.GSR_tkr   ?? src?.options?.GSR_tkr),
    ai_note_gsr:   src?.gamma?.ai_note_gsr ?? src?.options?.ai_note_gsr ?? '',
    ai_note:       src?.gamma?.ai_note     ?? src?.options?.ai_note     ?? '',
    tone:          src?.gamma?.tone        ?? src?.options?.tone        ?? 'neutral'
  };

  const flow = {
    net_usd:   src?.flow?.net_usd   ?? src?.options?.Flow?.net_usd,
    delta_imb: src?.flow?.delta_imb ?? src?.options?.Flow?.delta_imb,
    top:       Array.isArray(src?.flow?.top) ? src.flow.top : (Array.isArray(src?.options?.Flow?.top) ? src.options.Flow.top : []),
    tone:      src?.flow?.tone ?? src?.options?.Flow?.tone ?? 'neutral',
    ai_note:   src?.flow?.ai_note ?? src?.options?.Flow?.ai_note ?? ''
  };

  const data_quality = {
    DataGaps: Array.isArray(src?.options?.DataGaps) ? src.options.DataGaps
            : Array.isArray(src?.data_quality?.DataGaps) ? src.data_quality.DataGaps : []
  };

  const audit_quality = (()=>{
    const aq = src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} };
    const qm = aq?.QualityMetrics || {};
    if (qm.Coverage && !qm.FreshnessScore) qm.FreshnessScore = qm.Coverage;
    return { ...aq, QualityMetrics: qm };
  })();

  const mifid = src?.mifid || { disclaimer:'' };

  const bridge_out = {
    VolatilityRegime: head.IV_rank_pct?.raw ?? null,
    GammaBias:        tryGet(()=>src?.gamma?.DealerGamma?.raw) ?? tryGet(()=>src?.options?.DealerGamma?.raw) ?? null,
    IV_Level:         head.IV_ATM?.raw ?? null,
    IV_Slope:         (term_structure?.slope && term_structure.slope.raw!==undefined) ? term_structure.slope.raw : term_structure.slope ?? null
  };

  return { meta, head, expected_move, term_structure, skew, pcr, gamma, flow, data_quality, audit_quality, mifid, bridge_out };
}

/* -----------------------------------------------------------------------------
   UTILS / TONE
----------------------------------------------------------------------------- */
function toMetric(v){
  if (v && typeof v==='object' && ('raw' in v || 'tone' in v || 'ai_note' in v)) {
    return { raw: v.raw ?? '—', tone: (v.tone || 'neutral'), ai_note: v.ai_note || '' };
  }
  if (v===undefined || v===null || v==='') return { raw:'—', tone:'neutral', ai_note:'' };
  return { raw:v, tone:'neutral', ai_note:'' };
}

function toneColorsF3O(tone){
  switch((tone||'').toLowerCase()){
    case 'green':  return { dotColor:'var(--tone-pos-fg)',  textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red':    return { dotColor:'var(--tone-neg-fg)',  textColor:'var(--tone-neg-fg)' };
    default:       return { dotColor:'var(--tone-neu-fg)',  textColor:'var(--tone-neu-fg)' };
  }
}
function toneFromIVSlope(s){
  const x = Number(s?.raw ?? s);
  if (!Number.isFinite(x)) return 'neutral';
  if (x > 0.05) return 'green';
  if (x < -0.05) return 'red';
  return 'yellow';
}

function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fmtPct(x){ const n=Number(x); return Number.isFinite(n) ? (n.toFixed(2)+'%') : '—'; }
function fmtNum(x){ const n=Number(x); return Number.isFinite(n) ? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n) : '—'; }
function fmtUsd(x){ const n=Number(x); return Number.isFinite(n) ? ('$'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n)) : '—'; }
function formatMetricValue(obj){ const v=obj?.raw; if (v===null||v===undefined||v==='') return '—'; if (Array.isArray(v)) return v.join(', '); if (typeof v==='object') return JSON.stringify(v).slice(0,120); return String(v); }
function tryGet(fn){ try{ return fn(); }catch(_){ return null; } }
