import { HeroSection } from '@/components/sections/HeroSection'
import { WhatSection } from '@/components/sections/WhatSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { MethodSection } from '@/components/sections/MethodSection'
import { WhyNotOneSection } from '@/components/sections/WhyNotOneSection'
import { WhatNotSection } from '@/components/sections/WhatNotSection'
import { TransparencySection } from '@/components/sections/TransparencySection'
import { FAQSection } from '@/components/sections/FAQSection'
import { Footer } from '@/components/sections/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <WhatSection />
      <HowItWorksSection />
      <MethodSection />
      <WhyNotOneSection />
      <WhatNotSection />
      <TransparencySection />
      <FAQSection />
      <Footer />
    </main>
  )
}