/**
 * Dashboard Module: Frameworks Documentation
 * Documentazione framework SRD, MTB, PAC
 */

export async function loadFrameworks() {
  // Framework cards già renderizzate in HTML
  // Qui possiamo aggiungere logica per:
  // - Caricamento documentazione dinamica
  // - Link a documentazione esterna
  // - Esempi interattivi

  const frameworkLinks = document.querySelectorAll('.framework-link');
  frameworkLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // TODO: Implementare navigazione a documentazione
      console.log('[Frameworks] Link clicked:', link.textContent);
    });
  });
}
