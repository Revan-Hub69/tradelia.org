// /report/assets/js/modules/f3.js
//
// F3 · Analisi Tecnica MTF (3–10 giorni) — versione completa
// Allineato a F1B/F2 (drawer, tabs scoped, tooltip "?", reset scroll)
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> attach listeners
//
// Dipendenze globali attese:
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()

// -----------------------------------------------------------------------------
// RENDER CARD (snapshot) -------------------------------------------------------
// -----------------------------------------------------------------------------
export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF3Public(rawData);

  const kpis = [
    { key: "BiasMTF",   label: "Bias MTF",   desc: "Direzione sintetica MTF",  metric: d.head?.BiasMTF },
    { key: "MTF_Score", label: "MTF Score",  desc: "Composito W1–D1–H4–H1",    metric: d.head?.MTF_Score },
    { key: "P_SwingUp", label: "P(SwingUp)", desc: "Prob. swing 3–10g",        metric: d.head?.P_SwingUp },
    d.options?.OPI_tkr
      ? { key: "OPI_tkr", label: "OPI", desc: "Overlay opzioni (tkr)",         metric: d.options?.OPI_tkr }
      : { key: "GSR_tkr", label: "GSR", desc: "Γ/Vega regime (tkr)",           metric: d.options?.GSR_tkr }
  ];

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F3</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Analisi Tecnica MTF · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Struttura tecnica multi-timeframe (volumetrico-first)
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || 'Lettura istituzionale W1→D1→H4→H1, overlay derivati e sintesi probabilistica. Nessun contenuto operativo.')}<br/>
            <span class="text-[11px] text-[color:var(--muted)]">Materiale educativo/informativo. Nessuna raccomandazione personale.</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- KPI semaforiche -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
          ${kpis.map(k => metricBoxTrafficLightF3(k)).join('')}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f3-cta-btn" data-open-f3-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli analisi →
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node) return;
  const data = normalizeDataF3Public(rawData);

  // Delegation robusto per il bottone drawer (funziona anche su mobile)
  if (!node.__f3Delegated) {
    node.__f3Delegated = true;
    node.addEventListener('click', (ev) => {
      const btn = ev.target && ev.target.closest('[data-open-f3-details="true"]');
      if (!btn) return;
      try { openF3DrawerPublic(data); } catch (e) { console.error('F3 drawer open error:', e); }
    }, { passive: true });
  }

  // Tooltip "?": anche sulla card snapshot
  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch (_) {}
  }
}

// -----------------------------------------------------------------------------
// DRAWER (10 sezioni) — desktop/mobile, scoped root, reset scroll --------------
// -----------------------------------------------------------------------------
function openF3DrawerPublic(d) {
  if (!window.__TradeliaUI?.openPanel) return;
  const sections = buildF3SectionsPublic(d);
  const mobile = isMobileViewport();
  const shell = mobile ? renderF3MobileShell(sections) : renderF3DesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: 'F3 · Analisi Tecnica MTF',
    subtitle: '',
    sections: [{ title: '', body: shell, meta: '' }],
    blocking: false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [{ label: 'Chiudi', action: () => window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  // Post-mount: binding e attivazioni iniziali (scoped)
  setTimeout(() => {
    const root = document.getElementById('f3-root');

    // bind tabs principali (sezioni)
    bindF3TabsPublic();

    // bind tabs secondarie (Options)
    bindOptionsTabsF3(root);

    // tooltip "?" solo dentro al drawer F3
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(root?.querySelector('#f3-scroll-mobile')); } catch(e){}
    }

    // attiva la prima tab principale
    const first = root?.querySelector('[data-f3-tab="dataset"]');
    if (first && typeof first.click === 'function') first.click();

    // attiva la prima scheda Options (se presente)
    const firstOpt = root?.querySelector('[data-f3-section="options"] [data-opt-tab]');
    if (firstOpt && typeof firstOpt.click === 'function') firstOpt.click();

    // hint scroll mobile (scoped su root)
    (function initScrollableTabsHint() {
      const scrollBox = root?.querySelector('.f1b-footer-tabs-scroll');
      const fadeRight = root?.querySelector('.f1b-tabs-fade-right');
      if (!scrollBox || !fadeRight) return;

      const needsScroll = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
      if (!needsScroll) {
        fadeRight.style.display = 'none';
        const fadeLeft = root?.querySelector('.f1b-tabs-fade-left');
        if (fadeLeft) fadeLeft.style.display = 'none';
        return;
      }

      const hintEl = fadeRight.querySelector('.f1b-tabs-scroll-hint');
      function updateHint() {
        const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
        if (hintEl) hintEl.style.opacity = atEnd ? '0' : '.9';
        const fadeLeft = root?.querySelector('.f1b-tabs-fade-left');
        if (fadeLeft) fadeLeft.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
      }

      updateHint();
      scrollBox.addEventListener('scroll', updateHint, { passive: true });
    })();
  }, 0);
}

function isMobileViewport() { return window.matchMedia('(max-width: 767px)').matches; }

// -----------------------------------------------------------------------------
// SEZIONI (10) ----------------------------------------------------------------
// -----------------------------------------------------------------------------
function buildF3SectionsPublic(d) {
  // 1) Dataset & Sync (OCR)
  const datasetHTML = `
  <section class="tl-panel-section" data-f3-section="dataset" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Dataset & Sync (OCR)</div></header>
    ${metricBlockF3('OCR_Conf_info','OCR Confidence','', d.dataset?.OCR_Conf)}
    ${metricBlockF3('DataIntegrity_info','Data Integrity','', d.dataset?.DataIntegrity)}
    ${metricBlockF3('FeedSync_info','Feed Sync','', d.dataset?.FeedSync)}
    ${metricBlockF3('SessionScope_info','Session Scope','', d.dataset?.SessionScope)}
    ${listBlockCardF3('Missing critici', d.dataset?.MissingCritical)}
    ${listBlockCardF3('Note OCR', d.dataset?.Notes_OCR)}
  </section>`;

  // 2) W1 — Contesto direzionale
  const w1 = d.W1 || {};
  const w1HTML = `
    <section class="tl-panel-section" data-f3-section="w1" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">W1 · Contesto direzionale</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('RSI_W1_info','RSI(14)','', w1?.RSI14)}
        ${metricBlockF3('ADX_W1_info','ADX(14)','', w1?.ADX14)}
        ${metricBlockF3('MACD_W1_info','MACD(12,26,9)','', w1?.MACD)}
        ${metricBlockF3('EMA_W1_info','EMA 9/20/50/200','', w1?.EMA)}
        ${metricBlockF3('EMAX_W1_info','EMA Cross Ratio','', w1?.EMA_CrossRatio)}
        ${metricBlockF3('BBWidth_W1_info','BBWidth%','', w1?.BBWidthPct)}
        ${metricBlockF3('ATR_W1_info','ATR% (14)','', w1?.ATRpct14)}
        ${metricBlockF3('HV_W1_info','HV(30/90)','', w1?.HV_30_90)}
        ${metricBlockF3('VOL_W1_info','Volumi/Flusso','', w1?.VOL_BLOCK)}
        ${metricBlockF3('PAT_W1_info','Pattern volumetrici (estratto)','', w1?.PATTERNS_SUMMARY)}
      </div>
      ${headlineBlockCardF3('Interpretazione W1', w1?.ai_note)}
    </section>`;

  // 3) D1 — Struttura swing
  const d1 = d.D1 || {};
  const d1HTML = `
    <section class="tl-panel-section" data-f3-section="d1" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">D1 · Struttura swing</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('RSI_D1_info','RSI(14)','', d1?.RSI14)}
        ${metricBlockF3('ADX_D1_info','ADX(14)','', d1?.ADX14)}
        ${metricBlockF3('MACD_D1_info','MACD(12,26,9)','', d1?.MACD)}
        ${metricBlockF3('EMAX_D1_info','EMA Cross Ratio','', d1?.EMA_CrossRatio)}
        ${metricBlockF3('BBW_D1_info','BBWidth%','', d1?.BBWidthPct)}
        ${metricBlockF3('ATR_D1_info','ATR% (14)','', d1?.ATRpct14)}
        ${metricBlockF3('VOLZ_D1_info','Volume z / RVOL','', d1?.VOL_CLUSTER)}
        ${metricBlockF3('OBV_D1_info','OBV/CMF/MFI/PVT','', d1?.FLOW_SET)}
        ${metricBlockF3('DONCH_D1_info','Donchian(20)','', d1?.Donchian20)}
        ${metricBlockF3('PAT_D1_info','Pattern volumetrici (estratto)','', d1?.PATTERNS_SUMMARY)}
      </div>
      ${headlineBlockCardF3('Interpretazione D1', d1?.ai_note)}
    </section>`;

  // 4) H4 — Validazione intermedia
  const h4 = d.H4 || {};
  const h4HTML = `
    <section class="tl-panel-section" data-f3-section="h4" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">H4 · Validazione intermedia</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('RSI_H4_info','RSI(14)','', h4?.RSI14)}
        ${metricBlockF3('ADX_H4_info','ADX(14)','', h4?.ADX14)}
        ${metricBlockF3('CMF_H4_info','CMF(20)','', h4?.CMF20)}
        ${metricBlockF3('OBVS_H4_info','OBV slope','', h4?.OBV_slope)}
        ${metricBlockF3('VOLZ_H4_info','Volume z','', h4?.Volume_z)}
        ${metricBlockF3('CONF_H4_info','Confidence H4','', h4?.Confidence_H4)}
      </div>
    </section>`;

  // 5) H1 — Timing micro
  const h1 = d.H1 || {};
  const h1HTML = `
    <section class="tl-panel-section" data-f3-section="h1" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">H1 · Timing micro</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('RSI_H1_info','RSI(14)','', h1?.RSI14)}
        ${metricBlockF3('VOLZ_H1_info','Volume z','', h1?.Volume_z)}
        ${metricBlockF3('BBW_H1_info','BBWidth%','', h1?.BBWidthPct)}
        ${metricBlockF3('ATR_H1_info','ATR% (1h)','', h1?.ATRpct)}
        ${metricBlockF3('CONF_H1_info','Confidence H1','', h1?.Confidence_H1)}
      </div>
    </section>`;

  // 6) Options Overlay (presentational con SCHEDE interne)
  const opt = d.options || {};
  const optionsHTML = `
    <section class="tl-panel-section" data-f3-section="options" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(d.meta.labels.options_title)}</div></header>
      ${renderOptionsSectionPublic(opt)}
    </section>`;

  // 7) Price History (60 sedute REG)
  const ph = d.price_history || {};
  const priceHTML = `
    <section class="tl-panel-section" data-f3-section="price" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(d.meta.labels.price_history_title)}</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('RANGE_info','Range%','', ph?.RangePct_60D)}
        ${metricBlockF3('GAPS_info','Gap% (stat)','', ph?.GapPct_stats)}
        ${metricBlockF3('STREAKS_info','Streaks (run)','', ph?.Streaks_stats)}
        ${metricBlockF3('RVOL_CLUST_info','Cluster RVOL','', ph?.RVOL_clusters)}
      </div>
    </section>`;

  // 8) Pattern MTF Board — qualitativo
  const pb = d.pattern_mtf || {};
  const patternHTML = `
    <section class="tl-panel-section" data-f3-section="patterns" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(d.meta.labels.pattern_title)}</div></header>
      ${patternBoardF3(pb)}
      ${headlineBlockCardF3('Note pattern', pb?.ai_note_pattern)}
    </section>`;

  // 9) Consolidamento MTF & Probabilità — quantitativo
  const mtf = d.mtf_consolidation || {};
  const mtfHTML = `
    <section class="tl-panel-section" data-f3-section="mtf" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">${escapeHtml(d.meta.labels.mtf_title)}</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('COMP_MTF_info','Compositi MTF (Vol/Opt/Price)','', mtf?.Composites_MTF)}
        ${metricBlockF3('CBI_info','CBI','', mtf?.CBI)}
        ${metricBlockF3('TE_info','TE (Trend Efficiency)','', mtf?.TE)}
        ${metricBlockF3('DPI_info','DPI','', mtf?.DPI)}
        ${metricBlockF3('MVA_info','MVA_hybrid','', mtf?.MVA_hybrid)}
        ${metricBlockF3('PROB_info','Probabilità (Swing/LT/Breakout)','', mtf?.Probabilities)}
        ${metricBlockF3('MTFS_info','MTF Score','', mtf?.MTF_Score)}
        ${metricBlockF3('BIAS_info','Bias MTF','', mtf?.Bias_MTF)}
        ${metricBlockF3('CONF_FINAL_info','Confidence finale','', mtf?.Confidence_final)}
      </div>
      ${headlineBlockCardF3('Sintesi MTF (educational)', mtf?.ai_note_mtf)}
    </section>`;

  // 10) Governance (Audit & MiFID)
  const audit = d.governance || {};
  const q = audit?.QualityMetrics || {};
  const governanceHTML = `
    <section class="tl-panel-section" data-f3-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Governance · Audit & MiFID</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF3('FreshnessScore', q?.FreshnessScore || q?.Coverage)}
        ${qualityChipF3('ConfidenceFinal', q?.ConfidenceFinal)}
        ${qualityChipF3('DataIntegrity', q?.DataIntegrity)}
        ${qualityChipF3('FeedSync', q?.FeedSync)}
      </div>
      ${headlineBlockCardF3('AuditPath', audit?.AuditPathID)}
      ${headlineBlockCardF3('Informativa', d.meta?.mifid_disclaimer)}
    </section>`;

  return { datasetHTML, w1HTML, d1HTML, h4HTML, h1HTML, optionsHTML, priceHTML, patternHTML, mtfHTML, governanceHTML };
}

// -----------------------------------------------------------------------------
// Options Overlay — SCHEDE/TABS interne (scoped) --------------------------------
// -----------------------------------------------------------------------------
function renderOptionsSectionPublic(o = {}) {
  const tabs = [
    ['opt_overview','Overview'],
    ['opt_em','Expected Move'],
    ['opt_pcr','Put/Call Breakdown'],
    ['opt_gex','Gamma & Max Pain'],
    ['opt_skew','Skew / RR 25Δ'],
    ['opt_flow','Options Flow'],
    ['opt_term','Term Structure'],
    ['opt_gsr','Dealer Γ/Vega (GSR)'],
    ['opt_gaps','Data Gaps'],
    ['opt_summary','AI Summary'],
  ];

  // overview KPI
  const kpiGrid = `
    <div class="grid gap-3 grid-cols-2 md:grid-cols-4">
      ${metricBoxTrafficLightF3({ key: 'IV_ATM',  label: 'IV (ATM)',          desc: 'vol implicita prox-ATM', metric: o.IV_ATM })}
      ${metricBoxTrafficLightF3({ key: 'IV_rank', label: 'IV Rank / %tile',   desc: 'posizione IV 1y',        metric: o.IV_rank_pct })}
      ${metricBoxTrafficLightF3({ key: 'PCR',     label: 'Put/Call (Vol/OI)', desc: 'rapporto put/call',      metric: o.PutCall })}
      ${metricBoxTrafficLightF3({ key: 'GSR',     label: 'GSR (Γ/Vega)',      desc: 'regime dealer',          metric: o.GSR_tkr })}
    </div>`;

  // EM table
  const emRows = (o.EM_rows || []).slice(0, 8).map(r => `
    <tr>
      <td>${escapeHtml(String(r?.expiration ?? '—'))}</td>
      <td class="text-right">${escapeHtml(String(r?.dte ?? '—'))}</td>
      <td class="text-right">${escapeHtml(fmtPct(r?.em_percent))}</td>
      <td class="text-right">${escapeHtml(fmtNum(r?.upper))}</td>
      <td class="text-right">${escapeHtml(fmtNum(r?.lower))}</td>
      <td class="text-right">${escapeHtml(fmtPct(r?.iv_percent))}</td>
    </tr>`).join('');

  // PCR breakdown
  const pcr = o.PCR_breakdown || {};
  const pcrRight = (pcr.by_expiry || []).slice(0, 4).map(x => `
    <div class="text-[12px] font-mono">${escapeHtml(String(x?.exp ?? '—'))} · EM ${fmtPct(x?.em)} · PCRv ${fmtNum(x?.pcr_v)} · PCRoi ${fmtNum(x?.pcr_oi)}</div>`).join('');

  // comodini
  const gex  = o.GEX || {};
  const skew = o.Skew_detail || {};
  const flow = o.Flow || {};

  // viste per singola scheda
  const views = {
    opt_overview: f3Card({ tone:'neutral', title:'Volatilità & Struttura base', bodyHtml:kpiGrid }),
    opt_em: f3Card({ tone:'neutral', title:'Expected Move (scadenze chiave)', bodyHtml:`
      <div class="overflow-auto" data-scrollable>
        <table class="min-w-full text-[12px]">
          <thead><tr>
            <th class="text-left">Exp</th><th class="text-right">DTE</th>
            <th class="text-right">EM%</th><th class="text-right">Upper</th>
            <th class="text-right">Lower</th><th class="text-right">IV%</th>
          </tr></thead>
          <tbody>${emRows}</tbody>
        </table>
      </div>` }),
    opt_pcr: f3Card({ tone:'neutral', title:'Put/Call Breakdown', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-[10px] text-[color:var(--muted)] mb-1">Totali</div>
          <div class="text-[12px] font-mono">Vol: ${fmtNum(pcr?.total_vol)} · OI: ${fmtNum(pcr?.total_oi)}</div>
          <div class="text-[12px]">PCR Vol <b>${fmtNum(pcr?.pcr_vol)}</b> · PCR OI <b>${fmtNum(pcr?.pcr_oi)}</b></div>
        </div>
        <div>
          <div class="text-[10px] text-[color:var(--muted)] mb-1">Per scadenza (top)</div>
          ${pcrRight || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}
        </div>
      </div>` }),
    opt_gex: f3Card({ tone:'neutral', title:'Gamma Exposure & Max Pain', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-[12px]">Gamma Flip <b>${fmtNum(gex?.gamma_flip)}</b></div>
          <div class="text-[12px]">Regime <b>${escapeHtml(o?.DealerGamma?.raw || '—')}</b></div>
          ${o?.DealerGamma?.ai_note ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(o.DealerGamma.ai_note)}</div>` : ''}
        </div>
        <div>
          <div class="text-[12px]">Max Pain <b>${fmtNum(o?.MaxPain?.strike)}</b> (exp ${escapeHtml(o?.MaxPain?.exp || '—')})</div>
          ${o?.MaxPain?.ai_note ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(o.MaxPain.ai_note)}</div>` : ''}
        </div>
      </div>` }),
    opt_skew: f3Card({ tone: skew?.tone || o?.Skew_set?.tone || 'neutral', title:'Skew 25Δ / Risk Reversal', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-[12px]">25Δ Put − Call: <b>${fmtPct(skew?.rr_25d)}</b></div></div>
        <div>
          <div class="text-[12px]">Forma: <b>${escapeHtml(skew?.shape || '—')}</b></div>
          ${o?.ai_note_skew ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(o.ai_note_skew)}</div>` : ''}
        </div>
      </div>` }),
    opt_flow: f3Card({ tone: flow?.tone || 'neutral', title:'Options Flow (istituzionali)', bodyHtml: (()=>{
      const flowTop = (flow?.top || []).slice(0,3).map(t =>
        `<div class="text-[12px] font-mono">${escapeHtml(String(t?.type || ''))} ${fmtNum(t?.strike)} · ${escapeHtml(String(t?.exp || ''))} · Δ ${escapeHtml(String(t?.delta || ''))} · prem. ${fmtUsd(t?.premium)}</div>`
      ).join('');
      return `
        <div class="grid grid-cols-2 gap-3">
          <div>Net Sentiment: <b>${fmtUsd(flow?.net_usd)}</b><br/>Delta Imbalance: <b>${fmtNum(flow?.delta_imb)}</b></div>
          <div>${flowTop || '<div class="text-[12px] text-[color:var(--muted)]">—</div>'}</div>
        </div>`;
    })()}),
    opt_term: f3Card({ tone:o?.TermSlope?.tone || 'neutral', title:'Term Structure & IV Slope', bodyHtml:`
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-[12px]">Slope: <b>${escapeHtml(o?.TermSlope?.raw || '—')}</b></div></div>
        <div>${o?.TermNotes ? `<div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(o.TermNotes)}</div>` : ''}</div>
      </div>` }),
    opt_gsr: f3Card({ tone:o?.GSR_tkr?.tone || 'neutral', title:'Dealer Γ/Vega Board', bodyHtml:`
      <div class="grid grid-cols-3 gap-3">
        <div><div class="text-[10px] text-[color:var(--muted)]">Γ ATM</div><div class="font-mono text-[12px]">${escapeHtml(String(o?.Gamma_ATM?.raw ?? '—'))}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">Vega ATM</div><div class="font-mono text-[12px]">${escapeHtml(String(o?.Vega_ATM?.raw ?? '—'))}</div></div>
        <div><div class="text-[10px] text-[color:var(--muted)]">GSR</div><div class="font-mono text-[12px]">${escapeHtml(String(o?.GSR_tkr?.raw ?? '—'))}</div></div>
      </div>
      ${o?.ai_note_gsr ? `<div class="text-[11px] text-[color:var(--muted)] mt-1">${escapeHtml(o.ai_note_gsr)}</div>` : ''}` }),
    opt_gaps: (o?.DataGaps||[]).length ? listBlockCardF3('Data gaps (Options)', o.DataGaps) : f3Card({tone:'neutral', title:'Data gaps (Options)', bodyHtml:'<div class="text-[12px] text-[color:var(--muted)]">—</div>'}),
    opt_summary: headlineBlockCardF3('AI Summary (Options)', o?.ai_note || '')
  };

  const pills = tabs.map(([k,l]) => `<button class="f1b-footer-tab-btn" data-opt-tab="${escapeAttr(k)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(l)}</button>`).join('');

  // shell con nav + views (scoped su data-f3-section="options")
  return `
    <div class="flex flex-col gap-3" data-f3-options-shell>
      <div class="f1b-footer-tabs-scroll" style="display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:.25rem;">
        ${pills}
      </div>
      <div class="min-h-[120px]" data-opt-views>
        ${tabs.map(([k]) => `<div data-opt-view="${escapeAttr(k)}" hidden>${views[k] || ''}</div>`).join('')}
      </div>
    </div>`;
}

// binder delle schede Options (scoped nel drawer)
function bindOptionsTabsF3(root){
  const shell = root?.querySelector('[data-f3-section="options"] [data-f3-options-shell]');
  if(!shell) return;
  const btns  = shell.querySelectorAll('[data-opt-tab]');
  const views = shell.querySelectorAll('[data-opt-view]');

  function style(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-opt-tab')===active;
      if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
      else  { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
    });
  }
  function show(active){
    views.forEach(v=>{
      const k=v.getAttribute('data-opt-view');
      v.hidden = (k!==active);
      if(!v.hidden){
        // reset eventuali scroller interni
        v.querySelectorAll('[data-scrollable]').forEach(sc=>{ sc.scrollTop=0; sc.scrollLeft=0; });
      }
    });
  }
  function activate(k){ style(k); show(k); }

  btns.forEach(b=>{
    if(b.__optBound) return;
    b.__optBound = true;
    b.addEventListener('click', ()=> activate(b.getAttribute('data-opt-tab')));
  });
}

// -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TABS PRINCIPALI ------------------------------------
// -----------------------------------------------------------------------------
function renderF3DesktopShell(sections) {
  return `
    <div id="f3-root" class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
${drawerBtnF3('dataset','Dataset & Sync')}
${drawerBtnF3('w1','W1 · Direzionale')}
${drawerBtnF3('d1','D1 · Swing')}
${drawerBtnF3('h4','H4 · Validazione')}
${drawerBtnF3('h1','H1 · Timing')}
${drawerBtnF3('options','Options Overlay')}
${drawerBtnF3('price','Price History')}
${drawerBtnF3('patterns','Pattern MTF')}
${drawerBtnF3('mtf','Consolidamento & Prob')}
${drawerBtnF3('governance','Governance')}
      </aside>
      <main id="f3-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f3-view="dataset">${sections.datasetHTML}</div>
        <div data-f3-view="w1" hidden>${sections.w1HTML}</div>
        <div data-f3-view="d1" hidden>${sections.d1HTML}</div>
        <div data-f3-view="h4" hidden>${sections.h4HTML}</div>
        <div data-f3-view="h1" hidden>${sections.h1HTML}</div>
        <div data-f3-view="options" hidden>${sections.optionsHTML}</div>
        <div data-f3-view="price" hidden>${sections.priceHTML}</div>
        <div data-f3-view="patterns" hidden>${sections.patternHTML}</div>
        <div data-f3-view="mtf" hidden>${sections.mtfHTML}</div>
        <div data-f3-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function renderF3MobileShell(sections) {
  const pills = [
    ['dataset','Dataset & Sync'],
    ['w1','W1 Direz.'],
    ['d1','D1 Swing'],
    ['h4','H4 Valid.'],
    ['h1','H1 Timing'],
    ['options','Opzioni'],
    ['price','Prezzo'],
    ['patterns','Pattern'],
    ['mtf','Sintesi MTF'],
    ['governance','Governance']
  ].map(([k, l]) => mobileTabBtnF3(k, l)).join('');

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
    <div id="f3-root" class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      ${mobileTabsBar}
      <main id="f3-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f3-view="dataset">${sections.datasetHTML}</div>
        <div data-f3-view="w1" hidden>${sections.w1HTML}</div>
        <div data-f3-view="d1" hidden>${sections.d1HTML}</div>
        <div data-f3-view="h4" hidden>${sections.h4HTML}</div>
        <div data-f3-view="h1" hidden>${sections.h1HTML}</div>
        <div data-f3-view="options" hidden>${sections.optionsHTML}</div>
        <div data-f3-view="price" hidden>${sections.priceHTML}</div>
        <div data-f3-view="patterns" hidden>${sections.patternHTML}</div>
        <div data-f3-view="mtf" hidden>${sections.mtfHTML}</div>
        <div data-f3-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function drawerBtnF3(key, label) {
  return `<button class="f1b-tab-btn" data-f3-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabBtnF3(key, label) {
  return `<button class="f1b-footer-tab-btn" data-f3-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}

function bindF3TabsPublic() {
  const btns  = document.querySelectorAll('[data-f3-tab]');
  const views = document.querySelectorAll('[data-f3-view]');
  const desk  = document.getElementById('f3-scroll-desktop');
  const mob   = document.getElementById('f3-scroll-mobile');

  function resetScroll() { [desk, mob].forEach(el => { if (!el) return; el.scrollTop = 0; el.scrollLeft = 0; }); }
  function styleTabs(active) {
    btns.forEach(b => {
      const on = b.getAttribute('data-f3-tab') === active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f1b-footer-tab-btn')) {
        if (on) { b.style.fontWeight = '600'; b.style.border = '1px solid var(--ink)'; b.style.background = 'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color = 'var(--ink)'; b.style.boxShadow = '0 4px 10px rgba(0,0,0,.18)'; }
        else    { b.style.fontWeight = '500'; b.style.border = '1px solid var(--br-soft)'; b.style.background = 'var(--surface-card)'; b.style.color = 'var(--muted)'; b.style.boxShadow = 'var(--shadow-card)'; }
      }
    });
  }
  function show(active) {
    views.forEach(v => {
      const k = v.getAttribute('data-f3-view');
      v.hidden = (k !== active);
      if (!v.hidden) {
        requestAnimationFrame(() => {
          resetScroll();
          v.querySelectorAll('[data-scrollable]').forEach(sc => { sc.scrollTop = 0; sc.scrollLeft = 0; });
        });
      }
    });
  }
  function activate(k) { styleTabs(k); show(k); }

  btns.forEach(b => {
    if (b.__f3Bound) return;
    b.__f3Bound = true;
    b.addEventListener('click', () => activate(b.getAttribute('data-f3-tab')));
  });
}

// -----------------------------------------------------------------------------
// CARD BUILDERS ---------------------------------------------------------------
// -----------------------------------------------------------------------------
function f3Card({ tone, title, bodyHtml, noteHtml }) {
  const { dotColor } = toneColorsF3(tone);
  return `
    <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title || '')}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml || ''}</div>
      ${noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : ''}
    </div>`;
}

function metricBoxTrafficLightF3({ key, label, desc, metric }) {
  const { dotColor, textColor } = toneColorsF3(metric?.tone);
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
      ${desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : ''}
    </div>`;
}

// render smart valori
function renderCompositeKV(obj) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return '<span class="text-[12px] text-[color:var(--muted)]">—</span>';
  return `
    <div class="grid grid-cols-3 gap-2 text-[12px]">
      ${entries.map(([k, v]) => `
        <div>
          <div class="text-[10px] text-[color:var(--muted)]">${escapeHtml(String(k))}</div>
          <div class="font-mono">${escapeHtml(String(v ?? '—'))}</div>
        </div>
      `).join('')}
    </div>`;
}
function renderValueSmart(metricKey, metricObj) {
  const v = metricObj?.raw ?? metricObj;
  if ((metricKey === 'COMP_MTF_info' || metricKey === 'PROB_info') && v && typeof v === 'object') return renderCompositeKV(v);
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') {
    const s = JSON.stringify(v);
    return `<code class="font-mono text-[12px]">${escapeHtml(s.length > 100 ? s.slice(0, 100) + '…' : s)}</code>`;
  }
  return escapeHtml(String(v));
}
function metricBlockF3(metricKey, title, desc, metricObj) {
  const { textColor } = toneColorsF3(metricObj?.tone);
  const valueHtml = renderValueSmart(metricKey, metricObj);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${valueHtml}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    ${desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>` : ''}
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f3Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}
function patternBoardF3(pb = {}) {
  const tfOrder = ['W1', 'D1', 'H4', 'H1'];
  const blocks = tfOrder.map(tf => {
    const node = pb?.[tf] || {};
    const list = Array.isArray(node.patterns) ? node.patterns : [];
    const rows = list.map(p => {
      const conf = escapeHtml(String(p?.Conf_pattern?.raw ?? p?.Conf_pattern ?? '—'));
      const comp = p?.Composites || node?.composites || {};
      const vol = escapeHtml(String(comp?.VolumeComposite?.raw ?? comp?.VolumeComposite ?? '—'));
      const opt = escapeHtml(String(comp?.OptionsComposite?.raw ?? comp?.OptionsComposite ?? '—'));
      const pri = escapeHtml(String(comp?.PriceComposite?.raw ?? comp?.PriceComposite ?? '—'));
      const type = escapeHtml(String(p?.Type ?? ''));
      const ev = Array.isArray(p?.Evidences) ? p.Evidences.map(x => `• ${escapeHtml(String(x))}`).join('<br/>') : '';
      const dom = p?.Dominant ? '<span class="text-[10px] uppercase font-semibold ml-1" style="color:var(--tone-pos-fg);">dom</span>' : '';
      return `
        <div class="p-2 rounded-md border" style="border-color:var(--br-card);background:var(--surface-card-alt);">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="text-[12px] font-semibold">${type}${dom}</div>
            <div class="text-[10px] font-mono text-[color:var(--muted)]">Conf ${conf}</div>
          </div>
          <div class="text-[11px] text-[color:var(--muted)] mb-1">${ev}</div>
          <div class="grid grid-cols-3 gap-2 text-[11px]">
            <div><div class="text-[10px] text-[color:var(--muted)]">Vol</div><div class="font-mono">${vol}</div></div>
            <div><div class="text-[10px] text-[color:var(--muted)]">Opt</div><div class="font-mono">${opt}</div></div>
            <div><div class="text-[10px] text-[color:var(--muted)]">Price</div><div class="font-mono">${pri}</div></div>
          </div>
        </div>`;
    }).join('');

    const title = tf === 'W1' ? 'W1 · Direzionale' : (tf === 'D1' ? 'D1 · Swing' : (tf === 'H4' ? 'H4 · Validazione' : 'H1 · Timing'));
    return f3Card({ tone: 'neutral', title, bodyHtml: `<div class='grid md:grid-cols-2 gap-2'>${rows || ''}</div>` });
  }).join('');

  const heat = Array.isArray(pb.heatmap) ? pb.heatmap : [];
  const heatCells = heat.map(h => {
    const tf = escapeHtml(String(h?.tf || ''));
    const conf = Number(h?.conf || 0);
    const tone = conf >= 0.66 ? 'green' : conf >= 0.33 ? 'yellow' : 'red';
    const { bgSoft, brColor } = toneColorsCardF3(tone);
    return `<div class="rounded-md text-center p-2 border" title="${tf}: ${conf}" style="background:${bgSoft};border-color:${brColor};"><div class="text-[11px] font-semibold">${tf}</div><div class="font-mono text-[12px]">${conf}</div></div>`;
  }).join('');

  const heatBlock = heat.length ? f3Card({ tone: 'neutral', title: 'Heatmap Conf_pattern (TF)', bodyHtml: `<div class='grid grid-cols-4 gap-2'>${heatCells}</div>` }) : '';

  return `${blocks}${heatBlock}`;
}
function listBlockCardF3(title, body) {
  if (!body && body !== 0) return '';
  let tone = 'neutral', raw = '';
  if (Array.isArray(body)) {
    raw = body.map(x => `• ${String(x)}`).join('\n');
  } else if (typeof body === 'object') {
    tone = body?.tone || 'neutral';
    raw = body?.raw || '';
  } else {
    raw = String(body);
  }
  return f3Card({ tone, title, bodyHtml: `<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml: '' });
}
function headlineBlockCardF3(title, obj) {
  if (obj === undefined || obj === null) return '';
  let tone = 'neutral', raw = '';
  if (typeof obj === 'string') { raw = obj; }
  else { tone = obj?.tone || 'neutral'; raw = obj?.raw || ''; }
  return f3Card({ tone, title, bodyHtml: `<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml: '' });
}
function qualityChipF3(key, q) {
  if (!q) return '';
  const { textColor } = toneColorsF3(q.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note || '')}</div>`;
  return f3Card({ tone: q.tone, title: key || '', bodyHtml, noteHtml: '' });
}

// -----------------------------------------------------------------------------
// TONE HELPERS / MISC ---------------------------------------------------------
// -----------------------------------------------------------------------------
function toneColorsF3(tone) {
  switch ((tone || '').toLowerCase()) {
    case 'green':  return { dotColor: 'var(--tone-pos-fg)',  textColor: 'var(--tone-pos-fg)'  };
    case 'yellow': return { dotColor: 'var(--tone-warn-fg)', textColor: 'var(--tone-warn-fg)' };
    case 'red':    return { dotColor: 'var(--tone-neg-fg)',  textColor: 'var(--tone-neg-fg)'  };
    default:       return { dotColor: 'var(--tone-neu-fg)',  textColor: 'var(--tone-neu-fg)'  };
  }
}
function toneColorsCardF3(tone) {
  const t = (tone || '').toLowerCase();
  if (t === 'green'  || t === 'positive') return { dotColor: 'var(--tone-pos-fg)', textColor: 'var(--ink)', bgSoft: 'color-mix(in oklab, var(--tone-pos-fg) 8%, var(--surface-card))',  brColor: 'color-mix(in oklab, var(--tone-pos-fg) 40%, var(--br-card))' };
  if (t === 'red'    || t === 'negative') return { dotColor: 'var(--tone-neg-fg)', textColor: 'var(--ink)', bgSoft: 'color-mix(in oklab, var(--tone-neg-fg) 8%, var(--surface-card))',  brColor: 'color-mix(in oklab, var(--tone-neg-fg) 40%, var(--br-card))' };
  if (t === 'yellow' || t === 'neutral')  return { dotColor: 'var(--tone-warn-fg)',textColor: 'var(--ink)', bgSoft: 'color-mix(in oklab, var(--tone-warn-fg) 8%, var(--surface-card))', brColor: 'color-mix(in oklab, var(--tone-warn-fg) 40%, var(--br-card))' };
  return { dotColor: 'var(--tone-neu-fg)', textColor: 'var(--ink)', bgSoft: 'var(--surface-card-alt)', brColor: 'var(--br-card)' };
}
function truncateF3(s, n) { const str = String(s || ''); return str.length > n ? str.slice(0, n - 1) + '…' : str; }
function formatMetricValue(obj) {
  const v = obj?.raw ?? obj;
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)) { const s = JSON.stringify(v); return escapeHtml(s.length > 80 ? s.slice(0, 80) + '…' : s); }
  if (typeof v === 'object') { const keys = Object.keys(v); if (keys.length === 0) return '{}';
    const compact = keys.slice(0, 5).reduce((acc, k) => { acc[k] = v[k]; return acc; }, {}); const s = JSON.stringify(compact); return escapeHtml(s.length > 100 ? s.slice(0, 100) + '…' : s); }
  return escapeHtml(String(v));
}
function escapeHtml(str) { if (str === undefined || str === null) return ''; return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function escapeAttr(str) { if (str === undefined || str === null) return ''; return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function fmtPct(x) { return Number.isFinite(Number(x)) ? (Number(x).toFixed(2) + '%') : '—'; }
function fmtNum(x) { return Number.isFinite(Number(x)) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(x)) : '—'; }
function fmtUsd(x) { return Number.isFinite(Number(x)) ? ('$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(x))) : '—'; }

// -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (schema pubblico F3) -----------------------------------
// -----------------------------------------------------------------------------
function normalizeDataF3Public(src = {}) {
  const meta = {
    timestampET: src?.meta?.timestampET ?? '—',
    module: src?.meta?.module ?? 'F3 · Analisi Tecnica MTF',
    moduleVersion: src?.meta?.moduleVersion ?? 'v7.4',
    moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
    freshness: src?.meta?.freshness ?? '≤ T-1',
    hero_intro: src?.meta?.hero_intro ?? '',
    hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Contenuto informativo/formativo. Nessuna istruzione operativa.',
    mifid_disclaimer: src?.meta?.mifid_disclaimer ?? '',
    labels: src?.meta?.labels || {
      price_history_title: 'Price History · 60 sedute (REG)',
      options_title: 'Options Overlay (F2-Options)',
      pattern_title: 'Pattern MTF Board (volumetrico-first)',
      mtf_title: 'Consolidamento MTF & Probabilità'
    }
  };

  const head = {
    BiasMTF:   src?.head?.BiasMTF   || { raw: '—', tone: 'neutral' },
    MTF_Score: src?.head?.MTF_Score || { raw: '—', tone: 'neutral' },
    P_SwingUp: src?.head?.P_SwingUp || { raw: '—', tone: 'neutral' }
  };

  const dataset = (function () {
    const s = src?.dataset || {};
    return {
      OCR_Conf: s.OCR_Conf || { raw: '—', tone: 'neutral' },
      DataIntegrity: s.DataIntegrity || { raw: '—', tone: 'neutral' },
      FeedSync: s.FeedSync || { raw: '—', tone: 'neutral' },
      SessionScope: s.SessionScope || { raw: 'REG only', tone: 'neutral' },
      MissingCritical: Array.isArray(s.MissingCritical) ? s.MissingCritical : [],
      Notes_OCR: s.Notes_OCR || ''
    };
  })();

  function tfBlock(k) {
    const t = src?.[k] || {};
    return {
      RSI14: t.RSI14 || { raw: '—', tone: 'neutral' },
      ADX14: t.ADX14 || { raw: '—', tone: 'neutral' },
      MACD: t.MACD || { raw: '—', tone: 'neutral' },
      EMA: t.EMA || { raw: '—', tone: 'neutral' },
      EMA_CrossRatio: t.EMA_CrossRatio || { raw: '—', tone: 'neutral' },
      BBWidthPct: t.BBWidthPct || { raw: '—', tone: 'neutral' },
      ATRpct14: t.ATRpct14 || { raw: '—', tone: 'neutral' },
      HV_30_90: t.HV_30_90 || { raw: '—', tone: 'neutral' },
      VOL_BLOCK: t.VOL_BLOCK || { raw: { RVOL50: '—', OBV: '—', CMF: '—', MFI: '—', PVT: '—' }, tone: 'neutral' },
      PATTERNS_SUMMARY: t.PATTERNS_SUMMARY || { raw: '', tone: 'neutral' },
      Donchian20: t.Donchian20 || { raw: '—', tone: 'neutral' },
      FLOW_SET: t.FLOW_SET || { raw: '—', tone: 'neutral' },
      Volume_z: t.Volume_z || { raw: '—', tone: 'neutral' },
      OBV_slope: t.OBV_slope || { raw: '—', tone: 'neutral' },
      CMF20: t.CMF20 || { raw: '—', tone: 'neutral' },
      Confidence_H4: t.Confidence_H4 || { raw: '—', tone: 'neutral' },
      Confidence_H1: t.Confidence_H1 || { raw: '—', tone: 'neutral' },
      ai_note: t.ai_note || ''
    };
  }
  const W1 = tfBlock('W1');
  const D1 = tfBlock('D1');
  const H4 = tfBlock('H4');
  const H1 = tfBlock('H1');

  const options = (function () {
    const o = src?.options || {};
    return {
      IV_ATM: o.IV_ATM || { raw: '—', tone: 'neutral' },
      IV_rank_pct: o.IV_rank_pct || { raw: '—', tone: 'neutral' },
      Skew_set: o.Skew_set || { raw: '—', tone: 'neutral' },
      OI_delta: o.OI_delta || { raw: '—', tone: 'neutral' },
      PutCall: o.PutCall || { raw: '—', tone: 'neutral' },
      Gamma_ATM: o.Gamma_ATM || { raw: '—', tone: 'neutral' },
      Vega_ATM: o.Vega_ATM || { raw: '—', tone: 'neutral' },
      GSR_tkr: o.GSR_tkr || { raw: '—', tone: 'neutral' },
      OPI_tkr: o.OPI_tkr || null,
      DealerGamma: o.DealerGamma || { raw: '—', tone: 'neutral' },
      OptionsPattern: o.OptionsPattern || { raw: '—', tone: 'neutral' },
      MaxPain: o.MaxPain || null,
      TermSlope: o.TermSlope || null,
      TermNotes: o.TermNotes || '',
      PCR_breakdown: o.PCR_breakdown || null,
      EM_rows: o.EM_rows || [],
      Flow: o.Flow || null,
      Skew_detail: o.Skew_detail || null,
      GEX: o.GEX || null,
      ai_note: o.ai_note || '',
      ai_note_skew: o.ai_note_skew || '',
      ai_note_gsr: o.ai_note_gsr || '',
      DataGaps: Array.isArray(o.DataGaps) ? o.DataGaps : []
    };
  })();

  const price_history = (function () {
    const p = src?.price_history || {};
    return {
      RangePct_60D: p.RangePct_60D || { raw: '—', tone: 'neutral' },
      GapPct_stats: p.GapPct_stats || { raw: '—', tone: 'neutral' },
      Streaks_stats: p.Streaks_stats || { raw: '—', tone: 'neutral' },
      RVOL_clusters: p.RVOL_clusters || { raw: '—', tone: 'neutral' }
    };
  })();

  const pattern_mtf = (function () {
    const pb = src?.pattern_mtf || {};
    const defTF = () => ({ patterns: [], composites: {} });
    return {
      W1: pb.W1 || defTF(),
      D1: pb.D1 || defTF(),
      H4: pb.H4 || defTF(),
      H1: pb.H1 || defTF(),
      heatmap: Array.isArray(pb.heatmap) ? pb.heatmap : [],
      ai_note_pattern: pb.ai_note_pattern || ''
    };
  })();

  const mtf_consolidation = (function () {
    const m = src?.mtf_consolidation || {};
    return {
      Composites_MTF: m.Composites_MTF || { raw: { Volume: '—', Options: '—', Price: '—' }, tone: 'neutral' },
      CBI: m.CBI || { raw: '—', tone: 'neutral' },
      TE: m.TE || { raw: '—', tone: 'neutral' },
      DPI: m.DPI || { raw: '—', tone: 'neutral' },
      MVA_hybrid: m.MVA_hybrid || { raw: '—', tone: 'neutral' },
      Probabilities: m.Probabilities || { raw: { SwingUp: '—', LTUp: '—', Breakout: '—' }, tone: 'neutral' },
      MTF_Score: m.MTF_Score || { raw: '—', tone: 'neutral' },
      Bias_MTF: m.Bias_MTF || { raw: '—', tone: 'neutral' },
      Confidence_final: m.Confidence_final || { raw: '—', tone: 'neutral' },
      ai_note_mtf: m.ai_note_mtf || ''
    };
  })();

  const governance = (function () {
    const g = src?.governance || {};
    const qm = g?.QualityMetrics || {};
    return {
      AuditPathID: g.AuditPathID || '—',
      QualityMetrics: {
        FreshnessScore: qm.FreshnessScore || qm.Coverage || { raw: '—', tone: 'neutral' },
        ConfidenceFinal: qm.ConfidenceFinal || { raw: '—', tone: 'neutral' },
        DataIntegrity: qm.DataIntegrity || { raw: '—', tone: 'neutral' },
        FeedSync: qm.FeedSync || { raw: '—', tone: 'neutral' }
      }
    };
  })();

  return { meta, head, dataset, W1, D1, H4, H1, options, price_history, pattern_mtf, mtf_consolidation, governance };
}
