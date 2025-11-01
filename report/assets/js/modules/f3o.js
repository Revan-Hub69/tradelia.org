// /report/assets/js/modules/f3o.js (rewrite v1.2-adapter)
//
// F3O · Options Overlay (derivati) — 3–10 giorni
// - NIENTE descrizioni hard‑coded: tutto arriva da JSON (ai_note / labels)
// - Adattato per leggere JSON con ui_labels.{s1_title..s9_title} come da feed del 2025‑10‑31
// - Sezioni con nomi più intuitivi (fallback se manca ui_labels)
// - Governance completa (Quality chips + AuditPath + MiFID)
// - "Sintesi" rinominata in "Sintesi educativa" e resa a schede (points[])
// - Posizionamento (?) coerente: sempre a destra del titolo/metric box
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> listeners (CTA + tooltip + tabs)
//
// Dipendenze globali:
//   window.__TradeliaUI.openPanel/closePanel/bindMetricInfoButtons

export function renderCard(rawData, ctx = {}){
  const d = normalizeDataF3OPublic(rawData);

 const kpis = [
  {
    key: "F3O_IV_ATM_info",
    label: "IV (ATM)",
    desc: "Volatilità implicita at-the-money (proxy 30D).",
    metric: d.head.IV_ATM
  },
  {
    key: "F3O_IVRank_info",
    label: "IV Rank / %tile",
    desc: "Posizione dell’IV nel range 1Y (rank/percentile).",
    metric: d.head.IV_rank_pct
  },
  {
    key: "F3O_GSR_info",
    label: "GSR (Γ/Vega)",
    desc: "Rapporto Gamma/Vega; segnala sensitività dealer.",
    metric: d.head.GSR_tkr
  },
  {
    key: "F3O_Dealer_info",
    label: "Dealer Regime",
    desc: "Posizionamento gamma dei dealer (long/short).",
    metric: d.head.DealerGamma
  }
];


  return `
  <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
    style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <!-- HEAD -->
    <header class="section-headline mb-4">
      <div class="section-head-left">
        <div class="section-head-topline flex items-center flex-wrap gap-2">
          <span class="section-badge">F3O</span>
          <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            ${escapeHtml(d.labels?.hero_subtitle)}
          </span>
          <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
            data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
            style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
            ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
          </span>
          <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
        </div>
        <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
          ${escapeHtml(d.labels?.hero_title)}
        </div>
        <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
          ${escapeHtml(d.meta.hero_intro || '')}
        </div>
      </div>
    </header>

    <!-- CARD PRINCIPALE -->
    <div class="relative flex flex-col gap-4 card-compact"
      style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

      <!-- KPI -->
      <div class="grid gap-3 grid-cols-2 md:grid-cols-2">
        ${kpis.map(k=>metricBoxTrafficLightF3O(k)).join('')}
      </div>

      <!-- DISCLAIMER + CTA -->
      <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
        <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
          ${escapeHtml(d.meta.hero_disclaimer || '')}
        </p>
        <div class="flex lg:justify-end">
          <button class="f3o-cta-btn" data-open-f3o-details="true" type="button"
            style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
            ${escapeHtml(d.labels?.cta_details)} →
          </button>
        </div>
      </div>
    </div>
  </section>`;
}

export function bindCard(node, rawData, ctx = {}){
  if (!node) return;
  const d = normalizeDataF3OPublic(rawData);
  const btn = node.querySelector('[data-open-f3o-details="true"]');
  if (btn) btn.addEventListener('click', ()=> openF3ODrawer(d));
  if (window.__TradeliaUI?.bindMetricInfoButtons){ try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(_) {} }
}

/* -----------------------------------------------------------------------------
   DRAWER (replica shell F1B)
----------------------------------------------------------------------------- */
function openF3ODrawer(d){
  if (!window.__TradeliaUI?.openPanel) return;
  const sections = buildF3OSections(d);  
  const mobile   = isMobile();
  const shell    = mobile ? renderMobileShell(sections, d) : renderDesktopShell(sections, d);



  window.__TradeliaUI.openPanel({
    title:'F3O · Options Overlay',
    subtitle:'',
    sections:[{ title:'', body:shell, meta:'' }],
    blocking:false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [{ label:d.labels?.cta_close, action:()=>window.__TradeliaUI.closePanel() }],
    footerTabs:[]
  });

  setTimeout(()=>{
    bindTabsF3O();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f3o-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f3o-scroll-mobile')); } catch(e){}
    }
    const first = document.querySelector('[data-f3o-tab="kpi"]');
    if (first && typeof first.click==='function') first.click();
    initScrollableTabsHint();
    bindEMToggle();
  },0);
}

function isMobile(){ return window.matchMedia('(max-width: 767px)').matches; }
function initScrollableTabsHint(){
  const scrollBox = document.querySelector('.f1b-footer-tabs-scroll');
  const fadeRight = document.querySelector('.f1b-tabs-fade-right');
  if(!scrollBox || !fadeRight) return;
  const needs = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
  if(!needs){
    fadeRight.style.display='none';
    const fl = document.querySelector('.f1b-tabs-fade-left'); if(fl) fl.style.display='none';
    return;
  }
  const hintEl = fadeRight.querySelector('.f1b-tabs-scroll-hint');
  const update = ()=>{
    const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
    if(hintEl) hintEl.style.opacity = atEnd ? '0' : '.9';
    const fl = document.querySelector('.f1b-tabs-fade-left');
    if (fl) fl.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
  };
  update();
  scrollBox.addEventListener('scroll', update, { passive:true });
}

/* -----------------------------------------------------------------------------
   SEZIONI (no hard‑coded desc; titoli da labels; (?) sempre a destra)
----------------------------------------------------------------------------- */
function buildF3OSections(d){
  const L = d.sectionTitles; // titoli user‑friendly

  // 1) KPI (quadro rapido)
  const s1 = `
  <section class="tl-panel-section" data-f3o-section="kpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.kpi)}</div></header>
    <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
      ${metricBlockF3O('F3O_IV_ATM_info', d.labels?.kpi_iv_atm, '', d.head.IV_ATM)}
      ${metricBlockF3O('F3O_IVRank_info', d.labels?.kpi_ivrank, '', d.head.IV_rank_pct)}
      ${metricBlockF3O('F3O_GSR_info', d.labels?.kpi_gsr, '', d.head.GSR_tkr)}
      ${metricBlockF3O('F3O_Dealer_info', d.labels?.kpi_dealer, '', d.head.DealerGamma)}
    </div>
    ${headlineBlockF3O(d.labels?.note_ai, d.head.ai_note)}
  </section>`;

  // 2) Expected Move
  const emRows = (d.expected_move.rows||[]).slice(0,12).map(r=>`
    <tr>
      <td>${escapeHtml(r.expiration||'')}</td>
      <td class="text-right">${escapeHtml(String(r.dte ?? '—'))}</td>
      <td class="text-right">${fmtPct(r.em_percent)}</td>
      <td class="text-right">${fmtNum(r.upper)}</td>
      <td class="text-right">${fmtNum(r.lower)}</td>
      <td class="text-right">${fmtPct(r.iv_percent)}</td>
    </tr>`).join('');
const s2 = `
  <section class="tl-panel-section" data-f3o-section="em" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.em)}</div></header>
    ${f3oCard({ tone:'neutral', title:(d.labels?.em_table_title||'Expected Move'), bodyHtml:`
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(d.labels?.spot||'Spot')}: <span class="font-mono">${fmtNum(d.spot)||'—'}</span></div>
        <div class="inline-flex items-center gap-0 border border-[color:var(--br-card)] rounded-[999px] overflow-hidden" role="group" aria-label="${escapeAttr(d.labels?.em_toggle_arialabel||'Toggle Expected Move unit')}">
          <button type="button" class="em-toggle-btn px-2 py-1 text-[11px]" data-em-toggle="pct" aria-pressed="true" title="${escapeAttr(d.labels?.em_toggle_pct_title||'Mostra EM in percentuale')}">%</button>
          <button type="button" class="em-toggle-btn px-2 py-1 text-[11px]" data-em-toggle="usd" aria-pressed="false" title="${escapeAttr(d.labels?.em_toggle_usd_title||'Mostra EM in dollari')}">$</button>
          <button type="button" class="info-btn ml-2" data-metric="F3O_EM_TOGGLE_info" aria-label="Info EM toggle">?</button>
        </div>
      </div>
      <div class="overflow-auto" data-scrollable id="em-container" data-em-mode="pct">
        <table class="min-w-full text-[12px]">
          <thead><tr>
            <th class="text-left">${escapeHtml(d.labels?.em_cols?.exp)}</th>
            <th class="text-right">${escapeHtml(d.labels?.em_cols?.dte)}</th>
            <th class="text-right">
              <span data-kind="pct">${escapeHtml(d.labels?.em_cols?.em)}</span>
              <span data-kind="usd" style="display:none;">${escapeHtml(d.labels?.em_col_usd||'EM$')}</span>
            </th>
            <th class="text-right">${escapeHtml(d.labels?.em_cols?.up)}</th>
            <th class="text-right">${escapeHtml(d.labels?.em_cols?.down)}</th>
            <th class="text-right">${escapeHtml(d.labels?.em_cols?.iv)}</th>
          </tr></thead>
          <tbody>
            ${(d.expected_move.rows||[]).slice(0,12).map(r=>{
              const emUsd = (Number(r?.em_percent)||0)/100 * (Number(d.spot)||0);
              return `
              <tr>
                <td>${escapeHtml(r.expiration||'')}</td>
                <td class="text-right">${escapeHtml(String(r.dte ?? '—'))}</td>
                <td class="text-right">
                  <span data-kind="pct">${fmtPct(r.em_percent)}</span>
                  <span data-kind="usd" style="display:none;">${fmtUsd2(emUsd)}</span>
                </td>
                <td class="text-right">${fmtNum(r.upper)}</td>
                <td class="text-right">${fmtNum(r.lower)}</td>
                <td class="text-right">${fmtPct(r.iv_percent)}</td>
              </tr>`;}).join('')}
          </tbody>
        </table>
      </div>` })}
    ${headlineBlockF3O(d.labels?.note_ai, d.expected_move.ai_note)}
  </section>`;

  // 3) Term Structure
  const s3 = `
  <section class="tl-panel-section" data-f3o-section="term" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.term)}</div></header>
    ${metricBlockF3O('F3O_TermSlope_info', d.labels?.term_slope, '', d.term_structure.slope)}
    ${headlineBlockF3O(d.labels?.contesto, d.term_structure.context)}
    ${headlineBlockF3O(d.labels?.note_ai, d.term_structure.ai_note)}
  </section>`;

  // 4) Skew
  const s4 = `
  <section class="tl-panel-section" data-f3o-section="skew" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.skew)}</div></header>
    ${metricBlockF3O('F3O_RR25_info', d.labels?.skew_rr25, '', { raw: fmtPct(d.skew.rr_25d), tone:d.skew.tone })}
    ${headlineBlockF3O(d.labels?.forma, d.skew.shape)}
    ${headlineBlockF3O(d.labels?.note_ai, d.skew.ai_note)}
  </section>`;

  // 5) PCR & OI
  const byExp = (d.pcr.by_expiry||[]).slice(0,6).map(x=>`• ${escapeHtml(x.exp||'')} · EM ${fmtPct(x.em)} · PCRv ${fmtNum(x.pcr_v)} · PCRoi ${fmtNum(x.pcr_oi)}`).join('\n');
  const s5 = `
  <section class="tl-panel-section" data-f3o-section="pcr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.pcr)}</div></header>
    <div class="grid md:grid-cols-2 gap-3">
      ${metricBlockF3O('F3O_PCR_Vol_info', d.labels?.pcr_vol, '', { raw: fmtNum(d.pcr.pcr_vol), tone:'neutral' })}
      ${metricBlockF3O('F3O_PCR_OI_info', d.labels?.pcr_oi,  '', { raw: fmtNum(d.pcr.pcr_oi),  tone:'neutral' })}
    </div>
    ${f3oCard({ tone:'neutral', title:d.labels?.pcr_byexp, bodyHtml:`<pre class="whitespace-pre-wrap text-[12px] leading-[1.4]">${escapeHtml(byExp||'—')}</pre>` })}
    ${headlineBlockF3O(d.labels?.note_ai, d.pcr.ai_note)}
  </section>`;

  // 6) Gamma & Max Pain
  const s6 = `
  <section class="tl-panel-section" data-f3o-section="gamma" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.gamma)}</div></header>
    ${metricBlockF3O('F3O_GammaFlip_info', d.labels?.gamma_flip, '', toMetric(d.gamma?.GEX?.gamma_flip, d.gamma?.tone))}
    ${metricBlockF3O('F3O_DealerRegime_info', d.labels?.dealer_regime, '', d.gamma?.DealerGamma)}
    ${metricBlockF3O('F3O_MaxPain_info', d.labels?.max_pain, '', toMetric(d.gamma?.MaxPain?.strike, d.gamma?.tone, d.gamma?.MaxPain?.ai_note))}
    <div class="grid md:grid-cols-3 gap-3">
      ${metricBlockF3O('F3O_GammaATM_info', d.labels?.gamma_atm, '', d.gamma?.Gamma_ATM)}
      ${metricBlockF3O('F3O_VegaATM_info', d.labels?.vega_atm,  '', d.gamma?.Vega_ATM)}
      ${metricBlockF3O('F3O_GSR_info',      d.labels?.gsr_ratio, '', d.gamma?.GSR_tkr)}
    </div>
    ${headlineBlockF3O(d.labels?.nota_gsr, d.gamma?.ai_note_gsr)}
    ${headlineBlockF3O(d.labels?.note_ai,  d.gamma?.ai_note)}
  </section>`;

  // 7) Options Flow
  const flowTop = (d.flow.top||[]).slice(0,6).map(t=>`• ${String(t?.type||'')} ${fmtNum(t?.strike)} · ${String(t?.exp||'')} · Δ ${String(t?.delta||'')} · prem. ${fmtUsd(t?.premium)}`).join('\n');
  const s7 = `
  <section class="tl-panel-section" data-f3o-section="flow" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.flow)}</div></header>
    <div class="grid md:grid-cols-2 gap-3">
      ${metricBlockF3O('F3O_FlowNet_info', d.labels?.flow_net,   '', toMetric(d.flow.net_usd,   d.flow.tone))}
      ${metricBlockF3O('F3O_DeltaImb_info',d.labels?.flow_delta, '', toMetric(d.flow.delta_imb, d.flow.tone))}
    </div>
    ${f3oCard({ tone:d.flow.tone||'neutral', title:d.labels?.flow_top, bodyHtml:`<pre class="whitespace-pre-wrap text-[12px] leading-[1.4]">${escapeHtml(flowTop||'—')}</pre>` })}
    ${headlineBlockF3O(d.labels?.note_ai, d.flow.ai_note)}
  </section>`;

  // 8) Sintesi educativa (a schede)
  const sPoints = (d.sintesi_ai.points||[]).map(p=>{
    const tone = p.tone || 'neutral';
    const bodyHtml = `
      <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(p.raw||'')}</div>
      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(p.ai_note||'')}</div>`;
    return f3oCard({ tone, title: p.title||'', bodyHtml, noteHtml:'' });
  }).join('');
  const s8 = `
  <section class="tl-panel-section" data-f3o-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.sintesi)}</div></header>
    ${sPoints || ''}
    ${headlineBlockF3O(d.labels?.lettura_contesto, d.sintesi_ai.summary)}
    <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">${escapeHtml(d.labels?.sintesi_disclaimer)}</div>
  </section>`;

  // 9) Governance completa
  const q = d.audit_quality?.QualityMetrics || {};
  const s9 = `
  <section class="tl-panel-section" data-f3o-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(L.governance)}</div></header>
    <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
      ${qualityChipF3O('FreshnessScore', q?.FreshnessScore || q?.Coverage)}
      ${qualityChipF3O('ConfidenceFinal', q?.ConfidenceFinal)}
      ${qualityChipF3O('DataIntegrity',  q?.DataIntegrity)}
      ${qualityChipF3O('FeedSync',       q?.FeedSync)}
    </div>
    ${headlineBlockF3O('AuditPath', d.audit_quality?.AuditPathID || '—')}
    ${headlineBlockF3O('Informativa', d.mifid?.disclaimer || '')}
  </section>`;

  return { s1, s2, s3, s4, s5, s6, s7, s8, s9 };
}

/* -----------------------------------------------------------------------------
   SHELLS (identiche a F1B, titoli menu da labels friendly)
----------------------------------------------------------------------------- */
function renderDesktopShell(s, d){
  const L = d.menuTitles;
  return `
  <div class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
    <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
      ${menuBtn('kpi',       L.kpi)}
      ${menuBtn('em',        L.em)}
      ${menuBtn('term',      L.term)}
      ${menuBtn('skew',      L.skew)}
      ${menuBtn('pcr',      L.pcr)}
      ${menuBtn('gamma',     L.gamma)}
      ${menuBtn('flow',      L.flow)}
      ${menuBtn('sintesi',   L.sintesi)}
      ${menuBtn('governance',L.governance)}
    </aside>
    <main id="f3o-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
      <div data-f3o-view="kpi">${s.s1}</div>
      <div data-f3o-view="em" hidden>${s.s2}</div>
      <div data-f3o-view="term" hidden>${s.s3}</div>
      <div data-f3o-view="skew" hidden>${s.s4}</div>
      <div data-f3o-view="pcr" hidden>${s.s5}</div>
      <div data-f3o-view="gamma" hidden>${s.s6}</div>
      <div data-f3o-view="flow" hidden>${s.s7}</div>
      <div data-f3o-view="sintesi" hidden>${s.s8}</div>
      <div data-f3o-view="governance" hidden>${s.s9}</div>
    </main>
  </div>`;
}

function renderMobileShell(s, d){
  const L = d.menuTitles;
  const pills = [
    ['kpi',L.kpi],['em',L.em],['term',L.term],
    ['skew',L.skew],['pcr',L.pcr],['gamma',L.gamma],
    ['flow',L.flow],['sintesi',L.sintesi],['governance',L.governance]
  ].map(([k,l])=>mobileBtn(k,l)).join('');
  const bar = `
    <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left"  style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%, rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">${pills}</div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);">
        <span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span>
      </div>
    </div>`;
  return `
  <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
    ${bar}
    <main id="f3o-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
      <div data-f3o-view="kpi">${s.s1}</div>
      <div data-f3o-view="em" hidden>${s.s2}</div>
      <div data-f3o-view="term" hidden>${s.s3}</div>
      <div data-f3o-view="skew" hidden>${s.s4}</div>
      <div data-f3o-view="pcr" hidden>${s.s5}</div>
      <div data-f3o-view="gamma" hidden>${s.s6}</div>
      <div data-f3o-view="flow" hidden>${s.s7}</div>
      <div data-f3o-view="sintesi" hidden>${s.s8}</div>
      <div data-f3o-view="governance" hidden>${s.s9}</div>
    </main>
  </div>`;
}

function menuBtn(k,l){ return `<button class="f1b-tab-btn" data-f3o-tab="${escapeAttr(k)}">${escapeHtml(l)}</button>`; }
function mobileBtn(k,l){
  return `<button class="f1b-footer-tab-btn" data-f3o-tab="${escapeAttr(k)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(l)}</button>`;
}

/* -----------------------------------------------------------------------------
   TAB SWITCH (coerente, reset scroll/panel/menu)
----------------------------------------------------------------------------- */
function bindTabsF3O(){
  const btns  = document.querySelectorAll('[data-f3o-tab]');
  const views = document.querySelectorAll('[data-f3o-view]');
  const desk  = document.getElementById('f3o-scroll-desktop');
  const mob   = document.getElementById('f3o-scroll-mobile');
  const side  = document.querySelector('.f1b-panel-menu');

  function resetScroll(){ [desk, mob, side].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; try{ el.scrollTo({top:0,left:0,behavior:'auto'});}catch(_){} }); }
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
          if (hdr){ hdr.setAttribute('tabindex','-1'); try{ hdr.focus({preventScroll:true}); }catch{ hdr.focus(); } }
        });
      }
    });
  }
  function activate(k){ styleTabs(k); show(k); }
  btns.forEach(b=>{ if(b.__f3oBound) return; b.__f3oBound=true; b.addEventListener('click', ()=> activate(b.getAttribute('data-f3o-tab'))); });
}

/* -----------------------------------------------------------------------------
   CARD/COMPONENTS (prefisso F3O; nessuna descrizione hard‑coded)
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
    ${noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : ''}
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
      <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(metric?.raw || '—')}</div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : '' }
  </div>`;
}

function metricBlockF3O(infoKey, title, desc, metricObj){
  const m = metricObj || {};
  const { textColor } = toneColorsF3O(m.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(m.raw ?? '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(infoKey)}" aria-label="Info ${escapeAttr(infoKey)}">?</button>
    </div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>` : ''}
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(m.ai_note || '')}</div>`;
  return f3oCard({ tone:m.tone, title, bodyHtml, noteHtml:'' });
}

function qualityChipF3O(key, q){
  if(!q) return '';
  const { textColor } = toneColorsF3O(q.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note || '')}</div>`;
  return f3oCard({ tone:q.tone, title:key||'', bodyHtml, noteHtml:'' });
}

function headlineBlockF3O(title, body){
  if (body===undefined || body===null || body==='') return '';
  let tone='neutral', raw='';
  if (typeof body==='string'){ raw=body; }
  else { tone=body?.tone||'neutral'; raw=body?.raw||''; }
  return f3oCard({ tone, title, bodyHtml:`<div class="text-[12.5px] leading-[1.45] whitespace-pre-line">${escapeHtml(raw)}</div>`, noteHtml:'' });
}

// Toggle EM % / $
function bindEMToggle(){
  const container = document.getElementById('em-container');
  if(!container) return;
  const btns = document.querySelectorAll('.em-toggle-btn');
  const setMode = (mode)=>{
    container.setAttribute('data-em-mode', mode);
    btns.forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.emToggle===mode)));
    container.querySelectorAll('[data-kind]').forEach(el=>{
      const kind = el.getAttribute('data-kind');
      el.style.display = (kind===mode) ? '' : 'none';
    });
  };
  btns.forEach(b=>{
    if(b.__emBound) return; b.__emBound = true;
    b.addEventListener('click', ()=> setMode(b.dataset.emToggle==='usd' ? 'usd':'pct'));
  });
}

/* -----------------------------------------------------------------------------
   TONE / UTILS
----------------------------------------------------------------------------- */
function toneColorsF3O(tone){
  switch((tone||'').toLowerCase()){
    case 'green':  return { dotColor:'var(--tone-pos-fg)',  textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red':    return { dotColor:'var(--tone-neg-fg)',  textColor:'var(--tone-neg-fg)' };
    default:       return { dotColor:'var(--tone-neu-fg)',  textColor:'var(--tone-neu-fg)' };
  }
}
function toMetric(raw, tone='neutral', ai_note=''){ return { raw: (raw ?? '—'), tone, ai_note }; }
function escapeHtml(s){ if(s===undefined||s===null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(s){ if(s===undefined||s===null) return ''; return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function fmtPct(x){ const n=Number(x); return Number.isFinite(n)? n.toFixed(2)+'%':'—'; }
function fmtNum(x){ const n=Number(x); return Number.isFinite(n)? new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n):'—'; }
function fmtUsd(x){ const n=Number(x); return Number.isFinite(n)? '$'+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n):'—'; }
function fmtUsd2(x){ const n=Number(x); return Number.isFinite(n)? '$'+new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n):'—'; }

/* -----------------------------------------------------------------------------
   NORMALIZZAZIONE (mapping + labels friendly)
   — ADATTATA ai feed con ui_labels.{s1_title..s9_title}
----------------------------------------------------------------------------- */
function normalizeDataF3OPublic(src={}){
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F3O · Options Overlay',
    moduleVersion: src?.meta?.moduleVersion ?? 'v1.2',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer: src?.meta?.hero_disclaimer ?? ''
  };

  // UI labels (user-friendly) — tutto override‑abile da src.ui_labels
  const defaults = {
    hero_title: 'Volatilità, curva IV, skew e posizionamento',
    hero_subtitle: 'Options Overlay · Orizzonte 3–10 giorni',
    cta_details: 'Apri dettagli',
    cta_close: 'Chiudi',
    // KPI labels
    kpi_iv_atm: 'IV (ATM)',
    kpi_ivrank: 'IV Rank / %tile',
    kpi_gsr: 'GSR (Γ/Vega)',
    kpi_dealer: 'Dealer Regime',
    // Section titles (menu)
    menu: {
      kpi: 'Quadro rapido',
      em: 'Range atteso (EM)',
      term: 'Curva IV (scadenze)',
      skew: 'Skew 25Δ (asimmetria)',
      pcr: 'Put/Call & OI',
      gamma: 'Gamma · Max Pain · Dealer',
      flow: 'Flussi opzioni (istituzionali)',
      sintesi: 'Sintesi educativa',
      governance: 'Governance (Audit & MiFID)'
    },
    // Section headers (inside)
    sections: {
      kpi: 'Quadro rapido',
      em: 'Range atteso (Expected Move)',
      term: 'Curva IV (term structure)',
      skew: 'Skew 25Δ / Risk Reversal',
      pcr: 'Put/Call & Open Interest',
      gamma: 'Gamma · Max Pain · Dealer',
      flow: 'Flussi opzioni (istituzionali)',
      sintesi: 'Sintesi educativa',
      governance: 'Governance · Audit & MiFID'
    },
    // Column labels EM
    em_cols: { exp:'Exp', dte:'DTE', em:'EM%', up:'Upper', down:'Lower', iv:'IV%' },
    // Generic text labels
    note_ai: 'Nota AI',
    contesto: 'Contesto',
    forma: 'Forma skew',
    term_slope: 'Slope',
    skew_rr25: 'RR 25Δ',
    pcr_vol: 'PCR (Vol)',
    pcr_oi: 'PCR (OI)',
    pcr_byexp: 'Per scadenza (top)',
    gamma_flip: 'Gamma Flip',
    dealer_regime: 'Dealer Regime',
    max_pain: 'Max Pain',
    gamma_atm: 'Γ ATM',
    vega_atm: 'Vega ATM',
    gsr_ratio: 'GSR',
    flow_net: 'Net $',
    flow_delta: 'Δ-imbalance',
    flow_top: 'Top prints',
    lettura_contesto: 'Lettura di contesto',
    sintesi_disclaimer: 'Sezione a fini esclusivamente informativi/educativi. Nessuna raccomandazione personale.'
  };

  // Mappa dinamicamente ui_labels.{s1_title..s9_title} → menu/sections
  const UL = src?.ui_labels || {};
  const uiFromS = (k, fallback) => (typeof UL[k] === 'string' && UL[k].trim()) ? UL[k].trim() : fallback;
  const sectionsFromS = {
    kpi: uiFromS('s1_title', defaults.sections.kpi),
    em: uiFromS('s2_title', defaults.sections.em),
    term: uiFromS('s3_title', defaults.sections.term),
    skew: uiFromS('s4_title', defaults.sections.skew),
    pcr: uiFromS('s5_title', defaults.sections.pcr),
    gamma: uiFromS('s6_title', defaults.sections.gamma),
    flow: uiFromS('s7_title', defaults.sections.flow),
    sintesi: uiFromS('s8_title', defaults.sections.sintesi),
    governance: uiFromS('s9_title', defaults.sections.governance)
  };

  // Hero title/subtitle: fallback dall'input JSON se presente
  const hero_title = UL?.hero_title || defaults.hero_title;
  const hero_subtitle = UL?.hero_subtitle || `${src?.meta?.module || 'F3O · Options Overlay'} · Orizzonte 3–10 giorni`;

  const labels = {
    ...defaults,
    ...UL,
    hero_title,
    hero_subtitle,
    menu: { ...(defaults.menu||{}), ...sectionsFromS }, // usa gli stessi titoli anche per il menu
    sections: { ...(defaults.sections||{}), ...sectionsFromS },
    em_cols: { ...(defaults.em_cols||{}), ...(UL.em_cols||{}) }
  };

  const head = {
    IV_ATM:      src?.head?.IV_ATM      || src?.options?.IV_ATM      || { raw:'—', tone:'neutral' },
    IV_rank_pct: src?.head?.IV_rank_pct || src?.options?.IV_rank_pct || { raw:'—', tone:'neutral' },
    GSR_tkr:     src?.head?.GSR_tkr     || src?.options?.GSR_tkr     || { raw:'—', tone:'neutral' },
    DealerGamma: src?.head?.DealerGamma || src?.options?.DealerGamma || { raw:'—', tone:'neutral' },
    ai_note:     src?.head?.ai_note || src?.options?.ai_note || ''
  };

  const expected_move = {
    rows: Array.isArray(src?.expected_move?.rows) ? src.expected_move.rows
         : Array.isArray(src?.options?.EM_rows)   ? src.options.EM_rows : [],
    ai_note: src?.expected_move?.ai_note || src?.options?.ai_note_em || ''
  };

  const term_structure = {
    slope:   src?.term_structure?.slope ?? src?.options?.TermSlope ?? { raw:'—', tone:'neutral' },
    context: src?.term_structure?.context || src?.options?.TermNotes || '',
    ai_note: src?.term_structure?.ai_note || src?.options?.ai_note_term || ''
  };

  const skew = {
    rr_25d:  src?.skew?.rr_25d ?? src?.options?.Skew_detail?.rr_25d,
    shape:   src?.skew?.shape  ?? src?.options?.Skew_detail?.shape,
    tone:    src?.skew?.tone   ?? src?.options?.Skew_detail?.tone ?? src?.options?.Skew_set?.tone ?? 'neutral',
    ai_note: src?.skew?.ai_note || src?.options?.ai_note_skew || ''
  };

  const pcr = (()=>{
    const o = src?.pcr || src?.options?.PCR_breakdown || {};
    return {
      total_vol:o.total_vol, total_oi:o.total_oi,
      pcr_vol:o.pcr_vol, pcr_oi:o.pcr_oi,
      by_expiry: Array.isArray(o.by_expiry)? o.by_expiry:[],
      ai_note: o.ai_note || ''
    };
  })();

  const gamma = {
    GEX: { gamma_flip: src?.gamma?.GEX?.gamma_flip ?? src?.options?.GEX?.gamma_flip },
    MaxPain: src?.gamma?.MaxPain || src?.options?.MaxPain || null,
    DealerGamma: src?.gamma?.DealerGamma || src?.options?.DealerGamma || { raw:'—', tone:'neutral' },
    Gamma_ATM:  src?.gamma?.Gamma_ATM  || src?.options?.Gamma_ATM  || { raw:'—', tone:'neutral' },
    Vega_ATM:   src?.gamma?.Vega_ATM   || src?.options?.Vega_ATM   || { raw:'—', tone:'neutral' },
    GSR_tkr:    src?.gamma?.GSR_tkr    || src?.options?.GSR_tkr    || { raw:'—', tone:'neutral' },
    ai_note_gsr: src?.gamma?.ai_note_gsr || src?.options?.ai_note_gsr || '',
    ai_note: src?.gamma?.ai_note || src?.options?.ai_note || '',
    tone: src?.gamma?.tone || src?.options?.tone || 'neutral'
  };

  const flow = {
    net_usd: src?.flow?.net_usd ?? src?.options?.Flow?.net_usd,
    delta_imb: src?.flow?.delta_imb ?? src?.options?.Flow?.delta_imb,
    top: Array.isArray(src?.flow?.top) ? src.flow.top : (Array.isArray(src?.options?.Flow?.top)? src.options.Flow.top:[]),
    tone: src?.flow?.tone || src?.options?.Flow?.tone || 'neutral',
    ai_note: src?.flow?.ai_note || src?.options?.Flow?.ai_note || ''
  };

  const sintesi_ai = src?.sintesi_ai || { points:[], summary:'' };

  const audit_quality = (()=>{
    const aq = src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} };
    const qm = aq.QualityMetrics || {};
    if (qm.Coverage && !qm.FreshnessScore) qm.FreshnessScore = qm.Coverage;
    return { ...aq, QualityMetrics: qm };
  })();

  const mifid = src?.mifid || { disclaimer:'' };

  // titles per menu e per intestazioni sezione
  const sectionTitles = labels.sections;
  const menuTitles = labels.menu;

  // spot per calcolo EM$
  const spot = Number(src?.head?.Spot?.raw);

  return { meta, labels, head, expected_move, term_structure, skew, pcr, gamma, flow, sintesi_ai, audit_quality, mifid, sectionTitles, menuTitles, spot };
}
