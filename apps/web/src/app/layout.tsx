import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { TradingProvider } from '../lib/contexts/TradingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tradelia - AI Applied to Markets Research',
  description: 'Advanced AI research platform for cryptocurrency trading and market analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TradingProvider>
          {children}
        </TradingProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
