// /report/assets/js/ui-runtime.js

// =====================================================
// UTILITIES
// =====================================================

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function numFmt(v){
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  return n.toFixed(2).replace('.', ',');
}

// Glossario metriche ("Freshness", "ConfidenceFinal", ecc.)
function getGlossary() {
  return (window.Tradelia && window.Tradelia.glossary) || {};
}

// Mobile check
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}


// =====================================================
// PANEL OVERLAY (MiFID / Privacy / Audit / ecc.)
// =====================================================
//
// Apriamo un pannello istituzionale con sezioni leggibili.
// Desktop = side panel a destra.
// Mobile = bottom sheet alta 80-90% viewport.
// -----------------------------------------------------

function openPanel({ title, subtitle, sections, footerButtons }) {
  const overlay = document.getElementById("panel-overlay");
  if (!overlay) return;

  // desktop refs
  const tDesk = document.getElementById("panel-title");
  const sDesk = document.getElementById("panel-subtitle");
  const bDesk = document.getElementById("panel-body");
  const fDesk = document.getElementById("panel-footer");

  // mobile refs
  const tMob = document.getElementById("panel-title-mobile");
  const sMob = document.getElementById("panel-subtitle-mobile");
  const bMob = document.getElementById("panel-body-mobile");
  const fMob = document.getElementById("panel-footer-mobile");

  // costruiamo le sezioni HTML
  const htmlSections = (sections || []).map(sec => {
    return `
      <section class="tl-panel-section">
        <div class="tl-panel-section-title">${escapeHtml(sec.heading || "")}</div>
        <div class="tl-panel-section-text">${sec.bodyHtml || ""}</div>
        ${sec.metaHtml
          ? `<div class="tl-panel-section-meta">${sec.metaHtml}</div>`
          : ""
        }
      </section>
    `;
  }).join("");

  // footer buttons
  const footerHtml = (footerButtons || []).map(btn => {
    // btn = {label, role} role could be "close" or "ack"
    if (btn.role === "close") {
      return `<button class="btn btn-sm" data-panel-close>${escapeHtml(btn.label)}</button>`;
    } else {
      return `<button class="btn btn-sm">${escapeHtml(btn.label)}</button>`;
    }
  }).join("") || `<button class="btn btn-sm" data-panel-close>Chiudi</button>`;

  // riempi desktop
  if (tDesk) tDesk.textContent = title || "—";
  if (sDesk) sDesk.textContent = subtitle || "";
  if (bDesk) bDesk.innerHTML = htmlSections;
  if (fDesk) fDesk.innerHTML = footerHtml;

  // riempi mobile
  if (tMob) tMob.textContent = title || "—";
  if (sMob) sMob.textContent = subtitle || "";
  if (bMob) bMob.innerHTML = htmlSections;
  if (fMob) fMob.innerHTML = footerHtml;

  overlay.setAttribute("aria-hidden", "false");
}

function closePanel() {
  const overlay = document.getElementById("panel-overlay");
  if (!overlay) return;
  overlay.setAttribute("aria-hidden","true");
}

// chiusura panel: backdrop, X, bottoni footer con data-panel-close
document.addEventListener("click", (ev) => {
  if (ev.target.matches("[data-panel-close]")) {
    closePanel();
  }
  if (ev.target.closest && ev.target.closest("[data-panel-close]")) {
    closePanel();
  }
  if (ev.target.matches(".tl-panel-backdrop")) {
    closePanel();
  }
});

// esponi globalmente così i moduli possono usarlo se vogliono
window.openPanel = openPanel;
window.closePanel = closePanel;


// =====================================================
// PANEL CONTENT HELPERS (MiFID / Privacy / Audit F1)
// =====================================================

function openMifidPanel() {
  openPanel({
    title: "Informativa MiFID",
    subtitle: "Uso informativo/formativo. Nessuna sollecitazione al pubblico risparmio.",
    sections: [
      {
        heading: "Finalità",
        bodyHtml:
          "Il contenuto presentato ha scopo puramente informativo e didattico. " +
          "Non costituisce consulenza personalizzata, raccomandazione d’investimento, " +
          "o proposta di acquisto/vendita di strumenti finanziari."
      },
      {
        heading: "Adeguatezza e Appropriatezza",
        bodyHtml:
          "Qualsiasi operatività reale richiede verifica preventiva di adeguatezza e " +
          "appropriatezza con un intermediario autorizzato, come previsto dalla Direttiva MiFID II.",
        metaHtml:
          "In assenza di tale verifica, le informazioni non possono essere intese come suggerimento operativo."
      },
      {
        heading: "Rischi",
        bodyHtml:
          "I mercati finanziari comportano rischio di perdita totale o parziale del capitale. " +
          "Le performance passate non sono indicative di risultati futuri."
      }
    ],
    footerButtons: [
      { label: "Ho letto", role: "close" }
    ]
  });
}

function openPrivacyPanel() {
  openPanel({
    title: "Privacy & Trasparenza",
    subtitle: "Zero profilazione. Preferenze salvate solo in locale.",
    sections: [
      {
        heading: "Cookie e Tracciamento",
        bodyHtml:
          "Non utilizziamo cookie di profilazione o pubblicità comportamentale. " +
          "Non cediamo dati personali a terze parti per fini commerciali.",
        metaHtml:
          "Rif.: GDPR (UE 2016/679), Direttiva ePrivacy, Linee guida EDPB."
      },
      {
        heading: "Dati Locali",
        bodyHtml:
          "Le uniche preferenze salvate (tema, consensi) restano nel tuo browser " +
          "via localStorage e non vengono inviate a server esterni."
      }
    ],
    footerButtons: [
      { label: "Chiudi", role: "close" }
    ]
  });
}

function openAuditPanel(auditData = {}) {
  // auditData viene attaccato al bottone dal modulo (F1A/F1B)
  const {
    source_sync,
    feed_lag_days,
    confidence,
    integrity
  } = auditData;

  openPanel({
    title: "Audit dati F1",
    subtitle: "Fonti, qualità campione e limiti d'uso",
    sections: [
      {
        heading: "Origine dati",
        bodyHtml:
          `<div><strong>Fonte:</strong> ${escapeHtml(source_sync || "—")}</div>` +
          `<div><strong>Lag (giorni):</strong> ${escapeHtml(numFmt(feed_lag_days))}</div>` +
          `<div><strong>Confidence:</strong> ${escapeHtml(numFmt(confidence))}</div>` +
          `<div><strong>Integrità dataset:</strong> ${escapeHtml(numFmt(integrity))}</div>`
      },
      {
        heading: "Avvertenze MiFID",
        bodyHtml:
          "Questo contenuto descrive condizioni di mercato in chiave formativa. " +
          "Non è una raccomandazione esecutiva. " +
          "Prima di qualsiasi scelta reale rivolgiti a un soggetto autorizzato."
      }
    ],
    footerButtons: [
      { label: "Chiudi", role: "close" }
    ]
  });
}


// =====================================================
// METRIC TOOLTIP (icone "?")
// =====================================================
//
// Desktop -> popover posizionato vicino al bottone.
// Mobile  -> bottom sheet metrica con titolo / testo.
// -----------------------------------------------------

function openMetricPopover(btnEl, { title, body, source }) {
  const pop = document.getElementById("metric-popover");
  if (!pop) return;

  const tEl = document.getElementById("metric-popover-title");
  const bEl = document.getElementById("metric-popover-body");
  const sEl = document.getElementById("metric-popover-source");

  if (tEl) tEl.textContent = title || "—";
  if (bEl) bEl.textContent = body || "—";
  if (sEl) sEl.textContent = source || "";

  // Posizionamento intelligente
  const rect = btnEl.getBoundingClientRect();
  const margin = 8;
  const approxHeight = 200; // stima altezza
  const popW = 320;

  let left = rect.left + window.scrollX;
  let top  = rect.bottom + window.scrollY + margin;

  // limite destro
  const maxLeft = window.scrollX + window.innerWidth - popW - 8;
  if (left > maxLeft) {
    left = maxLeft;
  }

  // se andrebbe fuori in basso, prova sopra
  const estBottom = top + approxHeight;
  const viewportBottom = window.scrollY + window.innerHeight;
  if (estBottom > viewportBottom) {
    top = rect.top + window.scrollY - approxHeight - margin;
    // controllo che non vada sopra il top viewport
    if (top < window.scrollY + 8) {
      top = window.scrollY + 8;
    }
  }

  pop.style.left = left + "px";
  pop.style.top  = top + "px";
  pop.setAttribute("aria-hidden","false");
}

function closeMetricPopover() {
  const pop = document.getElementById("metric-popover");
  if (!pop) return;
  pop.setAttribute("aria-hidden","true");
}

function openMetricSheet({ title, body, source }) {
  const sheet = document.getElementById("metric-sheet");
  if (!sheet) return;

  const tEl = document.getElementById("metric-sheet-h-title");
  const sEl = document.getElementById("metric-sheet-h-source");
  const bEl = document.getElementById("metric-sheet-body");

  if (tEl) tEl.textContent = title || "—";
  if (bEl) bEl.textContent = body || "—";
  if (sEl) sEl.textContent = source || "";

  sheet.setAttribute("aria-hidden","false");
}

function closeMetricSheet() {
  const sheet = document.getElementById("metric-sheet");
  if (!sheet) return;
  sheet.setAttribute("aria-hidden","true");
}

// click su X del popover
document.addEventListener("click", (ev) => {
  if (ev.target.id === "metric-popover-close" ||
      (ev.target.closest && ev.target.closest("#metric-popover-close"))) {
    closeMetricPopover();
  }
});

// chiusura sheet mobile (backdrop e pulsante chiudi)
document.addEventListener("click", (ev) => {
  if (ev.target.matches("[data-metric-close]") ||
      (ev.target.closest && ev.target.closest("[data-metric-close]")) ||
      ev.target.matches(".tl-metric-sheet-backdrop")) {
    closeMetricSheet();
  }
});

// chiusura popover cliccando fuori (desktop only)
document.addEventListener("click", (ev) => {
  const pop = document.getElementById("metric-popover");
  if (!pop) return;
  if (pop.getAttribute("aria-hidden") === "true") return;

  // se clic dentro popover, non chiudere
  if (pop.contains(ev.target)) return;

  // se clicco proprio sul bottone metrica che ha appena aperto, non chiudere qui
  if (ev.target.classList?.contains("info-btn") ||
      ev.target.classList?.contains("metric-help") ||
      (ev.target.closest && (ev.target.closest(".info-btn") || ev.target.closest(".metric-help")))) {
    return;
  }

  closeMetricPopover();
});


// Quando clicchiamo su una icona "?" .info-btn o .metric-help
function handleMetricClick(btnEl) {
  const key = btnEl.getAttribute("data-metric");

  const glossary = getGlossary();
  // struttura attesa in glossary:
  // glossary[key] = {
  //   title: "ConfidenceFinal",
  //   short: "Quanto ci fidiamo del dato.",
  //   long: "Spiegazione estesa ...",
  //   source: "Interno / calcolo proprietario"
  // }
  const data = glossary[key] || {
    title: key || "—",
    short: "—",
    long: "—",
    source: ""
  };

  const title  = data.title || key || "—";
  const body   = data.long || data.short || "—";
  const source = data.source || "";

  if (isMobile()) {
    openMetricSheet({ title, body, source });
  } else {
    openMetricPopover(btnEl, { title, body, source });
  }
}

// delega click sulle icone ?
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest?.(".info-btn, .metric-help");
  if (!btn) return;
  handleMetricClick(btn);
});


// =====================================================
// SHARE, THEME, PRINT, FOOTER BUTTONS, AUDIT BTN
// =====================================================

// toggla tema light/dark e salva preferenza
function toggleTheme() {
  const html = document.documentElement;
  const curr = html.getAttribute("data-theme") || "light";
  const next = curr === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  try {
    localStorage.setItem("tradelia-theme", next);
  } catch(e){}
}

// carica tema salvato (se c'è)
(function initThemeFromStorage(){
  try {
    const saved = localStorage.getItem("tradelia-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch(e){}
})();

// listener globali su click
document.addEventListener("click", (ev) => {
  // MiFID
  if (ev.target.id === "btn-mifid-open") {
    openMifidPanel();
  }

  // Privacy
  if (ev.target.id === "btn-privacy-open") {
    openPrivacyPanel();
  }

  // Stampa
  if (ev.target.id === "btn-print" || ev.target.id === "btn-print-2") {
    window.print();
  }

  // Tema
  if (ev.target.id === "btn-theme" || (ev.target.closest && ev.target.closest("#btn-theme"))) {
    toggleTheme();
  }

  // Share open
  if (ev.target.id === "btn-share") {
    const ov = document.getElementById("share-overlay");
    if (ov) ov.setAttribute("aria-hidden","false");
  }

  // Share close
  if (
    ev.target.matches("[data-share-close]") ||
    (ev.target.closest && ev.target.closest("[data-share-close]"))
  ) {
    const ov = document.getElementById("share-overlay");
    if (ov) ov.setAttribute("aria-hidden","true");
  }

  // Share service click (linkedin/twitter/reddit/copy)
  if (ev.target.matches(".share-btn,[data-share-svc]") ||
      (ev.target.closest && ev.target.closest(".share-btn,[data-share-svc]"))) {
    const btn = ev.target.closest
      ? ev.target.closest(".share-btn,[data-share-svc]")
      : ev.target;
    const svc = btn.getAttribute("data-share-svc");
    handleShareAction(svc);
  }

  // open-drawer personalizzati, tipo Audit / Fonti
  const auditTrigger = ev.target.closest?.("[data-open-drawer]");
  if (auditTrigger) {
    const drawerKey = auditTrigger.getAttribute("data-open-drawer");
    if (drawerKey === "audit-f1b" || drawerKey === "audit-f1a") {
      openAuditPanel(auditTrigger.__auditData || {});
    }
  }
});

function handleShareAction(svc){
  const linkField = document.getElementById("share-link-field");
  const urlToShare = linkField ? linkField.textContent.trim() : window.location.href;

  if (svc === "copy") {
    try {
      navigator.clipboard.writeText(urlToShare);
    } catch(e){}
    return;
  }

  if (svc === "linkedin") {
    const u = encodeURIComponent(urlToShare);
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + u, "_blank","noopener");
    return;
  }

  if (svc === "twitter") {
    const u = encodeURIComponent(urlToShare);
    window.open("https://twitter.com/intent/tweet?url=" + u, "_blank","noopener");
    return;
  }

  if (svc === "reddit") {
    const u = encodeURIComponent(urlToShare);
    window.open("https://www.reddit.com/submit?url=" + u, "_blank","noopener");
    return;
  }
}

// =====================================================
// API per i moduli
// I moduli (es. F1A/F1B) possono chiamare:
//   window.__TradeliaUI.attachAuditData(btn, auditObj)
// per passare al drawer Audit i dati grezzi
// =====================================================

window.__TradeliaUI = {
  attachAuditData(btn, auditObj){
    if (!btn) return;
    btn.__auditData = auditObj || {};
  }
};
