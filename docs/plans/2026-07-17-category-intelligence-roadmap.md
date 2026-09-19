# Category Intelligence Roadmap

Date: 2026-07-17

## Current behavior

Wollie currently categorizes imported transactions with deterministic merchant keyword rules and saved merchant corrections. If a merchant is unknown, the transaction usually falls back to `Shopping` and can be marked `needs-review`.

Users correct categories in Activity. For real imported transactions with a merchant, that correction creates or updates a merchant rule so future transactions from the same merchant use the chosen category.

## Roadmap

### Custom merchant rules UI

Let users view, create, edit, and delete rules like:

- `LLC Lia` -> `Groceries`
- `Spotify` -> `Subscriptions`
- `Landlord` -> `Housing`

This makes the current hidden learning behavior visible and controllable.

### Custom categories

Let users create categories beyond the fixed list, for example:

- Household
- Kids
- Business
- Pets
- Travel

This requires updating validation, plan editing, category filters, transaction assignment, exports, and restore flows to support workspace-owned categories.

### Split transactions

Let one bank transaction be split across multiple categories.

Example:

- `Carrefour -86`
  - `Groceries -60`
  - `Household -26`

This is needed because bank feeds only provide the total transaction, not receipt-level item details.

### Smarter provider category mapping

Use category hints from bank-sync providers when available instead of relying only on merchant keyword guessing.

Provider categories should be mapped into Wollie categories, then overridden by user merchant rules when a user has made a correction.

### Optional AI categorization

Add AI categorization only as an optional user-controlled feature.

Potential use:

- Suggest a category for unclear merchants.
- Explain why a transaction was suggested for review.
- Propose rules after repeated manual corrections.

Constraints:

- Do not send bank data to AI without explicit user consent.
- Keep deterministic rules as the default path.
- Let users review and approve AI suggestions before they affect budgets.
