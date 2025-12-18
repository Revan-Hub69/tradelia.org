import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { LivePreview } from '@/components/sections/LivePreview'
import { MethodSection } from '@/components/sections/MethodSection'
import { CTASection } from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSection />
      <LivePreview />
      <MethodSection />
      <CTASection />
      
      {/* Compliance Footer */}
      <footer className="py-12 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-sm text-slate-500 space-y-2">
              <p className="font-medium">Educational only • High-risk market • No financial advice</p>
              <p>AI explains metrics; user decides actions</p>
            </div>
          </div>
          
          <div className="text-xs text-slate-600 text-center space-y-1">
            <p>No signals. No promises. Just context with uncertainty.</p>
            <p>© 2025 Tradelia • Evidence-based crypto analysis</p>
          </div>
        </div>
      </footer>
    </main>
  )
}