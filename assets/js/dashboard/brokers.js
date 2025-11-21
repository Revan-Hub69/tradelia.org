/**
 * Dashboard Module: Brokers
 * Lista broker regolamentati
 */

export async function loadBrokers() {
  const container = document.getElementById("brokers-container");
  if (!container) {
    return;
  }

  // Lista broker (da brokers.html)
  const brokers = [
    {
      name: "AvaTrade",
      url: "/AvaTrade.html",
      logo: "/logos/avatrade.svg",
      description: "Broker regolamentato con licenza MiFID",
    },
    {
      name: "BlackBull Markets",
      url: "/BlackBullMarkets.html",
      logo: "/logos/blackbull.svg",
      description: "Broker internazionale regolamentato",
    },
    {
      name: "Eightcap",
      url: "/Eightcap.html",
      logo: "/logos/eightcap.svg",
      description: "Trading CFD e Forex regolamentato",
    },
    {
      name: "eToro",
      url: "/eToro.html",
      logo: "/logos/etoro.svg",
      description: "Social trading e investimenti",
    },
    {
      name: "Exante",
      url: "/Exante.html",
      logo: "/logos/exante.svg",
      description: "Broker istituzionale multi-asset",
    },
    {
      name: "FP Markets",
      url: "/FPMarkets.html",
      logo: "/logos/fpmarkets.svg",
      description: "Trading CFD e Forex ASIC regolamentato",
    },
    {
      name: "Freedom24",
      url: "/Freedom24.html",
      logo: "/logos/freedom24.svg",
      description: "Trading azioni e ETF",
    },
    {
      name: "FxPro",
      url: "/FxPro.html",
      logo: "/logos/fxpro.svg",
      description: "Broker Forex e CFD multi-regolamentato",
    },
    {
      name: "NAGA",
      url: "/NAGA.html",
      logo: "/logos/naga.svg",
      description: "Social trading e copytrading",
    },
    {
      name: "Pepperstone",
      url: "/Pepperstone.html",
      logo: "/logos/pepperstone.svg",
      description: "Broker ECN regolamentato",
    },
    {
      name: "Plus500",
      url: "/Plus500.html",
      logo: "/logos/plus500.svg",
      description: "Trading CFD regolamentato",
    },
    {
      name: "Skilling",
      url: "/Skilling.html",
      logo: "/logos/skilling.svg",
      description: "Trading CFD e Forex",
    },
    {
      name: "XM",
      url: "/XM.html",
      logo: "/logos/xm.svg",
      description: "Broker Forex e CFD multi-regolamentato",
    },
  ];

  // Renderizza lista broker
  container.innerHTML = `
    <div class="brokers-section">
      <div class="brokers-intro">
        <h3>Broker Regolamentati</h3>
        <p>Lista di broker regolamentati e verificati per il trading sicuro</p>
        <a href="/brokers.html" class="btn btn-secondary" target="_blank" style="margin-top: var(--spacing-md);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="margin-right: 8px;">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Vai alla pagina completa
        </a>
      </div>

      <div class="brokers-grid">
        ${brokers
          .map(
            (broker) => `
          <a href="${broker.url}" class="broker-card" target="_blank">
            <div class="broker-card-logo">
              <img src="${broker.logo}" alt="${broker.name}" loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="broker-card-content">
              <h4 class="broker-card-name">${broker.name}</h4>
              <p class="broker-card-description">${broker.description}</p>
            </div>
            <div class="broker-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}
