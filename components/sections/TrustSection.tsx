import { IndependenceIcon, NeutralityIcon, TransparencyIcon, DocumentIcon, AnalysisIcon, VerificationIcon, ReportIcon } from '@/components/ui/AcademicIcons'

export function TrustSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Fiducia & Metodo
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center">
              <IndependenceIcon className="text-slate-300" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Indipendenza</h3>
            <p className="text-slate-400 leading-relaxed">
              Nessun servizio può influenzare le nostre analisi. Verifichiamo solo documentazione ufficiale.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center">
              <NeutralityIcon className="text-slate-300" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Neutralità</h3>
            <p className="text-slate-400 leading-relaxed">
              Non promuoviamo servizi specifici. Mostriamo fatti oggettivi per farti decidere in autonomia.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center">
              <TransparencyIcon className="text-slate-300" size={24} />
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Trasparenza</h3>
            <p className="text-slate-400 leading-relaxed">
              Metodologia aperta. Fonti verificabili. Quando presenti, i link non influenzano l'analisi.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
          <h3 className="text-2xl font-medium text-slate-200 mb-6 text-center">
            Come funziona l'analisi
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <DocumentIcon className="text-slate-300" size={20} />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">1. Raccolta</h4>
              <p className="text-sm text-slate-400">Documentazione ufficiale e termini di servizio</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <AnalysisIcon className="text-slate-300" size={20} />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">2. Analisi</h4>
              <p className="text-sm text-slate-400">Analisi automatizzata di costi, limiti e vincoli</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <VerificationIcon className="text-slate-300" size={20} />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">3. Verifica</h4>
              <p className="text-sm text-slate-400">Controllo incrociato e validazione delle informazioni</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <ReportIcon className="text-slate-300" size={20} />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">4. Report</h4>
              <p className="text-sm text-slate-400">Sintesi chiara di vantaggi, svantaggi e limitazioni</p>
            </div>
          </div>

          {/* Academic Foundation */}
          <div className="border-t border-slate-800/50 pt-6">
            <h4 className="text-lg font-medium text-slate-200 mb-4 text-center">Base Metodologica</h4>
            <div className="text-sm text-slate-400 space-y-2">
              <p className="text-center">
                <strong className="text-slate-300">Analisi documentale:</strong> Basata su principi di Document Analysis (Bowen, 2009)
              </p>
              <p className="text-center">
                <strong className="text-slate-300">Verifica incrociata:</strong> Cross-validation methodology (Creswell & Plano Clark, 2017)
              </p>
              <p className="text-center">
                <strong className="text-slate-300">Trasparenza:</strong> Open methodology principles (Nosek et al., 2015)
              </p>
            </div>
          </div>
        </div>

        {/* Legal Compliance */}
        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <h4 className="text-lg font-medium text-amber-400 mb-3 text-center">Disclaimer Legale</h4>
          <div className="text-sm text-amber-400/80 space-y-2">
            <p className="text-center">
              <strong>Tradelia non fornisce consulenza finanziaria.</strong> Le informazioni sono fornite esclusivamente a scopo educativo e di verifica.
            </p>
            <p className="text-center">
              L'utente è responsabile delle proprie decisioni finanziarie. Consultare sempre un consulente qualificato.
            </p>
            <p className="text-center text-xs">
              Conforme a: MiFID II (2014/65/EU), GDPR (2016/679), Direttiva PSD2 (2015/2366)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}