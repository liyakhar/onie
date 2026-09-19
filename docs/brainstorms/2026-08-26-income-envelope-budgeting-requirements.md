---
date: 2026-08-26
topic: income-envelope-budgeting
---

# Income-driven household envelope budgeting

## What we are building

Wollie will give a shared household one virtual budget across both members' connected bank and card accounts. It will automatically fund named envelopes from cleared income each calendar month. An envelope can receive a fixed monthly amount, a percentage of monthly income, or all remaining income. It is a planning ledger, not a payment service: Wollie never moves money between banks.

The default household template supports the requested shape without hard-coding anyone's money: Pension, Savings, Tax, Rent, Food, Travel, and Extra. A household can rename, add, remove, reorder, or remap envelopes to its own transaction categories.

## How spending stays accurate

An envelope has an allocated amount and a live available amount. Wollie maps existing transaction categories to envelopes, so a food purchase on either person's debit or credit card reduces Food even though the card itself has no spending limit. Pending card purchases are shown as reserved spending; only cleared income funds envelopes. Unmapped spending stays visible as unassigned instead of being silently deducted from the wrong envelope.

## Decisions and boundaries

- The existing `BudgetWorkspace` is the shared household boundary. Both members can manage its plan; bank credentials remain owned by the person who connected them.
- The workspace's configured currency is the allocation currency. Transactions in another currency remain visible but do not silently enter the income pool or envelope totals.
- Fixed and percentage rules are processed in the household's chosen priority order. A single Remainder rule receives what is left. If income is insufficient, Wollie shows the shortfall rather than inventing funds.
- Income means a cleared, positive transaction categorized as Income. Transfers do not fund envelopes.
- Existing manual monthly allocations remain readable and are migrated to fixed rules so current budgets are not lost.

## Success criteria

- Two members' eligible income is combined once per household month and funds the configured envelopes deterministically.
- The Food envelope accurately shows spending and money left across bank and credit-card transactions from both members.
- Funding gaps, pending spend, unmapped spend, and non-base-currency data are explicit.
- All mutations remain server-authorized at the household boundary and never expose provider credentials.

