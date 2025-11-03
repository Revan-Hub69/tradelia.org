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
      desktopPanel.style.display='none'; mobilePanel.style.display='flex';
    } else {
      desktopPanel.style.display='flex'; mobilePanel.style.display='none';
    }

    resetScroll();
    // Tooltips anche dentro il pannello
    try { UI.bindMetricInfoButtons(desktopBody); UI.bindMetricInfoButtons(mobileBody); } catch(e){}
  }

  function closePanel(){
    if (!overlay) return;
    overlay.setAttribute('aria-hidden','true');
    overlay.setAttribute('hidden',''); // Nascondi anche con attributo hidden
    overlay.style.display = 'none'; // Forza display none
    document.body.style.overflow = '';
    resetScroll();
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
    if (isMobile()){
      showModal({ title: g.title || key, what: g.what, how: g.how, source: g.source });
    } else {
      // su desktop apriamo un panel compatto per coerenza (il popover richiede ancoraggio)
      openPanel({
        title: g.title || key,
        subtitle: 'Glossario metrica',
        panelSize: 'wide',
        body: `
          <div class="grid gap-3 text-[13px]">
            <div class="text-[color:var(--ink)]">${g.what || '—'}</div>
            ${g.how ? `<div class="text-[color:var(--ink-soft)]">${g.how}</div>` : ''}
            ${g.source ? `<div class="text-[color:var(--muted)]">Fonte: ${g.source}</div>` : ''}
          </div>
        `
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
    mountTooltips();
    modalTitle.textContent  = data?.title || '—';
    modalSource.textContent = data?.source || '';
    modalBody.innerHTML     = (data?.what || '—') + (data?.how ? `<div style="margin-top:.75rem">${data.how}</div>` : '');
    modal.setAttribute('aria-hidden','false');
  }
  function hideModal(){ if(modal) modal.setAttribute('aria-hidden','true'); }

  UI.bindMetricInfoButtons = function(root=document){
    mountTooltips();
    qsa('.info-btn, .info-btn--mini', root).forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        e.stopPropagation();
        const key = btn.getAttribute('data-metric');
        const data = await Glossary.get(key);
        if (isMobile()) showModal(data);
        else showPopoverFor(btn, data);
      }, { passive:false });
    });
  };

  // -----------------------------
  // API globale
  // -----------------------------
  UI.openPanel          = openPanel;
  UI.closePanel         = closePanel;
  UI.openAuditPanel     = openAuditPanel;
  UI.openMetricPopup    = openMetricPopup;
  UI.openMetricsCatalog = openMetricsCatalog;
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
