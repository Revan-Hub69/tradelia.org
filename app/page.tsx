import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SolutionSection } from '@/components/sections/SolutionSection'
import { ScopeSection } from '@/components/sections/ScopeSection'
import { DifferenceSection } from '@/components/sections/DifferenceSection'
import { TrustSection } from '@/components/sections/TrustSection'
import { WhenSection } from '@/components/sections/WhenSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ScopeSection />
      <DifferenceSection />
      <TrustSection />
      <WhenSection />
      
      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-6">
            <p className="text-lg text-slate-300 mb-2">
              Tradelia non ti dice cosa fare con i soldi.
            </p>
            <p className="text-lg text-slate-400">
              Ti aiuta a non sbagliare servizio mentre li usi.
            </p>
          </div>
          
          <div className="text-xs text-slate-600 space-y-1">
            <p>Sistema indipendente • Nessuna consulenza finanziaria</p>
            <p>© 2025 Tradelia • Verifica prima di scegliere</p>
          </div>
        </div>
      </footer>
    </main>
  )
}