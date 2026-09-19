# Wollie competition and product-market-fit assessment

Date: 31 August 2026

## Decision

Wollie should not compete as a generic budgeting or transaction-tracking app. That market is crowded and several European products already offer bank sync, categories, budgets, recurring payments, and shared accounts.

The strongest position to test is:

> Wollie is the calm shared money plan for couples whose money lives across separate banks. Income automatically funds everyday spending, savings, tax, pension, and future goals, while purchases update the plan for both partners.

This is a plausible wedge, not proven product-market fit. There is clear evidence that couples struggle with separate accounts, shared credit-card spending, three-budget workarounds, uneven engagement, and deciding what is safe to spend. There is not yet evidence that enough of them will pay Wollie.

## Competitive set

| Product | What it does well | Gap Wollie can target | Current public pricing signal |
| --- | --- | --- | --- |
| [Bilance](https://www.bilanceapp.com/features/shared-finances) | European bank sync, automatic categories, budgets, net worth, recurring payments, selective account sharing, and a polished couple view | Shared Finances currently leaves budgets, recurring payments, and tags personal. Wollie can make the actual spending-and-saving plan household-native | Belgian App Store lists €69.99/year; subscriptions may be per partner outside Apple Family Sharing |
| [YNAB](https://www.ynab.com/pricing) | Best-known envelope method, saving targets, strong education, and sharing for up to six people | Partially combined couples often maintain personal plans plus a third shared plan and manually handle contributions. Wollie can remove that administration | $109/year or $14.99/month |
| [Wallet by BudgetBakers](https://budgetbakers.com/en/products/wallet/) | Broad European bank aggregation, reports, budgets, planned payments, multiple currencies, and Group Sharing | Broad and feature-heavy. Group sharing is account-owner-centric rather than one automatic household income-and-goals plan | Free tier plus Premium; current price is shown in the app and lifetime offers exist |
| [Spendee](https://www.spendee.com/pricing) | Accessible visual tracking, bank sync, categories, budgets, and low price | Its help centre says connected bank wallets cannot be shared and budgets inside shared wallets remain individual. Wollie can make both shared | $35.99/year or $5.99/month for Premium |
| [Freenance](https://freenance.io/financial-tools/best-finance-app-for-couples-2026-europe-shared-accounts-individual-privacy-budget-cash-flow-iken/) | EU couple positioning, shared and individual accounts, investments, household net worth, and Polish retirement/tax awareness | Strongest emerging direct threat. Its positioning is broad wealth tracking and Poland-specific planning; Wollie can be simpler and household-plan-first | About 19 PLN/month per partner; joint pricing described as planned |

Adjacent alternatives are Revolut/N26 joint accounts, bank-native analytics, Splitwise/Tricount, spreadsheets, and self-hosted Actual Budget. They are often “good enough,” so Wollie must save recurring household effort rather than merely show nicer charts.

## Evidence of a real problem

Recent couple discussions show recurring problems:

- Couples with personal and joint accounts struggle to represent the arrangement without maintaining multiple budgets and fake transfer accounts ([example](https://www.reddit.com/r/ynab/comments/1bxoyr3), [example](https://www.reddit.com/r/ynab/comments/1que4ct)).
- Often one partner maintains the system while the other wants only a simple visual answer, creating friction and reactive conversations ([example](https://www.reddit.com/r/ynab/comments/1swe8xf), [example](https://www.reddit.com/r/ynab/comments/1t4rcdm)).
- Paying shared expenses on personal cards creates mathematical workarounds even when a joint account exists ([example](https://www.reddit.com/r/ynab/comments/1ko2yhr)).
- European bank-sync reliability and incomplete coverage remain common complaints ([YNAB Belgium discussion](https://www.reddit.com/r/ynab/comments/1bg8n6q), [Wallet discussion](https://www.reddit.com/r/BudgetBakers/comments/1g450ct)).

These are problem signals, not proof that Wollie's exact solution will be adopted.

## Wollie's valuable differences

1. **One household plan without moving money.** Both partners keep using their existing banks and cards; Wollie combines the planning view.
2. **Income funds the plan automatically.** Cleared income is distributed proportionally across fixed amounts and percentage targets; another paycheque continues filling the same plan.
3. **Spending and building wealth are separated.** Food and travel show money left to spend. Pension, tax, savings, and future purchases show progress toward being funded or actually contributed—not “spent.”
4. **Purchases update the right shared category.** Groceries paid on either partner's card reduce the same Food amount.
5. **Designed for the less-engaged partner.** The product should answer “What can we spend?” and “Are our goals on track?” without requiring both people to become budgeting experts.

## Where Wollie is currently weaker

- No native iOS/Android app or push alerts.
- Bank reliability is not yet proven publicly.
- Account-level privacy choices are less mature than Bilance's “yours/mine/ours” model.
- Competitors have years of trust, support history, categorisation data, and integrations.
- The current product has accumulated terminology and screens that still need a single clear household workflow.

## Business-model implication

Live bank sync cannot be part of an unlimited free tier because every provider connection costs Wollie money.

Recommended eventual structure:

- **Free:** manual accounts, CSV import, categories, and a limited money plan.
- **Household:** two people, two included bank connections, automatic sync, the shared money plan, and household reports.
- **Extra connection:** paid add-on or a higher plan.

At Synci's current 20-connection price, two connections cost Wollie roughly €2.10 per household per month before hosting, Stripe, VAT, support, and tax. The previously considered €59 annual price therefore leaves a thin margin. Validate willingness to pay before finalising price; roughly €7.99–€9.99 monthly and €79–€89 annually is economically safer if two live connections are included.

## PMF status

| Hypothesis | Current confidence | Evidence needed |
| --- | --- | --- |
| EU couples with separate accounts find shared planning painful | Medium | At least 10 problem interviews; 70% describe the problem unprompted |
| Automatic income allocation is more valuable than ordinary expense charts | Low | Couples choose it as one of their top two benefits after using a prototype |
| One partner can maintain the plan while both benefit | Medium | Both partners return or use the shared summary during a four-week pilot |
| Households will pay at least €79/year | Low | Three prepaid pilots or deposits—not survey answers |
| Two bank connections are enough for the core plan | Low | Connection counts from the first 10 target households |

The Sean Ellis PMF survey is premature until Wollie has at least 30 active users who have experienced the product. Before that, behaviour and payment commitments are stronger evidence.

## Validation before paying for public bank sync

1. Interview 15 EU couples who use separate accounts but share bills and savings goals. Ask about the last month, their current process, and where it broke; do not pitch first.
2. Run a four-week concierge pilot with five households using CSV/manual import, so no new provider subscription is required.
3. Show the exact Household offer and request a refundable €20 deposit or annual pre-order.
4. Proceed to paid Synci testing when at least three households commit money and at least five use the plan weekly.
5. After 30 active households, run the PMF survey. The target is at least 40% answering “very disappointed” if Wollie disappeared.

## Go / no-go conclusion

**Go for validation, not broad launch yet.** Wollie has an interesting, specific product idea and real competitor gaps. It does not yet have evidence that users will purchase it. The next investment should be customer evidence and a small manual pilot; the €4.99 Synci plan should begin only when the product is ready for Liya and Alex's final live test or when the first committed pilot requires bank sync.
