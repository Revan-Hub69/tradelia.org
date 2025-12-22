# Security: Secrets & Incident Response

## Summary
A set of credentials were found in the repository and removed from `README.md`. Secrets MUST NOT be committed to source control.

## Immediate steps (action required)
1. **Rotate exposed credentials immediately** (email/password, API keys, OTP codes). Treat them as compromised.
2. Revoke old credentials and generate new ones via the provider UI.
3. Update any service using the rotated credentials via secure channels (secret manager / environment variables).
4. Notify the security lead and affected teams.

## Prevention
- A GitHub Actions secret-scan workflow (`.github/workflows/secret-scan.yml`) was added to detect secrets on push and PR.
- Use a secret manager (Vault, Supabase Vault, AWS Secrets Manager) for storing and retrieving secrets.
- Add secret scanning to local pre-commit hooks and CI.

## Contact
If you find exposed secrets or suspect a breach, notify: security@tradelia.org (or your project security contact).
