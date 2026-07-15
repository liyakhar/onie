---
date: 2026-07-13
topic: bank-sync-budgeting-app
status: active
origin: docs/brainstorms/2026-07-13-bank-sync-budgeting-app-brainstorm.md
depth: deep
---

# Bank-Sync Budgeting App Plan

## Problem Frame

Onie currently has the useful skeleton of a production web app: auth, users, Prisma/Postgres, Cloudflare deployment, routes, navigation, and a polished editorial UI. The product direction is changing from workflow sharing to a full budgeting app where bank sync is core from day one.

The goal is to reuse the existing repo foundation while replacing the social/content domain with a finance domain: bank connections, accounts, transactions, budgets, categories, recurring bills, and money insights.

## Scope

### P0: First Budgeting Foundation

- Replace the public workflow-sharing experience with a budgeting product shell.
- Keep auth, app shell, deployment, styling system, and database infrastructure.
- Add finance domain models for budgets, external accounts, transactions, categories, merchants, recurring payments, sync runs, and insights.
- Build a demo-data mode so the app can be evaluated without connecting a real bank.
- Build the bank-sync abstraction as if SimpleFIN is the first provider, but do not hard-code the app to SimpleFIN.
- Add dashboard, transactions, budgets, recurring bills, and settings pages.

### P1: First Live Bank Provider

- Add real SimpleFIN connection flow if US/Canada-first.
- Add real GoCardless/Open Banking flow if UK/EU-first.
- Store provider tokens securely and never expose them to the client.
- Add sync run history, provider errors, and reconnect states.

### P2: Intelligence and Differentiation

- Automatic categorization rules.
- Recurring subscription detection.
- Safe-to-spend calculation.
- Weekly/monthly plain-English money summary.
- User-editable rules: merchant/category overrides and recurring bill confirmations.

## Non-Goals

- Do not clone Actual's entire feature set immediately.
- Do not support every bank provider in the first implementation.
- Do not offer free live bank sync.
- Do not add investment tracking, tax optimization, or bill payment in the first pass.
- Do not store provider credentials or financial tokens in browser storage.

## Key Technical Decisions

### 1. Provider Abstraction First

Create a finance sync boundary that normalizes external provider data into internal models. The rest of the app should consume normalized `FinancialAccount`, `Transaction`, and `SyncRun` data, not provider-specific payloads.

Rationale: SimpleFIN, GoCardless, and Plaid expose similar concepts but different payloads, auth flows, refresh semantics, and error states. A provider boundary prevents a rewrite when adding the second provider.

### 2. Paid Sync Assumption

The app should assume real bank sync is paid. Free/demo users can use seeded demo data. Production live sync should sit behind a paid-plan gate or a user-paid provider token model.

Rationale: Plaid and similar providers can create ongoing per-user costs. SimpleFIN can shift cost to the user, but that still needs product copy and onboarding that sets expectations.

### 3. Demo Data Is a Product Feature

Build demo finance data as a first-class evaluation path, not as fake demo accounts on the login page.

Rationale: Users and investors need to understand the budgeting experience before trusting a new app with bank access. Demo data also lets us test UI and deployment without live bank credentials.

### 4. Finance Data Requires Stronger Boundaries

Financial data should be treated as sensitive even when not regulated as payment data. Server-only sync logic, scoped routes, user ownership checks, audit-friendly sync history, and careful error handling are required from the first implementation.

## Existing Repo Patterns to Reuse

- Auth/server session handling: `/Users/liya/Projects/wollie/src/lib/auth.server.ts`, `/Users/liya/Projects/wollie/src/server/session.server.ts`
- Prisma schema and generated clients: `/Users/liya/Projects/wollie/prisma/schema.prisma`, `/Users/liya/Projects/wollie/src/generated/prisma`
- App shell/navigation: `/Users/liya/Projects/wollie/src/components/AppShell.tsx`, `/Users/liya/Projects/wollie/src/components/AppNav.tsx`
- App routes: `/Users/liya/Projects/wollie/src/routes/app/index.tsx`, `/Users/liya/Projects/wollie/src/routes/app/explore.tsx`
- UI primitives: `/Users/liya/Projects/wollie/src/components/ui`
- Styling: `/Users/liya/Projects/wollie/src/styles.css`, `/Users/liya/Projects/wollie/src/press.css`

## Proposed Data Model

Replace or retire workflow-specific models after migration planning. Add the finance models below.

### Core Models

- `BudgetWorkspace`: one user's finance workspace.
- `FinancialAccount`: normalized bank/card/cash account.
- `BankConnection`: provider connection metadata and encrypted token reference.
- `Transaction`: normalized transaction record.
- `TransactionCategory`: user-owned categories and system defaults.
- `Merchant`: normalized merchant identity.
- `BudgetMonth`: month-level budget period.
- `BudgetAllocation`: category budget amount for a month.
- `RecurringPayment`: detected or confirmed recurring subscription/bill.
- `SyncRun`: provider sync attempts, status, counts, errors.
- `MoneyInsight`: generated insight cards shown to the user.
- `CategoryRule`: user-defined categorization rules.

### Important Constraints

- Every finance row must be owned by a user or workspace.
- Provider transaction IDs should be unique per connection/account to support idempotent sync.
- Amounts should use integer minor units, not floats.
- Currency should be explicit.
- Sync errors should be visible enough to debug but never leak secrets.

## Routes and Screens

### Public / Marketing

- `/`: finance landing page with clear promise, demo CTA, and paid sync positioning.
- `/login`: normal auth only, no production demo credential list.

### Authenticated App

- `/app`: money dashboard.
- `/app/transactions`: transaction inbox with filters, search, category editing.
- `/app/budgets`: monthly category budgets and safe-to-spend.
- `/app/recurring`: subscriptions and upcoming bills.
- `/app/accounts`: connected accounts and balances.
- `/app/insights`: weekly/monthly money explanations.
- `/settings`: profile, billing placeholder, bank connections, data/privacy controls.

## Implementation Units

### Unit 1: Product Shell Pivot

Files:
- `/Users/liya/Projects/wollie/src/routes/index.tsx`
- `/Users/liya/Projects/wollie/src/routes/app/index.tsx`
- `/Users/liya/Projects/wollie/src/components/AppNav.tsx`
- `/Users/liya/Projects/wollie/src/components/AppShell.tsx`
- `/Users/liya/Projects/wollie/src/lib/site.ts`

Work:
- Replace workflow-sharing copy with finance/budgeting copy.
- Rework app navigation around dashboard, transactions, budgets, recurring, accounts, insights.
- Preserve the current light editorial visual system, but make hierarchy calmer and finance-focused.

Test scenarios:
- Logged-out users see finance landing page.
- Logged-in users land on the dashboard.
- Navigation highlights the active finance section.
- Removed workflow routes are not linked from primary navigation.

### Unit 2: Finance Prisma Schema

Files:
- `/Users/liya/Projects/wollie/prisma/schema.prisma`
- `/Users/liya/Projects/wollie/prisma/seed.ts`
- `/Users/liya/Projects/wollie/src/generated/prisma`

Work:
- Add finance models and relations.
- Decide whether to keep old content models temporarily for rollback or remove them in a dedicated cleanup.
- Add seeded demo finance workspace and transactions.

Test scenarios:
- Prisma generation succeeds.
- Database push/migration succeeds locally.
- Seed creates one realistic demo workspace with accounts, transactions, budgets, recurring payments, and insights.
- Deleting a user cascades or safely cleans finance data.

### Unit 3: Finance Server Access Layer

Files:
- `/Users/liya/Projects/wollie/src/server/finance.server.ts`
- `/Users/liya/Projects/wollie/src/server/bank-sync.server.ts`
- `/Users/liya/Projects/wollie/src/server/db-access.server.ts`

Work:
- Add server-only functions for reading dashboard data, transactions, budgets, recurring payments, and accounts.
- Add strict user ownership checks.
- Add sync-provider interface and a demo provider implementation.

Test scenarios:
- User can only read their own finance workspace.
- Dashboard query returns totals, budgets, recent transactions, recurring payments, and insights.
- Demo provider can sync deterministic sample transactions idempotently.
- Duplicate provider transactions do not create duplicate internal transactions.

### Unit 4: Bank Connection Foundation

Files:
- `/Users/liya/Projects/wollie/src/routes/app/accounts.tsx`
- `/Users/liya/Projects/wollie/src/routes/api/bank-sync/$.ts`
- `/Users/liya/Projects/wollie/src/server/bank-sync.server.ts`
- `/Users/liya/Projects/wollie/src/server/providers/simplefin.server.ts`

Work:
- Add provider interface with connect, sync, disconnect, and status concepts.
- Add SimpleFIN-shaped provider module behind environment configuration.
- Add user-facing account connection states: not connected, connected, syncing, needs reconnect, sync failed.

Test scenarios:
- App can show demo connected accounts without live provider credentials.
- Missing provider env vars produce a controlled disabled state.
- Sync failures are recorded in `SyncRun` and shown as safe UI copy.
- Disconnect removes provider token reference and stops future syncs.

### Unit 5: Budgeting UI

Files:
- `/Users/liya/Projects/wollie/src/routes/app/index.tsx`
- `/Users/liya/Projects/wollie/src/routes/app/transactions.tsx`
- `/Users/liya/Projects/wollie/src/routes/app/budgets.tsx`
- `/Users/liya/Projects/wollie/src/routes/app/recurring.tsx`
- `/Users/liya/Projects/wollie/src/routes/app/insights.tsx`
- `/Users/liya/Projects/wollie/src/components/finance/*`

Work:
- Build dashboard cards: cash, spending this month, safe-to-spend, upcoming bills.
- Build transaction list with category chips and review states.
- Build monthly budget table/cards.
- Build recurring subscriptions screen.
- Build insight cards with plain-English explanations.

Test scenarios:
- Empty state is understandable before bank connection.
- Demo state clearly shows realistic data.
- Transaction search/filter works.
- Budget totals reconcile with category allocations.
- Mobile layout remains readable and touch-friendly.

### Unit 6: Product Safety, Privacy, and Pricing Gates

Files:
- `/Users/liya/Projects/wollie/src/routes/settings/index.tsx`
- `/Users/liya/Projects/wollie/src/lib/site.ts`
- `/Users/liya/Projects/wollie/README.md`

Work:
- Add privacy/data-handling copy.
- Add paid-sync positioning in UI, even before billing is implemented.
- Add settings controls for disconnecting bank data and deleting demo/finance data.

Test scenarios:
- User can find how bank sync works.
- User can disconnect a connection.
- User understands live bank sync requires paid plan or provider-paid setup.
- No provider secrets are rendered into client bundles.

## External Dependencies

- SimpleFIN Bridge if launching US/Canada-first.
- GoCardless Bank Account Data if launching UK/EU-first.
- Billing provider later if live sync is included in our subscription instead of user-paid provider setup.
- Token encryption/secrets strategy before storing live provider credentials.

## Risks

- Bank sync costs can create negative margins if offered free.
- Provider coverage varies by country and institution.
- Finance data increases user trust, privacy, and security expectations.
- Cloudflare Pages/server runtime may constrain long-running sync jobs; background sync may need a separate worker/cron design.
- The current repo has content/social models that may create migration cleanup complexity.

## Verification Strategy

- Unit tests for categorization, safe-to-spend, recurring detection, idempotent sync, and ownership checks.
- Route/component tests for dashboard, transactions, budgets, recurring, accounts, and settings.
- Build verification with the existing Cloudflare build command.
- Manual browser review of the main money flows.
- Security review before adding live provider credentials.

## Suggested Sequence

1. Product shell pivot and finance navigation.
2. Finance schema and demo seed.
3. Finance server access layer.
4. Demo dashboard, transactions, budgets, recurring, accounts, insights.
5. Bank sync provider abstraction and demo provider.
6. SimpleFIN or GoCardless live provider.
7. Pricing/billing gate.
8. Security/privacy hardening.

## Open Decisions

- Choose first live provider: SimpleFIN for US/Canada user-paid sync, or GoCardless for UK/EU open banking.
- Choose product name and domain strategy.
- Choose whether old Onie workflow routes become redirects, deleted routes, or archived hidden pages.
- Choose exact paid pricing before live bank sync goes public.
