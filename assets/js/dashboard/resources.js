/**
 * Dashboard Module: Resources & Support
 * FASE 5: Contenuti e Funzionalità
 * FAQ, guide, documentazione, supporto
 */

const RESOURCE_LINKS = {
  faq: "/docs/guides/FAQ.md",
  guides: "/docs/guides/",
  docs: "/docs/architecture/",
  support: "mailto:support@tradelia.org",
};

export async function loadResources() {
  // Setup link handlers
  const resourceLinks = document.querySelectorAll(".resource-link");
  resourceLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Gestione link mailto
      if (link.href.startsWith("mailto:")) {
        return; // Browser gestisce mailto
      }

      e.preventDefault();

      // Identifica tipo risorsa
      const resourceCard = link.closest(".resource-card");
      const resourceTitle = resourceCard
        ?.querySelector(".resource-title")
        ?.textContent?.toLowerCase();

      if (resourceTitle) {
        const url = RESOURCE_LINKS[resourceTitle] || link.href;

        // Naviga a risorsa
        if (url.startsWith("http") || url.startsWith("/")) {
          window.open(url, "_blank");
        } else {
          console.warn("[Resources] URL non valido:", url);
        }
      }
    });
  });

  // Carica FAQ se disponibile
  loadFAQ();
}

async function loadFAQ() {
  try {
    // Prova a caricare FAQ da file
    const response = await fetch("/docs/guides/FAQ.md");
    if (response.ok) {
      // FAQ disponibile, link funzionante
      console.log("[Resources] FAQ disponibile");
    }
  } catch (err) {
    // FAQ non disponibile, normale
    console.debug("[Resources] FAQ non disponibile (normale)");
  }
}
