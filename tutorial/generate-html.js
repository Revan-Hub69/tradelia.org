// Script per generare HTML per tutti i tutorial
// Usa il template base e crea un HTML per ogni JSON nella cartella data/

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const templateBase = `<!DOCTYPE html>
<html lang="it" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="Tutorial Tradelia AI" />
  <meta name="keywords" content="Tradelia AI, tutorial" />
  <meta name="author" content="Tradelia AI" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#ffffff" />
  
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

async function generateHTML() {
  const dataDir = join(process.cwd(), 'tutorial', 'data');
  const tutorialDir = join(process.cwd(), 'tutorial');
  
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
      let html = templateBase;
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

generateHTML();

