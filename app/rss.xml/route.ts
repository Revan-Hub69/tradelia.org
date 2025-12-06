import { NextResponse } from 'next/server';

/**
 * RSS Feed Generator
 * Best Practice 2024-2025: RSS feed per migliorare indicizzazione e syndication
 * System simplified: Italian only
 */
export async function GET() {
  const baseUrl = 'https://tradelia.org';
  const currentDate = new Date().toISOString();

  // RSS Feed XML
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tradelia AI · Formazione Finanziaria Gratuita</title>
    <link>${baseUrl}</link>
    <description>Formazione finanziaria gratuita basata su framework AI proprietari verificabili</description>
    <language>it-IT</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logos/tradelia-logo.svg</url>
      <title>Tradelia AI</title>
      <link>${baseUrl}</link>
    </image>
    
    <!-- Homepage -->
    <item>
      <title>Tradelia AI · Formazione Finanziaria Gratuita</title>
      <link>${baseUrl}</link>
      <description>Formazione finanziaria gratuita basata su framework AI proprietari verificabili</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}</guid>
    </item>
    
    <!-- Pricing -->
    <item>
      <title>Pricing · Tradelia</title>
      <link>${baseUrl}/pricing</link>
      <description>Scegli il piano perfetto per le tue esigenze</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/pricing</guid>
    </item>
    
    <!-- Glossary -->
    <item>
      <title>Glossario · Tradelia</title>
      <link>${baseUrl}/glossary</link>
      <description>Glossario completo dei termini finanziari</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/glossary</guid>
    </item>
    
    <!-- Reviews -->
    <item>
      <title>Recensioni · Tradelia</title>
      <link>${baseUrl}/reviews</link>
      <description>Recensioni verificate dei nostri utenti</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/reviews</guid>
    </item>
    
    <!-- FAQ -->
    <item>
      <title>FAQ · Tradelia</title>
      <link>${baseUrl}/faq</link>
      <description>Domande frequenti su Tradelia</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/faq</guid>
    </item>
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
