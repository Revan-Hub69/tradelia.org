// /report/assets/js/modules/f1b.js (fixed 02 Nov 2025 · flush-mobile + scoped drawer)
//
// F1B · Regime di mercato / Contesto rischio (public dashboard)

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);

  const kpis = [
    { key: "StrategyMode_macro", label: "StrategyMode", desc: "Modalità regime",     metric: d.regime_and_risk.StrategyMode_macro },
    { key: "RegimeScore",        label: "RegimeScore",  desc: "Appetito rischio",    metric: d.regime_and_risk.RegimeScore },
    { key: "VolRegime",          label: "Volatilità",   desc: "VIX / oro / hedge",   metric: d.regime_and_risk.VolRegime }
  ];

  const { toneLabel, toneColor } = computeHighLevelTone(
    d.regime_and_risk.StrategyMode_macro,
    d.regime_and_risk.RegimeScore
  );

  return `
    <section class="f1b-card text-[13px] leading-[1.5] text-[color:var(--ink)]">
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="flex items-center flex-wrap gap-2">
            <span class="section-badge">F1B</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Regime di mercato · Orizzonte 3–10 giorni
            </span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>
          <div class="text-[14px] font-bold leading-[1.35] mt-1">Contesto rischio &amp; ampiezza del mercato</div>
          <div class="text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            Lettura di contesto. Non è un'istruzione operativa.
          </div>
        </div>
      </header>

      <!-- FLUSH mobile: niente padding orizzontale; desktop: padding pieno -->
      <div class="f1b-card__body flex flex-col gap-4"
           style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:.6rem 0 .8rem 0;">
        <style>
          @media (min-width:768px){ .f1b-card__body{ padding:1rem; } }
        </style>

        <!-- StrategyMode + tono (padding solo sul testo) -->
        <div class="px-3 md:px-0">
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>StrategyMode</span>
            <button class="info-btn align-middle" data-metric="StrategyMode_macro" aria-label="Info StrategyMode">?</button>
          </div>
          <div class="text-[14px] font-bold leading-[1.35] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.regime_and_risk.StrategyMode_macro?.raw || '—')}</span>
            <span class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
                  style="background:radial-gradient(circle at 0% 0%,color-mix(in oklab, ${toneColor} 18%, transparent) 0%,transparent 60%),var(--surface-card);color:${toneColor};border-color:${toneColor};box-shadow:var(--shadow-card);">
              ${escapeHtml(toneLabel)}
            </span>
          </div>
          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(d.regime_and_risk.StrategyMode_macro?.ai_note || '')}</div>
        </div>

        <!-- KPI (flush) -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(k => metricBoxTrafficLight(k)).join('')}
        </div>

        <!-- Disclaimer + CTA (padding solo testo) -->
        <div class="mt-1 flex flex-col gap-3 md:flex-row md:items-start px-3 md:px-0">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            ${escapeHtml(d.meta.hero_disclaimer || '')}
          </p>
          <div class="flex md:justify-end">
            <button class="f1b-cta-btn" data-open-f1b-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli regime →
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1B(rawData);

  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) btnDetails.addEventListener('click', () => openF1DrawerPublic(data));

  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch {}
  }
}

/* ========================== PANEL / DRAWER (scoped) ========================== */

function openF1DrawerPublic(data){
  if (!window.__TradeliaUI?.openPanel) return;

  const sections = buildDrawerSectionsPublic(data);
  const isMobile = matchMobile();
  const shell = isMobile ? renderDrawerMobileShellPublic(sections)
                         : renderDrawerDesktopShellPublic(sections);

  window.__TradeliaUI.openPanel({
    title: 'F1B · Regime di mercato',
    subtitle: '',
    sections: [{ title: '', body: shell, meta: '' }],
    blocking: false,
    panelSize: isMobile ? 'wide' : 'xl',
    footerButtons: isMobile ? [] : [{ label: 'Chiudi', action: () => window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  setTimeout(() => {
    const root = document.getElementById('f1b-panel-root');
    if (!root) return;

    bindDrawerTabsPublic(root);
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(root); } catch {}
    }
    const first = root.querySelector('[data-f1b-tab="regime"]');
    if (first && typeof first.click === 'function') first.click();
    initTabsScrollHint(root);
  }, 0);
}

function matchMobile(){ return window.matchMedia('(max-width: 767px)').matches; }

/* ============================== CONTENT BUILDER ============================== */

function buildDrawerSectionsPublic(d){
  const regimeHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="regime" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Regime &amp; Rischio</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlock('StrategyMode_macro','StrategyMode','Modalità corrente del mercato',d.regime_and_risk.StrategyMode_macro)}
        ${metricBlock('RegimeScore','RegimeScore','Appetito rischio sintetico',d.regime_and_risk.RegimeScore)}
        ${metricBlock('VolRegime','Volatilità / Hedge','VIX, oro, ricerca hedge',d.regime_and_risk.VolRegime)}
        ${metricBlock('LiquidityRegimeScore','Curva & Costo capitale','Curve Treasury / funding stress',d.regime_and_risk.LiquidityRegimeScore)}
        ${metricBlock('CreditRiskBlock','Credito','High beta vs flight-to-safety',d.regime_and_risk.CreditRiskBlock)}
        ${metricBlock('FX_Regime','FX / USD','Dollar tone',d.regime_and_risk.FX_Regime)}
      </div>
      ${metricBlock('RiskWindow','RiskWindow (3–10g)','Driver macro monitorati a breve',d.regime_and_risk.RiskWindow)}
    </section>`;

  const breadthHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="breadth" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Breadth &amp; Rotazione Equity</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
        ${metricBlock('Breadth_1M','Breadth (1M)','% settori positivi ~30g',d.breadth_rotation.Breadth_1M)}
        ${metricBlock('RiskTilt_1M','RiskTilt (1M)','Ciclici/growth vs difensivi',d.breadth_rotation.RiskTilt_1M)}
        ${metricBlock('SmallCapPressure_1W','SmallCap Pressure (1W)','Microcap vs Mid/Large',d.breadth_rotation.SmallCapPressure_1W)}
        ${metricBlock('IndexMomentum_1W','Index Momentum (1W)','Momentum cross-indici/crypto',d.breadth_rotation.IndexMomentum_1W)}
        ${metricBlock('SizeBias','Size Bias','Preferenza di capitalizzazione',d.breadth_rotation.SizeBias)}
      </div>
      ${sectorListDetailed('Leadership multi-timeframe', d.breadth_rotation.Leadership?.LeadersMultiTF)}
      ${sectorListDetailed('Leadership difensiva qualitativa', d.breadth_rotation.Leadership?.DefensiveLeadership)}
      ${sectorListDetailed('Settori in ritardo', d.breadth_rotation.Leadership?.Lagging)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">${escapeHtml(d.breadth_rotation.Leadership?.ai_note || '')}</div>
    </section>`;

  const internalsHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="internals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Market Internals (dati grezzi)</div></header>
      ${listBlockCard('Indici (1W)', d.internals_raw.Indices_1W)}
      ${listBlockCard('Futures / Commodities (1W)', d.internals_raw.Futures_Move_1W)}
      ${listBlockCard('Curva Treasury', d.internals_raw.Curve_UST)}
      ${listBlockCard('Volatilità & USD', d.internals_raw.Vol_USD)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">${escapeHtml(d.internals_raw.ai_note || '')}</div>
    </section>`;

  const streetHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="street" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Narrativa istituzionale</div></header>
      ${headlineBlockCard('Macro (Bloomberg / Reuters / Barr\'s)', d.street_view.T1_MacroNews)}
      ${headlineBlockCard('Sell-Side / Street View', d.street_view.T1_SellSideNotes)}
      ${headlineBlockCard('Consensus Tone', d.street_view.T1_ConsensusTone)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">${escapeHtml(d.street_view.ai_note || '')}</div>
    </section>`;

  const sintesiHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div></header>
      ${Array.isArray(d.sintesi_ai.points) ? d.sintesi_ai.points.map(conclusionPointBlock).join('') : ''}
      ${headlineBlockCard('Lettura di contesto (non operativa)', d.sintesi_ai.summary)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Solo scopo informativo/formativo. Non è un invito a prendere posizione.</div>
    </section>`;

  const auditHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="audit" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit &amp; Qualità dati</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChip('FreshnessScore', d.audit_quality.QualityMetrics?.FreshnessScore)}
        ${qualityChip('ConfidenceFinal', d.audit_quality.QualityMetrics?.ConfidenceFinal)}
        ${qualityChip('DataIntegrity', d.audit_quality.QualityMetrics?.DataIntegrity)}
        ${qualityChip('FeedSync', d.audit_quality.QualityMetrics?.FeedSync)}
      </div>
      <div class="mt-4 text-[11px] leading-[1.4] text-[color:var(--muted)]">Semaforo interno: verde=coerente/aggiornato; giallo=parziale; rosso=rumoroso.</div>
    </section>`;

  const mifidHTML = `
    <section class="tl-panel-section px-3 md:px-4" data-f1b-section="mifid" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding-top:.25rem;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Nota regolamentare</div></header>
      ${headlineBlockCard('Informativa', d.mifid.disclaimer)}
    </section>`;

  return { regimeHTML, breadthHTML, internalsHTML, streetHTML, sintesiHTML, auditHTML, mifidHTML };
}

/* =================== SHELLS (scoped under #f1b-panel-root) =================== */

function renderDrawerDesktopShellPublic(sections){
  return `
  <div id="f1b-panel-root" class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
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
      <div data-f1b-view="regime">${sections.regimeHTML}</div>
      <div data-f1b-view="breadth" hidden>${sections.breadthHTML}</div>
      <div data-f1b-view="internals" hidden>${sections.internalsHTML}</div>
      <div data-f1b-view="street" hidden>${sections.streetHTML}</div>
      <div data-f1b-view="sintesi" hidden>${sections.sintesiHTML}</div>
      <div data-f1b-view="audit" hidden>${sections.auditHTML}</div>
      <div data-f1b-view="mifid" hidden>${sections.mifidHTML}</div>
    </main>
  </div>`;
}

function renderDrawerMobileShellPublic(sections){
  const tabs = `
    <div class="f1b-mobile-tabs" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left"  style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%,rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">
        ${mobileTabButton('regime','Regime di Mercato')}
        ${mobileTabButton('breadth','Ampiezza e Rotazione')}
        ${mobileTabButton('internals','Market Internals')}
        ${mobileTabButton('street','Narrativa Istituzionale')}
        ${mobileTabButton('sintesi','Sintesi Educativa')}
        ${mobileTabButton('audit','Qualità Dati')}
        ${mobileTabButton('mifid','Informativa MiFID')}
      </div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%,rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);">
        <span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span>
      </div>
    </div>`;

  return `
  <div id="f1b-panel-root" class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
    ${tabs}
    <!-- FLUSH: niente padding laterale -->
    <main class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:0;background:var(--surface-page);" id="f1b-scroll-mobile">
      <div data-f1b-view="regime">${sections.regimeHTML}</div>
      <div data-f1b-view="breadth" hidden>${sections.breadthHTML}</div>
      <div data-f1b-view="internals" hidden>${sections.internalsHTML}</div>
      <div data-f1b-view="street" hidden>${sections.streetHTML}</div>
      <div data-f1b-view="sintesi" hidden>${sections.sintesiHTML}</div>
      <div data-f1b-view="audit" hidden>${sections.auditHTML}</div>
      <div data-f1b-view="mifid" hidden>${sections.mifidHTML}</div>
    </main>
  </div>`;
}

/* ==================================== TABS =================================== */

function drawerMenuButtonPublic(key,label){
  return `<button class="f1b-tab-btn" data-f1b-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabButton(key,label){
  return `<button class="f1b-footer-tab-btn" data-f1b-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}

function bindDrawerTabsPublic(root){
  const tabButtons = root.querySelectorAll('[data-f1b-tab]');
  const views      = root.querySelectorAll('[data-f1b-view]');
  const desktopEl  = root.querySelector('#f1b-scroll-desktop');
  const mobileEl   = root.querySelector('#f1b-scroll-mobile');
  const sidebarEl  = root.querySelector('.f1b-panel-menu');

  function hardResetScroll(){
    [desktopEl, mobileEl, sidebarEl].forEach(el => {
      if (!el) return; el.scrollTop = 0; el.scrollLeft = 0;
      if (typeof el.scrollTo === 'function') try{ el.scrollTo({top:0,left:0,behavior:'auto'});}catch{}
    });
  }
  function styleTabs(activeKey){
    tabButtons.forEach(b => {
      const isActive = b.getAttribute('data-f1b-tab') === activeKey;
      if (b.classList.contains('f1b-tab-btn'))       b.classList.toggle('is-active', isActive);
      if (b.classList.contains('f1b-footer-tab-btn')){
        if (isActive){
          b.style.fontWeight='600'; b.style.border='1px solid var(--ink)';
          b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)';
          b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)';
        } else {
          b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)';
          b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)';
        }
      }
    });
  }
  function showView(activeKey){
    views.forEach(viewEl => {
      const key = viewEl.getAttribute('data-f1b-view');
      const show = key === activeKey;
      viewEl.hidden = !show;
      if (show){
        requestAnimationFrame(() => {
          hardResetScroll();
          const header = viewEl.querySelector('.tl-panel-section-title-text');
          if (header){ header.setAttribute('tabindex','-1'); try{ header.focus({preventScroll:true}); }catch{ header.focus(); } }
          viewEl.querySelectorAll('[data-scrollable]').forEach(sc => { sc.scrollTop=0; sc.scrollLeft=0; });
        });
      }
    });
  }
  function activateTab(key){ styleTabs(key); showView(key); }

  tabButtons.forEach(btn => {
    if (btn.__f1bBound) return; btn.__f1bBound = true;
    btn.addEventListener('click', () => { const key = btn.getAttribute('data-f1b-tab'); if (!key) return; activateTab(key); });
  });
}

function initTabsScrollHint(root){
  const scrollBox = root.querySelector('.f1b-footer-tabs-scroll');
  const fadeRight = root.querySelector('.f1b-tabs-fade-right');
  if (!scrollBox || !fadeRight) return;
  const needs = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
  if (!needs){ fadeRight.style.display='none'; const l = root.querySelector('.f1b-tabs-fade-left'); if (l) l.style.display='none'; return; }
  const hintEl = fadeRight.querySelector('.f1b-tabs-scroll-hint');
  function update(){
    const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
    if (hintEl) hintEl.style.opacity = atEnd ? '0' : '.9';
    const fl = root.querySelector('.f1b-tabs-fade-left'); if (fl) fl.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
  }
  update(); scrollBox.addEventListener('scroll', update, {passive:true});
}

/* ================================== CARDS =================================== */

function f1bCard({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColors(tone);
  return `
    <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title || '')}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45]">${bodyHtml || ''}</div>
      ${ noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : '' }
    </div>`;
}

function metricBoxTrafficLight({ key, label, desc, metric }){
  const { dotColor, textColor } = toneColors(metric?.tone);
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
      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc || '')}</div>
    </div>`;
}

function metricBlock(metricKey, title, desc, metricObj){
  const { textColor } = toneColors(metricObj?.tone);
  const value = escapeHtml(metricObj?.raw || '—');
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f1bCard({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function sectorListDetailed(title, leadershipBlock){
  let tone='neutral', itemsArr=[], extraNote='';
  if (Array.isArray(leadershipBlock)) itemsArr = leadershipBlock;
  else if (leadershipBlock && typeof leadershipBlock === 'object'){
    tone = leadershipBlock.tone || 'neutral';
    itemsArr = Array.isArray(leadershipBlock.items) ? leadershipBlock.items : [];
    extraNote = leadershipBlock.ai_note || '';
  }
  const listHtml = itemsArr.length
    ? itemsArr.map(item => `<li class="text-[12.5px] leading-[1.4]">${escapeHtml(item)}</li>`).join('')
    : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">Nessun dato.</li>`;
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title || '')}</div>
      <button class="info-btn" data-metric="${escapeAttr(title || 'Leadership')}" aria-label="Info ${escapeAttr(title || 'Leadership')}">?</button>
    </div>
    <ul class="list-disc pl-4 space-y-1">${listHtml}</ul>`;
  return f1bCard({ tone, title:'', bodyHtml, noteHtml: extraNote ? `<span class="text-[11px] text-[color:var(--muted)] leading-[1.4]">${escapeHtml(extraNote)}</span>` : '' });
}

function listBlockCard(title, block){
  let tone='neutral', rowsArr=[], aiNoteLocal='';
  if (Array.isArray(block)) rowsArr = block;
  else if (block && typeof block === 'object'){
    tone = block.tone || 'neutral';
    rowsArr = Array.isArray(block.items) ? block.items : [];
    aiNoteLocal = block.ai_note || '';
  }
  const listItems = rowsArr.length
    ? rowsArr.map(r => `<li class="font-mono text-[12px] leading-[1.4]">${escapeHtml(r)}</li>`).join('')
    : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">N/A</li>`;
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title || '')}</div>
      <button class="info-btn" data-metric="${escapeAttr(title || 'Internals')}" aria-label="Info ${escapeAttr(title || 'Internals')}">?</button>
    </div>
    <ul class="pl-4 list-disc space-y-1">${listItems}</ul>`;
  const noteHtml = aiNoteLocal ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${escapeHtml(aiNoteLocal)}</div>` : '';
  return f1bCard({ tone, title:'', bodyHtml, noteHtml });
}

function headlineBlockCard(title, body){
  if (!body && body !== 0) return '';
  let tone='neutral', rawText='', aiNoteLocal='';
  if (typeof body === 'string') rawText = body;
  else if (body && typeof body === 'object'){ tone = body.tone || 'neutral'; rawText = body.raw || ''; aiNoteLocal = body.ai_note || ''; }
  const heading = title === 'Informativa'
    ? `<div class="flex items-start justify-between gap-2 mb-2"><div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title)}</div><button class="info-btn" data-metric="MiFID_disclaimer" aria-label="Info MiFID">?</button></div>`
    : `<div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-2">${escapeHtml(title || '')}</div>`;
  const bodyHtml = `${heading}<div class="text-[12.5px] leading-[1.45] whitespace-pre-line">${escapeHtml(rawText)}</div>`;
  const noteHtml = aiNoteLocal ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${escapeHtml(aiNoteLocal)}</div>` : '';
  return f1bCard({ tone, title:'', bodyHtml, noteHtml });
}

function conclusionPointBlock(pointObj = {}){
  const tone = pointObj.tone || 'neutral';
  const bodyHtml = `
    <div class="font-mono text-[12px] leading-[1.4] mb-1">${escapeHtml(pointObj.raw || '')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(pointObj.ai_note || '')}</div>`;
  return f1bCard({ tone, title: pointObj.title || '', bodyHtml, noteHtml:'' });
}

function qualityChip(keyName, qObj){
  if (!qObj) return '';
  const { textColor } = toneColors(qObj.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(qObj.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(keyName)}" aria-label="Info ${escapeAttr(keyName)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(qObj.ai_note || '')}</div>`;
  return f1bCard({ tone: qObj.tone, title: keyName || '', bodyHtml, noteHtml:'' });
}

/* ======================= TONE & NORMALIZATION ======================= */

function toneColors(tone){
  switch ((tone || '').toLowerCase()){
    case 'green':  return { dotColor: 'var(--tone-pos-fg)',  textColor: 'var(--tone-pos-fg)'  };
    case 'yellow': return { dotColor: 'var(--tone-warn-fg)', textColor: 'var(--tone-warn-fg)' };
    case 'red':    return { dotColor: 'var(--tone-neg-fg)',  textColor: 'var(--tone-neg-fg)'  };
    default:       return { dotColor: 'var(--tone-neu-fg)',  textColor: 'var(--tone-neu-fg)'  };
  }
}

function computeHighLevelTone(strategyModeMacroObj, regimeScoreObj){
  const stratRaw = (strategyModeMacroObj && strategyModeMacroObj.raw || '').toLowerCase();
  let toneColor = 'var(--tone-neu-fg)'; let toneLabel = 'neutral';
  if (stratRaw.includes('momentum') && !stratRaw.includes('light')){ toneColor='var(--tone-pos-fg)';  toneLabel='positive'; }
  else if (stratRaw.includes('momentum-light')){                      toneColor='var(--tone-warn-fg)'; toneLabel='neutral'; }
  else if (stratRaw.includes('pullback')){                            toneColor='var(--tone-neg-fg)';  toneLabel='alert'; }
  else {
    const regimeTone = (regimeScoreObj && regimeScoreObj.tone) || '';
    const colors = toneColors(regimeTone);
    if (regimeTone){ toneColor = colors.textColor; toneLabel = regimeTone === 'green' ? 'positive' : regimeTone === 'yellow' ? 'neutral' : 'alert'; }
  }
  return { toneColor, toneLabel };
}

function normalizeDataPublicF1B(src = {}){
  return {
    meta: {
      timestampET:    src?.meta?.timestampET    ?? '—',
      module:         src?.meta?.module         ?? 'F1B · Market Regime',
      moduleVersion:  src?.meta?.moduleVersion  ?? 'vX',
      moduleStatus:   src?.meta?.moduleStatus   ?? 'ACTIVE',
      freshness:      src?.meta?.freshness      ?? '≤ T-1',
      hero_intro:     src?.meta?.hero_intro     ?? '',
      hero_disclaimer:src?.meta?.hero_disclaimer?? 'Materiale educativo/informativo. Nessuna raccomandazione personale.'
    },
    regime_and_risk: src.regime_and_risk || {},
    breadth_rotation:src.breadth_rotation || {},
    internals_raw:   src.internals_raw || { Indices_1W: [], Futures_Move_1W: [], Curve_UST: [], Vol_USD: [], ai_note: '' },
    street_view:     src.street_view   || { T1_MacroNews: '', T1_SellSideNotes: '', T1_ConsensusTone: '', ai_note: '' },
    sintesi_ai:      src.sintesi_ai    || { points: [], summary: '' },
    audit_quality:   src.audit_quality || { AuditPathID: '—', SourcesTier1: [], Freshness: '—', ModuleStatus: '—', QualityMetrics: {} },
    mifid:           src.mifid         || { disclaimer: '' }
  };
}

/* ================================== ESCAPE ================================== */
function escapeHtml(str){ if (str === undefined || str === null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if (str === undefined || str === null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
