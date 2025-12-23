# SECURITY INCIDENT — 2025-12-22

**Title:** Secrets exposed in repository (README.md)
**Date:** 2025-12-22
**Reported by:** automated scan / review
**Severity:** High

## Summary
During a repo review we discovered hard-coded credentials and an OTP in `README.md` which were removed and replaced with guidance to use a secret manager. The following immediate changes were made in the repo:

- Removed hard-coded credentials from `README.md` (password & OTP) and replaced with guidance to use a secret manager.
- Added a secret-scan GitHub Action at `.github/workflows/secret-scan.yml`.
- Added `SECURITY.md` with remediation steps and contacts.
- Added `docs/ROTATE-SECRETS.md` with the rotation playbook.
- Added an issue template for security incidents at `.github/ISSUE_TEMPLATE/security-incident.md`.

## Files / Commits
- File: `README.md` — credential lines removed (commit: update README to remove secrets)
- New: `.github/workflows/secret-scan.yml`
- New: `SECURITY.md`
- New: `docs/ROTATE-SECRETS.md`
- New: `.github/ISSUE_TEMPLATE/security-incident.md`

## Immediate Actions (Required now)
- [ ] **Rotate** all credentials that may have been exposed (email/password, OTP, API keys if any) — treat them as compromised.
- [ ] **Revoke** old credentials in provider dashboards (Vercel, Railway, Supabase, any third-party services).
- [ ] **Update** secrets in hosting/CI (GitHub Actions secrets, Vercel envs, Railway envs, Supabase Vault, etc.).
- [ ] **Remove** secrets from Git history if they were committed (use `git filter-repo` or BFG), open PR to remove offending commits.
- [ ] **Notify** security@tradelia.org and affected service owners.

## Suggested Issue Body (ready to paste into GitHub issue)

Title: [SECURITY] Exposed credentials found in repo — rotate and revoke

Body:
```
**What:** Hard-coded credentials (email + password + OTP) were found and removed from `README.md`.
**Where:** `README.md` (commit: update README to remove secrets)
**When discovered:** 2025-12-22

**Immediate actions taken:** README cleaned, secret-scan workflow, SECURITY.md and rotation guide added.
**Actions required:** Revoke and rotate all possibly affected credentials, remove secrets from Git history, update envs/secrets in Vercel / Railway / GitHub / Supabase, confirm deployments and CI pass.

**Owners / Contacts:**
- Security: security@tradelia.org
- API / Railway: @api-team
- Web / Vercel: @web-team
- DevOps: @devops

**Checklist:**
- [ ] Rotate/revoke credentials
- [ ] Update hosting/CI secrets
- [ ] Remove secrets from history (if applicable)
- [ ] Run secret-scan and confirm results
- [ ] Confirm deployments and health checks
```

## Next steps (for the team)
1. Rotate credentials immediately and update secrets in the relevant services.
2. If secrets were committed in the past, run `git filter-repo` / BFG to purge them and open a PR with the history rewrite and the remediation checklist.
3. Assign owners for verification and sign-off.
4. Run the repository secret-scan and local pre-commit scans until confirmation.

---

If you want, I can open the GitHub issue with the suggested body and ping the contacts listed above — say "open issue" and I will proceed (I can't open GitHub Issues without explicit repo access via an API or `gh` in your environment).