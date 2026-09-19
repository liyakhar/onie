# Monarch: 50 product lessons for Wollie

**Audience:** Wollie product and engineering  
**Date:** 1 September 2026  
**Decision:** What should Wollie borrow from Monarch, and where should Wollie be deliberately better?

## Direct answer

Monarch is the strongest functional reference for Wollie because it combines bank aggregation, transaction cleanup, budgeting, goals, reports, and household collaboration. Wollie should borrow the dependable mechanics, but not Monarch's complexity or its all-or-nothing household visibility.

Wollie's strongest position is: **Monarch-level planning, rebuilt around how couples actually combine money.** That means shared and personal views, fair contribution rules, selective privacy, multi-currency support, and a clean separation between money that is planned, actually spent, and actually saved.

## The first ten priorities

1. Make missing, duplicated, or stale bank data visible immediately.
2. Add a fast transaction review inbox that can be shared between partners.
3. Expand rules beyond category matching to ownership, tags, review, and splits.
4. Add private, shared-detail, and shared-total-only visibility.
5. Keep one household plan while supporting personal spending allowances.
6. Make fixed costs, flexible spending, reserves, and goals visually distinct.
7. Keep track-only categories for spending that has no monthly limit.
8. Record actual transfers into savings, tax, pension, and goals separately from planned assignments.
9. Rebuild recurring payments around recurring items, not only merchant names.
10. Support equal, fixed, and income-proportional household contributions.

## 32 things Monarch does well that Wollie should borrow or adapt

### Household and account foundation

1. **Separate logins under one household.** Each person should connect their own accounts securely while sharing the household workspace. **Wollie:** already present; strengthen permissions and lifecycle handling. **Priority: P0.**
2. **One cross-bank account list.** Checking, savings, credit cards, loans, cash, and investments can be understood together. **Wollie:** already present for core account types; keep the account list operational and trustworthy. **Priority: P0.**
3. **Visible connection health.** Monarch exposes provider and connection states. **Wollie:** show bank, owner, last successful sync, transactions added, and the exact next action when a connection fails. **Priority: P0.**
4. **Account and transaction ownership.** Items can be marked as shared or assigned to a household member. **Wollie:** extend the existing percentage ownership model to transactions. **Priority: P0.**
5. **Owner filters across the product.** Accounts, transactions, cash flow, and reports can be filtered by person or shared ownership. **Wollie:** use one consistent owner filter everywhere. **Priority: P1.**

### Transaction quality and automation

6. **A transaction review inbox.** Uncertain or new transactions can be reviewed rather than silently accepted. **Wollie:** already has `NEEDS_REVIEW`; turn it into a clear daily workflow. **Priority: P0.**
7. **Review responsibility.** A transaction can be assigned for review to one partner. **Wollie:** add “Liya”, “Alex”, or “either person” review ownership. **Priority: P1.**
8. **Automatic categorization.** Transactions arrive with a suggested category. **Wollie:** keep confidence visible and never hide uncertainty. **Priority: P0.**
9. **Custom categories and groups.** Users can adapt the taxonomy to their real lives. **Wollie:** already supports categories; add clear groups without forcing every category into a budget. **Priority: P0.**
10. **Tags alongside categories.** One category answers “what was this?”, while multiple tags answer “which trip, person, or project?”. **Wollie:** add only after the core category experience is simple. **Priority: P2.**
11. **Powerful transaction rules.** Monarch rules can rename, categorize, tag, hide, assign ownership, and set review status. **Wollie:** expand the current category rules into a small, understandable automation builder. **Priority: P1.**
12. **Quick rules after an edit.** Correcting a transaction can immediately become a future rule. **Wollie:** offer “Do this next time” after recategorization. **Priority: P1.**
13. **Rule previews.** Users can see what a rule will change before saving it. **Wollie:** essential once rules can affect ownership or splits. **Priority: P1.**
14. **Bulk editing.** Multiple transactions can be categorized, tagged, owned, or reviewed together. **Wollie:** add to desktop first, then mobile. **Priority: P1.**
15. **Transaction splitting.** One purchase can be divided across categories. **Wollie:** needed for supermarket, travel, and shared-personal mixed purchases. **Priority: P1.**
16. **Automatic split rules.** Repeated mixed transactions can be split by amount or percentage. **Wollie:** useful later, but the manual split must be excellent first. **Priority: P2.**
17. **Merchant normalization.** Variations of the same bank description can be merged under one clean merchant. **Wollie:** the data model exists; add user-facing merge and rename controls. **Priority: P1.**
18. **Notes, attachments, and receipts.** Extra context can stay attached to a transaction. **Wollie:** notes first; receipt scanning later. **Priority: P2.**
19. **Exclude without deleting.** A transaction can remain in the ledger but be excluded from budget and reports. **Wollie:** use separate toggles for “exclude from plan”, “exclude from reports”, and “transfer”. **Priority: P1.**
20. **Manual import and export.** Users can recover history and leave with their data. **Wollie:** exports and backup exist; add safe CSV import with preview and deduplication. **Priority: P1.**

### Understanding the month

21. **Cash flow works without a completed budget.** Users receive value immediately from connected transactions. **Wollie:** never make planning setup a gate to useful spending insight. **Priority: P0.**
22. **Filtered, saved reports with drill-down.** Users can move from a total to the exact transactions behind it. **Wollie:** every chart and category total should open its source transactions. **Priority: P1.**
23. **A customizable dashboard.** Users can reorder or hide information they do not use. **Wollie:** start with a small default and allow limited rearrangement later. **Priority: P2.**

### Budgeting

24. **Traditional category budgeting remains available.** Detailed users can set a limit for each category. **Wollie:** keep envelope-level targets where the user wants them. **Priority: P0.**
25. **Flex budgeting uses one flexible-spending number.** Users do not need to predict every unpredictable category. **Wollie:** make “Everyday spending” the shared flexible amount, with categories underneath for tracking. **Priority: P0.**
26. **Fixed, non-monthly, and flexible costs are different objects.** The model matches how real expenses behave. **Wollie:** use Spending, Reserves, and Goals as the primary distinction, with Fixed and Flexible inside Spending. **Priority: P0.**
27. **Categories can be tracked without a budget.** Health can show €240 spent even when no monthly health limit exists. **Wollie:** already moving in this direction; make “Track only” first-class. **Priority: P0.**
28. **Rollovers and starting balances.** Unspent amounts can carry forward for irregular expenses. **Wollie:** use for reserves and optional spending funds, but not as a default on every category. **Priority: P1.**
29. **Historical spending suggestions.** Past data helps users choose realistic amounts. **Wollie:** suggest, explain, and let users ignore. Never silently change a plan. **Priority: P1.**

### Bills and goals

30. **Recurring calendar with clear states.** Upcoming, paid, and amount-changed items are visually distinct. **Wollie:** connect recurring items to plan categories without counting them twice. **Priority: P0.**
31. **Goals have a target, date, monthly contribution, and status.** “On track”, “ahead”, or “at risk” is more useful than a progress bar alone. **Wollie:** use this for travel, emergency savings, pension, investments, and future purchases. **Priority: P1.**
32. **Goal accounting separates allocations, transactions, and market changes.** Monarch attempts to distinguish money assigned to a goal, real contributions, spending from it, and investment growth. **Wollie:** implement a simpler version with four explicit values: target, planned this month, actually contributed, and current real balance. **Priority: P0.**

## 18 Monarch gaps Wollie should turn into advantages

### Couples and privacy

33. **No real privacy inside a household.** Monarch says all members can see all connected accounts and transactions. **Wollie advantage:** private detail, shared detail, or shared total only. **Priority: P0.**
34. **An existing Monarch user cannot simply accept a household invitation.** The documented workaround is another email or deleting the existing account. **Wollie advantage:** merge or join safely with the existing login. **Priority: P0.**
35. **Changing the household admin requires support.** **Wollie advantage:** self-service role transfer with confirmation from both people. **Priority: P1.**
36. **The household has only one budget.** Owner filters do not create personal budget views. **Wollie advantage:** one shared plan plus optional personal allowances. **Priority: P0.**
37. **No clean “mine, yours, ours” spending model.** Users build category workarounds. **Wollie advantage:** make the three scopes native. **Priority: P0.**
38. **No fair-contribution engine for unequal income.** **Wollie advantage:** equal, fixed amount, custom percentage, or income-proportional contributions with a clear explanation. **Priority: P0.**

### Geography and data trust

39. **No true multi-currency accounting.** Monarch warns that it does not convert currencies and can create misleading totals. **Wollie advantage:** account currency, transaction currency, base-currency value, exchange rate, and conversion date. **Priority: P0 for Europe.**
40. **Missing or disappearing transactions damage trust.** User reports describe silently removed transactions. These reports are anecdotal, but the failure mode is severe. **Wollie advantage:** reconciliation checks, immutable provider IDs, deletion audit history, and alerts when the provider retracts data. **Priority: P0.**
41. **Connection failures can remain unnoticed.** **Wollie advantage:** prominent stale-data warnings, fallback import, provider switching where possible, and a connection health timeline. **Priority: P0.**
42. **Ownership and date filters are not always preserved.** Monarch documents that ownership filters are not persistent. **Wollie advantage:** remember each person's view across sessions. **Priority: P1.**
43. **Web and mobile feature parity is uneven.** Users report missing mobile report detail. **Wollie advantage:** define the essential monthly workflow and make it complete on mobile before adding advanced desktop-only analysis. **Priority: P1.**

### Recurring payments and forecasting

44. **Recurring items are too tightly tied to merchants.** Users report problems with multiple subscriptions from Apple, variable bills, slight date shifts, and manually matching a payment. **Wollie advantage:** recurring items are independent records that transactions can match by merchant, account, amount range, cadence, and date tolerance. **Priority: P0.**
45. **The recurring calendar does not provide dependable account-balance forecasting.** **Wollie advantage:** show the projected balance after known income and bills, with confidence and a warning before an account may go negative. **Priority: P1.**

### Complexity and decision support

46. **Goals can become an accounting puzzle.** User reports mention confusion around allocations, refunds, account changes, and reconciliation. **Wollie advantage:** never make users understand internal accounting vocabulary; show the source of every number. **Priority: P0.**
47. **Budget and goal terminology is dense.** Monarch has budgets, contributions, available funds, allocated funds, adjustments, rollovers, and several goal states. **Wollie advantage:** keep the product vocabulary to transactions, plan, spending, reserves, goals, and actual contributions. **Priority: P0.**
48. **Household collaboration is mostly viewing and filtering.** **Wollie advantage:** comments on transactions, shared decisions, partner review requests, and a simple monthly check-in. **Priority: P1.**
49. **The separation lifecycle is under-designed.** Removing a member can also remove accounts they added. **Wollie advantage:** preview consequences, export each person's data, preserve shared history, revoke access, and require confirmation for destructive changes. **Priority: P1.**
50. **Monarch is not Europe-first.** Currency limitations and North American data assumptions leave room for a European product. **Wollie advantage:** PSD2/open-banking consent status, IBAN-aware accounts, localized dates and currencies, EU privacy controls, and bank-specific sync guidance. **Priority: P0.**

## Recommended implementation order

### Phase 1: trust and the shared month

Bank-data integrity, sync health, review inbox, transaction ownership, privacy scopes, everyday-spending flex amount, track-only categories, actual goal contributions, recurring-item matching, and fair contribution rules.

### Phase 2: control and explanation

Bulk editing, richer rules, transaction splits, rollovers, saved reports, goal status, projected account balance, personal allowances, and self-service household lifecycle.

### Phase 3: depth without clutter

Tags, receipt scanning, smart splits, dashboard customization, investment detail, advanced forecasting, and advisor access. None should delay a dependable core month.

## What not to copy

- Do not expose every advanced concept during onboarding.
- Do not call virtual plan assignments “money saved” or “money moved”.
- Do not make shared household membership mean automatic access to every transaction.
- Do not treat a merchant as the recurring bill itself.
- Do not add forecasting until the underlying transaction and recurring data is trustworthy.

## Evidence and limitations

Official Monarch documentation was used for capabilities and documented limitations. Reddit reports were used only as anecdotal signals about failure modes, not as estimates of how often problems occur. The review reflects sources available on 1 September 2026.

### Official sources

- [Shared Views in Monarch](https://help.monarch.com/hc/en-us/articles/42228648365076-Shared-Views-in-Monarch)
- [Monarch for Couples and Households](https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples-and-Households)
- [Using Flex Budgeting](https://help.monarch.com/hc/en-us/articles/32125337244052-Understanding-Flex-Budgeting)
- [Rollover Budgets](https://help.monarch.com/hc/en-us/articles/4411119762196-Rollover-budget-feature)
- [Creating Transaction Rules](https://help.monarch.com/hc/en-us/articles/360048393372-Creating-Transaction-Rules)
- [Editing Transactions](https://help.monarch.com/hc/en-us/articles/360048393532-Editing-Transactions)
- [Reviewing Transactions](https://help.monarch.com/hc/en-us/articles/5528707082516-Reviewing-transactions)
- [Tracking Recurring Expenses and Bills](https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills)
- [Using Save Up Goals](https://help.monarch.com/hc/en-us/articles/44373182867476-Using-Save-Up-Goals)
- [International Accounts and Currency](https://help.monarch.com/hc/en-us/articles/360048393552-International-Accounts-and-Currency)
- [Understanding Data Providers and Connections](https://help.monarch.com/hc/en-us/articles/33707613533972-Understanding-Data-Providers-and-Connections-in-Monarch)

### User-report signals

- [Recurring merchant limitations](https://www.reddit.com/r/MonarchMoney/comments/1vtntd8/how_is_the_recurring_merchants_feature_so_bad/)
- [Multiple recurring items from the same merchant](https://www.reddit.com/r/MonarchMoney/comments/1unqr66/recurrings_from_same_merchant/)
- [Goals 3.0 complexity](https://www.reddit.com/r/MonarchMoney/comments/1tdirbz/monarch_budget_30_is_the_worst_thing_ive_ever/)
- [Missing transactions](https://www.reddit.com/r/MonarchMoney/comments/1ree3nx/monarch_deleting_transactions/)
- [Individual budget request for couples](https://www.reddit.com/r/MonarchMoney/comments/1rnr7wo/shared_views_individual_budget_yet/)

