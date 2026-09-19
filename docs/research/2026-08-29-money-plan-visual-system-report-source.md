# Wollie Money Plan Visual System

**Audience:** Wollie product, design, and engineering  
**Date:** 29 August 2026  
**Decision scope:** How the Money plan should separate and visualize funding, spending, reserves, and long-term goals.  
**Assumptions:** Wollie combines a household's connected accounts, allocates cleared income proportionally across plan targets, imports card and bank transactions, and currently uses virtual envelopes rather than physically moving money.  
**Out of scope:** Investment portfolio performance, financial advice, and a broad comparison of bank pricing or account products.

## Executive answer

Yes: a funding bar should remain Wollie green whether it is 20% or 100% funded. Partial funding is progress, not failure. The bar length and explicit amount communicate how complete it is; a checkmark communicates completion. Underfunding should be neutral unless a dated obligation is projected to be short, in which case the row gets an amber status message - not a red funding bar.

Spending envelopes need to answer two different questions:

1. **Funding:** How much of this month's target has income made available?
2. **Use:** How much of that available money has already been spent?

Wollie should not ask one colored bar to explain both. The recommended spending row has one green funding meter and one separate usage meter. For Food with a EUR 1,000 target, EUR 1,000 funded, and EUR 200 spent, the first meter is 100% green and the second is 20% ink, with **EUR 800 left** as the primary answer.

Goals and reserves are different again. A virtual allocation from salary is **reserved in the plan**, while a real transfer into a savings, tax, pension, or investment account is an **actual contribution**. Wollie must not call a virtual allocation saved, and must not count a transfer to pension or savings as spending.

## What the current Wollie row gets wrong

The current implementation uses bar length for one concept and color for another: length represents spending relative to funded money, while red can mean either underfunded or overspent. This makes Rent appear dangerous even when it has EUR 117 still available. Categories with no spending hide the same red state because their bar width is zero.

This violates a basic visualization rule: length is the strongest quantitative cue and should represent one named quantity consistently. Color should communicate a categorical status, not an unlabeled second scale. Nielsen Norman Group notes that people compare length well, while color is not naturally ordered for magnitude. USWDS recommends limiting each visualization to one central idea and not reusing a color for different variables. [NN/g dashboard guidance](https://www.nngroup.com/articles/dashboards-preattentive/) [USWDS data visualization guidance](https://designsystem.digital.gov/components/data-visualizations/)

## What leading products do

### Budgeting apps

**YNAB** is the strongest counterexample to the two-meter recommendation. Its optional category progress bar encodes both target funding and use: green means funded, yellow means assigned but target not met, light shading is spent, dark shading is available, grey is empty, and red is overspending. The system is powerful but requires a help article and a color/shading legend. For Wollie, whose core promise is calm household clarity and whose income is allocated proportionally, copying yellow underfunding would make normal partial salary allocation look like a warning. [YNAB progress bars](https://support.ynab.com/en_us/progress-bars-a-guide-SkDEhot09) [YNAB colors and icons](https://support.ynab.com/en_us/colors-and-icons-in-your-plan-HJQv_XHko)

**Monarch** separates monthly budget concepts into Planned, Actual, and Remaining. Its savings goals use a different visual model: goal balance, target, spending, and projection are separate signals, with statuses such as on track, ahead, at risk, and complete. Account balance adjustments are excluded from the budget, while intentional income or transfer transactions can count as contributions. This is the cleanest reference for Wollie's distinction between a monthly plan allocation and a real goal contribution. [Monarch budget](https://help.monarch.com/hc/en-us/articles/360048883631-Creating-Your-Budget-in-Monarch) [Monarch Save Up Goals](https://help.monarch.com/hc/en-us/articles/44373182867476-Using-Save-Up-Goals)

**Goodbudget** distinguishes predictable annual expenses from one-time savings goals, but its own forum shows recurring confusion between filling an envelope and recording a transaction. This supports explicitly naming funding and spending rather than relying on one fill metaphor. [Goodbudget Goals and Annual envelopes](https://goodbudget.com/help/customize-your-goodbudget/goals-and-annuals/) [Goodbudget progress-marker discussion](https://forums.goodbudget.com/t/explain-little-dash-for-annual-envelopes/3750)

**Copilot** treats savings separately and allows budget rollovers, reinforcing that monthly spending control and accumulated savings are related but not identical jobs. [Copilot Savings](https://help.copilot.money/en/articles/11471870-savings-with-copilot) [Copilot budget rollovers](https://help.copilot.money/en/articles/3790828-budget-rollovers)

### Banks and money apps

Banks often avoid the virtual-versus-real ambiguity by physically separating money. Monzo Pots, N26 Spaces, Revolut Pockets, and bunq dedicated budgeting accounts are real balances or subaccounts. bunq can deduct categorized purchases from a dedicated budget and warns at spending thresholds; Revolut and bunq can physically sort income to accounts or pockets. Wollie connects external accounts and currently does not move the money, so it cannot truthfully use the same language without an actual transfer. [Monzo Pots](https://monzo.com/help/budgeting-overdrafts-savings/what-is-a-pot) [N26 Spaces](https://support.n26.com/en-eu/app-and-features/spaces/how-does-spaces-work) [Revolut Income Sorter](https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/using-the-income-sorter-feature/) [bunq Easy Budgeting](https://help.bunq.com/articles/easy-budgeting)

bunq's spending insights use simple month-comparison bars and notify at 80%, 95%, and 100%. This is useful for Wollie's spending attention thresholds, although Wollie should adapt thresholds to the day of the month rather than imply that 80% is always bad. [bunq Money Insights](https://help.bunq.com/articles/your-budgeting-screen)

## Evidence gap matrix

| Decision | Strong evidence | Remaining uncertainty | Wollie resolution |
|---|---|---|---|
| Should partial funding be red or amber? | YNAB uses yellow; banks show saved/funded money as positive balance; red is consistently overspending/error. | No universal convention for proportional income allocation. | Keep funding green; label the missing amount neutrally. Use amber only for time-based risk. |
| One bar or two? | YNAB combines two dimensions; Monarch separates Planned/Actual/Remaining; visualization guidance favors one quantitative idea per bar. | Two bars add row height. | Two thin, labeled meters on desktop; on compact mobile show funding meter plus numbers, and reveal usage meter in the row detail if space is constrained. |
| Should reserve allocation equal saving? | Banks' pockets are real balances; Monarch distinguishes account-backed goals, allocations, contributions, and adjustments. | Wollie may later initiate transfers. | Say Reserved in plan until a transfer is observed or initiated; then say Contributed. |
| When should amber appear? | bunq warns at 80/95/100; goal apps use on-track/at-risk projection. | A fixed threshold ignores time elapsed. | Use forecast-aware status when history exists; otherwise 80% as a simple fallback. |
| How should transfers affect spend? | Monarch excludes transfers/card payments from cash flow and links intentional transfers to goals. | External pension payments may appear as merchant outflows. | Assign one role per transaction: expense, transfer, contribution, or income. Contribution is not household spend. |

## Recommended information architecture

Keep one **Money plan** page, because the household is allocating the same income across all purposes. Split the page into two visually distinct sections:

1. **Spend this month** - Rent, Food, Travel, and other everyday or fixed spending.
2. **Goals & reserves** - Tax, Pension, Savings, emergency fund, and future purchases.

Do not add separate top-level navigation yet. A separate Goals page becomes useful only when Wollie supports target dates, real account-backed balances, forecasts, and goal activity histories. The section header can link to a focused goals view later.

The page summary should use four mutually exclusive outcomes:

- **Income received** - cleared income recognized this month.
- **Available to spend** - funded spending envelopes minus spending.
- **Reserved in plan** - virtual allocations to tax and future goals not yet contributed.
- **Unallocated** - income not assigned to any plan target.

Do not show **Assigned to envelopes** as a headline beside income when the two are always equal; it consumes attention without answering a household question.

## Category row specifications

### A. Spending envelope

Primary answer: **EUR 800 left**

Supporting line: `EUR 1,000 funded of EUR 1,000 target - EUR 200 spent`

Visuals:

- **Funded** meter: green fill / grey track, `funded / target`.
- **Spent** meter: ink fill / grey track, `spent / funded`.
- A target marker appears at 100% of funded money. Overspend extends beyond that marker in red or changes the overage segment to red.
- A visible checkmark and text, not color alone, indicate Fully funded.

States:

| Example | Primary text | Funding meter | Usage meter | Status |
|---|---|---|---|---|
| Target 1,000; funded 1,000; spent 200 | EUR 800 left | 100% green + check | 20% ink | Healthy |
| Target 1,000; funded 450; spent 0 | EUR 450 available | 45% green | Empty | EUR 550 still to fund, neutral |
| Target 1,000; funded 450; spent 400 | EUR 50 left | 45% green | 89% amber | Running low |
| Target 1,000; funded 450; spent 500 | EUR 50 over available | 45% green | Full plus red overage | Overspent |

Amber should be based on pressure, not funding completeness. Initial rule: show amber when less than 20% of funded money remains and spending is not already over. Better later rule: compare remaining money with expected remaining spend based on the day of month and category history.

### B. Percentage reserve, such as Tax

Target definition: `40% of income received` or the user's chosen percentage.

Primary answer: **EUR 3,472 reserved in plan**

Supporting line: `40% of EUR 8,680 income - EUR 0 contributed`

Visuals:

- One green reserve meter: `reserved / required-to-date`.
- If proportional allocation matches the rule, it will be 100% after each income event.
- No spending meter.
- If a dated tax payment is known, add a small due-date projection: On track, Due soon, or Projected short.

Color states:

- Green: amount reserved as planned.
- Neutral: no income yet, so required-to-date is zero.
- Amber: projected short by due date or a required contribution is overdue.
- Red: money already committed or paid exceeds the reserve, or an overdue liability is short. Red is never used merely because the annual target is not complete.

### C. Savings or pension goal

Primary answer: **EUR 24,800 of EUR 60,000**

Supporting line: `This month: EUR 2,249 planned - EUR 2,000 contributed`

Visuals:

- Main goal meter: actual linked goal balance / target, always green for progress.
- Projection marker for target date, with text On track or At risk.
- Monthly contribution is a compact comparison of planned versus actual; it is not added to the balance until a real contribution or account balance change is observed.
- Market growth is shown as growth/adjustment, not contribution.

If no real account or contribution can be linked, label the figure **Reserved in plan**, not **Saved**.

## Color and accessibility contract

| Token | Meaning | Never use for |
|---|---|---|
| Wollie emerald | Secured money and positive progress | Generic success messages unrelated to money state |
| Ink / black | Money used; neutral actuals | Warning or failure |
| Amber | Attention soon: running low or projected short | Normal partial funding |
| Red | Genuine negative state: overspent, over-allocated, overdue and short | Underfunded future target |
| Grey | Track remaining, not started, not applicable | Disabled text with insufficient contrast |

Every state must have an amount and text label or icon. WCAG 2.2 explicitly requires that color not be the only means of conveying information. [W3C WCAG 2.2 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)

## Charts and category pages

### Money plan overview

Use one horizontal allocation strip, not a donut, because the quantities share a common total and precise comparison matters:

`Income = spent + available to spend + reserved in plan + unallocated`

Each segment is mutually exclusive. A pension contribution belongs to contributed/saved, not spent. A transfer between the household's own accounts is excluded.

### Spending category detail

- Six-month grouped bars: Target versus Spent by month.
- A plain-language summary above: `Average EUR 742/month - 8% below target`.
- Transactions below, filtered to the category, with easy correction of categorization.
- Optional rollover history only if rollovers are enabled.

### Goal detail

- Balance timeline as a line chart.
- Target amount as a horizontal reference.
- Projection as a dotted line to target date.
- Contributions and withdrawals as event markers.
- Planned versus actual contributions by month below the timeline.

Avoid pie charts for progress over time. They are acceptable only for a one-month spending composition, and even there a sorted bar list is easier to compare accurately.

## Transaction and accounting contract

Each imported transaction receives exactly one household cash-flow role:

- **Income** adds allocatable money.
- **Expense** reduces a spending envelope and counts in Spent.
- **Contribution** moves money toward a reserve or goal and counts in Saved/invested, not Spent.
- **Transfer** moves money between the household's own accounts and affects neither Spent nor Income.

A credit-card purchase is the expense. The later card repayment is a transfer. A pension payment or savings transfer is a contribution. This prevents double counting while keeping the words tied to what the household actually did.

## Implementation recommendation

### Phase 1 - correct the meaning

1. Add explicit envelope purpose: `spending`, `reserve`, or `goal`.
2. Replace `underfunded` as a red visual state with separate fields: `fundingProgress`, `usageState`, and `scheduleState`.
3. Render the correct row template for each purpose.
4. Update summaries so contributions are Saved/invested, never Spent.
5. Add accessible labels and text equivalents for every meter.

### Phase 2 - make it intelligent

1. Add percent-of-actual-income reserve targets.
2. Link goals to real accounts and contribution transactions.
3. Add target dates and projection-based On track / At risk status.
4. Add category history and pace-aware low-money warnings.
5. Add optional rollovers for spending envelopes.

## Acceptance tests

- A 45%-funded Food envelope with no spending is green plus neutral grey, never amber or red.
- Fully funded Food with EUR 200 of EUR 1,000 spent says EUR 800 left and shows 100% funding plus 20% usage.
- Spending EUR 500 from EUR 450 available says EUR 50 over and is red even if the monthly target is EUR 1,000.
- A tax reserve set to 40% receives exactly 40% of every cleared income amount, subject to cent rounding.
- A virtual tax allocation says Reserved in plan; a matched transfer says Contributed.
- Pension and savings contributions do not increase Spent this month.
- Credit-card repayment and household transfers do not affect income or spend.
- Every red or amber state is also expressed by text and an accessible name.

## Limitations

Public help documentation reveals product rules more reliably than the exact current UI styling; some products run platform or beta variations. User-forum evidence is anecdotal and is used only to identify confusion patterns, not to quantify prevalence. No usability study has yet tested the proposed Wollie rows with real households. A five-person task-based test should precede broad production rollout, focusing on whether users can answer: How much is funded? How much is left? Did money actually move? Am I at risk?

## Recommendation

Adopt the two-state spending row and the separate reserve/goal row. Keep all positive funding progress green. Reserve red for genuine negative states. Most importantly, make **plan allocation** and **real-world contribution** different data concepts and different words. This gives Wollie a simpler mental model than YNAB, more honest account semantics than a bank Pocket imitation, and enough structure to grow into account-backed goals and forecasts later.

## Claim-source ledger

| Claim | Source | Confidence |
|---|---|---|
| YNAB combines target funding and spending in one optional bar using hue and shading; red is overspending. | [YNAB progress bars](https://support.ynab.com/en_us/progress-bars-a-guide-SkDEhot09) | High - official, current |
| Monarch monthly budgets expose Planned, Actual, Remaining and exclude transfer/card-payment categories. | [Monarch budget](https://help.monarch.com/hc/en-us/articles/360048883631-Creating-Your-Budget-in-Monarch) | High - official, current |
| Monarch goals separate actual balance, target, spending, projection, contributions, and adjustments. | [Monarch Save Up Goals](https://help.monarch.com/hc/en-us/articles/44373182867476-Using-Save-Up-Goals) | High - official, current beta docs |
| bunq uses dedicated accounts, categorized deductions, and spending alerts at 80/95/100%. | [bunq Easy Budgeting](https://help.bunq.com/articles/easy-budgeting), [bunq Money Insights](https://help.bunq.com/articles/your-budgeting-screen) | High - official |
| Bank pots/spaces are real separated balances, unlike Wollie's current virtual plan. | [Monzo Pots](https://monzo.com/help/budgeting-overdrafts-savings/what-is-a-pot), [N26 Spaces](https://support.n26.com/en-eu/app-and-features/spaces/how-does-spaces-work) | High - official |
| Length is effective for one quantitative variable; color is not ordered magnitude. | [NN/g dashboard guidance](https://www.nngroup.com/articles/dashboards-preattentive/) | High - established UX synthesis |
| A visualization should focus on one central idea and use color carefully. | [USWDS data visualization guidance](https://designsystem.digital.gov/components/data-visualizations/) | High - government design standard |
| Color cannot be the only state signal. | [W3C WCAG 2.2 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color) | High - accessibility standard |
| Users can confuse filling a savings envelope with recording spending. | [Goodbudget progress-marker discussion](https://forums.goodbudget.com/t/explain-little-dash-for-annual-envelopes/3750), [Goodbudget annual goal discussion](https://forums.goodbudget.com/t/annual-goal/3301) | Low to medium - anecdotal support forum evidence |

