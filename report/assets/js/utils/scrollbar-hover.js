// /report/assets/js/utils/scrollbar-hover.js
// Gestione hover scrollbar globale - mostra scrollbar solo in hover

(function() {
  'use strict';
  
  if (document.documentElement.getAttribute('data-theme') === 'light') {
    return; // Non applicare su light theme
  }
  
  let hoverTimeout;
  let scrollTimeout;
  const HOVER_DELAY = 150; // ms di delay prima di nascondere
  
  function addScrollbarHover(el) {
    if (!el || el.dataset.scrollbarHover) return;
    el.dataset.scrollbarHover = 'true';
    
    // Hover sull'elemento scrollabile
    el.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      clearTimeout(scrollTimeout);
      el.classList.add('scrollbar-hover-active');
    }, { passive: true });
    
    el.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        el.classList.remove('scrollbar-hover-active');
      }, HOVER_DELAY);
    }, { passive: true });
    
    // Mostra scrollbar durante lo scroll
    let scrollTimer;
    el.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      clearTimeout(hoverTimeout);
      clearTimeout(scrollTimeout);
      
      el.classList.add('scrollbar-hover-active');
      
      scrollTimer = setTimeout(() => {
        scrollTimeout = setTimeout(() => {
          if (!el.matches(':hover')) {
            el.classList.remove('scrollbar-hover-active');
          }
        }, 800); // Mantieni visibile per 800ms dopo lo scroll
      }, 50);
    }, { passive: true });
  }
  
  // Applica a body e html immediatamente
  function initMainScrollbars() {
    addScrollbarHover(document.body);
    addScrollbarHover(document.documentElement);
  }
  
  // Inizializza subito
  initMainScrollbars();
  
  // Applica a tutti gli elementi scrollabili
  function initScrollableElements() {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.dataset.scrollbarHover) return; // Già processato
      
      const style = window.getComputedStyle(el);
      const hasScroll = style.overflow === 'auto' || style.overflow === 'scroll' || 
                        style.overflowY === 'auto' || style.overflowY === 'scroll' ||
                        style.overflowX === 'auto' || style.overflowX === 'scroll';
      
      if (hasScroll && el.scrollHeight > el.clientHeight) {
        addScrollbarHover(el);
      }
    });
  }
  
  // Inizializza al DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollableElements();
    });
  } else {
    initScrollableElements();
  }
  
  // Osserva nuovi elementi aggiunti al DOM
  const observer = new MutationObserver(() => {
    initScrollableElements();
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();

