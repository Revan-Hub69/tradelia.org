/**
 * Logo Loader
 * Carica logo Tradelia per uso in PDF
 * Riferimento: Brand Guidelines
 */

import fs from 'fs';
import path from 'path';

/**
 * Carica logo Tradelia come base64
 */
export async function loadTradeliaLogo(): Promise<string> {
  try {
    // Path relativo al progetto
    const logoPath = path.join(process.cwd(), 'public', 'logos', 'tradelia-logo.svg');
    
    if (fs.existsSync(logoPath)) {
      const logoContent = fs.readFileSync(logoPath, 'utf-8');
      // Converti SVG a base64
      const base64 = Buffer.from(logoContent).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    }

    // Fallback: logo semplificato come SVG inline
    return generateTradeliaLogoSVG();
  } catch (error) {
    console.error('Error loading Tradelia logo:', error);
    return generateTradeliaLogoSVG();
  }
}

/**
 * Genera logo Tradelia semplificato come SVG base64
 */
function generateTradeliaLogoSVG(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60" width="260" height="60">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <text x="130" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="url(#logoGradient)" text-anchor="middle">
        TRADELIA
      </text>
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

