import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tradelia - Sistema indipendente di verifica servizi finanziari',
    short_name: 'Tradelia',
    description: 'Sistema indipendente che ti evita di scegliere il servizio sbagliato per tenere, muovere o usare i tuoi soldi',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    categories: ['finance', 'business', 'utilities'],
    lang: 'it',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png', 
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}