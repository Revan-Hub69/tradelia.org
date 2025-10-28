// /report/assets/js/ui-runtime.js
//
// UI runtime globale (no dati di mercato):
// - pannello informativo analitico (drawer F1B ecc.) -> #panel-overlay
// - pannello legale separato (Privacy / MiFID)       -> #legal-overlay
// - metric help ("?" tooltip) desktop/mobile
// - tema light/dark
// - share overlay
// - stampa (disattivata nell'UI premium)
//
// Questo file NON monta i moduli F1/F2/...: quello è app.js

// ------------------------------------------------------------
// Utility DOM
// ------------------------------------------------------------
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}
function setText(el, txt) {
  if (!el) return;
  el.textContent = txt;
}
function setHTML(el, html) {
  if (!el) return;
  el.innerHTML = html;
}
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// escape base per prevenire XSS nei testi dinamici
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

// ------------------------------------------------------------
// PANEL OVERLAY ANALITICO (drawer / audit / F1B ecc.)
//   Usa #panel-overlay
// ------------------------------------------------------------
//
// Struttura HTML attesa in index.html per #panel-overlay:
//
// <div id="panel-overlay" class="tl-panel-overlay noprint" aria-hidden="true">
//   <div class="tl-panel-backdrop" data-panel-close></div>
//
//   <!-- desktop -->
//   <aside class="tl-panel tl-panel--desktop" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">...</header>
//     <div id="panel-body" class="tl-panel__body"></div>
//     <footer class="tl-panel__footer" id="panel-footer"></footer>
//   </aside>
//
//   <!-- mobile -->
//   <aside class="tl-panel tl-panel--mobile" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">...</header>
//     <div id="panel-body-mobile" class="tl-panel__body"></div>
//     <footer class="tl-panel__footer" id="panel-footer-mobile"></footer>
//   </aside>
// </div>
//
// openPanel(opts):
//   {
//     title: "string",
//     subtitle: "string",
//     sections: [
//       { title:"...", body:"<p>html</p>", meta:"<small>html</small>" },
//       ...
//     ],
//     blocking: bool,          // se true non puoi chiudere toccando backdrop
//     panelSize: "wide" | "xl" | undefined,
//     footerButtons: [ { label:"Chiudi", action: fn }, ... ],
//     footerTabs:    [ { key:"regime", label:"Regime attuale" }, ... ] // mobile tabbar sticky
//   }

function openPanel(opts) {
  // prima di aprire un nuovo pannello analitico, chiudiamo se qualcosa è rimasto aperto
  closePanel();

  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const {
    title = "Dettagli",
    subtitle = "",
    sections = [],
    blocking = false,
    panelSize,
    footerButtons = [],
    footerTabs = []
  } = opts || {};

  // refs desktop
  const titleDeskEl  = qs("#panel-title");
  const subDeskEl    = qs("#panel-subtitle");
  const bodyDeskEl   = qs("#panel-body");
  const footerDeskEl = qs("#panel-footer");

  // refs mobile
  const titleMobEl   = qs("#panel-title-mobile");
  const subMobEl     = qs("#panel-subtitle-mobile");
  const bodyMobEl    = qs("#panel-body-mobile");
  const footerMobEl  = qs("#panel-footer-mobile");

  // header
  setText(titleDeskEl, title);
  setText(subDeskEl, subtitle);
  setText(titleMobEl, title);
  setText(subMobEl, subtitle);

  // corpo:
  // - caso "wide" con UNA sezione => usiamo direttamente section.body (layout libero)
  // - altrimenti costruiamo blocchi tl-panel-section standard
  let bodyHTML = "";
  if (panelSize === "wide" && sections.length === 1) {
    bodyHTML = sections[0].body || "";
  } else {
    bodyHTML = sections.map(section => {
      const st  = section.title   || "";
      const bd  = section.body    || "";
      const mta = section.meta    || "";
      return `
        <section class="tl-panel-section" style="margin-bottom:1rem;">
          ${
            st
              ? `<div class="tl-panel-section-title">
                   <div class="tl-panel-section-title-text">${escapeHtml(st)}</div>
                 </div>`
              : ``
          }
          <div class="tl-panel-section-text">${bd}</div>
          ${
            mta
              ? `<div class="tl-panel-section-meta">${mta}</div>`
              : ``
          }
        </section>
      `;
    }).join("");
  }

  setHTML(bodyDeskEl, bodyHTML);
  setHTML(bodyMobEl,  bodyHTML);

  // ---------- FOOTER RENDERING ----------
  // footerTabs = barra pill scrollabile sticky mobile (per F1B)
  // footerButtons = bottoni "Chiudi", ecc.

  function renderFooterBtns(arr) {
    if (!arr || !arr.length) {
      return `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;
    }
    return arr.map((btn, idx) => {
      return `<button class="btn btn-sm" data-panel-btn="${idx}">${escapeHtml(btn.label || "OK")}</button>`;
    }).join("");
  }

  function renderFooterTabs(tabsArr) {
    // se non ci sono tab mobile, fallback ai bottoni standard
    if (!tabsArr || !tabsArr.length) {
      return renderFooterBtns(footerButtons);
    }

    const pills = tabsArr.map(t => {
      return `
        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="${escapeHtml(t.key)}"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          ${escapeHtml(t.label)}
        </button>
      `;
    }).join("");

    const closeBtnHTML = `
      <button
        class="f1b-footer-close-btn"
        data-panel-close
        style="
          position:sticky;
          right:0;
          flex-shrink:0;

          font-size:11.5px;
          line-height:1.2;
          font-weight:600;

          border-radius:8px;
          border:1px solid var(--ink);
          background:var(--ink);
          color:var(--surface-page);

          padding:.45rem .8rem;
          box-shadow:var(--shadow-card);
        "
      >
        Chiudi
      </button>
    `;

    return `
      <div
        class="f1b-footer-tabs-wrap"
        style="
          display:flex;
          align-items:center;

          border-top:1px solid var(--br-panel-divider);
          background:var(--surface-panel-head);
          background-image:
            radial-gradient(
              circle at 0% 0%,
              color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%,
              transparent 60%
            );

          padding:.6rem .75rem;
          box-shadow:0 -6px 12px rgba(0,0,0,.12);
          max-width:100%;
          overflow:hidden;
          gap:.5rem;
        "
      >
        <div
          class="f1b-footer-tabs-scroll"
          style="
            flex:1 1 auto;
            min-width:0;
            display:flex;
            align-items:center;
            gap:.5rem;
            overflow-x:auto;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;
          "
        >
          ${pills}
        </div>

        ${closeBtnHTML}
      </div>
    `;
  }

  const mobileFooterHTML  = renderFooterTabs(footerTabs);
  const desktopFooterHTML = renderFooterBtns(footerButtons);

  setHTML(footerMobEl,  mobileFooterHTML);
  setHTML(footerDeskEl, desktopFooterHTML);

  // bind azioni custom + chiudi, sia desktop che mobile
  function bindFooterButtons(scopeEl, buttonsDefArr) {
    if (!scopeEl) return;

    // custom actions tipo data-panel-btn="0"
    qsa("[data-panel-btn]", scopeEl).forEach(btnEl => {
      const i = btnEl.getAttribute("data-panel-btn");
      if (buttonsDefArr[i] && typeof buttonsDefArr[i].action === "function") {
        btnEl.addEventListener("click", (ev) => {
          ev.stopPropagation();
          buttonsDefArr[i].action();
        });
      }
    });

    // fallback data-panel-close
    qsa("[data-panel-close]", scopeEl).forEach(btnEl => {
      btnEl.addEventListener("click", (ev) => {
        ev.stopPropagation();
        closePanel();
      });
    });
  }

  bindFooterButtons(footerDeskEl, footerButtons);
  bindFooterButtons(footerMobEl,  footerButtons);

  // blocking mode
  if (blocking) {
    overlayEl.setAttribute("data-blocking", "true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // gestisci varianti di larghezza desktop ("wide", "xl", default)
  const panelDesktop = qs(".tl-panel--desktop", overlayEl);
  if (panelDesktop) {
    panelDesktop.classList.remove("tl-panel--wide");
    panelDesktop.classList.remove("tl-panel--xl");

    if (panelSize === "wide") {
      // legacy (~560px)
      panelDesktop.classList.add("tl-panel--wide");
    } else if (panelSize === "xl") {
      // nuova misura larga (~50vw)
      panelDesktop.classList.add("tl-panel--xl");
    }
  }

  // lock scroll pagina dietro + mostra overlay
  document.body.classList.add("body--lock");
  overlayEl.setAttribute("aria-hidden", "false");

  // bind dei nuovi "?" apparsi dentro il drawer analitico
  bindMetricInfoButtons(overlayEl);
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body--lock");
}

// listener globale overlay analitico: chiudi panel su backdrop o [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  const btnClose = ev.target.closest("[data-panel-close]");
  if (btnClose) {
    closePanel();
    return;
  }

  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});

// ------------------------------------------------------------
// LEGAL OVERLAY (Privacy / MiFID separato dal drawer F1B)
//   Usa #legal-overlay
// ------------------------------------------------------------
//
// Struttura HTML attesa in index.html per #legal-overlay:
// (copia di panel-overlay ma con ID "legal-*", e data-legal-close)

function openLegalPanel(opts) {
  // chiudiamo eventuale legale aperto, così non si accumula
  closeLegalPanel();

  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;

  const {
    title = "Informativa",
    subtitle = "",
    body = "",
    blocking = false,
    footerButtons = []
  } = opts || {};

  // refs desktop
  const tDesk  = qs("#legal-title");
  const sDesk  = qs("#legal-subtitle");
  const bDesk  = qs("#legal-body");
  const fDesk  = qs("#legal-footer");

  // refs mobile
  const tMob   = qs("#legal-title-mobile");
  const sMob   = qs("#legal-subtitle-mobile");
  const bMob   = qs("#legal-body-mobile");
  const fMob   = qs("#legal-footer-mobile");

  setText(tDesk, title);
  setText(sDesk, subtitle);
  setText(tMob,  title);
  setText(sMob,  subtitle);

  setHTML(bDesk, body);
  setHTML(bMob,  body);

  function renderFooter(arr) {
    if (!arr || !arr.length) {
      return `<button class="btn btn-sm" data-legal-close>Chiudi</button>`;
    }
    return arr.map((b,i)=>
      `<button class="btn btn-sm" data-legal-btn="${i}">${escapeHtml(b.label||"OK")}</button>`
    ).join("");
  }

  const footerHTML = renderFooter(footerButtons);
  setHTML(fDesk, footerHTML);
  setHTML(fMob,  footerHTML);

  // bind pulsanti nel footer (desktop e mobile)
  function bindLegalFooterButtons(scope, defs) {
    if (!scope) return;

    // azioni custom (es. "Ho letto")
    qsa("[data-legal-btn]", scope).forEach(btn=>{
      const i = btn.getAttribute("data-legal-btn");
      if (defs[i] && typeof defs[i].action==="function") {
        btn.addEventListener("click", ev=>{
          ev.stopPropagation();
          defs[i].action();
        });
      }
    });

    // chiudi overlay legale
    qsa("[data-legal-close]", scope).forEach(btn=>{
      btn.addEventListener("click", ev=>{
        ev.stopPropagation();
        closeLegalPanel();
      });
    });
  }

  bindLegalFooterButtons(fDesk, footerButtons);
  bindLegalFooterButtons(fMob,  footerButtons);

  // blocking
  if (blocking) {
    overlayEl.setAttribute("data-blocking","true");
  } else {
    overlayEl.removeAttribute("data-blocking");
  }

  // lock scroll body & mostra overlay legale
  document.body.classList.add("body--lock");
  overlayEl.setAttribute("aria-hidden","false");

  // i pannelli Privacy/MiFID non hanno tooltip "?" metriche di mercato,
  // quindi NON richiamiamo bindMetricInfoButtons qui.
}

function closeLegalPanel() {
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden","true");
  document.body.classList.remove("body--lock");
}

// listener globale overlay legale: chiudi su backdrop o [data-legal-close]
document.addEventListener("click", ev=>{
  const overlayEl = qs("#legal-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden")==="true") return;

  const blocking = overlayEl.getAttribute("data-blocking")==="true";

  if (ev.target.closest("[data-legal-close]")) {
    closeLegalPanel();
    return;
  }

  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking && overlayEl.contains(backdrop)) {
    closeLegalPanel();
    return;
  }
});

// ------------------------------------------------------------
// PANNELLI: PRIVACY / MIFID / AUDIT
// ------------------------------------------------------------
//
// NOTA IMPORTANTE:
// - Privacy e MiFID ORA usano openLegalPanel(), quindi sono separati dal drawer F1B.
// - Audit (qualità dati) resta nel pannello analitico -> openPanel().

function openPrivacyPanel() {
  openLegalPanel({
    title: "Privacy & Trasparenza",
    subtitle: "Dati minimi. Nessun tracciamento pubblicitario.",
    body: `
  <section style="font-size:13px;line-height:1.5;color:var(--ink);">

    <div class="legal-callout">
      <div class="legal-callout-title">Trasparenza dati</div>
      <div class="legal-callout-text">
        Niente profilazione pubblicitaria. Le preferenze restano sul tuo dispositivo.
        Non rivendiamo le tue informazioni.
      </div>
    </div>

    <p>
      Tradelia AI adotta un approccio “privacy first”.
      Vogliamo darti analisi e strumenti educativi con il minimo indispensabile
      di dati personali.
    </p>

    <p>
      <strong>Nessun cookie di profilazione pubblicitaria.</strong><br/>
      Non facciamo retargeting, remarketing o costruzione di liste commerciali
      da rivendere a terzi.
    </p>

    <p>
      <strong>Preferenze locali.</strong><br/>
      Tema (chiaro/scuro), consenso e alcune impostazioni dell’interfaccia
      possono essere salvati in <code>localStorage</code> sul tuo browser,
      solo per migliorare l’esperienza. Restano sul tuo device.
    </p>

    <p>
      <strong>Dati finanziari personali.</strong><br/>
      Non raccogliamo automaticamente patrimonio, posizioni o ordini.
      Se ci scrivi tu qualcosa di personale (es. “sono 70% tech USA”),
      lo tratteremo come input per la parte educativa,
      non per profilarti a fini pubblicitari o venderti come target.
    </p>

    <p>
      <strong>Fonti di mercato.</strong><br/>
      Alcuni numeri o indicazioni arrivano da fonti esterne
      (es. Bloomberg, Reuters, CBOE, FRED, ecc.).
      Li rielaboriamo a scopo didattico; quei dati restano proprietà
      delle rispettive fonti.
    </p>

    <p style="font-size:12px;line-height:1.4;color:var(--muted);margin-top:1rem;">
      Riferimenti normativi: GDPR (UE 2016/679), Direttiva ePrivacy,
      Linee Guida EDPB su trasparenza e minimizzazione.
    </p>
  </section>
`,
    blocking: false,
    footerButtons: [
      { label: "Chiudi", action: () => closeLegalPanel() }
    ]
  });
}


// MiFID è blocking: true, e "Ho letto" salva il flag
function openMifidPanel() {
  openLegalPanel({
    title: "Informativa MiFID",
    subtitle: "Prima di visualizzare il report: contenuto educativo, non è una raccomandazione operativa.",
    body: `
  <section style="font-size:13px;line-height:1.5;color:var(--ink);">

    <div class="legal-callout">
      <div class="legal-callout-title">Importante</div>
      <div class="legal-callout-text">
        Le informazioni che stai leggendo hanno scopo educativo e informativo.
        Non sono un suggerimento operativo personalizzato e non sono un invito a comprare o vendere.
      </div>
    </div>

    <p>
      Tradelia AI è una piattaforma di analisi e alfabetizzazione finanziaria.
      Il nostro obiettivo è aiutarti a capire meglio il contesto del mercato:
      cosa sta guidando il rischio, come si stanno muovendo volatilità, credito,
      liquidità e narrativa istituzionale.
    </p>

    <p>
      <strong>Non forniamo una raccomandazione personalizzata di investimento
      ai sensi di MiFID II.</strong><br/>
      Le sezioni del report (F1, F2, F3, F4, F5, F5B, F6) descrivono scenari di
      mercato, fattori di rischio e comportamenti degli operatori,
      con finalità didattica. Non sono una strategia costruita su misura per te.
    </p>

    <p>
      Non gestiamo portafogli, non prendiamo in carico capitali,
      non eseguiamo ordini e non sollecitiamo operazioni.
      Non stiamo valutando la tua situazione patrimoniale,
      la tua tolleranza al rischio o i tuoi obiettivi personali.
    </p>

    <p>
      Alcuni elementi (per esempio livelli tecnici, “tone”
      verde/giallo/rosso, bias rischio vs difensivi, curva tassi,
      spread di credito, ecc.) sono indicatori sintetici pensati per
      aiutarti a leggere il contesto. <strong>Non sono garanzia di
      risultato futuro e non vanno interpretati come “entra/esci ora”.</strong>
    </p>

    <p>
      I mercati finanziari possono essere volatili e anche movimenti rapidi e
      imprevisti possono comportare perdite parziali o totali del capitale.
      Le performance passate o gli scenari ipotetici non anticipano
      automaticamente il futuro.
    </p>

    <p>
      <strong>Prima di prendere decisioni reali su soldi veri,
      confrontati sempre con un intermediario regolamentato o un consulente
      abilitato.</strong> Solo loro possono dirti se un’esposizione è
      adatta alla tua situazione specifica.
    </p>

    <p style="font-size:12px;line-height:1.4;color:var(--muted);margin-top:1rem;">
      Riferimenti normativi principali: MiFID II, regolamentazione ESMA sulla
      consulenza in materia di investimenti e tutela dell’investitore retail.
    </p>
  </section>
`,
    blocking: true,
    footerButtons: [
      { 
        label: "Ho letto", 
        action: () => {
          try {
            localStorage.setItem("mifidAcknowledged", "true");
          } catch(e){}
          closeLegalPanel();
        }
      }
    ]
  });
}


// pannello Audit/Qualità dati generico richiamabile dai moduli
function openAuditPanel(auditData) {
  const a = auditData || {};
  const lag   = (a.feed_lag_days ?? "—");
  const conf  = (a.confidence    ?? "—");
  const integ = (a.integrity     ?? "—");
  const src   = (a.source_sync   || "—");
  const notes = (a.notes         || "");

  openPanel({
    title: "Audit dati / Fonti",
    subtitle: "Qualità campione e latenza feed",
    sections: [
      {
        title: "Origine dati",
        body: `
          <p>
            <strong>Fonte primaria:</strong> ${escapeHtml(src)}<br/>
            <strong>Lag feed (giorni):</strong> ${escapeHtml(String(lag))}<br/>
            <strong>Confidence (0-1):</strong> ${escapeHtml(String(conf))}<br/>
            <strong>Integrità dataset:</strong> ${escapeHtml(String(integ))}
          </p>
          ${ notes
              ? `<p style="margin-top:.5rem;">${escapeHtml(notes)}</p>`
              : `` }
        `,
        meta: `
          Questo pannello ha finalità informative/formative.
          Non è una validazione regolamentare e non sostituisce
          la due diligence dell'investitore.
        `
      },
      {
        title: "Avvertenza MiFID",
        body: `
          <p>
            Prima di qualsiasi scelta reale verifica sempre adeguatezza / appropriatezza
            con un consulente autorizzato in linea con MiFID II.
          </p>
        `,
        meta: `
          Tradelia AI non fornisce consulenza personalizzata
          e non raccoglie ordini o capitali.
        `
      }
    ],
    blocking: false,
    panelSize: "wide",
    footerButtons: [
      { label: "Chiudi", action: () => closePanel() }
    ],
    footerTabs: []
  });
}

// ------------------------------------------------------------
// METRIC TOOLTIP SYSTEM
// ------------------------------------------------------------
//
// /report/assets/glossary.json :
// {
//   "Snapshot": { "title": "...", "what": "...", "how": "...", "source": "..." },
//   "Price":    { ... },
//   ...
// }

let __TradeliaGlossary = {};

async function loadGlossary() {
  try {
    const res = await fetch("/report/assets/glossary.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data && typeof data === "object") {
      __TradeliaGlossary = data;
    } else {
      __TradeliaGlossary = {};
    }
  } catch (err) {
    console.warn("⚠️ Impossibile caricare /report/assets/glossary.json", err);
    __TradeliaGlossary = {};
  }
}

function getGlossaryEntry(key) {
  const raw = __TradeliaGlossary[key] || {};
  return {
    title:  raw.title  || key || "—",
    what:   raw.what   || "—",
    how:    raw.how    || "—",
    source: raw.source || ""
  };
}

// stato popover desktop aperto
let currentPopoverOpen = false;

// helper: costruisce HTML per corpo tooltip (what/how)
function buildMetricHTML(info) {
  const whatHTML = `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;color:var(--ink);margin-bottom:.25rem;">Cosa mostra</div>
      <div style="color:var(--ink);">${escapeHtml(info.what)}</div>
    </div>
  `;

  const howHTML = `
    <div style="font-size:13px;line-height:1.45;color:var(--ink);margin-bottom:.75rem;">
      <div style="font-weight:600;color:var(--ink);margin-bottom:.25rem;">Come si usa</div>
      <div style="color:var(--ink);">${escapeHtml(info.how)}</div>
    </div>
  `;

  return whatHTML + howHTML;
}

// --- desktop popover ---
function openMetricDesktop(btnEl) {
  const pop = qs("#metric-popover");
  if (!pop) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-popover-title");
  const bodyEl   = qs("#metric-popover-body");
  const sourceEl = qs("#metric-popover-source");

  setText(titleEl, info.title || key || "—");
  bodyEl.innerHTML = buildMetricHTML(info);

  sourceEl.innerHTML = info.source
    ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}`
    : "";

  // posizionamento
  const rect = btnEl.getBoundingClientRect();
  const OFFSET_X = 8;
  const OFFSET_Y = 4;

  let left = rect.left + window.scrollX + OFFSET_X;
  let top  = rect.bottom + window.scrollY + OFFSET_Y;

  pop.style.position = "absolute";
  pop.style.maxWidth = "320px";
  pop.style.left = left + "px";
  pop.style.top  = top  + "px";
  pop.style.right = "auto";
  pop.style.bottom = "auto";
  pop.setAttribute("aria-hidden", "false");

  // clamp nel viewport
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const popRect = pop.getBoundingClientRect();

  if (popRect.right > vpW - 8) {
    const diffX = popRect.right - (vpW - 8);
    left = left - diffX;
  }
  if (left < window.scrollX + 8) {
    left = window.scrollX + 8;
  }

  if (popRect.bottom > vpH - 8) {
    top = rect.top + window.scrollY - popRect.height - OFFSET_Y;
  }
  if (top < window.scrollY + 8) {
    top = window.scrollY + 8;
  }

  pop.style.left = left + "px";
  pop.style.top  = top  + "px";

  currentPopoverOpen = true;
}

function closeMetricDesktop() {
  const pop = qs("#metric-popover");
  if (!pop) return;
  pop.setAttribute("aria-hidden", "true");
  currentPopoverOpen = false;
}

// --- mobile modal ---
function openMetricMobile(btnEl) {
  const modal = qs("#metric-modal");
  if (!modal) return;

  const key = btnEl.getAttribute("data-metric");
  const info = getGlossaryEntry(key);

  const titleEl  = qs("#metric-modal-title");
  const bodyEl   = qs("#metric-modal-body");
  the sourceEl = qs("#metric-modal-source");

  setText(titleEl, info.title || key || "—");
  bodyEl.innerHTML = buildMetricHTML(info);

  sourceEl.innerHTML = info.source
    ? `<span style="font-weight:600;">Fonte</span>: ${escapeHtml(info.source)}`
    : "";

  modal.setAttribute("aria-hidden","false");
}

function closeMetricMobile() {
  const modal = qs("#metric-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden","true");
}

// bind dei bottoni "?" in uno scope (card, drawer ecc.)
function bindMetricInfoButtons(rootScope) {
  const scope = rootScope || document;

  qsa(".info-btn", scope).forEach(btn => {
    if (btn.__metricBound) return;
    btn.__metricBound = true;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (isMobile()) {
        openMetricMobile(btn);
      } else {
        if (currentPopoverOpen) {
          closeMetricDesktop();
          currentPopoverOpen = false;
        }
        openMetricDesktop(btn);
      }
    });
  });
}

// chiusura popover desktop con X
const popClose = qs("#metric-popover-close");
if (popClose) {
  popClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMetricDesktop();
  });
}

// chiusura popover desktop clic fuori
document.addEventListener("click", (ev) => {
  const pop = qs("#metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  if (pop.contains(ev.target)) return;
  if (ev.target.closest(".info-btn")) return;

  closeMetricDesktop();
});

// chiusura modal mobile (backdrop o [data-metric-close])
qsa("[data-metric-close]").forEach(btn => {
  btn.addEventListener("click", () => {
    closeMetricMobile();
  });
});

// ------------------------------------------------------------
// THEME SWITCH (light / dark)
// ------------------------------------------------------------
function initThemeToggle() {
  const btnTheme = qs("#btn-theme");
  // può anche non esserci su alcune pagine, quindi non usciamo subito

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("tradelia-theme", theme);
    } catch(e){}
  }

  // inizializzazione preferenza utente o default dark
  (function initFromStorage(){
    try {
      const saved = localStorage.getItem("tradelia-theme");
      if (saved === "dark" || saved === "light") {
        // l'utente aveva già scelto → rispetta
        applyTheme(saved);
      } else {
        // prima visita → forza dark come default premium
        applyTheme("dark");
      }
    } catch(e){
        // se localStorage non è accessibile, fallback dark
        applyTheme("dark");
    }
  })();

  // se il bottone esiste, abilita toggle manuale
  if (btnTheme) {
    btnTheme.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      const next = (cur === "light" ? "dark" : "light");
      applyTheme(next);
    });
  }
}

// ------------------------------------------------------------
// PRINT (disattivata per versione premium - funzione lasciata per futuro)
// ------------------------------------------------------------
function initPrintButtons() {
  const p1 = qs("#btn-print");
  const p2 = qs("#btn-print-2");
  [p1,p2].forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.print();
    });
  });
}

// ------------------------------------------------------------
// SHARE OVERLAY
// ------------------------------------------------------------
//
// HTML opzionale (se esiste #share-overlay):
// <div id="share-overlay" class="share-overlay" aria-hidden="true">…</div>
// <button id="btn-share">Condividi</button>

function initShareOverlay() {
  const overlay = qs("#share-overlay");
  const btnOpen = qs("#btn-share");
  if (!overlay || !btnOpen) return;

  const closeElems = qsa("[data-share-close]", overlay);
  const copyBtns   = qsa("[data-share-svc='copy'], #share-copy-btn", overlay);

  function openShare() {
    const linkField = qs("#share-link-field");
    if (linkField) {
      linkField.textContent = window.location.href;
    }
    overlay.setAttribute("aria-hidden","false");
  }
  function closeShare() {
    overlay.setAttribute("aria-hidden","true");
  }

  btnOpen.addEventListener("click", openShare);
  closeElems.forEach(el => el.addEventListener("click", closeShare));

  copyBtns.forEach(el => {
    el.addEventListener("click", () => {
      const url = window.location.href;
      try {
        navigator.clipboard.writeText(url);
      } catch(e){}
    });
  });
}

// ------------------------------------------------------------
// BOTTONI LEGALI (Privacy / MiFID)
// ------------------------------------------------------------
function initLegalButtons() {
  const privBtn = qs("#btn-privacy-open");
  if (privBtn) {
    privBtn.addEventListener("click", () => {
      openPrivacyPanel();
    });
  }

  const mifidBtn = qs("#btn-mifid-open");
  if (mifidBtn) {
    mifidBtn.addEventListener("click", () => {
      openMifidPanel();
    });
  }
}

// ------------------------------------------------------------
// EXPORT API GLOBALE
// ------------------------------------------------------------
window.__TradeliaUI = {
  openPanel,
  closePanel,
  openPrivacyPanel,
  openMifidPanel,
  openAuditPanel,
  bindMetricInfoButtons,
  openLegalPanel,
  closeLegalPanel
};

// retrocompat
window.openPanel = openPanel;
window.closePanel = closePanel;

// ------------------------------------------------------------
// BOOT
// ------------------------------------------------------------
async function bootUIRuntime() {
  // 1. Glossario prima di bindare i tooltip
  await loadGlossary();

  // 2. init UI globali
  initThemeToggle();
  // initPrintButtons(); // disattivato per versione premium
  initShareOverlay();
  initLegalButtons();

  // 3. bind tooltip "?" già presenti
  bindMetricInfoButtons(document);

  // 4. icone lucide
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch(e){
      console.warn("lucide.createIcons() error:", e);
    }
  }

  // 5. footer year auto se vuoto
  const footerYearEl = qs("#footer-year");
  if (footerYearEl && !footerYearEl.textContent.trim()) {
    const now = new Date();
    footerYearEl.textContent = now.getFullYear();
  }
}

// run
bootUIRuntime();

// Harden export di nuovo, in caso venga sovrascritto
if (!window.__TradeliaUI) window.__TradeliaUI = {};
window.__TradeliaUI.openPanel = openPanel;
window.__TradeliaUI.closePanel = closePanel;
window.__TradeliaUI.openPrivacyPanel = openPrivacyPanel;
window.__TradeliaUI.openMifidPanel = openMifidPanel;
window.__TradeliaUI.openAuditPanel = openAuditPanel;
window.__TradeliaUI.bindMetricInfoButtons = bindMetricInfoButtons;
window.__TradeliaUI.openLegalPanel = openLegalPanel;
window.__TradeliaUI.closeLegalPanel = closeLegalPanel;

// --- Mostra MiFID solo al primo accesso (obbligatorio) ---
(function enforceMifidFirstVisit() {
  try {
    const hasAcceptedMifid = localStorage.getItem("mifidAcknowledged");

    if (!hasAcceptedMifid) {
      if (window.__TradeliaUI && typeof window.__TradeliaUI.openMifidPanel === "function") {
        window.__TradeliaUI.openMifidPanel();
      }
      // NON salviamo qui. Salviamo solo su "Ho letto".
    }
  } catch (e) {
    console.warn("enforceMifidFirstVisit error:", e);
  }
})();
