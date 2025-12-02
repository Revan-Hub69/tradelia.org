# 🚨 Guida Recupero Dati - Database Cancellato per Errore

## ⚠️ Situazione

Hai cancellato un database Supabase che conteneva dati importanti:

- 👥 Utenti
- 💳 Pagamenti
- 📊 Report
- 📝 Ordini
- 📄 Fatture
- E altro...

## 🎯 Verifica Progetto

### Passo 1: Verifica Quale Progetto Stai Usando

```bash
node scripts/supabase/check-project.mjs
```

Oppure controlla manualmente:

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Controlla quale progetto è configurato nel file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
   ```
3. Verifica che sia il progetto giusto

### Passo 2: Verifica Backup Automatici

Supabase crea **backup automatici giornalieri**!

1. Vai su Supabase Dashboard
2. Seleziona il progetto
3. Vai su **Database** → **Backups**
4. Controlla se ci sono backup disponibili

**Se ci sono backup:**

- ✅ Puoi ripristinare da backup
- ✅ I dati sono recuperabili
- ✅ Vedi sezione "Ripristino da Backup" sotto

**Se NON ci sono backup:**

- ⚠️ Controlla se hai esportato dati manualmente
- ⚠️ Controlla se hai backup esterni
- ⚠️ Vedi sezione "Alternative" sotto

## 🔄 Ripristino da Backup Supabase

### Opzione 1: Ripristino Completo (Raccomandato)

1. Vai su Supabase Dashboard → Database → Backups
2. Seleziona un backup **PRIMA** della cancellazione
3. Clicca su **Restore** o **PITR** (Point-in-Time Recovery)
4. Segui le istruzioni per ripristinare

**⚠️ ATTENZIONE:**

- Il ripristino **sovrascriverà** il database attuale
- Assicurati di aver salvato eventuali modifiche recenti
- Il ripristino può richiedere alcuni minuti

### Opzione 2: Ripristino Parziale (Solo Tabelle Specifiche)

Se vuoi ripristinare solo alcune tabelle:

1. Ripristina il backup completo in un progetto di test
2. Esporta le tabelle necessarie:
   ```sql
   -- Esempio: esporta user_profiles
   COPY user_profiles TO '/tmp/user_profiles_backup.csv' WITH CSV HEADER;
   ```
3. Importa nel database principale

## 🔍 Verifica Dati Esistenti

Prima di ripristinare, verifica cosa c'è ancora:

```sql
-- Conta utenti
SELECT COUNT(*) FROM auth.users;

-- Conta profili
SELECT COUNT(*) FROM user_profiles;

-- Conta pagamenti
SELECT COUNT(*) FROM payments;

-- Conta report
SELECT COUNT(*) FROM reports;
```

## 📋 Checklist Recupero

- [ ] Verificato quale progetto Supabase sto usando
- [ ] Controllato backup automatici in Dashboard
- [ ] Verificato se ci sono backup manuali
- [ ] Controllato se i dati esistono ancora (alcune tabelle potrebbero essere rimaste)
- [ ] Deciso se ripristinare completo o parziale
- [ ] Eseguito ripristino se disponibile

## 🆘 Se Non Ci Sono Backup

### Opzione 1: Controlla Export Manuali

- Cerca file `.sql`, `.csv`, `.json` con export dati
- Controlla se hai fatto export manuali prima della cancellazione

### Opzione 2: Ricostruisci da Zero

Se i dati non sono recuperabili:

1. **Utenti**: Dovrebbero essere in `auth.users` (non cancellati dal cleanup)
2. **Pagamenti**: Controlla provider pagamento (Stripe, PayPal, ecc.) per storico
3. **Report**: Potrebbero essere generabili di nuovo
4. **Ordini**: Controlla provider pagamento per storico

### Opzione 3: Contatta Supporto Supabase

Se hai un piano a pagamento:

- Contatta supporto Supabase
- Potrebbero avere backup non visibili nel dashboard
- Potrebbero aiutare con PITR (Point-in-Time Recovery)

## 🔒 Prevenzione Futura

Per evitare che succeda di nuovo:

1. ✅ **Abilita backup automatici** (già attivi di default)
2. ✅ **Fai export manuali** prima di modifiche importanti
3. ✅ **Usa progetti separati** per dev/staging/prod
4. ✅ **Verifica sempre** quale progetto stai modificando
5. ✅ **Testa in dev** prima di applicare in produzione

## 📞 Supporto

- [Supabase Support](https://supabase.com/support)
- [Supabase Discord](https://discord.supabase.com)
- [Documentazione Backup](https://supabase.com/docs/guides/platform/backups)

## ⚡ Azione Immediata

**Fai SUBITO:**

1. Vai su Supabase Dashboard
2. Database → Backups
3. Verifica se ci sono backup disponibili
4. Se sì, **NON fare altre modifiche** e ripristina

Ogni modifica dopo la cancellazione potrebbe sovrascrivere i backup disponibili!
