---
date: 2026-07-13
topic: bank-sync-budgeting-app
---

# Bank-Sync Budgeting App

## What We're Building

We are pivoting Onie from a workflow-sharing product into a full personal budgeting app where bank sync is a core promise from day one. The app should help people understand their money automatically: connected accounts, synced transactions, category budgets, recurring bills, safe-to-spend, and clear weekly/monthly insights.

The product should not begin as a manual CSV upload tool. Manual import can exist later as a fallback, but it is not the main value proposition. The main experience is: connect bank, see money clearly, make better spending decisions without maintaining a spreadsheet.

## Why This Approach

We considered a manual-first MVP because it is cheaper and faster, but rejected it because it is not interesting enough for the desired product. A full bank-sync product is harder and carries provider, privacy, and cost risk, but it matches the ambition: a real budgeting app that can compete with serious personal finance tools.

The recommended strategy is to build the app around a provider abstraction from the beginning, then start with the lowest-risk bank-sync path. SimpleFIN is attractive for a US/Canada indie launch because users can pay SimpleFIN directly, reducing our day-one bank-sync cost exposure. GoCardless/Open Banking is attractive for a UK/EU-first launch because US-first finance apps often under-serve European users. Plaid is polished but should not be the first default unless we are ready to charge enough to cover ongoing per-user costs.

## Key Decisions

- Bank sync is required for the MVP: Manual upload is not the core product.
- No free bank sync: Free accounts may use demo data, but real bank sync must be paid or user-paid through a provider like SimpleFIN.
- Use a provider abstraction: The data model and sync code should support SimpleFIN first while leaving room for GoCardless/Plaid later.
- Start with a budget product, not a bank-API science project: The app must make transactions useful through categorization, budgets, recurring bills, safe-to-spend, and insights.
- Positioning: "A calm automatic budget that tells you what is safe to spend."
- Target user: People who want automatic money clarity but do not want to maintain a complicated budgeting spreadsheet.

## Open Questions

- First market: US/Canada with SimpleFIN user-paid sync, or UK/EU with GoCardless/Open Banking.
- Product name: Keep Onie, or rename to a finance-specific brand.
- Live sync timing: Whether the first coded version should include real provider credentials immediately, or ship the full product shell with demo/provider stubs while credentials are obtained.
- Pricing: Exact price is not locked, but the product should be designed around paid bank sync from the start.

## Next Steps

→ Create an implementation plan for converting the current Onie codebase into the budgeting app foundation.
