---
name: Security incident
about: Report an exposed secret, compromised credential, or security incident that requires immediate action
labels: security, incident
---

# SECURITY INCIDENT: [SHORT DESCRIPTION]

**Severity:** high | medium | low
**Reported by:** @<reporter>
**Date:** YYYY-MM-DD

## Summary
Describe briefly what was found (e.g. "API key exposed in README.md"). Include file paths and commits where possible.

## Immediate Actions (required)
- [ ] Revoke/rotate the exposed secret immediately (treat as compromised).
- [ ] Remove secret from repository history (use git-filter-repo or BFG) if applicable.
- [ ] Update secrets in CI and hosting (GitHub Secrets, Vercel, Railway, Supabase Vault, etc.).
- [ ] Confirm affected services are functioning after rotation.

## Affected Services / Secrets
- Service: e.g. Vercel — secret name: VERCEL_API_TOKEN — Owner: @team
- Service: e.g. Railway — secret name: DATABASE_URL — Owner: @team

## Steps to Remediate (Guidance)
1. Revoke the credential in the provider's console and create a new credential.
2. Update the secret in the provider (Vercel/Railway/Supabase/AWS) via their UI or API.
3. Verify deployments and CI pipelines run successfully.
4. Run secret-scan workflow and local pre-commit hooks; confirm no other exposures.

## Communications
- Notify security@tradelia.org and affected teams.
- If customer data was exposed, follow the incident disclosure policy.

## Postmortem
- Link to root cause analysis and remediation PRs.
- Close the incident once remediation and validation are complete.
