/**
 * Theme Initialization
 * Forza tema dark immediatamente per evitare flash (FOUC - Flash of Unstyled Content)
 * Deve essere caricato il prima possibile, prima di qualsiasi CSS
 */
(function () {
  'use strict';
  if (document.documentElement) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-theme-manual', 'true');
  }
})();

