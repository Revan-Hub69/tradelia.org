/**
 * Dashboard Module: Resources & Support
 * FAQ, guide, documentazione, supporto
 */

export async function loadResources() {
  // Resource cards già renderizzate in HTML
  // Qui possiamo aggiungere logica per:
  // - Caricamento FAQ dinamica
  // - Search FAQ
  // - Link a guide/documentazione

  const resourceLinks = document.querySelectorAll('.resource-link');
  resourceLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Gestione link (alcuni sono mailto, altri navigazione)
      if (link.href.startsWith('mailto:')) {
        // Mailto gestito dal browser
        return;
      }
      e.preventDefault();
      // TODO: Implementare navigazione a risorse
      console.log('[Resources] Link clicked:', link.textContent);
    });
  });
}
