// ------------------------------------------------------------
// PANEL OVERLAY ANALITICO (drawer / audit / F1B ecc.)
//   Usa #panel-overlay
//   ✅ Mostra un SOLO pannello (mobile O desktop) a seconda del breakpoint
//   ✅ Allinea automaticamente al resize/orientamento
// ------------------------------------------------------------
//
// Struttura HTML attesa in index.html per #panel-overlay:
//
// <div id="panel-overlay" class="tl-panel-overlay noprint" aria-hidden="true">
//   <div class="tl-panel-backdrop" data-panel-close></div>
//
//   <!-- desktop -->
//   <aside class="tl-panel tl-panel--desktop" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">
//       <div>
//         <div id="panel-title" class="tl-panel__title"></div>
//         <div id="panel-subtitle" class="tl-panel__subtitle"></div>
//       </div>
//       <button class="btn btn-sm" data-panel-close>Chiudi</button>
//     </header>
//
//     <div id="panel-body" class="tl-panel__body"></div>
//     <footer class="tl-panel__footer" id="panel-footer"></footer>
//   </aside>
//
//   <!-- mobile -->
//   <aside class="tl-panel tl-panel--mobile" role="dialog" aria-modal="true">
//     <header class="tl-panel__header">
//       <div>
//         <div id="panel-title-mobile" class="tl-panel__title"></div>
//         <div id="panel-subtitle-mobile" class="tl-panel__subtitle"></div>
//       </div>
//       <button class="btn btn-sm" data-panel-close>Chiudi</button>
//     </header>
//
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
//     blocking: bool,
//     panelSize: "wide" | "xl" | undefined,
//     footerButtons: [ { label:"Chiudi", action: fn }, ... ],
//     footerTabs:    [ { key:"regime", label:"Regime attuale" }, ... ] // mobile tabbar sticky
//   }

// --- Controller modalità (evita "doppio pannello") --------------------------
const __panelMQ = window.matchMedia('(max-width: 767px)');
let __panelModeBound = false;
let __lastPanelRender = null; // { title, subtitle, bodyHTML, footerDeskHTML, footerMobHTML, panelSize, footerButtons }

function __applyPanelVisibility() {
  const overlay = document.getElementById('panel-overlay');
  if (!overlay) return;
  const desk = overlay.querySelector('.tl-panel--desktop');
  const mob  = overlay.querySelector('.tl-panel--mobile');
  if (!desk || !mob) return;

  const mobile = __panelMQ.matches;
  mob.style.display  = mobile ? 'block' : 'none';
  desk.style.display = mobile ? 'none'  : 'block';
}

function __renderIntoActiveContainer() {
  // Re-render nei contenitori corretti quando cambia il breakpoint
  if (!__lastPanelRender) return;
  const {
    title, subtitle, bodyHTML,
    footerDeskHTML, footerMobHTML,
    panelSize, footerButtons
  } = __lastPanelRender;

  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;

  const desk = overlayEl.querySelector('.tl-panel--desktop');
  const mob  = overlayEl.querySelector('.tl-panel--mobile');
  if (!desk || !mob) return;

  const isMobileNow = __panelMQ.matches;

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

  // Aggiorna titoli sempre (entrambi, non costa nulla)
  setText(titleDeskEl, title);   setText(subDeskEl, subtitle);
  setText(titleMobEl,  title);   setText(subMobEl,  subtitle);

  // Pulisci entrambi i corpi e riempi SOLO quello attivo
  setHTML(bodyDeskEl, "");
  setHTML(bodyMobEl,  "");
  if (isMobileNow) {
    setHTML(bodyMobEl,  bodyHTML);
  } else {
    setHTML(bodyDeskEl, bodyHTML);
  }

  // Footer: idem
  setHTML(footerDeskEl, "");
  setHTML(footerMobEl,  "");
  if (isMobileNow) {
    setHTML(footerMobEl,  footerMobHTML);
  } else {
    setHTML(footerDeskEl, footerDeskHTML);
  }

  // Larghezza desktop ("wide"/"xl")
  if (!isMobileNow) {
    const panelDesktop = desk;
    panelDesktop.classList.remove("tl-panel--wide","tl-panel--xl");
    if (panelSize === "wide") panelDesktop.classList.add("tl-panel--wide");
    else if (panelSize === "xl") panelDesktop.classList.add("tl-panel--xl");
  }

  // Bind footer actions sul container attivo
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

    // data-panel-close -> chiudi
    qsa("[data-panel-close]", scopeEl).forEach(btnEl => {
      btnEl.addEventListener("click", (ev) => {
        ev.stopPropagation();
        closePanel();
      });
    });
  }

  bindFooterButtons(isMobileNow ? footerMobEl : footerDeskEl, footerButtons);

  // Bind tooltip "?" dentro al drawer
  bindMetricInfoButtons(overlayEl);

  // Visibilità corretta
  __applyPanelVisibility();
}

// --- Open/Close --------------------------------------------------------------
function openPanel(opts) {
  closePanel(); // pulizia se per caso è rimasto aperto

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

  // ---------- BODY RENDERING ----------
  // - se panelSize === "wide" e c'è UNA sola sezione → prendi direttamente section.body
  // - altrimenti blocchi standard tl-panel-section
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
          ${ mta ? `<div class="tl-panel-section-meta">${mta}</div>` : `` }
        </section>
      `;
    }).join("");
  }

  // ---------- FOOTER RENDERING ----------
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
            flex:0 0 auto; white-space:nowrap;
            font-size:11px; line-height:1.2; font-weight:500;
            border-radius:8px; border:1px solid var(--br-soft);
            background:var(--surface-card); color:var(--muted);
            padding:.45rem .7rem; box-shadow:var(--shadow-card);
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
          position:sticky; right:0; flex-shrink:0;
          font-size:11.5px; line-height:1.2; font-weight:600;
          border-radius:8px; border:1px solid var(--ink);
          background:var(--ink); color:var(--surface-page);
          padding:.45rem .8rem; box-shadow:var(--shadow-card);
        "
      >
        Chiudi
      </button>
    `;

    return `
      <div
        class="f1b-footer-tabs-wrap"
        style="
          display:flex; align-items:center; gap:.5rem;
          border-top:1px solid var(--br-panel-divider);
          background:var(--surface-panel-head);
          background-image: radial-gradient(
            circle at 0% 0%,
            color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%,
            transparent 60%
          );
          padding:.6rem .75rem; box-shadow:0 -6px 12px rgba(0,0,0,.12);
          max-width:100%; overflow:hidden;
        "
      >
        <div
          class="f1b-footer-tabs-scroll"
          style="
            flex:1 1 auto; min-width:0; display:flex; align-items:center; gap:.5rem;
            overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none;
          "
        >
          ${pills}
        </div>
        ${closeBtnHTML}
      </div>
    `;
  }

  const footerMobHTML  = renderFooterTabs(footerTabs);
  const footerDeskHTML = renderFooterBtns(footerButtons);

  // ---------- Salva payload dell'ultimo render (serve per resize) ----------
  __lastPanelRender = {
    title, subtitle, bodyHTML,
    footerDeskHTML, footerMobHTML,
    panelSize, footerButtons
  };

  // ---------- Blocking / width / lock scroll ----------
  if (blocking) overlayEl.setAttribute("data-blocking", "true");
  else overlayEl.removeAttribute("data-blocking");

  document.body.classList.add("body--lock");
  overlayEl.setAttribute("aria-hidden", "false");

  // Render iniziale nei contenitori dell’attuale breakpoint
  __renderIntoActiveContainer();

  // Aggiorna visibilità (solo uno mostrato)
  __applyPanelVisibility();

  // Ascolta cambio breakpoint una sola volta (hot swap dei contenuti)
  if (!__panelModeBound) {
    __panelModeBound = true;
    __panelMQ.addEventListener('change', () => {
      __renderIntoActiveContainer();
    });
  }
}

function closePanel() {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  overlayEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body--lock");
}

// chiusura panel su backdrop o [data-panel-close]
document.addEventListener("click", (ev) => {
  const overlayEl = qs("#panel-overlay");
  if (!overlayEl) return;
  if (overlayEl.getAttribute("aria-hidden") === "true") return;

  const blocking = overlayEl.getAttribute("data-blocking") === "true";

  if (ev.target.closest("[data-panel-close]")) {
    closePanel();
    return;
  }
  const backdrop = ev.target.closest(".tl-panel-backdrop");
  if (backdrop && !blocking) {
    closePanel();
    return;
  }
});
