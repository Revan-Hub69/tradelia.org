import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Tradelia — Market Intelligence Cripto',
  description: 'Capisci il rischio del mercato cripto prima di fare qualsiasi operazione. Dati ufficiali in streaming + analisi contestuale. Nessun segnale, nessuna promessa di profitto.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  )
}
