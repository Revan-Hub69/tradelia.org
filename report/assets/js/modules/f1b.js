// /report/assets/js/modules/f1b.js (compact v2025-11-02)
//
// F1B · Regime di mercato / Contesto rischio — design refresh
// - Head più pulita (niente testi pesanti). Solo titolo + micro-tagline.
// - KPI più leggibili (value on top, desc after), altezza uniforme.
// - Pill tono con micro-animazione; info-btn compatti e coerenti.
// - Mobile: elimina effetto "doppio contenitore" (padding/ombre ridotti, negative margin).
// - A11y: focus visibile, tab btn aria-controls, reset scroll robusto.
// - Trend glyph opzionale (metric.trend ∈ {"up","down","flat"}).
//
// Exports
//   renderCard(rawData, ctx?)
//   bindCard(node, rawData, ctx?)
//
// Globals
//   window.__TradeliaUI.openPanel/closePanel/bindMetricInfoButtons

export function renderCard(rawData, ctx = {}) {
  ensureF1BStyles();
  const d = normalizeDataPublicF1B(rawData);

  const kpis = [
    {
      key: "StrategyMode_macro",
      label: "StrategyMode",
      desc: "Modalità regime (Momentum / Pullback / Neutral)",
      metric: d.regime_and_risk.StrategyMode_macro
    },
    {
      key: "RegimeScore",
      label: "RegimeScore",
      desc: "Appetito rischio sintetico",
      metric: d.regime_and_risk.RegimeScore
    },
    {
      key: "VolRegime",
      label: "Volatilità",
      desc: "VIX / oro / ricerca hedge",
      metric: d.regime_and_risk.VolRegime
    }
  ];

  const { toneLabel, toneColor } = computeHighLevelTone(
    d.regime_and_risk.StrategyMode_macro,
    d.regime_and_risk.RegimeScore
  );

  return `
    <section class="f1b-wrap">
      <div class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
        style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

        <!-- HEAD -->
        <header class="section-headline mb-3">
          <div class="section-head-left">
            <div class="section-head-topline flex items-center flex-wrap gap-2">
              <span class="section-badge">F1B</span>
              <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Regime di mercato · Orizzonte 3–10 giorni</span>
              <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
                data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
                style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}</span>
              <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
            </div>

            <h3 class="section-title-main text-[13px] font-bold leading-[1.4] tracking-[.2px] text-[color:var(--ink)] mt-1">
              Contesto rischio &amp; ampiezza del mercato
            </h3>

            <!-- micro-tagline unica, niente blocchi lunghi -->
            <p class="text-[11px] text-[color:var(--muted)] leading-[1.45] mt-1 line-1">Lettura di contesto. Non è un'istruzione operativa.</p>
          </div>
        </header>

        <!-- CARD PRINCIPALE -->
        <div class="relative flex flex-col gap-3 card-compact f1b-card">
          <!-- StrategyMode + tono -->
          <div>
            <div class="metric-head text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
              <span>StrategyMode</span>
              <button class="info-btn align-middle" data-metric="StrategyMode_macro" aria-label="Info StrategyMode">?</button>
            </div>

            <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
              <span>${escapeHtml(d.regime_and_risk.StrategyMode_macro?.raw || '—')}</span>
              <span class="pill-tone" style="color:${toneColor};border-color:${toneColor};">${escapeHtml(toneLabel)}</span>
            </div>

            <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1 line-1">${escapeHtml(d.regime_and_risk.StrategyMode_macro?.ai_note || '')}</div>
          </div>

          <!-- KPI semaforiche -->
          <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
            ${kpis.map(k => metricBoxTrafficLight(k)).join('')}
          </div>

          <!-- DISCLAIMER + CTA -->
          <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
            <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">Materiale educativo e informativo. Nessuna raccomandazione personale.</p>
            <div class="flex lg:justify-end">
              <button class="f1b-cta-btn" data-open-f1b-details="true" type="button">Dettagli regime →</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1B(rawData);

  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) btnDetails.addEventListener('click', () => openF1DrawerPublic(data));

  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){}
  }
}

/* -----------------------------------------------------------------------------
   PANEL / DRAWER
----------------------------------------------------------------------------- */
function openF1DrawerPublic(data){
  if (!window.__TradeliaUI?.openPanel) { console.warn('openPanel non disponibile'); return; }
  const sectionsObj = buildDrawerSectionsPublic(data);
  const mobileMode = isMobileViewport();
  const drawerHTML = mobileMode ? renderDrawerMobileShellPublic(sectionsObj) : renderDrawerDesktopShellPublic(sectionsObj);

  window.__TradeliaUI.openPanel({
    title: 'F1B · Regime di mercato',
    subtitle: '',
    sections: [{ title:'', body: drawerHTML, meta:'' }],
    blocking: false,
    panelSize: mobileMode ? 'wide' : 'xl',
    footerButtons: mobileMode ? [] : [{ label:'Chiudi', action: () => window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  setTimeout(()=>{
    bindDrawerTabsPublic();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try{
        const dRoot = document.getElementById('f1b-scroll-desktop');
        const mRoot = document.getElementById('f1b-scroll-mobile');
        if(dRoot) window.__TradeliaUI.bindMetricInfoButtons(dRoot);
        if(mRoot) window.__TradeliaUI.bindMetricInfoButtons(mRoot);
      }catch(e){}
    }
    const first = document.querySelector('[data-f1b-tab="regime"]');
    if (first?.click) first.click();
    initScrollableTabsHint();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

function initScrollableTabsHint(){
  const scrollBox = document.querySelector('.f1b-footer-tabs-scroll');
  const fadeRight = document.querySelector('.f1b-tabs-fade-right');
  if (!scrollBox || !fadeRight) return;
  const needs = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
  if (!needs){ fadeRight.style.display='none'; const fl = document.querySelector('.f1b-tabs-fade-left'); if(fl) fl.style.display='none'; return; }
  const hint = fadeRight.querySelector('.f1b-tabs-scroll-hint');
  const update = ()=>{
    const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
    if (hint) hint.style.opacity = atEnd ? '0' : '.9';
    const fl = document.querySelector('.f1b-tabs-fade-left');
    if (fl) fl.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
  };
  update();
  scrollBox.addEventListener('scroll', update, {passive:true});
}

/* -----------------------------------------------------------------------------
   DRAWER CONTENT
----------------------------------------------------------------------------- */
function buildDrawerSectionsPublic(d){
  const regimeHTML = `
    <section class="tl-panel-section" data-f1b-section="regime" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Regime &amp; Rischio</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlock('StrategyMode_macro','StrategyMode','Modalità corrente del mercato',d.regime_and_risk.StrategyMode_macro)}
        ${metricBlock('RegimeScore','RegimeScore','Appetito rischio sintetico',d.regime_and_risk.RegimeScore)}
        ${metricBlock('VolRegime','Volatilità / Hedge','VIX, oro, ricerca hedge',d.regime_and_risk.VolRegime)}
        ${metricBlock('LiquidityRegimeScore','Curva & Costo capitale','Curve Treasury / funding stress',d.regime_and_risk.LiquidityRegimeScore)}
        ${metricBlock('CreditRiskBlock','Credito','Flight-to-safety / high beta credit',d.regime_and_risk.CreditRiskBlock)}
        ${metricBlock('FX_Regime','FX / USD','Dollar tone',d.regime_and_risk.FX_Regime)}
      </div>
      ${metricBlock('RiskWindow','RiskWindow (3–10g)','Driver macro monitorati a breve (orizzonte 3–10 giorni). Non operativo.',d.regime_and_risk.RiskWindow)}
    </section>`;

  const breadthHTML = `
    <section class="tl-panel-section" data-f1b-section="breadth" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Breadth &amp; Rotazione Equity</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
        ${metricBlock('Breadth_1M','Breadth (1M)','% settori positivi su ~30 giorni',d.breadth_rotation.Breadth_1M)}
        ${metricBlock('RiskTilt_1M','RiskTilt (1M)','Ciclici/growth vs difensivi',d.breadth_rotation.RiskTilt_1M)}
        ${metricBlock('SmallCapPressure_1W','SmallCap Pressure (1W)','Microcap vs Mid/Large',d.breadth_rotation.SmallCapPressure_1W)}
        ${metricBlock('IndexMomentum_1W','Index Momentum (1W)','Momentum cross-indici / crypto',d.breadth_rotation.IndexMomentum_1W)}
        ${metricBlock('SizeBias','Size Bias','Preferenza di capitalizzazione',d.breadth_rotation.SizeBias)}
      </div>
      ${sectorListDetailed('Leadership multi-timeframe', d.breadth_rotation.Leadership?.LeadersMultiTF)}
      ${sectorListDetailed('Leadership difensiva qualitativa', d.breadth_rotation.Leadership?.DefensiveLeadership)}
      ${sectorListDetailed('Settori in ritardo', d.breadth_rotation.Leadership?.Lagging)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">${escapeHtml(d.breadth_rotation.Leadership?.ai_note || '')}</div>
    </section>`;

  const internalsHTML = `
    <section class="tl-panel-section" data-f1b-section="internals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Market Internals (dati grezzi)</div></header>
      ${listBlockCard('Indici (1W)', d.internals_raw.Indices_1W)}
      ${listBlockCard('Futures / Commodities (1W)', d.internals_raw.Futures_Move_1W)}
      ${listBlockCard('Curva Treasury', d.internals_raw.Curve_UST)}
      ${listBlockCard('Volatilità & USD', d.internals_raw.Vol_USD)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">${escapeHtml(d.internals_raw.ai_note || '')}</div>
    </section>`;

  const streetHTML = `
    <section class="tl-panel-section" data-f1b-section="street" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Street View · Narrativa istituzionale</div></header>
      ${headlineBlockCard('Macro (Bloomberg / Reuters / Barr\'on\'s)', d.street_view.T1_MacroNews)}
      ${headlineBlockCard('Sell-Side / Street View (Goldman / JPM / ecc.)', d.street_view.T1_SellSideNotes)}
      ${headlineBlockCard('Consensus Tone', d.street_view.T1_ConsensusTone)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">${escapeHtml(d.street_view.ai_note || '')}</div>
    </section>`;

  const sintesiHTML = `
    <section class="tl-panel-section" data-f1b-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div></header>
      ${(Array.isArray(d.sintesi_ai.points)? d.sintesi_ai.points.map(p=>conclusionPointBlock(p)).join('') : '')}
      ${headlineBlockCard('Lettura di contesto (non istruzioni operative)', d.sintesi_ai.summary)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Questa conclusione ha esclusivamente finalità informative e formative. Non è un invito a prendere posizione o modificare allocazioni. Consulta sempre un intermediario autorizzato.</div>
    </section>`;

  const auditHTML = `
    <section class="tl-panel-section" data-f1b-section="audit" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit &amp; Qualità dati</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChip('FreshnessScore', d.audit_quality.QualityMetrics?.FreshnessScore)}
        ${qualityChip('ConfidenceFinal', d.audit_quality.QualityMetrics?.ConfidenceFinal)}
        ${qualityChip('DataIntegrity', d.audit_quality.QualityMetrics?.DataIntegrity)}
        ${qualityChip('FeedSync', d.audit_quality.QualityMetrics?.FeedSync)}
      </div>
      <div class="mt-4 text-[11px] leading-[1.4] text-[color:var(--muted)]">Semaforo interno: verde = dati coerenti/aggiornati; giallo = parziale/debole; rosso = incompleto o rumoroso. Valutazioni soggettive e non operative.</div>
    </section>`;

  const mifidHTML = `
    <section class="tl-panel-section" data-f1b-section="mifid" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Nota regolamentare</div></header>
      ${headlineBlockCard('Informativa', d.mifid.disclaimer)}
    </section>`;

  return {regimeHTML,breadthHTML,internalsHTML,streetHTML,sintesiHTML,auditHTML,mifidHTML};
}

/* -----------------------------------------------------------------------------
   SHELLS DESKTOP / MOBILE
----------------------------------------------------------------------------- */
function renderDrawerDesktopShellPublic(sectionsObj){
  return `
    <div class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerMenuButtonPublic('regime','Regime di Mercato')}
        ${drawerMenuButtonPublic('breadth','Ampiezza e Rotazione')}
        ${drawerMenuButtonPublic('internals','Market Internals')}
        ${drawerMenuButtonPublic('street','Narrativa Istituzionale')}
        ${drawerMenuButtonPublic('sintesi','Sintesi Educativa')}
        ${drawerMenuButtonPublic('audit','Qualità Dati')}
        ${drawerMenuButtonPublic('mifid','Informativa MiFID')}
      </aside>
      <main class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;" id="f1b-scroll-desktop">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="sintesi" hidden>${sectionsObj.sintesiHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>`;
}

function renderDrawerMobileShellPublic(sectionsObj){
  const mobileTabsBar = `
    <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);background-image:radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%, transparent 60%);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left" style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%,rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;padding-right:2rem;">
        ${mobileTabButton('regime','Regime di Mercato')}
        ${mobileTabButton('breadth','Ampiezza e Rotazione')}
        ${mobileTabButton('internals','Market Internals')}
        ${mobileTabButton('street','Narrativa Istituzionale')}
        ${mobileTabButton('sintesi','Sintesi Educativa')}
        ${mobileTabButton('audit','Qualità Dati')}
        ${mobileTabButton('mifid','Informativa MiFID')}
      </div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%,rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);"><span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span></div>
    </div>`;

  return `
    <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);background-image:radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%, transparent 60%);">
      ${mobileTabsBar}
      <main class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);background-image:none;" id="f1b-scroll-mobile">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="sintesi" hidden>${sectionsObj.sintesiHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>`;
}

/* -----------------------------------------------------------------------------
   TAB SWITCHING
----------------------------------------------------------------------------- */
function drawerMenuButtonPublic(key, label){
  return `<button class="f1b-tab-btn" data-f1b-tab="${key}" aria-controls="f1b-view-${key}">${escapeHtml(label)}</button>`;
}

function mobileTabButton(key, label){
  return `<button class="f1b-footer-tab-btn" data-f1b-tab="${key}" aria-controls="f1b-view-${key}">${escapeHtml(label)}</button>`;
}

function bindDrawerTabsPublic(){
  const tabButtons = document.querySelectorAll('[data-f1b-tab]');
  const views = document.querySelectorAll('[data-f1b-view]');
  const desktopScrollEl = document.getElementById('f1b-scroll-desktop');
  const mobileScrollEl  = document.getElementById('f1b-scroll-mobile');
  const sidebarEl       = document.querySelector('.f1b-panel-menu');

  function hardResetScroll(){ [desktopScrollEl,mobileScrollEl,sidebarEl].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; try{ el.scrollTo({top:0,left:0,behavior:'auto'});}catch(_){} }); }

  function styleTabs(active){
    tabButtons.forEach(b=>{
      const isActive = b.getAttribute('data-f1b-tab')===active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', isActive);
      if (b.classList.contains('f1b-footer-tab-btn')){
        b.style.fontWeight = isActive? '600':'500';
        b.style.border = isActive? '1px solid var(--ink)':'1px solid var(--br-soft)';
        b.style.background = isActive? 'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)': 'var(--surface-card)';
        b.style.color = isActive? 'var(--ink)':'var(--muted)';
        b.style.boxShadow = isActive? '0 4px 10px rgba(0,0,0,.18)':'var(--shadow-card)';
      }
    });
  }

  function showView(active){
    views.forEach(view=>{
      const key = view.getAttribute('data-f1b-view');
      const shouldShow = key===active; view.hidden=!shouldShow;
      if(shouldShow){ requestAnimationFrame(()=>{ hardResetScroll(); const header=view.querySelector('.tl-panel-section-title-text'); if(header){ header.setAttribute('tabindex','-1'); try{header.focus({preventScroll:true});}catch{header.focus();} } view.querySelectorAll('[data-scrollable]').forEach(sc=>{ sc.scrollTop=0; sc.scrollLeft=0; }); }); }
    });
  }

  function activateTab(key){ styleTabs(key); showView(key); }
  tabButtons.forEach(btn=>{ if(btn.__f1bBound) return; btn.__f1bBound=true; btn.addEventListener('click',()=>{ const key=btn.getAttribute('data-f1b-tab'); if(!key) return; activateTab(key); }); });
}

/* -----------------------------------------------------------------------------
   CARD SYSTEM
----------------------------------------------------------------------------- */
function f1bCard({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColors(tone);
  return `
    <div class="f1b-subcard mb-3 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title||'')}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml||''}</div>
      ${noteHtml? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>`:''}
    </div>`;
}

function metricBoxTrafficLight({key,label,desc,metric}){
  const { dotColor, textColor } = toneColors(metric?.tone);
  const trend = metric?.trend==='up'?'↑': metric?.trend==='down'?'↓': metric?.trend==='flat'?'→':'';
  const raw = metric?.raw ?? 'N/A';
  const isNA = raw==='N/A';
  return `
    <div class="kpi" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:.6rem .75rem;min-height:84px;">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
        </div>
        <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
      </div>
      <div class="value font-mono font-bold text-[13px] leading-[1.4] ${isNA?'opacity-70':''}" style="color:${textColor};">${escapeHtml(String(raw))} ${trend? `<span aria-hidden="true" class="ml-1">${trend}</span>`:''}</div>
      <div class="desc text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc||'')}</div>
    </div>`;
}

function metricBlock(metricKey, title, desc, metricObj){
  const { textColor } = toneColors(metricObj?.tone);
  const value = escapeHtml(metricObj?.raw ?? 'N/A');
  const trend = metricObj?.trend==='up'?'↑': metricObj?.trend==='down'?'↓': metricObj?.trend==='flat'?'→':'';
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}${trend? ` <span aria-hidden=\"true\">${trend}</span>`:''}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc||'')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1 line-1">${escapeHtml(metricObj?.ai_note||'')}</div>`;
  return f1bCard({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function sectorListDetailed(title, leadershipBlock){
  let tone='neutral', itemsArr=[], extraNote='';
  if (Array.isArray(leadershipBlock)) itemsArr=leadershipBlock; else if (leadershipBlock && typeof leadershipBlock==='object'){ tone=leadershipBlock.tone||'neutral'; itemsArr=Array.isArray(leadershipBlock.items)? leadershipBlock.items:[]; extraNote=leadershipBlock.ai_note||''; }
  const listHtml = itemsArr.length? itemsArr.map(item=>`<li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">${escapeHtml(item)}</li>`).join('') : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">Nessun dato.</li>`;
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title||'')}</div>
      <button class="info-btn" data-metric="${escapeAttr(title||'Leadership')}" aria-label="Info ${escapeAttr(title||'Leadership')}">?</button>
    </div>
    <ul class="list-disc pl-4 space-y-1">${listHtml}</ul>`;
  return f1bCard({ tone, title:'', bodyHtml, noteHtml: extraNote? `<span class="text-[11px] text-[color:var(--muted)] leading-[1.4]">${escapeHtml(extraNote)}</span>`:'' });
}

function listBlockCard(title, block){
  let tone='neutral', rowsArr=[], aiNote='';
  if (Array.isArray(block)) rowsArr=block; else if (block && typeof block==='object'){ tone=block.tone||'neutral'; rowsArr=Array.isArray(block.items)? block.items:[]; aiNote=block.ai_note||''; }
  const listItems = rowsArr.length? rowsArr.map(r=>`<li class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]">${escapeHtml(r)}</li>`).join('') : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">N/A</li>`;
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title||'')}</div>
      <button class="info-btn" data-metric="${escapeAttr(title||'Internals')}" aria-label="Info ${escapeAttr(title||'Internals')}">?</button>
    </div>
    <ul class="pl-4 list-disc space-y-1">${listItems}</ul>`;
  const noteHtml = aiNote? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${escapeHtml(aiNote)}</div>`:'';
  return f1bCard({ tone, title:'', bodyHtml, noteHtml });
}

function headlineBlockCard(title, body){
  if (!body && body!==0) return '';
  let tone='neutral', rawText='', aiNote='';
  if (typeof body==='string') rawText=body; else if (body && typeof body==='object'){ tone=body.tone||'neutral'; rawText=body.raw||''; aiNote=body.ai_note||''; }
  const heading = title==='Informativa'
    ? `<div class="flex items-start justify-between gap-2 mb-2"><div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title)}</div><button class="info-btn" data-metric="MiFID_disclaimer" aria-label="Info MiFID">?</button></div>`
    : `<div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-2">${escapeHtml(title||'')}</div>`;
  const bodyHtml = `${heading}<div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">${escapeHtml(rawText)}</div>`;
  const noteHtml = aiNote? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${escapeHtml(aiNote)}</div>`:'';
  return f1bCard({ tone, title:'', bodyHtml, noteHtml });
}

function conclusionPointBlock(point={}){
  const tone = point.tone || 'neutral';
  const bodyHtml = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(point.raw||'')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] line-1">${escapeHtml(point.ai_note||'')}</div>`;
  return f1bCard({ tone, title: point.title || '', bodyHtml, noteHtml:'' });
}

function qualityChip(keyName, qObj){
  if (!qObj) return '';
  const { textColor } = toneColors(qObj.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(qObj.raw||'—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(keyName)}" aria-label="Info ${escapeAttr(keyName)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1 line-1">${escapeHtml(qObj.ai_note||'')}</div>`;
  return f1bCard({ tone:qObj.tone, title:keyName||'', bodyHtml, noteHtml:'' });
}

/* -----------------------------------------------------------------------------
   TONE HELPERS
----------------------------------------------------------------------------- */
function toneColors(tone){
  switch ((tone||'').toLowerCase()){
    case 'green': return { dotColor:'var(--tone-pos-fg)', textColor:'var(--tone-pos-fg)' };
    case 'yellow':return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red':   return { dotColor:'var(--tone-neg-fg)', textColor:'var(--tone-neg-fg)' };
    default:      return { dotColor:'var(--tone-neu-fg)', textColor:'var(--tone-neu-fg)' };
  }
}

function computeHighLevelTone(strategyModeMacroObj, regimeScoreObj){
  const stratRaw = (strategyModeMacroObj?.raw||'').toLowerCase();
  let toneColor = 'var(--tone-neu-fg)'; let toneLabel = 'neutral';
  if (stratRaw.includes('momentum') && !stratRaw.includes('light')){ toneColor='var(--tone-pos-fg)'; toneLabel='positive'; }
  else if (stratRaw.includes('momentum-light')){ toneColor='var(--tone-warn-fg)'; toneLabel='neutral'; }
  else if (stratRaw.includes('pullback')){ toneColor='var(--tone-neg-fg)'; toneLabel='alert'; }
  else { const regimeTone=(regimeScoreObj&&regimeScoreObj.tone)||''; const colors=toneColors(regimeTone); if(regimeTone){ toneColor=colors.textColor; if(regimeTone==='green') toneLabel='positive'; else if(regimeTone==='yellow') toneLabel='neutral'; else if(regimeTone==='red') toneLabel='alert'; } }
  return { toneColor, toneLabel };
}

/* -----------------------------------------------------------------------------
   NORMALIZZAZIONE DATI
----------------------------------------------------------------------------- */
function normalizeDataPublicF1B(src={}){
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? '—',
      module: src?.meta?.module ?? 'F1B · Market Regime',
      moduleVersion: src?.meta?.moduleVersion ?? 'vX',
      moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? '',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? ''
    },
    regime_and_risk: src.regime_and_risk || {},
    breadth_rotation: src.breadth_rotation || {},
    internals_raw: src.internals_raw || { Indices_1W: [], Futures_Move_1W: [], Curve_UST: [], Vol_USD: [], ai_note: '' },
    street_view: src.street_view || { T1_MacroNews:'', T1_SellSideNotes:'', T1_ConsensusTone:'', ai_note:'' },
    sintesi_ai: src.sintesi_ai || { points:[], summary:'' },
    audit_quality: src.audit_quality || { AuditPathID:'—', SourcesTier1:[], Freshness:'—', ModuleStatus:'—', QualityMetrics:{} },
    mifid: src.mifid || { disclaimer:'' }
  };
}

/* -----------------------------------------------------------------------------
   UTILS
----------------------------------------------------------------------------- */
function escapeHtml(str){ if (str===undefined || str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if (str===undefined || str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// Injects a tiny CSS bundle once per page to support the design pass
function ensureF1BStyles(){
  if (document.getElementById('f1b-compact-styles')) return;
  const css = `
  /* === F1B compact styles (scoped) === */
  .f1b-wrap{position:relative}
  @media(max-width:767px){ .f1b-wrap{ margin-inline:-.75rem; } }
  .f1b-card{ background:var(--surface-card); border:1px solid var(--br-card); border-radius:var(--radius-card); box-shadow:var(--shadow-card); padding:1rem; }
  @media(max-width:767px){ .f1b-card{ padding:.75rem; box-shadow:none; } }
  .pill-tone{ display:inline-block; padding:4px 6px; border-radius:8px; border:1px solid; font-size:11px; font-weight:600; line-height:1; box-shadow:var(--shadow-card); transition:box-shadow .18s,border-color .18s }
  .pill-tone:hover,.pill-tone:focus-visible{ box-shadow:0 0 0 3px color-mix(in oklab,var(--ink) 12%, transparent) }
  .info-btn{ width:18px; height:18px; display:inline-grid; place-items:center; border-radius:999px; border:1px solid var(--br-soft); line-height:1; font-size:11px; color:var(--muted); background:transparent; }
  .info-btn:hover{ background:var(--surface-card-alt) }
  .f1b-tab-btn:focus-visible,.f1b-footer-tab-btn:focus-visible{ outline:2px solid var(--brand-600); outline-offset:2px }
  .line-1{ display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden }
  `;
  const el = document.createElement('style'); el.id='f1b-compact-styles'; el.textContent = css; document.head.appendChild(el);
}
