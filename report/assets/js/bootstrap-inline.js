/* /report/assets/js/bootstrap-inline.js
   Bootstrap runtime globale Tradelia
   - tema / localStorage
   - drawer + MiFID gate
   - privacy modal
   - metric popover & sheet mobile
   - hero/header.json hydration
   - share overlay init
   - mount dinamico F1…F6
*/

import { mountReport } from '/report/assets/js/app.js';
import { initShareSystem } from '/report/assets/js/components/share.js';

/* ---------------------------------
   Mini helpers DOM / storage
--------------------------------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const getReportId = ()=> new URL(location.href).searchParams.get('id') || 'sample-id';

const LS = {
  theme:'tradelia.theme',
  privacy:'tradelia.privacy.ack',
  mifid:'tradelia.mifid.accepted'
};

function safeCreateIcons(){
  try{ if(window.lucide){ window.lucide.createIcons(); } }catch(e){}
}

/* soft fetch json no-store */
async function loadJSON(p){
  try{
    const r=await fetch(p,{cache:'no-store'});
    return r.ok? r.json(): null;
  }catch{
    return null;
  }
}

/* utility per barre tono/metrica nel hero */
function setToneBar(el, tone){
  if(!el) return;
  el.style.background =
    tone==='g' ? 'var(--tone-g)' :
    tone==='y' ? 'var(--tone-y)' :
    tone==='r' ? 'var(--tone-r)' :
    'var(--tone-n)';
}

/* format date/time stile Europa/Roma leggibile */
function fmtDate(iso){
  if(!iso) return '—';
  // accettiamo formato "2025-10-22 15:00"
  const d = new Date(String(iso).replace(' ', 'T')+'Z'); // trattiamolo come UTC-ish
  const optsDate = { day:'2-digit', month:'2-digit', year:'numeric' };
  const optsTime = { hour:'2-digit', minute:'2-digit' };
  const ds = d.toLocaleDateString('it-IT', optsDate);
  const ts = d.toLocaleTimeString('it-IT', optsTime);
  return ds + ' ' + ts + ' CET';
}

/* ---------------------------------
   THEME (light/dark) + print
--------------------------------- */
function setupThemeAndPrint(){
  // PRINT (header + footer)
  $('#btn-print')?.addEventListener('click',()=>window.print());
  $('#btn-print-2')?.addEventListener('click',()=>window.print());

  function setTheme(t){
    document.documentElement.dataset.theme=t;
    localStorage.setItem(LS.theme,t);

    // Aggiorna bottone tema con icona coerente
    const btn=$('#btn-theme');
    if(btn){
      // dopo il toggle mettiamo markup lucide per coerenza
      const iconName = (t==='dark'?'moon':'sun');
      btn.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span class="hidden sm:inline">Tema</span>`;
    }
    safeCreateIcons();
  }

  // init: leggi localStorage e applica
  (function initTheme(){
    const stored=localStorage.getItem(LS.theme);
    if(stored==='light' || stored==='dark'){
      document.documentElement.dataset.theme=stored;
    }
    const current = document.documentElement.dataset.theme || 'light';
    setTheme(current);
  })();

  // click toggle
  $('#btn-theme')?.addEventListener('click',()=>{
    const next = document.documentElement.dataset.theme==='dark'?'light':'dark';
    setTheme(next);
  });
}

/* ---------------------------------
   DRAWER (dettagli / MiFID blocking)
   Rende disponibile window.Tradelia.Drawer
--------------------------------- */
function setupDrawer(){
  const root      = $('#drawer');
  const panel     = root?.querySelector('.drawer__panel');
  const backdrop  = root?.querySelector('.drawer__backdrop');
  const titleEl   = $('#drawer-title');
  const subtitleEl= $('#drawer-subtitle');
  const contentEl = $('#drawer-content');

  let releaseFocusTrap = null;

  function trapFocus(container){
    const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const nodes = [...container.querySelectorAll(FOCUSABLE)]
      .filter(el => !el.disabled && el.offsetParent !== null);

    if(!nodes.length){
      return () => {};
    }

    const first = nodes[0];
    const last  = nodes[nodes.length - 1];

    function handle(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey){
        if(document.activeElement === first){
          e.preventDefault();
          last.focus();
        }
      }else{
        if(document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    }
    container.addEventListener('keydown', handle);

    requestAnimationFrame(()=> first.focus());

    return () => {
      container.removeEventListener('keydown', handle);
    };
  }

  function open({ title:t='Dettagli', subtitle:s='—', html='', blocking=false }={}){
    if(!root) return;
    titleEl.querySelector('span').textContent = t;
    subtitleEl.textContent = s;
    contentEl.innerHTML = html;

    root.dataset.blocking = blocking ? 'true' : 'false';
    if(blocking){
      root.classList.add('drawer--blocking');
      document.body.style.overflow='hidden';
    }else{
      root.classList.remove('drawer--blocking');
      document.body.style.overflow='';
    }

    root.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=> root.classList.add('is-open'));

    if(blocking){
      releaseFocusTrap = trapFocus(panel);
    }else{
      releaseFocusTrap = null;
    }

    safeCreateIcons();
  }

  function reallyClose(){
    if(!root) return;
    root.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(releaseFocusTrap){
      releaseFocusTrap();
      releaseFocusTrap = null;
    }
  }

  function close(){
    if(!root) return;
    // se blocking=true non chiudiamo (MiFID pre-accettazione)
    if(root.dataset.blocking==='true') return;

    root.classList.remove('is-open');
    root.addEventListener('transitionend',()=>{
      reallyClose();
    },{once:true});
  }

  // backdrop click o [data-drawer-close]
  root?.addEventListener('click', e => {
    const wantsClose = e.target === backdrop || e.target.closest('[data-drawer-close]');
    if(wantsClose){
      close();
    }
  });

  // ESC chiude solo se non blocking
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && root?.dataset.blocking!=='true'){
      if(root?.getAttribute('aria-hidden')==='false'){
        close();
      }
    }
  });

  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Drawer = { open, close, root, reallyClose };
}

/* ---------------------------------
   METRIC INFO:
   - popover desktop (#popover)
   - bottom sheet mobile (#metric-sheet-overlay)
--------------------------------- */
function setupMetricInfo(){
  const pop = $('#popover');
  const metricSheetOverlay = $('#metric-sheet-overlay');
  const metricSheetTitle   = $('#metric-sheet-title');
  const metricSheetBody    = $('#metric-sheet-body');
  const metricSheetSource  = $('#metric-sheet-source');
  let glossaryCache = null;

  async function getGlossary(){
    if(glossaryCache) return glossaryCache;
    try{
      const r = await fetch('/report/assets/glossary.json',{cache:'no-store'});
      glossaryCache = r.ok ? await r.json() : {};
    }catch{
      glossaryCache = {};
    }
    return glossaryCache;
  }

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function hideDesktopPopover(){
    if(!pop) return;
    pop.style.display='none';
    pop.setAttribute('aria-hidden','true');
  }

  function showDesktopPopover(btn, entry){
    if(!pop) return;
    $('#popover-title').textContent  = entry.title || '—';
    $('#popover-text').textContent   = entry.short || '—';
    $('#popover-source').textContent = entry.source ? `Fonte: ${entry.source}` : '';

    const rect = btn.getBoundingClientRect();
    const sx = scrollX, sy = scrollY, vw = innerWidth, vh = innerHeight;
    const popW = Math.min(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pop-w'))||320, vw*0.92);

    pop.style.width = popW + 'px';
    pop.style.visibility='hidden';
    pop.setAttribute('aria-hidden','false');
    pop.style.display='block';

    const ph = pop.offsetHeight || 160;
    let left = rect.left + sx - 8;
    let top  = rect.bottom + sy + 8;
    const m = 12;

    left = clamp(left, sx + m, sx + vw - popW - m);

    const spaceBelow = (sy + vh) - (rect.bottom + sy);
    if (spaceBelow < ph + 20){
      top = rect.top + sy - ph - 10;
      if (top < sy + m) top = sy + m;
    }

    pop.style.left = left + 'px';
    pop.style.top  = top + 'px';
    pop.style.visibility='visible';
  }

  function hideMobileSheet(){
    if(!metricSheetOverlay) return;
    metricSheetOverlay.classList.remove('is-open');
    metricSheetOverlay.addEventListener('transitionend',()=>{
      metricSheetOverlay.setAttribute('aria-hidden','true');
    }, { once:true });
  }

  function showMobileSheet(entry){
    if(!metricSheetOverlay) return;
    metricSheetTitle.textContent  = entry.title || '—';
    metricSheetBody.textContent   = entry.short || '—';
    metricSheetSource.textContent = entry.source ? `Fonte: ${entry.source}` : '';
    metricSheetOverlay.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>{
      metricSheetOverlay.classList.add('is-open');
    });
  }

  document.addEventListener('click', async (e)=>{
    // fuori popover/sheet
    if (e.target.closest('#popover')) return;
    if (e.target.closest('#metric-sheet-overlay')) return;

    // chiusura sheet mobile
    if (e.target.closest('[data-metric-close]')){
      hideMobileSheet();
      return;
    }

    // click su pulsante info "?"
    const btn = e.target.closest('.info-btn');
    if(!btn){
      hideDesktopPopover();
      return;
    }

    const metric = btn.dataset.metric;
    const g = await getGlossary();
    const entry = g?.[metric] || { title: metric, short:'—', source:'' };

    if(window.matchMedia('(max-width:639px)').matches){
      hideDesktopPopover();
      showMobileSheet(entry);
    } else {
      hideMobileSheet();
      showDesktopPopover(btn, entry);
    }
  });

  addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      hideDesktopPopover();
      hideMobileSheet();
    }
  });

  $('#popover-close')?.addEventListener('click', hideDesktopPopover);

  addEventListener('resize', ()=>{
    hideDesktopPopover();
    hideMobileSheet();
  });
  addEventListener('scroll', ()=>{
    hideDesktopPopover();
  }, { passive:true });
}

/* ---------------------------------
   PRIVACY + MiFID GATE
   - apre privacy modal se non accettata
   - apre drawer MiFID bloccante se privacy ok ma MiFID non accettato
--------------------------------- */
function setupGating(){
  const privacyModal = $('#privacy-modal');

  function openPrivacy(){
    privacyModal?.setAttribute('aria-hidden','false');
    safeCreateIcons();
  }
  function closePrivacy(){
    privacyModal?.setAttribute('aria-hidden','true');
  }

  $('#privacy-ok')?.addEventListener('click', ()=>{
    localStorage.setItem(LS.privacy,'1');
    closePrivacy();
    if(localStorage.getItem(LS.mifid)!=='1'){
      openMiFID();
    }
  });
  $('#btn-privacy-open')?.addEventListener('click', openPrivacy);

  function openMiFID(){
    const html = `
      <section style="font-size:13.6px;line-height:1.6">
        <h3 style="margin:0 0 8px;font-weight:900;display:flex;align-items:center;gap:.5rem">
          <i data-lucide="shield"></i>
          <span>Informativa MiFID II e limitazioni d’uso</span>
        </h3>

        <p>
          Questo documento è prodotto dal <strong>team Tradelia</strong>. Tradelia non è un intermediario autorizzato e non possiede licenze MiFID.
        </p>

        <p>
          I contenuti sono forniti a fini <strong>informativi ed educativi</strong>. Non costituiscono consulenza in materia di investimenti,
          raccomandazioni personalizzate, né un'offerta o sollecitazione ad acquistare o vendere strumenti finanziari.
        </p>

        <p>
          Non fare affidamento esclusivo su sistemi di intelligenza artificiale (inclusa Tradelia).
          Usa sempre queste analisi come <strong>strumento aggiuntivo di valutazione</strong>,
          e confrontati con un consulente finanziario abilitato prima di prendere decisioni operative.
        </p>

        <ul style="margin:.2rem 0 .7rem 1.1rem;list-style:disc">
          <li>Le fonti sono ritenute affidabili ma non garantiamo accuratezza, completezza o aggiornamento continuo.</li>
          <li>Scenari e simulazioni sono ipotetici e non rappresentano risultati futuri né performance attese.</li>
          <li>I mercati comportano rischi inclusa la perdita del capitale; la leva amplifica i rischi.</li>
        </ul>

        <p style="font-size:12.5px;color:var(--muted);margin-top:.5rem">
          Rif.: MiFID II (2014/65/UE), Reg. Delegato (UE) 2017/565, ESMA, CONSOB.
        </p>

        <div style="margin-top:.9rem;display:flex;gap:10px;justify-content:flex-end">
          <button class="btn btn-sm" id="mifid-accept" type="button">Accetto</button>
        </div>
      </section>
    `;

    // apri drawer in blocking
    window.Tradelia?.Drawer?.open({
      title:'Informativa MiFID',
      subtitle:'Obbligatoria alla prima apertura',
      html,
      blocking:true
    });

    // attach listener Accetto
    setTimeout(()=>{
      $('#mifid-accept')?.addEventListener('click', ()=>{
        localStorage.setItem(LS.mifid,'1');

        // sblocca drawer
        const root = window.Tradelia?.Drawer?.root;
        if(root){
          root.dataset.blocking='false';
          root.classList.remove('drawer--blocking');
        }

        // chiudi drawer davvero
        window.Tradelia?.Drawer?.close();
        window.Tradelia?.Drawer?.reallyClose?.();

        // riabilita scroll
        document.body.style.overflow='';
      }, { once:true });

      safeCreateIcons();
    },0);
  }

  $('#btn-mifid-open')?.addEventListener('click', openMiFID);

  // gating iniziale
  (function gate(){
    const acceptedPrivacy = localStorage.getItem(LS.privacy)==='1';
    const acceptedMiFID   = localStorage.getItem(LS.mifid)==='1';
    if(!acceptedPrivacy){
      openPrivacy();
      return;
    }
    if(!acceptedMiFID){
      openMiFID();
    }
  })();
}

/* ---------------------------------
   HEADER DATA (hero + footer)
   carica /report/reports/<id>/header.json
   popola hero ticker/prezzo/snapshot,
   aggiorna footer
--------------------------------- */
async function initHeaderData(){
  const base = `/report/reports/${getReportId()}`;
  const h = await loadJSON(`${base}/header.json`);

  // almeno l'anno in footer
  $('#footer-year').textContent = new Date().getFullYear();

  if(!h){
    safeCreateIcons();
    return;
  }

  // ticker / venue
  $('#hero-ticker').textContent = h.Ticker ?? '—';
  $('#hero-venue').textContent  = h.Venue ? `· ${h.Venue}` : '· —';

  // price
  const priceNum = (h.Price!=null && isFinite(+h.Price)) ? (+h.Price) : NaN;
  const priceStr = isFinite(priceNum) ? priceNum.toFixed(2) : '—';
  $('#hero-price').textContent = priceStr;
  $('#hero-price2').textContent= priceStr;

  // change
  const chgNum = (h.ChangePct!=null && isFinite(+h.ChangePct)) ? (+h.ChangePct) : NaN;
  const chgStr = isFinite(chgNum) ? chgNum.toFixed(2)+'%' : '—';
  const chgEl = $('#hero-change');
  chgEl.textContent = chgStr;
  chgEl.classList.toggle('chg--up',  chgNum>0);
  chgEl.classList.toggle('chg--down',chgNum<0);
  $('#hero-change2').textContent = chgStr;

  // state badge
  const st = (h.State ?? h.ReportState ?? '—');
  $('#hero-state').textContent = st;

  // snapshot start/end
  $('#hero-start').textContent = fmtDate(h.Start) || (h.Start ?? '—');
  $('#hero-end').textContent   = fmtDate(h.End)   || (h.End   ?? '—');
  setToneBar($('#tone-snap'),'n');

  // currency
  $('#hero-ccy').textContent = h.Currency ?? h.PxCcy ?? '—';
  setToneBar($('#tone-ccy'),'n');

  // change tone
  if(isFinite(chgNum)){
    setToneBar($('#tone-chg'), chgNum>0?'g':chgNum<0?'r':'n');
  }else{
    setToneBar($('#tone-chg'),'n');
  }

  // price tone neutral
  setToneBar($('#tone-price'),'n');

  // Freshness
  const fresh = h.FreshnessLabel ?? h.Freshness ?? '—';
  $('#hero-freshness').textContent = fresh;
  setToneBar(
    $('#tone-fresh'),
    /T-0/i.test(fresh) ? 'g' :
    /T-1/i.test(fresh) ? 'y' : 'r'
  );

  // Confidence
  const confNum = isFinite(+h.ConfidenceFinal) ? (+h.ConfidenceFinal) : NaN;
  $('#hero-confidence').textContent = isFinite(confNum) ? confNum.toFixed(2) : '—';
  if(isFinite(confNum)){
    setToneBar(
      $('#tone-conf'),
      confNum>=0.80?'g':confNum>=0.60?'y':'r'
    );
  }else{
    setToneBar($('#tone-conf'),'n');
  }

  // footer snapshot / updated / version
  const snapLabel = (h.Start && h.End)
    ? `${fmtDate(h.Start)} → ${fmtDate(h.End)}`
    : (h.Start ? fmtDate(h.Start) : '—');
  $('#footer-snapshot').textContent = snapLabel;
  $('#footer-updated').textContent  = h.UpdatedAt || h.End || '—';
  const v = h.Version || h.Build || h.ReportVersion;
  if(v) $('#footer-version').textContent = v;

  safeCreateIcons();
}

/* ---------------------------------
   SHARE OVERLAY
   (linkedin/x/reddit/copia link + Web Share API se mobile)
--------------------------------- */
function setupShare(){
  initShareSystem();
}

/* ---------------------------------
   MOUNT DINAMICO MODULI (F1A/F1B, F2...F5B)
   - definiamo mountTarget mapping
   - chiamiamo mountReport(reportId)
--------------------------------- */
async function mountDynamicModules(){
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.mountTarget = {
    F1:  '#mod-f1',
    F1A: '#mod-f1',
    F1B: '#mod-f1',
    F2:  '#mod-f2',
    F3:  '#mod-f3-core',
    F4:  '#mod-f4',
    F5:  '#mod-f5',
    F5B: '#mod-f5b',
    F6:  '#mod-f5b' // F6 lo possiamo mostrare in coda nella stessa strip
  };

  const reportId = getReportId();
  try{
    await mountReport(reportId);
  }catch(e){
    console.warn('[Tradelia][mountReport] errore', e);
  }

  // dopo il render moduli, rinfresca icone lucide
  safeCreateIcons();
}

/* ---------------------------------
   BOOTSTRAP SEQUENZA
--------------------------------- */

setupDrawer();          // Drawer globale e finestra MiFID (serve prima di gating)
setupThemeAndPrint();   // Tema, toggle, print
setupShare();           // Tasto condividi / overlay social
setupMetricInfo();      // Popover metriche e sheet mobile
setupGating();          // Privacy + MiFID gate (usa Drawer)
initHeaderData();       // Hero e footer dal JSON
mountDynamicModules();  // Monta F1/F2/... nel layout
