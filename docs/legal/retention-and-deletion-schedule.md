# Wollie retention and deletion schedule

Status: proposed founder draft dated 2026-07-16. The accountant must confirm accounting periods; each provider must confirm backup and contract retention before public launch.

| Record | Live-system rule | Deletion trigger | Exceptions / evidence needed | Owner |
| --- | --- | --- | --- | --- |
| Account profile and consent versions | While account is active | Verified account deletion | Minimal legal-claims evidence only when documented | Product/controller |
| Authentication sessions and action tokens | Until expiry, use, revocation, or account deletion | Password reset, sign-out, expiry, deletion | Confirm Better Auth configured expiry and single-use behavior | Technical owner |
| Encrypted Enable Banking session | Until disconnect, provider consent expiry, reconnection, or deletion | Disconnect or verified account deletion | Provider may retain regulated records under its own notice; obtain terms | Technical owner/provider |
| Local connected accounts and transactions | While connection/account is active | Bank disconnect or verified account deletion | Backups follow approved backup lifecycle | Product/controller |
| Budgets, categories, recurring items, notes and household settings | While account/household is active | User deletion, workspace deletion, or feature-specific deletion | Owner cannot delete while another member remains without resolving household data | Product/controller |
| Stripe subscription status stored by Wollie | While account exists and needed for entitlement/support | Account deletion after renewal is cancelled | Stripe invoices/accounting evidence retained separately under legal duty | Product/controller |
| Invoices, credit notes, payouts and accounting support | Accountant-confirmed Belgian statutory period; working assumption 10 years | End of statutory period | Do not erase with Wollie account deletion when retention is legally required | Accountant/controller |
| Support and rights-request record | Proposed: request lifetime plus 24 months | End of period | Extend only for an identified dispute or legal duty | Privacy/support owner |
| Application/security logs | Proposed: 30 days online, longer only for an identified incident | Automatic expiry | Confirm Cloudflare/database/email actual settings and redaction | Security owner |
| Incident register and AIPD/processing-register history | Proposed: current version plus five years after relevant processing ends | End of documented accountability need | Belgian Authority may request accountability evidence | Controller |
| Database backups | Shortest operational period compatible with recovery; target to be approved | Scheduled expiry and cryptographic/physical deletion | Obtain provider schedule and test restore/deletion | Database owner/provider |
| Resend delivery/event logs | Minimum provider/configurable period | Provider expiry or manual deletion | Confirm actual plan and DPA | Email owner/provider |
| Household invitations | Until accepted, revoked, or expiry | Any of those events | Confirm automatic purge of expired invitations | Product/controller |

## Deletion sequence

1. Confirm the requester through the signed-in account or proportionate verification.
2. Require active subscription renewal to be cancelled; preserve only legally required billing evidence outside the Wollie profile.
3. Revoke the Enable Banking session. If provider revocation cannot be confirmed, stop and escalate rather than silently claiming completion.
4. Delete connected local transactions, accounts, sync runs, and connection credentials.
5. Resolve household ownership/member effects and remove the user's application data through database cascades.
6. Search support/provider systems when the request includes them.
7. Record only minimum completion evidence and communicate any lawful retention exception.
8. Allow backups to expire under the approved schedule; do not restore deleted data into the live service.

## Open decisions

- [ ] Accountant confirms invoice/accounting retention and what identifying fields must remain.
- [ ] Better Auth session/action-token expiries documented.
- [ ] Cloudflare log retention and redaction documented.
- [ ] Database backup frequency, region, encryption, restore and deletion schedule documented.
- [ ] Enable Banking, Stripe and Resend deletion/retention terms archived.
- [ ] Proposed 24-month support and 30-day security-log periods approved or changed.

