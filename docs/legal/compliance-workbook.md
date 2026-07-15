# Wollie France/EU compliance workbook

Status: working draft for founder completion and professional review. This document records operational facts; it is not a substitute for advice on disputed or fact-specific legal questions.

## 1. Launch facts to complete

Do not set `LEGAL_LAUNCH_FACTS_CONFIRMED=true` until every item has evidence.

- [ ] Legal operator name and form (EI, micro-entrepreneur, SASU, etc.)
- [ ] Registered business address
- [ ] SIREN/SIRET and registration wording
- [ ] Publication director
- [ ] Owned launch domain and working support/privacy email
- [ ] Hosting company name and address confirmed against the actual deployment
- [ ] Consumer mediator selected, contracted, and published
- [ ] Enable Banking contract, company KYB, and unrestricted production activation
- [ ] Current processor agreements/DPAs retained for Stripe, Enable Banking, Cloudflare, database host, and Resend
- [ ] Terms, Privacy Policy, Legal Notice, withdrawal wording, and Checkout reviewed against the final facts
- [ ] France-only versus wider-EU launch territory chosen

## 2. Record of processing activities

The CNIL says the small-company exception is narrow; routine customer processing and risky financial-data processing belong in the register.

| Activity | Data | Purpose and legal basis | Recipients | Retention rule | Controls |
| --- | --- | --- | --- | --- | --- |
| Account and authentication | Name, email, password hash, sessions, IP/user agent | Provide account and secure access; contract and legitimate security interests | Database host, Resend for account email | Active account; sessions until expiry; deletion subject to security/legal exceptions | Password hashing, secure cookies, reset-session revocation, rate limiting |
| Bank connection | Provider session credential, institution, masked account identity, balance, transactions | Deliver connected budgeting service; contract | Enable Banking, participating bank, database host | Credential until disconnect/expiry/deletion; local financial data until disconnect/deletion | Bank SCA, OAuth state, AES-GCM credential encryption, per-user authorization, HTTPS allowlist |
| Budgeting and insights | Categories, budgets, recurring-payment suggestions, notes | Deliver budgeting and user-requested insights; contract | Database host | Active account or user deletion | User correction, no significant automated decisions, access controls |
| Subscription billing | Email, Stripe customer/subscription status, invoices held by Stripe | Collect payment and administer contract; contract and accounting/tax law | Stripe, accountant/tax authorities where required | Wollie status during account; invoices and accounting evidence for applicable statutory period | Signed webhooks, hosted Checkout, no card storage |
| Support and rights | Email, request, response, identity-verification evidence | Respond to support and GDPR requests; contract/legal obligation | Email provider, authorized staff | Define a proportionate claims/rights-request schedule | Restricted access, request log, identity minimization |
| Security and incident response | Request metadata, errors, audit evidence | Detect abuse, protect accounts, investigate incidents; legitimate interests/legal duties | Hosting/security providers | Set and document a short operational period, then delete or aggregate | Redaction, least privilege, alerting, incident log |

## 3. Processor and transfer register

For each provider, save the signed agreement/DPA, service location, subprocessor list, breach-contact route, deletion terms, and transfer mechanism.

| Provider | Role | Data | Evidence still required |
| --- | --- | --- | --- |
| Enable Banking | Bank account-information connectivity | Consent/session ID, account and transaction requests | Contract, KYB approval, unrestricted status, controller/processor allocation, DPA |
| Stripe | Payment processor and billing platform | Email, billing address, payment/subscription/invoice data | Live account identity, DPA, tax settings, portal configuration, retention allocation |
| Cloudflare | Delivery/Workers hosting | Request metadata and application execution | DPA, subprocessor list, deployment region/settings, log retention |
| Database host | PostgreSQL storage | Account, budget, and financial data | DPA, encryption-at-rest evidence, backup retention, region, restore test |
| Resend | Transactional email | Email address and account-action content | Verified domain, DPA, region/transfers, event/log retention |

## 4. DPIA/AIPD screening

Wollie processes highly personal financial data continuously and derives categorized spending and recurring-payment insights. Those facts plausibly satisfy more than one high-risk screening criterion (highly personal data, systematic monitoring/evaluation, and innovative aggregation). Complete a full CNIL PIA before unrestricted public bank sync.

The DPIA must cover:

- data flows from bank to Enable Banking to Wollie to PostgreSQL;
- loss, credential compromise, cross-account disclosure, malicious insider, and provider outage scenarios;
- necessity of each stored field and the 90-day transaction lookback;
- encryption-key storage and rotation;
- admin/database access and audit logging;
- backup deletion and restore behavior;
- rights handling, disconnect, export, and account deletion;
- residual risks and the person accepting them.

## 5. Rights-request procedure

1. Log the request date, scope, and response deadline without copying unnecessary identity documents.
2. Verify identity through the signed-in account where possible.
3. Use Settings export for access/portability; supplement manually if support or provider records are outside the export.
4. For deletion, ensure renewal is cancelled, revoke bank access, delete local data, and record only the minimum proof of completion.
5. Search support/email and provider systems as required; preserve only records with a documented legal exception.
6. Respond within the applicable GDPR period and explain any lawful refusal or extension.

## 6. Incident response

1. Contain access, rotate affected secrets, preserve restricted forensic evidence, and stop unsafe sync paths.
2. Identify affected users, fields, providers, period, and likely consequences.
3. Record every personal-data incident, including the reasoning when notification is not required.
4. If the breach is likely to create risk, prepare supervisory-authority notification within the GDPR timetable; notify affected people without undue delay when high risk is likely.
5. Coordinate contractual notices with Enable Banking, Stripe, hosting, database, and email providers.
6. Document remediation and update the DPIA, threat model, tests, and processor register.

## 7. Professional review questions

- Does Wollie act only as Enable Banking's customer/agent application, or have any independent PSD2/AISP obligations under the final contract and launch countries?
- Is the immediate-performance/withdrawal wording and Stripe consent sufficient for the exact subscription flow?
- Are cancellation, refund, conformity, governing-law, mediation, and renewal terms complete for France and chosen EU markets?
- Is each provider a processor, independent controller, or joint controller for each data flow?
- Is the DPIA conclusion and residual-risk decision defensible?
- What exact billing, claims, security-log, and backup retention periods apply?

## Official references

- CNIL processing register: https://cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement
- CNIL DPIA guidance: https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd
- GDPR: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679
- DGCCRF e-commerce rules: https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/e-commerce-les-regles-entre-professionnels-et-consommateurs
- DGCCRF consumer mediation: https://www.economie.gouv.fr/mediation-conso/vous-etes-un-professionnel/vos-principales-obligations-0
- Enable Banking production activation: https://enablebanking.com/docs/api/control-panel/
