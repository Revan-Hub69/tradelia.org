import { Metadata } from 'next';
import { OsloHomePage } from '@/components/oslo/OsloHomePage';

export const metadata: Metadata = {
  title: 'Oslo - Non perdere più un evento della tua alleanza',
  description: 'App companion per giochi di alleanze. Gestisci eventi, notifiche push e coordina la tua alleanza.',
};

export default function OsloPage() {
  return <OsloHomePage />;
}
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base to-bg-surface">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo/App Name */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gamepad2 className="w-12 h-12 text-accent" />
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary">
              Oslo
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            Non perdere più un evento della tua alleanza
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            App companion per giochi di alleanze. Gestisci eventi, ricevi notifiche push e coordina la tua alleanza in modo semplice e veloce.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/oslo/login">Inizia Ora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/oslo/features">Scopri di Più</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-text-primary mb-12">
          Tutto quello che serve per la tua alleanza
        </h3>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card variant="default" hover className="p-6">
            <Calendar className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Gestione Eventi
            </h4>
            <p className="text-text-secondary">
              Crea e organizza eventi settimanali e giornalieri. Imposta ricorrenze e coordina la tua alleanza.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card variant="default" hover className="p-6">
            <Bell className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Notifiche Push
            </h4>
            <p className="text-text-secondary">
              Riepilogo giornaliero e notifiche 40 minuti prima di ogni evento. Non perderai mai un raid o una guerra.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card variant="default" hover className="p-6">
            <Users className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Coordinamento
            </h4>
            <p className="text-text-secondary">
              Comunica con la tua alleanza, gestisci membri e mantieni tutti sincronizzati sugli eventi.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card variant="default" hover className="p-6">
            <Shield className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Multilingua
            </h4>
            <p className="text-text-secondary">
              Supporto per 9 lingue con autotraduzione. Perfetto per alleanze internazionali.
            </p>
          </Card>

          {/* Feature 5 */}
          <Card variant="default" hover className="p-6">
            <Zap className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Push Immediato
            </h4>
            <p className="text-text-secondary">
              Invia notifiche istantanee a tutti i membri dell'alleanza con un solo click.
            </p>
          </Card>

          {/* Feature 6 */}
          <Card variant="default" hover className="p-6">
            <Gamepad2 className="w-12 h-12 text-accent mb-4" />
            <h4 className="text-xl font-semibold text-text-primary mb-2">
              Gaming-First
            </h4>
            <p className="text-text-secondary">
              Design e copy ottimizzati per gamer. Interfaccia intuitiva e terminologia gaming standard.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card variant="gradient" className="p-12 text-center max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-text-primary mb-4">
            Pronto a coordinare la tua alleanza?
          </h3>
          <p className="text-xl text-text-secondary mb-8">
            Unisciti a Oslo e non perdere mai più un evento importante.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/oslo/login">Inizia Gratis</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}

