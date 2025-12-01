/**
 * Image Converter Utilities
 * Converte chart/grafici in immagini per PDF
 * Riferimento: Few (2006) - Chart Quality in Reports
 */

/**
 * Converte SVG a base64 per uso in PDF
 */
export function svgToBase64(svgString: string): string {
  // Rimuovi eventuali namespace non supportati
  const cleanedSvg = svgString
    .replace(/xmlns:xlink="[^"]*"/g, '')
    .replace(/xlink:href/g, 'href');

  const base64 = Buffer.from(cleanedSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Converte URL immagine a base64
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = blob.type || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}

/**
 * Genera placeholder per chart mancante
 */
export function generateChartPlaceholder(
  title: string,
  width: number = 400,
  height: number = 250
): string {
  // SVG placeholder semplice
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="14">
        ${title}
      </text>
      <text x="${width / 2}" y="${height / 2 + 20}" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="10">
        Grafico non disponibile
      </text>
    </svg>
  `;
  return svgToBase64(svg);
}

