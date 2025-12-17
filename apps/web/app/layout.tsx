import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tradelia — Crypto Market Context',
  description: 'Crypto market risk indicators and context. No trading signals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
