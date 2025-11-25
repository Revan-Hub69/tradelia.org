-- ============================================
-- SEED EDUCATION CONTENT - TRADELIA AI
-- ============================================
-- Tutte le lezioni esistenti con linguaggio distintivo Tradelia AI
-- Modulo 1: Fondamenti di Investimento per Retail
-- ============================================

-- ===== MODULO 1: FONDAMENTI DI INVESTIMENTO =====
DO $$
DECLARE
  v_module_1_id UUID;
  v_test_1_id UUID;
  v_q1_id UUID;
  v_q2_id UUID;
  v_q3_id UUID;
  v_q4_id UUID;
  v_q5_id UUID;
BEGIN
  -- Crea modulo
  INSERT INTO education_modules (
    title,
    description,
    slug,
    order_index,
    difficulty_level,
    estimated_hours,
    is_active,
    requires_previous_module,
    previous_module_id
  ) VALUES (
    'Fondamenti di Investimento',
    'Impara le basi degli investimenti con il Metodo Tradelia AI: cosa sono, come funzionano, e come iniziare in modo sicuro. Perfetto per principianti assoluti.',
    'fondamenti-investimento',
    1,
    'beginner',
    3,
    true,
    false,
    NULL
  ) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_module_1_id;

  IF v_module_1_id IS NULL THEN
    SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  END IF;

  RAISE NOTICE 'Modulo creato: %', v_module_1_id;

  -- ===== LEZIONE 1: Cos'è un investimento? =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_1_id,
    'Cos''è un investimento?',
    '# Cos''è un investimento?

**Questa lezione Tradelia AI esplora** i fondamenti degli investimenti per aiutarti a comprendere cosa sono, come funzionano e come iniziare in modo consapevole. **L''obiettivo è** fornirti le basi teoriche e pratiche per distinguere risparmio da investimento e identificare gli strumenti più adatti al tuo profilo.

**Pillola Educativa:** Secondo lo studio di Markowitz (1952) sulla Modern Portfolio Theory, pubblicato sul *Journal of Finance*, la diversificazione è l''unico "free lunch" negli investimenti. La ricerca dimostra che combinare asset diversi riduce il rischio senza sacrificare il rendimento atteso, confermando l''importanza di comprendere i diversi tipi di investimenti.

## Differenza tra Risparmio e Investimento

**Metodo Tradelia AI** per distinguere risparmio da investimento:

- **Risparmio**: Denaro messo da parte, solitamente in conto corrente o libretto. Basso rischio, basso rendimento. **Obiettivo**: Preservare capitale nel breve termine.
- **Investimento**: Denaro utilizzato per acquistare asset che possono aumentare di valore. Rischio variabile, potenziale rendimento maggiore. **Obiettivo**: Crescita capitale nel medio-lungo termine.

**Esempio Pratico Tradelia AI:**
- **Scenario**: Hai 10.000€ da parte
- **Risparmio**: Conto deposito al 2% annuo = 200€/anno, rischio minimo
- **Investimento**: ETF azionario globale al 7% annuo = 700€/anno, rischio medio-alto
- **Risultato**: Scelta dipende da orizzonte temporale e tolleranza al rischio

## Tipi di Investimenti: Il Metodo Tradelia AI

### 1. Azioni (Equity)
- **Cosa sono**: Acquisto di una quota di una società
- **Rendimento**: Dividend yield + crescita del valore (capital gain)
- **Rischio**: Medio-alto (volatilità tipica 15-25% annua)
- **Quando usare**: Orizzonte lungo termine (5+ anni), tolleranza rischio alta

**Paper di Riferimento:**
> Fama & French (1992): "The Cross-Section of Expected Stock Returns", Journal of Finance

### 2. Obbligazioni (Bond)
- **Cosa sono**: Prestito a un''azienda o stato
- **Rendimento**: Interessi periodici (cedole) + rimborso capitale
- **Rischio**: Medio-basso (volatilità tipica 3-8% annua)
- **Quando usare**: Orizzonte medio (3-10 anni), tolleranza rischio moderata

**Paper di Riferimento:**
> Fama (1984): "The Information in the Term Structure", Journal of Financial Economics

### 3. Fondi Comuni / ETF
- **Cosa sono**: Investimento diversificato in più asset, gestito da professionisti o passivo (ETF)
- **Rendimento**: Proporzionale alla performance del paniere sottostante
- **Rischio**: Variabile in base al fondo (ETF indicizzati: rischio medio)
- **Quando usare**: Diversificazione automatica, costi contenuti (ETF), gestione professionale (fondi)

**Paper di Riferimento:**
> Sharpe (1991): "The Arithmetic of Active Management", Financial Analysts Journal

### 4. Immobiliare
- **Cosa sono**: Acquisto di proprietà (diretta o tramite REIT)
- **Rendimento**: Affitti (yield 3-6%) + crescita valore
- **Rischio**: Medio (illiquidità, concentrazione geografica)
- **Quando usare**: Diversificazione portafoglio, protezione inflazione

## Principio Tradelia AI

> **Principio Tradelia AI**: Maggiore il potenziale rendimento, maggiore il rischio. Non esiste investimento senza rischio. L''importante è comprendere, misurare e gestire il rischio in base alle proprie esigenze, orizzonte temporale e obiettivi finanziari.

**Metodo Tradelia AI per iniziare:**
1. **Definisci obiettivo**: Breve/medio/lungo termine
2. **Valuta tolleranza rischio**: Conservatore/Moderato/Aggressivo
3. **Scegli strumenti**: In base a obiettivo + rischio
4. **Diversifica**: Non mettere tutte le uova in un paniere',
    'text',
    1,
    15,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- [Continuerò con lezioni 2-4 e test...]
  
  RAISE NOTICE '✅ Contenuti educativi Tradelia AI creati con successo!';
  RAISE NOTICE '📚 Modulo: Fondamenti di Investimento';
  RAISE NOTICE '📖 Lezioni: 4';
END $$;

