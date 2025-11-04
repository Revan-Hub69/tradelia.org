// /report/assets/js/ui-runtime.js
// Runtime UI compatto (panel + tooltip + metriche) — 2025-11
// Dipende solo da tokens.css

(function () {
  const UI = {};
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, cls, html) => {
    const e = document.createElement(t);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const isMobile = () => matchMedia("(max-width: 768px)").matches;

  // ========== GLOSSARIO (cache) ==========
  const Glossary = {
    _cache: null,
    async load() {
      if (this._cache) return this._cache;
      try {
        const res = await fetch("/report/assets/glossary.json", { cache: "no-store" });
        this._cache = res.ok ? await res.json() : {};
      } catch {
        this._cache = {};
      }
      return this._cache;
    },
    async get(key) {
      const g = await this.load();
      return g?.[key] || null;
    },
  };

  // ========== PANEL OVERLAY ==========
  let overlay,
    backdrop,
    desktopPanel,
    mobilePanel,
    desktopBody,
    mobileBody,
    desktopTitle,
    mobileTitle,
    desktopSub,
    mobileSub,
    desktopFooter,
    mobileFooter;

  function svgX(size = 16) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  }
  function btnClose() {
    const b = el("button", "btn btn-sm", "Chiudi");
    b.dataset.panelClose = "";
    return b;
  }

  function mountPanelOverlay() {
    if (qs("#panel-overlay")) return;
    overlay = el("div", "tl-panel-overlay noprint");
    overlay.id = "panel-overlay";
    overlay.setAttribute("hidden", "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.display = "none";

    backdrop = el("div", "tl-panel-backdrop");
    backdrop.dataset.panelClose = "";
    overlay.appendChild(backdrop);

    // desktop
    desktopPanel = el("aside", "tl-panel tl-panel--desktop");
    desktopPanel.setAttribute("role", "dialog");
    desktopPanel.setAttribute("aria-modal", "true");
    const dHead = el("header", "tl-panel__header");
    desktopTitle = el("h2", "tl-panel__title", "—");
    desktopTitle.id = "panel-title";
    desktopSub = el("p", "tl-panel__subtitle", "—");
    const dWrap = el("div", "min-w-0");
    dWrap.append(desktopTitle, desktopSub);
    const dClose = el("button", "tl-panel__close", svgX(16));
    dClose.dataset.panelClose = "";
    dHead.append(dWrap, dClose);
    desktopBody = el("div", "tl-panel__body");
    desktopBody.id = "panel-body";
    desktopFooter = el("footer", "tl-panel__footer");
    desktopFooter.append(btnClose());
    desktopPanel.append(dHead, desktopBody, desktopFooter);

    // mobile
    mobilePanel = el("aside", "tl-panel tl-panel--mobile");
    mobilePanel.setAttribute("role", "dialog");
    mobilePanel.setAttribute("aria-modal", "true");
    const mHead = el("header", "tl-panel__header");
    mobileTitle = el("h2", "tl-panel__title", "—");
    mobileTitle.id = "panel-title-mobile";
    mobileSub = el("p", "tl-panel__subtitle", "—");
    const mWrap = el("div", "min-w-0");
    mWrap.append(mobileTitle, mobileSub);
    const mClose = el("button", "tl-panel__close", svgX(18));
    mClose.dataset.panelClose = "";
    mHead.append(mWrap, mClose);
    mobileBody = el("div", "tl-panel__body");
    mobileBody.id = "panel-body-mobile";
    mobileFooter = el("footer", "tl-panel__footer");
    mobileFooter.append(btnClose());
    mobilePanel.append(mHead, mobileBody, mobileFooter);

    overlay.append(desktopPanel, mobilePanel);
    document.body.appendChild(overlay);

    // chiusura
    overlay.addEventListener("click", (e) => {
      // se clicco dentro al drawer mobile (che ha .metrics-drawer-mobile) NON chiudo
      if (e.target.closest(".metrics-drawer-mobile")) return;
      if (e.target.dataset.panelClose != null || e.target === backdrop) {
        closePanel();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.getAttribute("aria-hidden") === "false") closePanel();
    });
  }

  function setFooterButtons(footerEl, buttons) {
    footerEl.innerHTML = "";
    (buttons && buttons.length ? buttons : [btnClose()]).forEach((b) =>
      footerEl.append(typeof b === "string" ? el("span", "", b) : b)
    );
  }

  function openPanel(opts = {}) {
    mountPanelOverlay();
    const { title = "—", subtitle = "—", body = "", footerButtons = null, panelSize = "wide", blocking = false } = opts;

    desktopPanel.style.width = panelSize === "xl" ? "min(980px,100%)" : "min(860px,100%)";

    desktopTitle.textContent = title;
    mobileTitle.textContent = title;
    desktopSub.textContent = subtitle || "—";
    mobileSub.textContent = subtitle || "—";
    desktopBody.innerHTML = body;
    mobileBody.innerHTML = body;

    setFooterButtons(desktopFooter, footerButtons);
    setFooterButtons(mobileFooter, footerButtons);

    document.body.style.overflow = blocking ? "hidden" : "";

    overlay.removeAttribute("hidden");
    overlay.setAttribute("aria-hidden", "false");
    overlay.style.display = "flex";

    if (isMobile()) {
      desktopPanel.style.display = "none";
      mobilePanel.style.display = "flex";
      mobilePanel.removeAttribute("hidden");
    } else {
      desktopPanel.style.display = "flex";
      mobilePanel.style.display = "none";
      desktopPanel.removeAttribute("hidden");
    }

    desktopBody.scrollTop = 0;
    mobileBody.scrollTop = 0;

    // ri-binda i bottoni "?" che sono entrati ora
    try {
      UI.bindMetricInfoButtons(desktopBody);
      UI.bindMetricInfoButtons(mobileBody);
    } catch {}
  }

  function closePanel() {
    if (!overlay) return;
    overlay.setAttribute("hidden", "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  // ========== TOOLTIP / MODAL METRICHE ==========
  let popover,
    popTitle,
    popBody,
    popSource,
    popClose,
    metricModal,
    modalTitle,
    modalBody,
    modalSource;

  function clampPopover(pop, x, y) {
    const pad = 12;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const w = pop.offsetWidth,
      h = pop.offsetHeight;
    let left = Math.min(Math.max(x, pad), vw - w - pad);
    let top = Math.min(Math.max(y, pad), vh - h - pad);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function mountTooltips() {
    if (!qs("#metric-popover")) {
      popover = el("div", "tl-popover noprint");
      popover.id = "metric-popover";
      popover.setAttribute("aria-hidden", "true");
      const head = el("div", "tl-popover__head");
      popClose = el("button", "tl-popover__close", svgX(14));
      popClose.setAttribute("aria-label", "Chiudi");
      popTitle = el("div", "tl-popover__title", "—");
      head.append(popClose, popTitle);
      popBody = el("div", "tl-popover__body", "—");
      popSource = el("div", "tl-popover__source", "—");
      popover.append(head, popBody, popSource);
      document.body.appendChild(popover);

      popClose.addEventListener("click", hidePopover);
      window.addEventListener("scroll", hidePopover, { passive: true });
      window.addEventListener("resize", hidePopover);
    }
    if (!qs("#metric-modal")) {
      const wrap = el("div", "tl-metric-modal-overlay noprint");
      wrap.id = "metric-modal";
      wrap.setAttribute("aria-hidden", "true");
      const bd = el("div", "tl-metric-modal-backdrop");
      bd.dataset.metricClose = "";
      const box = el("div", "tl-metric-modal");
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      const head = el("header", "tl-metric-modal__header");
      modalTitle = el("div", "tl-metric-modal__title", "—");
      modalSource = el("div", "tl-metric-modal__source", "—");
      const hw = el("div", "min-w-0");
      hw.append(modalTitle, modalSource);
      const x = el("button", "tl-metric-modal__close", svgX(18));
      x.dataset.metricClose = "";
      head.append(hw, x);
      modalBody = el("div", "tl-metric-modal__body", "—");
      box.append(head, modalBody);
      wrap.append(bd, box);
      document.body.appendChild(wrap);

      wrap.addEventListener("click", (e) => {
        if (e.target.dataset.metricClose != null || e.target === wrap) hideModal();
      });
      window.addEventListener("keydown", (e) => e.key === "Escape" && hideModal());
      metricModal = wrap;
    }
  }

  function hidePopover() {
    if (popover) popover.setAttribute("aria-hidden", "true");
  }
  function hideModal() {
    if (metricModal) metricModal.setAttribute("aria-hidden", "true");
  }

  function showPopoverFor(btn, data) {
    if (!popover) return;
    popTitle.textContent = data.title || data.label || "—";
    popBody.textContent = data.what || data.body || "—";
    popSource.textContent = data.source || "";
    popover.setAttribute("aria-hidden", "false");
    const rect = btn.getBoundingClientRect();
    clampPopover(popover, rect.left, rect.bottom + 6);
  }

  function showMetricModal(data) {
    if (!metricModal) return;
    modalTitle.textContent = data.title || data.label || "—";
    modalBody.innerHTML =
      (data.what || "—") +
      (data.how ? `<div style="margin-top:.75rem">${data.how}</div>` : "");
    modalSource.textContent = data.source || "";
    metricModal.setAttribute("aria-hidden", "false");
  }

  UI.bindMetricInfoButtons = function (root = document) {
    mountTooltips();
    qsa(".info-btn, .info-btn--mini", root).forEach((btn) => {
      if (btn.dataset.metricClickHandler === "true") return; // lasciati in pace quelli dell'header-ticker
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const key = btn.getAttribute("data-metric");
        if (!key) return;
        const data = await Glossary.get(key);
        if (!data) return;
        if (isMobile()) showMetricModal(data);
        else showPopoverFor(btn, data);
      });
    });
  };

  // ========== METRICHE (da header) ==========
  // mapping rapido per avere categorie sensate
  function getMetricCategory(key) {
    const map = {
      azienda: ["CompanyName", "Ticker", "ISIN", "Sector", "Venue"],
      prezzo: ["Price", "ChangePct"],
      qualità: ["Freshness", "ConfidenceFinal", "DataIntegrity", "FeedSync", "State"],
      temporale: ["Start", "End", "UpdatedAt", "Version"],
    };
    for (const [cat, arr] of Object.entries(map)) {
      if (arr.includes(key)) return cat;
    }
    return "altro";
  }

  async function openMetricsDrawer(data) {
    const list = Array.isArray(data?.metricsPanel) ? data.metricsPanel : [];
    if (!list.length) {
      console.warn("[UI Runtime] nessuna metrica in header");
      return Promise.resolve();
    }

    // arricchisco con glossario (in parallelo)
    const enriched = await Promise.all(
      list.map(async (m) => {
        const g = await Glossary.get(m.key);
        return {
          ...m,
          category: getMetricCategory(m.key),
          glossary: g || {},
        };
      })
    );

    // categorie presenti
    const cats = [...new Set(enriched.map((m) => m.category))];

    const body = `
      <div class="metrics-drawer-mobile">
        <div class="metrics-drawer-1" style="display:flex;flex-direction:column;height:100%">
          <nav class="metric-category-tabs" style="flex-shrink:0" role="tablist">
            ${cats
              .map(
                (c, i) =>
                  `<button class="metric-category-tab ${i === 0 ? "active" : ""}" data-category="${c}" type="button" aria-selected="${
                    i === 0 ? "true" : "false"
                  }">${c[0].toUpperCase() + c.slice(1)}</button>`
              )
              .join("")}
          </nav>
          <div class="metrics-list-container" style="flex:1;overflow:auto">
            <div class="metrics-list" data-category="${cats[0]}">
              ${enriched
                .filter((m) => m.category === cats[0])
                .map(
                  (m) => `
                  <button class="metric-list-item swipeable" data-metric-key="${m.key}">
                    <div class="metric-list-item__content">
                      <div class="metric-list-item__label">${m.label || m.key}</div>
                      <div class="metric-list-item__value">${m.value ?? "—"}</div>
                    </div>
                  </button>
                `
                )
                .join("")}
            </div>
          </div>
        </div>
        <div class="metrics-drawer-2" id="metrics-drawer-2" style="display:none;flex-direction:column;height:100%">
          <div class="metrics-drawer-2__header" style="display:flex;align-items:center;gap:.75rem;padding:1rem;border-bottom:1px solid var(--br-soft)">
            <button class="metrics-drawer-2__back" type="button" aria-label="Torna all'elenco">←</button>
            <div class="metrics-drawer-2__title"></div>
          </div>
          <div class="metrics-drawer-2__content" style="flex:1;overflow:auto;padding:1rem"></div>
        </div>
      </div>
    `;

    openPanel({
      title: "Metriche header",
      subtitle: data?.meta?.auditPathId || "—",
      panelSize: "xl",
      body,
    });

    // bind dopo che è nel DOM
    const drawer = qs(".metrics-drawer-mobile");
    if (!drawer) return Promise.resolve();

    const drawer1 = drawer.querySelector(".metrics-drawer-1");
    const drawer2 = drawer.querySelector("#metrics-drawer-2");
    const listBox = drawer.querySelector(".metrics-list");
    const detailTitle = drawer2.querySelector(".metrics-drawer-2__title");
    const detailContent = drawer2.querySelector(".metrics-drawer-2__content");

    // cambio categoria
    drawer.addEventListener("click", (e) => {
      const tab = e.target.closest(".metric-category-tab");
      if (!tab) return;
      const cat = tab.dataset.category;
      qsa(".metric-category-tab", drawer).forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      listBox.dataset.category = cat;
      listBox.innerHTML = enriched
        .filter((m) => m.category === cat)
        .map(
          (m) => `
          <button class="metric-list-item swipeable" data-metric-key="${m.key}">
            <div class="metric-list-item__content">
              <div class="metric-list-item__label">${m.label || m.key}</div>
              <div class="metric-list-item__value">${m.value ?? "—"}</div>
            </div>
          </button>`
        )
        .join("");
    });

    // apri dettaglio
    drawer.addEventListener("click", (e) => {
      const item = e.target.closest(".metric-list-item");
      if (!item) return;
      const key = item.dataset.metricKey;
      const metric = enriched.find((m) => m.key === key);
      if (!metric) return;
      drawer1.style.display = "none";
      drawer2.style.display = "flex";
      detailTitle.textContent = metric.label || metric.key;
      detailContent.innerHTML = `
        <div class="metric-content-section">
          <h4 style="margin-bottom:.5rem">What</h4>
          <p>${metric.glossary.what || "—"}</p>
        </div>
        <div class="metric-content-section" style="margin-top:1rem">
          <h4 style="margin-bottom:.5rem">How</h4>
          <p>${metric.glossary.how || "—"}</p>
        </div>
        <div class="metric-content-section" style="margin-top:1rem">
          <h4 style="margin-bottom:.5rem">Source</h4>
          <p>${metric.glossary.source || ""}</p>
        </div>
      `;
    });

    // back
    drawer2.querySelector(".metrics-drawer-2__back").addEventListener("click", () => {
      drawer2.style.display = "none";
      drawer2.classList.remove("active");
      drawer1.style.display = "flex";
    });

    return Promise.resolve();
  }

  // apri direttamente su metrica (se ti serve in futuro)
  async function openMetricsDrawerFromMetric(metricKey) {
    const hdr = window.__headerTickerData;
    if (!hdr) return;
    await openMetricsDrawer(hdr);
    // dopo che è aperto, simula click
    const drawer = qs(".metrics-drawer-mobile");
    const item = drawer?.querySelector(`.metric-list-item[data-metric-key="${metricKey}"]`);
    if (item) item.click();
  }

  // ========== EXPORT ==========
  UI.openPanel = openPanel;
  UI.closePanel = closePanel;
  UI.openMetricPopup = async (key) => {
    const data = await Glossary.get(key);
    if (!data) return;
    if (isMobile()) showMetricModal(data);
    else {
      // apri popover in centro
      const fakeBtn = { getBoundingClientRect: () => ({ left: window.innerWidth / 2, bottom: window.innerHeight / 2 }) };
      showPopoverFor(fakeBtn, data);
    }
  };
  UI.openMetricsDrawer = openMetricsDrawer;
  UI.openMetricsDrawerFromMetric = openMetricsDrawerFromMetric;

  window.__TradeliaUI = UI;

  // ========== BOOT ==========
  function boot() {
    mountPanelOverlay();
    mountTooltips();
    // chiudi popover se clicco fuori
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#metric-popover") && !e.target.closest(".info-btn") && !e.target.closest(".info-btn--mini")) {
        hidePopover();
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
