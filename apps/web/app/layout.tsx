import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tradelia — Test',
  description: 'Test page',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
