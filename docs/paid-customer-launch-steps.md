# Wollie: step-by-step path to paid customers in Belgium

Status: founder checklist dated 2026-07-15. Complete in order. Do not accept public payments or public bank connections while a blocking item remains unchecked.

## 1. Confirm the operator and right to work

- [ ] Choose the legal operator: Belgian sole proprietorship for one genuine owner, or Belgian SRL/BV for multiple owners.
- [ ] Confirm the non-EEA founder's right to self-employed work in Wallonia or obtain the required professional card before working as a sole proprietor, representative, director, or active partner.
- [ ] Record the real founders, UBOs, voting rights, profit rights, directors, and ownership split.
- [ ] Resolve FluentAI's third founder separately: do not give ordinary umbrella-company shares if their 20% is intended to apply only to FluentAI.
- [ ] Sign founder/shareholder, vesting, departure, confidentiality, and IP-assignment agreements.

**Evidence:** residence/professional-card decision, cap table, signed founder/IP documents.

## 2. Register the business

### Sole proprietorship

- [ ] Open a professional bank account.
- [ ] Register through an accredited business counter and obtain the enterprise number.
- [ ] Register the NACE-BEL codes for client work, Wollie, and every activity actually started.
- [ ] Activate VAT and join a social-insurance fund before beginning the activity.

### SRL/BV

- [ ] Choose company name, Belgian registered address, directors, activities, share rights, and financial year.
- [ ] Prepare the two-year financial plan and sufficient initial funding.
- [ ] Open the company bank account and obtain the bank certificate for the contribution.
- [ ] Sign the notarial incorporation deed and articles.
- [ ] Finalise CBE/NACE-BEL registration, VAT activation, and social-insurance affiliation.
- [ ] Register every UBO in MyMinfin within 30 days.

**Evidence:** enterprise/VAT number, CBE extract, bank account, UBO confirmation, social-insurance confirmation, deed/articles for an SRL/BV.

## 3. Appoint an accountant and decide tax treatment

- [ ] Give the accountant the client-service contracts, expected Wollie territories, pricing, provider costs, and founder compensation plan.
- [ ] Confirm whether the Belgian EUR 25,000 small-business VAT exemption is available or whether normal VAT registration is better/required.
- [ ] Classify American B2B client services separately; do not assume every foreign invoice belongs in Belgian VAT turnover.
- [ ] Confirm Wollie as an electronically supplied B2C service, the EUR 10,000 EU cross-border threshold, and when OSS/Stripe Tax is needed.
- [ ] Confirm EUR 7.99 monthly and EUR 59 yearly as consumer tax-inclusive prices.
- [ ] Select Peppol-capable accounting software for applicable Belgian B2B invoices.
- [ ] Establish invoice numbering, expense capture, Stripe payout reconciliation, VAT filings, annual accounts/tax return, and document retention.

**Evidence:** short written accountant memo, VAT/OSS registrations or documented non-registration, bookkeeping workflow.

## 4. Complete the public legal identity

- [ ] Choose the final domain and create working support and privacy email addresses plus a customer telephone number.
- [ ] Enter the operator's legal name/form, address, enterprise/VAT number, email, telephone, and Belgian consumer-mediation details in production configuration.
- [ ] Make the Legal Notice, Terms, Privacy Policy, pricing, Checkout, and customer emails identify the same operator, for example: "[legal entity], trading as Wollie."
- [ ] Publish the main service characteristics, total price including tax, trial, automatic renewal interval, cancellation method, compatibility/limitations, and support route before purchase.
- [ ] Make the order button clearly create a payment obligation and record acceptance of the Terms before purchase.
- [ ] Provide the statutory withdrawal information and model route. Do not remove the 14-day right merely because service access starts immediately; obtain the required express request and apply the reviewed proportionate/refund treatment.
- [ ] Send a durable contract confirmation after purchase containing the mandatory pre-contract information, ideally in the email body or attached PDF rather than only a changeable webpage link.
- [ ] Publish an internal complaint process and the competent Belgian Consumer Mediation Service details.
- [ ] Have a Belgian consumer/e-commerce lawyer perform one fixed-scope review of the final pages and Stripe flow.

**Evidence:** screenshots/PDFs of every page and checkout state, reviewed legal text, sample confirmation email.

## 5. Finish GDPR and financial-data governance

- [ ] Name the company/sole proprietor as controller and use a monitored privacy contact.
- [ ] Complete the record of processing activities, lawful bases, processor list, international-transfer mechanisms, retention schedule, and data-flow map.
- [ ] Obtain and archive DPAs/terms/subprocessor information for Enable Banking, Stripe, Cloudflare, the database host, and Resend.
- [ ] Complete a Belgian GDPR DPIA/AIPD before public bank-data processing; document threats, controls, residual risks, and the person accepting them.
- [ ] If high residual risk remains after controls, consult the Belgian Data Protection Authority before launch.
- [ ] Test access/export, correction, bank disconnect, consent revocation, subscription cancellation, and account deletion.
- [ ] Maintain an incident register and a 72-hour data-breach assessment/notification procedure.

**Evidence:** signed DPIA, processing register, processor folder, retention schedule, rights and incident runbooks.

## 6. Obtain unrestricted Enable Banking approval

- [ ] Apply using the real operator, directors, and UBOs.
- [ ] Complete the contract, KYB, DPA/role allocation, intended countries/banks, redirect domains, and public-production approval.
- [ ] Confirm whether Wollie operates only through Enable Banking's regulated account-information service or has any independent PSD2/AISP obligations.
- [ ] Keep public bank connection disabled while the account is restricted to founder/whitelisted testing.
- [ ] Install the production application ID, PKCS#8 private key, exact HTTPS redirect URL, and a separate encryption key of at least 32 characters.
- [ ] Test connection, consent expiry, refresh, disconnect/revocation, deletion, bank downtime, and provider errors with test/founder accounts.

**Blocking rule:** paid pricing currently promises bank connections, so do not open public paid Checkout until Enable Banking confirms unrestricted public production access. Alternatively, remove the bank-connection promise and launch a clearly limited product without it.

## 7. Activate Stripe live billing

- [ ] Create/verify the Belgian Stripe account using the same operator, UBOs, address, support contact, payout account, and statement descriptor.
- [ ] Create live monthly and yearly recurring Prices matching the public tax-inclusive offer.
- [ ] Configure explicit Stripe Tax behavior based on the accountant's memo.
- [ ] Configure Checkout to show price, tax, renewal, Terms acceptance, and the required immediate-performance/withdrawal request.
- [ ] Configure the Customer Portal for payment updates, invoice access, and online cancellation before renewal.
- [ ] Create the live webhook endpoint and subscribe to every event handled by Wollie; save its signing secret.
- [ ] Configure refunds, disputes, credit notes, failed-payment handling, and customer emails.

**Evidence:** Stripe screenshots/export, live Price IDs, successful signed webhook log, sample invoice and credit note.

## 8. Finish email, hosting, security, and insurance

- [ ] Verify the sending domain in Resend and use a real operator-owned sender.
- [ ] Test signup, email verification if used, password reset, security messages, subscription confirmation, withdrawal/refund acknowledgement, and account-deletion verification.
- [ ] Sign/archive the hosting and database DPAs; document region, logs, backups, encryption at rest, restore testing, and backup deletion.
- [ ] Install unique production secrets, least-privilege access, MFA for every provider, monitoring, error redaction, security headers, rate limits, and a secret-rotation procedure.
- [ ] Obtain appropriate professional liability/technology errors-and-omissions and cyber/privacy insurance, or document a deliberate decision after obtaining quotes.

## 9. Deploy and pass production gates

- [ ] Complete every production value in `.env.example`; never expose server secrets through client-prefixed variables.
- [ ] Apply the reviewed Prisma migration intentionally to the production database.
- [ ] Run `pnpm preflight:prod`, `pnpm test`, `pnpm generate-routes`, and `pnpm run build:cf`.
- [ ] Deploy, then test landing, registration, sign-in, dashboard, bank connection, billing, portal cancellation, password reset, export, deletion, private-cache headers, and mobile behavior.
- [ ] Set `LEGAL_LAUNCH_FACTS_CONFIRMED=true`, `TAX_LAUNCH_POSITION_CONFIRMED=true`, and `ENABLE_BANKING_PUBLIC_ACCESS_APPROVED=true` only when the underlying evidence exists.

## 10. Run one real transaction before inviting customers

- [ ] Use a founder account to buy a real low-value live subscription.
- [ ] Verify the exact price/tax, Terms record, durable confirmation, invoice identity, Stripe webhook, entitlement, payout, and bookkeeping entry.
- [ ] Cancel online, verify no renewal, exercise withdrawal/refund, verify the credit document, disconnect the bank, export the account, and delete it.
- [ ] Save the complete dated evidence pack and have the accountant confirm reconciliation.

## 11. Open a controlled paid beta

- [ ] Invite a small number of Belgian adults first rather than the whole EU.
- [ ] Monitor signup, bank sync, webhook, email, deletion, support, security, refunds, and complaints daily.
- [ ] Keep a support/incident log and stop new signups if bank access, billing, deletion, or security becomes unsafe.
- [ ] Expand to other EU countries only after VAT/OSS, languages, consumer terms, bank coverage, and support are confirmed for those countries.

## Official references

- Belgian company registration: https://business.belgium.be/start-a-business/register-your-business/register-as-a-company
- Belgian business counter/CBE: https://economie.fgov.be/en/themes/enterprises/starting-business/steps-starting-business/steps-take-business-counter
- Belgian e-commerce information duties: https://economie.fgov.be/sites/default/files/Files/Entreprises/guidelines-obligations-information-dans-le-cadre-du-e-commerce.pdf
- Belgian 14-day withdrawal right: https://news.economie.fgov.be/227481-achat-compulsif-signature-impulsive-retractez-vous/
- Belgian Consumer Mediation Service: https://mediationconsommateur.be/
- Belgian small-business VAT scheme: https://finance.belgium.be/en/enterprises/vat/vat-obligation/vat-exemption-scheme-small-businesses
- Belgian electronic-service/OSS guidance: https://finance.belgium.be/en/node/12950
- Belgian B2B e-invoicing: https://finance.belgium.be/en/enterprises/vat/e-invoicing
- Belgian processing register: https://www.dataprotectionauthority.be/professioneel/avg/register-van-verwerkingsactiviteiten
- Belgian DPIA/AIPD: https://www.dataprotectionauthority.be/index.php/professionnel/rgpd-/analyse-d-impact-relative-a-la-protection-des-donnees
- Belgian data-breach procedure: https://www.dataprotectionauthority.be/professioneel/acties/gegevensinbreuk
- Enable Banking production setup: https://enablebanking.com/docs/api/control-panel/
- Stripe subscriptions: https://docs.stripe.com/billing/subscriptions/overview
