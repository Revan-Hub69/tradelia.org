# Rotation & Remediation Guide (Secrets Exposed)

This guide explains the steps to rotate exposed credentials and validate remediation.

## 1) High-level checklist
- Revoke compromised credential immediately.
- Generate a new credential and update the target service (Vercel, Railway, Supabase, etc.).
- Update repository/environment secrets (GitHub Actions secrets, Vercel, Railway env vars).
- Confirm services, deployments, and CI pass after rotation.
- Remove secret from repo history if it was committed (git-filter-repo or BFG) and open PR to remove the secret commit(s).
- Run secret-scan workflow and local pre-commit scanning; confirm no other exposures.

## 2) Service-specific notes
- Vercel: Dashboard → Project → Settings → Environment Variables → Rotate the variable; redeploy if needed.
- Railway: Project → Variables → Delete old value, add new value; redeploy service.
- Supabase: Project → Settings → Config → Update secrets or use Vault integration if available.
- GitHub: Repository → Settings → Secrets → Actions → Update the secret value.

## 3) Commands & Tools
- Remove secrets from history: use `git filter-repo --path README.md --invert-paths` or BFG for sensitive commits.
- Secret scanner: Use the repository workflow (TruffleHog) and local tools (detect-secrets).

## 4) Communication template
Subject: [SECURITY] Secret Rotated — [SERVICE]
Body:
- What was exposed: [short description]
- Actions taken: revoked secret, rotated, updated envs, ran scans
- Validation: deployments and CI green
- Next steps: postmortem / follow-up

## 5) Validation
- Run `.github/workflows/secret-scan.yml` on PR/branch; ensure no findings.
- Confirm all services start and pass health checks.

If you need help performing any step, ping security@tradelia.org.
