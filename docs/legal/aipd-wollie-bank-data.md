# Wollie bank-data DPIA / AIPD

Status: first founder draft for restricted staging, dated 2026-07-16. **This document does not approve unrestricted public processing.** Complete the evidence and sign-off sections before enabling public bank connections.

## 1. Decision and ownership

| Field | Current value |
| --- | --- |
| Controller | To be replaced with the final Belgian sole proprietor or SRL/BV legal identity |
| Product | Wollie, a read-only personal budgeting and bank-aggregation service |
| Assessment owner | Founder/controller — name required |
| Technical owner | Founder/maintainer — name required |
| Privacy contact | Final monitored privacy email required |
| Assessment date | 2026-07-16 |
| Review date | Before unrestricted public bank sync, then after any material change or incident |
| Current decision | Restricted private staging only; no public users and no live payments |

An AIPD is treated as required because the service continuously combines bank-account and transaction data, categorizes spending, detects recurring payments, and may reveal highly personal behavior even though it does not intentionally collect GDPR Article 9 categories. The processing combines highly personal data, systematic evaluation, multiple data sources, and new aggregation technology.

## 2. Processing scope

### Included

- account registration, authentication, sessions, password reset, and deletion verification;
- read-only Enable Banking authorization, session storage, account/balance retrieval, and transaction synchronization;
- local account, transaction, category, merchant, budget, recurring-payment, and household-sharing data;
- Stripe Checkout, subscription status, invoices held by Stripe, cancellation, refunds, and webhook synchronization;
- transactional email, hosting, database storage/backups, security logging, support, data export, and deletion;
- restricted staging and the intended Belgian paid beta.

### Excluded

- payment initiation or moving money;
- credit scoring, lending, investment advice, or significant automated decisions;
- advertising data, sale of personal data, or non-essential analytics, none of which should be enabled without a new assessment;
- children; Wollie is intended for adults aged 18 and over.

## 3. Data-flow map

```text
User browser
  |-- account details / essential cookies --> Wollie on Cloudflare
  |                                           |-- account, budgets, encrypted bank session,
  |                                           |   accounts and transactions --> PostgreSQL host
  |                                           |-- account-action email --> Resend --> user
  |
  |-- bank selection --> Wollie --> Enable Banking --> participating bank
  |                      ^             |
  |                      |-- account, balance and transaction data --|
  |
  |-- subscription choice --> Stripe Checkout
                             |-- billing/invoice data retained by Stripe
                             |-- signed subscription webhooks --> Wollie --> PostgreSQL
```

Bank authentication occurs at the bank or its authorized interface. Wollie must never request or store the user's bank password. The stored Enable Banking session credential is encrypted server-side with AES-GCM using a separate environment secret.

## 4. Data inventory, purpose, and necessity

| Data | Purpose / proposed legal basis | Why needed | Minimization |
| --- | --- | --- | --- |
| Name, email, password hash, session and consent versions | Create and secure account; contract and security interests | Identify the account and provide access | No identity document is stored by Wollie for normal signup |
| Institution, masked/stable account identifier, account name/type/currency/balance | Show the selected user's financial accounts; contract | Core budgeting function | Do not store raw bank credentials; avoid full IBAN where a provider hash is sufficient |
| Transaction date, amount, currency, description, merchant and status | Transaction history, categories, budgets and recurring-payment detection; contract | Core budgeting function | Initial retrieval limited to the provider-authorized period; current intended lookback is 90 days |
| Categories, budgets, recurring items, notes and household shares | User-requested budgeting and collaboration; contract | Core product features | User can correct data; no significant decision is made automatically |
| Stripe customer/subscription/price/status and period end | Billing entitlement and cancellation; contract | Control paid access | Wollie does not store full card data; invoices remain at Stripe/accounting systems |
| Request/error/security metadata | Prevent abuse and investigate incidents; legitimate interests | Secure financial data and accounts | Redact secrets and financial payloads; short retention required |
| Support and rights-request correspondence | Resolve requests and legal duties | Demonstrate and provide user rights | Prefer signed-in verification; do not collect identity documents unless necessary |

## 5. People affected and likely impact

Initial users are Belgian adults using their own personal accounts, and invited adult household members. A breach could reveal salary, rent, debt, health-related merchants, religious or political donations, travel, relationships, location patterns, and other intimate behavior. Likely harms include embarrassment, discrimination, scams, account takeover targeting, financial loss, household conflict, loss of confidentiality, and loss of control over personal data.

## 6. Risk assessment

Score: likelihood 1–4 multiplied by severity 1–4. Residual scores are provisional until evidence is attached.

| Risk | Initial | Existing controls verified in code | Remaining action | Provisional residual |
| --- | ---: | --- | --- | ---: |
| One user sees another user's bank/household data | 16 | Server session required; queries use user/workspace ownership; household roles and owner billing rules | Run authorization integration tests for owner, member, non-member and deleted invite | 6 |
| Enable Banking session credential is stolen | 16 | AES-GCM credential encryption; encryption key is server-only; provider private key is server-only | Document key storage, access list, rotation and incident revocation; verify staging/production keys differ | 6 |
| Database or backup disclosure exposes financial history | 16 | Provider token encrypted; Cloudflare/private cache controls; deletion paths exist | Obtain database encryption/backup evidence, limit admin access, enable MFA, define backup deletion | 8 |
| OAuth state replay, forged callback, or malicious provider redirect | 12 | Random state, timing-safe comparison, 15-minute pending expiry, official authorization-host validation, HTTPS redirect requirement | Exercise a real sandbox callback and record negative-path evidence | 3 |
| Forged Stripe webhook grants access | 9 | Stripe signature verification; subscription state synchronized from Stripe objects | Add automated signed/invalid webhook tests and test-mode event evidence | 2 |
| Refund or cancellation leaves incorrect access/renewal | 12 | Customer Portal route; subscription update/delete webhooks; deletion blocked until renewal cancellation | Test test-mode cancellation, refund plus cancellation, failed payment and deletion sequence | 4 |
| Provider outage or inaccurate transaction data misleads user | 9 | Friendly provider errors; sync failure records; Terms warn users to verify important information | Add monitoring and support escalation; test timeout/expired-consent behavior | 4 |
| Disconnect/deletion fails to revoke provider or erase local data | 16 | Disconnect attempts provider session deletion and removes local accounts/transactions; account deletion checks renewal and revokes provider first | Add end-to-end deletion evidence, backup/provider deletion evidence, manual outage procedure | 6 |
| Household invitation exposes financial data to wrong person | 16 | Separate accounts, invitation token, membership roles and owner controls | Complete invitation expiry/revocation/non-member authorization tests; improve user warning if needed | 6 |
| Administrator or contractor accesses data without need | 12 | No public admin UI identified | Create named access list, least-privilege provider roles, access-review and confidentiality process | 6 |
| Account-action email is intercepted or misdirected | 9 | Time-limited action links generated by auth system; password reset revokes sessions | Verify expiry/single use, verified sending domain, email logs and support recovery procedure | 4 |
| Data is retained longer than users expect | 12 | Disconnect and account deletion remove local finance data; export exists | Approve retention schedule and obtain provider/backup deletion terms | 6 |

No risk above is accepted yet. A founder/controller and reviewer must confirm each remaining action and residual score.

## 7. Controls and evidence checklist

### Technical controls

- [x] Read-only account-information integration; no payment initiation.
- [x] Bank authentication remains at the bank/provider.
- [x] Random OAuth state, timing-safe state comparison, short pending-state expiry, and official redirect-host validation.
- [x] AES-GCM encryption for stored provider credentials.
- [x] Stripe webhook signature verification.
- [x] Per-user/household authorization foundations.
- [x] `private, no-store` headers for authenticated, settings, and billing routes.
- [x] Security headers include CSP, HSTS, frame denial, MIME sniffing protection, restrictive permissions policy, and referrer policy.
- [x] Export, bank disconnect, and verified account-deletion paths exist.
- [ ] Authorization integration-test report attached.
- [ ] Stripe test-mode journey report attached.
- [ ] Enable Banking sandbox journey report attached.
- [ ] Email reset/deletion delivery report attached.
- [ ] Separate staging database and secrets evidenced.
- [ ] Database encryption, backup, restore, and deletion evidence attached.
- [ ] Monitoring, alerting, log redaction, and incident contact tested.

### Organizational and contractual controls

- [ ] Final controller, privacy contact, business address and enterprise/VAT number inserted.
- [ ] Named list of people with production access and the minimum access each needs.
- [ ] MFA enabled for domain, Cloudflare, database, Stripe, Enable Banking, Resend, source control and business bank.
- [ ] Provider agreements, DPAs, subprocessors, regions, transfer mechanisms, breach contacts and deletion terms archived.
- [ ] Retention schedule approved and reflected in the public Privacy Policy.
- [ ] Rights-request and incident-response owners assigned.
- [ ] Staff/founder confidentiality and security obligations signed.
- [ ] Professional/cyber-insurance decision recorded.
- [ ] Belgian lawyer/privacy reviewer has reviewed the final AIPD and customer flow.

## 8. Rights and transparency

The public notice must explain the controller, data categories, purposes and bases, providers/transfers, retention criteria, bank disconnect, household visibility, automated suggestions, export/deletion, complaint rights, and contact route in clear language. Users must be able to:

- view and correct budgeting classifications;
- disconnect bank access and remove locally stored connected-bank data;
- download a structured account export;
- cancel subscription renewal online;
- request verified account deletion;
- contact the controller for access, correction, restriction, objection, portability, or complaint handling.

## 9. Incident response and prior consultation

Every suspected personal-data incident must be logged and assessed. Notify the competent authority without undue delay and, where feasible, within 72 hours when risk to people is likely; notify affected people without undue delay when high risk is likely.

Prior consultation with the Belgian Data Protection Authority is not requested at the restricted-staging stage because no public bank-data processing is approved. Before public launch, if the completed controls still leave high residual risk, the controller must consult the Authority before processing.

## 10. Sign-off

| Role | Name | Decision | Date | Signature/reference |
| --- | --- | --- | --- | --- |
| Controller/founder |  | Approve / reject / approve with actions |  |  |
| Technical owner |  | Controls accurate / corrections required |  |  |
| Belgian legal/privacy reviewer |  | Adequate / changes required / prior consultation advised |  |  |

Final public-launch decision: **NOT YET APPROVED**.

## References

- Belgian Data Protection Authority DPIA guidance: https://www.dataprotectionauthority.be/index.php/professionnel/rgpd-/analyse-d-impact-relative-a-la-protection-des-donnees
- Belgian processing-register guidance: https://www.dataprotectionauthority.be/professioneel/avg/register-van-verwerkingsactiviteiten
- GDPR: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679

