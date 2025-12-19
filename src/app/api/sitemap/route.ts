import { NextResponse } from 'next/server'

const routes = ['/', '/investimenti', '/finanza-personale', '/business', '/metodo', '/trasparenza', '/privacy', '/disclaimer']

export function GET() {
  const baseUrl = 'https://tradelia.org'
  const urls = routes
    .map((path) => `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
