# Wollie provider evidence register

Status: collection index dated 2026-07-16. Do not store API keys, private keys, passwords, or identity-document copies in this repository.

Create a restricted founder-controlled evidence folder outside Git. Link each saved item using an internal reference, not a public URL.

| Provider | Required evidence | Current status | Restricted evidence reference |
| --- | --- | --- | --- |
| Enable Banking | Account owner/operator; application environment; KYB/contract; regulated-role allocation; DPA/terms; subprocessors; countries/banks; retention/deletion; breach contact; unrestricted approval | Sandbox application credentials exist locally; contract/KYB/public approval not evidenced |  |
| Stripe | Test and later live account owner/operator; DPA/terms; subprocessors/transfers; payout account; tax settings; portal; webhook; invoices/credit notes; retention/deletion; breach contact | No Stripe test keys are present locally |  |
| Cloudflare | Account owner; DPA; subprocessors; processing locations; request/security log settings; Pages/Workers/Access configuration; Hyperdrive; incident contact | Production project/config exists; separate private staging/database not evidenced |  |
| Railway | Account owner; DPA; subprocessors; processing region; named admins/MFA; log retention; backup/restore; deletion; incident contact | Separate private staging web service and empty database created; contract, access, retention, backup, and restore evidence remain to be collected |  |
| PostgreSQL host | Contract/DPA; database region; encryption at rest/in transit; named admins; MFA; backup frequency/retention; restore test; deletion; incident contact | Fresh Railway staging PostgreSQL is running with no production copy; backup/restore and provider evidence remain pending |  |
| Resend | Account owner; verified sending domain; DPA; subprocessors/transfers; event/log retention; deletion; breach contact | No Resend key is present locally |  |
| Domain/DNS registrar | Registrant; MFA; recovery contacts; DNS change log; processor terms where applicable | Final public domain not confirmed |  |
| Source control | Repository owners; MFA; collaborator list; secret scanning; branch protection; incident contact | Evidence not collected in this package |  |

## Approval rule

Before a provider receives real customer data, mark every required evidence item complete, review material changes, and record the reviewer/date. Sandbox credentials prove technical access only; they do not prove a production contract, GDPR role, or public-bank authorization.
