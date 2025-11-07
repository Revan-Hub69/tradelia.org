// Script per generare immagine hero da SVG
// Richiede: npm install sharp
// Eseguire con: node scripts/generate-hero-image.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'img');
const svgPath = path.join(imgDir, 'hero-homepage.svg');
const pngPath = path.join(imgDir, 'hero-homepage.png');
const jpgPath = path.join(imgDir, 'hero-homepage.jpg');

async function generateHeroImage() {
  console.log('🎨 Generazione immagine hero...\n');
  
  // Verifica che la directory img esista
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }
  
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ SVG non trovato: ${svgPath}`);
    return;
  }
  
  try {
    // Genera PNG (1920x1080)
    await sharp(svgPath)
      .resize(1920, 1080)
      .png()
      .toFile(pngPath);
    
    console.log(`✅ Generato: hero-homepage.png (1920x1080)`);
    
    // Genera JPG (1920x1080, ottimizzato)
    await sharp(svgPath)
      .resize(1920, 1080)
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(jpgPath);
    
    console.log(`✅ Generato: hero-homepage.jpg (1920x1080, ottimizzato)`);
    
    console.log('\n✅ Generazione immagine hero completata!');
    console.log('\n📋 Prossimi step:');
    console.log('1. Verifica che l\'immagine sia stata generata in /img/');
    console.log('2. Aggiorna index.html per usare hero-homepage.jpg');
  } catch (err) {
    console.error(`❌ Errore generazione immagine hero:`, err.message);
  }
}

generateHeroImage().catch(console.error);

