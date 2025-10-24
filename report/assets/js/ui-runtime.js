// /report/assets/js/ui-runtime.js — versione corretta con metric modal e MiFID Tradelia

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
function numFmt(v){ if(v==null||Number.isNaN(v))return"—"; return Number(v).toFixed(2).replace('.',','); }
function getGlossary(){ return (window.Tradelia && window.Tradelia.glossary) || {}; }
function isMobile(){ return window.matchMedia("(max-width: 767px)").matches; }

// ------------------------------------------------------------
// PANEL (MiFID / Privacy / Audit)
// ------------------------------------------------------------
function openPanel({ title, subtitle, sections, footerButtons }){
  const ov=document.getElementById("panel-overlay"); if(!ov)return;
  const fill=(id,html)=>{const e=document.getElementById(id);if(e)e.innerHTML=html;};
  fill("panel-title",escapeHtml(title||"—"));
  fill("panel-subtitle",escapeHtml(subtitle||""));
  fill("panel-title-mobile",escapeHtml(title||"—"));
  fill("panel-subtitle-mobile",escapeHtml(subtitle||""));
  const sectHTML=(sections||[]).map(s=>`
    <section class="tl-panel-section">
      <div class="tl-panel-section-title">${escapeHtml(s.heading||"")}</div>
      <div class="tl-panel-section-text">${s.bodyHtml||""}</div>
      ${s.metaHtml?`<div class="tl-panel-section-meta">${s.metaHtml}</div>`:""}
    </section>`).join("");
  fill("panel-body",sectHTML);
  fill("panel-body-mobile",sectHTML);
  const footerHTML=(footerButtons||[{label:"Chiudi",role:"close"}]).map(b=>
    `<button class="btn btn-sm"${b.role==="close"?' data-panel-close':''}>${escapeHtml(b.label)}</button>`
  ).join("");
  fill("panel-footer",footerHTML); fill("panel-footer-mobile",footerHTML);
  ov.setAttribute("aria-hidden","false");
}
function closePanel(){ const ov=document.getElementById("panel-overlay"); if(ov)ov.setAttribute("aria-hidden","true"); }
document.addEventListener("click",e=>{
  if(e.target.matches("[data-panel-close],.tl-panel-backdrop")||e.target.closest?.("[data-panel-close]"))closePanel();
});
window.openPanel=openPanel; window.closePanel=closePanel;

// ------------------------------------------------------------
// PANEL CONTENUTI — MIFID / PRIVACY / AUDIT
// ------------------------------------------------------------
function openMifidPanel(){
  openPanel({
    title:"Informativa MiFID · Tradelia AI",
    subtitle:"Documento educativo, non operativo — rispetta la direttiva MiFID II",
    sections:[
      {
        heading:"Ruolo di Tradelia AI",
        bodyHtml:
        "Tradelia AI è una piattaforma informativa e formativa. I report, le analisi e le strategie " +
        "sono generati con finalità <strong>educative, analitiche e di ricerca di mercato</strong>. " +
        "Non rappresentano consulenza personalizzata o raccomandazione di investimento. " +
        "Tradelia non raccoglie dati personali, obiettivi finanziari o profili di rischio degli utenti."
      },
      {
        heading:"Consulenti e soggetti autorizzati",
        bodyHtml:
        "Qualsiasi decisione reale d’investimento deve essere discussa con un <strong>consulente finanziario autorizzato</strong> " +
        "o un intermediario abilitato, che valuterà l’adeguatezza e l’appropriatezza in base al profilo individuale " +
        "come richiesto dalla <em>Direttiva MiFID II</em>.",
        metaHtml:
        "Tradelia AI non effettua profilazione, non gestisce capitali e non sollecita il pubblico risparmio."
      },
      {
        heading:"Rischi e responsabilità",
        bodyHtml:
        "I mercati finanziari comportano <strong>rischio di perdita totale o parziale del capitale</strong>. " +
        "Le performance passate non sono indicative di risultati futuri. Ogni operazione reale " +
        "deve considerare l’orizzonte temporale, la tolleranza al rischio e la situazione patrimoniale personale. " +
        "La fiscalità varia in base al Paese e alla condizione soggettiva del contribuente."
      },
      {
        heading:"Broker e riferimenti operativi",
        bodyHtml:
        "I broker o intermediari citati nella sezione F6 (<em>Broker Selezionati</em>) sono forniti solo a titolo informativo " +
        "per agevolare la ricerca di controparti regolamentate. La loro menzione non costituisce raccomandazione " +
        "di apertura o utilizzo dei servizi.",
        metaHtml:
        "È responsabilità dell’utente verificare la conformità, la licenza e le condizioni economiche di ciascun broker."
      },
      {
        heading:"Licenze e trasparenza",
        bodyHtml:
        "Tradelia AI opera come strumento informativo indipendente e non è soggetto a licenza MiFID. " +
        "I contenuti possono citare fonti istituzionali (Bloomberg, Reuters, CFTC, BCE, FMI, ecc.) " +
        "e report accademici per scopi di analisi macro e formativa. Tutti i marchi citati appartengono ai rispettivi titolari."
      }
    ],
    footerButtons:[{label:"Ho letto e comprendo i limiti",role:"close"}]
  });
}
function openPrivacyPanel(){
  openPanel({
    title:"Privacy & Trasparenza",
    subtitle:"Nessuna profilazione — preferenze salvate in locale.",
    sections:[
      {
        heading:"Cookie e tracciamento",
        bodyHtml:
        "Tradelia AI non utilizza cookie di profilazione né sistemi di advertising comportamentale. " +
        "Non condividiamo dati con terze parti per fini commerciali."
      },
      {
        heading:"Dati locali",
        bodyHtml:
        "Le uniche preferenze salvate (tema, consensi) restano nel tuo browser " +
        "tramite localStorage e non vengono trasmesse a server esterni."
      }
    ],
    footerButtons:[{label:"Chiudi",role:"close"}]
  });
}
function openAuditPanel(a={}){
  openPanel({
    title:"Audit dati F1",
    subtitle:"Fonti e qualità del campione",
    sections:[
      {
        heading:"Origine dati",
        bodyHtml:
        `<div><strong>Fonte:</strong> ${escapeHtml(a.source_sync||"—")}</div>`+
        `<div><strong>Lag (giorni):</strong> ${escapeHtml(numFmt(a.feed_lag_days))}</div>`+
        `<div><strong>Confidence:</strong> ${escapeHtml(numFmt(a.confidence))}</div>`+
        `<div><strong>Integrità:</strong> ${escapeHtml(numFmt(a.integrity))}</div>`
      },
      {
        heading:"Avvertenze MiFID",
        bodyHtml:
        "Il modulo F1 mostra una fotografia di mercato a fini formativi. " +
        "Non è una raccomandazione esecutiva. Prima di qualsiasi operatività, " +
        "rivolgiti a un consulente o intermediario autorizzato."
      }
    ],
    footerButtons:[{label:"Chiudi",role:"close"}]
  });
}

// ------------------------------------------------------------
// METRIC TOOLTIP
// ------------------------------------------------------------
function openMetricPopover(btn,{title,body,source}){
  const p=document.getElementById("metric-popover"); if(!p)return;
  document.getElementById("metric-popover-title").textContent=title||"—";
  document.getElementById("metric-popover-body").textContent=body||"—";
  document.getElementById("metric-popover-source").textContent=source||"";
  const r=btn.getBoundingClientRect(); let left=r.left+window.scrollX, top=r.bottom+window.scrollY+8;
  const popW=320; const maxLeft=window.scrollX+window.innerWidth-popW-8;
  if(left>maxLeft)left=maxLeft;
  if(top+200>window.scrollY+window.innerHeight)top=r.top+window.scrollY-200-8;
  p.style.left=left+"px"; p.style.top=top+"px"; p.setAttribute("aria-hidden","false");
}
function closeMetricPopover(){const p=document.getElementById("metric-popover");if(p)p.setAttribute("aria-hidden","true");}
function openMetricModal({title,body,source}){
  const m=document.getElementById("metric-modal"); if(!m)return;
  document.getElementById("metric-modal-title").textContent=title||"—";
  document.getElementById("metric-modal-body").textContent=body||"—";
  document.getElementById("metric-modal-source").textContent=source||"";
  m.setAttribute("aria-hidden","false");
}
function closeMetricModal(){const m=document.getElementById("metric-modal");if(m)m.setAttribute("aria-hidden","true");}

document.addEventListener("click",e=>{
  if(e.target.id==="metric-popover-close"||e.target.closest?.("#metric-popover-close"))closeMetricPopover();
  if(e.target.matches("[data-metric-close],.tl-metric-modal-backdrop")||e.target.closest?.("[data-metric-close]"))closeMetricModal();
});
document.addEventListener("click",e=>{
  const btn=e.target.closest?.(".info-btn,.metric-help"); if(!btn)return;
  const k=btn.getAttribute("data-metric"); const g=getGlossary();
  const d=g[k]||{title:k||"—",short:"—",long:"—",source:""};
  const title=d.title||k||"—"; const body=d.long||d.short||"—"; const src=d.source||"";
  if(isMobile())openMetricModal({title,body,source:src}); else openMetricPopover(btn,{title,body,source:src});
});
document.addEventListener("click",e=>{
  const p=document.getElementById("metric-popover");
  if(p&&p.getAttribute("aria-hidden")==="false"&&!p.contains(e.target)&&!e.target.classList?.contains("info-btn"))closeMetricPopover();
});

// ------------------------------------------------------------
// BOTTONI GLOBALI
// ------------------------------------------------------------
function toggleTheme(){
  const html=document.documentElement;
  const curr=html.getAttribute("data-theme")||"light";
  const next=curr==="light"?"dark":"light";
  html.setAttribute("data-theme",next);
  try{localStorage.setItem("tradelia-theme",next);}catch(e){}
}
document.addEventListener("click",e=>{
  if(e.target.id==="btn-mifid-open")openMifidPanel();
  if(e.target.id==="btn-privacy-open")openPrivacyPanel();
  if(e.target.id==="btn-print")window.print();
  if(e.target.id==="btn-theme"||e.target.closest?.("#btn-theme"))toggleTheme();
  const auditBtn=e.target.closest?.("[data-open-drawer]");
  if(auditBtn&&(auditBtn.getAttribute("data-open-drawer")==="audit-f1a"||auditBtn.getAttribute("data-open-drawer")==="audit-f1b"))
    openAuditPanel(auditBtn.__auditData||{});
});

// ------------------------------------------------------------
// API per moduli (attach dati audit)
// ------------------------------------------------------------
window.__TradeliaUI={
  attachAuditData(btn,a){ if(btn)btn.__auditData=a||{}; }
};
