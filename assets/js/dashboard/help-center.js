/**
 * Dashboard Help Center
 * FAQ interattive e guide
 * Best Practice: Client-side help con markdown-like content
 */

const HELP_CONTENT = {
  faq: [
    {
      question: 'Come posso cercare un report?',
      answer: 'Usa la ricerca globale con Ctrl+K (o Cmd+K su Mac) oppure vai alla sezione Report e usa la barra di ricerca.',
    },
    {
      question: 'Come aggiungo un report ai preferiti?',
      answer: 'Clicca sull\'icona stella accanto a qualsiasi report nella lista. I preferiti sono salvati localmente nel tuo browser.',
    },
    {
      question: 'Come posso esportare i dati?',
      answer: 'Vai alle Impostazioni e usa la funzione Export Dati per scaricare le tue preferenze e dati salvati.',
    },
    {
      question: 'Cosa sono i Framework Documentation?',
      answer: 'I Framework Documentation contengono le metodologie di analisi (SRD, MTB, PAC) utilizzate da Tradelia.',
    },
    {
      question: 'Come funzionano le Community Proposals?',
      answer: 'Gli utenti Pro possono proporre e votare analisi da aggiungere alla piattaforma. Vai alla sezione Community per vedere le proposte attive.',
    },
  ],
  guides: [
    {
      title: 'Guida Rapida Dashboard',
      content: `
        <h4>Navigazione</h4>
        <p>Usa i moduli nella griglia principale per navigare tra le sezioni della dashboard.</p>
        
        <h4>Shortcuts</h4>
        <ul>
          <li><kbd>Ctrl+K</kbd> / <kbd>Cmd+K</kbd> - Ricerca globale</li>
          <li><kbd>?</kbd> - Mostra tutti gli shortcuts</li>
          <li><kbd>G</kbd> + <kbd>O</kbd> - Vai a Panoramica</li>
          <li><kbd>G</kbd> + <kbd>R</kbd> - Vai a Report</li>
        </ul>
        
        <h4>Preferiti</h4>
        <p>Aggiungi report ai preferiti cliccando sull'icona stella per accesso rapido.</p>
      `,
    },
  ],
};

export async function loadHelpCenter() {
  const container = document.getElementById('help-center-container');
  if (!container) return;

  renderHelpCenter(container);
}

function renderHelpCenter(container) {
  container.innerHTML = `
    <div class="help-center-search">
      <div class="help-center-search-wrapper">
        <svg class="help-center-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" id="help-search-input" class="help-center-search-input" placeholder="Cerca nelle FAQ e guide..." />
      </div>
    </div>

    <div class="help-center-sections">
      <div class="help-center-section">
        <h3 class="help-center-section-title">Domande Frequenti</h3>
        <div class="help-center-faq">
          ${HELP_CONTENT.faq.map((item, index) => `
            <div class="help-center-faq-item" data-index="${index}">
              <button class="help-center-faq-question" aria-expanded="false">
                <span>${escapeHtml(item.question)}</span>
                <svg class="help-center-faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div class="help-center-faq-answer">
                <p>${escapeHtml(item.answer)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="help-center-section">
        <h3 class="help-center-section-title">Guide</h3>
        <div class="help-center-guides">
          ${HELP_CONTENT.guides.map((guide) => `
            <div class="help-center-guide-item">
              <h4 class="help-center-guide-title">${escapeHtml(guide.title)}</h4>
              <div class="help-center-guide-content">${guide.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Setup FAQ accordion
  container.querySelectorAll('.help-center-faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.help-center-faq-item');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      btn.setAttribute('aria-expanded', !isExpanded);
      item.classList.toggle('expanded');
    });
  });

  // Setup search
  const searchInput = document.getElementById('help-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterHelpContent(query);
    });
  }
}

function filterHelpContent(query) {
  if (!query) {
    document.querySelectorAll('.help-center-faq-item, .help-center-guide-item').forEach((el) => {
      el.style.display = '';
    });
    return;
  }

  document.querySelectorAll('.help-center-faq-item').forEach((item) => {
    const question = item.querySelector('.help-center-faq-question').textContent.toLowerCase();
    const answer = item.querySelector('.help-center-faq-answer').textContent.toLowerCase();
    const matches = question.includes(query) || answer.includes(query);
    item.style.display = matches ? '' : 'none';
  });

  document.querySelectorAll('.help-center-guide-item').forEach((item) => {
    const content = item.textContent.toLowerCase();
    item.style.display = content.includes(query) ? '' : 'none';
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

