import { faqCopy } from '@/content/copy'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

export function FaqSection() {
  return (
    <Section id="faq" eyebrow="FAQ" title={faqCopy.title}>
      <div className="grid gap-4 md:grid-cols-3">
        {faqCopy.items.map((item) => (
          <Card key={item.question} className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900">{item.question}</h3>
            <p className="text-sm text-slate-600">{item.answer}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
