// /assets/js/mifid-banner.js
// Banner Mifid/Privacy per homepage
// Mostra solo al primo accesso e salva preferenza
// -----------------------------------------------------------

import { i18n } from "/report/assets/js/utils/i18n.js";

const STORAGE_KEY = "tradelia-legal-ack-v2025-11";
const FIRST_PAGE_KEY = "tradelia-first-page";

// ===== UTILITIES =====
function getFirstPage() {
  try {
    return localStorage.getItem(FIRST_PAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function setFirstPage(page) {
  try {
    localStorage.setItem(FIRST_PAGE_KEY, page);
  } catch (e) {
    // Ignore
  }
}

function hasSeenBanner() {
  try {
    const ack = localStorage.getItem(STORAGE_KEY);
    return ack !== null;
  } catch (e) {
    return false;
  }
}

function saveBannerAck() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        acceptedAt: new Date().toISOString(),
        v: "2025-11",
      })
    );
  } catch (e) {
    // Ignore
  }
}

// ===== RENDER BANNER =====
function renderBanner() {
  const currentLang = i18n.getLanguage();

  const translations = {
    it: {
      title: "Informativa legale",
      message:
        "Questo sito ha finalità esclusivamente educativa e informativa. Non costituisce consulenza in materia di investimenti (MiFID II).",
      accept: "Accetto e chiudi",
      mifid: "Informativa MiFID",
      privacy: "Privacy",
    },
    en: {
      title: "Legal information",
      message:
        "This site is for educational and informational purposes only. It does not constitute investment advice (MiFID II).",
      accept: "Accept and close",
      mifid: "MiFID Information",
      privacy: "Privacy",
    },
  };

  const t = translations[currentLang] || translations.it;

  return `
    <div id="mifid-banner" class="mifid-banner" role="banner" aria-live="polite">
      <div class="mifid-banner-content">
        <div class="mifid-banner-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div class="mifid-banner-text">
          <p class="mifid-banner-message">${t.message}</p>
        </div>
        <div class="mifid-banner-actions">
          <button class="mifid-banner-btn mifid-banner-btn-accept" type="button" data-i18n="mifid.banner.accept">
            ${t.accept}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ===== LEGAL OVERLAY =====
function renderLegalOverlay() {
  const currentLang = i18n.getLanguage();

  const translations = {
    it: {
      title: "Informativa legale",
      close: "Chiudi",
      mifidTab: "Informativa MiFID",
      privacyTab: "Privacy",
      cookieTab: "Cookie",
      termsTab: "Termini",
      continue: "Continuando dichiari di aver letto e compreso le informative.",
      accept: "Accetto e chiudi",
      mifidContent: `
        <h4>Finalità del materiale</h4>
        <p>Il presente contenuto ha esclusiva finalità informativa e didattica. Non costituisce consulenza in materia di investimenti, raccomandazione personalizzata, sollecitazione al pubblico risparmio o ricerca in investimento ai sensi della normativa MiFID II / ESMA.</p>
        <h4>Orizzonte e perimetro</h4>
        <p>I moduli (F1–F7) coprono analisi top-down (macro, sentiment, tecnica) con orizzonte indicativo 3–10 giorni. Non viene svolta verifica di adeguatezza/appropriatezza, profilo di rischio o obiettivi finanziari dell'utente.</p>
        <h4>Rischi</h4>
        <ul>
          <li>I mercati finanziari comportano rischio di perdita, anche totale, del capitale.</li>
          <li>Prodotti a leva/derivati (opzioni, futures, CFD) possono amplificare perdite oltre il capitale iniziale.</li>
          <li>Rendimenti passati non sono indicativi di risultati futuri.</li>
        </ul>
        <h4>Dati e fonti</h4>
        <ul>
          <li>Dati e serie storiche possono essere soggetti a ritardi, revisioni o errori; i timestamp potrebbero non riflettere il "tempo reale".</li>
          <li>Le fonti includono provider ritenuti affidabili; non si garantisce esattezza/completezza.</li>
        </ul>
        <h4>Conflitti e indipendenza</h4>
        <ul>
          <li>Il framework AI alla base dei moduli SRD/MTB è indipendente: non esegue ordini e non gestisce capitali.</li>
          <li>Non sono note situazioni di conflitto d'interesse rilevanti nella produzione del materiale.</li>
        </ul>
        <h4>Limitazioni</h4>
        <ul>
          <li>Le informazioni non sostituiscono il giudizio dell'utente né la consulenza di un intermediario autorizzato.</li>
          <li>L'uso è vietato laddove non conforme alle leggi locali.</li>
        </ul>
      `,
      privacyContent: `
        <h4>Principi</h4>
        <p>Adottiamo un'impostazione "privacy-first": minimizzazione dei dati e assenza di tracciamento pubblicitario.</p>
        <h4>Dati trattati</h4>
        <ul>
          <li>Nessuna raccolta di dati personali identificativi tramite questa pagina.</li>
          <li>Uso di <code>localStorage</code> per preferenze (tema) e consenso legale.</li>
          <li>Eventuali log tecnici anonimi per sicurezza e diagnostica.</li>
        </ul>
        <h4>Cookie e analytics</h4>
        <ul>
          <li>Niente cookie di profilazione; eventuali analytics sono anonimizzati/aggregati.</li>
          <li>Nessuna condivisione con terze parti a fini commerciali.</li>
        </ul>
        <h4>Diritti e contatti</h4>
        <ul>
          <li>Per informazioni o esercizio diritti privacy, scrivi a <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.</li>
          <li>Il titolare potrà aggiornare questa informativa: controlla periodicamente le revisioni.</li>
        </ul>
      `,
      cookieContent: `
        <h4>Tipi di cookie utilizzati</h4>
        <p>Utilizziamo solo cookie tecnici necessari per il funzionamento del sito. Non utilizziamo cookie di profilazione o pubblicitari.</p>
        <h4>Cookie tecnici</h4>
        <ul>
          <li><strong>Preferenze tema:</strong> Memorizziamo la preferenza del tema (dark mode) in <code>localStorage</code> per migliorare l'esperienza utente.</li>
          <li><strong>Consenso legale:</strong> Memorizziamo il consenso alle informative legali per non richiederlo ad ogni visita.</li>
          <li><strong>Preferenze dashboard:</strong> Memorizziamo le preferenze dell'utente nella dashboard (moduli preferiti, layout) in <code>localStorage</code>.</li>
        </ul>
        <h4>Cookie di terze parti</h4>
        <p>Non utilizziamo cookie di terze parti per tracciamento o pubblicità. Eventuali servizi esterni (es. font Google) sono configurati per rispettare la privacy.</p>
        <h4>Gestione cookie</h4>
        <p>Puoi gestire o eliminare i cookie attraverso le impostazioni del tuo browser. Nota che disabilitare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.</p>
        <h4>Contatti</h4>
        <p>Per domande sui cookie, contatta <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.</p>
      `,
      termsContent: `
        <h4>Identità del Fornitore</h4>
        <p><strong>Tradelia AI</strong> è un progetto indipendente che fornisce servizi di analisi finanziaria attraverso piattaforma SaaS.</p>
        <p><strong>Dati del Fornitore:</strong><br />
        Nome commerciale: Tradelia AI<br />
        Proprietario unico: Massimo Rodi<br />
        Indirizzo: Via dei Fiori 2, 86078 Sesto Campano (IS), Italia<br />
        Email: <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a></p>
        <h4>Descrizione del Servizio</h4>
        <p>Tradelia AI fornisce strumenti di analisi dati e reportistica attraverso metodologia accademica. Il Servizio include dashboard interattive e strumenti di visualizzazione.</p>
        <p><strong>IMPORTANTE:</strong> Il Servizio non costituisce consulenza finanziaria, investimento o raccomandazione di acquisto/vendita.</p>
        <h4>Servizi a Pagamento</h4>
        <p>Servizi on-demand: paghi solo per ciò che richiedi, senza abbonamenti ricorrenti. Fatturazione tramite Xolo Go. Diritto di recesso entro 14 giorni dalla consegna.</p>
        <h4>Limitazioni di Responsabilità</h4>
        <p>I dati e le analisi sono forniti "così come sono" senza garanzie di accuratezza o completezza. Tradelia AI non è responsabile per decisioni di investimento basate sul materiale fornito.</p>
        <h4>Legge Applicabile</h4>
        <p>Questi termini sono governati dalla legge italiana. Per controversie, competente è il foro di Isernia (IS), Italia.</p>
        <p><a href="/terms.html" target="_blank" class="mail-link">Leggi i termini completi →</a></p>
      `,
    },
    en: {
      title: "Legal information",
      close: "Close",
      mifidTab: "MiFID Information",
      privacyTab: "Privacy",
      cookieTab: "Cookies",
      termsTab: "Terms",
      continue: "By continuing you declare that you have read and understood the information.",
      accept: "Accept and close",
      mifidContent: `
        <h4>Purpose of the material</h4>
        <p>This content is for informational and educational purposes only. It does not constitute investment advice, personalized recommendations, solicitation of public savings or investment research under MiFID II / ESMA regulations.</p>
        <h4>Horizon and scope</h4>
        <p>The modules (F1–F7) cover top-down analysis (macro, sentiment, technical) with an indicative horizon of 3–10 days. No suitability/appropriateness assessment, risk profile or financial objectives of the user is performed.</p>
        <h4>Risks</h4>
        <ul>
          <li>Financial markets involve risk of loss, including total loss of capital.</li>
          <li>Leveraged/derivative products (options, futures, CFDs) can amplify losses beyond initial capital.</li>
          <li>Past performance is not indicative of future results.</li>
        </ul>
        <h4>Data and sources</h4>
        <ul>
          <li>Data and historical series may be subject to delays, revisions or errors; timestamps may not reflect "real time".</li>
          <li>Sources include providers deemed reliable; no accuracy/completeness is guaranteed.</li>
        </ul>
        <h4>Conflicts and independence</h4>
        <ul>
          <li>The AI framework behind the SRD/MTB modules is independent: it does not execute orders or manage capital.</li>
          <li>No relevant conflict of interest situations are known in the production of the material.</li>
        </ul>
        <h4>Limitations</h4>
        <ul>
          <li>The information does not replace the user's judgment nor the advice of an authorized intermediary.</li>
          <li>Use is prohibited where not in compliance with local laws.</li>
        </ul>
      `,
      privacyContent: `
        <h4>Principles</h4>
        <p>We adopt a "privacy-first" approach: data minimization and no advertising tracking.</p>
        <h4>Data processed</h4>
        <ul>
          <li>No collection of personally identifiable data through this page.</li>
          <li>Use of <code>localStorage</code> for preferences (theme) and legal consent.</li>
          <li>Any anonymous technical logs for security and diagnostics.</li>
        </ul>
        <h4>Cookies and analytics</h4>
        <ul>
          <li>No profiling cookies; any analytics are anonymized/aggregated.</li>
          <li>No sharing with third parties for commercial purposes.</li>
        </ul>
        <h4>Rights and contacts</h4>
        <ul>
          <li>For information or to exercise privacy rights, write to <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.</li>
          <li>The owner may update this information: check for revisions periodically.</li>
        </ul>
      `,
      cookieContent: `
        <h4>Types of cookies used</h4>
        <p>We only use technical cookies necessary for the site to function. We do not use profiling or advertising cookies.</p>
        <h4>Technical cookies</h4>
        <ul>
          <li><strong>Theme preferences:</strong> We store theme preference (dark mode) in <code>localStorage</code> to improve user experience.</li>
          <li><strong>Legal consent:</strong> We store consent to legal information to avoid requesting it on every visit.</li>
          <li><strong>Dashboard preferences:</strong> We store user preferences in the dashboard (favorite modules, layout) in <code>localStorage</code>.</li>
        </ul>
        <h4>Third-party cookies</h4>
        <p>We do not use third-party cookies for tracking or advertising. Any external services (e.g. Google fonts) are configured to respect privacy.</p>
        <h4>Cookie management</h4>
        <p>You can manage or delete cookies through your browser settings. Note that disabling technical cookies may compromise some site functionality.</p>
        <h4>Contacts</h4>
        <p>For questions about cookies, contact <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.</p>
      `,
      termsContent: `
        <h4>Provider Identity</h4>
        <p><strong>Tradelia AI</strong> is an independent project that provides financial analysis services through a SaaS platform.</p>
        <p><strong>Provider Data:</strong><br />
        Commercial name: Tradelia AI<br />
        Sole proprietor: Massimo Rodi<br />
        Address: Via dei Fiori 2, 86078 Sesto Campano (IS), Italy<br />
        Email: <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a></p>
        <h4>Service Description</h4>
        <p>Tradelia AI provides data analysis tools and reporting through AI with academic method. The Service includes interactive dashboards and visualization tools.</p>
        <p><strong>IMPORTANT:</strong> The Service does not constitute financial advice, investment or buy/sell recommendations.</p>
        <h4>Paid Services</h4>
        <p>On-demand services: you pay only for what you request, without recurring subscriptions. Invoicing via Xolo Go. Right of withdrawal within 14 days of delivery.</p>
        <h4>Limitations of Liability</h4>
        <p>Data and analyses are provided "as is" without warranties of accuracy or completeness. Tradelia AI is not responsible for investment decisions based on the material provided.</p>
        <h4>Applicable Law</h4>
        <p>These terms are governed by Italian law. For disputes, the competent court is Isernia (IS), Italy.</p>
        <p><a href="/terms.html" target="_blank" class="mail-link">Read full terms →</a></p>
      `,
    },
  };

  const t = translations[currentLang] || translations.it;

  return `
    <div id="legal-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="legal-consent-title" hidden>
      <div style="position: absolute; inset: 0;" data-legal-dismiss></div>
      <div class="legal-panel" role="document">
        <header class="legal-hdr">
          <div class="legal-title" id="legal-consent-title">${t.title}</div>
          <button class="btn btn-sm" type="button" data-legal-dismiss aria-label="${t.close}">${t.close}</button>
        </header>
        <nav class="legal-tabs" role="tablist" aria-label="Sezioni legali">
          <button class="legal-tab" role="tab" id="tab-mifid" aria-controls="panel-mifid" aria-selected="true">${t.mifidTab}</button>
          <button class="legal-tab" role="tab" id="tab-privacy" aria-controls="panel-privacy" aria-selected="false">${t.privacyTab}</button>
          <button class="legal-tab" role="tab" id="tab-cookie" aria-controls="panel-cookie" aria-selected="false">${t.cookieTab}</button>
          <button class="legal-tab" role="tab" id="tab-terms" aria-controls="panel-terms" aria-selected="false">${t.termsTab}</button>
        </nav>
        <div class="legal-body">
          <section id="panel-mifid" role="tabpanel" aria-labelledby="tab-mifid">
            ${t.mifidContent}
          </section>
          <section id="panel-privacy" role="tabpanel" aria-labelledby="tab-privacy" hidden>
            ${t.privacyContent}
          </section>
          <section id="panel-cookie" role="tabpanel" aria-labelledby="tab-cookie" hidden>
            ${t.cookieContent}
          </section>
          <section id="panel-terms" role="tabpanel" aria-labelledby="tab-terms" hidden>
            ${t.termsContent}
          </section>
        </div>
        <footer class="legal-ftr">
          <small style="font-size: var(--fs-12); color: var(--muted);">${t.continue}</small>
          <button class="btn btn-sm" type="button" id="btn-accept-legal">${t.accept}</button>
        </footer>
      </div>
    </div>
  `;
}

// ===== SETUP =====
// Rimossa funzione setupBanner - usiamo solo overlay bloccante

// ===== SETUP LEGAL OVERLAY =====
let legalOverlayInstance = null;

function createLegalOverlay() {
  // Se overlay già esiste, non ricrearlo
  if (document.getElementById("legal-consent-overlay")) {
    return document.getElementById("legal-consent-overlay");
  }

  // Crea overlay
  const overlay = document.createElement("div");
  overlay.innerHTML = renderLegalOverlay();
  document.body.appendChild(overlay.firstElementChild);

  const overlayEl = document.getElementById("legal-consent-overlay");
  if (!overlayEl) {
    return null;
  }

  const btnAccept = overlayEl.querySelector("#btn-accept-legal");
  const tabM = overlayEl.querySelector("#tab-mifid");
  const tabP = overlayEl.querySelector("#tab-privacy");
  const tabC = overlayEl.querySelector("#tab-cookie");
  const tabT = overlayEl.querySelector("#tab-terms");
  const panelM = overlayEl.querySelector("#panel-mifid");
  const panelP = overlayEl.querySelector("#panel-privacy");
  const panelC = overlayEl.querySelector("#panel-cookie");
  const panelT = overlayEl.querySelector("#panel-terms");

  function showTab(which) {
    // Reset all tabs
    [tabM, tabP, tabC, tabT].forEach((tab) => {
      if (tab) {
        tab.setAttribute("aria-selected", "false");
      }
    });
    [panelM, panelP, panelC, panelT].forEach((panel) => {
      if (panel) {
        panel.hidden = true;
      }
    });

    // Show selected tab
    const tabs = { mifid: tabM, privacy: tabP, cookie: tabC, terms: tabT };
    const panels = { mifid: panelM, privacy: panelP, cookie: panelC, terms: panelT };

    const selectedTab = tabs[which];
    const selectedPanel = panels[which];

    if (selectedTab) {
      selectedTab.setAttribute("aria-selected", "true");
    }
    if (selectedPanel) {
      selectedPanel.hidden = false;
    }
  }

  function openLegal(which = "mifid", blocking = true) {
    showTab(which);
    overlayEl.hidden = false;
    document.body.style.overflow = "hidden";
    if (blocking) {
      overlayEl.setAttribute("data-blocking", "true");
    } else {
      overlayEl.removeAttribute("data-blocking");
    }
    setTimeout(() => {
      const tabs = { mifid: tabM, privacy: tabP, cookie: tabC, terms: tabT };
      const targetTab = tabs[which];
      if (targetTab) {
        targetTab.focus();
      }
    }, 0);
  }

  function closeLegal() {
    overlayEl.hidden = true;
    document.body.style.overflow = "";
  }

  if (tabM) {
    tabM.addEventListener("click", () => showTab("mifid"));
  }
  if (tabP) {
    tabP.addEventListener("click", () => showTab("privacy"));
  }
  if (tabC) {
    tabC.addEventListener("click", () => showTab("cookie"));
  }
  if (tabT) {
    tabT.addEventListener("click", () => showTab("terms"));
  }

  if (btnAccept) {
    btnAccept.addEventListener("click", () => {
      saveBannerAck();
      closeLegal();
      // Rimuovi anche banner se presente
      const bannerEl = document.getElementById("mifid-banner");
      if (bannerEl) {
        bannerEl.remove();
      }
    });
  }

  overlayEl.addEventListener("click", (e) => {
    if (e.target.matches("[data-legal-dismiss]") || e.target.closest("[data-legal-dismiss]")) {
      if (!overlayEl.hasAttribute("data-blocking")) {
        closeLegal();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlayEl.hasAttribute("data-blocking") && !overlayEl.hidden) {
      closeLegal();
    }
  });

  // Esponi funzione openLegal globalmente per pulsanti footer
  window.openLegalOverlay = openLegal;

  legalOverlayInstance = { overlayEl, openLegal, closeLegal, showTab };
  return overlayEl;
}

function setupLegalOverlay() {
  // Controlla se è homepage
  const isHomepage =
    window.location.pathname === "/" || window.location.pathname.endsWith("index.html");

  // Salva prima pagina visitata
  const currentPage = window.location.pathname;
  if (!getFirstPage()) {
    setFirstPage(currentPage);
  }

  // Crea overlay sempre (serve anche per pulsanti footer)
  createLegalOverlay();

  // Se non è homepage, non mostrare automaticamente
  if (!isHomepage) {
    return;
  }

  // Se già visto, non mostrare automaticamente
  if (hasSeenBanner()) {
    return;
  }

  // Mostra overlay al primo accesso su homepage (bloccante)
  if (legalOverlayInstance) {
    // Piccolo delay per assicurarsi che tutto sia caricato
    setTimeout(() => {
      if (legalOverlayInstance) {
        legalOverlayInstance.openLegal("mifid", true);
      }
    }, 300);
  }
}

// ===== INIT =====
export function initMifidBanner() {
  // Setup legal overlay (bloccante al primo accesso su homepage)
  setupLegalOverlay();
}

// Expose function for version check to call
window.checkLegalConsent = function () {
  if (legalOverlayInstance && !hasSeenBanner()) {
    legalOverlayInstance.openLegal("mifid", true);
  }
};

// Auto-init se DOM è pronto
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Aspetta che i18n sia inizializzato
      setTimeout(() => {
        initMifidBanner();
      }, 100);
    });
  } else {
    setTimeout(() => {
      initMifidBanner();
    }, 100);
  }
}
