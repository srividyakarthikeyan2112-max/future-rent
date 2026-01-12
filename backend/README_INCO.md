INCO integration notes
======================

This file documents how the backend integrates with INCO and operational notes.

1) Signer key management
- Use AWS KMS / GCP KMS / HashiCorp Vault to store the oracle private key.
- Do NOT store production private keys in environment variables or plaintext files.

2) Environment variables
- See `.env.example` for example variables. In production inject secrets from the vault.

3) Monitoring & alerts
- Instrument `payoutService.submitIncome` to increment a metric on INCO compute failures:
  - metric name: `inco_compute_failures_total{service="payoutService"}`
  - alert rule: fire if rate(inco_compute_failures_total[10m]) > 5
- Track on-chain submission failures and revert rates as separate metrics.

4) Operational playbook
- If INCO fails repeatedly, pause automated payouts and open a manual review ticket.
