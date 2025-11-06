// /report/assets/js/modules/f1b.js
// F1B · Market Regime - Design Unificato
// Refactored con CSS unificato e tabs espandibili

import { formatF1BToRows } from './f1b-formatter.js';
import { renderModuleHeader, renderAISummary, renderModuleTab, bindModuleTabs } from '../components/module-header.js';

// Helper functions
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normalizeDataPublicF1B(src = {}) {
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? "—",
      module: src?.meta?.module ?? "F1B · Market Regime",
      moduleVersion: src?.meta?.moduleVersion ?? "v19-Dynamic",
      moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
      freshness: src?.meta?.freshness ?? "≤ T-1",
      hero_intro: src?.meta?.hero_intro ?? "",
      hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
    },
    regime_and_risk: src.regime_and_risk || {},
    breadth_rotation: src.breadth_rotation || {},
    internals_raw: src.internals_raw || {},
    street_view: src.street_view || {},
    sintesi_ai: src.sintesi_ai || {},
    finvizFilters: src.finvizFilters || null,
    bridgeF2: src.bridgeF2 || null,
    audit_quality: src.audit_quality || {},
    mifid: src.mifid || {}
  };
}

// Render metric block per tabs
function renderMetricBlock(key, label, desc, metric) {
  const value = metric?.raw || metric || '—';
  const tone = metric?.tone || 'neutral';
  const aiNote = metric?.ai_note || '';
  
  return `
    <div class="module-content-compact">
      <div class="module-header-topline" style="margin-bottom: var(--sp-2);">
        <span style="font-size: var(--fs-12); font-weight: 600; color: var(--muted);">${escapeHtml(label)}</span>
        <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeHtml(label)}">?</button>
      </div>
      <div style="font-size: var(--fs-14); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-1);">
        ${escapeHtml(value)}
      </div>
      ${aiNote ? `<div style="font-size: var(--fs-11); color: var(--muted); line-height: var(--lh-15);">${escapeHtml(aiNote)}</div>` : ''}
    </div>
  `;
}

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);
  
  // Genera rows formattate per header-ticker
  const formattedRows = rawData?.rows || rawData?.formattedRows || formatF1BToRows(rawData);
  
  // Header modulo
  const headerHTML = renderModuleHeader({
    badge: 'F1B',
    subtitle: 'Regime di mercato · Orizzonte 3–10 giorni',
    title: 'Contesto rischio & ampiezza del mercato',
    desc: 'Lettura di contesto. Non è un\'istruzione operativa.',
    status: d.meta.moduleStatus,
    freshness: d.meta.freshness
  });
  
  // AI Summary
  const aiSummaryHTML = renderAISummary(
    d.meta.hero_intro || d.sintesi_ai?.summary?.raw || '',
    'Riassunto AI'
  );
  
  // Tabs per sezioni
  const tabs = [];
  
  // Tab 1: Regime & Rischio
  if (d.regime_and_risk && Object.keys(d.regime_and_risk).length > 0) {
    const regimeContent = `
      <div class="module-grid module-grid-2">
        ${renderMetricBlock('StrategyMode_macro', 'StrategyMode', 'Modalità regime', d.regime_and_risk.StrategyMode_macro)}
        ${renderMetricBlock('RegimeScore', 'RegimeScore', 'Appetito rischio', d.regime_and_risk.RegimeScore)}
        ${renderMetricBlock('VolRegime', 'Volatilità', 'VIX / hedge', d.regime_and_risk.VolRegime)}
        ${renderMetricBlock('LiquidityRegimeScore', 'Liquidità', 'Curva & funding', d.regime_and_risk.LiquidityRegimeScore)}
        ${renderMetricBlock('CreditRiskBlock', 'Credito', 'Spread credito', d.regime_and_risk.CreditRiskBlock)}
        ${renderMetricBlock('FX_Regime', 'FX', 'Dollar tone', d.regime_and_risk.FX_Regime)}
        ${renderMetricBlock('RiskWindow', 'Risk Window (3–10g)', 'Driver macro monitorati', d.regime_and_risk.RiskWindow)}
      </div>
    `;
    tabs.push(renderModuleTab({
      id: 'regime',
      title: 'Regime & Rischio',
      content: regimeContent,
      expanded: true
    }));
  }
  
  // Tab 2: Breadth & Rotazione
  if (d.breadth_rotation && Object.keys(d.breadth_rotation).length > 0) {
    const breadthContent = `
      <div class="module-grid module-grid-2">
        ${renderMetricBlock('Breadth_1M', 'Breadth 1M', '% settori positivi', d.breadth_rotation.Breadth_1M)}
        ${renderMetricBlock('RiskTilt_1M', 'RiskTilt 1M', 'Ciclici vs difensivi', d.breadth_rotation.RiskTilt_1M)}
        ${renderMetricBlock('SmallCapPressure_1W', 'SmallCap Pressure', 'Microcap vs Large', d.breadth_rotation.SmallCapPressure_1W)}
        ${renderMetricBlock('IndexMomentum_1W', 'Index Momentum', 'Momentum cross-indici', d.breadth_rotation.IndexMomentum_1W)}
        ${renderMetricBlock('SizeBias', 'Size Bias', 'Preferenza capitalizzazione', d.breadth_rotation.SizeBias)}
      </div>
      ${d.breadth_rotation.Leadership ? `
        <div style="margin-top: var(--sp-4);">
          <h4 style="font-size: var(--fs-13); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-2);">Leadership</h4>
          ${d.breadth_rotation.Leadership.LeadersMultiTF ? `
            <div style="margin-bottom: var(--sp-2);">
              <strong>Leaders:</strong> ${escapeHtml((d.breadth_rotation.Leadership.LeadersMultiTF.items || []).join(', '))}
            </div>
          ` : ''}
          ${d.breadth_rotation.Leadership.DefensiveLeadership ? `
            <div style="margin-bottom: var(--sp-2);">
              <strong>Defensivi:</strong> ${escapeHtml((d.breadth_rotation.Leadership.DefensiveLeadership.items || []).join(', '))}
            </div>
          ` : ''}
          ${d.breadth_rotation.Leadership.Lagging ? `
            <div>
              <strong>In ritardo:</strong> ${escapeHtml((d.breadth_rotation.Leadership.Lagging.items || []).join(', '))}
            </div>
          ` : ''}
        </div>
      ` : ''}
    `;
    tabs.push(renderModuleTab({
      id: 'breadth',
      title: 'Breadth & Rotazione',
      content: breadthContent,
      expanded: false
    }));
  }
  
  // Tab 3: Street View
  if (d.street_view && Object.keys(d.street_view).length > 0) {
    const streetContent = `
      <div class="module-content-compact">
        <h4 style="font-size: var(--fs-13); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-2);">Macro News</h4>
        <p style="font-size: var(--fs-13); color: var(--ink-soft); line-height: var(--lh-16);">${escapeHtml(d.street_view.T1_MacroNews || '—')}</p>
      </div>
      <div class="module-content-compact" style="margin-top: var(--sp-3);">
        <h4 style="font-size: var(--fs-13); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-2);">Sell-Side Notes</h4>
        <p style="font-size: var(--fs-13); color: var(--ink-soft); line-height: var(--lh-16);">${escapeHtml(d.street_view.T1_SellSideNotes || '—')}</p>
      </div>
      ${d.street_view.T1_ConsensusTone ? `
        <div class="module-content-compact" style="margin-top: var(--sp-3);">
          <h4 style="font-size: var(--fs-13); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-2);">Consensus Tone</h4>
          <p style="font-size: var(--fs-13); color: var(--ink-soft); line-height: var(--lh-16);">${escapeHtml(d.street_view.T1_ConsensusTone.raw || '—')}</p>
        </div>
      ` : ''}
    `;
    tabs.push(renderModuleTab({
      id: 'street',
      title: 'Street View · Narrativa istituzionale',
      content: streetContent,
      expanded: false
    }));
  }
  
  // Tab 4: Finviz Filters (se presente)
  if (d.finvizFilters) {
    const finvizContent = `
      <div class="module-content-compact">
        <h4 style="font-size: var(--fs-13); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-2);">Query String</h4>
        <code style="font-size: var(--fs-11); color: var(--muted); word-break: break-all; display: block; padding: var(--sp-2); background: var(--surface-page); border-radius: var(--radius-sm);">${escapeHtml(d.finvizFilters.QueryString || '—')}</code>
      </div>
      <div class="module-grid module-grid-2" style="margin-top: var(--sp-3);">
        <div>
          <strong>StrategyMode:</strong> ${escapeHtml(d.finvizFilters.StrategyMode || '—')}
        </div>
        <div>
          <strong>Sector Focus:</strong> ${escapeHtml(Array.isArray(d.finvizFilters.SectorFocus) ? d.finvizFilters.SectorFocus.join(', ') : (d.finvizFilters.SectorFocus || '—'))}
        </div>
        <div>
          <strong>Size Focus:</strong> ${escapeHtml(d.finvizFilters.SizeFocus || '—')}
        </div>
      </div>
    `;
    tabs.push(renderModuleTab({
      id: 'finviz',
      title: 'Finviz Filters (Dynamic)',
      content: finvizContent,
      expanded: false
    }));
  }
  
  // Container per header-ticker (se ci sono rows)
  const tickerContainer = formattedRows && formattedRows.length > 0 ? `
    <div class="module-content-compact" data-f1b-ticker="true" style="padding: var(--sp-4);"></div>
  ` : '';
  
  return `
    <section class="module-card" data-state="${escapeAttr(d.meta.moduleStatus)}">
      ${headerHTML}
      ${aiSummaryHTML}
      ${tickerContainer}
      <div class="module-tabs">
        ${tabs.join('')}
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1B(rawData);
  
  // Bind tabs
  const tabsContainer = node.querySelector('.module-tabs');
  if (tabsContainer) {
    bindModuleTabs(tabsContainer);
  }
  
  // Monta header-ticker se ci sono rows
  const formattedRows = rawData?.rows || rawData?.formattedRows || formatF1BToRows(rawData);
  const tickerContainer = node.querySelector('[data-f1b-ticker="true"]');
  
  if (formattedRows && Array.isArray(formattedRows) && formattedRows.length > 0 && tickerContainer) {
    import('../components/header-ticker.js').then(({ headerTicker }) => {
      const tickerNode = headerTicker.mount(tickerContainer);
      if (tickerNode) {
        const tickerData = {
          ...rawData.meta,
          rows: formattedRows,
          metricsPanel: rawData?.metricsPanel || []
        };
        headerTicker.update(tickerNode, tickerData);
      }
    }).catch(err => {
      console.warn('F1B: Errore caricamento header-ticker', err);
    });
  }
  
  // Bind metric info buttons
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {
      console.warn('F1B: Errore bind metric info buttons', e);
    }
  }
}
