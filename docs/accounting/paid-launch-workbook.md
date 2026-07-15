# Wollie paid-launch accounting workbook

Status: founder-prepared facts and decisions for validation by an accountant. Wollie—not Stripe—is currently designed as the seller contracting with the customer.

## 1. Commercial model

- Product: B2C personal-finance SaaS with read-only bank aggregation and budgeting insights
- No-card trial: 14 days from Wollie account creation
- Monthly subscription: EUR 7.99
- Yearly subscription: EUR 59.00
- Payment processor: Stripe Checkout and Billing
- Bank-data provider: Enable Banking; no payment initiation
- Intended launch: France/EU, subject to final territory decision

## 2. Facts to decide before setting `TAX_LAUNCH_POSITION_CONFIRMED=true`

- [ ] Legal form and business start date
- [ ] SIREN/SIRET and business bank account
- [ ] BIC/BNC and micro/real-regime classification confirmed
- [ ] VAT status: franchise en base, voluntary registration, or mandatory registration
- [ ] Whether Wollie is an electronically supplied service for EU place-of-supply rules
- [ ] France-only launch or cross-border EU B2C sales
- [ ] French and EU small-seller/10,000 EUR rules applied to the actual facts
- [ ] OSS registration decision and effective date
- [ ] Prices confirmed as tax-inclusive consumer prices
- [ ] Stripe Tax registrations and `STRIPE_AUTOMATIC_TAX` set consistently
- [ ] Required invoice identity, VAT wording/number, and sequential numbering confirmed
- [ ] 2026/2027 French e-invoicing/e-reporting obligations calendared
- [ ] Enable Banking, Stripe, hosting, email, domain, and legal-review costs recorded

## 3. Stripe configuration evidence

Save screenshots or exports showing:

- verified legal business identity and payout bank;
- live monthly/yearly Price IDs and tax behavior;
- statement descriptor and public support details;
- Customer Portal cancellation, payment-update, and invoice access;
- live webhook endpoint and successful signed events;
- Checkout Terms URL and consent collection;
- automatic-tax status and registered jurisdictions;
- invoice footer, tax ID, and credit-note/refund behavior.

## 4. Bookkeeping workflow

Monthly:

1. Export Stripe balance transactions, invoices, refunds, disputes, fees, and payouts.
2. Reconcile gross sales, tax, Stripe fees, refunds/chargebacks, and net bank deposits.
3. Separate monthly subscription revenue from annual subscriptions according to the accounting method the accountant confirms.
4. Record Enable Banking and other vendor invoices with recoverable VAT treatment where applicable.
5. Reconcile subscriber counts and Stripe status to Wollie's `BillingSubscription` records.
6. Archive invoices, credit notes, payout reports, provider invoices, and filed declarations.

French guidance states that accounting books and supporting invoices are generally retained for 10 years from the relevant year-end. Do not treat deletion of a Wollie user account as deletion of legally required Stripe/accounting evidence.

## 5. First-transaction acceptance test

- [ ] Charge a real low-value live subscription owned by the founder
- [ ] Confirm displayed consumer price and tax treatment
- [ ] Confirm invoice legal identity and numbering
- [ ] Confirm Stripe fee and payout reconciliation
- [ ] Cancel renewal through the same online flow available to customers
- [ ] Exercise withdrawal/refund and issue the correct credit document
- [ ] Export the complete evidence pack for bookkeeping

## 6. Questions for the accountant

- Which legal/tax regime applies to the founder's exact situation and expected turnover?
- Is the SaaS classification and place of supply correct for each launch country?
- When does French VAT versus destination-country VAT apply, and when should OSS start?
- May the published EUR 7.99 / EUR 59 prices remain fixed and tax-inclusive across launch countries?
- What invoice and e-reporting fields must Stripe produce from September 2026 onward?
- How should annual subscription revenue, refunds, disputes, and provider prepayments be recorded?
- Which business expenses and input VAT are deductible?

## Official references

- French VAT overview and current service thresholds: https://www.impots.gouv.fr/professionnel/tva
- EU OSS: https://www.impots.gouv.fr/professionnel/jutilise-le-guichet-unique-tva-ioss-oss
- Business document retention: https://entreprendre.service-public.fr/vosdroits/F10029
- Stripe EU tax behavior: https://docs.stripe.com/tax/supported-countries/european-union
