---
date: 2026-08-30
topic: money-plan-meaning-and-meters
---

# Money plan: spending, reserves, and goals

## What we're building

One calm Money plan that makes three different jobs explicit: money to spend this month, money reserved for a known future need such as tax, and money planned for a savings or pension goal. It remains a virtual plan: Wollie does not move money between accounts.

## Why this approach

The existing single envelope bar combines funding progress and spending pressure. That makes normal partial funding look like a warning. Separate row templates give each number one meaning and preserve the shared income allocation model.

## Key decisions

- Store an explicit purpose for each envelope: spending, reserve, or goal.
- Funding is always emerald with a neutral grey remainder; partial funding is explanatory, never a danger state.
- Spending gets its own meter: ink normally, amber when less than 20% remains, red only when actually over.
- Reserves and goals say "Reserved in plan" until a matching real transaction is seen; real contributions appear as "Saved / invested", never "Spent".
- Keep all of this on Money plan; target dates and account-backed goal balances are a later feature.

## Next steps

Implement the schema, allocation projection, row templates, editor language, and focused tests.
