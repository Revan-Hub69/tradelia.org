## 🧱 Struttura attuale Supabase + Pagamenti (Paddle / Xolo)

### 1. Tabelle chiave in Supabase

- **`user_roles`**
  - Colonne rilevanti: `user_id`, `role` (`trial`, `pro`, `institutional`), `valid_until`.
  - È la **fonte verità** per ciò che l’area utente mostra come piano attivo e data di scadenza.
- **`subscribers`**
  - Colonne rilevanti: `subscription_id`, `email`, `auth_user_id`, `status`, `plan_type`.
  - Viene popolata/aggiornata dai **webhook dei gateway** (Paddle in primis, storicamente Stripe/LemonSqueezy).
  - Serve come “log tecnico” delle subscription lato gateway.
- **`user_analysis_credits`**
  - Colonne rilevanti: `user_id`, `credits_balance`, `total_purchased`, `total_used`.
  - Usata per il Desk Professionale (crediti per analisi on‑demand).
- **Altre tabelle già documentate**
  - `analysis_requests`, `asset_proposals`, `asset_votes`, `admin_users`, ecc. → già coperte in `VERIFICA-SUPABASE-COMPLETA.md`.

> **Principio**: i gateway (Paddle / Xolo / Stripe storico) aggiornano `subscribers`; una funzione di sync aggiorna `user_roles.valid_until` e, se serve, i crediti in `user_analysis_credits`.

---

### 2. Gateway di pagamento scelti

- **Paddle (Merchant of Record europeo)**
  - Gestisce **carta di credito / wallet** e fatturazione automatica (IVA, receipt/invoices).
  - I webhook Paddle aggiornano:
    - `subscribers` (subscription_id, stato, plan_type),
    - e tramite helper (`syncUserRoleFromSubscription`) sincronizzano `user_roles` (ruolo + `valid_until`).
- **Xolo Go**
  - Usato come soluzione di **fatturazione / incasso via bonifico** per piani business e credit packages.
  - Non scrive direttamente su Supabase: l’integrazione è più “offline” (dati business in `user_profiles`, email a `amministrazione@tradelia.org`, riconciliazione manuale).

---

### 3. Collegamento con l’area utente

#### 3.1 Sezione “Gestione abbonamento”

- **File**: `user/index.html`, `user/assets/js/app.js` (`renderPlanSection`, `handleUpgradeWithTrial`, `handleRenewSubscription`, `handleCancelSubscription`).
- La UI legge:
  - `state.role` e `state.planExpiresAt` (da `user_roles`),
  - eventuali info da `user_analysis_credits` (per Desk, crediti disponibili).
- Azioni utente:
  - **Prova gratuita Pro / Desk** → aggiorna direttamente `user_roles` con un `valid_until` di +14 giorni (trial) e, se Desk, inizializza `user_analysis_credits`.
  - **Upgrade Pro / Desk** → apre `openPaddleUpgrade(planType, email, displayName)` (checkout Paddle).
  - **Rinnovo** → usa sempre `openPaddleUpgrade` con il ruolo corrente, in attesa dei webhook Paddle che aggiornano `user_roles.valid_until`.
  - **Cancellazione**:
    - Cerca un record in `subscribers` per l’utente.
    - Se non c’è `subscription_id`, riduce `valid_until` a “oggi” su `user_roles`.
    - Se c’è, è previsto l’uso di un endpoint API (gateway) per cancellare la subscription; per ora la parte “hard cancel” lato Paddle è da collegare al nuovo webhook.

#### 3.2 Sezione “Fatture e documenti / Cronologia pagamenti”

- **UI**: placeholder in `user/index.html` (`#invoices-list`, `#payments-history`) + CSS in `user/assets/css/user-area.css`.
- **Back‑end attuale**:
  - **Nessuna tabella** `invoices` / `payments` ancora definita in `supabase/schema.sql`.
  - La UI mostra solo uno stato vuoto “Nessuna fattura disponibile / Nessun pagamento registrato”.
- **Target architetturale** (da implementare in step successivo):
  - Aggiungere tabelle:
    - `payments` (id, user_id, gateway, amount, currency, status, created_at, raw_metadata JSONB).
    - `invoices` (id, user_id, payment_id, external_id Paddle/Xolo, url_pdf, issued_at, due_date, status).
  - Webhook Paddle:
    - All’arrivo di un pagamento riuscito, inserire record in `payments` + `invoices`.
    - Se `plan_type` mappa ad un ruolo (Pro/Desk), aggiornare anche `user_roles.valid_until`.
  - Xolo:
    - All’inizio flusso via bonifico, creare un record `payments` in stato `pending`.
    - Alla conferma Xolo (manuale o via API), marcare `payments.status = 'succeeded'` e creare la `invoice` con URL al PDF Xolo.
  - La UI dell’area utente leggerà queste tabelle (`select` con RLS `user_id = auth.uid()`) e popolerà:
    - lista fatture (`#invoices-list`),
    - lista pagamenti (`#payments-history`).

---

### 4. RLS suggerite per future tabelle

Quando verranno create `payments` e `invoices`, le RLS consigliate:

- `payments`:
  - SELECT: `using (user_id = auth.uid())`
  - INSERT/UPDATE: solo tramite **service role** (webhook/API backend).
- `invoices`:
  - SELECT: `using (user_id = auth.uid())`
  - INSERT/UPDATE: solo tramite service role (webhook/API backend).

Questo mantiene la logica coerente con le altre tabelle “sensibili” (`user_analysis_credits`, `analysis_requests`, ecc.).

---

### 5. Cosa è già pronto vs da fare

- ✅ **Già pronto**
  - Struttura ruoli (`user_roles`) e scadenze (`valid_until`).
  - UI abbonamento in area user (`renderPlanSection`) con:
    - testo e benefit in linea con Paddle + Xolo,
    - bottone prova gratuita,
    - bottone upgrade (Paddle checkout),
    - bottone rinnovo (Paddle checkout),
    - bottone cancellazione (riduzione `valid_until` e placeholder per gateway).
  - Tabella `subscribers` già utilizzata per collegare gli eventi dei gateway.
- 🟡 **Da fare nei prossimi step**
  - Definire schema `payments` / `invoices` in `supabase/schema.sql` (come sopra).
  - Aggiornare i webhook Paddle per scrivere in `payments` / `invoices` oltre che in `subscribers` / `user_roles`.
  - Implementare in `user/assets/js/app.js` il caricamento di:
    - `invoices` → popolamento `#invoices-list`.
    - `payments` → popolamento `#payments-history`.
  - Aggiungere eventuali endpoint API per scaricare PDF invoice o fare deep‑link alla ricevuta Paddle/Xolo.


