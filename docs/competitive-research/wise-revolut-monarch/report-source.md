# Wise, Revolut, and Monarch: UX, UI, and Product Logic Deep Dive

Research date: 1 September 2026  
Purpose: identify the strongest interaction patterns, product logic, and gaps that should inform Wollie.

## Research method and limits

This report combines current official product pages, help centres, pricing pages, annual reports, and public product updates with selected Reddit posts used only as anecdotal signals. Official sources are treated as evidence of product behaviour. Reddit posts are not treated as representative evidence; they are used to expose recurring confusion, trust issues, and unmet needs worth validating with users.

The products solve different jobs. Wise is primarily an international money account and transfer product. Revolut is a broad digital banking super-app. Monarch is a subscription-based financial planning layer that aggregates external accounts. Comparing isolated screens without this context would be misleading.

## Executive conclusion

The best Wollie direction is not to imitate any one competitor. It is to combine three strengths while preserving a narrower, calmer mental model:

1. Wise's clarity about balances, transactions, and what money is actually available.
2. Revolut's immediacy, automation, and strong distinction between personal and joint financial containers.
3. Monarch's household-wide aggregation, transaction review, rules, budgets, goals, and reports.

Wollie's strongest defensible gap is a couples-first planning layer across joint, separate, or mixed bank accounts. The product should support proportional income contributions, separate everyday spending from future reserves, and provide real privacy controls. None of the three competitors combines these capabilities cleanly.

The most important product rule is to keep two layers visibly separate:

- Bank reality: balances, transactions, transfers, and money that actually moved.
- Wollie plan: virtual amounts assigned to spending, tax, pension, savings, and goals.

Wollie must never make a virtual assignment look like an actual bank transfer. A pension goal is "planned" until an outgoing pension transfer is detected or explicitly confirmed.

## Product-position map

| Product | Primary job | Where money lives | Household model | Core strength | Core weakness |
|---|---|---|---|---|---|
| Wise | Hold, convert, send, and spend internationally | Inside Wise | Owner-led shared spending | Simple money movement and fee clarity | Not a household planning system; shared access is not a true joint account |
| Revolut | Daily digital banking and financial services | Inside Revolut, with some external aggregation | True two-person joint account plus personal accounts | Real-time automation and breadth | Feature density, regional complexity, and fragmented joint analytics |
| Monarch | Understand and plan money across institutions | At connected banks; Monarch is a planning layer | One shared household subscription | Rich planning, review, rules, goals, and reports | Sync trust, no true private account boundary, and high complexity |
| Wollie opportunity | Coordinate a couple's complete money life | Across joint, separate, or mixed banks | Household plan with real visibility choices | Calm cross-bank coordination and fair contributions | Must earn trust in bank sync, categorisation, and plan maths |

## Wise deep dive

### Product mental model

Wise starts with accounts and currencies. The home experience foregrounds total balances, individual currency balances, cards, and recent transactions. The experience is operational: the user wants to know what they hold, what moved, what a conversion costs, and whether a transfer is complete.

The public interface is comparatively restrained. It uses light surfaces, simple lists, direct labels, and limited dashboard decoration. This is one reason money movement feels understandable even when the underlying international payment system is complex.

### Information architecture

The main user objects are:

- Accounts and currency balances
- Transactions and transfers
- Cards, including digital cards
- Jars for setting money aside
- Spend with others for delegated/shared spending

These objects remain close to the bank ledger. Wise does not publicly present a full household budget with category targets, income allocation, monthly rollovers, or cross-bank goals.

### Shared money logic: Spend with others

Wise's Spend with others feature is not a joint account. One owner legally owns and controls all money, including funds added by members. The owner can add and remove members and manage the group. Members can add money, see transactions, and spend from the group, but cannot send, withdraw, convert, or manage the group.

This makes the feature suitable for controlled shared spending, such as groceries, travel, or a team expense pool. It is less suitable as the emotional and legal centre of an equal household. The owner/member asymmetry is important and must be explicit in any comparison.

Regional group limits vary. Wise's current help material describes a two-person limit in the EU and larger group limits in some other regions.

### Jars and scheduled transfers

Jars separate money from the main spendable balance. Money in a Jar cannot be spent with the Wise debit card or used for direct debit, reducing accidental spending. Users can move money between balances and Jars and can schedule transfers.

The crucial UX property is that a Jar is backed by actual money held inside Wise. It is not merely a virtual budget label. That makes the number concrete, but it also means Wise is not automatically coordinating plans across external bank accounts.

### Transactions, cards, and feedback

Wise's transaction list is successful because it stays close to questions a user asks after money moves: who, how much, which currency, status, and fee. The card experience focuses on operational controls and digital card safety rather than a long budgeting workflow.

Wise's annual report screenshots show a compact Account screen with balances and recent activity in a single hierarchy. This is a strong reference for Wollie's Accounts page and transaction detail layout.

### Wise strengths

- Clear balance and transaction hierarchy.
- Strong trust cues around exchange rate, fee, status, and destination.
- Jars have an unambiguous relationship to actual money.
- Shared spending is simple to start and constrained enough to understand.
- The interface generally avoids the density of a full financial super-app.

### Wise weaknesses and product gaps

- Spend with others is owner-controlled and is explicitly not a joint account.
- It does not solve equal household ownership or granular privacy across separate banks.
- Official public materials emphasise balances, Jars, and shared spending rather than a full household budget.
- Shared planning is tied to money moved into Wise, not a neutral cross-bank view.
- The product is optimized for transactions, not explaining how two incomes support a shared month.

### What Wollie should borrow from Wise

- A simple Accounts page: bank, owner, balance, sync time, and recent transactions.
- Clear status language that distinguishes pending, completed, and failed events.
- Explicit statements about whether an amount is real money or a plan amount.
- Low visual noise around transaction history.

### What Wollie should not copy

- An owner/member model presented as household equality.
- A single pool that requires users to move all shared money into the product.
- Jars as the only answer to savings, tax, pension, and long-term planning.

## Revolut deep dive

### Product mental model

Revolut is a bank-like super-app. It combines personal accounts, a joint account, cards, Pockets, savings, investments, analytics, subscriptions, and other services. Its strongest emotional promise is immediacy: actions feel live, balances update quickly, cards can be controlled instantly, and money can be sorted as it arrives.

The UI is visually expressive and personalized. It uses high-contrast cards, imagery, animated states, and many shortcuts. This makes the product feel powerful, but also increases discovery and comprehension costs.

### Personal and joint account structure

The joint account is a separate shared account for two eligible Revolut customers. Both people must already have verified personal Revolut accounts, be under the same Revolut entity/country, be contacts, and not already belong to another joint account. The invited person must accept.

Both holders can add, spend, withdraw, and manage money. Joint spending requires cards linked specifically to the joint account; personal cards cannot simply be relinked. This creates a clean ledger boundary but also introduces a "third account" mental model for couples who already think in terms of two personal accounts.

### Income Sorter

Income Sorter is Revolut's most relevant automation pattern for Wollie. It recognizes a recurring income using employer, description, and an amount tolerance. When the income arrives, it can distribute actual money to destinations such as the joint account, Pockets, Savings, Investments, or another person.

Users can configure one-time or recurring distributions and use fixed amounts. The current help material says only one recurring income can be configured per personal account. This is operationally useful, but it is not the same as a household plan that continuously recalculates proportional contributions from multiple incomes.

Wollie's opportunity is to make the allocation logic household-wide. Each income can contribute to the same targets in proportion to remaining monthly gaps, while preserving who received and who contributed the money.

### Pockets and savings

Pockets support short-term expenses and goals. Group Pockets add an admin/member model; the administrator controls withdrawal permissions. Joint savings are also available in some markets.

Like Wise Jars, these containers can represent actual segregated money. The user benefits from a strong connection between action and balance. The tradeoff is that planning becomes distributed across many objects and tabs.

### Analytics and categories

Revolut's Analytics dashboard includes spending, income, cash flow, total wealth, budgets, and Income Sorter. Users can analyze by category, merchant, country, currency, or card and create custom categories with a name, color, and icon.

The official help centre currently notes an important limitation: the spending view excludes internal transfers, Pocket top-ups, and joint accounts. This means a user can have a strong personal analytics view while still lacking one clean household truth. The limitation is especially relevant to Wollie because a joint account should not disappear from household spending analysis.

### Revolut strengths

- True shared bank account with equal operational access.
- Fast feedback and direct control over cards and money.
- Income Sorter turns rules into concrete money movement.
- Custom categories and multiple analytics breakdowns are flexible.
- The product makes automation feel useful rather than abstract.

### Revolut weaknesses and product gaps

- Breadth creates a dense, shifting information architecture.
- Joint account eligibility and setup rules create hidden prerequisites.
- Personal, joint, Pocket, savings, and investment views can fragment the household picture.
- Current analytics help material says joint accounts are excluded from the spending section.
- Income automation is tied to supported account events and does not provide a neutral plan across all partner banks.

### Anecdotal user pain points to validate

Public Reddit discussions repeatedly surface confusion about needing two personal accounts before opening a joint account, errors during joint setup, loss or changes in historical analytics after updates, and Pockets not appearing as expected in analytics. These reports are anecdotal, but they point to a broader risk: a banking super-app can make technically correct money states hard to reconcile.

### What Wollie should borrow from Revolut

- Immediate feedback when income or a purchase changes the plan.
- A visible rule preview before automation is enabled.
- Rich but optional transaction categorisation.
- A clear shared account concept when an account is genuinely joint.
- Strong action confirmations and understandable failure states.

### What Wollie should not copy

- A super-app homepage with too many competing financial products.
- Hidden regional prerequisites during partner onboarding.
- Separate analytics that omit joint activity.
- Automatic money movement implied by a plan unless Wollie actually executes it.

## Monarch deep dive

### Product mental model

Monarch is the closest direct reference for Wollie. It is a read-and-plan layer over connected financial institutions. Couples can connect separate and joint accounts, view household cash flow and net worth, categorize transactions, build a shared budget, create goals, and review recurring expenses.

Because Monarch does not hold the money, its UI must continuously translate messy bank data into a coherent planning model. This is both its advantage and its greatest trust risk.

### Household and ownership model

A Monarch household uses one subscription and separate logins. Members generally see the same financial data. Shared Views lets users mark accounts and transactions as Shared or Individual and filter Accounts, Transactions, Reports, and Cash Flow by owner.

The most important limitation is that ownership is a filtering and attribution system, not a privacy boundary. Monarch's help centre explicitly says household members still have full visibility. The household also has one shared budget. This works for couples who want total transparency, but not for couples who want selective privacy, personal discretionary space, or household totals without transaction details.

Invitation flow has another sharp edge: a person with an existing Monarch account cannot simply join another household with that same account. The help article instructs them to use another email/new account or delete the existing account. Removing a household member can also remove accounts they added. These are high-friction lifecycle details.

### Transactions, categories, tags, and rules

Monarch's transaction system is mature. Each transaction has one category and can have multiple tags. Rules can match merchant, amount, category, or account, then rename, categorize, tag, hide, mark for review, or link to a goal. Rule order matters.

The Needs Review flow is especially useful for couples. A transaction can be assigned to self, partner, or another household member. Mobile swipe actions make review faster. This creates a lightweight collaboration loop instead of requiring a monthly spreadsheet reconciliation.

The downside is automation complexity. Users must understand categories, tags, merchant normalization, rule order, review ownership, and goal linking. Wollie should preserve the review queue but provide fewer concepts in the first-run experience.

### Budget logic

Monarch supports Category budgeting and Flex budgeting. Its budget is monthly cash-flow based, not directly driven by account balances. Expected income, planned expenses, and planned savings are combined to show the monthly picture. Historical averages can seed targets, categories may have zero planned budget while still showing spending, and rollover carries remaining amounts forward.

Flex budgeting groups the plan into fixed costs, non-monthly costs, and flexible spending. This is a strong attempt to match how people actually think. It reduces the burden of assigning a strict limit to unpredictable categories such as health.

However, the product still exposes many labels and calculations. Public complaints often focus on difficulty understanding "left to spend," changes to budget logic, and how goals affect cash flow.

### Goals

Monarch's goals connect contributions and account balances to future outcomes. The product has continued rebuilding its goals experience through 2026, which is evidence that long-term planning is intrinsically difficult.

The key UX problem is mixing three different things: a planned monthly contribution, an actual transfer or investment purchase, and a changing asset balance. Wollie should display these separately. Market growth is not a contribution, and a planned pension amount is not saved until a matching transfer is detected or confirmed.

### Recurring expenses and bills

Monarch automatically detects recurring merchants, transfers, and paychecks, then shows them in a calendar or list. The system uses distinct states for paid, changed amount, and upcoming. Credit-card and loan bill syncing can surface statement and due-date information in supported regions.

This is useful for forecasting, but recurring detection is probabilistic. The official help material documents limits such as one recurring profile per merchant and special handling for overdue items. Wollie should show confidence, make corrections easy, and never present a detected bill as unquestionable truth.

### Reports

Monarch offers Cash Flow, Spending, Income, and other interactive reports with filters, saved views, and downloads. Cash Flow remains useful even without a budget, which is an important design principle: users should receive value before completing a planning setup.

The full report experience is primarily web-based according to current help material. The reporting layer is powerful, but can feel separate from the daily transaction and plan workflows.

### Monarch strengths

- Best of the three at cross-bank household aggregation.
- Strong transaction review, categorisation, tagging, and rules.
- Supports both detailed category budgets and flexible spending models.
- Goals, recurring expenses, and reports create a complete planning system.
- Couples receive separate logins and a shared operational workspace.

### Monarch weaknesses and product gaps

- Shared/Individual ownership is not privacy; household members retain full visibility.
- Bank synchronization and duplicate transactions can undermine the entire experience.
- The planning model has many interacting concepts and can become hard to explain.
- Invitation and household lifecycle constraints are surprisingly strict.
- The product is limited to the United States and Canada and is priced as a premium subscription.

### Anecdotal user pain points to validate

Reddit discussions frequently mention broken or stale connections, duplicate transactions, inability to hide private accounts or transactions from a partner, confusion after budget/goal changes, and recurring-item automation that is hard to control. These are not prevalence estimates. They are design warnings for any aggregation product: trust depends more on correct, explainable data than on the number of features.

### What Wollie should borrow from Monarch

- One household workspace across multiple banks.
- A Needs Review queue for uncertain category or ownership.
- Category rules with a clear preview and undo.
- Value before setup: cash flow and categorized spending should work without a completed plan.
- A flexible-spending option for unpredictable categories.

### What Wollie should not copy

- Ownership labels that look like privacy controls but are not.
- A single mandatory transparency model for every couple.
- Too many planning concepts exposed at once.
- Goals that blur planned, contributed, and current balance.

## Cross-product UX comparison

| UX question | Wise | Revolut | Monarch | Wollie recommendation |
|---|---|---|---|---|
| What is the homepage for? | Balances and recent activity | Launcher for a broad financial super-app | Household financial overview | Four household facts, then clear next actions |
| How are partners represented? | Owner and spending member | Equal joint holders plus personal accounts | Household members with shared visibility | Equal members with explicit privacy and contribution rules |
| Is money actually moved? | Yes, inside Wise | Yes, inside Revolut | No; planning/aggregation only | No by default; show actual transfers separately |
| How is income handled? | Received into a balance; scheduled transfers possible | Income Sorter distributes actual money | Categorized and used in cash-flow/budget | Detect income and proportionally fill plan targets |
| How are flexible expenses handled? | Not a full budgeting model | Categories/budgets in analytics | Flex budget and zero-budget tracked categories | Track-only category or optional monthly spending target |
| How are savings/goals handled? | Jars with actual money | Pockets, Savings, Investments | Goal plans linked to accounts | Plan, detected contribution, and real balance shown separately |
| How are mistakes corrected? | Transaction/support workflows | Transaction controls and categories | Review queue, rules, tags, edits | Review queue with preview, undo, and confidence |
| Is privacy supported? | Owner/member asymmetry | Personal vs joint account boundary | No private data inside a household | Private, shared detail, or household-total-only |

## Five critical user journeys

### 1. A salary arrives

Wise records the real deposit in a balance. Revolut can trigger Income Sorter and move actual funds. Monarch categorizes the deposit and recalculates the monthly cash-flow plan.

Wollie should show: "€10,000 income received" followed by a transparent proportional allocation preview. If the total monthly targets are €17,000, each target receives the same percentage of its remaining gap. Later income continues filling the remaining gaps. No priority queue is implied unless the couple explicitly chooses one.

### 2. A grocery card purchase appears

The transaction should be categorized as Groceries, mapped to Food, and deducted from Food's available spending. If Food has €1,000 assigned and the purchase is €200, the user sees €800 left. The transaction belongs in Bank reality; the €800 is a plan calculation.

The interface should not repeat the full envelope state under every transaction. Show a compact category chip in the list and the impact on the plan in transaction detail or on demand.

### 3. Money is reserved for pension or tax

An assigned amount is not yet saved or spent. Wollie should display three independent states:

- Planned this month
- Actually transferred or contributed
- Current connected balance, if available

Moving €4,000 to a pension account should not inflate an everyday "Spent this month" number. It belongs under Saved / invested or Reserve contributions.

### 4. A partner is invited

The invitation should explain whether the partner can sign in or create an account, what they will see, and whether an existing account can join. Privacy choices should be shown before banks are connected, not buried afterward.

The clean model is: one household, two member identities, multiple accounts, and per-account visibility. Account ownership, transaction attribution, and visibility are separate fields.

### 5. A transaction is uncertain

Wollie should automatically categorize high-confidence transactions. Low-confidence items enter Needs review. A review card asks one question at a time: category, household/personal ownership, or transfer detection. The user can apply the answer once or create a future rule.

## Recommended Wollie information architecture

Keep the primary navigation narrow:

1. Overview
2. Transactions
3. Money plan
4. Recurring
5. Accounts

Household, pricing, and settings can remain secondary. Money plan contains two tabs: Spending this month and Savings & reserves. This preserves one mental home for planning without mixing everyday spend limits with long-term funding progress.

### Overview

Show no more than four core numbers:

- Income received this month
- Everyday spending left
- Saved or invested this month
- Needs review count

Below the summary, show the next useful action, recent household activity, upcoming recurring items, and plan exceptions. Avoid showing "assigned" and "set aside" totals beside spendable money without definitions.

### Transactions

Default list rows should show merchant, date, amount, category, account, and status. Household attribution may appear as a compact avatar or label. Envelope impact belongs in detail, not repeated as a sentence under every row.

Above the list, show total spending for the selected period and a category breakdown. Track-only categories such as Health should show spend totals without requiring a monthly target.

### Money plan: Spending this month

Each spending category should show assigned, spent, and left. Funding progress and spending progress are visually different states:

- Neutral or green for funding progress.
- Amber near the spending limit.
- Red only when genuinely over the spending amount.

Unfunded does not mean failed. It means current income has not yet filled the target.

### Money plan: Savings & reserves

Savings, pension, tax, and future goals show planned contribution, assigned plan amount, actual contribution detected, and remaining monthly gap. The main bar can be green for actual progress. Red is reserved for an overdue required reserve or a broken contribution, not simply a target that is still filling during the month.

### Recurring

Use a compact monthly list, not a separate second budget. Each item shows expected date, expected amount, status, and confidence. Bills can map to spending categories, but their job is forecasting and reminders. Rent can appear in the Money plan and in Recurring without duplication because one is a spending allowance and the other is an expected transaction.

## Core domain model for Wollie

The following concepts should remain distinct in data and UI:

| Concept | Meaning |
|---|---|
| Household | The collaboration boundary for members and shared planning |
| Member | A person with an identity, role, and visibility permissions |
| Account | A real connected bank, card, savings, investment, or manual account |
| Account ownership | Who legally/operationally owns the account |
| Visibility | Private, shared detail, or household total only |
| Transaction attribution | Who paid or who the transaction is associated with |
| Category | What the transaction represents, such as Groceries or Health |
| Plan item | A spending target, reserve, or goal for a time period |
| Plan assignment | Virtual allocation of recognized income to a plan item |
| Actual contribution | A detected or confirmed transfer into a reserve/goal destination |
| Rule | A transparent automation that proposes or applies classification/allocation |

Combining any of these fields creates misleading states. For example, "Liya's account" does not imply "private," and assigning €5,000 to Pension does not mean €5,000 was transferred.

## Recommended automation logic

### Income allocation

Default to proportional filling across remaining monthly targets:

`allocation to item = received income × item remaining gap / total remaining gaps`

This matches the approved Wollie concept and supports multiple irregular incomes without creating an arbitrary priority order. Couples may later opt into priority or minimum-first rules, but the default should be explainable in one sentence and previewed before it changes the plan.

### Transaction classification

Use three confidence states:

- High confidence: categorize automatically and show a small "automatic" indicator in detail.
- Medium confidence: categorize provisionally and place in Needs review.
- Low confidence: leave uncategorized and ask one focused question.

Every automation needs an undo path and a clear answer to "why did Wollie do this?"

### Transfers and repayments

Internal transfers and credit-card repayments must be linked so household spending is not counted twice. The user-facing explanation can be simple: "Card purchases count as spending. Paying the card bill does not count again." Detected pension, savings, and investment transfers should count as contributions, not everyday spending.

## Visual design principles

### Use calm hierarchy, not empty minimalism

Wise demonstrates how a restrained list can build trust. Monarch demonstrates the value of dense information when it is grouped. Revolut demonstrates the emotional value of immediacy and personality. Wollie should use calm surfaces, warm illustration, and strong typography, while reserving saturated colour for status and action.

### Make colour semantic

- Navy or dark blue: navigation, totals, and stable information.
- Green: healthy actual progress or completed contribution.
- Amber: close to a spending limit, a due item, or a review warning.
- Red: genuine overspending, failed sync, failed payment, or overdue required reserve.
- Neutral grey: target still filling, inactive, or informational.

Funding progress should not turn red merely because the month is incomplete.

### Prefer progressive disclosure

The list view answers "what happened?" The detail view answers "why, who, and how did this affect the plan?" Settings answer "what should happen next time?" Do not put all three layers in one row.

### Design for reconciliation

Financial confidence comes from being able to trace a number. Every dashboard total should open to the transactions or plan calculations that compose it. This is more important than adding more charts.

## Competitive strengths and weaknesses summary

### Wise

Best at: clean operational money UI, fee transparency, multi-currency balances, simple Jars.  
Weakest at: equal household collaboration, cross-bank planning, monthly budgets and goals.  
Strategic lesson: clarity comes from staying close to the ledger.

### Revolut

Best at: instant controls, actual-money automation, true joint account, engaging UI.  
Weakest at: complexity, regional variation, and a fragmented household analytics model.  
Strategic lesson: automation feels valuable when users see a direct action and result.

### Monarch

Best at: account aggregation, household planning, review, rules, goals, reports.  
Weakest at: synchronization trust, conceptual density, and real privacy.  
Strategic lesson: a planning layer wins on reconciliation and explainability, not feature count.

## Product decisions recommended for Wollie

### Build now

1. Household-wide Overview with traceable totals.
2. Transactions with categories, totals, Needs review, and rules.
3. Money plan split into Spending this month and Savings & reserves.
4. Proportional allocation of recognized income, with a visible preview.
5. Real account visibility controls: private, shared detail, and household total only.

### Build next

1. Recurring detection with confidence and correction.
2. Partner Light role for participation without full financial disclosure.
3. Contribution fairness views: fixed, equal, and proportional.
4. Goal destination matching and actual contribution detection.
5. Audit trail and undo for automatic rules.

### Avoid until the core is trusted

1. Executing transfers or moving money.
2. Investment trading, cards, or a broad financial marketplace.
3. Dozens of dashboard widgets.
4. Complex forecasting that users cannot reconcile.
5. Gamification that turns overspending into shame.

## Source index

### Wise official sources

- Spend with others help: https://wise.com/help/articles/4nyqakqieuWseODSZAUCzi/how-to-use-spend-with-others
- Spend with others product page: https://wise.com/p/spend-with-others
- Jars: https://wise.com/help/articles/2978074/what-are-jars-and-how-can-i-keep-money-in-them
- Scheduled transfers: https://wise.com/help/articles/2978063/what-are-scheduled-transfers
- Pricing: https://wise.com/gb/pricing/
- FY2025 annual report: local research copy based on Wise investor materials

### Revolut official sources

- Joint account setup: https://help.revolut.com/en-BE/help/profile-and-plan/joint-accounts/how-to-set-up-a-joint-account-with-revolut/
- Joint withdrawals: https://help.revolut.com/en-BE/help/profile-and-plan/joint-accounts/can-both-account-holders-withdraw-from-a-joint-account/
- Income Sorter: https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/using-the-income-sorter-feature/
- Pockets: https://help.revolut.com/en-BE/help/app-features/vaults/what-are-revolut-vaults/
- Analytics: https://help.revolut.com/en-NL/help/accounts/budget-and-analytics/how-can-i-see-my-spending-and-income-analytics/
- Cash flow: https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/how-can-i-see-my-cashflow-analytics/
- Custom categories: https://help.revolut.com/en-IE/help/accounts/budget-and-analytics/how-to-create-and-manage-custom-categories-for-transactions/
- Belgian pricing: https://www.revolut.com/en-BE/our-pricing-plans/
- FY2025 annual report: https://assets.revolut.com/pdf/annualreport2025.pdf

### Monarch official sources

- Couples: https://www.monarch.com/for-couples
- Shared Views: https://help.monarch.com/hc/en-us/articles/42228648365076-Shared-Views-in-Monarch
- Household: https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples
- Budget: https://help.monarch.com/hc/en-us/articles/360048883631-Understanding-Your-Budget-in-Monarch
- Rollovers: https://help.monarchmoney.com/hc/en-us/articles/4411119762196-Rollover-budget-feature
- Transaction rules: https://help.monarchmoney.com/hc/en-us/articles/360048393372-Transaction-rules
- Reviewing transactions: https://help.monarch.com/hc/en-us/articles/5528707082516-Reviewing-transactions
- Recurring expenses: https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills
- Bill sync: https://help.monarch.com/hc/en-us/articles/29446697869076-Getting-started-with-bill-syncing
- Reports: https://help.monarch.com/hc/en-us/articles/21846787088916-Using-Reports
- Cash Flow: https://help.monarch.com/hc/en-us/articles/20504904768020-Cash-Flow
- Product updates: https://www.monarch.com/whats-new
- Pricing: https://partners.monarchmoney.com/pricing and https://www.monarch.com/blog/monarch-plus

### Anecdotal user sources

- Wise and Revolut comparison discussion: https://www.reddit.com/r/ExpatFinance/comments/1rrl2iu/anyone_using_both_wise_and_revolut_accounts/
- Revolut joint-account mental model: https://www.reddit.com/r/Revolut/comments/1ve5lvm/gb_joint_accounts/
- Revolut joint-account setup errors: https://www.reddit.com/r/Revolut/comments/1dde3g2/i_cant_make_a_joint_account/
- Revolut analytics history complaint: https://www.reddit.com/r/Revolut/comments/1n3k1wl/3_years_of_analytics_gone_after_the_last_update/
- Revolut Pockets analytics complaint: https://www.reddit.com/r/Revolut/comments/1aw4hr5
- Monarch sync complaint: https://www.reddit.com/r/MonarchMoney/comments/1vujxdx/account_syncing_is_the_product/
- Monarch duplicate transaction complaint: https://www.reddit.com/r/MonarchMoney/comments/1b5mkwj/sync_issues_and_duplicate_transactions_undermine_trust_what_are_we_paying_for/
- Monarch private data request: https://www.reddit.com/r/MonarchMoney/comments/1v4m9rv/private_budgets_and_transactions/
- Monarch goals criticism: https://www.reddit.com/r/MonarchMoney/comments/1qgte8x/the_new_goals_system_is_a_massive_downgrade_and_i/
- Monarch budget criticism: https://www.reddit.com/r/MonarchMoney/comments/1tdirbz/monarch_budget_30_is_the_worst_thing_ive_ever/

