import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 0

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    sitemap: 'https://tradelia.org/sitemap.xml'
  }
}
