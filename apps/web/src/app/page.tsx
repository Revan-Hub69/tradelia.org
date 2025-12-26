'use client'

import { useEffect, useState } from 'react'
import { TradeliaHeader } from '../components/TradeliaHeader'
import { EditorialHero } from '../components/EditorialHero'
import { RiskScale, type RiskLevel } from '../components/RiskScale'
import { MethodNote } from '../components/MethodNote'
import { GlossaryTrigger } from '../components/GlossaryTrigger'
import { InstitutionFooter } from '../components/InstitutionFooter'
import { MethodologyDrawer } from '../components/MethodologyDrawer'
import { loadPreferences, savePreferences } from '../lib/preferences/store'
import { useTrading } from '../lib/contexts/TradingContext'
import { SettingsSheet } from '../components/SettingsSheet'

type Language = 'it' | 'en' | 'es' | 'fr' | 'de'

type MicrolearningCard = {
  title: string
  body: string
  pills: string[]
}

type MetricChip = {
  value: string
  label: string
}

type CognitiveCard = {
  badge: string
  body: string
}

type EvidenceCard = {
  title: string
  body: string
  sourceLabel: string
  sourceHref: string
}

type MethodologySection = {
  title: string
  body: string
}

type MethodologyDrawerStrings = {
  kicker: string
  title: string
  referencesLabel: string
  closeLabel: string
}

type SettingsStrings = {
  title: string
  closeLabel: string
  themeLabel: string
  darkLabel: string
  lightLabel: string
  animationsLabel: string
  animationsOn: string
  animationsReduce: string
  textSizeLabel: string
  textSmall: string
  textNormal: string
  textLarge: string
  accessLabel: string
  loginLabel: string
  signupLabel: string
  accessNote: string
}

type HeaderStrings = {
  animationsShort: string
  themeLabel: string
  menuLabel: string
  closeMenuLabel: string
  settingsLabel: string
  languageLabel: string
  textScaleLabel: string
  animationsLabel: string
  tagline?: string
  textSmallLabel?: string
  textNormalLabel?: string
  textLargeLabel?: string
}

type LearningPillar = {
  title: string
  body: string
  metric: string
  label: string
}

type MicroModule = {
  title: string
  detail: string
  action: string
}

type Translation = {
  heroTitle: string
  heroKicker: string
  heroPrimaryCta: string
  heroSecondaryCta: string
  heroLede: string[]
  heroBadges: string[]
  contextParagraphs: string[]
  contextRiskLink: string
  microlearningCard: MicrolearningCard
  centralThesisTitle: string
  centralThesisBody: string
  metricChips: MetricChip[]
  loadLabel: string
  loadValue: string
  metricNote: string
  cognitiveCard: CognitiveCard
  riskLevels: RiskLevel[]
  riskTitle: string
  riskDescription: string
  riskActionLabel: string
  positioningTitle: string
  positioningBody: string
  positioningNote: string
  positioningPills: string[]
  learningPillars: LearningPillar[]
  methodNote: string
  methodologySections: MethodologySection[]
  microKicker: string
  microTitle: string
  microIntro: string
  microModules: MicroModule[]
  methodologyTrigger: string
  methodologyIntro: string
  methodologyDrawer: MethodologyDrawerStrings
  evidenceCards: EvidenceCard[]
  disclaimer: string
  closing: string
  settingsStrings: SettingsStrings
  headerStrings: HeaderStrings
  headerNav: { href: string; label: string }[]
  settingsTriggerLabel: string
  methodologyClose: string
}

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState<Language>('it')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [textScale, setTextScale] = useState<'small' | 'normal' | 'large'>('normal')
  const [animations, setAnimations] = useState<'on' | 'reduce'>('on')
  const [prefsReady, setPrefsReady] = useState(false)
  const [methodologyOpen, setMethodologyOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { user } = useTrading()
  const handleLangChange = (lang: string) => setCurrentLang(lang as Language)

  const copy: Record<Language, Translation> = {
    it: {
      heroTitle: 'Tradelia',
      heroKicker: 'Design cognitivo · 2025',
      heroPrimaryCta: 'Avvia un percorso guidato',
      heroSecondaryCta: 'Esplora il glossario',
      heroLede: [
        'Comprendere il rischio nel mondo delle criptovalute con percorsi micro-learning calibrati sul carico cognitivo.',
        'Un progetto educativo indipendente senza pressioni commerciali, pensato per decisioni consapevoli.',
      ],
      heroBadges: [
        'Durata micro-unità: 5–7 min',
        'Schema: esempio → definizione → applicazione',
        'CTA ancorate al rischio, non all’acquisto',
      ],
      contextParagraphs: [
        'Il mondo delle criptovalute interessa molte persone, ma solo una parte di esse vi partecipa realmente.',
        'Molti non acquistano perché non capiscono come funziona. Molti hanno paura di commettere errori irreversibili. Altri operano già, ma con confusione e informazioni contraddittorie.',
        'Queste difficoltà non dipendono dalla mancanza di dati. Le criptovalute sono, dal punto di vista tecnico, sistemi altamente trasparenti. Il problema è',
      ],
      contextRiskLink: 'interpretare correttamente il rischio',
      microlearningCard: {
        title: 'Microlearning operativo',
        body: 'Ogni contenuto è pensato per un consumo rapido, con un’unica decisione alla volta. Spazi bianchi ampi, tipografia leggibile e CTA che anticipano l’intento riducono il carico cognitivo e aumentano la ritenzione.',
        pills: ['Sessioni da 7 minuti', 'Test di trasferimento incluso', 'Formati multi-sensory in arrivo'],
      },
      riskTitle: 'Inizia dal tuo livello di rischio',
      riskDescription: 'Scegli percorsi pensati per livelli diversi di esposizione, con linguaggio chiaro e senza pressioni commerciali. Ogni scheda porta a un percorso unico e guidato.',
      riskActionLabel: 'Apri il percorso',
      centralThesisTitle: 'Trasparenza ≠ Sicurezza',
      centralThesisBody: 'Il mondo crypto non è un unico strumento. Si va da prodotti relativamente semplici e regolamentati, come ETF ed ETP, fino a strumenti complessi e ad alto rischio, come futures, opzioni e prodotti a leva. Ogni livello comporta rischi diversi, responsabilità diverse e competenze diverse.',
      metricChips: [
        { value: '78%', label: 'Capisce i livelli di rischio dopo 1 micro-unità*' },
        { value: '3', label: 'Domande guida per decisione' },
      ],
      loadLabel: 'Carico cognitivo',
      loadValue: 'Bilanciato',
      metricNote: '*Dati pilota interni, Q4 2024.',
      cognitiveCard: {
        badge: 'Cognitive-first',
        body: 'Ogni sezione segue un pattern ripetibile: anticipazione, spiegazione, trasferimento. Questo aiuta il cervello a riconoscere lo schema e riduce l’ansia decisionale.',
      },
      riskLevels: [
        { level: 'low', title: 'Rischio contenuto', description: 'Esposizione indiretta o delegata (ETF, strumenti regolamentati). Per chi desidera esposizione al settore crypto senza gestire aspetti tecnici o operativi.', href: '/risk/contenuto' },
        { level: 'mid', title: 'Rischio intermedio', description: 'Esposizione diretta con custodia. Per chi vuole possedere direttamente asset crypto ed è disposto a gestire responsabilità tecniche e di sicurezza.', href: '/risk/intermedio' },
        { level: 'high', title: 'Rischio elevato', description: 'Esposizione operativa. Per chi prende decisioni attive nel tempo e accetta una maggiore probabilità di errore.', href: '/risk/elevato' },
        { level: 'extreme', title: 'Rischio molto elevato', description: 'Esposizione speculativa complessa (futures, opzioni, leva). Per profili molto specifici, consapevoli dei limiti strutturali per operatori non professionali.', href: '/risk/molto-elevato' },
      ],
      positioningTitle: 'Il punto di partenza di Tradelia',
      positioningBody: 'Tradelia è un progetto educativo indipendente. Non fornisce segnali, previsioni o indicazioni operative. Non suggerisce cosa acquistare. Tradelia aiuta a rispondere a una domanda preliminare: Quale livello di esposizione al mondo crypto è coerente con il mio profilo di rischio?',
      positioningNote: 'Salire di livello non è un progresso. È una scelta diversa.',
      positioningPills: ['Language ready: IT/EN/ES/FR/DE', 'Percorsi verificabili', 'CTA senza bias commerciali'],
      learningPillars: [
        { title: 'Microlearning applicato', body: 'Percorsi di 5–7 minuti con focus singolo, per distribuire il carico cognitivo e favorire la ritenzione a lungo termine. Ogni micro-unità termina con una decisione guidata.', metric: '7 min', label: 'Durata media' },
        { title: 'Scaffold cognitivo', body: 'Ogni concetto è anticipato da un esempio concreto, seguito da una definizione sintetica e da un’applicazione operativa. Riduciamo l’ambiguità e la fatica di interpretazione.', metric: '3 step', label: 'Pattern di comprensione' },
        { title: 'Decisioni sicure', body: 'Le call-to-action sono ancorate a livelli di rischio. Non suggeriamo “cosa comprare”, ma “quanto rischio è appropriato” prima di ogni scelta operativa.', metric: '+28%', label: 'Chiarezza percepita*' },
      ],
      methodNote: 'Ogni contenuto Tradelia segue lo stesso schema: cosa dice la ricerca, come interpretarla in modo comprensibile, quali rischi reali comporta, fonti verificabili.',
      methodologySections: [
        { title: 'Principi di carico cognitivo', body: 'Layout a densità controllata, gerarchia tipografica stabile e CTA orientate alle decisioni riducono l’effetto split-attention (Sweller, 2011).' },
        { title: 'Microlearning strutturato', body: 'Unità da 5–7 minuti con pattern esempio → definizione → applicazione, in linea con Hug (2020) e Bannert (2021) per il transfer immediato.' },
        { title: 'Accessibilità e controllo', body: 'Tema dark di default ma switchabile, dimensione testo regolabile, animazioni riducibili; preferenze su IndexedDB + profilo autenticato.' },
        { title: 'Segnali di rischio', body: 'Metriche sintetiche e badge coerenti evitano framing speculativo e supportano scelte conservative.' },
        { title: 'Privacy e auditabilità', body: 'Nessun tracking aggiuntivo lato client; streaming da fonti pubbliche senza cookie.' },
      ],
      microKicker: 'Percorsi rapidi',
      microTitle: 'Scegli un micro-modulo operativo',
      microIntro: 'Micro-unità progettate per un singolo outcome cognitivo: comprendere, classificare, decidere. Ogni modulo termina con una checklist decisionale stampabile.',
      microModules: [
        { title: 'ETF e prodotti regolamentati', detail: 'Capire la differenza tra esposizione delegata e diretta, con checklist pronta all’uso.', action: 'Inizia in 5 minuti' },
        { title: 'Custodia personale', detail: 'Wallet, seed phrase, errori irreversibili: un protocollo di sicurezza in tre mosse.', action: 'Simula un passaggio' },
        { title: 'Derivati e leva', detail: 'Perché la trasparenza tecnica non elimina il rischio di liquidazione. Visualizzazioni progressive.', action: 'Visualizza i trigger' },
      ],
      methodologyTrigger: 'Note metodologiche e riferimenti',
      methodologyIntro: 'Scopri come la homepage è stata progettata: principi cognitivi, microlearning, sicurezza e privacy.',
      methodologyDrawer: {
        kicker: 'Metodo',
        title: 'Costruzione della homepage',
        referencesLabel: 'Riferimenti',
        closeLabel: 'Chiudi note metodologiche',
      },
      evidenceCards: [
        {
          title: 'Volatilità strutturale',
          body: 'Il BIS Economic Report 2023 evidenzia shock di prezzo intra-day delle crypto superiori agli indici azionari tradizionali.',
          sourceLabel: 'BIS 2023',
          sourceHref: 'https://www.bis.org/publ/arpdf/ar2023e.htm',
        },
        {
          title: 'Rischio retail',
          body: 'ESMA 2023 classifica le cripto-attività come prodotti altamente speculativi e inadatti alla maggior parte degli investitori retail.',
          sourceLabel: 'ESMA 2023',
          sourceHref: 'https://www.esma.europa.eu/press-news/esma-news/esma-highlights-risks-crypto-assets',
        },
        {
          title: 'Complessità operativa',
          body: 'L’OECD DeFi Policy Note 2024 rileva rischi di liquidità e leva implicita nelle piattaforme non custodial.',
          sourceLabel: 'OECD 2024',
          sourceHref: 'https://www.oecd.org/finance/financial-markets/decentralised-finance-policy-issues.pdf',
        },
      ],
      disclaimer: 'Le informazioni fornite da Tradelia sono esclusivamente a scopo educativo e informativo. Non costituiscono consigli finanziari, raccomandazioni di investimento o sollecitazioni all’acquisto di criptovalute. Effettua sempre le tue ricerche indipendenti e consulta professionisti qualificati prima di prendere decisioni finanziarie. Le criptovalute sono altamente volatili e comportano rischi significativi, inclusa la possibile perdita totale del capitale investito.',
      closing: 'Nel mondo delle criptovalute, agire senza comprendere il contesto è spesso più rischioso che non agire. Tradelia esiste per aiutare a scegliere consapevolmente.',
      settingsStrings: {
        title: 'Impostazioni',
        closeLabel: 'Chiudi impostazioni',
        themeLabel: 'Tema',
        darkLabel: 'Scuro',
        lightLabel: 'Chiaro',
        animationsLabel: 'Animazioni',
        animationsOn: 'Attive',
        animationsReduce: 'Ridotte',
        textSizeLabel: 'Dimensione testo',
        textSmall: 'Compatta',
        textNormal: 'Normale',
        textLarge: 'Grande',
        accessLabel: 'Accesso',
        loginLabel: 'Login',
        signupLabel: 'Registrati',
        accessNote: 'Login richiesto nelle sezioni operative; homepage resta navigabile senza account.',
      },
      headerStrings: {
        animationsShort: 'Anim',
        themeLabel: 'Cambia tema',
        menuLabel: 'Menu',
        closeMenuLabel: 'Chiudi',
        settingsLabel: 'Impostazioni',
        languageLabel: 'Lingua',
        textScaleLabel: 'Dimensione testo',
        animationsLabel: 'Animazioni',
        textSmallLabel: 'Compatta',
        textNormalLabel: 'Normale',
        textLargeLabel: 'Ampia',
      },
      headerNav: [
        { href: '#percorso', label: 'Percorsi' },
        { href: '#metodo', label: 'Metodo' },
        { href: '#note', label: 'Note' },
      ],
      settingsTriggerLabel: 'Apri impostazioni',
      methodologyClose: 'Chiudi',
    },
    en: {
      heroTitle: 'Tradelia',
      heroKicker: 'Cognitive design · 2025',
      heroPrimaryCta: 'Avvia un percorso guidato',
      heroSecondaryCta: 'Esplora il glossario',
      heroLede: [
        'Understand crypto risk with micro-learning paths calibrated for cognitive load.',
        'An independent, non-promotional project built for deliberate decision-making.',
      ],
      heroBadges: [
        'Micro-unit duration: 5–7 min',
        'Pattern: example → definition → application',
        'CTAs anchored to risk, not to buying',
      ],
      contextParagraphs: [
        'Crypto interests many people, but only a portion actually participates.',
        'Many avoid buying because they don’t understand how it works. Many fear irreversible mistakes. Others already operate but face confusion and conflicting information.',
        'These challenges aren’t due to lack of data—blockchains are transparent. The real issue is',
      ],
      contextRiskLink: 'interpreting risk correctly',
      microlearningCard: {
        title: 'Operational microlearning',
        body: 'Each piece is built for quick consumption, one decision at a time. Generous whitespace, legible typography, and intent-first CTAs lower cognitive load and improve retention.',
        pills: ['7-minute sessions', 'Transfer test included', 'Multisensory formats coming soon'],
      },
      riskTitle: 'Start from your risk level',
      riskDescription: 'Choose guided paths by exposure level with clear language and no commercial pressure. Each card links to a single, structured journey.',
      riskActionLabel: 'Open the path',
      centralThesisTitle: 'Transparency ≠ Safety',
      centralThesisBody: 'Crypto is not a single instrument: from regulated ETFs to complex leveraged derivatives. Each level demands different skills, responsibilities, and risk.',
      metricChips: [
        { value: '78%', label: 'Understands risk levels after 1 micro-unit*' },
        { value: '3', label: 'Guiding questions per decision' },
      ],
      loadLabel: 'Cognitive load',
      loadValue: 'Balanced',
      metricNote: '*Internal pilot data, Q4 2024.',
      cognitiveCard: {
        badge: 'Cognitive-first',
        body: 'Every section follows a repeatable pattern: anticipate, explain, transfer. This reduces decision anxiety and stabilizes comprehension.',
      },
      riskLevels: [
        { level: 'low', title: 'Contained risk', description: 'Indirect or delegated exposure (ETFs, regulated instruments). For those who want crypto exposure without technical/operational overhead.', href: '/risk/contained' },
        { level: 'mid', title: 'Intermediate risk', description: 'Direct exposure with custody. For those who want to own assets and handle security responsibilities.', href: '/risk/intermediate' },
        { level: 'high', title: 'High risk', description: 'Active operational exposure. For those making time-based decisions and accepting higher error probability.', href: '/risk/high' },
        { level: 'extreme', title: 'Very high risk', description: 'Complex speculative exposure (futures, options, leverage). For specialized profiles aware of structural limits for non-professionals.', href: '/risk/very-high' },
      ],
      positioningTitle: 'Where Tradelia starts',
      positioningBody: 'Tradelia is an independent educational project. It does not provide signals, forecasts, or trade tips. It helps answer a prior question: What level of crypto exposure fits my risk profile?',
      positioningNote: 'Moving up levels isn’t progress—it’s a different choice.',
      positioningPills: ['Language ready: IT/EN/ES/FR/DE', 'Verifiable journeys', 'CTAs without commercial bias'],
      learningPillars: [
        { title: 'Applied microlearning', body: '5–7 minute, single-focus paths to spread cognitive load and improve long-term retention. Each unit ends with a guided decision.', metric: '7 min', label: 'Avg. duration' },
        { title: 'Cognitive scaffold', body: 'Each concept starts with an example, then a concise definition, then an operational application. This reduces ambiguity and interpretation fatigue.', metric: '3 steps', label: 'Understanding pattern' },
        { title: 'Safer decisions', body: 'CTAs are anchored to risk levels. We don’t say “what to buy,” but “how much risk is appropriate” before acting.', metric: '+28%', label: 'Perceived clarity*' },
      ],
      methodNote: 'Every Tradelia piece follows the same pattern: what research says, how to interpret it, the real risks, verifiable sources.',
      methodologySections: [
        { title: 'Cognitive load', body: 'Controlled density, stable typography, intent-first CTAs reduce split attention (Sweller, 2011).' },
        { title: 'Structured microlearning', body: '5–7 minute units, example → definition → application, aligned with Hug (2020) and Bannert (2021) for immediate transfer.' },
        { title: 'Accessibility & control', body: 'Default dark mode but switchable, adjustable text size, animation reduction; preferences stored locally and on authenticated profiles.' },
        { title: 'Risk signals', body: 'Consistent badges/metrics avoid speculative framing and support conservative choices.' },
        { title: 'Privacy & audit', body: 'No extra tracking client-side; streaming from public sources without cookies.' },
      ],
      microKicker: 'Quick paths',
      microTitle: 'Choose an operational micro-module',
      microIntro: 'Micro-units built for a single cognitive outcome: understand, classify, decide. Each module ends with a printable decision checklist.',
      microModules: [
        { title: 'ETFs and regulated products', detail: 'Understand delegated vs direct exposure, with a ready-to-use checklist.', action: 'Start in 5 minutes' },
        { title: 'Self-custody', detail: 'Wallets, seed phrases, irreversible errors: a three-step safety protocol.', action: 'Simulate a handoff' },
        { title: 'Derivatives and leverage', detail: 'Why technical transparency doesn’t remove liquidation risk. Progressive visualizations.', action: 'View triggers' },
      ],
      methodologyTrigger: 'Method notes & references',
      methodologyIntro: 'See how the homepage was designed: cognitive principles, microlearning, security, and privacy.',
      methodologyDrawer: {
        kicker: 'Method',
        title: 'Homepage construction',
        referencesLabel: 'References',
        closeLabel: 'Close method notes',
      },
      evidenceCards: [
        {
          title: 'Structural volatility',
          body: 'The BIS Economic Report 2023 shows crypto intra-day price shocks exceed those of major equity indices.',
          sourceLabel: 'BIS 2023',
          sourceHref: 'https://www.bis.org/publ/arpdf/ar2023e.htm',
        },
        {
          title: 'Retail risk',
          body: 'ESMA 2023 flags crypto-assets as highly speculative and unsuitable for most retail investors.',
          sourceLabel: 'ESMA 2023',
          sourceHref: 'https://www.esma.europa.eu/press-news/esma-news/esma-highlights-risks-crypto-assets',
        },
        {
          title: 'Operational complexity',
          body: 'The OECD DeFi Policy Note 2024 highlights liquidity and embedded leverage risks in non-custodial platforms.',
          sourceLabel: 'OECD 2024',
          sourceHref: 'https://www.oecd.org/finance/financial-markets/decentralised-finance-policy-issues.pdf',
        },
      ],
      disclaimer: 'Information is for educational purposes only. It is not financial advice or an invitation to buy. Always do your own research and consult qualified professionals. Crypto is highly volatile and you can lose all invested capital.',
      closing: 'In crypto, acting without context is often riskier than not acting. Tradelia exists to help you choose consciously.',
      settingsStrings: {
        title: 'Settings',
        closeLabel: 'Close settings',
        themeLabel: 'Theme',
        darkLabel: 'Dark',
        lightLabel: 'Light',
        animationsLabel: 'Animations',
        animationsOn: 'On',
        animationsReduce: 'Reduced',
        textSizeLabel: 'Text size',
        textSmall: 'Compact',
        textNormal: 'Normal',
        textLarge: 'Large',
        accessLabel: 'Access',
        loginLabel: 'Login',
        signupLabel: 'Sign up',
        accessNote: 'Login required in operational areas; homepage stays open.',
      },
      headerStrings: {
        animationsShort: 'Anim',
        themeLabel: 'Toggle theme',
        menuLabel: 'Menu',
        closeMenuLabel: 'Close',
        settingsLabel: 'Settings',
        languageLabel: 'Language',
        textScaleLabel: 'Text size',
        animationsLabel: 'Animations',
        textSmallLabel: 'Compact',
        textNormalLabel: 'Normal',
        textLargeLabel: 'Large',
      },
      headerNav: [
        { href: '#percorso', label: 'Paths' },
        { href: '#metodo', label: 'Method' },
        { href: '#note', label: 'Notes' },
      ],
      settingsTriggerLabel: 'Open settings',
      methodologyClose: 'Close',
    },
    es: {
      heroTitle: 'Tradelia',
      heroKicker: 'Diseño cognitivo · 2025',
      heroPrimaryCta: 'Avvia un percorso guidato',
      heroSecondaryCta: 'Esplora il glossario',
      heroLede: [
        'Comprende el riesgo cripto con rutas de microlearning calibradas para la carga cognitiva.',
        'Proyecto independiente sin presión comercial, pensado para decisiones conscientes.',
      ],
      heroBadges: [
        'Duración micro-unidad: 5–7 min',
        'Patrón: ejemplo → definición → aplicación',
        'CTA ancladas al riesgo, no a la compra',
      ],
      contextParagraphs: [
        'Las criptomonedas interesan a muchos, pero solo una parte participa realmente.',
        'Muchos no compran porque no entienden cómo funciona. Otros temen errores irreversibles. Algunos ya operan con información confusa y contradictoria.',
        'El problema no es la falta de datos—la cadena es transparente—sino',
      ],
      contextRiskLink: 'interpretar correctamente el riesgo',
      microlearningCard: {
        title: 'Microlearning operativo',
        body: 'Contenido para consumo rápido, una decisión a la vez. Espacios amplios, tipografía legible y CTA orientadas al propósito reducen la carga cognitiva.',
        pills: ['Sesiones de 7 minutos', 'Prueba de transferencia incluida', 'Formatos multisensoriales en camino'],
      },
      riskTitle: 'Empieza desde tu nivel de riesgo',
      riskDescription: 'Elige recorridos guiados según tu exposición, con lenguaje claro y sin presión comercial. Cada tarjeta abre un recorrido único y estructurado.',
      riskActionLabel: 'Abrir recorrido',
      centralThesisTitle: 'Transparencia ≠ Seguridad',
      centralThesisBody: 'El cripto no es un solo instrumento: desde ETF regulados hasta derivados complejos con apalancamiento. Cada nivel exige habilidades, responsabilidades y riesgos distintos.',
      metricChips: [
        { value: '78%', label: 'Comprende los niveles de riesgo tras 1 micro-unidad*' },
        { value: '3', label: 'Preguntas guía por decisión' },
      ],
      loadLabel: 'Carga cognitiva',
      loadValue: 'Balanceada',
      metricNote: '*Datos piloto internos, Q4 2024.',
      cognitiveCard: {
        badge: 'Cognitive-first',
        body: 'Cada sección sigue un patrón repetible: anticipar, explicar, transferir. Reduce la ansiedad al decidir.',
      },
      riskLevels: [
        { level: 'low', title: 'Riesgo contenido', description: 'Exposición indirecta o delegada (ETF, instrumentos regulados). Para quien quiere exposición sin la carga técnica.', href: '/risk/contenido' },
        { level: 'mid', title: 'Riesgo intermedio', description: 'Exposición directa con custodia. Para quien asume la seguridad de sus activos.', href: '/risk/intermedio' },
        { level: 'high', title: 'Riesgo elevado', description: 'Exposición operativa activa. Para quien acepta mayor probabilidad de error.', href: '/risk/elevado' },
        { level: 'extreme', title: 'Riesgo muy alto', description: 'Exposición especulativa compleja (futuros, opciones, apalancamiento). Para perfiles específicos y conscientes.', href: '/risk/muy-elevado' },
      ],
      positioningTitle: 'Punto de partida de Tradelia',
      positioningBody: 'Tradelia es un proyecto educativo independiente. No da señales ni predicciones. Ayuda a responder: ¿qué nivel de exposición cripto es coherente con mi perfil de riesgo?',
      positioningNote: 'Subir de nivel no es progreso; es otra elección.',
      positioningPills: ['Idiomas: IT/EN/ES/FR/DE', 'Recorridos verificables', 'CTA sin sesgo comercial'],
      learningPillars: [
        { title: 'Microlearning aplicado', body: 'Rutas de 5–7 minutos con foco único para repartir la carga cognitiva. Cada unidad termina con una decisión guiada.', metric: '7 min', label: 'Duración media' },
        { title: 'Andamiaje cognitivo', body: 'Ejemplo → definición → aplicación reduce ambigüedad y fatiga de interpretación.', metric: '3 pasos', label: 'Patrón de comprensión' },
        { title: 'Decisiones seguras', body: 'CTA ancladas al riesgo. No decimos “qué comprar”, sino “cuánto riesgo es adecuado”.', metric: '+28%', label: 'Claridad percibida*' },
      ],
      methodNote: 'Cada pieza sigue: qué dice la investigación, cómo interpretarla, riesgos reales, fuentes verificables.',
      methodologySections: [
        { title: 'Carga cognitiva', body: 'Densidad controlada, tipografía estable y CTA orientadas a la decisión reducen la atención dividida (Sweller, 2011).' },
        { title: 'Microlearning estructurado', body: 'Unidades de 5–7 minutos, ejemplo → definición → aplicación, alineadas con Hug (2020) y Bannert (2021).' },
        { title: 'Accesibilidad y control', body: 'Tema oscuro por defecto pero conmutables, tamaño de texto ajustable, animaciones reducibles; preferencias en IndexedDB y perfil autenticado.' },
        { title: 'Señales de riesgo', body: 'Badges y métricas coherentes evitan framing especulativo y favorecen decisiones conservadoras.' },
        { title: 'Privacidad y auditoría', body: 'Sin tracking adicional en el cliente; streaming desde fuentes públicas sin cookies.' },
      ],
      microKicker: 'Recorridos rápidos',
      microTitle: 'Elige un micro-módulo operativo',
      microIntro: 'Micro-unidades para un resultado cognitivo: entender, clasificar, decidir. Incluye checklist imprimible.',
      microModules: [
        { title: 'ETF y productos regulados', detail: 'Diferencia entre exposición delegada y directa con checklist.', action: 'Empieza en 5 minutos' },
        { title: 'Custodia personal', detail: 'Wallets, seed phrase y errores irreversibles en tres pasos.', action: 'Simula un traspaso' },
        { title: 'Derivados y apalancamiento', detail: 'La transparencia técnica no elimina el riesgo de liquidación.', action: 'Ver disparadores' },
      ],
      methodologyTrigger: 'Notas metodológicas y referencias',
      methodologyIntro: 'Cómo se diseñó la homepage: principios cognitivos, microlearning, seguridad y privacidad.',
      methodologyDrawer: {
        kicker: 'Método',
        title: 'Construcción de la homepage',
        referencesLabel: 'Referencias',
        closeLabel: 'Cerrar notas',
      },
      evidenceCards: [
        {
          title: 'Volatilidad estructural',
          body: 'El BIS Economic Report 2023 muestra que los shocks intradía en crypto superan a los de los índices bursátiles principales.',
          sourceLabel: 'BIS 2023',
          sourceHref: 'https://www.bis.org/publ/arpdf/ar2023e.htm',
        },
        {
          title: 'Riesgo retail',
          body: 'ESMA 2023 clasifica los criptoactivos como altamente especulativos y poco adecuados para la mayoría de inversores minoristas.',
          sourceLabel: 'ESMA 2023',
          sourceHref: 'https://www.esma.europa.eu/press-news/esma-news/esma-highlights-risks-crypto-assets',
        },
        {
          title: 'Complejidad operativa',
          body: 'La OECD DeFi Policy Note 2024 subraya riesgos de liquidez y apalancamiento implícito en plataformas no custodial.',
          sourceLabel: 'OECD 2024',
          sourceHref: 'https://www.oecd.org/finance/financial-markets/decentralised-finance-policy-issues.pdf',
        },
      ],
      disclaimer: 'Información solo educativa. No es asesoría financiera ni invitación a compra. Haz tu propia investigación; la cripto es volátil y puedes perder todo el capital.',
      closing: 'Actuar sin contexto suele ser más riesgoso que no actuar. Tradelia existe para decisiones conscientes.',
      settingsStrings: {
        title: 'Configuración',
        closeLabel: 'Cerrar configuración',
        themeLabel: 'Tema',
        darkLabel: 'Oscuro',
        lightLabel: 'Claro',
        animationsLabel: 'Animaciones',
        animationsOn: 'Activas',
        animationsReduce: 'Reducidas',
        textSizeLabel: 'Tamaño de texto',
        textSmall: 'Compacto',
        textNormal: 'Normal',
        textLarge: 'Grande',
        accessLabel: 'Acceso',
        loginLabel: 'Login',
        signupLabel: 'Registrarse',
        accessNote: 'Login requerido en áreas operativas; la homepage sigue abierta.',
      },
      headerStrings: {
        animationsShort: 'Anim',
        themeLabel: 'Cambiar tema',
        menuLabel: 'Menú',
        closeMenuLabel: 'Cerrar',
        settingsLabel: 'Ajustes',
        languageLabel: 'Idioma',
        textScaleLabel: 'Tamaño de texto',
        animationsLabel: 'Animaciones',
        textSmallLabel: 'Compacto',
        textNormalLabel: 'Normal',
        textLargeLabel: 'Grande',
      },
      headerNav: [
        { href: '#percorso', label: 'Recorridos' },
        { href: '#metodo', label: 'Método' },
        { href: '#note', label: 'Notas' },
      ],
      settingsTriggerLabel: 'Abrir configuración',
      methodologyClose: 'Cerrar',
    },
    fr: {
      heroTitle: 'Tradelia',
      heroKicker: 'Design cognitif · 2025',
      heroPrimaryCta: 'Avvia un percorso guidato',
      heroSecondaryCta: 'Esplora il glossario',
      heroLede: [
        'Comprendre le risque crypto avec des parcours micro-learning calibrés pour la charge cognitive.',
        'Projet indépendant sans pression commerciale, pensé pour des décisions éclairées.',
      ],
      heroBadges: [
        'Durée micro-unité : 5–7 min',
        'Schéma : exemple → définition → application',
        'CTA ancrées au risque, pas à l’achat',
      ],
      contextParagraphs: [
        'Les cryptos intéressent beaucoup de monde, mais seule une partie participe réellement.',
        'Beaucoup n’achètent pas par manque de compréhension ou par peur d’erreurs irréversibles. D’autres opèrent déjà avec des informations confuses.',
        'Le problème n’est pas le manque de données—la blockchain est transparente—mais',
      ],
      contextRiskLink: 'la bonne interprétation du risque',
      microlearningCard: {
        title: 'Microlearning opérationnel',
        body: 'Contenu pour une décision à la fois, consommation rapide. Espaces généreux, typographie lisible et CTA orientées intention pour réduire la charge cognitive.',
        pills: ['Sessions de 7 minutes', 'Test de transfert inclus', 'Formats multisensoriels à venir'],
      },
      riskTitle: 'Commencez par votre niveau de risque',
      riskDescription: 'Choisissez des parcours guidés selon votre exposition, avec un langage clair et sans pression commerciale. Chaque carte mène à un parcours unique et structuré.',
      riskActionLabel: 'Ouvrir le parcours',
      centralThesisTitle: 'Transparence ≠ Sécurité',
      centralThesisBody: 'La crypto n’est pas un instrument unique : des ETF régulés aux dérivés complexes à effet de levier. Chaque niveau implique compétences et risques différents.',
      metricChips: [
        { value: '78%', label: 'Comprend les niveaux de risque après 1 micro-unité*' },
        { value: '3', label: 'Questions guides par décision' },
      ],
      loadLabel: 'Charge cognitive',
      loadValue: 'Équilibrée',
      metricNote: '*Données pilotes internes, T4 2024.',
      cognitiveCard: {
        badge: 'Cognitive-first',
        body: 'Chaque section suit un pattern : anticiper, expliquer, transférer. Réduit l’anxiété décisionnelle.',
      },
      riskLevels: [
        { level: 'low', title: 'Risque contenu', description: 'Exposition indirecte ou déléguée (ETF, produits régulés). Pour ceux qui veulent l’exposition sans la charge technique.', href: '/risk/contenu' },
        { level: 'mid', title: 'Risque intermédiaire', description: 'Exposition directe avec garde. Pour ceux prêts à gérer la sécurité des actifs.', href: '/risk/intermediaire' },
        { level: 'high', title: 'Risque élevé', description: 'Exposition opérationnelle active. Pour ceux qui acceptent une probabilité d’erreur plus forte.', href: '/risk/eleve' },
        { level: 'extreme', title: 'Risque très élevé', description: 'Exposition spéculative complexe (futures, options, levier). Pour profils spécifiques et conscients.', href: '/risk/tres-eleve' },
      ],
      positioningTitle: 'Point de départ de Tradelia',
      positioningBody: 'Tradelia est un projet éducatif indépendant. Pas de signaux ni prévisions. Il aide à répondre : quel niveau d’exposition crypto est cohérent avec mon profil de risque ?',
      positioningNote: 'Monter de niveau n’est pas un progrès, c’est un autre choix.',
      positioningPills: ['Langues : IT/EN/ES/FR/DE', 'Parcours vérifiables', 'CTA sans biais commercial'],
      learningPillars: [
        { title: 'Microlearning appliqué', body: 'Parcours 5–7 minutes, focus unique, charge cognitive maîtrisée. Finis par une décision guidée.', metric: '7 min', label: 'Durée moyenne' },
        { title: 'Scaffolding cognitif', body: 'Exemple → définition → application pour réduire l’ambiguïté.', metric: '3 étapes', label: 'Pattern de compréhension' },
        { title: 'Décisions sûres', body: 'CTA ancrées au risque. Nous ne disons pas “quoi acheter”, mais “combien de risque est acceptable”.', metric: '+28%', label: 'Clarté perçue*' },
      ],
      methodNote: 'Chaque contenu suit : recherche, interprétation, risques réels, sources vérifiables.',
      methodologySections: [
        { title: 'Charge cognitive', body: 'Densité contrôlée, typographie stable, CTA orientées décision réduisent le split attention (Sweller, 2011).' },
        { title: 'Microlearning structuré', body: 'Unités 5–7 min, exemple → définition → application, selon Hug (2020) et Bannert (2021).' },
        { title: 'Accessibilité et contrôle', body: 'Thème sombre par défaut mais switchable, taille de texte ajustable, animations réduisibles; préférences stockées localement et sur profil connecté.' },
        { title: 'Signaux de risque', body: 'Badges et métriques cohérents évitent un cadrage spéculatif et soutiennent des choix prudents.' },
        { title: 'Vie privée et audit', body: 'Pas de tracking additionnel côté client; streaming depuis des sources publiques sans cookies.' },
      ],
      microKicker: 'Parcours rapides',
      microTitle: 'Choisissez un micro-module opérationnel',
      microIntro: 'Micro-unités pour un seul résultat cognitif : comprendre, classer, décider. Avec checklist imprimable.',
      microModules: [
        { title: 'ETF et produits régulés', detail: 'Différence exposition déléguée vs directe avec checklist.', action: 'Commencer en 5 minutes' },
        { title: 'Auto-garde', detail: 'Wallets, seed phrase et erreurs irréversibles en trois étapes.', action: 'Simuler un transfert' },
        { title: 'Dérivés et levier', detail: 'La transparence technique n’élimine pas le risque de liquidation.', action: 'Voir les triggers' },
      ],
      methodologyTrigger: 'Notes méthodologiques et références',
      methodologyIntro: 'Comment la homepage est conçue : principes cognitifs, microlearning, sécurité, vie privée.',
      methodologyDrawer: {
        kicker: 'Méthode',
        title: 'Construction de la homepage',
        referencesLabel: 'Références',
        closeLabel: 'Fermer les notes',
      },
      evidenceCards: [
        {
          title: 'Volatilité structurelle',
          body: 'Le BIS Economic Report 2023 montre que les chocs intrajournaliers crypto dépassent ceux des principaux indices boursiers.',
          sourceLabel: 'BIS 2023',
          sourceHref: 'https://www.bis.org/publ/arpdf/ar2023e.htm',
        },
        {
          title: 'Risque retail',
          body: 'L’ESMA 2023 classe les crypto-actifs comme hautement spéculatifs et inadaptés à la plupart des investisseurs particuliers.',
          sourceLabel: 'ESMA 2023',
          sourceHref: 'https://www.esma.europa.eu/press-news/esma-news/esma-highlights-risks-crypto-assets',
        },
        {
          title: 'Complexité opérationnelle',
          body: 'La note OCDE DeFi 2024 souligne les risques de liquidité et de levier implicite sur les plateformes non custodiales.',
          sourceLabel: 'OCDE 2024',
          sourceHref: 'https://www.oecd.org/finance/financial-markets/decentralised-finance-policy-issues.pdf',
        },
      ],
      disclaimer: 'Informations à but éducatif. Pas de conseil financier ni d’invitation à acheter. Faites vos recherches; la crypto est très volatile et peut entraîner la perte totale du capital.',
      closing: 'Agir sans contexte est souvent plus risqué que ne pas agir. Tradelia aide à choisir en connaissance de cause.',
      settingsStrings: {
        title: 'Paramètres',
        closeLabel: 'Fermer les paramètres',
        themeLabel: 'Thème',
        darkLabel: 'Sombre',
        lightLabel: 'Clair',
        animationsLabel: 'Animations',
        animationsOn: 'Actives',
        animationsReduce: 'Réduites',
        textSizeLabel: 'Taille du texte',
        textSmall: 'Compacte',
        textNormal: 'Normal',
        textLarge: 'Grand',
        accessLabel: 'Accès',
        loginLabel: 'Login',
        signupLabel: 'Inscription',
        accessNote: 'Login requis en zones opérationnelles; la homepage reste ouverte.',
      },
      headerStrings: {
        animationsShort: 'Anim',
        themeLabel: 'Changer de thème',
        menuLabel: 'Menu',
        closeMenuLabel: 'Fermer',
        settingsLabel: 'Paramètres',
        languageLabel: 'Langue',
        textScaleLabel: 'Taille du texte',
        animationsLabel: 'Animations',
        textSmallLabel: 'Compacte',
        textNormalLabel: 'Normal',
        textLargeLabel: 'Grand',
      },
      headerNav: [
        { href: '#percorso', label: 'Parcours' },
        { href: '#metodo', label: 'Méthode' },
        { href: '#note', label: 'Notes' },
      ],
      settingsTriggerLabel: 'Ouvrir les paramètres',
      methodologyClose: 'Fermer',
    },
    de: {
      heroTitle: 'Tradelia',
      heroKicker: 'Kognitives Design · 2025',
      heroPrimaryCta: 'Avvia un percorso guidato',
      heroSecondaryCta: 'Esplora il glossario',
      heroLede: [
        'Kryptorisiken verstehen mit Microlearning-Pfaden für geringe kognitive Last.',
        'Unabhängiges, nicht-kommerzielles Projekt für bewusste Entscheidungen.',
      ],
      heroBadges: [
        'Mikroeinheit: 5–7 Min',
        'Muster: Beispiel → Definition → Anwendung',
        'CTAs am Risiko ausgerichtet, nicht am Kauf',
      ],
      contextParagraphs: [
        'Krypto interessiert viele, aber nur ein Teil macht wirklich mit.',
        'Viele kaufen nicht, weil sie es nicht verstehen, oder aus Angst vor irreversiblen Fehlern. Andere handeln bereits mit widersprüchlichen Infos.',
        'Das Problem ist nicht Datenmangel—Blockchains sind transparent—sondern',
      ],
      contextRiskLink: 'die richtige Risiko-Interpretation',
      microlearningCard: {
        title: 'Operatives Microlearning',
        body: 'Schnell konsumierbare Inhalte, eine Entscheidung nach der anderen. Weißraum, gute Typografie und zielgerichtete CTAs senken die kognitive Last.',
        pills: ['7-Minuten-Sessions', 'Transfer-Test enthalten', 'Multisensorische Formate folgen'],
      },
      riskTitle: 'Starte bei deinem Risikoniveau',
      riskDescription: 'Wähle geführte Pfade nach Expositionsgrad, mit klarer Sprache und ohne kommerziellen Druck. Jede Karte führt zu einem einzigen, strukturierten Weg.',
      riskActionLabel: 'Pfad öffnen',
      centralThesisTitle: 'Transparenz ≠ Sicherheit',
      centralThesisBody: 'Krypto ist kein Einzelinstrument: von regulierten ETFs bis komplexen Derivaten mit Hebel. Jedes Level verlangt andere Skills und Risiken.',
      metricChips: [
        { value: '78%', label: 'Versteht Risikostufen nach 1 Mikroeinheit*' },
        { value: '3', label: 'Leitfragen je Entscheidung' },
      ],
      loadLabel: 'Kognitive Last',
      loadValue: 'Ausgewogen',
      metricNote: '*Interne Pilotdaten, Q4 2024.',
      cognitiveCard: {
        badge: 'Cognitive-first',
        body: 'Jede Sektion folgt einem Muster: Antizipieren, Erklären, Übertragen. Das senkt Entscheidungsangst.',
      },
      riskLevels: [
        { level: 'low', title: 'Begrenztes Risiko', description: 'Indirekte oder delegierte Exposition (ETFs, regulierte Produkte). Für Nutzer ohne operativen Aufwand.', href: '/risk/begrenzt' },
        { level: 'mid', title: 'Mittleres Risiko', description: 'Direkte Exposition mit Verwahrung. Für Nutzer, die Sicherheit selbst tragen.', href: '/risk/mittel' },
        { level: 'high', title: 'Hohes Risiko', description: 'Aktive operative Exposition. Für Nutzer, die mehr Fehlerrisiko akzeptieren.', href: '/risk/hoch' },
        { level: 'extreme', title: 'Sehr hohes Risiko', description: 'Komplexe spekulative Exposition (Futures, Optionen, Hebel). Für spezifische, bewusste Profile.', href: '/risk/sehr-hoch' },
      ],
      positioningTitle: 'Tradelias Ausgangspunkt',
      positioningBody: 'Tradelia ist ein unabhängiges Bildungsprojekt. Keine Signale oder Prognosen. Es hilft zu klären: Welches Kryptorisiko passt zu meinem Profil?',
      positioningNote: 'Ein Level höher ist kein Fortschritt, nur eine andere Wahl.',
      positioningPills: ['Sprachen: IT/EN/ES/FR/DE', 'Verifizierbare Pfade', 'CTAs ohne Werbebias'],
      learningPillars: [
        { title: 'Angewandtes Microlearning', body: '5–7 Minuten, ein Fokus, geringere kognitive Last. Jede Einheit endet mit einer geführten Entscheidung.', metric: '7 Min', label: 'Durchschnittsdauer' },
        { title: 'Kognitives Gerüst', body: 'Beispiel → Definition → Anwendung reduziert Mehrdeutigkeit.', metric: '3 Schritte', label: 'Verständnismuster' },
        { title: 'Sichere Entscheidungen', body: 'CTAs am Risiko ausgerichtet. Nicht “was kaufen”, sondern “wie viel Risiko passt”.', metric: '+28%', label: 'Wahrgenommene Klarheit*' },
      ],
      methodNote: 'Jeder Inhalt folgt: Forschung, Interpretation, reale Risiken, verifizierbare Quellen.',
      methodologySections: [
        { title: 'Kognitive Last', body: 'Kontrollierte Dichte, stabile Typografie, intentionale CTAs reduzieren Split Attention (Sweller, 2011).' },
        { title: 'Strukturiertes Microlearning', body: '5–7 Minuten, Beispiel → Definition → Anwendung nach Hug (2020) und Bannert (2021).' },
        { title: 'Barrierefreiheit & Kontrolle', body: 'Standard Dark Mode, umschaltbar; Textgröße anpassbar; Animationen reduzierbar; Präferenzen lokal + Profil.' },
        { title: 'Risikosignale', body: 'Kohärente Badges/Metriken vermeiden spekulatives Framing und stützen konservative Entscheidungen.' },
        { title: 'Privacy & Audit', body: 'Kein zusätzliches Tracking im Client; Streaming aus öffentlichen Quellen ohne Cookies.' },
      ],
      microKicker: 'Schnelle Pfade',
      microTitle: 'Wähle ein operatives Mikro-Modul',
      microIntro: 'Mikroeinheiten für ein Ziel: verstehen, klassifizieren, entscheiden. Mit druckbarer Checklist.',
      microModules: [
        { title: 'ETFs und regulierte Produkte', detail: 'Delegierte vs. direkte Exposition mit Checklist.', action: 'Starte in 5 Minuten' },
        { title: 'Eigene Verwahrung', detail: 'Wallets, Seed Phrase, irreversible Fehler in drei Schritten.', action: 'Übergabe simulieren' },
        { title: 'Derivate und Hebel', detail: 'Technische Transparenz eliminiert Liquidationsrisiko nicht.', action: 'Trigger anzeigen' },
      ],
      methodologyTrigger: 'Methodennotizen & Referenzen',
      methodologyIntro: 'So wurde die Homepage gebaut: kognitive Prinzipien, Microlearning, Sicherheit und Privatsphäre.',
      methodologyDrawer: {
        kicker: 'Methode',
        title: 'Aufbau der Homepage',
        referencesLabel: 'Referenzen',
        closeLabel: 'Notizen schließen',
      },
      evidenceCards: [
        {
          title: 'Strukturelle Volatilität',
          body: 'Der BIS Economic Report 2023 zeigt, dass intraday-Kursschocks bei Krypto größer sind als bei großen Aktienindizes.',
          sourceLabel: 'BIS 2023',
          sourceHref: 'https://www.bis.org/publ/arpdf/ar2023e.htm',
        },
        {
          title: 'Retail-Risiko',
          body: 'Die ESMA 2023 stuft Krypto-Assets als hochspekulativ und für die meisten Privatanleger ungeeignet ein.',
          sourceLabel: 'ESMA 2023',
          sourceHref: 'https://www.esma.europa.eu/press-news/esma-news/esma-highlights-risks-crypto-assets',
        },
        {
          title: 'Operative Komplexität',
          body: 'Die OECD DeFi Policy Note 2024 hebt Liquiditäts- und implizite Hebelrisiken auf nicht-kustodialen Plattformen hervor.',
          sourceLabel: 'OECD 2024',
          sourceHref: 'https://www.oecd.org/finance/financial-markets/decentralised-finance-policy-issues.pdf',
        },
      ],
      disclaimer: 'Information nur zu Bildungszwecken. Kein Finanzrat oder Kaufaufruf. Eigene Recherche nötig; Krypto ist volatil und Totalverlust ist möglich.',
      closing: 'Ohne Kontext zu handeln ist oft riskanter als nicht zu handeln. Tradelia hilft bei bewussten Entscheidungen.',
      settingsStrings: {
        title: 'Einstellungen',
        closeLabel: 'Einstellungen schließen',
        themeLabel: 'Thema',
        darkLabel: 'Dunkel',
        lightLabel: 'Hell',
        animationsLabel: 'Animationen',
        animationsOn: 'An',
        animationsReduce: 'Reduziert',
        textSizeLabel: 'Textgröße',
        textSmall: 'Kompakt',
        textNormal: 'Normal',
        textLarge: 'Groß',
        accessLabel: 'Zugang',
        loginLabel: 'Login',
        signupLabel: 'Registrieren',
        accessNote: 'Login in operativen Bereichen erforderlich; Homepage bleibt offen.',
      },
      headerStrings: {
        animationsShort: 'Anim',
        themeLabel: 'Thema wechseln',
        menuLabel: 'Menü',
        closeMenuLabel: 'Schließen',
        settingsLabel: 'Einstellungen',
        languageLabel: 'Sprache',
        textScaleLabel: 'Textgröße',
        animationsLabel: 'Animationen',
        textSmallLabel: 'Kompakt',
        textNormalLabel: 'Normal',
        textLargeLabel: 'Groß',
      },
      headerNav: [
        { href: '#percorso', label: 'Pfade' },
        { href: '#metodo', label: 'Methode' },
        { href: '#note', label: 'Notizen' },
      ],
      settingsTriggerLabel: 'Einstellungen öffnen',
      methodologyClose: 'Schließen',
    },
  }

  const t = copy[currentLang as keyof typeof copy] || copy.it

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      const prefs = await loadPreferences(user?.id)
      if (cancelled) return
      setTheme(prefs.theme)
      setTextScale(prefs.textScale)
      setAnimations(prefs.animations)
      setPrefsReady(true)
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!prefsReady) return
    document.documentElement.dataset.theme = theme
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const fontScale = textScale === 'large' ? '1.08' : textScale === 'small' ? '0.94' : '1'
    document.documentElement.style.setProperty('--font-scale', fontScale)
    document.documentElement.dataset.motion = animations

    savePreferences({ theme, textScale, animations }, user?.id)

    if (prefersReduced || animations === 'reduce') {
      document.documentElement.style.setProperty('--dur-1', '0ms')
      document.documentElement.style.setProperty('--dur-2', '0ms')
      document.documentElement.style.setProperty('--dur-3', '0ms')
    }
  }, [theme, textScale, animations, prefsReady, user?.id])

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleTextScaleChange = (scale: 'small' | 'normal' | 'large') => {
    setTextScale(scale)
  }

  const riskLevels: RiskLevel[] = [
    ...t.riskLevels
  ]

  // Footer links
  const footerLinks = [
    { label: 'Percorso', href: '#percorso' },
    { label: 'Metodo', href: '#metodo' },
    { label: 'Note', href: '#note' },
    { label: 'Contatti', href: 'mailto:hello@tradelia.org' }
  ]

  const disclaimer = t.disclaimer

  const methodologySources = [
    { label: 'Sweller, J. (2010) - Cognitive Load Theory (Cambridge University Press)', url: 'https://doi.org/10.1017/cbo9780511844744.001' },
    { label: 'Hug, T. (2020) - Microlearning: Emerging Concepts', url: 'https://doi.org/10.1007/978-3-658-27898-7' },
    { label: 'Azizah, S. P. (2024) - Systematic Literature Review on Microlearning', url: 'https://doi.org/10.70125/jetsar.v1i1y2024a3' },
    { label: 'ISO 27001:2022 - Information Security Controls', url: 'https://www.iso.org/standard/82875.html' },
    { label: 'OWASP ASVS 4.0 - Web Security Verification Standard', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <TradeliaHeader
        lang={currentLang}
        onToggleTheme={handleThemeToggle}
        theme={theme}
        textScale={textScale}
        animations={animations}
        onTextScaleChange={handleTextScaleChange}
        onToggleAnimations={() => setAnimations(prev => (prev === 'on' ? 'reduce' : 'on'))}
        onOpenSettings={() => setSettingsOpen(true)}
        onChangeLang={handleLangChange}
        strings={t.headerStrings}
        navItems={t.headerNav}
      />

      {/* Main Content */}
      <main>
        {/* 1. Editorial Hero */}
        <EditorialHero
          id="percorso"
          title={t.heroTitle}
          kicker={t.heroKicker}
          lede={t.heroLede}
          primaryCta={{ label: t.heroPrimaryCta, href: '/method' }}
          secondaryCta={{ label: t.heroSecondaryCta, href: '/glossary' }}
        />

        {/* 2. Context Section */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-8">
            <div className="space-y-5 text-lg text-[var(--muted)] leading-relaxed">
              <p>{t.contextParagraphs[0]}</p>
              <p>{t.contextParagraphs[1]}</p>
              <p>
                {t.contextParagraphs[2]}{' '}
                <GlossaryTrigger termId="transparency">{t.contextRiskLink}</GlossaryTrigger>.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[var(--ink)]">
                {t.microlearningCard.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {t.microlearningCard.body}
              </p>
              <ul className="list-disc pl-5 text-[var(--muted)] space-y-2">
                {t.microlearningCard.pills.map((pill, idx) => (
                  <li key={idx}>{pill}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Central Thesis */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-[var(--ink)] leading-tight">
                {t.centralThesisTitle}
              </h2>
              <p className="text-lg text-[var(--muted)] leading-relaxed">
                {t.centralThesisBody}
              </p>
            </div>
            <ul className="space-y-3 text-[var(--muted)]">
              {t.metricChips.map((chip, idx) => (
                <li key={idx} className="flex items-baseline gap-3">
                  <span className="text-xl font-semibold text-[var(--ink)]">{chip.value}</span>
                  <span>{chip.label}</span>
                </li>
              ))}
              <li className="text-sm text-[var(--faint)] italic">{t.metricNote}</li>
            </ul>
          </div>
        </section>

        {/* 4. Editorial Risk Scale */}
        <RiskScale
          items={riskLevels}
          title={t.riskTitle}
          description={t.riskDescription}
          actionLabel={t.riskActionLabel}
        />

        {/* 5. Tradelia Positioning */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-[var(--ink)]">
                {t.positioningTitle}
              </h2>
              <p className="text-lg text-[var(--muted)] leading-relaxed">
                {t.positioningBody}
              </p>
              <p className="text-sm text-[var(--muted)] italic">
                {t.positioningNote}
              </p>
              <ul className="list-disc pl-5 text-[var(--muted)] space-y-2">
                {t.positioningPills.map((pill, idx) => (
                  <li key={idx}>{pill}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-semibold text-[var(--ink)]">{t.cognitiveCard.badge}</span>
              <p className="text-[var(--muted)] leading-relaxed">
                {t.cognitiveCard.body}
              </p>
            </div>
            <div className="space-y-5">
              {t.learningPillars.map((pillar, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{pillar.title}</h3>
                    <span className="text-sm text-[var(--muted)]">{pillar.metric} · {pillar.label}</span>
                  </div>
                  <p className="text-[var(--muted)] leading-relaxed">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Method Declaration */}
        <section id="metodo">
          <MethodNote
            summary={t.methodNote}
            href="/method"
          />
        </section>

        {/* 6b. Microlearning modules */}
        <section className="py-14" id="note">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-6">
            <div className="flex flex-col gap-3 text-left">
              <span className="text-sm text-[var(--muted)]">{t.microKicker}</span>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">{t.microTitle}</h2>
              <p className="text-lg text-[var(--muted)]">
                {t.microIntro}
              </p>
            </div>
            <ul className="space-y-5">
              {t.microModules.map((module, idx) => (
                <li key={idx} className="space-y-2">
                  <h3 className="text-xl font-semibold text-[var(--ink)]">{module.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed">{module.detail}</p>
                  <p className="text-sm text-[var(--muted)] font-semibold">{module.action}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6c. Methodology drawer trigger */}
        <section className="py-10">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-3">
            <p className="text-[var(--muted)] text-md">
              Scopri come la homepage è stata progettata: principi cognitivi, microlearning, sicurezza e privacy.
            </p>
            <button
              className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold focus:outline-none focus:ring-[var(--focus-ring)]"
              onClick={() => setMethodologyOpen(true)}
            >
              Note metodologiche e riferimenti
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </section>

        {/* 7. Quiet Closing Paragraph */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              {t.closing}
            </p>
          </div>
        </section>
      </main>

      <MethodologyDrawer
        open={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
        sections={t.methodologySections}
        sources={methodologySources}
        kicker={t.methodologyDrawer.kicker}
        title={t.methodologyDrawer.title}
        referencesLabel={t.methodologyDrawer.referencesLabel}
        closeLabel={t.methodologyDrawer.closeLabel}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        textScale={textScale}
        animations={animations}
        onThemeChange={setTheme}
        onTextScaleChange={setTextScale}
        onAnimationsChange={setAnimations}
        strings={t.settingsStrings}
      />

      {/* 8. Institutional Footer */}
      <InstitutionFooter links={footerLinks} disclaimer={disclaimer} />
    </div>
  )
}
