// /report/assets/js/modules/f3.js (complete)
//
// F3 · Analisi Tecnica MTF (3–10 giorni)
// Allineato a F1B/F2 (stesso card system, stesso drawer responsive, stessi hook UI)
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> attach listeners
//
// Dipendenze globali attese:
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()

/* -------------------------------------------------------------------------- */
/* RENDER CARD (snapshot tecnico)                                              */
/* -------------------------------------------------------------------------- */
export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF3Public(rawData);

  const kpis = [
    { key: 'BiasMTF',   label: 'Bias MTF',   desc: 'Direzione prevalente setup MTF', metric: d.head?.BiasMTF },
    { key: 'MTF_Score', label: 'MTF Score',  desc: 'Forza segnali (0–100)',        metric: d.head?.MTF_Score },
    { key: 'P_SwingUp', label: 'P(SwingUp)', desc: 'Probabilità swing up',         metric: d.head?.P_SwingUp }
  ];

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F3</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Analisi Tecnica · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Setup tecnici & segnali swing (no derivati)
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || 'Lettura di pattern/struttura MTF, conferme e finestra swing 3–10 giorni.')}<br/>
            <span class="text-[11px] text-[color:var(--muted)]">${escapeHtml(d.meta.hero_disclaimer || 'Materiale informativo/educativo. Nessuna raccomandazione personale.')}</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- KPI compatti -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(k => metricBoxTrafficLightF3(k)).join('')}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f3-cta-btn" data-open-f3-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:.5rem .75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli tecnico →
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCard(node, rawData, ctx = {}){
  if (!node || !rawData) return;
  const data = normalizeDataF3Public(rawData);

  const btn = node.querySelector('[data-open-f3-details="true"]');
  if (btn) btn.addEventListener('click', ()=> openF3DrawerPublic(data, ctx));

  if (window.__TradeliaUI?.bindMetricInfoButtons){
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){}
  }
}

/* -------------------------------------------------------------------------- */
/* DRAWER (desktop/mobile)                                                     */
/* -------------------------------------------------------------------------- */
function openF3DrawerPublic(d, ctx={}){
  if (!window.__TradeliaUI?.openPanel) return;
  const uid = (ctx.uid || 'f3') + '-' + Date.now();
  const sections = buildF3Sections(d);
  const mobile = isMobileViewport();
  const shell = mobile ? renderF3MobileShell(sections, uid) : renderF3DesktopShell(sections, uid);

  window.__TradeliaUI.openPanel({
    title: 'F3 · Analisi Tecnica MTF',
    subtitle: '',
    sections: [{ title:'', body:shell, meta:'' }],
    blocking: false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [{ label:'Chiudi', action: ()=> window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  setTimeout(()=>{
    const panelRoot = document.getElementById('panel-overlay') || document;
    bindF3TabsPublic(panelRoot);

    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(panelRoot.querySelector(`#${uid}-scroll-desktop`)||panelRoot); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(panelRoot.querySelector(`#${uid}-scroll-mobile`)||panelRoot); } catch(e){}
    }

    const first = panelRoot.querySelector('[data-f3-tab="dataset"]') || panelRoot.querySelector('[data-f3-tab]');
    if (first?.click) first.click();
  }, 0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -------------------------------------------------------------------------- */
/* SEZIONI                                                                     */
/* -------------------------------------------------------------------------- */
function buildF3Sections(d){
  // 1) Dataset · Riepilogo tecnico (pattern, MTF, conferme)
  const ds = d.head || {};
  const datasetHTML = `
    <section class="tl-panel-section" data-f3-section="dataset" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Dataset · Riepilogo tecnico</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('BiasMTF_info','Bias MTF','', ds?.BiasMTF)}
        ${metricBlockF3('MTF_Score_info','MTF Score','', ds?.MTF_Score)}
        ${metricBlockF3('P_SwingUp_info','P(SwingUp)','', ds?.P_SwingUp)}
      </div>
      ${listBlockCardF3('Pattern attivi', ds?.PatternsActive)}
      ${listBlockCardF3('Conferme MTF', ds?.Confirmations)}
      ${headlineBlockCardF3('Note AI', ds?.ai_note)}
    </section>`;

  // 2) Setup · Regole e filtri (solo tecnici — niente opzioni)
  const st = d.setup || {};
  const setupHTML = `
    <section class="tl-panel-section" data-f3-section="setup" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Setup · Regole & Filtri</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('TF_Primary_info','Timeframe primario','', st?.TF_Primary)}
        ${metricBlockF3('TF_Confirm_info','Timeframe conferma','', st?.TF_Confirm)}
        ${metricBlockF3('Structure_info','Struttura (BOS/CHOCH)','', st?.Structure)}
        ${metricBlockF3('Liquidity_info','Liquidità (grab/void)','', st?.Liquidity)}
        ${metricBlockF3('Momentum_info','Momentum','', st?.Momentum)}
        ${metricBlockF3('MeanReversion_info','Mean Reversion','', st?.MeanReversion)}
      </div>
      ${listBlockCardF3('Trigger di ingresso', st?.EntryTriggers)}
      ${listBlockCardF3('Conferme (multi‑confluence)', st?.ConfirmRules)}
      ${headlineBlockCardF3('Note implementative', st?.ai_note)}
    </section>`;

  // 3) Segnali · Attivi/Recenti
  const sg = d.signals || {};
  const signalsHTML = `
    <section class="tl-panel-section" data-f3-section="signals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Segnali swing</div></header>
      ${signalsListF3(sg?.Active, 'Attivi')}
      ${signalsListF3(sg?.Recent, 'Recenti')}
      ${headlineBlockCardF3('Criteri di validazione segnali', sg?.ai_note)}
    </section>`;

  // 4) Risk/ATR · gestione operativa (range tecnico descrittivo)
  const rk = d.risk || {};
  const riskHTML = `
    <section class="tl-panel-section" data-f3-section="risk" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Risk/ATR · gestione</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF3('ATR_info','ATR (descrittivo)','', rk?.ATR)}
        ${metricBlockF3('StopLoss_info','Stop suggerito','', rk?.SL_Suggested)}
        ${metricBlockF3('TakeProfit_info','Target','', rk?.TP_Suggested)}
      </div>
      ${listBlockCardF3('Note di gestione', rk?.ai_note)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Valori descrittivi: non costituiscono istruzioni operative o di gestione rischio.</div>
    </section>`;

  // 5) Governance (Audit & MiFID)
  const audit = d.audit_quality || {}; const q = audit?.QualityMetrics || {};
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
      ${headlineBlockCardF3('Informativa', d.mifid?.disclaimer)}
    </section>`;

  return { datasetHTML, setupHTML, signalsHTML, riskHTML, governanceHTML };
}

/* -------------------------------------------------------------------------- */
/* SHELL DESKTOP / MOBILE + TABS                                              */
/* -------------------------------------------------------------------------- */
function renderF3DesktopShell(sections, uid){
  return `
    <div class="f3-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f3-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerBtnF3('dataset','Dataset')}
        ${drawerBtnF3('setup','Setup')}
        ${drawerBtnF3('signals','Segnali')}
        ${drawerBtnF3('risk','Risk/ATR')}
        ${drawerBtnF3('governance','Governance')}
      </aside>
      <main id="${uid}-scroll-desktop" class="f3-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f3-view="dataset">${sections.datasetHTML}</div>
        <div data-f3-view="setup" hidden>${sections.setupHTML}</div>
        <div data-f3-view="signals" hidden>${sections.signalsHTML}</div>
        <div data-f3-view="risk" hidden>${sections.riskHTML}</div>
        <div data-f3-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function renderF3MobileShell(sections, uid){
  const pills = [
    ['dataset','Dataset'],
    ['setup','Setup'],
    ['signals','Segnali'],
    ['risk','Risk/ATR'],
    ['governance','Governance']
  ].map(([k,l])=> mobileTabBtnF3(k,l)).join('');

  return `
    <div class="f3-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      <div class="f1b-footer-tabs-scroll" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;gap:.5rem;overflow-x:auto;">
        ${pills}
      </div>
      <main id="${uid}-scroll-mobile" class="f3-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f3-view="dataset">${sections.datasetHTML}</div>
        <div data-f3-view="setup" hidden>${sections.setupHTML}</div>
        <div data-f3-view="signals" hidden>${sections.signalsHTML}</div>
        <div data-f3-view="risk" hidden>${sections.riskHTML}</div>
        <div data-f3-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function drawerBtnF3(key,label){ return `<button class="f1b-tab-btn" data-f3-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`; }
function mobileTabBtnF3(key,label){ return `<button class="f1b-footer-tab-btn" data-f3-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`; }

function bindF3TabsPublic(root=document){
  const btns = root.querySelectorAll('[data-f3-tab]');
  const views = root.querySelectorAll('[data-f3-view]');
  const desk = root.querySelector('[id$="-scroll-desktop"]');
  const mob  = root.querySelector('[id$="-scroll-mobile"]');
  const menu = root.querySelector('.f3-panel-menu');

  function resetScroll(){ [desk,mob,menu].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; if (el.scrollTo) { try{ el.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_){} } }); }
  function styleTabs(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-f3-tab')===active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f1b-footer-tab-btn')){
        if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
        else { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
      }
    });
  }
  function show(active){
    views.forEach(v=>{
      const k=v.getAttribute('data-f3-view');
      v.hidden = (k!==active);
      if(!v.hidden){
        requestAnimationFrame(()=>{ resetScroll(); v.querySelectorAll('[data-scrollable]').forEach(sc=>{sc.scrollTop=0;sc.scrollLeft=0;}); });
      }
    });
  }
  function activate(k){ styleTabs(k); show(k); }
  btns.forEach(b=>{ if(b.__f3Bound) return; b.__f3Bound=true; b.addEventListener('click',()=> activate(b.getAttribute('data-f3-tab'))); });
}

/* -------------------------------------------------------------------------- */
/* CARD BUILDERS                                                               */
/* -------------------------------------------------------------------------- */
function f3Card({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColorsF3(tone);
  return `
    <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title || '')}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml || ''}</div>
      ${ noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : '' }
    </div>`;
}

function metricBoxTrafficLightF3({ key, label, desc, metric }){
  const { dotColor, textColor } = toneColorsF3(metric?.tone);
  return `
    <div class="flex-1 min-w-[90px]" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:.6rem .75rem;">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
        </div>
        <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
      </div>
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(metric?.raw || '—')}</div>
      ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : ''}
    </div>`;
}

function metricBlockF3(metricKey, title, desc, metricObj){
  const { textColor } = toneColorsF3(metricObj?.tone);
  const value = formatMetricValueF3(metricObj);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>` : ''}
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f3Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function listBlockCardF3(title, body){
  if (!body && body !== 0) return '';
  let tone='neutral', raw='';
  if (Array.isArray(body)) raw = body.map(x=>`• ${String(x)}`).join('\n');
  else if (typeof body==='object'){ tone = body?.tone||'neutral'; raw = body?.raw||''; }
  else raw = String(body);
  return f3Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF3(title, obj){
  if (obj===undefined || obj===null) return '';
  let tone='neutral', raw='';
  if (typeof obj==='string') raw=obj; else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f3Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function qualityChipF3(key, q){
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

function signalsListF3(block, title){
  if (!block) return '';
  const rows = Array.isArray(block?.rows) ? block.rows : [];
  const head = Array.isArray(block?.columns) ? block.columns : ['Ticker','Setup','TF','Conf.','Tone'];
  const cards = rows.map(r=>{
    const [tkr, setup, tf, conf, tone] = [r[0], r[1], r[2], r[3], r[4]];
    const { dotColor, brColor, bgSoft } = toneColorsCardF3(tone);
    return `
      <div class="signal-card" style="border:1px solid ${brColor};border-radius:12px;background:${bgSoft};box-shadow:var(--shadow-card);padding:.6rem .75rem;display:flex;flex-direction:column;gap:.25rem;">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
            <div class="text-[12.5px] font-semibold">${escapeHtml(String(tkr||''))}</div>
          </div>
          <span class="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">${escapeHtml(String(tone||''))}</span>
        </div>
        <div class="grid grid-cols-4 gap-2 text-[12px]">
          <div><div class="text-[10px] text-[color:var(--muted)]">Setup</div><div class="font-mono">${escapeHtml(String(setup||''))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">TF</div><div class="font-mono">${escapeHtml(String(tf||''))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">Conf.</div><div class="font-mono">${escapeHtml(String(conf||''))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">Note</div><div class="truncate">${escapeHtml(String(r[5]||''))}</div></div>
        </div>
      </div>`;
  }).join('');

  return f3Card({ tone: block?.tone || 'neutral', title: title||'Segnali', bodyHtml:`<div class='grid gap-2 md:grid-cols-2'>${cards||'<div class="text-[12px] text-[color:var(--muted)]">N/A</div>'}</div>`, noteHtml:'' });
}

/* -------------------------------------------------------------------------- */
/* NORMALIZZAZIONE DATI                                                        */
/* -------------------------------------------------------------------------- */
function normalizeDataF3Public(src={}){
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? '—',
      module: src?.meta?.module ?? 'F3 · Analisi Tecnica',
      moduleVersion: src?.meta?.moduleVersion ?? 'v1',
      moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? '',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Materiale informativo/educativo. Nessuna raccomandazione personale.'
    },
    head: src?.head || {
      BiasMTF:{ raw:'—', tone:'neutral' },
      MTF_Score:{ raw:'—', tone:'neutral' },
      P_SwingUp:{ raw:'—', tone:'neutral' },
      PatternsActive:[],
      Confirmations:[],
      ai_note:''
    },
    setup: src?.setup || {
      TF_Primary:{ raw:'—', tone:'neutral' },
      TF_Confirm:{ raw:'—', tone:'neutral' },
      Structure:{ raw:'—', tone:'neutral' },
      Liquidity:{ raw:'—', tone:'neutral' },
      Momentum:{ raw:'—', tone:'neutral' },
      MeanReversion:{ raw:'—', tone:'neutral' },
      EntryTriggers:[],
      ConfirmRules:[],
      ai_note:''
    },
    signals: src?.signals || {
      Active:{ tone:'neutral', columns:['Ticker','Setup','TF','Conf.','Tone','Note'], rows:[] },
      Recent:{ tone:'neutral', columns:['Ticker','Setup','TF','Conf.','Tone','Note'], rows:[] },
      ai_note:''
    },
    risk: src?.risk || {
      ATR:{ raw:'—', tone:'neutral' },
      SL_Suggested:{ raw:'—', tone:'neutral' },
      TP_Suggested:{ raw:'—', tone:'neutral' },
      ai_note:''
    },
    audit_quality: (function(){
      const aq = src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} };
      const qm = aq?.QualityMetrics || {};
      if(qm.Coverage && !qm.FreshnessScore){ qm.FreshnessScore = qm.Coverage; }
      return { ...aq, QualityMetrics: qm };
    })(),
    mifid: src?.mifid || { disclaimer:'' }
  };
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */
function toneColorsF3(tone){
  switch((tone||'').toLowerCase()){
    case 'green': return { dotColor:'var(--tone-pos-fg)', textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red': return { dotColor:'var(--tone-neg-fg)', textColor:'var(--tone-neg-fg)' };
    default: return { dotColor:'var(--tone-neu-fg)', textColor:'var(--tone-neu-fg)' };
  }
}
function toneColorsCardF3(tone){
  const t=(tone||'').toLowerCase();
  if (t==='green' || t==='positive') return { dotColor:'var(--tone-pos-fg)', brColor:'color-mix(in oklab, var(--tone-pos-fg) 40%, var(--br-card))', bgSoft:'color-mix(in oklab, var(--tone-pos-fg) 8%, var(--surface-card))' };
  if (t==='red' || t==='negative') return { dotColor:'var(--tone-neg-fg)', brColor:'color-mix(in oklab, var(--tone-neg-fg) 40%, var(--br-card))', bgSoft:'color-mix(in oklab, var(--tone-neg-fg) 8%, var(--surface-card))' };
  if (t==='yellow' || t==='neutral') return { dotColor:'var(--tone-warn-fg)', brColor:'color-mix(in oklab, var(--tone-warn-fg) 40%, var(--br-card))', bgSoft:'color-mix(in oklab, var(--tone-warn-fg) 8%, var(--surface-card))' };
  return { dotColor:'var(--tone-neu-fg)', brColor:'var(--br-card)', bgSoft:'var(--surface-card-alt)' };
}
function truncateF3(s,n){ const str=String(s||''); return str.length>n?str.slice(0,n-1)+'…':str; }
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatMetricValueF3(obj){
  const v=obj?.raw; if(v===null||v===undefined) return '—';
  if(Array.isArray(v)){ const s=JSON.stringify(v); return escapeHtml(s.length>80?s.slice(0,80)+'…':s); }
  if(typeof v==='object'){ const keys=Object.keys(v); if(!keys.length) return '{}'; const compact=keys.slice(0,5).reduce((acc,k)=>{acc[k]=v[k];return acc;},{}); const s=JSON.stringify(compact); return escapeHtml(s.length>100?s.slice(0,100)+'…':s); }
  return escapeHtml(String(v));
}
