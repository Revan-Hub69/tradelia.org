// /report/assets/js/utils/scrollbar-hover.js
// Gestione hover scrollbar globale - mostra scrollbar solo in hover

(function() {
  'use strict';
  
  if (document.documentElement.getAttribute('data-theme') === 'light') {
    return; // Non applicare su light theme
  }
  
  let hoverTimeout;
  const HOVER_DELAY = 100; // ms di delay prima di nascondere
  
  function addScrollbarHover(el) {
    if (!el || el.dataset.scrollbarHover) return;
    el.dataset.scrollbarHover = 'true';
    
    el.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      el.classList.add('scrollbar-hover-active');
    }, { passive: true });
    
    el.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        el.classList.remove('scrollbar-hover-active');
      }, HOVER_DELAY);
    }, { passive: true });
    
    // Mostra scrollbar durante lo scroll
    el.addEventListener('scroll', () => {
      clearTimeout(hoverTimeout);
      el.classList.add('scrollbar-hover-active');
      hoverTimeout = setTimeout(() => {
        el.classList.remove('scrollbar-hover-active');
      }, 1000); // Mantieni visibile per 1s dopo lo scroll
    }, { passive: true });
  }
  
  // Applica a body e html
  addScrollbarHover(document.body);
  addScrollbarHover(document.documentElement);
  
  // Applica a tutti gli elementi scrollabili
  function initScrollableElements() {
    const scrollableElements = document.querySelectorAll('*');
    scrollableElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.overflow === 'auto' || style.overflow === 'scroll' || 
          style.overflowY === 'auto' || style.overflowY === 'scroll' ||
          style.overflowX === 'auto' || style.overflowX === 'scroll') {
        addScrollbarHover(el);
      }
    });
  }
  
  // Inizializza al DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollableElements);
  } else {
    initScrollableElements();
  }
  
  // Osserva nuovi elementi aggiunti al DOM
  const observer = new MutationObserver(() => {
    initScrollableElements();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

