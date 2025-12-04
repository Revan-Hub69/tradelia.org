import { NextResponse } from 'next/server';
import { getDictionary } from '@/lib/i18n/dictionaries';

/**
 * RSS Feed Generator
 * Best Practice 2024-2025: RSS feed per migliorare indicizzazione e syndication
 */
export async function GET() {
  const baseUrl = 'https://tradelia.org';
  const dict = await getDictionary('it');
  const currentDate = new Date().toISOString();

  // RSS Feed XML
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${dict.seo.title || 'Tradelia AI · Formazione Finanziaria Gratuita'}</title>
    <link>${baseUrl}</link>
    <description>${dict.seo.description || 'Formazione finanziaria gratuita basata su framework AI proprietari verificabili'}</description>
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
      <title>${dict.seo.title || 'Tradelia AI · Formazione Finanziaria Gratuita'}</title>
      <link>${baseUrl}</link>
      <description>${dict.seo.description || 'Formazione finanziaria gratuita basata su framework AI proprietari verificabili'}</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}</guid>
    </item>
    
    <!-- Pricing -->
    <item>
      <title>${dict.seo.pages?.pricing?.title || 'Pricing · Tradelia'}</title>
      <link>${baseUrl}/pricing</link>
      <description>${dict.seo.pages?.pricing?.description || 'Scegli il piano perfetto per le tue esigenze'}</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/pricing</guid>
    </item>
    
    <!-- Glossary -->
    <item>
      <title>${dict.seo.pages?.glossary?.title || 'Glossario · Tradelia'}</title>
      <link>${baseUrl}/glossary</link>
      <description>${dict.seo.pages?.glossary?.description || 'Glossario completo dei termini finanziari'}</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/glossary</guid>
    </item>
    
    <!-- Reviews -->
    <item>
      <title>${dict.seo.pages?.reviews?.title || 'Recensioni · Tradelia'}</title>
      <link>${baseUrl}/reviews</link>
      <description>${dict.seo.pages?.reviews?.description || 'Recensioni verificate dei nostri utenti'}</description>
      <pubDate>${currentDate}</pubDate>
      <guid isPermaLink="true">${baseUrl}/reviews</guid>
    </item>
    
    <!-- FAQ -->
    <item>
      <title>${dict.seo.pages?.faq?.title || 'FAQ · Tradelia'}</title>
      <link>${baseUrl}/faq</link>
      <description>${dict.seo.pages?.faq?.description || 'Domande frequenti su Tradelia'}</description>
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
