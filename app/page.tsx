import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SolutionSection } from '@/components/sections/SolutionSection'
import { MetricsDashboard } from '@/components/sections/MetricsDashboard'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <MetricsDashboard />
      
      {/* Footer minimale */}
      <footer className="py-16 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-300 mb-2">Tradelia</h3>
            <p className="text-slate-500">Market Intelligence per investitori consapevoli</p>
          </div>
          
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Tradelia fornisce esclusivamente analisi quantitative 
              e contesto di mercato. Non offriamo consulenza finanziaria o raccomandazioni di investimento.
            </p>
            <p className="pt-4 border-t border-slate-800/30">
              © 2025 Tradelia • Educational only • High-risk market
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}