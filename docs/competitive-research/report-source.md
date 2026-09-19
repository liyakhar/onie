# Couples finance apps: product, UX and market research

**Prepared for:** Wollie  
**Date:** 1 September 2026  
**Scope:** European couples using joint, separate, or mixed accounts

## Executive conclusion

The strongest opportunity is not another budgeting tool or another bank account. Wollie should be a **couples-first money planning layer** over the accounts people already use. It should work equally well when a couple has one joint account, separate personal accounts, or both.

The recurring problem across products and user discussions is simple: shared life costs need a shared plan, while people still want autonomy, privacy, and low-effort participation. Current products usually force a trade-off:

- Banks such as Revolut and Wise are good at holding or spending shared money, but they are not a complete household planning system across external accounts.
- Planning tools such as YNAB and Monarch provide capable budgets, but shared money often requires separate setups, manual contribution maths, or broad visibility into a partner's accounts.
- Wallet and Spendee make sharing possible, but their model is typically a shared wallet or a separate group context, not one household plan that safely spans personal and joint accounts.

**Recommendation:** build Wollie around a shared household plan with clear permission levels, contribution rules, separate treatment of everyday spending and future reserves, and a light-weight partner experience.

## The product category Wollie should own

### Positioning

**Money planning, built for couples.**

Plan spending, savings, tax, pension, and future goals across the accounts you share and the ones you keep.

Wollie is not a bank, a joint account, or a money-moving service. It is a read-only planning layer that makes a couple's existing money easier to understand and decide on together.

### Who it is for

- Couples who have separate accounts, one joint account, or a mixture of both.
- Couples who want a shared plan without needing to merge every account or reveal every personal transaction.
- A household where one person enjoys money planning and the other mainly wants a clear answer to “what is safe to spend?”

### The critical distinction

| Everyday spending | Future reserves |
| --- | --- |
| Food, travel, rent, personal spending and similar categories. | Savings, tax, pension, investment, a future purchase or a trip fund. |
| A purchase reduces what is left to spend this month. | Funding builds progress toward a target. An allocation is not shown as “spent.” |
| Useful states: available, getting low, over. | Useful states: set aside, progress to target, short of target. |

This distinction should appear everywhere Wollie shows money. It avoids the confusing idea that pension or savings is “spent” simply because it was planned or transferred.

## What couples use today

| Product | What it does well | Household model | Main friction for couples | Lesson for Wollie |
| --- | --- | --- | --- | --- |
| [YNAB](https://www.ynab.com/pricing/) | Deep intentional budgeting, mature education and rules. | One subscription can be shared with up to five people. Couples can use a joint, separate, or mixed structure, often through multiple plans. | Setup architecture and manual contribution maths can become complex. The group manager has broad plan visibility. | Make the default household setup simpler and visibility more granular. |
| [Monarch Money](https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples-and-Households) | One shared household dashboard across both partners’ accounts. | One subscription, separate logins, shared data. | Once partnered, household members cannot hide an account or transaction. Existing users cannot be invited using their current account email. | Privacy and invitation recovery must be first-class, not an afterthought. |
| [Wallet by BudgetBakers](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing) | Clear personal money screens, group permissions, useful tracking basics. | A Premium owner creates a group; members join free and switch between personal and group contexts. | Group sharing is not available on the web; new group members initially receive access to all accounts; personal and group records stay separate. | Do not make people context-switch between “my money” and “our money.” |
| [Spendee](https://help.spendee.com/article/224-shared-wallets) | Easy category-first experience and simple shared-wallet concept. | Owner pays for a shared wallet; guests are free. | Bank wallets cannot be shared, and budgets are individual settings rather than a shared household plan. | A shared plan must be able to interpret both bank-linked and manual money. |
| [Revolut](https://assets.revolut.com/pdf/annualreport2025.pdf) | Joint bank account behaviour, cards, joint Pockets and local banking experience. | True joint account for eligible customers. | Excellent for money inside Revolut, but it does not solve household planning across every external bank. | Meet the mental model users learn from banks, without becoming a bank. |
| [Wise](https://wise.com/help/articles/4nyqakqieuWseODSZAUCzi/how-to-use-spend-with-others) | Cross-border money and controlled shared spending in supported markets. | “Spend with others” groups; in the EEA it is not a general joint-account replacement. | The owner legally controls the group funds and members have limited capabilities. | Be explicit about ownership, permissions and the fact that Wollie never holds money. |

## Trial-account UX gallery

The images in this report were captured in safe, zero-data research accounts on 1 September 2026. No bank accounts were connected, no identity verification was submitted, and no money was moved. They show representative main screens rather than every workflow.

### YNAB: collaborative budget onboarding

Observed strength: a guided first-use flow introduces planning behaviour before exposing a dense budget. It makes a household plan feel intentional and progressive.

Observed risk: couples can need multiple budgets, separate handling for personal money, and manual transfers or contribution calculations. [YNAB’s own couples guide](https://www.ynab.com/guide/budgeting-as-a-couple) supports joint, separate and mixed setups, but that flexibility also creates setup choices.

### Wallet by BudgetBakers: calm dashboard and account list

Observed strength: the information architecture is straightforward: Dashboard, Accounts, Records, Analytics and Imports. It makes a personal tracker feel approachable.

Observed risk: group sharing is a separate group model. The official support article says a new group member is initially given access to all accounts, group sharing is unavailable on the web, and users need to switch between personal and group wallets. [Source](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing)

### Spendee: simple shared-wallet idea, early monetisation boundary

Observed strength: it frames the product around wallets and categories, which is easy to understand.

Observed risk: in the trial account, adding a second wallet immediately opened a Premium paywall. The product’s shared-wallet model is simpler than a household plan, and [Spendee’s documentation](https://help.spendee.com/article/224-shared-wallets) says bank wallets cannot be shared.

## What real users repeatedly struggle with

The following are qualitative signals from public Reddit discussions. They are not representative survey results. They are useful because the same themes appear across multiple products and countries.

### 1. Shared costs, personal autonomy

Couples want to plan rent, groceries and trips together while retaining personal spending and surprise gifts. Threads about [YNAB privacy and gifts](https://www.reddit.com/r/ynab/comments/z2tt2y) and [Monarch individual views](https://www.reddit.com/r/MonarchMoney/comments/18p4ea0) show that “everything visible to both” is often too blunt.

**Wollie implication:** make visibility a deliberate setting at account, transaction and category level. Use simple choices: Private, Shared with partner, Household total only.

### 2. One person runs the plan

Many households have a “money person” and a partner who does not want to do daily categorisation. This appears in a [YNAB collaboration thread](https://www.reddit.com/r/ynab/comments/1swe8xf/need_advice_for_couples_collab_in_ynab/) and a [Monarch household thread](https://www.reddit.com/r/MonarchMoney/comments/1tzf5ub/options_for_household_members/).

**Wollie implication:** offer a Partner Light role. It should show current shared status, proposed changes, bills and a weekly summary without turning the partner into a full-time budget operator.

### 3. Separate cards create manual maths

People commonly describe the awkwardness of shared credit cards, personal cards and paybacks. Examples include [a shared-account YNAB setup](https://www.reddit.com/r/ynab/comments/1tjdej2/how_to_budget_a_shared_bank_account/) and [a request for automatic partner budget splits in Monarch](https://www.reddit.com/r/MonarchMoney/comments/160b0lw).

**Wollie implication:** let a household define how a category is funded: equal, fixed amount, percentage of income, or fully shared. Surface expected and actual contributions without requiring a spreadsheet.

### 4. People do not want to switch worlds

Wallet’s group model mirrors a common weakness: personal records and group records live separately. Users have reported needing a personal and a group structure for joint and personal accounts. [Example discussion](https://www.reddit.com/r/BudgetBakers/comments/18wjv9b)

**Wollie implication:** one household plan can include a private account without automatically exposing it. Filters and visibility should change the view, not move the user to another product space.

### 5. The plan goes stale when decisions are unclear

In shared planning, a large adjustment often needs a conversation. [YNAB users describe this friction](https://www.reddit.com/r/ynab/comments/1kpon50), especially when one person moves money without a clear record of the decision.

**Wollie implication:** make material changes visible as small proposals: “Move €200 from Travel to Food?” Include who proposed it, who confirmed it, and a lightweight decision history.

## UX principles for Wollie

### 1. Start with the couple’s intent, not account architecture

Ask: “Which money do you want to plan together?” Then let them include joint accounts, selected personal accounts, or both. Do not force a choice between “joint” and “separate” before they see the model.

### 2. One shared plan, layered views

Use one underlying household plan with three view filters:

- **My view:** my accounts and my private categories.
- **Shared view:** money and categories both partners chose to share.
- **Household view:** the combined plan and totals, respecting privacy settings.

### 3. Separate funding from spending in the UI

At the top of the Money plan, use two tabs or sections:

- **Spend this month:** Food, travel, rent and discretionary categories. Show “€800 left to spend” after purchases.
- **Save and prepare:** Tax, pension, savings and future goals. Show “€2,250 set aside” and “45% of €5,000 target.”

Use red only for genuine overspending or an actionable overdue shortfall. A partially funded savings target is neutral progress, not a warning.

### 4. Make contribution logic visible

For each shared category or goal, show a plain rule and its result:

- “Food: funded 50/50.”
- “Tax: funded in proportion to income.”
- “Holiday: Liya €200, Alex €200 per month.”

When income arrives, Wollie distributes it according to the rule and clearly shows what is funded, what is still short, and why.

### 5. Make card spending feel automatic, not mysterious

Use a short explanation near transactions: “When a card purchase arrives, Wollie categorises it and updates that category’s balance.”

Show the category chip, the transaction amount, and the new remaining balance. Do not repeat the whole envelope status below every transaction.

## Recommended 90-day product priorities

1. **Household scope and permissions.** Define private, shared and household-total visibility. Make invite, accept, leave and revoke flows safe and simple.
2. **Contribution and funding rules.** Support fixed, equal and proportional-to-income funding per category or goal. Keep a clear audit trail.
3. **Spend versus reserve model.** Build distinct data and UI states for monthly spending categories and future reserves. Do not call a pension allocation “spent.”
4. **Partner Light experience.** Add a simple, mobile-friendly view with shared safe-to-spend, upcoming bills, approvals and a weekly digest.
5. **Monthly planning conversation.** Add a low-friction check-in: income received, funding progress, changes proposed and decision history.

## Product decisions Wollie should make now

### Permission model

| Level | Account balance | Transaction merchant | Category total | Can edit plan |
| --- | --- | --- | --- | --- |
| Private | Only owner | Only owner | Optional household roll-up | Owner only |
| Shared | Both partners | Both partners | Both partners | Based on household role |
| Household total only | Included in combined total | Hidden | Shared-category impact only | Owner controls source settings |

The “household total only” option is valuable. It lets a partner contribute to the shared plan without exposing every merchant.

### Invite flow

1. Invite by email.
2. Recipient sees: “Sign in or create an account to accept.”
3. If the address already has a Wollie account, accept the invite without changing its login.
4. Before connecting any account, choose its visibility: Private, Shared, or Household total only.
5. Confirm what each partner can see and change.

### Language to use

- “Money plan” instead of “budget” as the primary product label.
- “Spend this month” for day-to-day categories.
- “Save and prepare” for tax, pension, savings and future goals.
- “Set aside” or “funded” for a reserve, not “spent.”
- “Available to spend” only when it is explicitly connected to everyday categories.

## Competitive boundaries and trust

Wollie should not mimic a bank’s promise to hold or move money. Revolut’s 2025 annual report says it added 1 million Joint Accounts that year and includes joint histories, matching cards, joint budgeting tools, Pockets and savings functionality. That is a powerful expectation-setter for customers, but it is banking infrastructure rather than a cross-bank planning layer. [Source](https://assets.revolut.com/pdf/annualreport2025.pdf)

Wise’s “Spend with others” is an adjacent model. In supported regions, the group owner retains legal control over the funds and members receive selected spending capabilities. [Source](https://wise.com/help/articles/4nyqakqieuWseODSZAUCzi/how-to-use-spend-with-others)

Wollie’s trust promise should therefore be concise and concrete: **Wollie reads the accounts you choose. It never moves your money. You control what is shared.**

## Sources and method

### Official product sources

- [YNAB pricing and trial](https://www.ynab.com/pricing/), accessed 1 September 2026.
- [YNAB subscription sharing](https://www.ynab.com/features/subscription-sharing), accessed 1 September 2026.
- [YNAB guide to budgeting as a couple](https://www.ynab.com/guide/budgeting-as-a-couple), accessed 1 September 2026.
- [Monarch for Couples and Households](https://help.monarch.com/hc/en-us/articles/20926382202004-Monarch-for-Couples-and-Households), accessed 1 September 2026.
- [Monarch pricing](https://help.monarch.com/hc/en-us/articles/9136169422996-Pricing), accessed 1 September 2026.
- [Wallet group sharing](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing), accessed 1 September 2026.
- [Wallet overview](https://support.budgetbakers.com/hc/en-us/articles/12212428113810-What-is-the-Wallet-app), accessed 1 September 2026.
- [Spendee shared wallets](https://help.spendee.com/article/224-shared-wallets), accessed 1 September 2026.
- [Spendee Premium](https://help.spendee.com/article/202-what-is-spendee-premium), accessed 1 September 2026.
- [Revolut 2025 annual report](https://assets.revolut.com/pdf/annualreport2025.pdf), accessed 1 September 2026.
- [Wise: Spend with others](https://wise.com/help/articles/4nyqakqieuWseODSZAUCzi/how-to-use-spend-with-others), accessed 1 September 2026.

### Public user-discussion signals

- [YNAB: couples who track expenses together](https://www.reddit.com/r/ynab/comments/1ko2yhr/couples_who_track_expenses_together_how_do_you/)
- [YNAB: shared bank account setup](https://www.reddit.com/r/ynab/comments/1tjdej2/how_to_budget_a_shared_bank_account/)
- [YNAB: privacy and gifts](https://www.reddit.com/r/ynab/comments/z2tt2y)
- [YNAB: collaboration when one partner runs the budget](https://www.reddit.com/r/ynab/comments/1swe8xf/need_advice_for_couples_collab_in_ynab/)
- [Monarch: household member options](https://www.reddit.com/r/MonarchMoney/comments/1tzf5ub/options_for_household_members/)
- [Monarch: automatic partner budget splits](https://www.reddit.com/r/MonarchMoney/comments/160b0lw)
- [Wallet: joint and personal accounts](https://www.reddit.com/r/BudgetBakers/comments/18wjv9b)

### Method limitations

This is desk research plus three safe, zero-data trial accounts. It does not test live bank connections, regulated account opening, identity verification, paid subscriptions, support quality, account closure or long-term transaction classification. Public Reddit posts are qualitative and may be dated, incomplete or unrepresentative.
