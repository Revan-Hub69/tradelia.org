// Script per generare HTML per tutti i tutorial
// Usa il template base e crea un HTML per ogni JSON nella cartella data/

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTemplateBase(tutorialName) {
  return `<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="Tutorial Tradelia AI - Progetto indipendente con metodo accademico AI per analisi finanziaria" />
  <meta name="keywords" content="Tradelia AI, metodo accademico, progetto indipendente, AI trading, analisi finanziaria" />
  <meta name="author" content="Tradelia AI" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#ffffff" />
  
  <!-- Open Graph / Facebook - Default values (verranno sovrascritti da tutorial-renderer.js) -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="TRADELIA • AI — Tutorial" />
  <meta property="og:description" content="Progetto indipendente che utilizza AI con metodo accademico per analisi finanziaria multi-fattore. Tutorial completo su trading e investimenti." />
  <meta property="og:image" content="https://tradelia.org/img/tradelia_og_vC_white_clean.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="Tradelia AI" />
  <meta property="og:locale" content="it_IT" />
  
  <!-- Twitter Card - Default values (verranno sovrascritti da tutorial-renderer.js) -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="TRADELIA • AI — Tutorial" />
  <meta name="twitter:description" content="Progetto indipendente che utilizza AI con metodo accademico per analisi finanziaria multi-fattore." />
  <meta name="twitter:image" content="https://tradelia.org/img/tradelia_og_vC_white_clean.png" />
  <meta name="twitter:creator" content="@tradelia_ai" />
  <meta name="twitter:site" content="@tradelia_ai" />
  
  <title>TRADELIA • AI — Tutorial</title>
  
  <!-- Stylesheet -->
  <link rel="stylesheet" href="/report/assets/css/tokens.css" />
  <link rel="stylesheet" href="/report/assets/css/report-layout.css" />
  <link rel="stylesheet" href="/report/assets/css/glossary-drawer.css" />
  <link rel="stylesheet" href="/report/assets/css/glossary-popup.css" />
  <link rel="stylesheet" href="/report/tutorial-light.css" />
</head>
<body>
  <!-- HEADER SLOT -->
  <div id="site-header-slot"></div>

  <!-- MAIN CONTENT -->
  <main id="tutorial-content" role="main">
    <!-- Content will be injected here by tutorial-renderer.js -->
  </main>

  <!-- FOOTER SLOT -->
  <div id="site-footer-slot"></div>

  <!-- SCRIPTS -->
  <script type="module" src="/report/assets/js/tutorial-renderer.js"></script>
</body>
</html>`;
}

async function generateHTML() {
  const dataDir = join(__dirname, 'data');
  const tutorialDir = __dirname;
  
  try {
    const files = await readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const jsonFile of jsonFiles) {
      const tutorialName = jsonFile.replace('.json', '');
      const htmlFileName = `${tutorialName}.html`;
      const htmlPath = join(tutorialDir, htmlFileName);
      
      // Leggi JSON per aggiornare meta tags
      const jsonPath = join(dataDir, jsonFile);
      const jsonContent = await readFile(jsonPath, 'utf-8');
      const data = JSON.parse(jsonContent);
      
      // Aggiorna template con meta tags dal JSON
      let html = getTemplateBase(tutorialName);
      html = html.replace('<title>TRADELIA • AI — Tutorial</title>', 
        `<title>TRADELIA • AI — ${data.title || 'Tutorial'}</title>`);
      html = html.replace('<meta name="description" content="Tutorial Tradelia AI" />', 
        `<meta name="description" content="Tutorial Tradelia AI - ${data.title || 'Tutorial'}" />`);
      
      await writeFile(htmlPath, html, 'utf-8');
      console.log(`✓ Generato: ${htmlFileName}`);
    }
    
    console.log(`\n✅ Generati ${jsonFiles.length} file HTML`);
  } catch (error) {
    console.error('Errore:', error);
  }
}

// Esegui solo se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-html.js')) {
  generateHTML().catch(err => {
    console.error('Errore generazione HTML:', err);
    process.exit(1);
  });
}

export { generateHTML };

