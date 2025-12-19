import { SecurityIcon, WarningIcon, DocumentIcon, TransparencyIcon, ReportIcon, VerificationIcon } from '../ui/AcademicIcons'

export function ProblemSection() {
  const problems = [
    {
      icon: SecurityIcon,
      title: "Fondi bloccati",
      description: "Limiti di prelievo o vincoli che scopri solo quando ne hai bisogno"
    },
    {
      icon: WarningIcon,
      title: "Costi inattesi", 
      description: "Commissioni nascoste che non erano chiare in fase di registrazione"
    },
    {
      icon: DocumentIcon,
      title: "Limiti nascosti",
      description: "Restrizioni per paese o tipo di operazione non evidenziate"
    },
    {
      icon: TransparencyIcon,
      title: "Vincoli per paese",
      description: "Servizi non disponibili nella tua giurisdizione"
    },
    {
      icon: ReportIcon,
      title: "Assistenza inefficace",
      description: "Supporto lento o inesistente quando hai problemi urgenti"
    },
    {
      icon: VerificationIcon,
      title: "KYC retroattivo",
      description: "Verifiche aggiuntive richieste dopo aver già depositato"
    }
  ]

  return (
    <section className="py-16 sm:py-24 relative">
      <div className="section-divider mb-16 sm:mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-slate-100 mb-4 sm:mb-6 px-4">
            Il problema non è scegliere il servizio migliore.
          </h2>
          <p className="text-xl sm:text-2xl text-gradient font-medium px-4">
            È scegliere un servizio e scoprire dopo che non era adatto a te.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon
            return (
              <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 sm:p-6 h-full hover:bg-slate-800/40 transition-colors duration-200">
                <div className="w-12 h-12 bg-slate-700/30 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="text-slate-400" size={20} />
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">{problem.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {problem.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
