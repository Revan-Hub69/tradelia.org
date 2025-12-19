import { whyNotSingleBrokerCopy } from '@/content/copy'
import { Section } from '@/components/ui/Section'

export function WhyNotSingleBrokerSection() {
  return (
    <Section
      id="perche-non-un-solo-broker"
      eyebrow="Compatibilità"
      title={whyNotSingleBrokerCopy.title}
      description={whyNotSingleBrokerCopy.text}
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        Tradelia evidenzia la compatibilità per dominio e segnala quando una copertura
        completa non è possibile o non è valutabile.
      </div>
    </Section>
  )
}
