# Supabase Schema v2 · Specification

## Legend
- `pk` primary key (UUID unless noted)
- `timestamptz` includes timezone, defaults to `now()`
- `jsonb` for flexible metadata
- `RLS` indicates default Row-Level Security mode (Enable + policies listed in architecture doc)

## 1. Identity & Access

### 1.1 `user_profiles`
| column | type | notes |
| --- | --- | --- |
| `user_id` | uuid pk, fk → auth.users | cascade delete |
| `display_name` | text | |
| `company` | text | nullable |
| `country` | text | ISO |
| `user_type` | text | enum (`retail`, `pro`, `desk`, `internal`) |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | trigger `moddatetime` |
| `metadata` | jsonb default '{}' | additional fields |

### 1.2 `user_roles`
| column | type | notes |
| --- | --- | --- |
| `id` | uuid pk | |
| `user_id` | uuid fk → auth.users | |
| `email` | text unique | lowercased |
| `role` | text | `trial`, `pro`, `institutional`, `desk`, `admin` |
| `plan_source` | text | `manual`, `stripe`, `lemonsqueezy`, `paddle` |
| `valid_until` | timestamptz | |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | |

### 1.3 `subscriptions`
| column | type | notes |
| --- | --- | --- |
| `id` | uuid pk |
| `user_id` | uuid fk → auth.users |
| `plan` | text | e.g. `trial`, `pro-monthly`, `desk-annual` |
| `status` | text | `active`, `past_due`, `cancelled`, `expired` |
| `gateway` | text | `stripe`, `paddle`, `lemonsqueezy`, `manual` |
| `gateway_subscription_id` | text | nullable |
| `started_at` | timestamptz |
| `renew_at` | timestamptz |
| `cancelled_at` | timestamptz |
| `metadata` | jsonb |

### 1.4 `dashboard_access_tokens`
| column | type | notes |
| --- | --- | --- |
| `id` | uuid pk |
| `token_hash` | text unique | SHA-256 of token |
| `email` | text | not null |
| `user_id` | uuid fk → auth.users | nullable |
| `plan_role` | text | `admin`, `internal`, `institutional`, `pro`, etc. |
| `valid_until` | timestamptz |
| `revoked` | boolean default false |
| `source` | text | `manual`, `api`, `paddle`, etc. |
| `usage_count` | integer default 0 |
| `last_used_at` | timestamptz |
| `created_at` | timestamptz default now() |
| `metadata` | jsonb |

### 1.5 `admin_emails`
| column | type | notes |
| --- | --- | --- |
| `email` | text pk |
| `notes` | text |
| `created_at` | timestamptz default now() |

### 1.6 `admin_users`
| column | type | notes |
| --- | --- | --- |
| `user_id` | uuid pk fk → auth.users |
| `email` | text unique |
| `created_at` | timestamptz default now() |
| `notes` | text |

## 2. Reporting Engine

### 2.1 `report_templates`
| column | type |
| --- | --- |
| `id` uuid pk |
| `slug` text unique (es. `swing_master_5_0`) |
| `label` text |
| `description` text |
| `status` text (`active`, `draft`) |
| `default_version_id` uuid fk → `report_template_versions.id` |
| `created_at` timestamptz |
| `updated_at` timestamptz |

### 2.2 `report_template_versions`
| column | type |
| --- | --- |
| `id` uuid pk |
| `template_id` uuid fk |
| `version` text (`v5.0`, `v3.1`) |
| `changelog` text |
| `schema` jsonb (validation rules) |
| `created_at` timestamptz |

### 2.3 `report_template_modules`
| column | type |
| --- | --- |
| `id` uuid pk |
| `template_version_id` uuid fk |
| `module_key` text |
| `order_index` integer |
| `required` boolean |
| `default_content` jsonb |

### 2.4 `report_templates_fields`
| column | type |
| `id` uuid pk |
| `template_version_id` uuid fk |
| `field_name` text |
| `field_type` text (`string`, `number`, `json`) |
| `validation` jsonb |

### 2.5 `reports`
| column | type |
| --- | --- |
| `id` uuid pk |
| `report_type` text fk → `report_templates.slug` |
| `template_version_id` uuid fk |
| `slug` text unique |
| `title` text |
| `status` text (`draft`, `active`, `archived`) |
| `notes` text |
| `chart_path` text |
| `published_at` timestamptz |
| `created_by` uuid fk → admin_users.user_id |
| `updated_at` timestamptz |
| `metadata` jsonb |

### 2.6 `report_modules`
| column | type |
| --- | --- |
| `id` uuid pk |
| `report_id` uuid fk |
| `module_key` text |
| `order_index` integer |
| `content` jsonb |
| `locked` boolean default false |
| unique constraint `(report_id, module_key)`

### 2.7 `report_assets`
| column | type |
| --- | --- |
| `id` uuid pk |
| `report_id` uuid fk |
| `asset_type` text (`chart`, `pdf`, `image`) |
| `storage_path` text |
| `signed_url` text (cached) |
| `expires_at` timestamptz |
| `metadata` jsonb |
| `created_at` timestamptz |

### 2.8 `report_audit_log`
| column | type |
| --- | --- |
| `id` uuid pk |
| `report_id` uuid fk |
| `action` text (`create`, `update`, `publish`, `archive`, `delete`) |
| `performed_by` uuid fk → admin_users.user_id |
| `payload` jsonb |
| `created_at` timestamptz |

## 3. Community Intelligence

### 3.1 `asset_proposals`
| column | type |
| --- | --- |
| `id` uuid pk |
| `ticker` text |
| `proposed_by` uuid fk → auth.users |
| `title` text |
| `description` text |
| `status` text (`pending`, `accepted`, `rejected`, `escalated`) |
| `created_at`, `updated_at` timestamptz |

### 3.2 `asset_votes`
| column | type |
| --- | --- |
| `id` uuid pk |
| `proposal_id` uuid fk |
| `user_id` uuid fk |
| `vote` text (`up`, `down`) |
| `created_at` timestamptz |
| unique `(proposal_id, user_id)`

### 3.3 `community_insights`
| column | type |
| --- | --- |
| `id` uuid pk |
| `source` text (`proposal`, `report`, `analysis_request`) |
| `reference_id` uuid |
| `summary` text |
| `metrics` jsonb |
| `created_at` timestamptz |

## 4. Monetization & Billing

### 4.1 `payments`
| column | type |
| --- | --- |
| `id` uuid pk |
| `user_id` uuid fk |
| `gateway` text |
| `gateway_payment_id` text |
| `amount` numeric(10,2) |
| `currency` text |
| `status` text |
| `metadata` jsonb |
| `created_at` timestamptz |

### 4.2 `invoices`
| column | type |
| --- | --- |
| `id` uuid pk |
| `user_id` uuid fk |
| `subscription_id` uuid fk |
| `invoice_number` text unique |
| `status` text |
| `issued_at` timestamptz |
| `due_at` timestamptz |
| `pdf_url` text |
| `metadata` jsonb |

### 4.3 `billing_events`
| column | type |
| --- | --- |
| `id` uuid pk |
| `source` text (`stripe`, `lemonsqueezy`, etc.) |
| `event_type` text |
| `payload` jsonb |
| `processed` boolean default false |
| `created_at` timestamptz |

### 4.4 `user_analysis_credits`
| column | type |
| --- | --- |
| `user_id` uuid pk |
| `credits_balance` integer |
| `updated_at` timestamptz |

### 4.5 `user_analysis_credits_log`
| column | type |
| --- | --- |
| `id` uuid pk |
| `user_id` uuid fk |
| `delta` integer |
| `reason` text |
| `related_request_id` uuid fk → analysis_requests.id |
| `created_at` timestamptz |

### 4.6 `desk_public_links`
| column | type |
| --- | --- |
| `id` uuid pk |
| `user_id` uuid fk |
| `title` text |
| `url` text |
| `status` text |
| `created_at` timestamptz |
| `updated_at` timestamptz |

## 5. Analysis Requests

### 5.1 `analysis_requests`
| column | type |
| --- | --- |
| `id` uuid pk |
| `user_id` uuid fk |
| `ticker` text |
| `timeframe` text |
| `priority` text |
| `status` text (`pending`, `in_progress`, `completed`, `rejected`) |
| `notes` text |
| `result_url` text |
| `created_at`, `updated_at` timestamptz |

## 6. Operations & Telemetry

### 6.1 `ops_events`
| column | type |
| --- | --- |
| `id` uuid pk |
| `event_type` text |
| `actor_user_id` uuid |
| `context` text |
| `payload` jsonb |
| `created_at` timestamptz |

### 6.2 `error_reports`
| column | type |
| --- | --- |
| `id` uuid pk |
| `source` text (`api`, `dashboard-admin`, etc.) |
| `severity` text (`info`, `warn`, `error`, `critical`) |
| `message` text |
| `stacktrace` text |
| `meta` jsonb |
| `created_at` timestamptz |

---
This specification backs the architecture blueprint; migrations under `supabase/` should mirror this structure (with indexes, policies, triggers outlined per domain).

