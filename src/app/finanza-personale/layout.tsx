import type { ReactNode } from 'react'

import { FinanzaPersonaleFooter } from '@/components/finanza-personale/Footer'
import { FinanzaPersonaleHeader } from '@/components/finanza-personale/Header'

export default function FinanzaPersonaleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <FinanzaPersonaleHeader />
      <main>{children}</main>
      <FinanzaPersonaleFooter />
    </div>
  )
}
