// /report/assets/js/ui-runtime.js
// Runtime UI globale Tradelia AI (shell-only): overlay analitico, overlay legale, metric tooltips, helpers.
// Dipendenze: tokens.css (classi tl-panel-*, tl-popover, tl-metric-modal-*, .btn), nessuna libreria esterna.

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
    overlay = el('div','tl-panel-overlay noprint'); overlay.id='panel-overlay'; overlay.setAttribute('aria-hidden','true');

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

    // Size (opzionale, usabile dai moduli via classi)
    desktopPanel.style.width = panelSize === 'xl' ? 'min(980px,100%)' : 'min(860px,100%)';

    // Conteuti
    desktopTitle.textContent = title; mobileTitle.textContent = title;
    desktopSub.textContent   = subtitle || '—'; mobileSub.textContent = subtitle || '—';
    desktopBody.innerHTML    = body;    mobileBody.innerHTML = body;

    setFooterButtons(desktopFooter, footerButtons);
    setFooterButtons(mobileFooter,  footerButtons);

    // Blocca scroll pagina se blocking
    document.body.style.overflow = blocking ? 'hidden' : '';

    overlay.setAttribute('aria-hidden','false');

    // Mostra solo variante corretta
    if (isMobile()){
      desktopPanel.style.display='none'; mobilePanel.style.display='flex';
    } else {
      desktopPanel.style.display='flex'; mobilePanel.style.display='none';
    }

    resetScroll();
    // Re-bind metric tooltips anche dentro il pannello
    try { UI.bindMetricInfoButtons(desktopBody); UI.bindMetricInfoButtons(mobileBody); } catch(e){}
  }

  function closePanel(){
    if (!overlay) return;
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    resetScroll();
  }

  // -----------------------------
  // Overlay LEGAL (Privacy / MiFID)
  // -----------------------------
  let legal, legalBackdrop, legalDesktop, legalMobile, legalBody, legalBodyM, legalTitle, legalTitleM, legalSub, legalSubM, legalFooter, legalFooterM;

  function mountLegalOverlay(){
    if (qs('#legal-overlay')) return;
    legal = el('div','tl-panel-overlay noprint'); legal.id='legal-overlay'; legal.setAttribute('aria-hidden','true');
    legalBackdrop = el('div','tl-panel-backdrop'); legalBackdrop.setAttribute('data-legal-close','');
    legal.appendChild(legalBackdrop);

    // Desktop
    legalDesktop = el('aside','tl-panel tl-panel--desktop');
    const h = el('header','tl-panel__header');
    legalTitle = el('h2','tl-panel__title'); legalTitle.id='legal-title'; legalTitle.textContent='—';
    legalSub   = el('p','tl-panel__subtitle'); legalSub.id='legal-subtitle'; legalSub.textContent='—';
    const wr   = el('div','min-w-0'); wr.append(legalTitle, legalSub);
    const x    = el('button','tl-panel__close', svgX(16)); x.setAttribute('data-legal-close',''); x.setAttribute('aria-label','Chiudi');
    h.append(wr,x);
    legalBody   = el('div','tl-panel__body'); legalBody.id='legal-body';
    legalFooter = el('footer','tl-panel__footer'); legalFooter.id='legal-footer';
    const ok    = el('button','btn btn-sm'); ok.textContent='Chiudi'; ok.setAttribute('data-legal-close','');
    legalFooter.append(ok);
    legalDesktop.append(h, legalBody, legalFooter);

    // Mobile
    legalMobile = el('aside','tl-panel tl-panel--mobile');
    const hm = el('header','tl-panel__header');
    legalTitleM = el('h2','tl-panel__title'); legalTitleM.id='legal-title-mobile'; legalTitleM.textContent='—';
    legalSubM   = el('p','tl-panel__subtitle'); legalSubM.id='legal-subtitle-mobile'; legalSubM.textContent='—';
    const wrm   = el('div','min-w-0'); wrm.append(legalTitleM, legalSubM);
    const xm    = el('button','tl-panel__close', svgX(18)); xm.setAttribute('data-legal-close',''); xm.setAttribute('aria-label','Chiudi');
    hm.append(wrm, xm);
    legalBodyM   = el('div','tl-panel__body'); legalBodyM.id='legal-body-mobile';
    legalFooterM = el('footer','tl-panel__footer'); legalFooterM.id='legal-footer-mobile';
    const okm    = el('button','btn btn-sm'); okm.textContent='Chiudi'; okm.setAttribute('data-legal-close','');
    legalFooterM.append(okm);
    legalMobile.append(hm, legalBodyM, legalFooterM);

    legal.append(legalDesktop, legalMobile);
    document.body.appendChild(legal);

    // Close delegates
    legal.addEventListener('click', (e)=>{
      const t = e.target;
      if (t.closest('[data-legal-close]') || t === legalBackdrop) closeLegal();
    });
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && legal.getAttribute('aria-hidden')==='false'){ closeLegal(); } });
  }

  function openLegal({title='—', subtitle='—', body=''}){
    mountLegalOverlay();
    legalTitle.textContent = title;  legalTitleM.textContent = title;
    legalSub.textContent   = subtitle || '—'; legalSubM.textContent = subtitle || '—';
    legalBody.innerHTML    = body;   legalBodyM.innerHTML    = body;

    legal.setAttribute('aria-hidden','false');
    if (isMobile()){ legalDesktop.style.display='none'; legalMobile.style.display='flex'; }
    else { legalDesktop.style.display='flex'; legalMobile.style.display='none'; }
    (legalDesktop.querySelector('.tl-panel__body')||{}).scrollTop = 0;
    (legalMobile.querySelector('.tl-panel__body')||{}).scrollTop  = 0;
  }

  function closeLegal(){
    if (!legal) return;
    legal.setAttribute('aria-hidden','true');
  }

  function openPrivacyPanel(){
    openLegal({
      title: 'Informativa Privacy',
      subtitle: 'Uso limitato a finalità informative; nessuna profilazione pubblicitaria.',
      body: `
        <div class="card">
          <p class="text-[13px] text-[color:var(--ink-soft)]">
            Questo sito utilizza esclusivamente storage locale per preferenze tecniche (es. tema). 
            Non vengono utilizzati cookie di profilazione né tracciamenti pubblicitari esterni.
          </p>
          <ul class="text-[13px] text-[color:var(--muted)] mt-3 space-y-1">
            <li>• Nessun dato personale sensibile viene richiesto o trattato</li>
            <li>• Dati tecnici: tema, preferenze di visualizzazione</li>
            <li>• Contatto: <a href="mailto:info@tradelia.org">info@tradelia.org</a></li>
          </ul>
        </div>`
    });
  }

  function openMifidPanel(){
    openLegal({
      title: 'Informativa MiFID',
      subtitle: 'Materiale informativo e didattico — nessuna raccomandazione personalizzata.',
      body: `
        <div class="card">
          <p class="text-[13px] text-[color:var(--ink-soft)]">
            I contenuti presentati hanno finalità esclusivamente informative e formative.
            Non costituiscono consulenza in materia di investimenti né sollecitazione al pubblico risparmio.
          </p>
          <ul class="text-[13px] text-[color:var(--muted)] mt-3 space-y-1">
            <li>• Rischio di perdita anche totale del capitale</li>
            <li>• Tradelia AI non gestisce capitali e non esegue ordini</li>
            <li>• L’utente rimane l’unico responsabile delle proprie decisioni</li>
          </ul>
        </div>`
    });
  }

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
    // Posizionamento preferito: sopra a destra del bottone
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
  UI.openPanel  = openPanel;
  UI.closePanel = closePanel;
  UI.openPrivacyPanel = openPrivacyPanel;
  UI.openMifidPanel   = openMifidPanel;
  UI.openAuditPanel   = openAuditPanel;

  // Esporta
  window.__TradeliaUI = UI;

  // -----------------------------
  // Bootstrap: mount overlay e bind footer buttons
  // -----------------------------
  function boot(){
    mountPanelOverlay();
    mountLegalOverlay();
    mountTooltips();

    // Footer buttons
    const bPriv = qs('#btn-privacy-open');
    const bMi   = qs('#btn-mifid-open');
    if (bPriv) bPriv.addEventListener('click', openPrivacyPanel);
    if (bMi)   bMi.addEventListener('click',   openMifidPanel);

    // Clic fuori/pagina: chiude popover desktop
    document.addEventListener('click', (e)=>{
      if (popover && popover.getAttribute('aria-hidden')==='false'){
        if (!e.target.closest('#metric-popover') && !e.target.closest('.info-btn') && !e.target.closest('.info-btn--mini')){
          hidePopover();
        }
      }
    });
  }

  // Start
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
