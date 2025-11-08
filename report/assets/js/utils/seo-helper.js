// /report/assets/js/utils/seo-helper.js
// Sistema modulare per metadati SEO AI e social sharing

/**
 * Genera metadati SEO completi per una pagina
 * @param {Object} config - Configurazione metadati
 * @param {string} config.title - Titolo pagina
 * @param {string} config.description - Descrizione pagina
 * @param {string} config.url - URL pagina
 * @param {string} config.image - URL immagine social (default: og image)
 * @param {string} config.type - Tipo Open Graph (website, article, etc.)
 * @param {Object} config.structuredData - Structured data JSON-LD personalizzato
 * @param {string} config.keywords - Keywords separati da virgola
 * @param {Object} config.article - Dati articolo (per type: article)
 */
export function generateSEOMetaTags(config) {
  const {
    title,
    description,
    url,
    image = 'https://tradelia.org/img/tradelia_og_vC_white_clean.png',
    type = 'website',
    structuredData,
    keywords,
    article = {}
  } = config;

  const baseUrl = 'https://tradelia.org';
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Aggiorna title
  document.title = title || 'Tradelia AI';

  // Meta description
  updateOrCreateMeta('name', 'description', description);
  
  // Keywords
  if (keywords) {
    updateOrCreateMeta('name', 'keywords', keywords);
  }

  // Robots
  updateOrCreateMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // Open Graph
  updateOrCreateMeta('property', 'og:type', type);
  updateOrCreateMeta('property', 'og:title', title);
  updateOrCreateMeta('property', 'og:description', description);
  updateOrCreateMeta('property', 'og:url', fullUrl);
  updateOrCreateMeta('property', 'og:image', fullImageUrl);
  updateOrCreateMeta('property', 'og:image:width', '1200');
  updateOrCreateMeta('property', 'og:image:height', '630');
  updateOrCreateMeta('property', 'og:image:type', 'image/png');
  updateOrCreateMeta('property', 'og:site_name', 'Tradelia AI');
  updateOrCreateMeta('property', 'og:locale', 'it_IT');

  // Article specific
  if (type === 'article' && article) {
    if (article.publishedTime) {
      updateOrCreateMeta('property', 'article:published_time', article.publishedTime);
    }
    if (article.modifiedTime) {
      updateOrCreateMeta('property', 'article:modified_time', article.modifiedTime);
    }
    if (article.author) {
      updateOrCreateMeta('property', 'article:author', article.author);
    }
    if (article.section) {
      updateOrCreateMeta('property', 'article:section', article.section);
    }
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    }
  }

  // Twitter Card
  updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  updateOrCreateMeta('name', 'twitter:title', title);
  updateOrCreateMeta('name', 'twitter:description', description);
  updateOrCreateMeta('name', 'twitter:image', fullImageUrl);
  updateOrCreateMeta('name', 'twitter:image:alt', title);
  updateOrCreateMeta('name', 'twitter:creator', '@tradelia_ai');
  updateOrCreateMeta('name', 'twitter:site', '@tradelia_ai');

  // Structured Data JSON-LD
  if (structuredData) {
    injectStructuredData(structuredData);
  }
}

/**
 * Genera structured data per Article (tutorial, blog posts)
 */
export function generateArticleStructuredData(config) {
  const {
    title,
    description,
    url,
    image,
    author = 'Tradelia AI',
    datePublished,
    dateModified,
    section = 'Trading & Investimenti',
    keywords = []
  } = config;

  const baseUrl = 'https://tradelia.org';
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
  const fullImageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/img/tradelia_og_vC_white_clean.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'image': fullImageUrl,
    'author': {
      '@type': 'Organization',
      'name': author,
      'url': baseUrl
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Tradelia AI',
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/img/tradelia_og_vC_white_clean.png`
      }
    },
    'datePublished': datePublished || new Date().toISOString(),
    'dateModified': dateModified || new Date().toISOString(),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': fullUrl
    },
    'articleSection': section,
    'keywords': keywords.join(', ')
  };
}

/**
 * Genera structured data per FinancialProduct (report, analisi)
 */
export function generateFinancialProductStructuredData(config) {
  const {
    ticker,
    companyName,
    description,
    url,
    datePublished,
    provider = 'Tradelia AI'
  } = config;

  const baseUrl = 'https://tradelia.org';
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    'name': `${companyName} (${ticker}) - Analisi Finanziaria`,
    'description': description,
    'provider': {
      '@type': 'Organization',
      'name': provider,
      'url': baseUrl
    },
    'tickerSymbol': ticker,
    'url': fullUrl,
    'datePublished': datePublished || new Date().toISOString(),
    'category': 'Financial Analysis',
    'applicationCategory': 'FinanceApplication'
  };
}

/**
 * Genera structured data per CollectionPage (glossario, archivio)
 */
export function generateCollectionPageStructuredData(config) {
  const {
    title,
    description,
    url,
    itemCount,
    items = []
  } = config;

  const baseUrl = 'https://tradelia.org';
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': title,
    'description': description,
    'url': fullUrl,
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': itemCount || items.length,
      'itemListElement': items.slice(0, 10).map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Thing',
          'name': item.name || item.title,
          'url': item.url ? (item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`) : fullUrl
        }
      }))
    }
  };

  return structuredData;
}

/**
 * Genera structured data per WebSite (homepage)
 */
export function generateWebSiteStructuredData(config = {}) {
  const {
    url = 'https://tradelia.org',
    name = 'Tradelia AI',
    description = 'Framework Accademico AI per analisi finanziaria multi-fattore',
    potentialAction = {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://tradelia.org/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  } = config;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': name,
    'url': url,
    'description': description,
    'publisher': {
      '@type': 'Organization',
      'name': 'Tradelia AI',
      'url': url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${url}/img/tradelia_og_vC_white_clean.png`
      }
    },
    'potentialAction': potentialAction
  };
}

/**
 * Genera structured data per FAQPage (se applicabile)
 */
export function generateFAQPageStructuredData(config) {
  const {
    faqs = []
  } = config;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Helper per aggiornare o creare meta tag
 */
function updateOrCreateMeta(attr, value, content) {
  let meta = document.querySelector(`meta[${attr}="${value}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, value);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Inietta structured data JSON-LD nel document
 */
function injectStructuredData(data) {
  // Rimuovi structured data esistente
  const existing = document.querySelector('script[type="application/ld+json"]#structured-data');
  if (existing) {
    existing.remove();
  }

  // Crea nuovo script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'structured-data';
  script.textContent = JSON.stringify(data, null, 2);
  document.head.appendChild(script);
}

/**
 * Genera URL immagine social personalizzata
 * @param {string} pageType - Tipo pagina (homepage, tutorial, report, glossario)
 * @param {string} identifier - Identificatore pagina (titolo, ticker, etc.)
 */
export function generateSocialImageUrl(pageType, identifier = '') {
  const baseUrl = 'https://tradelia.org/img';
  
  // Mappa tipi pagina a immagini
  const imageMap = {
    'homepage': `${baseUrl}/tradelia_og_vC_white_clean.png`,
    'tutorial': `${baseUrl}/tradelia_og_vC_white_clean.png`,
    'report': `${baseUrl}/tradelia_og_vC_white_clean.png`,
    'glossario': `${baseUrl}/tradelia_og_vC_white_clean.png`,
    'default': `${baseUrl}/tradelia_og_vC_white_clean.png`
  };

  // TODO: In futuro, generare immagini dinamiche con titolo/identifier
  // Per ora usiamo l'immagine base
  return imageMap[pageType] || imageMap.default;
}

/**
 * Ottimizza meta description per AI search
 * @param {string} description - Descrizione base
 * @param {Array} keywords - Keywords rilevanti
 */
export function optimizeDescriptionForAI(description, keywords = []) {
  // Assicurati che la descrizione sia ottimale per AI:
  // - Max 160 caratteri (ma AI può leggere più lungo)
  // - Includi keywords naturalmente
  // - Sii specifico e informativo
  // - Usa linguaggio chiaro
  // - Enfatizza "progetto indipendente" e "metodo accademico", evita "istituzionale"
  
  let optimized = description;
  
  // Rimuovi eventuali riferimenti fuorvianti a "istituzionale" nel contesto del progetto
  // (manteniamo "istituzionale" solo se si riferisce a tipi di analisi/metodi, non al progetto stesso)
  optimized = optimized.replace(/\bMetodo istituzionale\b/gi, 'Metodo accademico');
  optimized = optimized.replace(/\bapproccio istituzionale\b/gi, 'metodo accademico');
  
  // Se troppo corta, aggiungi contesto che enfatizza il progetto indipendente
  if (optimized.length < 100 && keywords.length > 0) {
    // Verifica se già menziona "progetto indipendente" o "metodo accademico"
    const hasProjectContext = /progetto indipendente|metodo accademico/i.test(optimized);
    if (!hasProjectContext) {
      optimized = `${description} Progetto indipendente con metodo accademico AI.`;
    } else {
      const keywordsStr = keywords.slice(0, 2).join(', ');
      optimized = `${description} Scopri ${keywordsStr} con Tradelia AI.`;
    }
  }
  
  // Taglia a max 320 caratteri (AI-friendly)
  if (optimized.length > 320) {
    optimized = optimized.substring(0, 317) + '...';
  }
  
  return optimized;
}

