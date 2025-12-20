import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/Footer'
import { SiteHeader } from '@/components/site/Header'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
