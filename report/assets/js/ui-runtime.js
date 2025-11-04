// /report/assets/js/ui-runtime.js
// Runtime UI globale Tradelia AI (NO legal overlay):
// - Overlay analitico (panel) per moduli F*
// - Tooltip metriche "?" (popover desktop / modal mobile)
// - Audit panel (qualità dati)
// Dipendenze: tokens.css (classi tl-panel-*, tl-popover, tl-metric-modal-*, .btn). Nessuna libreria esterna.

(function(){
  const UI = {};
  const ROOT = document.documentElement;

  // -----------------------------
  // Helpers DOM
  // -----------------------------
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const el  = (t, cls, html) => { const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };
  const isMobile = () => matchMedia('(max-width: 768px)').matches;

  function clampPopoverToViewport(pop, x, y){
    const pad = 12;
    const vw = window.innerWidth, vh = window.innerHeight;
    const r  = { w: pop.offsetWidth, h: pop.offsetHeight };
    let left = Math.min(Math.max(x, pad), vw - r.w - pad);
    let top  = Math.min(Math.max(y, pad), vh - r.h - pad);
    pop.style.left = left + 'px';
    pop.style.top  = top + 'px';
  }

  // -----------------------------
  // Glossario cache (tooltip “?”)
  // -----------------------------
  const Glossary = {
    _cache: null,
    async load(){
      if (this._cache) return this._cache;
      try {
        const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
        if(!res.ok) throw new Error('glossary fetch error');
        this._cache = await res.json();
      } catch(e){
        this._cache = { _v:'NA' };
      }
      return this._cache;
    },
    async get(key){
      const g = await this.load();
      return g?.[key] || null;
    }
  };

  // -----------------------------
  // Overlay Analitico (pannello)
  // -----------------------------
  let overlay, desktopPanel, mobilePanel, desktopBody, mobileBody, desktopTitle, mobileTitle, desktopSub, mobileSub, desktopFooter, mobileFooter, backdrop;

  function mountPanelOverlay(){
    if (qs('#panel-overlay')) return; // già creato
    overlay = el('div','tl-panel-overlay noprint'); overlay.id='panel-overlay'; 
    overlay.setAttribute('aria-hidden','true');
    overlay.setAttribute('hidden','');
    overlay.style.display = 'none'; // Inizialmente nascosto

    backdrop = el('div','tl-panel-backdrop'); backdrop.setAttribute('data-panel-close','');
    overlay.appendChild(backdrop);

    // Desktop
    desktopPanel = el('aside','tl-panel tl-panel--desktop');
    desktopPanel.setAttribute('role','dialog'); desktopPanel.setAttribute('aria-modal','true');
    const dHead = el('header','tl-panel__header');
    desktopTitle = el('h2','tl-panel__title'); desktopTitle.id='panel-title'; desktopTitle.textContent='—';
    desktopSub   = el('p','tl-panel__subtitle'); desktopSub.id='panel-subtitle'; desktopSub.textContent='—';
    const dHeadWrap = el('div','min-w-0'); dHeadWrap.append(desktopTitle, desktopSub);
    const dClose = el('button','tl-panel__close', svgX(16)); dClose.setAttribute('data-panel-close',''); dClose.setAttribute('aria-label','Chiudi');
    dHead.append(dHeadWrap, dClose);
    desktopBody   = el('div','tl-panel__body'); desktopBody.id='panel-body';
    desktopFooter = el('footer','tl-panel__footer'); desktopFooter.id='panel-footer'; desktopFooter.append(btnClose());
    desktopPanel.append(dHead, desktopBody, desktopFooter);

    // Mobile
    mobilePanel = el('aside','tl-panel tl-panel--mobile');
    mobilePanel.setAttribute('role','dialog'); mobilePanel.setAttribute('aria-modal','true');
    const mHead = el('header','tl-panel__header');
    mobileTitle = el('h2','tl-panel__title'); mobileTitle.id='panel-title-mobile'; mobileTitle.textContent='—';
    mobileSub   = el('p','tl-panel__subtitle'); mobileSub.id='panel-subtitle-mobile'; mobileSub.textContent='—';
    const mHeadWrap = el('div','min-w-0'); mHeadWrap.append(mobileTitle, mobileSub);
    const mClose = el('button','tl-panel__close', svgX(18)); mClose.setAttribute('data-panel-close',''); mClose.setAttribute('aria-label','Chiudi');
    mHead.append(mHeadWrap, mClose);
    mobileBody   = el('div','tl-panel__body'); mobileBody.id='panel-body-mobile';
    mobileFooter = el('footer','tl-panel__footer'); mobileFooter.id='panel-footer-mobile'; mobileFooter.append(btnClose());
    mobilePanel.append(mHead, mobileBody, mobileFooter);

    overlay.append(desktopPanel, mobilePanel);
    document.body.appendChild(overlay);

    // Deleghe chiusura
    overlay.addEventListener('click', (e)=>{
      const target = e.target;
      if (target.closest('[data-panel-close]') || target === backdrop) closePanel();
    });

    // ESC
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && overlay.getAttribute('aria-hidden')==='false'){ closePanel(); } });
  }

  function btnClose(){ const b = el('button','btn btn-sm'); b.textContent='Chiudi'; b.setAttribute('data-panel-close',''); return b; }
  function svgX(size=16){ return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; }

  function resetScroll(){
    desktopBody && (desktopBody.scrollTop = 0);
    mobileBody && (mobileBody.scrollTop = 0);
  }

  function setFooterButtons(footerEl, buttons=[]){
    footerEl.innerHTML = '';
    (buttons && buttons.length ? buttons : [btnClose()]).forEach(b=>{
      if (typeof b === 'string'){ const span = el('span'); span.innerHTML = b; footerEl.appendChild(span); }
      else footerEl.appendChild(b);
    });
  }

  function openPanel(opts={}){
    mountPanelOverlay();
    const { title='—', subtitle='—', body='', footerButtons=null, panelSize='wide', blocking=false } = opts;

    // Size (opzionale)
    desktopPanel.style.width = panelSize === 'xl' ? 'min(980px,100%)' : 'min(860px,100%)';

    // Contenuti
    desktopTitle.textContent = title; mobileTitle.textContent = title;
    desktopSub.textContent   = subtitle || '—'; mobileSub.textContent = subtitle || '—';
    desktopBody.innerHTML    = body;    mobileBody.innerHTML = body;

    setFooterButtons(desktopFooter, footerButtons);
    setFooterButtons(mobileFooter,  footerButtons);

    // Blocca scroll pagina se blocking
    document.body.style.overflow = blocking ? 'hidden' : '';

    // Mostra overlay e panel
    overlay.removeAttribute('hidden');
    overlay.setAttribute('aria-hidden','false');
    overlay.style.display = 'flex'; // Forza display

    // Variante corretta
    if (isMobile()){
      desktopPanel.style.display='none'; 
      mobilePanel.style.display='flex';
      mobilePanel.removeAttribute('hidden');
      console.log('[UI Runtime] Mobile panel aperto, display:', mobilePanel.style.display, 'hidden:', mobilePanel.hasAttribute('hidden'));
    } else {
      desktopPanel.style.display='flex'; 
      mobilePanel.style.display='none';
      desktopPanel.removeAttribute('hidden');
    }

    resetScroll();
    // Tooltips anche dentro il pannello
    try { UI.bindMetricInfoButtons(desktopBody); UI.bindMetricInfoButtons(mobileBody); } catch(e){}
    
    // Bind tabs se presenti (sia desktop che mobile) - usa requestAnimationFrame per attendere rendering DOM
    requestAnimationFrame(() => {
      const desktopTabs = desktopBody.querySelector('.metric-tabs-container');
      const mobileTabs = mobileBody.querySelector('.metric-tabs-container');
      if (desktopTabs) bindMetricTabs(desktopBody, desktopTabs.getAttribute('data-key'));
      if (mobileTabs) bindMetricTabs(mobileBody, mobileTabs.getAttribute('data-key'));
    });
  }

  function closePanel(){
    if (!overlay) return;
    
    // Cleanup mobile drawer listeners se presenti
    const mobileDrawer = qs('.metrics-drawer-mobile');
    if (mobileDrawer) {
      if (mobileDrawer._mobileDrawerCleanup) {
        mobileDrawer._mobileDrawerCleanup();
      }
      if (mobileDrawer._tabObserver) {
        mobileDrawer._tabObserver.disconnect();
        delete mobileDrawer._tabObserver;
      }
    }
    
    overlay.setAttribute('aria-hidden','true');
    overlay.setAttribute('hidden',''); // Nascondi anche con attributo hidden
    overlay.style.display = 'none'; // Forza display none
    document.body.style.overflow = '';
    resetScroll();
    // Reset currentMetricsDrawer quando si chiude il drawer
    currentMetricsDrawer = null;
  }

  // -----------------------------
  // Audit Panel (qualità dati)
  // -----------------------------
  function openAuditPanel(auditData={}){
    const { AuditPathID='—', QualityMetrics={}, Notes=[] } = auditData || {};
    const qm = (k)=> (QualityMetrics && (QualityMetrics[k] ?? '—'));
    openPanel({
      title: 'Audit & Qualità Dati',
      subtitle: AuditPathID !== '—' ? `Path: ${AuditPathID}` : '—',
      panelSize: 'xl',
      body: `
        <div class="grid gap-4">
          <div class="card">
            <h3 class="text-[15px] font-semibold mb-2">Metriche qualità</h3>
            <div class="grid sm:grid-cols-3 gap-3 text-[13px]">
              <div><div class="text-[color:var(--muted)]">Freshness</div><div>${qm('FreshnessScore')||'—'}</div></div>
              <div><div class="text-[color:var(--muted)]">Confidence</div><div>${qm('ConfidenceFinal')||'—'}</div></div>
              <div><div class="text-[color:var(--muted)]">Data Integrity</div><div>${qm('DataIntegrity')||'—'}</div></div>
            </div>
          </div>
          <div class="card">
            <h3 class="text-[15px] font-semibold mb-2">Note</h3>
            <ul class="text-[13px] text-[color:var(--ink-soft)] list-disc pl-5">
              ${(Notes||[]).map(x=>`<li>${String(x)}</li>`).join('') || '<li>Nessuna nota.</li>'}
            </ul>
          </div>
        </div>
      `
    });
  }

  // -----------------------------
  // Metriche: popup singolo e catalogo
  // -----------------------------
  async function openMetricPopup(key){
    const g = await Glossary.get(key);
    if (!g) return;
    
    // Usa tabs [What] [How] [Source] sia mobile che desktop
    const tabsId = `metric-tabs-${key}`;
    const body = `
      <div class="metric-tabs-container" data-key="${key}">
        <nav class="metric-tabs-nav" role="tablist">
          <button class="metric-tab active" role="tab" data-tab="what" aria-selected="true">What</button>
          <button class="metric-tab" role="tab" data-tab="how" aria-selected="false">How</button>
          <button class="metric-tab" role="tab" data-tab="source" aria-selected="false">Source</button>
        </nav>
        <div class="metric-tabs-content">
          <div class="metric-tab-panel active" data-panel="what" role="tabpanel">
            <div class="metric-tab-panel-content">${g.what || '—'}</div>
          </div>
          <div class="metric-tab-panel" data-panel="how" role="tabpanel" hidden>
            <div class="metric-tab-panel-content">${g.how || '—'}</div>
          </div>
          <div class="metric-tab-panel" data-panel="source" role="tabpanel" hidden>
            <div class="metric-tab-panel-content">${g.source || '—'}</div>
          </div>
        </div>
      </div>
    `;

    if (isMobile()){
      showModal({ title: g.title || key, body: body, key: key });
    } else {
      openPanel({
        title: g.title || key,
        subtitle: 'Glossario metrica',
        panelSize: 'wide',
        body: body
      });
    }
  }

  async function openMetricsCatalog(keys){
    const g = await Glossary.load();
    const list = (Array.isArray(keys) && keys.length) ? keys : Object.keys(g||{}).filter(k=>!k.startsWith('_'));
    const rows = list.map(k=>{
      const m = g[k] || {};
      return `
        <tr>
          <td class="py-2 pr-3"><div class="metric-btn pill--neutral">${m.title || k}</div></td>
          <td class="py-2 pr-3 text-[13px]">${m.what || '—'}</td>
          <td class="py-2 pr-3 text-[13px] text-[color:var(--muted)]">${m.source || ''}</td>
        </tr>`;
    }).join('');
    openPanel({
      title: 'Glossario metriche',
      subtitle: `${list.length} voci`,
      panelSize: 'xl',
      body: `
        <div class="overflow-auto">
          <table class="min-w-full text-left text-[13px]">
            <thead>
              <tr class="text-[color:var(--muted)]">
                <th class="py-2 pr-3">Metrica</th>
                <th class="py-2 pr-3">What</th>
                <th class="py-2 pr-3">Source</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `
    });
  }

  // -----------------------------
  // Tooltip metriche ("?")
  // -----------------------------
  let popover, popTitle, popBody, popSource, popClose, modal, modalTitle, modalBody, modalSource;

  function mountTooltips(){
    if (!qs('#metric-popover')){
      popover   = el('div','tl-popover noprint'); popover.id='metric-popover'; popover.setAttribute('role','tooltip'); popover.setAttribute('aria-hidden','true');
      const head= el('div','tl-popover__head');
      popClose  = el('button','tl-popover__close', svgX(14)); popClose.id='metric-popover-close'; popClose.setAttribute('aria-label','Chiudi');
      popTitle  = el('div','tl-popover__title'); popTitle.id='metric-popover-title'; popTitle.textContent='—';
      head.append(popClose, popTitle);
      popBody   = el('div','tl-popover__body');   popBody.id='metric-popover-body'; popBody.textContent='—';
      popSource = el('div','tl-popover__source'); popSource.id='metric-popover-source'; popSource.textContent='—';
      popover.append(head, popBody, popSource);
      document.body.appendChild(popover);
      popClose.addEventListener('click', ()=> hidePopover());
      window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hidePopover(); });
      window.addEventListener('scroll', ()=> hidePopover(), { passive:true });
      window.addEventListener('resize', ()=> hidePopover());
    }
    if (!qs('#metric-modal')){
      const wrap = el('div','tl-metric-modal-overlay noprint'); wrap.id='metric-modal'; wrap.setAttribute('aria-hidden','true');
      const backdrop = el('div','tl-metric-modal-backdrop'); backdrop.setAttribute('data-metric-close','');
      const box = el('div','tl-metric-modal'); box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-labelledby','metric-modal-title');
      const header = el('header','tl-metric-modal__header');
      modalTitle = el('div','tl-metric-modal__title'); modalTitle.id='metric-modal-title'; modalTitle.textContent='—';
      modalSource= el('div','tl-metric-modal__source'); modalSource.id='metric-modal-source'; modalSource.textContent='—';
      const hwrap = el('div','min-w-0'); hwrap.append(modalTitle, modalSource);
      const x = el('button','tl-metric-modal__close', svgX(18)); x.setAttribute('data-metric-close',''); x.setAttribute('aria-label','Chiudi');
      header.append(hwrap,x);
      modalBody  = el('div','tl-metric-modal__body'); modalBody.id='metric-modal-body'; modalBody.textContent='—';
      box.append(header, modalBody);
      wrap.append(backdrop, box);
      document.body.appendChild(wrap);
      wrap.addEventListener('click', (e)=>{ if(e.target.hasAttribute('data-metric-close')) hideModal(); if(e.target===wrap) hideModal(); });
      window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideModal(); });
      modal = wrap;
    }
  }

  function showPopoverFor(btn, data){
    mountTooltips();
    const rect = btn.getBoundingClientRect();
    popTitle.textContent  = data?.title || btn.getAttribute('data-metric') || '—';
    popBody.innerHTML     = (data?.what || '—') + (data?.how ? `<div style="margin-top:.5rem">${data.how}</div>` : '');
    popSource.textContent = data?.source || '';
    popover.setAttribute('aria-hidden','false');
    const x = rect.left + rect.width + 8;
    const y = rect.top - 8;
    clampPopoverToViewport(popover, x, y);
  }
  function hidePopover(){ if(popover) popover.setAttribute('aria-hidden','true'); }

  function showModal(data){
    // Evita di aprire modal se il drawer è aperto o se non ci sono dati
    if (!data || (!data.body && !data.what && !data.how)) {
      console.warn('[UI Runtime] showModal chiamato senza dati validi:', data);
      return;
    }
    
    // Evita di aprire modal se il panel mobile è aperto (perché useremo il drawer)
    if (isMobile() && mobilePanel && mobilePanel.style.display !== 'none' && !mobilePanel.hasAttribute('hidden')) {
      console.log('[UI Runtime] showModal evitato: panel mobile è aperto');
      return;
    }
    
    mountTooltips();
    modalTitle.textContent  = data?.title || '—';
    modalSource.textContent = data?.source || '';
      // Se body è fornito, usalo (per tabs), altrimenti costruisci HTML legacy
    if (data?.body) {
      modalBody.innerHTML = data.body;
      // Bind tabs dopo inserimento HTML - usa requestAnimationFrame per attendere rendering DOM
      requestAnimationFrame(() => bindMetricTabs(modalBody, data.key));
    } else {
      modalBody.innerHTML = (data?.what || '—') + (data?.how ? `<div style="margin-top:.75rem">${data.how}</div>` : '');
    }
    modal.setAttribute('aria-hidden','false');
  }

  function bindMetricTabs(container, key){
    const tabsContainer = container.querySelector('.metric-tabs-container');
    if (!tabsContainer) {
      console.warn('[UI Runtime] bindMetricTabs: tabsContainer non trovato');
      return;
    }
    
    // Rimuovi listener esistenti usando delegation invece di listener diretti
    const tabs = tabsContainer.querySelectorAll('.metric-tab');
    const panels = tabsContainer.querySelectorAll('.metric-tab-panel');
    
    if (tabs.length === 0 || panels.length === 0) {
      console.warn('[UI Runtime] bindMetricTabs: tabs o panels non trovati');
      return;
    }
    
    // Usa event delegation sul container per evitare listener duplicati
    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.metric-tab');
      if (!tab) return;
      
      e.preventDefault();
      e.stopPropagation();
      const tabName = tab.getAttribute('data-tab');
      console.log('[UI Runtime] bindMetricTabs: click su tab:', tabName);
      
      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      // Update panels
      panels.forEach(p => {
        const panelName = p.getAttribute('data-panel');
        if (panelName === tabName) {
          p.classList.add('active');
          p.removeAttribute('hidden');
        } else {
          p.classList.remove('active');
          p.setAttribute('hidden', '');
        }
      });
    }, { passive: false });
    
    // Swipe gesture per mobile
    if (isMobile() && key) {
      setupSwipeGesture(tabsContainer, tabs);
    }
  }

  function setupSwipeGesture(container, tabs){
    let startX = 0, startY = 0, isDragging = false;
    
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Solo swipe orizzontale
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        e.preventDefault();
        const activeTab = Array.from(tabs).findIndex(t => t.classList.contains('active'));
        let nextTab = activeTab;
        
        if (diffX > 0 && activeTab > 0) {
          // Swipe right → tab precedente
          nextTab = activeTab - 1;
        } else if (diffX < 0 && activeTab < tabs.length - 1) {
          // Swipe left → tab successivo
          nextTab = activeTab + 1;
        }
        
        if (nextTab !== activeTab) {
          tabs[nextTab].click();
        }
        isDragging = false;
      }
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
      isDragging = false;
    }, { passive: true });
  }
  function hideModal(){ if(modal) modal.setAttribute('aria-hidden','true'); }

  UI.bindMetricInfoButtons = function(root=document){
    mountTooltips();
    qsa('.info-btn, .info-btn--mini', root).forEach(btn=>{
      // Salta elementi che hanno già un handler personalizzato
      if (btn.dataset.metricClickHandler === 'true' || btn.hasAttribute('data-metric-click-handler')) {
        console.log('[UI Runtime] bindMetricInfoButtons - skip elemento con handler personalizzato:', btn);
        return;
      }
      btn.addEventListener('click', async (e)=>{
        e.stopPropagation();
        const key = btn.getAttribute('data-metric');
        console.log('[UI Runtime] bindMetricInfoButtons - click su info-btn:', key, 'isMobile:', isMobile());
        // Evita di aprire modal se il panel mobile è aperto (perché useremo il drawer)
        if (isMobile() && mobilePanel && mobilePanel.style.display !== 'none' && !mobilePanel.hasAttribute('hidden')) {
          console.log('[UI Runtime] bindMetricInfoButtons - evitato modal: panel mobile è aperto');
          return;
        }
        const data = await Glossary.get(key);
        if (!data || (!data.what && !data.how && !data.body)) {
          console.warn('[UI Runtime] bindMetricInfoButtons - dati metriche vuoti per:', key);
          return;
        }
        if (isMobile()) showModal(data);
        else showPopoverFor(btn, data);
      }, { passive:false });
    });
  };

  // -----------------------------
  // Drawer Metriche (con categorie) - Centralizzato
  // -----------------------------
  
  // Categorie metriche
  function getMetricCategory(key) {
    const categories = {
      'azienda': ['CompanyName', 'Ticker', 'ISIN', 'Sector', 'Venue'],
      'prezzo': ['Price', 'ChangePct'],
      'qualità': ['Freshness', 'ConfidenceFinal', 'DataIntegrity', 'FeedSync', 'State'],
      'temporale': ['Start', 'End', 'UpdatedAt', 'Version']
    };
    
    for (const [cat, keys] of Object.entries(categories)) {
      if (keys.includes(key)) return cat;
    }
    return 'altro';
  }

  // Libri consigliati per categoria (hardcoded)
  const RECOMMENDED_BOOKS = {
    'azienda': [
      { title: 'Analisi fondamentale', url: 'https://example.com/fundamental', author: 'Autore 1' },
      { title: 'Valutazione aziende', url: 'https://example.com/valuation', author: 'Autore 2' }
    ],
    'prezzo': [
      { title: 'Trading tecnico', url: 'https://example.com/technical', author: 'Autore 3' },
      { title: 'Mercati finanziari', url: 'https://example.com/markets', author: 'Autore 4' }
    ],
    'qualità': [
      { title: 'Data quality', url: 'https://example.com/data-quality', author: 'Autore 5' },
      { title: 'Analisi dati', url: 'https://example.com/data-analysis', author: 'Autore 6' }
    ],
    'temporale': [
      { title: 'Time series analysis', url: 'https://example.com/time-series', author: 'Autore 7' }
    ],
    'altro': [
      { title: 'Finanza generale', url: 'https://example.com/finance', author: 'Autore 8' }
    ]
  };

  // Store globale per drawer metriche
  let currentMetricsData = null;
  let currentMetricsDrawer = null;

  // Fetch glossario entry
  async function fetchGlossaryEntry(key) {
    try {
      const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      return json[key] || null;
    } catch {
      return null;
    }
  }

  // Apri drawer metriche (funzione principale)
  async function openMetricsDrawer(data) {
    console.log('[UI Runtime] openMetricsDrawer chiamata con data:', !!data, 'metricsPanel:', !!data?.metricsPanel);
    const list = Array.isArray(data.metricsPanel) ? data.metricsPanel : [];
    const isMobileView = isMobile();
    console.log('[UI Runtime] openMetricsDrawer - list length:', list.length, 'isMobileView:', isMobileView);
    
    if (list.length === 0) {
      console.warn('[UI Runtime] openMetricsDrawer - nessuna metrica trovata in data.metricsPanel');
      return Promise.resolve();
    }
    
    // Carica tutte le definizioni del glossario e aggiungi categoria
    const metricsWithGlossary = await Promise.all(
      list.map(async (m) => {
        const g = await fetchGlossaryEntry(m.key);
        const category = getMetricCategory(m.key);
        return { ...m, glossary: g || {}, category };
      })
    );

    // Raggruppa metriche per categoria
    const metricsByCategory = {};
    metricsWithGlossary.forEach(m => {
      if (!metricsByCategory[m.category]) {
        metricsByCategory[m.category] = [];
      }
      metricsByCategory[m.category].push(m);
    });

    const categories = ['azienda', 'prezzo', 'qualità', 'temporale', 'altro'].filter(cat => 
      metricsByCategory[cat] && metricsByCategory[cat].length > 0
    );

    // Store globale per aprire da click su metrica
    currentMetricsData = {
      metricsWithGlossary,
      metricsByCategory,
      categories
    };

    // Mobile: doppio drawer con swipe
    if (isMobileView) {
      return openMobileMetricsDrawer(data, metricsWithGlossary, metricsByCategory, categories);
    } else {
      // Desktop: drawer 3 colonne
      return openDesktopMetricsDrawer(data, metricsWithGlossary, metricsByCategory, categories);
    }
  }

  // Mobile: doppio drawer con swipe
  function openMobileMetricsDrawer(data, metricsWithGlossary, metricsByCategory, categories) {
    const activeCategory = categories[0] || 'azienda';
    const activeMetrics = metricsByCategory[activeCategory] || [];
    
    const categoryTabs = categories.map(cat => `
      <button class="metric-category-tab ${cat === activeCategory ? 'active' : ''}" 
              data-category="${cat}"
              role="tab"
              aria-selected="${cat === activeCategory ? 'true' : 'false'}"
              aria-controls="metrics-list-${cat}"
              type="button">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    const metricsList = activeMetrics.map((m, idx) => `
      <div class="metric-list-item swipeable" data-metric-key="${m.key}" data-metric-index="${idx}">
        <div class="metric-list-item__content">
          <div class="metric-list-item__label">${m.label || m.key}</div>
          <div class="metric-list-item__value">${m.value ?? '—'}</div>
        </div>
        <div class="metric-list-item__swipe-hint">→</div>
      </div>
    `).join('');

    const body = `
      <div class="metrics-drawer-mobile">
        <div class="metrics-drawer-1 active">
          <nav class="metric-category-tabs" role="tablist" aria-label="Categorie metriche">
            ${categoryTabs}
          </nav>
          <div class="metrics-list-container">
            <div class="metrics-list" data-category="${activeCategory}">
              ${metricsList}
            </div>
          </div>
        </div>
        <div class="metrics-drawer-2" id="metrics-drawer-2">
          <div class="metrics-drawer-2__header">
            <button class="metrics-drawer-2__back" aria-label="Torna all'elenco">←</button>
            <div class="metrics-drawer-2__title"></div>
          </div>
          <div class="metrics-drawer-2__content"></div>
        </div>
      </div>
    `;

    console.log('[UI Runtime] openMobileMetricsDrawer - body HTML length:', body.length);
    console.log('[UI Runtime] openMobileMetricsDrawer - mobileBody prima:', mobileBody?.innerHTML?.substring(0, 100));
    
    openPanel({
      title: 'Metriche header',
      subtitle: data.meta?.auditPathId || '—',
      panelSize: 'xl',
      body: body
    });

    console.log('[UI Runtime] openMobileMetricsDrawer - mobileBody dopo openPanel:', mobileBody?.innerHTML?.substring(0, 200));
    console.log('[UI Runtime] openMobileMetricsDrawer - drawer nel mobileBody:', !!mobileBody?.querySelector('.metrics-drawer-mobile'));

    // Bind drawer mobile - usa MutationObserver invece di retry multipli
    return new Promise((resolve) => {
      const maxWait = 2000; // 2 secondi massimo
      const startTime = Date.now();
      
      const checkPanel = () => {
        const drawer = mobileBody?.querySelector('.metrics-drawer-mobile');
        const drawerInDoc = qs('.metrics-drawer-mobile');
        
        if (drawer && mobilePanel && mobilePanel.style.display !== 'none' && !mobilePanel.hasAttribute('hidden')) {
          // Assicura che drawer1 sia attivo all'apertura
          const drawer1 = drawer.querySelector('.metrics-drawer-1');
          const drawer2 = drawer.querySelector('#metrics-drawer-2');
          if (drawer1 && drawer2) {
            drawer1.classList.add('active');
            drawer2.classList.remove('active');
          }
          setupMobileMetricsDrawer(metricsWithGlossary, metricsByCategory, categories);
          resolve();
          return true;
        }
        
        // Se il drawer esiste nel documento ma non nel body, prova comunque
        if (drawerInDoc && Date.now() - startTime > 100) {
          setupMobileMetricsDrawer(metricsWithGlossary, metricsByCategory, categories);
          resolve();
          return true;
        }
        
        return false;
      };
      
      // Prova immediatamente
      if (checkPanel()) return;
      
      // Usa MutationObserver per attendere inserimento
      const observer = new MutationObserver(() => {
        if (checkPanel()) {
          observer.disconnect();
        } else if (Date.now() - startTime > maxWait) {
          observer.disconnect();
          // Prova comunque con drawer dal documento
          const drawerInDoc = qs('.metrics-drawer-mobile');
          if (drawerInDoc) {
            setupMobileMetricsDrawer(metricsWithGlossary, metricsByCategory, categories);
          }
          resolve();
        }
      });
      
      if (mobileBody) {
        observer.observe(mobileBody, { childList: true, subtree: true });
      }
      
      // Timeout di sicurezza
      setTimeout(() => {
        observer.disconnect();
        if (!checkPanel()) {
          resolve(); // Resolve comunque per non bloccare
        }
      }, maxWait);
    });
  }

  // Desktop: drawer 3 colonne
  function openDesktopMetricsDrawer(data, metricsWithGlossary, metricsByCategory, categories) {
    const firstCategory = categories[0] || 'azienda';
    const firstCategoryMetrics = metricsByCategory[firstCategory] || [];
    const firstMetric = firstCategoryMetrics[0] || metricsWithGlossary[0] || {};

    const categoryList = categories.map(cat => `
      <button class="metric-category-item ${cat === firstCategory ? 'active' : ''}" data-category="${cat}">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    const metricsList = firstCategoryMetrics.map(m => `
      <button class="metric-item ${m.key === firstMetric.key ? 'active' : ''}" data-metric-key="${m.key}">
        <div class="metric-item__label">${m.label || m.key}</div>
        <div class="metric-item__value">${m.value ?? '—'}</div>
      </button>
    `).join('');

    const books = RECOMMENDED_BOOKS[firstMetric.category || 'altro'] || [];
    const booksHtml = books.map(book => `
      <div class="recommended-book">
        <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
          <div class="recommended-book__title">${book.title}</div>
          <div class="recommended-book__author">${book.author}</div>
        </a>
      </div>
    `).join('');

    const body = `
      <div class="metrics-drawer-desktop">
        <div class="metrics-drawer-desktop__categories">
          <div class="metrics-drawer-desktop__section-title">Categorie</div>
          <nav class="metrics-drawer-desktop__categories-list">
            ${categoryList}
          </nav>
        </div>
        <div class="metrics-drawer-desktop__metrics">
          <div class="metrics-drawer-desktop__section-title">Metriche</div>
          <div class="metrics-drawer-desktop__metrics-list" data-category="${firstCategory}">
            ${metricsList}
          </div>
        </div>
        <div class="metrics-drawer-desktop__content">
          <div class="metrics-drawer-desktop__content-header">
            <div class="metrics-drawer-desktop__content-title">${firstMetric.label || firstMetric.key || '—'}</div>
          </div>
          <div class="metrics-drawer-desktop__content-body">
            <div class="metric-content-desktop" data-key="${firstMetric.key || ''}">
              <div class="metric-content-section">
                <h3 class="metric-content-section__title">What</h3>
                <div class="metric-content-section__body">${firstMetric.glossary.what || '—'}</div>
              </div>
              <div class="metric-content-section">
                <h3 class="metric-content-section__title">How</h3>
                <div class="metric-content-section__body">${firstMetric.glossary.how || '—'}</div>
              </div>
              <div class="metric-content-section">
                <h3 class="metric-content-section__title">Source</h3>
                <div class="metric-content-section__body">${firstMetric.glossary.source || '—'}</div>
              </div>
            </div>
            ${books.length > 0 ? `
              <div class="recommended-books">
                <div class="recommended-books__title">Libri consigliati</div>
                <div class="recommended-books__list">
                  ${booksHtml}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    openPanel({
      title: 'Metriche header',
      subtitle: data.meta?.auditPathId || '—',
      panelSize: 'xl',
      body: body
    });

    // Bind drawer desktop - usa MutationObserver invece di setTimeout
    return new Promise((resolve) => {
      const maxWait = 2000; // 2 secondi massimo
      const startTime = Date.now();
      
      const checkAndSetup = () => {
        const drawer = qs('.metrics-drawer-desktop');
        if (drawer) {
          currentMetricsDrawer = setupDesktopMetricsDrawer(metricsWithGlossary, metricsByCategory, categories);
          resolve();
          return true;
        }
        return false;
      };
      
      // Prova immediatamente
      if (checkAndSetup()) return;
      
      // Usa MutationObserver per attendere inserimento
      const observer = new MutationObserver(() => {
        if (checkAndSetup()) {
          observer.disconnect();
        } else if (Date.now() - startTime > maxWait) {
          observer.disconnect();
          resolve(); // Resolve comunque per non bloccare
        }
      });
      
      if (desktopBody) {
        observer.observe(desktopBody, { childList: true, subtree: true });
      }
      
      // Timeout di sicurezza
      setTimeout(() => {
        observer.disconnect();
        if (!checkAndSetup()) {
          resolve(); // Resolve comunque per non bloccare
        }
      }, maxWait);
    });
  }

  // Setup drawer mobile con swipe gesture
  function setupMobileMetricsDrawer(metricsWithGlossary, metricsByCategory, categories) {
    const container = qs('.metrics-drawer-mobile');
    if (!container) {
      console.warn('[UI Runtime] setupMobileMetricsDrawer: container non trovato');
      return;
    }

    // Evita setup multipli: rimuovi listener esistenti se presenti
    if (container.dataset.mobileDrawerSetup === 'true') {
      console.log('[UI Runtime] setupMobileMetricsDrawer: già inizializzato, skip');
      return;
    }
    container.dataset.mobileDrawerSetup = 'true';

    const drawer1 = container.querySelector('.metrics-drawer-1');
    const drawer2 = container.querySelector('#metrics-drawer-2');
    if (!drawer1 || !drawer2) {
      console.warn('[UI Runtime] setupMobileMetricsDrawer: drawer1 o drawer2 non trovati');
      return;
    }

    const metricsList = container.querySelector('.metrics-list');
    const backBtn = drawer2.querySelector('.metrics-drawer-2__back');
    const drawer2Title = drawer2.querySelector('.metrics-drawer-2__title');
    const drawer2Content = drawer2.querySelector('.metrics-drawer-2__content');

    if (!metricsList || !backBtn || !drawer2Title || !drawer2Content) {
      console.warn('[UI Runtime] setupMobileMetricsDrawer: elementi non trovati');
      return;
    }

    console.log('[UI Runtime] setupMobileMetricsDrawer: inizializzato');
    console.log('[UI Runtime] setupMobileMetricsDrawer - container:', !!container, 'drawer1:', !!drawer1, 'drawer2:', !!drawer2);
    console.log('[UI Runtime] setupMobileMetricsDrawer - metricsList:', !!metricsList, 'backBtn:', !!backBtn);
    
    // Verifica che i tab siano presenti
    const initialTabs = container.querySelectorAll('.metric-category-tab');
    console.log('[UI Runtime] setupMobileMetricsDrawer - tab iniziali trovati:', initialTabs.length);

    // Handler per cambio categoria - funzione separata per maggiore chiarezza
    const handleCategoryChange = (category, tabElement) => {
      console.log('[UI Runtime] Mobile - handleCategoryChange chiamato:', category);
      const currentCategory = metricsList.getAttribute('data-category');
      if (currentCategory === category) {
        console.log('[UI Runtime] Mobile - Categoria già attiva, skip aggiornamento');
        return;
      }
      const metrics = metricsByCategory[category] || [];
      
      // Assicura che drawer1 sia visibile quando si cambia categoria
      if (drawer1 && drawer2) {
        drawer1.classList.add('active');
        drawer2.classList.remove('active');
      }
      
      // Update active tab
      container.querySelectorAll('.metric-category-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      if (tabElement) {
        tabElement.classList.add('active');
        tabElement.setAttribute('aria-selected', 'true');
      }
      
      // Update metrics list
      metricsList.setAttribute('data-category', category);
      console.log('[UI Runtime] Mobile - Aggiornamento lista metriche, categoria:', category, 'metriche:', metrics.length);
      
      // Reset scroll position prima di aggiornare contenuto
      const metricsListContainer = container.querySelector('.metrics-list-container');
      if (metricsListContainer) {
        metricsListContainer.scrollTop = 0;
      }
      
      // Aggiorna lista metriche con tabindex per keyboard navigation
      metricsList.innerHTML = metrics.length > 0 ? metrics.map((m, idx) => `
        <div class="metric-list-item swipeable" 
             data-metric-key="${m.key}" 
             data-metric-index="${idx}"
             tabindex="${idx === 0 ? '0' : '-1'}"
             role="button"
             aria-label="Apri dettaglio ${m.label || m.key}"
             aria-describedby="metric-value-${m.key}">
          <div class="metric-list-item__content">
            <div class="metric-list-item__label">${m.label || m.key}</div>
            <div class="metric-list-item__value" id="metric-value-${m.key}">${m.value ?? '—'}</div>
          </div>
          <div class="metric-list-item__swipe-hint" aria-hidden="true">→</div>
        </div>
      `).join('') : '<div class="metric-list-item" style="padding: 2rem; text-align: center; color: var(--muted);" role="status" aria-live="polite">Nessuna metrica disponibile</div>';
      
      // Scroll to top e re-bind swipe gesture dopo che il DOM è aggiornato
      requestAnimationFrame(() => {
        // Force scroll reset
        if (metricsListContainer) {
          metricsListContainer.scrollTop = 0;
          metricsListContainer.scrollTo({ top: 0, behavior: 'instant' });
        }
        // Assicura che drawer1 sia ancora attivo dopo l'aggiornamento
        if (drawer1 && drawer2) {
          drawer1.classList.add('active');
          drawer2.classList.remove('active');
        }
        setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content);
        
        // Focus management: focus sulla prima metrica della nuova categoria
        const firstMetric = metricsList.querySelector('.metric-list-item.swipeable');
        if (firstMetric) {
          firstMetric.setAttribute('tabindex', '0');
          // Usa setTimeout per evitare conflitti con animazioni
          setTimeout(() => {
            firstMetric.focus({ preventScroll: true });
          }, 100);
        }
        
        console.log('[UI Runtime] Mobile - Categoria cambiata con successo:', category, 'drawer1 active:', drawer1?.classList.contains('active'));
      });
    };

    // Attacca listener DIRETTI sui tab categoria per maggiore affidabilità
    const attachTabListeners = () => {
      const categoryTabs = container.querySelectorAll('.metric-category-tab');
      console.log('[UI Runtime] setupMobileMetricsDrawer - tab trovati:', categoryTabs.length);
      
      if (categoryTabs.length === 0) {
        console.warn('[UI Runtime] setupMobileMetricsDrawer - Nessun tab trovato!');
        return [];
      }
      
      const tabsArray = Array.from(categoryTabs);
      tabsArray.forEach((tab, idx) => {
        // Rimuovi listener precedenti se esistono
        if (tab._categoryTabHandler) {
          tab.removeEventListener('click', tab._categoryTabHandler);
          tab.removeEventListener('touchend', tab._categoryTabHandler);
        }
        
        const handler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const category = tab.getAttribute('data-category') || tab.dataset.category;
          console.log('[UI Runtime] Mobile - Tab click diretto:', category, 'tab index:', idx, 'event type:', e.type, 'tab:', tab);
          if (category) {
            handleCategoryChange(category, tab);
          } else {
            console.warn('[UI Runtime] Mobile - Tab senza categoria!', tab, 'attributes:', Array.from(tab.attributes).map(a => `${a.name}="${a.value}"`).join(', '));
          }
        };
        
        tab._categoryTabHandler = handler;
        // Attacca sia click che touchend per mobile
        tab.addEventListener('click', handler, { passive: false, capture: false });
        tab.addEventListener('touchend', handler, { passive: false, capture: false });
        // Aggiungi anche touchstart per maggiore compatibilità
        tab.addEventListener('touchstart', (e) => {
          // Non fare nulla, solo per evitare che altri handler interferiscano
        }, { passive: true });
        console.log('[UI Runtime] setupMobileMetricsDrawer - listener attaccato su tab:', tab.getAttribute('data-category'), 'index:', idx, 'tab element:', tab);
      });
      
      return tabsArray;
    };
    
    // Attacca listener immediatamente
    let categoryTabs = attachTabListeners();
    
    // Se non ci sono tab, riprova più volte con delay crescenti
    if (categoryTabs.length === 0) {
      console.warn('[UI Runtime] setupMobileMetricsDrawer - Nessun tab trovato inizialmente, riprovo...');
      const retryTabs = () => {
        categoryTabs = attachTabListeners();
        if (categoryTabs.length === 0) {
          console.warn('[UI Runtime] setupMobileMetricsDrawer - Ancora nessun tab, riprovo dopo 100ms...');
          setTimeout(() => {
            categoryTabs = attachTabListeners();
            if (categoryTabs.length === 0) {
              console.error('[UI Runtime] setupMobileMetricsDrawer - CRITICO: Nessun tab trovato anche dopo delay!');
              // Prova comunque ad attaccare listener su container per event delegation
              console.log('[UI Runtime] setupMobileMetricsDrawer - Uso solo event delegation come fallback');
            } else {
              console.log('[UI Runtime] setupMobileMetricsDrawer - Tab trovati al secondo tentativo:', categoryTabs.length);
            }
          }, 100);
        } else {
          console.log('[UI Runtime] setupMobileMetricsDrawer - Tab trovati al primo retry:', categoryTabs.length);
        }
      };
      requestAnimationFrame(retryTabs);
    } else {
      console.log('[UI Runtime] setupMobileMetricsDrawer - Tab trovati immediatamente:', categoryTabs.length);
    }

    // Handler unificato per tutti i click sul container (fallback/backup)
    const handleContainerClick = (e) => {
      // Check per tab categoria - supporta click su button o su elementi interni
      const tab = e.target.closest('.metric-category-tab');
      if (tab) {
        e.preventDefault();
        e.stopPropagation();
        const category = tab.getAttribute('data-category') || tab.dataset.category;
        if (!category) {
          console.warn('[UI Runtime] Mobile - Tab senza categoria nel container click!', tab);
          return;
        }

        console.log('[UI Runtime] Mobile - Click categoria (delegation):', category, 'has direct handler:', !!tab._categoryTabHandler);

        // Esegui comunque il cambio categoria (eventuale doppia invocazione è idempotente)
        handleCategoryChange(category, tab);
        return;
      }

      // Check per metric item - supporta click su qualsiasi parte dell'item
      const item = e.target.closest('.metric-list-item.swipeable');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        const key = item.getAttribute('data-metric-key') || item.dataset.metricKey;
        if (!key) return;
        
        console.log('[UI Runtime] Mobile - Click su metrica, key:', key, 'metricsWithGlossary length:', metricsWithGlossary.length);
        const metric = metricsWithGlossary.find(m => m.key === key);
        if (metric) {
          console.log('[UI Runtime] Mobile - Metrica trovata, apri dettaglio:', metric.key);
          openMetricDetail(metric, drawer2, drawer2Title, drawer2Content);
          drawer1.classList.remove('active');
          drawer2.classList.add('active');
        } else {
          console.warn('[UI Runtime] Mobile - Metrica non trovata per key:', key, 'available keys:', metricsWithGlossary.map(m => m.key).slice(0, 5));
        }
        return;
      }
    };

    // Aggiungi listener per click - usa delegation per mobile e desktop
    container.addEventListener('click', handleContainerClick, { passive: false, capture: false });
    
    // Per mobile: aggiungi anche touchstart per migliorare la risposta
    // ma solo se non è già stato gestito da swipe
    let touchStartTime = 0;
    let touchStartTarget = null;
    
    container.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartTarget = e.target;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
      // Solo se è un tap veloce (non swipe) e target stesso
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 300 && e.target === touchStartTarget) {
        // Evita doppia esecuzione se click è già stato gestito
        setTimeout(() => {
          if (!e.defaultPrevented) {
            handleContainerClick(e);
          }
        }, 50);
      }
    }, { passive: false });

    // Keyboard navigation per accessibilità
    const handleKeyboardNav = (e) => {
      // ESC chiude drawer2 e torna a drawer1
      if (e.key === 'Escape' && drawer2.classList.contains('active')) {
        e.preventDefault();
        drawer1.classList.add('active');
        drawer2.classList.remove('active');
        // Focus sul back button o prima metrica
        const firstItem = drawer1.querySelector('.metric-list-item');
        if (firstItem) {
          firstItem.focus();
        }
        return;
      }

      // Arrow keys nelle category tabs
      const activeTab = container.querySelector('.metric-category-tab.active');
      if (activeTab && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const tabs = Array.from(container.querySelectorAll('.metric-category-tab'));
        const currentIndex = tabs.indexOf(activeTab);
        let nextIndex = currentIndex;
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
          nextIndex = currentIndex + 1;
        }
        
        if (nextIndex !== currentIndex) {
          e.preventDefault();
          tabs[nextIndex].click();
          tabs[nextIndex].focus();
        }
        return;
      }

      // Arrow keys nelle metriche (solo se drawer1 è attivo)
      if (drawer1.classList.contains('active') && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const items = Array.from(container.querySelectorAll('.metric-list-item.swipeable'));
        const activeItem = container.querySelector('.metric-list-item:focus');
        const currentIndex = activeItem ? items.indexOf(activeItem) : -1;
        let nextIndex = currentIndex;
        
        if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }
        
        if (nextIndex !== currentIndex && items[nextIndex]) {
          e.preventDefault();
          // Aggiorna tabindex: solo l'elemento attivo è navigabile con Tab
          items.forEach((item, idx) => {
            item.setAttribute('tabindex', idx === nextIndex ? '0' : '-1');
          });
          items[nextIndex].focus();
          // Scroll into view
          items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Enter o Space apre dettaglio metrica
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('metric-list-item')) {
        e.preventDefault();
        e.target.click();
      }
    };

    container.addEventListener('keydown', handleKeyboardNav);

    // Swipe gesture per aprire drawer 2
    setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content);

    // Back button
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[UI Runtime] Mobile - Back button click');
      drawer1.classList.add('active');
      drawer2.classList.remove('active');
      // Focus sulla prima metrica o tab attivo
      const activeTab = container.querySelector('.metric-category-tab.active');
      if (activeTab) {
        activeTab.focus();
      }
    });

    // Store cleanup function per rimuovere listeners quando drawer viene chiuso
    container.dataset.cleanupMobileDrawer = 'true';
    container._mobileDrawerCleanup = () => {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('touchstart', () => {});
      container.removeEventListener('touchend', () => {});
      container.removeEventListener('keydown', handleKeyboardNav);
      // Rimuovi listener diretti sui tab
      categoryTabs.forEach(tab => {
        if (tab._categoryTabHandler) {
          tab.removeEventListener('click', tab._categoryTabHandler);
          delete tab._categoryTabHandler;
        }
      });
      delete container._mobileDrawerCleanup;
    };
    
    // Riavvia listener quando cambia categoria (per nuovi tab aggiunti dinamicamente)
    const observeTabChanges = () => {
      const observer = new MutationObserver(() => {
        const newTabs = container.querySelectorAll('.metric-category-tab');
        newTabs.forEach(tab => {
          if (!tab._categoryTabHandler) {
            const handler = (e) => {
              e.preventDefault();
              e.stopPropagation();
              const category = tab.getAttribute('data-category') || tab.dataset.category;
              if (category) {
                handleCategoryChange(category, tab);
              }
            };
            tab._categoryTabHandler = handler;
            tab.addEventListener('click', handler, { passive: false });
            tab.addEventListener('touchend', handler, { passive: false });
          }
        });
      });
      observer.observe(container, { childList: true, subtree: true });
      return observer;
    };
    
    container._tabObserver = observeTabChanges();
    
    // Verifica che tutto sia funzionante dopo setup
    setTimeout(() => {
      const verifyTabs = container.querySelectorAll('.metric-category-tab');
      console.log('[UI Runtime] setupMobileMetricsDrawer - Verifica finale:', {
        tabsFound: verifyTabs.length,
        tabsWithHandlers: Array.from(verifyTabs).filter(t => t._categoryTabHandler).length,
        drawer1Active: drawer1?.classList.contains('active'),
        drawer2Active: drawer2?.classList.contains('active')
      });
    }, 200);
  }

  // Setup swipe gesture per mobile drawer con debouncing migliorato
  function setupSwipeGesture(container, metricsWithGlossary, drawer2, drawer2Title, drawer2Content) {
    const drawer1 = container.querySelector('.metrics-drawer-1');
    const listItems = container.querySelectorAll('.metric-list-item.swipeable');
    
    // Rimuovi listener precedenti se esistono
    listItems.forEach(item => {
      if (item._swipeHandlers) {
        item.removeEventListener('touchstart', item._swipeHandlers.start);
        item.removeEventListener('touchmove', item._swipeHandlers.move);
        item.removeEventListener('touchend', item._swipeHandlers.end);
      }
    });
    
    const SWIPE_THRESHOLD = 80; // Soglia aumentata per swipe più intenzionale
    const SWIPE_VELOCITY_THRESHOLD = 0.3; // Velocità minima (px/ms)
    
    listItems.forEach(item => {
      let startX = 0, startY = 0, startTime = 0, isDragging = false, hasSwiped = false;
      
      const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isDragging = true;
        hasSwiped = false;
        // Aggiungi indicatore visivo che lo swipe è iniziato
        item.style.transition = 'transform 0.2s ease';
      };
      
      const handleTouchMove = (e) => {
        if (!isDragging || hasSwiped) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;
        const absDiffX = Math.abs(diffX);
        const absDiffY = Math.abs(diffY);
        
        // Solo swipe orizzontale destro significativo
        if (diffX > 0 && absDiffX > absDiffY && absDiffX > 30) {
          // Feedback visivo durante swipe
          const progress = Math.min(absDiffX / SWIPE_THRESHOLD, 1);
          item.style.transform = `translateX(${progress * 20}px)`;
          item.style.opacity = String(1 - progress * 0.2);
        }
        
        // Se supera la soglia, attiva swipe
        if (diffX > SWIPE_THRESHOLD && absDiffX > absDiffY) {
          e.preventDefault();
          const duration = Date.now() - startTime;
          const velocity = absDiffX / duration;
          
          // Solo se velocità sufficiente
          if (velocity > SWIPE_VELOCITY_THRESHOLD) {
            hasSwiped = true;
            const key = item.getAttribute('data-metric-key');
            const metric = metricsWithGlossary.find(m => m.key === key);
            if (metric) {
              // Reset transform prima di aprire drawer
              item.style.transform = '';
              item.style.opacity = '';
              item.style.transition = '';
              
              openMetricDetail(metric, drawer2, drawer2Title, drawer2Content);
              drawer1.classList.remove('active');
              drawer2.classList.add('active');
              // Focus sul back button
              const backBtn = drawer2.querySelector('.metrics-drawer-2__back');
              if (backBtn) {
                setTimeout(() => backBtn.focus(), 100);
              }
            }
          }
          isDragging = false;
        }
      };
      
      const handleTouchEnd = () => {
        if (isDragging && !hasSwiped) {
          // Reset trasformazione se swipe non completato
          item.style.transform = '';
          item.style.opacity = '';
        }
        item.style.transition = '';
        isDragging = false;
        hasSwiped = false;
      };
      
      // Store handlers per cleanup
      item._swipeHandlers = {
        start: handleTouchStart,
        move: handleTouchMove,
        end: handleTouchEnd
      };
      
      item.addEventListener('touchstart', handleTouchStart, { passive: true });
      item.addEventListener('touchmove', handleTouchMove, { passive: false });
      item.addEventListener('touchend', handleTouchEnd, { passive: true });
    });
  }

  // Apri dettaglio metrica nel drawer 2
  function openMetricDetail(metric, drawer2, drawer2Title, drawer2Content) {
    const books = RECOMMENDED_BOOKS[metric.category || 'altro'] || [];
    const booksHtml = books.map(book => `
      <div class="recommended-book">
        <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
          <div class="recommended-book__title">${book.title}</div>
          <div class="recommended-book__author">${book.author}</div>
        </a>
      </div>
    `).join('');

    drawer2Title.textContent = metric.label || metric.key;
    drawer2Content.innerHTML = `
      <div class="metric-tabs-container" data-key="${metric.key}">
        <nav class="metric-tabs-nav" role="tablist">
          <button class="metric-tab active" role="tab" data-tab="what" aria-selected="true">What</button>
          <button class="metric-tab" role="tab" data-tab="how" aria-selected="false">How</button>
          <button class="metric-tab" role="tab" data-tab="source" aria-selected="false">Source</button>
        </nav>
        <div class="metric-tabs-content">
          <div class="metric-tab-panel active" data-panel="what" role="tabpanel">
            <div class="metric-tab-panel-content">${metric.glossary.what || '—'}</div>
          </div>
          <div class="metric-tab-panel" data-panel="how" role="tabpanel" hidden>
            <div class="metric-tab-panel-content">${metric.glossary.how || '—'}</div>
          </div>
          <div class="metric-tab-panel" data-panel="source" role="tabpanel" hidden>
            <div class="metric-tab-panel-content">${metric.glossary.source || '—'}</div>
          </div>
        </div>
      </div>
      ${books.length > 0 ? `
        <div class="recommended-books">
          <div class="recommended-books__title">Libri consigliati</div>
          <div class="recommended-books__list">
            ${booksHtml}
          </div>
        </div>
      ` : ''}
    `;

    // Bind tabs dopo un breve delay per assicurare che il DOM sia pronto
    requestAnimationFrame(() => {
      if (UI.bindMetricTabs) {
        UI.bindMetricTabs(drawer2Content, metric.key);
      }
    });

    // Swipe left per tornare
    let startX = 0;
    drawer2Content.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    drawer2Content.addEventListener('touchmove', (e) => {
      const currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      if (diffX < -50) {
        e.preventDefault();
        const drawer1 = qs('.metrics-drawer-1');
        const drawer2 = qs('#metrics-drawer-2');
        if (drawer1 && drawer2) {
          drawer1.classList.add('active');
          drawer2.classList.remove('active');
        }
      }
    }, { passive: false });
  }

  // Setup drawer desktop 3 colonne
  function setupDesktopMetricsDrawer(metricsWithGlossary, metricsByCategory, categories) {
    const container = qs('.metrics-drawer-desktop');
    if (!container) return container;

    const categoryItems = container.querySelectorAll('.metric-category-item');
    const metricsList = container.querySelector('.metrics-drawer-desktop__metrics-list');
    const contentTitle = container.querySelector('.metrics-drawer-desktop__content-title');
    const contentBody = container.querySelector('.metrics-drawer-desktop__content-body');
    const contentContainer = container.querySelector('.metric-content-desktop');

    // Store per accesso globale
    if (!container._metricsData) {
      container._metricsData = { metricsWithGlossary, metricsByCategory, contentTitle, contentBody, contentContainer };
    }

    // Click su categoria - usa delegation
    container.addEventListener('click', (e) => {
      const catItem = e.target.closest('.metric-category-item');
      if (!catItem) return;
      
      e.preventDefault();
      e.stopPropagation();
      const category = catItem.getAttribute('data-category');
      console.log('[UI Runtime] Click categoria:', category);
      const metrics = metricsByCategory[category] || [];
      
      // Update active category
      categoryItems.forEach(c => c.classList.remove('active'));
      catItem.classList.add('active');
      
      // Update metrics list
      metricsList.setAttribute('data-category', category);
      metricsList.innerHTML = metrics.map(m => `
        <button class="metric-item" data-metric-key="${m.key}">
          <div class="metric-item__label">${m.label || m.key}</div>
          <div class="metric-item__value">${m.value ?? '—'}</div>
        </button>
      `).join('');
      
      // Select first metric
      if (metrics.length > 0) {
        const firstMetric = metrics[0];
        updateMetricContent(firstMetric, contentTitle, contentBody, contentContainer);
        const firstItem = metricsList.querySelector('.metric-item');
        if (firstItem) {
          firstItem.classList.add('active');
          console.log('[UI Runtime] Prima metrica selezionata:', firstMetric.key);
        }
      }
    });

    // Bind metric items - usa delegation
    container.addEventListener('click', (e) => {
      const metricItem = e.target.closest('.metric-item');
      if (!metricItem) return;
      
      e.preventDefault();
      e.stopPropagation();
      const key = metricItem.getAttribute('data-metric-key');
      console.log('[UI Runtime] Click metrica nel drawer:', key);
      const metric = metricsWithGlossary.find(m => m.key === key);
      
      if (metric && contentTitle && contentBody && contentContainer) {
        console.log('[UI Runtime] Aggiorna contenuto per:', key);
        // Update active metric
        container.querySelectorAll('.metric-item').forEach(m => m.classList.remove('active'));
        metricItem.classList.add('active');
        
        // Update content
        updateMetricContent(metric, contentTitle, contentBody, contentContainer);
      }
    });
    
    return container;
  }

  // Update metric content per desktop
  function updateMetricContent(metric, contentTitle, contentBody, contentContainer) {
    console.log('[UI Runtime] updateMetricContent chiamata per:', metric.key, 'title:', !!contentTitle, 'body:', !!contentBody, 'container:', !!contentContainer);
    const books = RECOMMENDED_BOOKS[metric.category || 'altro'] || [];
    const booksHtml = books.map(book => `
      <div class="recommended-book">
        <a href="${book.url}" target="_blank" rel="noopener noreferrer" class="recommended-book__link">
          <div class="recommended-book__title">${book.title}</div>
          <div class="recommended-book__author">${book.author}</div>
        </a>
      </div>
    `).join('');

    if (contentTitle) {
      contentTitle.textContent = metric.label || metric.key;
      console.log('[UI Runtime] Titolo aggiornato:', contentTitle.textContent);
    }
    
    if (contentContainer) {
      contentContainer.setAttribute('data-key', metric.key);
      const whatSection = contentContainer.querySelector('.metric-content-section:nth-child(1) .metric-content-section__body');
      const howSection = contentContainer.querySelector('.metric-content-section:nth-child(2) .metric-content-section__body');
      const sourceSection = contentContainer.querySelector('.metric-content-section:nth-child(3) .metric-content-section__body');
      
      console.log('[UI Runtime] Sezioni trovate - what:', !!whatSection, 'how:', !!howSection, 'source:', !!sourceSection);
      
      if (whatSection) {
        whatSection.textContent = metric.glossary.what || '—';
        console.log('[UI Runtime] What aggiornato:', whatSection.textContent.substring(0, 50));
      }
      if (howSection) {
        howSection.textContent = metric.glossary.how || '—';
        console.log('[UI Runtime] How aggiornato:', howSection.textContent.substring(0, 50));
      }
      if (sourceSection) {
        sourceSection.textContent = metric.glossary.source || '—';
        console.log('[UI Runtime] Source aggiornato:', sourceSection.textContent.substring(0, 50));
      }
    } else {
      console.warn('[UI Runtime] contentContainer non trovato!');
    }

    // Update books
    const booksContainer = contentBody.querySelector('.recommended-books');
    if (books.length > 0) {
      if (!booksContainer) {
        const booksHtmlFinal = `
          <div class="recommended-books">
            <div class="recommended-books__title">Libri consigliati</div>
            <div class="recommended-books__list">
              ${booksHtml}
            </div>
          </div>
        `;
        contentBody.insertAdjacentHTML('beforeend', booksHtmlFinal);
      } else {
        booksContainer.querySelector('.recommended-books__list').innerHTML = booksHtml;
      }
    } else if (booksContainer) {
      booksContainer.remove();
    }
  }

  // Apri drawer da metrica specifica (per click su metrica nel testo)
  function openMetricsDrawerFromMetric(metricKey) {
    console.log('[UI Runtime] openMetricsDrawerFromMetric chiamata con:', metricKey);
    const headerData = window.__headerTickerData;
    if (!headerData) {
      console.warn('[UI Runtime] Dati header non disponibili', {
        headerData: !!headerData
      });
      return;
    }
    
    // Verifica che metricsPanel sia presente
    if (!headerData.metricsPanel || !Array.isArray(headerData.metricsPanel) || headerData.metricsPanel.length === 0) {
      console.warn('[UI Runtime] metricsPanel non disponibile o vuoto, metricsPanel:', headerData.metricsPanel);
      // Prova comunque ad aprire, ma avvisa che la selezione potrebbe non funzionare
    } else {
      console.log('[UI Runtime] metricsPanel disponibile con', headerData.metricsPanel.length, 'metriche');
    }

    const drawerExists = qs('.metrics-drawer-desktop');
    // Verifica se il drawer è visibile (non solo se esiste nel DOM)
    const overlayEl = qs('.tl-panel-overlay');
    const drawerVisible = drawerExists && overlayEl && overlayEl.getAttribute('aria-hidden') !== 'true' && !overlayEl.hasAttribute('hidden') && overlayEl.style.display !== 'none';
    console.log('[UI Runtime] Drawer esistente:', !!drawerExists, 'drawer visibile:', drawerVisible, 'currentMetricsDrawer:', !!currentMetricsDrawer);

    // Se il drawer non è ancora aperto o non è visibile, apri prima
    if (!currentMetricsDrawer || !drawerVisible) {
      console.log('[UI Runtime] Drawer non aperto, apro...');
      openMetricsDrawer(headerData).then(() => {
        console.log('[UI Runtime] Drawer aperto, seleziono metrica...');
        // Usa MutationObserver per attendere che _metricsData sia impostato
        const drawer = qs('.metrics-drawer-desktop');
        if (drawer) {
          if (drawer._metricsData) {
            selectMetricInDesktopDrawer(metricKey);
          } else {
            const observer = new MutationObserver(() => {
              if (drawer._metricsData) {
                observer.disconnect();
                selectMetricInDesktopDrawer(metricKey);
              }
            });
            observer.observe(drawer, { childList: true, subtree: true, attributes: true });
            // Timeout di sicurezza
            setTimeout(() => {
              observer.disconnect();
              if (drawer._metricsData) {
                selectMetricInDesktopDrawer(metricKey);
              } else {
                console.warn('[UI Runtime] Impossibile selezionare metrica: _metricsData non impostato');
              }
            }, 1500);
          }
        }
      }).catch(err => {
        console.error('[UI Runtime] Errore apertura drawer:', err);
      });
      return;
    }

    // Se il drawer è già aperto, seleziona direttamente la metrica
    console.log('[UI Runtime] Drawer già aperto, seleziono metrica direttamente');
    selectMetricInDesktopDrawer(metricKey);
  }

  // Seleziona metrica nel drawer desktop
  function selectMetricInDesktopDrawer(metricKey, retryCount = 0) {
    const MAX_RETRIES = 20;
    
    if (retryCount >= MAX_RETRIES) {
      console.warn('[UI Runtime] selectMetricInDesktopDrawer: max retries raggiunto');
      return;
    }
    
    console.log('[UI Runtime] selectMetricInDesktopDrawer chiamata con:', metricKey);
    const drawer = qs('.metrics-drawer-desktop');
    if (!drawer) {
      console.warn('[UI Runtime] Drawer desktop non trovato');
      return;
    }

    const containerData = drawer._metricsData;
    if (!containerData) {
      console.warn('[UI Runtime] Dati container non disponibili, uso dati globali');
      if (!currentMetricsData) {
        console.error('[UI Runtime] Nessun dato disponibile');
        return;
      }
      const { metricsWithGlossary } = currentMetricsData;
      const metric = metricsWithGlossary.find(m => m.key === metricKey);
      if (!metric) {
        console.error('[UI Runtime] Metrica non trovata nei dati globali:', metricKey);
        return;
      }
      // Usa MutationObserver invece di setTimeout ricorsivo
      const observer = new MutationObserver(() => {
        if (drawer._metricsData) {
          observer.disconnect();
          selectMetricInDesktopDrawer(metricKey, retryCount + 1);
        }
      });
      observer.observe(drawer, { childList: true, subtree: true, attributes: true });
      // Timeout di sicurezza per evitare loop infiniti
      setTimeout(() => {
        observer.disconnect();
        if (drawer._metricsData) {
          selectMetricInDesktopDrawer(metricKey, retryCount + 1);
        } else if (retryCount < MAX_RETRIES - 1) {
          // Se ancora non c'è dopo 2s e non abbiamo raggiunto il limite, riprova
          selectMetricInDesktopDrawer(metricKey, retryCount + 1);
        } else {
          console.warn('[UI Runtime] selectMetricInDesktopDrawer: _metricsData non impostato dopo', MAX_RETRIES, 'retry');
        }
      }, 2000); // Timeout totale 2s
      return;
    }

    const { metricsWithGlossary, metricsByCategory, contentTitle, contentBody, contentContainer } = containerData;
    const metric = metricsWithGlossary.find(m => m.key === metricKey);
    
    if (!metric) {
      console.warn('[UI Runtime] Metrica non trovata:', metricKey);
      return;
    }

    console.log('[UI Runtime] Metrica trovata, categoria:', metric.category);

    const category = metric.category || 'altro';
    const categoryItem = drawer.querySelector(`.metric-category-item[data-category="${category}"]`);
    console.log('[UI Runtime] Categoria item trovato:', !!categoryItem);
    
    if (categoryItem) {
      console.log('[UI Runtime] Click su categoria:', category);
      // Aggiorna categoria direttamente (come fa l'event delegation)
      const metrics = metricsByCategory[category] || [];
      const categoryItems = drawer.querySelectorAll('.metric-category-item');
      categoryItems.forEach(c => c.classList.remove('active'));
      categoryItem.classList.add('active');
      
      // Update metrics list
      const metricsList = drawer.querySelector('.metrics-drawer-desktop__metrics-list');
      if (metricsList) {
        metricsList.setAttribute('data-category', category);
        metricsList.innerHTML = metrics.map(m => `
          <button class="metric-item ${m.key === metricKey ? 'active' : ''}" data-metric-key="${m.key}">
            <div class="metric-item__label">${m.label || m.key}</div>
            <div class="metric-item__value">${m.value ?? '—'}</div>
          </button>
        `).join('');
      }
      
      // Seleziona direttamente la metrica - usa requestAnimationFrame per attendere rendering DOM
      requestAnimationFrame(() => {
        const metricItem = drawer.querySelector(`.metric-item[data-metric-key="${metricKey}"]`);
        console.log('[UI Runtime] Metrica item trovato:', !!metricItem, 'metricKey:', metricKey);
        if (metricItem) {
          console.log('[UI Runtime] Aggiorno contenuto per metrica:', metricKey);
          // Aggiorna contenuto direttamente
          const allMetricItems = drawer.querySelectorAll('.metric-item');
          allMetricItems.forEach(m => m.classList.remove('active'));
          metricItem.classList.add('active');
          console.log('[UI Runtime] Metrica item attivato, aggiorno contenuto...');
          updateMetricContent(metric, contentTitle, contentBody, contentContainer);
          console.log('[UI Runtime] Contenuto aggiornato, title:', contentTitle?.textContent, 'container:', !!contentContainer);
        } else {
          console.warn('[UI Runtime] Metrica item non trovato dopo aggiornamento lista, metricKey:', metricKey);
          // Fallback: aggiorna contenuto direttamente
          updateMetricContent(metric, contentTitle, contentBody, contentContainer);
        }
      });
    } else {
      console.warn('[UI Runtime] Categoria item non trovato, aggiorno contenuto direttamente');
      updateMetricContent(metric, contentTitle, contentBody, contentContainer);
    }
  }

  // Naviga a metrica nel drawer mobile
  function navigateToMetricInMobileDrawer(metricKey, retryCount = 0) {
    const MAX_RETRIES = 20;
    
    if (retryCount >= MAX_RETRIES) {
      console.warn('[UI Runtime] navigateToMetricInMobileDrawer: max retries raggiunto');
      return;
    }
    
    const drawer = qs('.metrics-drawer-mobile');
    if (!drawer) {
      requestAnimationFrame(() => navigateToMetricInMobileDrawer(metricKey, retryCount + 1));
      return;
    }
    
    const drawer1 = drawer.querySelector('.metrics-drawer-1');
    const drawer2 = drawer.querySelector('#metrics-drawer-2');
    if (!drawer1 || !drawer2) {
      requestAnimationFrame(() => navigateToMetricInMobileDrawer(metricKey, retryCount + 1));
      return;
    }
    
    const categoryTabs = drawer.querySelectorAll('.metric-category-tab');
    if (!categoryTabs || categoryTabs.length === 0) {
      requestAnimationFrame(() => navigateToMetricInMobileDrawer(metricKey, retryCount + 1));
      return;
    }
    
    const category = getMetricCategory(metricKey);
    const categoryTab = Array.from(categoryTabs).find(tab => tab.getAttribute('data-category') === category);
    
    if (categoryTab) {
      categoryTab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
      requestAnimationFrame(() => {
        const metricItem = drawer.querySelector(`[data-metric-key="${metricKey}"]`);
        if (metricItem) {
          const metricsWithGlossary = currentMetricsData?.metricsWithGlossary || [];
          const metric = metricsWithGlossary.find(m => m.key === metricKey);
          if (metric) {
            const drawer2Title = drawer2.querySelector('.metrics-drawer-2__title');
            const drawer2Content = drawer2.querySelector('.metrics-drawer-2__content');
            if (drawer2Title && drawer2Content) {
              openMetricDetail(metric, drawer2, drawer2Title, drawer2Content);
              drawer1.classList.remove('active');
              drawer2.classList.add('active');
            }
          }
        }
      });
    }
  }

  // -----------------------------
  // API globale
  // -----------------------------
  UI.openPanel          = openPanel;
  UI.closePanel         = closePanel;
  UI.openAuditPanel     = openAuditPanel;
  UI.openMetricPopup    = openMetricPopup;
  UI.openMetricsCatalog = openMetricsCatalog;
  UI.bindMetricTabs     = bindMetricTabs;
  UI.openMetricsDrawer  = openMetricsDrawer;
  UI.openMetricsDrawerFromMetric = openMetricsDrawerFromMetric;
  UI.navigateToMetricInMobileDrawer = navigateToMetricInMobileDrawer;
  // Back-compat: Privacy/MiFID panels (contenuto da fornire dall'host page)
  UI.openPrivacyPanel = function(contentHTML){
    openPanel({ title: 'Privacy', subtitle: 'Informativa', panelSize: 'wide', body: contentHTML || '<div class="text-[13px]">Contenuto privacy non configurato.</div>' });
  };
  UI.openMifidPanel = function(contentHTML){
    openPanel({ title: 'Informativa MiFID', subtitle: 'Comunicazione istituzionale', panelSize: 'wide', body: contentHTML || '<div class="text-[13px]">Contenuto MiFID non configurato.</div>' });
  };
  // (Niente openPrivacyPanel / openMifidPanel in questa versione)

  // Esporta
  window.__TradeliaUI = UI;

  // -----------------------------
  // Bootstrap
  // -----------------------------
  function boot(){
    mountPanelOverlay();
    mountTooltips();

    // Nota: nessun binding Privacy/MiFID nel runtime
    // I pulsanti del footer devono essere gestiti dall'overlay inline dell'index
    // oppure da un altro modulo dedicato
    document.addEventListener('click', (e)=>{
      // Chiudi popover desktop se clic fuori
      if (popover && popover.getAttribute('aria-hidden')==='false'){
        if (!e.target.closest('#metric-popover') && !e.target.closest('.info-btn') && !e.target.closest('.info-btn--mini')){
          hidePopover();
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
