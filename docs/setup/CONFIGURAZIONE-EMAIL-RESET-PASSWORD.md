# 📧 Configurazione Email Reset Password

## 📋 Template Email

Il template email di reset password è stato salvato in:
- `supabase/email-templates/password-reset.html`

## ⚙️ Configurazione in Supabase Dashboard

### 1. Vai su Supabase Dashboard
1. Accedi a [Supabase Dashboard](https://app.supabase.com/)
2. Seleziona il progetto Tradelia

### 2. Configura Email Template
1. Vai su **Authentication** → **Email Templates**
2. Seleziona **"Reset Password"**
3. Copia il contenuto di `supabase/email-templates/password-reset.html`
4. Incolla nel campo **HTML Template**
5. Clicca **Save**

### 3. Configura Redirect URL (CRITICO!)
1. Vai su **Authentication** → **URL Configuration**
2. Nella sezione **Redirect URLs**, aggiungi:
   ```
   https://tradelia.org/user/index.html?reset=true
   ```
3. Clicca **Save**

**⚠️ IMPORTANTE**: Senza questo URL nella whitelist, Supabase reindirizzerà sempre alla home page invece che alla pagina di reset password!

### 4. Verifica Configurazione Email
1. Vai su **Authentication** → **Email Templates**
2. Verifica che il template "Reset Password" usi:
   - **Subject**: `Reimposta la tua password`
   - **HTML Template**: Il template salvato in `password-reset.html`
   - **Redirect URL**: `https://tradelia.org/user/index.html?reset=true`

## 🔍 Variabili Template

Il template usa la variabile Supabase:
- `{{ .ConfirmationURL }}` - URL completo con token di reset

## 📝 Note

- Il link di reset è valido per **1 ora** (configurazione Supabase)
- Il link può essere usato **una sola volta**
- Dopo il reset, il link non è più valido
- L'email usa il design system Tradelia (dark theme, colori brand)

## ✅ Test

1. Vai su `/` e clicca "Password dimenticata?"
2. Inserisci email e invia richiesta
3. Controlla email (anche spam)
4. Clicca sul link "Reimposta password"
5. **VERIFICA**: Dovresti essere reindirizzato a `/user/index.html?reset=true#access_token=...&type=recovery`
6. **VERIFICA**: Form cambio password dovrebbe essere evidenziato e visibile

## 🐛 Troubleshooting

### Problema: Viene reindirizzato alla home page
**Soluzione**: Verifica che `https://tradelia.org/user/index.html?reset=true` sia nella whitelist di Redirect URLs in Supabase Dashboard.

### Problema: Email non arriva
**Soluzione**: 
- Controlla spam
- Verifica configurazione SMTP in Supabase Dashboard → Authentication → Email
- Verifica che l'email non sia bloccata

### Problema: Link non funziona
**Soluzione**:
- Verifica che il link non sia scaduto (1 ora)
- Verifica che il link non sia già stato usato
- Richiedi un nuovo link di reset

