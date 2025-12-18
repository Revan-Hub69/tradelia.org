import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { InteractiveCard } from '@/components/ui/InteractiveCard'

export function ProblemSection() {
  const problems = [
    {
      icon: "🔒",
      title: "Fondi bloccati",
      description: "Limiti di prelievo o vincoli che scopri solo quando ne hai bisogno",
      color: "red"
    },
    {
      icon: "💸",
      title: "Costi inattesi", 
      description: "Commissioni nascoste che non erano chiare in fase di registrazione",
      color: "orange"
    },
    {
      icon: "⚠️",
      title: "Limiti nascosti",
      description: "Restrizioni per paese o tipo di operazione non evidenziate",
      color: "yellow"
    },
    {
      icon: "🌍",
      title: "Vincoli per paese",
      description: "Servizi non disponibili nella tua giurisdizione",
      color: "purple"
    },
    {
      icon: "🎆",
      title: "Assistenza inefficace",
      description: "Supporto lento o inesistente quando hai problemi urgenti",
      color: "blue"
    },
    {
      icon: "📝",
      title: "KYC retroattivo",
      description: "Verifiche aggiuntive richieste dopo aver già depositato",
      color: "green"
    }
  ]

  return (
    <section className="py-16 sm:py-24 relative">
      <div className="section-divider mb-16 sm:mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-slate-200 mb-4 sm:mb-6 px-4">
              Il problema non è scegliere il servizio migliore.
            </h2>
            <p className="text-xl sm:text-2xl text-gradient font-medium px-4">
              È scegliere un servizio e scoprire dopo che non era adatto a te.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {problems.map((problem, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <InteractiveCard className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 sm:p-6 h-full">
                <div className={`w-12 h-12 bg-${problem.color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-xl">{problem.icon}</span>
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">{problem.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {problem.description}
                </p>
              </InteractiveCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}