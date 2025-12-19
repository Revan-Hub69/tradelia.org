import { HeroSection } from '@/components/sections/HeroSection'
import { WhatIsSection } from '@/components/sections/WhatIsSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { MethodSection } from '@/components/sections/MethodSection'
import { WhyNotSingleBrokerSection } from '@/components/sections/WhyNotSingleBrokerSection'
import { WhatTradeliaDoesNotDoSection } from '@/components/sections/WhatTradeliaDoesNotDoSection'
import { TransparencySection } from '@/components/sections/TransparencySection'
import { FormSection } from '@/components/sections/FormSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { FooterSection } from '@/components/sections/FooterSection'

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900">
      <HeroSection />
      <WhatIsSection />
      <HowItWorksSection />
      <MethodSection />
      <WhyNotSingleBrokerSection />
      <WhatTradeliaDoesNotDoSection />
      <TransparencySection />
      <FormSection />
      <FaqSection />
      <FooterSection />
    </main>
  )
}
