'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Bell, Users, Shield, Zap, Gamepad2 } from 'lucide-react';
import { useOsloTranslations } from '@/lib/i18n/oslo/use-oslo-translations';

export function OsloHomePage() {
  const { locale, t } = useOsloTranslations();
  
  // Fallback per homepage (per ora solo IT/EN, poi aggiungiamo altre lingue)
  const isEnglish = locale === 'en';
  
  const hero = {
    title: 'Oslo',
    headline: isEnglish 
      ? 'Never miss an alliance event again'
      : 'Non perdere più un evento della tua alleanza',
    subheadline: isEnglish
      ? 'Companion app for alliance games. Manage events, receive push notifications and coordinate your alliance easily and quickly.'
      : 'App companion per giochi di alleanze. Gestisci eventi, ricevi notifiche push e coordina la tua alleanza in modo semplice e veloce.',
    ctaPrimary: isEnglish ? 'Get Started' : 'Inizia Ora',
    ctaSecondary: isEnglish ? 'Learn More' : 'Scopri di Più',
  };
  
  const features = {
    title: isEnglish 
      ? 'Everything you need for your alliance'
      : 'Tutto quello che serve per la tua alleanza',
    eventManagement: {
      title: isEnglish ? 'Event Management' : 'Gestione Eventi',
      description: isEnglish
        ? 'Create and organize weekly and daily events. Set recurrences and coordinate your alliance.'
        : 'Crea e organizza eventi settimanali e giornalieri. Imposta ricorrenze e coordina la tua alleanza.',
    },
    pushNotifications: {
      title: isEnglish ? 'Push Notifications' : 'Notifiche Push',
      description: isEnglish
        ? 'Daily summary and notifications 40 minutes before each event. You\'ll never miss a raid or war.'
        : 'Riepilogo giornaliero e notifiche 40 minuti prima di ogni evento. Non perderai mai un raid o una guerra.',
    },
    coordination: {
      title: isEnglish ? 'Coordination' : 'Coordinamento',
      description: isEnglish
        ? 'Communicate with your alliance, manage members and keep everyone synced on events.'
        : 'Comunica con la tua alleanza, gestisci membri e mantieni tutti sincronizzati sugli eventi.',
    },
    multilingual: {
      title: isEnglish ? 'Multilingual' : 'Multilingua',
      description: isEnglish
        ? 'Support for 9 languages with auto-translation. Perfect for international alliances.'
        : 'Supporto per 9 lingue con autotraduzione. Perfetto per alleanze internazionali.',
    },
    instantPush: {
      title: isEnglish ? 'Instant Push' : 'Push Immediato',
      description: isEnglish
        ? 'Send instant notifications to all alliance members with one click.'
        : 'Invia notifiche istantanee a tutti i membri dell\'alleanza con un solo click.',
    },
    gamingFirst: {
      title: isEnglish ? 'Gaming-First' : 'Gaming-First',
      description: isEnglish
        ? 'Design and copy optimized for gamers. Intuitive interface and standard gaming terminology.'
        : 'Design e copy ottimizzati per gamer. Interfaccia intuitiva e terminologia gaming standard.',
    },
  };
  
  const cta = {
    title: isEnglish 
      ? 'Ready to coordinate your alliance?'
      : 'Pronto a coordinare la tua alleanza?',
    description: isEnglish
      ? 'Join Oslo and never miss an important event again.'
      : 'Unisciti a Oslo e non perdere mai più un evento importante.',
    button: isEnglish ? 'Start Free' : 'Inizia Gratis',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base to-bg-surface">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo/App Name */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gamepad2 className="w-12 h-12 text-accent" />
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary">
              {hero.title}
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            {hero.headline}
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {hero.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/oslo/login">{hero.ctaPrimary}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/oslo/features">{hero.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-text-primary mb-12">
          {features.title}
        </h3>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card variant="default" hover className="p-6">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.eventManagement.title}
            </h4>
            <p className="text-text-secondary">
              {features.eventManagement.description}
            </p>
          </Card>

          {/* Feature 2 */}
          <Card variant="default" hover className="p-6">
            <Bell className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.pushNotifications.title}
            </h4>
            <p className="text-text-secondary">
              {features.pushNotifications.description}
            </p>
          </Card>

          {/* Feature 3 */}
          <Card variant="default" hover className="p-6">
            <Users className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.coordination.title}
            </h4>
            <p className="text-text-secondary">
              {features.coordination.description}
            </p>
          </Card>

          {/* Feature 4 */}
          <Card variant="default" hover className="p-6">
            <Shield className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.multilingual.title}
            </h4>
            <p className="text-text-secondary">
              {features.multilingual.description}
            </p>
          </Card>

          {/* Feature 5 */}
          <Card variant="default" hover className="p-6">
            <Zap className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.instantPush.title}
            </h4>
            <p className="text-text-secondary">
              {features.instantPush.description}
            </p>
          </Card>

          {/* Feature 6 */}
          <Card variant="default" hover className="p-6">
            <Gamepad2 className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              {features.gamingFirst.title}
            </h4>
            <p className="text-text-secondary">
              {features.gamingFirst.description}
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card variant="gradient" className="p-12 text-center max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-text-primary mb-4">
            {cta.title}
          </h3>
          <p className="text-xl text-text-secondary mb-8">
            {cta.description}
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/oslo/login">{cta.button}</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}

