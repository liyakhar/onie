# Wollie paid launch: simple founder checklist

Use this beginner version first. The detailed checklist is in `docs/paid-customer-launch-steps.md`.

## Step 1: choose and open the business

### You do

- Decide: sole proprietor (one owner) or SRL/BV company (two or more owners).
- Decide who owns what. Do not give FluentAI's 20% cofounder ordinary shares in the whole umbrella company unless they should also own Wollie and client work.
- Give your ID, residence card, address, activity descriptions, founder names, and ownership percentages to the professionals.
- Confirm whether you need a Walloon professional card for self-employed work.

### Accountant does

- Explain the likely tax and social-contribution cost of sole proprietor versus SRL/BV.
- Prepare or help with the two-year financial plan if you choose an SRL/BV.

### Notary does — only for an SRL/BV

- Create the company deed and articles.
- Register the company and its shareholders/directors.

### Business counter does

- Register the enterprise and its actual activities/NACE-BEL codes.
- Help activate VAT and social-insurance registration if requested.

## Step 2: set up money and accounting

### You do

- Open the professional/company bank account.
- Send every sales invoice, expense receipt, Stripe report, and provider invoice to the accountant.
- Do not mix personal and business spending.

### Accountant does

- Register/confirm VAT and decide whether the small-business VAT scheme applies.
- Decide how Belgian, EU consumer, and American client invoices are treated.
- Decide whether and when EU OSS is needed for Wollie subscriptions.
- Set up invoice numbering, bookkeeping, expense recording, VAT returns, Peppol, annual accounts, and tax returns.
- Explain how founders should take money from the business: salary/director pay, expenses, or dividends.

Ask the accountant for a short written answer covering: VAT regime, OSS, tax-inclusive Wollie prices, US client invoices, founder pay, and required filings.

## Step 3: give Wollie its public business identity

### You do

- Choose a final domain.
- Create a support/privacy email and customer telephone number.
- Give the legal business name, form, address, enterprise/VAT number, email, and telephone to Codex.

### Codex can do

- Put the correct information into Wollie's Legal Notice, Terms, Privacy Policy, and production configuration.
- Make the site consistently say "[legal business], trading as Wollie."
- Keep deployment blocked while required information is missing.

## Step 4: finish legal and privacy documents

### Codex can prepare

- Terms, Privacy Policy, Legal Notice, withdrawal/refund wording, complaint process, data-processing register, provider list, incident plan, and the first DPIA/AIPD draft.

### You do

- Check that every factual statement is true.
- Sign/approve the DPIA and internal procedures as the business owner.
- Save provider contracts and DPAs.

### Lawyer does

- Perform one final fixed-price review of the consumer terms, withdrawal flow, privacy/DPIA conclusion, Enable Banking role, founder/IP agreement, and FluentAI 20% arrangement.

An accountant normally does not replace this legal review.

## Step 5: open Stripe and Enable Banking

### You do

- Open/verify Stripe using the real business, owners, address, bank account, and ID documents.
- Apply to Enable Banking using the same real business and owners.
- Sign their contracts and complete identity/KYB checks; Codex cannot legally accept these contracts or impersonate a founder.
- Give Codex the resulting configuration values through secure environment settings, never in public chat or source code.

### Accountant does

- Tell you whether Stripe Tax should be enabled and how invoices/tax must appear.

### Codex can do

- Configure Stripe Prices, webhook integration, Customer Portal, technical tax setting, refunds, and tests.
- Configure Enable Banking credentials, encryption, redirect URL, connection, refresh, disconnect, and deletion tests.

Enable Banking must explicitly approve unrestricted public production access before paying customers can be promised bank connections.

## Step 6: prepare production

### You do

- Verify the Resend email domain and enable MFA on Stripe, Enable Banking, Cloudflare, email, domain, database, and bank accounts.
- Obtain professional/cyber-insurance quotes and choose whether to buy coverage.

### Codex can do

- Configure production secrets after you provide them securely.
- Run database migrations, tests, build, security checks, and production preflight.
- Test signup, password reset, billing, bank connection, cancellation, export, and account deletion.

## Step 7: test one real payment, then launch small

### You do with Codex

- Buy one real low-value subscription yourself.
- Verify the invoice and bank payout.
- Cancel, request a refund/withdrawal, disconnect the bank, export data, and delete the test account.

### Accountant does

- Confirm the first payment, Stripe fee, refund, tax, and bank payout are recorded correctly.

After this works, invite a few Belgian paying users first. Expand to other EU countries only after the accountant confirms OSS/VAT and the legal/bank coverage is ready.

## Who you actually need

1. **One accountant:** ongoing tax, VAT, invoices, bookkeeping, filings, and founder pay.
2. **One notary:** only if forming an SRL/BV.
3. **One lawyer review:** founder/IP/FluentAI arrangement plus final consumer, bank-data, and privacy review.
4. **Codex:** prepare and configure Wollie, documents, Stripe/Enable Banking integration, tests, and deployment.

## Your next actions

1. Choose sole proprietor or SRL/BV and confirm the main-founder ownership split.
2. Confirm your Walloon professional-card position.
3. Choose an accountant who handles SaaS, Stripe, cross-border B2B, EU B2C VAT/OSS, and Peppol.
4. Open/register the business and professional bank account.
5. Send Codex the final business name, form, address, enterprise/VAT number, public email, telephone, and domain.
