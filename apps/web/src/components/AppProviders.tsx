'use client'

import { TradingProvider } from '../lib/contexts/TradingContext'
import { WebSocketProvider } from '../lib/contexts/WebSocketContext'

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TradingProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </TradingProvider>
  )
}
