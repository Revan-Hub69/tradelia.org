import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SolutionSection } from '@/components/sections/SolutionSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { ToolsSection } from '@/components/sections/ToolsSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { TrustSection } from '@/components/sections/TrustSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ToolsSection />
      <PricingSection />
      <TrustSection />
      
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Guarda il mercato come lo vedono i professionisti del rischio.
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg">
            Accedi gratis
          </button>
          
          <div className="mt-12 pt-8 border-t border-slate-700 text-sm text-slate-400">
            <p className="mb-4 font-medium text-slate-300">
              Tradelia ti dice quando il mercato è difficile da navigare.<br/>
              La decisione resta tua.
            </p>
            <p>
              © 2025 Tradelia. Educational only · High-risk market · No financial advice
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}