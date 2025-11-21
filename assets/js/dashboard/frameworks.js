/**
 * Dashboard Module: Frameworks Documentation
 * FASE 5: Contenuti e Funzionalità
 * Documentazione framework SRD, MTB, PAC
 */

const FRAMEWORK_DOCS = {
  srd: {
    name: 'SRD v5.0',
    fullName: 'Swing Research Deck',
    description: 'Framework proprietario per analisi swing (orizzonte 3-10 giorni) basato su pipeline AI e modelli quantitativi.',
    docs: [
      { title: 'Documentazione completa', url: '/docs/analysis/SRD-v5.0.md' },
      { title: 'Specifiche tecniche', url: '/docs/architecture/SRD-SPEC.md' },
      { title: 'Esempi di utilizzo', url: '/docs/guides/SRD-EXAMPLES.md' }
    ]
  },
  mtb: {
    name: 'MTB v3.1',
    fullName: 'Macro Tactical Briefing',
    description: 'Framework per analisi macroeconomica e contesto tattico multi-fattore con integrazione sentiment.',
    docs: [
      { title: 'Documentazione completa', url: '/docs/analysis/MTB-v3.1.md' },
      { title: 'Specifiche tecniche', url: '/docs/architecture/MTB-SPEC.md' },
      { title: 'Esempi di utilizzo', url: '/docs/guides/MTB-EXAMPLES.md' }
    ]
  },
  pac: {
    name: 'PAC',
    fullName: 'Protocollo Allerta Criptovalute',
    description: 'Protocollo specializzato per monitoraggio e analisi del mercato delle criptovalute.',
    docs: [
      { title: 'Documentazione completa', url: '/docs/analysis/PAC.md' },
      { title: 'Specifiche tecniche', url: '/docs/architecture/PAC-SPEC.md' },
      { title: 'Esempi di utilizzo', url: '/docs/guides/PAC-EXAMPLES.md' }
    ]
  }
};

export async function loadFrameworks() {
  const container = document.getElementById('frameworks-container');
  if (!container) return;

  // Setup link handlers
  const frameworkLinks = document.querySelectorAll('.framework-link');
  frameworkLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const frameworkId = link.closest('.framework-card')?.dataset?.framework;
      const docType = link.textContent.trim();
      
      if (frameworkId && FRAMEWORK_DOCS[frameworkId]) {
        const doc = FRAMEWORK_DOCS[frameworkId].docs.find(d => d.title === docType);
        if (doc) {
          // Naviga a documentazione (o mostra modal)
          window.open(doc.url, '_blank');
        }
      }
    });
  });

  // Aggiungi data attributes per identificazione
  const frameworkCards = document.querySelectorAll('.framework-card');
  frameworkCards.forEach((card, index) => {
    const frameworks = Object.keys(FRAMEWORK_DOCS);
    if (frameworks[index]) {
      card.setAttribute('data-framework', frameworks[index]);
    }
  });
}
