import { Section } from '@/components/ui/Section'
import { AssessmentWizard } from '@/components/forms/AssessmentWizard'

export function FormSection() {
  return (
    <Section
      id="analisi"
      eyebrow="Analizza la tua operatività"
      title="Configura il tuo profilo operativo"
      description="Il wizard crea un assessment e genera un report per ogni dominio selezionato."
      className="bg-slate-50"
    >
      <AssessmentWizard />
    </Section>
  )
}
