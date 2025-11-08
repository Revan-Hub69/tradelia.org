// /report/assets/js/tutorial-renderer.js
// Renderer Tutorial - Carica JSON e genera HTML con impaginazione Tradelia
// Sistema modulare: header/footer componenti + corpo da JSON

import { siteHeader } from './components/site-header.js';
import { siteFooter } from './components/site-footer.js';
import { glossaryPopup } from './components/glossary-popup.js';
import { generateArticleStructuredData, optimizeDescriptionForAI } from './utils/seo-helper.js';
import Logger from './utils/logger.js';

// ===== UTILITIES =====
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function processText(text, glossaryTerms = {}) {
  if (!text) return '';
  
  // Processa termini glossario: {term: "chiave"}
  let processed = text;
  Object.entries(glossaryTerms).forEach(([term, key]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    processed = processed.replace(regex, (match) => {
      return `<span class="glossary-term" data-glossary="${escapeHtml(key)}">${match}</span>`;
    });
  });
  
  // Processa markdown-like: **bold**, *italic*, __underline__
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  processed = processed.replace(/__(.+?)__/g, '<u>$1</u>');
  
  return processed;
}

// ===== RENDER HEADER =====
function renderHeader(data) {
  const meta = data.meta || {};
  const tags = data.tags || [];
  
  return `
    <header class="tutorial-header">
      <h1 class="tutorial-title">${escapeHtml(data.title || 'Tutorial')}</h1>
      <div class="tutorial-meta">
        ${meta.published ? `<span>Pubblicato: ${escapeHtml(meta.published)}</span>` : ''}
        ${meta.published && meta.category ? '<span>•</span>' : ''}
        ${meta.category ? `<span>Categoria: ${escapeHtml(meta.category)}</span>` : ''}
      </div>
      ${tags.length > 0 ? `
        <div class="tutorial-tags">
          ${tags.map(tag => `<span class="tutorial-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </header>
  `;
}

// ===== RENDER TOC =====
function renderTOC(sections) {
  if (!sections || sections.length === 0) return '';
  
  return `
    <nav class="tutorial-toc" aria-label="Indice del tutorial">
      <h2 class="tutorial-toc-title">Indice del Tutorial</h2>
      <ol class="tutorial-toc-list">
        ${sections.map((section, index) => `
          <li class="tutorial-toc-item">
            <a href="#${section.id || `sezione-${index + 1}`}" class="tutorial-toc-link">
              ${index + 1}. ${escapeHtml(section.title || `Sezione ${index + 1}`)}
            </a>
          </li>
        `).join('')}
      </ol>
    </nav>
  `;
}

// ===== RENDER SECTION =====
function renderSection(section, index, glossaryTerms = {}) {
  const sectionId = section.id || `sezione-${index + 1}`;
  const title = section.title || `Sezione ${index + 1}`;
  const content = section.content || [];
  
  let html = `
    <section id="${sectionId}" class="tutorial-section">
      <h2 class="tutorial-section-title">${index + 1}. ${escapeHtml(title)}</h2>
      <div class="tutorial-content">
  `;
  
  content.forEach(item => {
    if (item.type === 'paragraph') {
      html += `<p>${processText(item.text, glossaryTerms)}</p>`;
    } else if (item.type === 'heading') {
      const level = item.level || 3;
      const headingTag = `h${level}`;
      html += `<${headingTag} class="tutorial-section-subtitle">${escapeHtml(item.text)}</${headingTag}>`;
    } else if (item.type === 'list') {
      const listTag = item.ordered ? 'ol' : 'ul';
      html += `<${listTag}>`;
      item.items.forEach(itemText => {
        html += `<li>${processText(itemText, glossaryTerms)}</li>`;
      });
      html += `</${listTag}>`;
    } else if (item.type === 'table') {
      html += renderTable(item, glossaryTerms);
    } else if (item.type === 'pill') {
      html += `<div class="tutorial-pill">${processText(item.text, glossaryTerms)}</div>`;
    } else if (item.type === 'html') {
      html += item.content;
    }
  });
  
  html += `
      </div>
    </section>
  `;
  
  return html;
}

// ===== RENDER TABLE =====
function renderTable(tableData, glossaryTerms = {}) {
  if (!tableData.headers || !tableData.rows) return '';
  
  let html = `
    <table class="tutorial-table">
      <thead>
        <tr>
          ${tableData.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  tableData.rows.forEach(row => {
    html += '<tr>';
    row.forEach((cell, index) => {
      const cellClass = cell.class || '';
      let cellContent = '';
      if (typeof cell === 'string') {
        cellContent = processText(cell);
      } else if (cell && typeof cell === 'object') {
        // Se ha HTML, usa direttamente, altrimenti processa il testo
        cellContent = cell.html || processText(cell.text || '');
      }
      html += `<td${cellClass ? ` class="${cellClass}"` : ''}>${cellContent}</td>`;
    });
    html += '</tr>';
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  return html;
}

// ===== LOAD AND RENDER =====
async function loadTutorialData() {
  // Estrai nome file tutorial da URL
  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.html', '');
  const jsonPath = `/report/tutorial/data/${fileName}.json`;
  
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    Logger.debug('TutorialRenderer', `Tutorial caricato: ${fileName}`);
    return data;
  } catch (err) {
    Logger.error('TutorialRenderer', `Errore caricamento tutorial: ${jsonPath}`, err);
    return null;
  }
}

// ===== RENDER TUTORIAL =====
async function renderTutorial() {
  const container = document.getElementById('tutorial-content');
  if (!container) {
    Logger.error('TutorialRenderer', 'Container tutorial-content non trovato');
    return;
  }
  
  // Carica dati
  const data = await loadTutorialData();
  if (!data) {
    container.innerHTML = `
      <div style="padding: var(--sp-8); text-align: center; color: var(--muted);">
        <p>Errore nel caricamento del tutorial.</p>
      </div>
    `;
    return;
  }
  
  // Aggiorna meta tags SEO
  updateSEOMetaTags(data);
  
  // Render header
  const headerHtml = renderHeader(data);
  
  // Render TOC
  const tocHtml = renderTOC(data.sections || []);
  
  // Render sections
  const glossaryTerms = data.glossaryTerms || {};
  const sectionsHtml = (data.sections || []).map((section, index) => 
    renderSection(section, index, glossaryTerms)
  ).join('');
  
  // Assembla HTML
  container.innerHTML = headerHtml + tocHtml + sectionsHtml;
  
  // Mount header/footer
  const headerSlot = document.getElementById('site-header-slot');
  if (headerSlot) {
    siteHeader.mount(headerSlot);
  }
  
  const footerSlot = document.getElementById('site-footer-slot');
  if (footerSlot) {
    siteFooter.mount(footerSlot);
  }
  
  // Mount glossary popup
  glossaryPopup.mount();
  
  // Bind glossary terms
  bindGlossaryTerms();
  
  // Set light theme
  document.documentElement.setAttribute('data-theme', 'light');
  
  Logger.debug('TutorialRenderer', 'Tutorial renderizzato');
}

// ===== UPDATE SEO META TAGS =====
function updateSEOMetaTags(data) {
  const title = data.title || 'Tutorial Tradelia AI';
  const meta = data.meta || {};
  const tags = data.tags || [];
  const category = meta.category || 'Trading & Investimenti';
  
  // Estrai descrizione dal primo paragrafo o usa default
  let description = '';
  if (data.sections && data.sections.length > 0) {
    const firstSection = data.sections[0];
    if (firstSection.content) {
      const firstParagraph = firstSection.content.find(item => item.type === 'paragraph');
      if (firstParagraph && firstParagraph.text) {
        description = firstParagraph.text.substring(0, 160);
      }
    }
  }
  if (!description) {
    description = `Tutorial completo su ${title.toLowerCase()}. ${category}. Guida pratica con esempi e spiegazioni dettagliate.`;
  }
  
  // Ottimizza descrizione per AI
  const keywords = tags.concat(['Tradelia AI', category, 'Tutorial']);
  description = optimizeDescriptionForAI(description, keywords);
  
  // URL pagina
  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.html', '');
  const url = `https://tradelia.org/report/tutorial/${fileName}.html`;
  
  // Aggiorna title
  document.title = `TRADELIA • AI — ${title}`;
  
  // Aggiorna meta description
  updateOrCreateMeta('name', 'description', description);
  
  // Aggiorna keywords
  updateOrCreateMeta('name', 'keywords', keywords.join(', '));
  
  // Aggiorna Open Graph
  updateOrCreateMeta('property', 'og:title', `TRADELIA • AI — ${title}`);
  updateOrCreateMeta('property', 'og:description', description);
  updateOrCreateMeta('property', 'og:url', url);
  
  // Aggiorna Twitter Card
  updateOrCreateMeta('name', 'twitter:title', `TRADELIA • AI — ${title}`);
  updateOrCreateMeta('name', 'twitter:description', description);
  
  // Aggiorna article tags
  if (meta.published) {
    // Converti data pubblicazione in ISO
    const publishedDate = new Date(meta.published).toISOString();
    updateOrCreateMeta('property', 'article:published_time', publishedDate);
  }
  updateOrCreateMeta('property', 'article:section', category);
  tags.forEach(tag => {
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('property', 'article:tag');
    metaTag.setAttribute('content', tag);
    document.head.appendChild(metaTag);
  });
  
  // Aggiorna structured data JSON-LD
  const structuredData = generateArticleStructuredData({
    title: `TRADELIA • AI — ${title}`,
    description: description,
    url: url,
    author: 'Tradelia AI',
    datePublished: meta.published ? new Date(meta.published).toISOString() : new Date().toISOString(),
    dateModified: new Date().toISOString(),
    section: category,
    keywords: keywords
  });
  
  // Rimuovi structured data esistente
  const existing = document.querySelector('script[type="application/ld+json"]#structured-data');
  if (existing) {
    existing.remove();
  }
  
  // Inietta nuovo structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'structured-data';
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
  
  Logger.debug('TutorialRenderer', 'Meta tags SEO aggiornati');
}

// ===== HELPER: UPDATE OR CREATE META =====
function updateOrCreateMeta(attr, value, content) {
  let meta = document.querySelector(`meta[${attr}="${value}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, value);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

// ===== BIND GLOSSARY TERMS =====
function bindGlossaryTerms() {
  const glossaryTerms = document.querySelectorAll('.glossary-term[data-glossary]');
  
  glossaryTerms.forEach(term => {
    term.addEventListener('click', async (e) => {
      e.preventDefault();
      const termKey = term.dataset.glossary;
      if (termKey) {
        try {
          await glossaryPopup.openTerm(termKey);
        } catch (err) {
          Logger.warn('TutorialRenderer', 'Errore apertura glossario:', err);
        }
      }
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderTutorial();
});

export { renderTutorial, processText, renderSection };

