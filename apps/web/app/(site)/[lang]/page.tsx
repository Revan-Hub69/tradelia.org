import { HeroSection } from '@/components/sections/HeroSection'
import { IndicatorsSection } from '@/components/sections/IndicatorsSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <IndicatorsSection />
      
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tradelia</h3>
            <p className="text-slate-400">Analisi quantitativa crypto per investitori istituzionali</p>
          </div>
          
          <div className="border-t border-slate-700 pt-6 text-sm text-slate-400">
            <p className="mb-2">
              <strong>Disclaimer Importante:</strong> Tradelia fornisce esclusivamente analisi quantitative 
              e contesto di mercato basato su metodologie accademiche. Non offriamo consulenza finanziaria, 
              raccomandazioni di investimento o segnali di trading.
            </p>
            <p>
              © 2025 Tradelia. Tutti i diritti riservati. | 
              <a href="/privacy" className="hover:text-white ml-1">Privacy Policy</a> | 
              <a href="/terms" className="hover:text-white ml-1">Termini di Servizio</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
