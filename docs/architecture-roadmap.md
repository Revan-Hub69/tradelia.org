# Tradelia Platform · Architecture Blueprint (2025 Standard)

## 1. Snapshot of the Current System

| Domain | Components | Notes / Pain Points |
| --- | --- | --- |
| Identity & Access | `/accesso.html`, `dashboard.html`, `report/admin/dashboard.html`, API `validate-dashboard-token` | Token-based flow ma con logiche duplicate lato client; controlli admin solo parziali; assenza di test di regressione |
| Admin Ops | `report/admin/dashboard.js`, `user/assets/js/admin.js` | UI monolitiche >1k righe; nessun layer di servizi; error handling patchy; nessun background job |
| Reporting | Tabelle `reports`, `report_modules`, bucket `report-charts` | Schema minimale ma non documentato; assenza di fixtures; pipeline di upload/preview basata su fetch diretti |
| Monetization | Tabelle `user_roles`, `dashboard_access_tokens`, `subscribers`, API Paddle/Lemon | Dati presenti ma non normalizzati; RLS ridondanti; nessuna audit trail centralizzata |
| Community / Assets | `asset_proposals`, `asset_votes`, Supabase policies custom | Feature congelata; policy e funzioni datate |

> Obiettivo: passare da un “monolite JS + Supabase grezzo” a un sistema composto da moduli chiari, documentati e testabili, seguendo le linee guida accademiche 2025 (Clean Architecture + Resilient Web Systems).

## 2. Guiding Principles (Paper-Level)

1. **Domain First** – ogni feature nasce da un bounded context (Auth, Reporting, Monetization, Community). I file devono rispecchiare il dominio, non le tecnologie.
2. **Explicit Contracts** – le API Vercel espongono schema JSON/TRPC definito; validazione con zod/valibot; ogni endpoint documentato.
3. **One Source of Truth** – Supabase schema versionato (migrazioni controllate) e seme replicabile. Niente più tabelle “orfane”.
4. **Secure-by-Design** – token admin firmati, policy RLS minimali e verificate; logging centralizzato; lint per secrets.
5. **Observability Everywhere** – ogni modulo emette eventi (Console + Supabase log table) per audit e debugging.

## 3. Target Architecture (High-Level)

```
┌──────────────────────────────────────────────────────────────────┐
│ Client Layer                                                     │
│  - Access Portal (Next.js/Vanilla)                               │
│  - User Dashboard                                                │
│  - Report Admin                                                  │
└───────────────▲───────────────────────────────┬──────────────────┘
                │                               │
┌───────────────┴──────────────┐     ┌──────────┴──────────────┐
│ Application Services          │     │ Background / Jobs       │
│  - AuthService (token, admin) │     │  - ReportAssetsWorker   │
│  - ReportingService           │     │  - BillingSyncWorker    │
│  - BillingService             │     │  - Cleanup/SLA jobs     │
└───────▲───────────┬──────────┘     └──────────┬──────────────┘
        │           │                            │
┌───────┴──────┐ ┌──┴──────────────────────────┐ │
│ Supabase DB  │ │ Supabase Storage (S3 compat)│ │
│ (schema v2)  │ │ Buckets: report-charts, etc │ │
└──────────────┘ └─────────────────────────────┘ └─>
```

## 4. Domain Map (Complete)

### 4.1 Identity & Access
- **Entities**: `users (auth)`, `user_profiles`, `user_roles`, `subscriptions`, `dashboard_access_tokens`, `admin_emails`, `admin_users`.
- **Relationships**:
  - `user_profiles.user_id -> auth.users.id`
  - `user_roles.user_id -> auth.users.id`
  - `subscriptions.user_id -> auth.users.id`
  - `dashboard_access_tokens.user_id (nullable) -> auth.users.id`
  - `admin_emails.email` cross-check with `dashboard_access_tokens.email`
  - `admin_users.user_id -> auth.users.id`
- **Use Cases**:
  1. User onboarding (public pricing -> token issuance or plan purchase).
  2. Admin token validation (API) with role gating.
  3. Subscription lifecycle (trial/pro/institutional/desk).

### 4.2 Reporting Engine
- **Entities**: 
  - Core: `reports`, `report_modules`, `report_assets`, `report_audit_log`.
  - Templates: `report_templates`, `report_template_modules`, `report_template_versions`, `report_template_fields`.
- **Relationships**:
  - `report_modules.report_id -> reports.id`
  - `report_assets.report_id -> reports.id`
  - `report_audit_log.report_id -> reports.id` (track state transitions, publisher, timestamps).
  - `report_template_modules.template_id -> report_templates.id`
  - `report_template_versions.template_id -> report_templates.id`
- **Use Cases**:
  1. Draft → Publish workflow (module validation, required sections).
  2. Template management: definire frameworks (es. Swing, MTB) senza deploy; versioning per aggiornamenti.
  3. Chart storage & signed URL generation (report_assets + `report-charts` bucket).
  4. Audit/compliance trail per ogni azione (report_audit_log).

### 4.3 Community Intelligence
- **Entities**: `asset_proposals`, `asset_votes`, `active_reports_expanded` (view), `community_insights (new)`.
- **Use Cases**:
  1. Pro users propose/vote assets.
  2. Admins moderate proposals, escalate to reports.
  3. Expose aggregated insights to dashboards.

### 4.4 Monetization & Billing
- **Entities**: `payments`, `invoices`, `billing_events (new)`, `desk_public_links`, `user_analysis_credits`, `user_analysis_credits_log`.
- **Use Cases**:
  1. Track subscription gateways (Stripe/Lemon/Paddle) via `billing_events`.
  2. Issue invoices / receipts (link to payments).
  3. Manage desk links and credits for institutional users.

### 4.5 Operations & Telemetry
- **Entities**: `ops_events (new)`, `error_reports (new)`.
- **Use Cases**:
  1. Log admin actions (token creation, report deletion, policy changes).
  2. Monitor Supabase/API errors for SLOs.

## 5. Target Architecture (High-Level)
## 6. Roadmap (Phased Refactor)

### Phase A – Foundational Alignment (Week 1)
- [ ] Inventario completo (scripts, API routes, supabase dir) → doc “system inventory”.
- [ ] Definizione Domain Map + ER diagram definitivo.
- [ ] Setup nuovo schema `supabase/schema_v2.sql` + seed `seed_admin.sql`.

### Phase B – Application Layer (Weeks 2-3)
- [ ] Creare package `services/` (AuthService, ReportingService, BillingService) condiviso dai client.
- [ ] Refactor `report/admin/dashboard.js` → modulare (state manager, API client, UI components).
- [ ] Aggiornare API `validate-dashboard-token`, `create-user-and-token`, `request-dashboard-token` con contratti validati.

### Phase C – Experience & Ops (Weeks 4-5)
- [ ] Re-design UI/UX accesso admin (state machine, skeleton states, error surfaces).
- [ ] Implementare flusso versionato per report (draft/publish/archive con audit log).
- [ ] Stabilire test suite (Playwright smoke + Vitest unit) e check CI.

### Phase D – Performance & Governance (Week 6+)
- [ ] Consolidare policy RLS (reduce ~190 warning a <10).
- [ ] Introduzione telemetry (Supabase log table + console ingestion).
- [ ] Documentare runbook e SLO (availability, data freshness).

## 7. Immediate Next Steps
1. **Confermare il Domain Map** – elencare i contesti che vogliamo mantenere (Auth, Reporting, Monetization, Community) e quelli da dismettere.
2. **Lock Schema Requirements** – definire le tabelle imprescindibili per il MVP rifattorizzato (user_roles, admin_emails, dashboard_access_tokens, reports, report_modules, subscriptions, payments).
3. **Stabilire stack tooling** – decidere se restiamo su vanilla JS o migriamo a bundler modulare (es. Vite/Next) per i pannelli admin.
4. **Avviare migrazione controllata** – creare branch `architecture/v2` con schema nuovo + scaffolding servizi.

> Una volta approvato questo blueprint, passeremo alla redazione del Domain Map e dello schema v2 di Supabase, per poi implementare la roadmap fase per fase.

