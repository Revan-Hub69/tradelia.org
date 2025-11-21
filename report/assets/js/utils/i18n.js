// /report/assets/js/utils/i18n.js
// Sistema Internazionalizzazione (i18n) - Multilingua
// Versione 2025 - Supporto IT/EN

import Logger from './logger.js';
import { userPreferences } from './user-preferences.js';

// ===== TRADUZIONI =====
const TRANSLATIONS = {
  it: {
    // Navigazione
    'nav.dashboard': 'Dashboard',
    'nav.index.title': 'Indice Moduli',
    'nav.breadcrumb.report': 'Report',
    'nav.search.placeholder': 'Cerca nel report...',
    'nav.search.noResults': 'Nessun risultato per',
    'nav.search.results': 'risultato',
    'nav.search.resultsPlural': 'risultati',
    'nav.search.found': 'trovato',
    'nav.search.foundPlural': 'trovati',
    'nav.search.resultType.title': 'Titolo',
    'nav.search.resultType.desc': 'Descrizione',
    'nav.search.resultType.metric': 'Metrica',
    'nav.home': 'Home',
    'nav.pricing': 'Prezzi',
    'nav.terms': 'Termini',
    'nav.privacy': 'Privacy',
    'nav.refund': 'Rimborsi',

    // Errori
    'error.loading': 'Errore di caricamento',
    'error.temporary': 'Si è verificato un errore temporaneo.',
    'error.reload': 'Ricarica pagina',

    // Moduli
    'module.status.active': 'ATTIVO',
    'module.status.hold': 'IN ATTESA',
    'module.status.review': 'IN REVISIONE',

    // Preferenze
    'prefs.language': 'Lingua',
    'prefs.language.it': 'Italiano',
    'prefs.language.en': 'English',

    // Comuni
    'common.close': 'Chiudi',
    'common.open': 'Apri',
    'common.cancel': 'Annulla',
    'common.save': 'Salva',
    'common.search': 'Cerca',
    'common.filter': 'Filtra',
    'common.export': 'Esporta',
    'common.loading': 'Caricamento...',

    // Report
    'report.freshness': 'Freshness',
    'report.version': 'Versione',
    'report.lastUpdate': 'Ultimo aggiornamento',

    // Metriche
    'metric.clickForDetails': 'Clicca per dettagli',
    'metric.keyMetric': 'Metrica Chiave',

    // Export
    'export.csv': 'Esporta CSV',
    'export.json': 'Esporta JSON',
    'export.pdf': 'Esporta PDF',
    'export.selectModules': 'Seleziona moduli da esportare',
    'export.success': 'Export completato con successo',
    'export.error': "Errore durante l'export",

    // Share
    'share.copy': 'Copia',
    'share.copied': 'Copiato!',

    // Filtri
    'filter.byModule': 'Filtra per modulo',
    'filter.byDate': 'Filtra per data',
    'filter.byMetric': 'Filtra per metrica',
    'filter.all': 'Tutti',
    'filter.clear': 'Rimuovi filtri',

    // Mifid Banner
    'mifid.banner.title': 'Informativa legale',
    'mifid.banner.message':
      'Questo sito ha finalità esclusivamente educativa e informativa. Non costituisce consulenza in materia di investimenti (MiFID II).',
    'mifid.banner.accept': 'Accetto e chiudi',
    'mifid.banner.mifid': 'Informativa MiFID',
    'mifid.banner.privacy': 'Privacy',
    'mifid.banner.close': 'Chiudi',
    'mifid.banner.continue': 'Continuando dichiari di aver letto e compreso le informative.',

    // Homepage
    'home.hero.badge': 'Progetto Indipendente',
    'home.hero.title.line1': 'Analisi Finanziaria',
    'home.hero.title.line2': 'Accademica',
    'home.hero.description':
      'Tradelia AI sviluppa <strong>analisi finanziarie modulari</strong> attraverso prompt proprietari e <strong>metodologia accademica scientifica</strong>. Strumenti didattici per comprendere mercati, rischi e correlazioni, con piena consapevolezza dei <strong>limiti tecnici e legali</strong> delle AI.',
    'home.hero.feature.analysis': 'Potenza Analitica',
    'home.hero.feature.analysis.desc':
      'Analisi tecnica, macro e fondamentale integrate in modelli multilayer',
    'home.hero.feature.report': 'Report Accademici',
    'home.hero.feature.report.desc':
      'Report dettagliati con metodologia accademica e conformità MiFID II',
    'home.hero.feature.education': 'Educazione Finanziaria',
    'home.hero.feature.education.desc':
      'Glossario, tutorial e strumenti educativi per trader e investitori',
    'home.hero.disclaimer':
      "Le analisi di Tradelia AI sono a scopo esclusivamente <strong>didattico</strong>. Le <strong>intelligenze artificiali</strong> non memorizzano dati, non tracciano l'utente e possono contenere errori. Non costituiscono <strong>consulenza finanziaria</strong> e non sostituiscono un professionista abilitato.",

    // Footer
    'footer.about.title': 'Chi Siamo',
    'footer.about.desc':
      'Tradelia AI sviluppa analisi finanziarie modulari attraverso prompt proprietari e metodologia accademica scientifica.',
    'footer.legal.title': 'Compliance & Risk',
    'footer.legal.disclaimer1':
      '<strong>Non è consulenza in materia di investimenti</strong> (MiFID II / ESMA / CONSOB)',
    'footer.legal.disclaimer2':
      'Tradelia AI non è un intermediario autorizzato; <strong>non gestisce capitali né esegue ordini</strong>',
    'footer.legal.disclaimer3':
      '<strong>Rischio di perdita totale o parziale del capitale</strong> — investire comporta rischi',
    'footer.legal.disclaimer4':
      'Le informazioni hanno <strong>scopo puramente informativo e formativo</strong> — non costituiscono raccomandazione personalizzata',
    'footer.legal.mifid': 'Informativa MiFID',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Termini di Servizio',
    'footer.legal.refund': 'Politica di Rimborso',
    'footer.contact.title': 'Contatti',
    'footer.contact.email': 'info@tradelia.org',
    'footer.copyright': 'Tutti i diritti riservati',
    'footer.social.title': 'Canali ufficiali',
    'footer.social.subtitle': 'Aggiornamenti su metodologia e release:',

    // Navigation
    'nav.brokers': 'Brokers',
    'nav.glossary': 'Glossario',

    // Dashboard
    'dashboard.title': 'Dashboard Abbonati',
    'dashboard.welcome': 'Benvenuto',
    'dashboard.login.title': 'Dashboard Abbonati',
    'dashboard.login.subtitle': 'Accedi per vedere tutti i report e votare i titoli',
    'dashboard.login.email': 'Email',
    'dashboard.login.password': 'Password',
    'dashboard.login.submit': 'Accedi',
    'dashboard.login.demo': 'Login Demo',
    'dashboard.login.forgotPassword': 'Password dimenticata?',
    'dashboard.resetPassword.title': 'Recupera Password',
    'dashboard.resetPassword.subtitle':
      'Inserisci la tua email per ricevere il link di ripristino password.',
    'dashboard.resetPassword.submit': 'Invia Link',
    'dashboard.subscription.title': 'Abbonamento Richiesto',
    'dashboard.subscription.subtitle':
      'Per accedere alla dashboard, è necessario un abbonamento attivo.',
    'dashboard.subscription.description':
      'Se hai già acquistato un abbonamento, attendi qualche istante che il sistema aggiorni il tuo status. Se non hai ancora un abbonamento, <a href="#">acquista qui</a>.',
    'dashboard.subscription.link': 'acquista qui',
    'dashboard.subscription.refresh': 'Aggiorna Status',
    'dashboard.logout': 'Esci',
    'dashboard.installApp': '📱 Installa App',
    'dashboard.tab.reports': 'Report',
    'dashboard.tab.voting': 'Votazione',
    'dashboard.filters.title': 'Filtri e Ricerca Avanzati',
    'dashboard.table.date': 'Data',
    'dashboard.table.ticker': 'Ticker',
    'dashboard.table.company': 'Company',
    'dashboard.table.type': 'Tipo',
    'dashboard.table.version': 'Versione AI',
    'dashboard.table.status': 'Status',
    'dashboard.table.link': 'Link',
    'dashboard.loading': 'Caricamento report...',
    'dashboard.voting.title': "Vota il titolo per l'analisi Swing Master di domani",
    'dashboard.voting.subtitle': 'I tuoi voti determinano quale titolo analizzeremo domani',
    'dashboard.voting.ticker': 'Ticker',
    'dashboard.voting.tickerPlaceholder': 'Es. AAPL',
    'dashboard.voting.votes': 'Voti (1-10)',
    'dashboard.voting.submit': 'Vota',
    'dashboard.voting.ranking': 'Ranking Attuale',
    'dashboard.voting.stats': 'Statistiche',
    'dashboard.table.noReports': 'Nessun report disponibile',
    'dashboard.table.openReport': 'Apri Report',
    'dashboard.table.error': 'Errore nel rendering dei report',

    // Glossario
    'glossary.title': 'Glossario Finanziario',
    'glossary.subtitle':
      'Oltre 200 termini finanziari spiegati con definizioni accademiche e spiegazioni AI',
    'glossary.search.placeholder': 'Cerca un termine...',
    'glossary.search.ariaLabel': 'Cerca nel glossario',
    'glossary.filter.universe': 'Universo',
    'glossary.filter.difficulty': 'Difficoltà',
    'glossary.filter.all': 'Tutti',
    'glossary.filter.allDifficulties': 'Tutte',
    'glossary.filter.trading': 'Trading',
    'glossary.filter.investments': 'Investimenti',
    'glossary.filter.finance': 'Finanza base',
    'glossary.empty': 'Nessun termine trovato',
    'glossary.empty.description': 'Prova a modificare i filtri o la ricerca',
    'glossary.stats': 'termini',
    'glossary.stats.available': 'termini disponibili',
    'glossary.stats.found': 'termini trovati',
    'glossary.stats.showing': 'Mostrando {count} di {total} termini',
    'glossary.back': 'Torna indietro',
    'glossary.term.definition': 'Definizione Accademica',
    'glossary.term.explanation': 'Spiegazione AI',
    'glossary.term.source': 'Fonte',
    'glossary.term.noInfo': 'Nessuna informazione disponibile nel glossario per questo termine.',

    // Metric Popup
    'metric.popup.close': 'Chiudi',
    'metric.popup.value': 'Valore:',
    'metric.popup.what': 'Cosa',
    'metric.popup.how': 'Come',
    'metric.popup.source': 'Fonte',
    'metric.popup.key': 'Key:',
    'metric.popup.openGlossary': 'Apri glossario',
    'metric.popup.noInfo': 'Nessuna informazione disponibile nel glossario per questa metrica.',

    // Module Header
    'module.header.sections': 'Sezioni',
    'module.header.aiSummary': 'Riassunto AI',
    'module.header.openTab': 'Apri',
    'module.header.mifid.default':
      'Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II).',

    // Metrics Drawer
    'metrics.drawer.empty': 'Nessuna metrica disponibile',
    'metrics.drawer.emptyGroup': 'Nessuna metrica in questo gruppo',
    'metrics.drawer.metric': 'metrica',
    'metrics.drawer.metrics': 'metriche',
    'metrics.drawer.all': 'Tutte le metriche',
    'metrics.drawer.search': 'Cerca metrica...',
    'metrics.drawer.category': 'Categoria',

    // Pricing
    'pricing.hero.title': 'Scegli il Piano Giusto per Te',
    'pricing.hero.subtitle':
      'Accesso completo a tutti i report, dashboard interattive e strumenti di analisi',
    'pricing.hero.description':
      '<strong>Tradelia AI</strong> è una piattaforma SaaS che fornisce analisi finanziarie professionali attraverso metodologia accademica AI. Offriamo report dettagliati su azioni, ETF, commodities e altri asset, con dashboard interattive e strumenti di analisi tecnica e fondamentale. Il servizio è progettato per trader, investitori e professionisti finanziari che cercano analisi dati approfondite e visualizzazioni professionali.',
    'pricing.card.title': 'Abbonamento Mensile',
    'pricing.card.trial': '14 giorni di prova gratuita',
    'pricing.card.period': '/mese',
    'pricing.card.description':
      'Prova gratuita per 14 giorni, poi €29/mese.<br>Annulla in qualsiasi momento.',
    'pricing.features.title': 'Cosa include:',
    'pricing.features.reports': 'Accesso completo a tutti i report',
    'pricing.features.dashboard': 'Dashboard interattive e personalizzabili',
    'pricing.features.voting': 'Sistema di votazione avanzato',
    'pricing.features.notifications': 'Notifiche push per nuovi report',
    'pricing.features.priority': 'Accesso prioritario a nuove funzionalità',
    'pricing.features.support': 'Supporto via email',
    'pricing.cta.button': 'Inizia Subito',
    'pricing.cta.trial': '14 giorni di prova gratuita',
    'pricing.cta.terms': 'Termini e Condizioni',
    'pricing.faq.title': 'Domande Frequenti',
    'pricing.faq.cancel.title': 'Posso cancellare in qualsiasi momento?',
    'pricing.faq.cancel.content':
      'Sì, puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard. Continuerai ad avere accesso fino alla fine del periodo già pagato.',
    'pricing.faq.trial.title': 'Come funziona la prova gratuita?',
    'pricing.faq.trial.content':
      "Offriamo <strong>14 giorni di prova gratuita</strong> senza impegno. Puoi accedere a tutte le funzionalità della dashboard senza pagare nulla. Al termine dei 14 giorni, se non cancelli, l'abbonamento si attiva automaticamente a €29/mese. Puoi cancellare in qualsiasi momento durante la prova gratuita senza costi.",
    'pricing.faq.payment.title': 'Come funziona il pagamento?',
    'pricing.faq.payment.content':
      "I pagamenti sono gestiti in modo sicuro tramite Paddle. L'abbonamento si rinnova automaticamente ogni mese. Puoi cambiare o cancellare in qualsiasi momento.",

    // Terms
    'terms.title': 'Termini di Servizio',
    'terms.lastUpdate': 'Ultimo aggiornamento:',
    'terms.section1.title': '1. Identità del Fornitore',
    'terms.section1.content1':
      '<strong>Tradelia AI</strong> ("noi", "nostro", "il Fornitore") è un progetto indipendente che fornisce servizi di analisi finanziaria attraverso piattaforma SaaS.',
    'terms.section1.content2':
      '<strong>Dati del Fornitore:</strong><br>Nome commerciale: Tradelia AI<br>Proprietario: Massimo Rodi<br>Email: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a><br>Sito web: <a href="https://tradelia.org" style="color: var(--brand-600); text-decoration: underline;">https://tradelia.org</a>',
    'terms.section2.title': '2. Accettazione dei Termini',
    'terms.section2.content':
      'Accedendo e utilizzando Tradelia AI ("il Servizio"), accetti di essere vincolato da questi Termini di Servizio. Se non accetti questi termini, non utilizzare il Servizio.',
    'terms.section3.title': '3. Descrizione del Servizio',
    'terms.section3.content1':
      'Tradelia AI è una piattaforma SaaS che fornisce strumenti di analisi dati e reportistica attraverso metodologia accademica. Il Servizio include dashboard interattive e strumenti di visualizzazione.',
    'terms.section3.content2':
      '<strong>IMPORTANTE:</strong> Il Servizio fornisce strumenti di analisi e visualizzazione dati. Non costituisce consulenza finanziaria, investimento o raccomandazione di acquisto/vendita. I dati e le analisi sono forniti "così come sono" senza garanzie di accuratezza o completezza.',
    'terms.section4.title': '4. Abbonamenti e Pagamenti',
    'terms.section4.content1':
      'L\'accesso al Servizio richiede un abbonamento a pagamento. I prezzi sono indicati nella pagina <a href="/pricing.html" style="color: var(--brand-600); text-decoration: underline;">Pricing</a> e possono essere modificati con preavviso di 30 giorni.',
    'terms.section4.content2':
      "<strong>Prova Gratuita:</strong> Offriamo un periodo di prova gratuita di 14 giorni. Durante questo periodo, hai accesso completo a tutte le funzionalità della dashboard senza alcun costo. Al termine dei 14 giorni, se non hai cancellato, l'abbonamento si attiva automaticamente e verrà addebitato il prezzo mensile (€29/mese).",
    'terms.section4.content3':
      "I pagamenti sono gestiti tramite Paddle. L'abbonamento si rinnova automaticamente ogni mese fino a cancellazione. Puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard, anche durante il periodo di prova gratuita, senza alcun costo.",
    'terms.section5.title': '5. Account e Sicurezza',
    'terms.section5.content':
      'Sei responsabile di mantenere la riservatezza delle credenziali del tuo account. Notifica immediatamente eventuali accessi non autorizzati.',
    'terms.section6.title': '6. Limitazioni di Responsabilità',
    'terms.section6.content':
      'Il Servizio è fornito "così come è" senza garanzie di alcun tipo. Tradelia AI non si assume responsabilità per:',
    'terms.section6.item1': "Perdite finanziarie derivanti dall'uso dei dati forniti",
    'terms.section6.item2': 'Inaccuratezze o errori nei dati o nelle analisi',
    'terms.section6.item3': 'Interruzioni o malfunzionamenti del Servizio',
    'terms.section7.title': '7. Proprietà Intellettuale',
    'terms.section7.content':
      'Tutti i contenuti del Servizio, inclusi ma non limitati a testi, grafici, loghi, icone, immagini e software, sono di proprietà di Tradelia AI o dei suoi fornitori di contenuti e sono protetti da leggi sul copyright e altre leggi sulla proprietà intellettuale.',
    'terms.section8.title': '8. Modifiche ai Termini',
    'terms.section8.content':
      "Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche entreranno in vigore 30 giorni dopo la pubblicazione. L'uso continuato del Servizio dopo le modifiche costituisce accettazione dei nuovi Termini.",
    'terms.section9.title': '9. Contatti',
    'terms.section9.content':
      'Per domande su questi Termini, contattaci a: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Privacy
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdate': 'Ultimo aggiornamento:',
    'privacy.section1.title': '1. Introduzione',
    'privacy.section1.content':
      'Tradelia AI ("noi", "nostro", "il Servizio") rispetta la tua privacy e si impegna a proteggere i tuoi dati personali. Questa Privacy Policy spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni quando utilizzi il nostro Servizio.',
    'privacy.section2.title': '2. Dati che Raccogliamo',
    'privacy.section2.content': 'Raccogliamo i seguenti tipi di dati:',
    'privacy.section2.item1':
      '<strong>Dati di account:</strong> Email, password (criptata), informazioni di abbonamento',
    'privacy.section2.item2':
      '<strong>Dati di utilizzo:</strong> Log di accesso, preferenze, interazioni con il Servizio',
    'privacy.section2.item3':
      '<strong>Dati tecnici:</strong> Indirizzo IP, tipo di browser, dispositivo',
    'privacy.section2.item4':
      '<strong>Dati di pagamento:</strong> Gestiti da Paddle (non conserviamo dati di carte di credito)',
    'privacy.section3.title': '3. Come Utilizziamo i Dati',
    'privacy.section3.content': 'Utilizziamo i tuoi dati per:',
    'privacy.section3.item1': 'Fornire e migliorare il Servizio',
    'privacy.section3.item2': 'Gestire il tuo account e abbonamento',
    'privacy.section3.item3': 'Inviare notifiche importanti sul Servizio',
    'privacy.section3.item4': 'Rispettare obblighi legali e normativi',
    'privacy.section4.title': '4. Condivisione dei Dati',
    'privacy.section4.content': 'Non vendiamo i tuoi dati personali. Condividiamo i dati solo con:',
    'privacy.section4.item1': '<strong>Paddle:</strong> Per gestione pagamenti e abbonamenti',
    'privacy.section4.item2':
      '<strong>Supabase:</strong> Per autenticazione e database (hosting sicuro)',
    'privacy.section4.item3': '<strong>Resend:</strong> Per invio email (solo se necessario)',
    'privacy.section4.item4': '<strong>Autorità legali:</strong> Se richiesto dalla legge',
    'privacy.section5.title': '5. Sicurezza dei Dati',
    'privacy.section5.content':
      'Implementiamo misure di sicurezza appropriate per proteggere i tuoi dati, inclusi:',
    'privacy.section5.item1': 'Crittografia dei dati in transito (HTTPS)',
    'privacy.section5.item2': 'Crittografia delle password (hashing sicuro)',
    'privacy.section5.item3': 'Accesso limitato ai dati personali',
    'privacy.section5.item4': 'Monitoraggio continuo per violazioni',
    'privacy.section6.title': '6. I Tuoi Diritti (GDPR)',
    'privacy.section6.content': 'Hai il diritto di:',
    'privacy.section6.item1': 'Accedere ai tuoi dati personali',
    'privacy.section6.item2': 'Correggere dati inaccurati',
    'privacy.section6.item3': 'Richiedere la cancellazione dei tuoi dati',
    'privacy.section6.item4': 'Opporti al trattamento dei tuoi dati',
    'privacy.section6.item5': 'Richiedere la portabilità dei dati',
    'privacy.section6.content2':
      'Per esercitare questi diritti, contattaci a: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',
    'privacy.section7.title': '7. Conservazione dei Dati',
    'privacy.section7.content':
      'Conserviamo i tuoi dati personali solo per il tempo necessario a fornire il Servizio o come richiesto dalla legge. Quando cancelli il tuo account, eliminiamo i tuoi dati entro 30 giorni, salvo obblighi legali di conservazione.',
    'privacy.section8.title': '8. Cookie e Tecnologie Simili',
    'privacy.section8.content':
      "Utilizziamo cookie e tecnologie simili per migliorare l'esperienza utente, analizzare l'utilizzo del Servizio e personalizzare i contenuti. Puoi gestire le preferenze dei cookie tramite le impostazioni del browser.",
    'privacy.section9.title': '9. Modifiche a questa Privacy Policy',
    'privacy.section9.content':
      'Possiamo aggiornare questa Privacy Policy periodicamente. Ti notificheremo eventuali modifiche significative via email o tramite il Servizio.',
    'privacy.section10.title': '10. Contatti',
    'privacy.section10.content':
      'Per domande su questa Privacy Policy, contattaci a: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Refund
    'refund.title': 'Politica di Rimborso',
    'refund.lastUpdate': 'Ultimo aggiornamento:',
    'refund.section1.title': '1. Prova Gratuita',
    'refund.section1.content1':
      'Offriamo un <strong>periodo di prova gratuita di 14 giorni</strong> per tutti i nuovi abbonamenti. Durante questo periodo, hai accesso completo a tutte le funzionalità della dashboard senza alcun costo. Puoi cancellare in qualsiasi momento durante la prova gratuita senza addebiti.',
    'refund.section1.content2':
      "Al termine dei 14 giorni, se non hai cancellato, l'abbonamento si attiva automaticamente e verrà addebitato il prezzo mensile (€29/mese).",
    'refund.section2.title': '2. Periodo di Rimborso',
    'refund.section2.content':
      'Se hai già pagato e non sei soddisfatto del Servizio, puoi richiedere un rimborso completo entro <strong>14 giorni dalla data del primo addebito</strong> (dopo il periodo di prova gratuita).',
    'refund.section3.title': '3. Come Richiedere un Rimborso',
    'refund.section3.content':
      'Per richiedere un rimborso, contattaci a: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',
    'refund.section3.content2': 'Includi nella richiesta:',
    'refund.section3.item1': "Email associata all'account",
    'refund.section3.item2': 'Data di sottoscrizione',
    'refund.section3.item3': 'Motivo della richiesta (opzionale ma apprezzato)',
    'refund.section4.title': '4. Processo di Rimborso',
    'refund.section4.content1':
      "Una volta ricevuta la richiesta, processeremo il rimborso entro <strong>5-7 giorni lavorativi</strong>. Il rimborso verrà accreditato sul metodo di pagamento originale utilizzato per l'acquisto.",
    'refund.section4.content2':
      "Dopo il rimborso, il tuo account verrà disattivato e perderai l'accesso al Servizio.",
    'refund.section5.title': '5. Rimborsi Dopo il Periodo di Garanzia',
    'refund.section5.content':
      'Dopo i 14 giorni, i rimborsi non sono garantiti. Tuttavia, valuteremo ogni richiesta caso per caso in circostanze eccezionali (es. problemi tecnici gravi non risolti).',
    'refund.section6.title': "6. Cancellazione dell'Abbonamento",
    'refund.section6.content1':
      'Puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard, anche durante il periodo di prova gratuita. La cancellazione durante la prova gratuita non comporta alcun addebito.',
    'refund.section6.content2':
      'Se cancelli dopo il periodo di prova, la cancellazione impedirà il rinnovo automatico, ma <strong>non</strong> comporta un rimborso per il periodo già pagato. Continuerai ad avere accesso al Servizio fino alla fine del periodo di abbonamento già pagato.',
    'refund.section7.title': '7. Contatti',
    'refund.section7.content':
      'Per domande sulla politica di rimborso, contattaci a: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Legal Overlay
    'legal.overlay.title': 'Informativa legale',
    'legal.overlay.close': 'Chiudi',
    'legal.overlay.tab.mifid': 'Informativa MiFID',
    'legal.overlay.tab.privacy': 'Privacy',
    'legal.overlay.accept': 'Accetto e chiudi',
    'legal.overlay.continue': 'Continuando dichiari di aver letto e compreso le informative.',
    'legal.mifid.purpose.title': 'Finalità del materiale',
    'legal.mifid.purpose.content':
      'Il presente sito web e tutti i suoi contenuti (analisi, moduli AI, report, articoli e percorsi formativi) hanno esclusiva finalità <strong>informativa e didattica</strong>. Non costituiscono consulenza in materia di investimenti, raccomandazione personalizzata, sollecitazione al pubblico risparmio o ricerca in investimento ai sensi della normativa <strong>MiFID II / ESMA</strong>.',
    'legal.mifid.educational.title': 'Natura educativa',
    'legal.mifid.educational.content':
      "Tradelia AI è una piattaforma di <strong>educazione finanziaria accademica</strong>. Tutti i contenuti, inclusi moduli AI proprietari, analisi di mercato, report e strumenti didattici, sono progettati esclusivamente per finalità formative e di ricerca. Non viene svolta verifica di adeguatezza/appropriatezza, profilo di rischio o obiettivi finanziari dell'utente.",
    'legal.mifid.risks.title': 'Rischi',
    'legal.mifid.risks.item1':
      'I mercati finanziari comportano <strong>rischio di perdita, anche totale, del capitale</strong>.',
    'legal.mifid.risks.item2':
      'Prodotti a leva/derivati (opzioni, futures, CFD) possono amplificare perdite oltre il capitale iniziale.',
    'legal.mifid.risks.item3': 'Rendimenti passati non sono indicativi di risultati futuri.',
    'legal.mifid.risks.item4':
      'Le informazioni fornite non devono essere considerate come garanzie di rendimento.',
    'legal.mifid.data.title': 'Dati e fonti',
    'legal.mifid.data.item1':
      'Dati e serie storiche possono essere soggetti a ritardi, revisioni o errori; i timestamp potrebbero non riflettere il "tempo reale".',
    'legal.mifid.data.item2':
      'Le fonti includono provider ritenuti affidabili (Tier-1); non si garantisce esattezza/completezza assoluta.',
    'legal.mifid.data.item3':
      'Le analisi AI sono generate automaticamente e possono contenere errori o imprecisioni.',
    'legal.mifid.independence.title': 'Conflitti e indipendenza',
    'legal.mifid.independence.item1':
      '<strong>Tradelia AI è indipendente</strong>: non esegue ordini, non gestisce capitali, non raccoglie depositi e non opera come intermediario finanziario.',
    'legal.mifid.independence.item2':
      "Non sono note situazioni di conflitto d'interesse rilevanti nella produzione del materiale.",
    'legal.mifid.independence.item3':
      'Eventuali link a piattaforme o servizi esterni sono forniti a solo scopo informativo.',
    'legal.mifid.limitations.title': 'Limitazioni e responsabilità',
    'legal.mifid.limitations.item1':
      "Le informazioni non sostituiscono il giudizio dell'utente né la consulenza di un <strong>intermediario autorizzato</strong>.",
    'legal.mifid.limitations.item2':
      "L'utente è responsabile delle proprie decisioni di investimento.",
    'legal.mifid.limitations.item3':
      "L'uso del sito è vietato laddove non conforme alle leggi locali.",
    'legal.mifid.limitations.item4':
      "Tradelia AI non si assume alcuna responsabilità per perdite derivanti dall'uso delle informazioni fornite.",
    'legal.privacy.principles.title': 'Principi',
    'legal.privacy.principles.content':
      'Adottiamo un\'impostazione "privacy-first": minimizzazione dei dati e assenza di tracciamento pubblicitario.',
    'legal.privacy.data.title': 'Dati trattati',
    'legal.privacy.data.item1':
      'Nessuna raccolta di dati personali identificativi tramite questa pagina.',
    'legal.privacy.data.item2':
      'Uso di <code>localStorage</code> per preferenze (tema) e consenso legale.',
    'legal.privacy.data.item3': 'Eventuali log tecnici anonimi per sicurezza e diagnostica.',
    'legal.privacy.cookies.title': 'Cookie e analytics',
    'legal.privacy.cookies.item1':
      'Niente cookie di profilazione; eventuali analytics sono anonimizzati/aggregati.',
    'legal.privacy.cookies.item2': 'Nessuna condivisione con terze parti a fini commerciali.',
    'legal.privacy.rights.title': 'Diritti e contatti',
    'legal.privacy.rights.item1':
      'Per informazioni o esercizio diritti privacy, scrivi a <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.',
    'legal.privacy.rights.item2':
      'Il titolare potrà aggiornare questa informativa: controlla periodicamente le revisioni.',
  },

  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.index.title': 'Module Index',
    'nav.breadcrumb.report': 'Report',
    'nav.search.placeholder': 'Search in report...',
    'nav.search.noResults': 'No results for',
    'nav.search.results': 'result',
    'nav.search.resultsPlural': 'results',
    'nav.search.found': 'found',
    'nav.search.foundPlural': 'found',
    'nav.search.resultType.title': 'Title',
    'nav.search.resultType.desc': 'Description',
    'nav.search.resultType.metric': 'Metric',
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',
    'nav.refund': 'Refunds',

    // Errors
    'error.loading': 'Loading Error',
    'error.temporary': 'A temporary error occurred.',
    'error.reload': 'Reload page',

    // Modules
    'module.status.active': 'ACTIVE',
    'module.status.hold': 'HOLD',
    'module.status.review': 'REVIEW',

    // Preferences
    'prefs.language': 'Language',
    'prefs.language.it': 'Italiano',
    'prefs.language.en': 'English',

    // Common
    'common.close': 'Close',
    'common.open': 'Open',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',

    // Report
    'report.freshness': 'Freshness',
    'report.version': 'Version',
    'report.lastUpdate': 'Last update',

    // Metrics
    'metric.clickForDetails': 'Click for details',
    'metric.keyMetric': 'Key Metric',

    // Export
    'export.csv': 'Export CSV',
    'export.json': 'Export JSON',
    'export.pdf': 'Export PDF',
    'export.selectModules': 'Select modules to export',
    'export.success': 'Export completed successfully',
    'export.error': 'Error during export',

    // Share
    'share.copy': 'Copy',
    'share.copied': 'Copied!',

    // Filters
    'filter.byModule': 'Filter by module',
    'filter.byDate': 'Filter by date',
    'filter.byMetric': 'Filter by metric',
    'filter.all': 'All',
    'filter.clear': 'Clear filters',

    // Mifid Banner
    'mifid.banner.title': 'Legal information',
    'mifid.banner.message':
      'This site is for educational and informational purposes only. It does not constitute investment advice (MiFID II).',
    'mifid.banner.accept': 'Accept and close',
    'mifid.banner.mifid': 'MiFID Information',
    'mifid.banner.privacy': 'Privacy',
    'mifid.banner.close': 'Close',
    'mifid.banner.continue':
      'By continuing you declare that you have read and understood the information.',

    // Homepage
    'home.hero.badge': 'Independent Project',
    'home.hero.title.line1': 'Financial Analysis',
    'home.hero.title.line2': 'Academic',
    'home.hero.description':
      'Tradelia AI develops <strong>modular financial analysis</strong> through proprietary prompts and <strong>scientific academic methodology</strong>. Educational tools to understand markets, risks and correlations, with full awareness of the <strong>technical and legal limits</strong> of AI.',
    'home.hero.feature.analysis': 'Analytical Power',
    'home.hero.feature.analysis.desc':
      'Technical, macro and fundamental analysis integrated into multilayer models',
    'home.hero.feature.report': 'Academic Reports',
    'home.hero.feature.report.desc':
      'Detailed reports with academic methodology and MiFID II compliance',
    'home.hero.feature.education': 'Financial Education',
    'home.hero.feature.education.desc':
      'Glossary, tutorials and educational tools for traders and investors',
    'home.hero.disclaimer':
      'Tradelia AI analyses are for <strong>educational</strong> purposes only. <strong>Artificial intelligences</strong> do not store data, do not track users and may contain errors. They do not constitute <strong>financial advice</strong> and do not replace a licensed professional.',

    // Footer
    'footer.about.title': 'About Us',
    'footer.about.desc':
      'Tradelia AI develops modular financial analysis through proprietary prompts and scientific academic methodology.',
    'footer.legal.title': 'Compliance & Risk',
    'footer.legal.disclaimer1': '<strong>Not investment advice</strong> (MiFID II / ESMA / CONSOB)',
    'footer.legal.disclaimer2':
      'Tradelia AI is not an authorized intermediary; <strong>does not manage capital or execute orders</strong>',
    'footer.legal.disclaimer3':
      '<strong>Risk of total or partial loss of capital</strong> — investing involves risks',
    'footer.legal.disclaimer4':
      'Information is for <strong>informational and educational purposes only</strong> — does not constitute personalized recommendation',
    'footer.legal.mifid': 'MiFID Information',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.terms': 'Terms of Service',
    'footer.legal.refund': 'Refund Policy',
    'footer.contact.title': 'Contact',
    'footer.contact.email': 'info@tradelia.org',
    'footer.copyright': 'All rights reserved',
    'footer.social.title': 'Official Channels',
    'footer.social.subtitle': 'Updates on methodology and releases:',

    // Navigation
    'nav.brokers': 'Brokers',
    'nav.glossary': 'Glossary',

    // Dashboard
    'dashboard.title': 'Subscriber Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.login.title': 'Subscriber Dashboard',
    'dashboard.login.subtitle': 'Sign in to view all reports and vote on stocks',
    'dashboard.login.email': 'Email',
    'dashboard.login.password': 'Password',
    'dashboard.login.submit': 'Sign In',
    'dashboard.login.demo': 'Demo Login',
    'dashboard.login.forgotPassword': 'Forgot password?',
    'dashboard.resetPassword.title': 'Recover Password',
    'dashboard.resetPassword.subtitle': 'Enter your email to receive the password reset link.',
    'dashboard.resetPassword.submit': 'Send Link',
    'dashboard.subscription.title': 'Subscription Required',
    'dashboard.subscription.subtitle':
      'An active subscription is required to access the dashboard.',
    'dashboard.subscription.description':
      'If you have already purchased a subscription, wait a moment for the system to update your status. If you don\'t have a subscription yet, <a href="#">buy here</a>.',
    'dashboard.subscription.link': 'buy here',
    'dashboard.subscription.refresh': 'Refresh Status',
    'dashboard.logout': 'Sign Out',
    'dashboard.installApp': '📱 Install App',
    'dashboard.tab.reports': 'Reports',
    'dashboard.tab.voting': 'Voting',
    'dashboard.filters.title': 'Advanced Filters and Search',
    'dashboard.table.date': 'Date',
    'dashboard.table.ticker': 'Ticker',
    'dashboard.table.company': 'Company',
    'dashboard.table.type': 'Type',
    'dashboard.table.version': 'AI Version',
    'dashboard.table.status': 'Status',
    'dashboard.table.link': 'Link',
    'dashboard.loading': 'Loading reports...',
    'dashboard.voting.title': "Vote for tomorrow's Swing Master analysis stock",
    'dashboard.voting.subtitle': 'Your votes determine which stock we will analyze tomorrow',
    'dashboard.voting.ticker': 'Ticker',
    'dashboard.voting.tickerPlaceholder': 'E.g. AAPL',
    'dashboard.voting.votes': 'Votes (1-10)',
    'dashboard.voting.submit': 'Vote',
    'dashboard.voting.ranking': 'Current Ranking',
    'dashboard.voting.stats': 'Statistics',
    'dashboard.table.noReports': 'No reports available',
    'dashboard.table.openReport': 'Open Report',
    'dashboard.table.error': 'Error rendering reports',

    // Glossario
    'glossary.title': 'Financial Glossary',
    'glossary.subtitle':
      'Over 200 financial terms explained with academic definitions and AI explanations',
    'glossary.search.placeholder': 'Search for a term...',
    'glossary.search.ariaLabel': 'Search in glossary',
    'glossary.filter.universe': 'Universe',
    'glossary.filter.difficulty': 'Difficulty',
    'glossary.filter.all': 'All',
    'glossary.filter.allDifficulties': 'All',
    'glossary.filter.trading': 'Trading',
    'glossary.filter.investments': 'Investments',
    'glossary.filter.finance': 'Basic Finance',
    'glossary.empty': 'No terms found',
    'glossary.empty.description': 'Try adjusting the filters or search',
    'glossary.stats': 'terms',
    'glossary.stats.available': 'terms available',
    'glossary.stats.found': 'terms found',
    'glossary.stats.showing': 'Showing {count} of {total} terms',
    'glossary.back': 'Go back',
    'glossary.term.definition': 'Academic Definition',
    'glossary.term.explanation': 'AI Explanation',
    'glossary.term.source': 'Source',
    'glossary.term.noInfo': 'No information available in the glossary for this term.',

    // Metric Popup
    'metric.popup.close': 'Close',
    'metric.popup.value': 'Value:',
    'metric.popup.what': 'What',
    'metric.popup.how': 'How',
    'metric.popup.source': 'Source',
    'metric.popup.key': 'Key:',
    'metric.popup.openGlossary': 'Open glossary',
    'metric.popup.noInfo': 'No information available in the glossary for this metric.',

    // Module Header
    'module.header.sections': 'Sections',
    'module.header.aiSummary': 'AI Summary',
    'module.header.openTab': 'Open',
    'module.header.mifid.default':
      'Output for educational/informational purposes (3–10 day horizon). Does not constitute advice or recommendation (MiFID II).',

    // Metrics Drawer
    'metrics.drawer.empty': 'No metrics available',
    'metrics.drawer.emptyGroup': 'No metrics in this group',
    'metrics.drawer.metric': 'metric',
    'metrics.drawer.metrics': 'metrics',
    'metrics.drawer.all': 'All metrics',
    'metrics.drawer.search': 'Search metric...',
    'metrics.drawer.category': 'Category',

    // Pricing
    'pricing.hero.title': 'Choose the Right Plan for You',
    'pricing.hero.subtitle':
      'Full access to all reports, interactive dashboards and analysis tools',
    'pricing.hero.description':
      '<strong>Tradelia AI</strong> is a SaaS platform that provides professional financial analysis through academic AI methodology. We offer detailed reports on stocks, ETFs, commodities and other assets, with interactive dashboards and technical and fundamental analysis tools. The service is designed for traders, investors and financial professionals seeking in-depth data analysis and professional visualizations.',
    'pricing.card.title': 'Monthly Subscription',
    'pricing.card.trial': '14-day free trial',
    'pricing.card.period': '/month',
    'pricing.card.description': 'Free trial for 14 days, then €29/month.<br>Cancel anytime.',
    'pricing.features.title': "What's included:",
    'pricing.features.reports': 'Full access to all reports',
    'pricing.features.dashboard': 'Interactive and customizable dashboards',
    'pricing.features.voting': 'Advanced voting system',
    'pricing.features.notifications': 'Push notifications for new reports',
    'pricing.features.priority': 'Priority access to new features',
    'pricing.features.support': 'Email support',
    'pricing.cta.button': 'Get Started',
    'pricing.cta.trial': '14-day free trial',
    'pricing.cta.terms': 'Terms and Conditions',
    'pricing.faq.title': 'Frequently Asked Questions',
    'pricing.faq.cancel.title': 'Can I cancel at any time?',
    'pricing.faq.cancel.content':
      'Yes, you can cancel your subscription at any time from the dashboard. You will continue to have access until the end of the period already paid.',
    'pricing.faq.trial.title': 'How does the free trial work?',
    'pricing.faq.trial.content':
      "We offer a <strong>14-day free trial</strong> with no commitment. You can access all dashboard features without paying anything. At the end of 14 days, if you don't cancel, the subscription automatically activates at €29/month. You can cancel at any time during the free trial at no cost.",
    'pricing.faq.payment.title': 'How does payment work?',
    'pricing.faq.payment.content':
      'Payments are securely processed through Paddle. The subscription automatically renews every month. You can change or cancel at any time.',

    // Terms
    'terms.title': 'Terms of Service',
    'terms.lastUpdate': 'Last updated:',
    'terms.section1.title': '1. Provider Identity',
    'terms.section1.content1':
      '<strong>Tradelia AI</strong> ("we", "our", "the Provider") is an independent project that provides financial analysis services through a SaaS platform.',
    'terms.section1.content2':
      '<strong>Provider Data:</strong><br>Trade name: Tradelia AI<br>Owner: Massimo Rodi<br>Email: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a><br>Website: <a href="https://tradelia.org" style="color: var(--brand-600); text-decoration: underline;">https://tradelia.org</a>',
    'terms.section2.title': '2. Acceptance of Terms',
    'terms.section2.content':
      'By accessing and using Tradelia AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.',
    'terms.section3.title': '3. Service Description',
    'terms.section3.content1':
      'Tradelia AI is a SaaS platform that provides data analysis tools and reporting through academic methodology. The Service includes interactive dashboards and visualization tools.',
    'terms.section3.content2':
      '<strong>IMPORTANT:</strong> The Service provides data analysis and visualization tools. It does not constitute financial advice, investment or purchase/sale recommendation. Data and analyses are provided "as is" without warranties of accuracy or completeness.',
    'terms.section4.title': '4. Subscriptions and Payments',
    'terms.section4.content1':
      'Access to the Service requires a paid subscription. Prices are indicated on the <a href="/pricing.html" style="color: var(--brand-600); text-decoration: underline;">Pricing</a> page and may be changed with 30 days notice.',
    'terms.section4.content2':
      '<strong>Free Trial:</strong> We offer a 14-day free trial period. During this period, you have full access to all dashboard features at no cost. At the end of 14 days, if you have not cancelled, the subscription automatically activates and the monthly price (€29/month) will be charged.',
    'terms.section4.content3':
      'Payments are processed through Paddle. The subscription automatically renews every month until cancellation. You can cancel your subscription at any time from the dashboard, including during the free trial period, at no cost.',
    'terms.section5.title': '5. Account and Security',
    'terms.section5.content':
      'You are responsible for maintaining the confidentiality of your account credentials. Immediately notify us of any unauthorized access.',
    'terms.section6.title': '6. Liability Limitations',
    'terms.section6.content':
      'The Service is provided "as is" without warranties of any kind. Tradelia AI assumes no responsibility for:',
    'terms.section6.item1': 'Financial losses resulting from use of the data provided',
    'terms.section6.item2': 'Inaccuracies or errors in data or analyses',
    'terms.section6.item3': 'Service interruptions or malfunctions',
    'terms.section7.title': '7. Intellectual Property',
    'terms.section7.content':
      'All Service content, including but not limited to texts, graphics, logos, icons, images and software, is the property of Tradelia AI or its content providers and is protected by copyright laws and other intellectual property laws.',
    'terms.section8.title': '8. Changes to Terms',
    'terms.section8.content':
      'We reserve the right to modify these Terms at any time. Changes will take effect 30 days after publication. Continued use of the Service after changes constitutes acceptance of the new Terms.',
    'terms.section9.title': '9. Contact',
    'terms.section9.content':
      'For questions about these Terms, contact us at: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Privacy
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdate': 'Last updated:',
    'privacy.section1.title': '1. Introduction',
    'privacy.section1.content':
      'Tradelia AI ("we", "our", "the Service") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use and protect your information when you use our Service.',
    'privacy.section2.title': '2. Data We Collect',
    'privacy.section2.content': 'We collect the following types of data:',
    'privacy.section2.item1':
      '<strong>Account data:</strong> Email, password (encrypted), subscription information',
    'privacy.section2.item2':
      '<strong>Usage data:</strong> Access logs, preferences, Service interactions',
    'privacy.section2.item3': '<strong>Technical data:</strong> IP address, browser type, device',
    'privacy.section2.item4':
      '<strong>Payment data:</strong> Processed by Paddle (we do not store credit card data)',
    'privacy.section3.title': '3. How We Use Data',
    'privacy.section3.content': 'We use your data to:',
    'privacy.section3.item1': 'Provide and improve the Service',
    'privacy.section3.item2': 'Manage your account and subscription',
    'privacy.section3.item3': 'Send important Service notifications',
    'privacy.section3.item4': 'Comply with legal and regulatory obligations',
    'privacy.section4.title': '4. Data Sharing',
    'privacy.section4.content': 'We do not sell your personal data. We share data only with:',
    'privacy.section4.item1': '<strong>Paddle:</strong> For payment and subscription management',
    'privacy.section4.item2':
      '<strong>Supabase:</strong> For authentication and database (secure hosting)',
    'privacy.section4.item3': '<strong>Resend:</strong> For email sending (only if necessary)',
    'privacy.section4.item4': '<strong>Legal authorities:</strong> If required by law',
    'privacy.section5.title': '5. Data Security',
    'privacy.section5.content':
      'We implement appropriate security measures to protect your data, including:',
    'privacy.section5.item1': 'Data encryption in transit (HTTPS)',
    'privacy.section5.item2': 'Password encryption (secure hashing)',
    'privacy.section5.item3': 'Limited access to personal data',
    'privacy.section5.item4': 'Continuous monitoring for breaches',
    'privacy.section6.title': '6. Your Rights (GDPR)',
    'privacy.section6.content': 'You have the right to:',
    'privacy.section6.item1': 'Access your personal data',
    'privacy.section6.item2': 'Correct inaccurate data',
    'privacy.section6.item3': 'Request deletion of your data',
    'privacy.section6.item4': 'Object to processing of your data',
    'privacy.section6.item5': 'Request data portability',
    'privacy.section6.content2':
      'To exercise these rights, contact us at: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',
    'privacy.section7.title': '7. Data Retention',
    'privacy.section7.content':
      'We retain your personal data only for as long as necessary to provide the Service or as required by law. When you delete your account, we delete your data within 30 days, except for legal retention obligations.',
    'privacy.section8.title': '8. Cookies and Similar Technologies',
    'privacy.section8.content':
      'We use cookies and similar technologies to improve user experience, analyze Service usage and customize content. You can manage cookie preferences through your browser settings.',
    'privacy.section9.title': '9. Changes to this Privacy Policy',
    'privacy.section9.content':
      'We may update this Privacy Policy periodically. We will notify you of any significant changes via email or through the Service.',
    'privacy.section10.title': '10. Contact',
    'privacy.section10.content':
      'For questions about this Privacy Policy, contact us at: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Refund
    'refund.title': 'Refund Policy',
    'refund.lastUpdate': 'Last updated:',
    'refund.section1.title': '1. Free Trial',
    'refund.section1.content1':
      'We offer a <strong>14-day free trial period</strong> for all new subscriptions. During this period, you have full access to all dashboard features at no cost. You can cancel at any time during the free trial with no charges.',
    'refund.section1.content2':
      'At the end of 14 days, if you have not cancelled, the subscription automatically activates and the monthly price (€29/month) will be charged.',
    'refund.section2.title': '2. Refund Period',
    'refund.section2.content':
      'If you have already paid and are not satisfied with the Service, you can request a full refund within <strong>14 days of the first charge date</strong> (after the free trial period).',
    'refund.section3.title': '3. How to Request a Refund',
    'refund.section3.content':
      'To request a refund, contact us at: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',
    'refund.section3.content2': 'Include in your request:',
    'refund.section3.item1': 'Email associated with the account',
    'refund.section3.item2': 'Subscription date',
    'refund.section3.item3': 'Reason for request (optional but appreciated)',
    'refund.section4.title': '4. Refund Process',
    'refund.section4.content1':
      'Once we receive the request, we will process the refund within <strong>5-7 business days</strong>. The refund will be credited to the original payment method used for the purchase.',
    'refund.section4.content2':
      'After the refund, your account will be deactivated and you will lose access to the Service.',
    'refund.section5.title': '5. Refunds After Guarantee Period',
    'refund.section5.content':
      'After 14 days, refunds are not guaranteed. However, we will evaluate each request on a case-by-case basis in exceptional circumstances (e.g. serious unresolved technical issues).',
    'refund.section6.title': '6. Subscription Cancellation',
    'refund.section6.content1':
      'You can cancel your subscription at any time from the dashboard, including during the free trial period. Cancellation during the free trial does not result in any charges.',
    'refund.section6.content2':
      'If you cancel after the trial period, cancellation will prevent automatic renewal, but does <strong>not</strong> result in a refund for the period already paid. You will continue to have access to the Service until the end of the subscription period already paid.',
    'refund.section7.title': '7. Contact',
    'refund.section7.content':
      'For questions about the refund policy, contact us at: <a href="mailto:info@tradelia.org" style="color: var(--brand-600); text-decoration: underline;">info@tradelia.org</a>',

    // Legal Overlay
    'legal.overlay.title': 'Legal information',
    'legal.overlay.close': 'Close',
    'legal.overlay.tab.mifid': 'MiFID Information',
    'legal.overlay.tab.privacy': 'Privacy',
    'legal.overlay.accept': 'Accept and close',
    'legal.overlay.continue':
      'By continuing you declare that you have read and understood the information.',
    'legal.mifid.purpose.title': 'Purpose of the material',
    'legal.mifid.purpose.content':
      'This website and all its content (analyses, AI modules, reports, articles, glossary) are for <strong>informational and educational purposes only</strong>. They do not constitute investment advice, personalized recommendation, public savings solicitation or investment research under <strong>MiFID II / ESMA</strong> regulations.',
    'legal.mifid.educational.title': 'Educational nature',
    'legal.mifid.educational.content':
      'Tradelia AI is a platform for <strong>academic financial education</strong>. All content, including proprietary AI modules, market analyses, reports and educational tools, are designed exclusively for educational and research purposes. No adequacy/appropriateness verification, risk profile or user financial objectives are performed.',
    'legal.mifid.risks.title': 'Risks',
    'legal.mifid.risks.item1':
      'Financial markets involve <strong>risk of loss, including total loss of capital</strong>.',
    'legal.mifid.risks.item2':
      'Leveraged/derivative products (options, futures, CFDs) can amplify losses beyond initial capital.',
    'legal.mifid.risks.item3': 'Past returns are not indicative of future results.',
    'legal.mifid.risks.item4':
      'The information provided should not be considered as guarantees of returns.',
    'legal.mifid.data.title': 'Data and sources',
    'legal.mifid.data.item1':
      'Data and historical series may be subject to delays, revisions or errors; timestamps may not reflect "real time".',
    'legal.mifid.data.item2':
      'Sources include providers considered reliable (Tier-1); absolute accuracy/completeness is not guaranteed.',
    'legal.mifid.data.item3':
      'AI analyses are automatically generated and may contain errors or inaccuracies.',
    'legal.mifid.independence.title': 'Conflicts and independence',
    'legal.mifid.independence.item1':
      '<strong>Tradelia AI is independent</strong>: it does not execute orders, manage capital, collect deposits or operate as a financial intermediary.',
    'legal.mifid.independence.item2':
      'No known relevant conflict of interest situations in material production.',
    'legal.mifid.independence.item3':
      'Any links to external platforms or services are provided for informational purposes only.',
    'legal.mifid.limitations.title': 'Limitations and liability',
    'legal.mifid.limitations.item1':
      'Information does not replace user judgment nor the advice of an <strong>authorized intermediary</strong>.',
    'legal.mifid.limitations.item2': 'The user is responsible for their own investment decisions.',
    'legal.mifid.limitations.item3':
      'Use of the site is prohibited where not compliant with local laws.',
    'legal.mifid.limitations.item4':
      'Tradelia AI assumes no responsibility for losses resulting from use of the information provided.',
    'legal.privacy.principles.title': 'Principles',
    'legal.privacy.principles.content':
      'We adopt a "privacy-first" approach: data minimization and no advertising tracking.',
    'legal.privacy.data.title': 'Data processed',
    'legal.privacy.data.item1': 'No collection of personally identifiable data through this page.',
    'legal.privacy.data.item2':
      'Use of <code>localStorage</code> for preferences (theme) and legal consent.',
    'legal.privacy.data.item3': 'Any anonymous technical logs for security and diagnostics.',
    'legal.privacy.cookies.title': 'Cookies and analytics',
    'legal.privacy.cookies.item1': 'No profiling cookies; any analytics are anonymized/aggregated.',
    'legal.privacy.cookies.item2': 'No sharing with third parties for commercial purposes.',
    'legal.privacy.rights.title': 'Rights and contacts',
    'legal.privacy.rights.item1':
      'For information or to exercise privacy rights, write to <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>.',
    'legal.privacy.rights.item2':
      'The data controller may update this information: check revisions periodically.',
  },
};

// ===== UTILITIES =====
function detectLanguage() {
  // 1. Preferenze utente (salvate in localStorage)
  const userLang = userPreferences.get('language');
  if (userLang && TRANSLATIONS[userLang]) {
    Logger.debug('i18n', `Lingua da preferenze utente: ${userLang}`);
    return userLang;
  }

  // 2. Browser language (rilevamento automatico)
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'it';
    const langCode = browserLang.split('-')[0].toLowerCase();
    if (TRANSLATIONS[langCode]) {
      Logger.debug('i18n', `Lingua da browser: ${langCode} (${browserLang})`);
      // Salva automaticamente la lingua del browser come preferenza
      userPreferences.set('language', langCode);
      return langCode;
    }
  } catch (e) {
    Logger.warn('i18n', 'Errore rilevamento lingua browser', e);
  }

  // 3. Default: italiano
  Logger.debug('i18n', 'Lingua default: it');
  return 'it';
}

function getCurrentLanguage() {
  // FORZATO ITALIANO - Sistema traduzione disabilitato
  return 'it';
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) {
    Logger.warn('i18n', `Lingua non supportata: ${lang}`);
    return false;
  }

  userPreferences.set('language', lang);
  applyLanguage(lang);
  return true;
}

function applyLanguage(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', 'it');
  html.setAttribute('data-lang', 'it');

  // Sistema traduzione disabilitato - non emettere eventi
  Logger.debug('i18n', 'Lingua forzata: italiano');
}

// ===== PUBLIC API =====
export const i18n = {
  /**
   * Inizializza sistema i18n
   * @returns {string} Lingua corrente
   */
  init() {
    const lang = getCurrentLanguage();
    applyLanguage(lang);
    return lang;
  },

  /**
   * Ottieni traduzione
   * @param {string} key - Chiave traduzione
   * @param {Object} params - Parametri per sostituzione
   * @returns {string} Testo tradotto
   */
  t(key, params = {}) {
    const lang = getCurrentLanguage();
    const translation = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['it']?.[key] || key;

    // Sostituzione parametri {{param}}
    let result = translation;
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });

    return result;
  },

  /**
   * Ottieni traduzione con pluralizzazione
   * @param {string} key - Chiave traduzione (singolare)
   * @param {number} count - Numero per pluralizzazione
   * @param {Object} params - Parametri aggiuntivi
   * @returns {string} Testo tradotto
   */
  tPlural(key, count, params = {}) {
    const lang = getCurrentLanguage();
    const isPlural = count !== 1;
    const pluralKey = `${key}Plural`;

    // Prova prima con chiave pluralizzata
    if (isPlural && TRANSLATIONS[lang]?.[pluralKey]) {
      return this.t(pluralKey, { ...params, count });
    }

    // Altrimenti usa chiave normale
    return this.t(key, { ...params, count });
  },

  /**
   * Cambia lingua
   * @param {string} lang - Codice lingua (it, en)
   * @returns {boolean} Successo
   */
  setLanguage(lang) {
    // Sistema traduzione disabilitato - sempre italiano
    return true;
  },

  /**
   * Ottieni lingua corrente
   * @returns {string} Codice lingua
   */
  getLanguage() {
    return getCurrentLanguage();
  },

  /**
   * Ottieni lingue disponibili
   * @returns {Array<string>} Array codici lingue
   */
  getAvailableLanguages() {
    return Object.keys(TRANSLATIONS);
  },

  /**
   * Traduci elemento DOM
   * @param {HTMLElement} element - Elemento DOM
   * @param {string} key - Chiave traduzione
   * @param {Object} params - Parametri
   * @returns {void}
   */
  translateElement(element, key, params = {}) {
    if (!element) return;

    const translation = this.t(key, params);

    // Se è input/textarea, aggiorna placeholder
    if (element.hasAttribute('data-i18n-placeholder') || element.placeholder !== undefined) {
      const placeholderKey = element.getAttribute('data-i18n-placeholder') || key;
      element.placeholder = this.t(placeholderKey, params);
    }

    // Se è input/button/text, aggiorna testo
    if (element.tagName === 'INPUT' && element.type === 'button') {
      element.value = translation;
    } else if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      // Se la traduzione contiene HTML, usa innerHTML
      if (translation.includes('<')) {
        element.innerHTML = translation;
      } else {
        element.textContent = translation;
      }
    }

    // Se è title/aria-label, aggiorna attributi
    if (element.hasAttribute('title')) {
      element.setAttribute('title', translation);
    }
    if (element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', translation);
    }
  },

  /**
   * Traduci tutti gli elementi con data-i18n
   * @returns {void}
   */
  translatePage() {
    // Traduci elementi con data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    let translatedCount = 0;

    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = this.t(key);
        if (translation && translation !== key) {
          // Se la traduzione contiene HTML (tag <strong>, <em>, etc.), usa innerHTML
          if (translation.includes('<')) {
            element.innerHTML = translation;
          } else {
            // Altrimenti usa textContent per sicurezza
            element.textContent = translation;
          }
          translatedCount++;
        }
      }
    });

    // Traduci placeholder con data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key && element.placeholder !== undefined) {
        const translation = this.t(key);
        if (translation && translation !== key) {
          element.placeholder = translation;
          translatedCount++;
        }
      }
    });

    Logger.debug(
      'i18n',
      `Tradotti ${translatedCount} elementi (${elements.length} data-i18n + ${placeholderElements.length} placeholder)`
    );
  },
};

// Inizializza al caricamento
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      i18n.init();
      i18n.translatePage();
    });
  } else {
    i18n.init();
    i18n.translatePage();
  }

  // Ascolta cambiamenti lingua
  window.addEventListener('languageChanged', () => {
    i18n.translatePage();
  });
}
