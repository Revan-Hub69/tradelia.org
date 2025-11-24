// Script per generare icone PWA da SVG
// Richiede: npm install sharp
// Eseguire con: node scripts/generate-pwa-icons.js

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "icons");
const sizes = [192, 512];

async function generateIcons() {
  console.log("🎨 Generazione icone PWA...\n");

  // Verifica che la directory icons esista
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}.png`);

    if (!fs.existsSync(svgPath)) {
      console.warn(`⚠️  SVG non trovato: ${svgPath}`);
      continue;
    }

    try {
      await sharp(svgPath).resize(size, size).png().toFile(pngPath);

      console.log(`✅ Generato: icon-${size}.png (${size}x${size})`);
    } catch (err) {
      console.error(`❌ Errore generazione icon-${size}.png:`, err.message);
    }
  }

  console.log("\n✅ Generazione icone completata!");
  console.log("\n📋 Prossimi step:");
  console.log("1. Verifica che le icone siano state generate in /icons/");
  console.log("2. Testa l'installazione PWA nella dashboard");
}

generateIcons().catch(console.error);
