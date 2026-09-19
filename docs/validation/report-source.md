# Wollie pre-build validation evidence

**Audience:** Wollie product and engineering  
**Date:** 1 September 2026  
**Decision:** Is there enough evidence to raise strategic confidence from 82 to the 92 pre-build threshold?

## Executive answer

Not yet. Public and competitive evidence strengthens the case that couples use many different account structures and struggle to coordinate shared and personal money. The existing automated tests also support the correctness of Wollie's main allocation model.

The evidence does not yet show that real couples understand Wollie's model, will connect their accounts, will invite a partner, or will pay. Those questions cannot be answered by additional competitor research. Confidence remains below the 92 threshold until the problem interviews and unmoderated comprehension tests pass.

## What the evidence supports

### Couples use joint, separate, and mixed account structures

The United States Census Bureau reported that 77% of asset-owning married couples held at least one joint financial account in 2023, down from 85% in 1996. Only 40% held all accounts jointly, while 17% used both joint and separate accounts. Among unmarried cohabiting couples, only 16% had joint accounts. This supports Wollie's decision to serve joint, separate, and mixed structures rather than treating any one arrangement as the default.

Source: [Almost a Quarter of Married Couples Didn't Have Joint Accounts in 2023](https://www.census.gov/library/stories/2025/09/married-but-separate.html), United States Census Bureau, 2025.

A 2026 European Sociological Review study using UK Household Longitudinal Study data found that 49% of 4,146 couples pooled income and managed it together, while 17% managed part or all of their money independently. More than 80% of 4,340 couples made major financial decisions jointly. This supports a shared decision layer that does not require every account to be merged.

Source: [Empowerment and individualization: online banking and household financial organization](https://academic.oup.com/esr/advance-article/doi/10.1093/esr/jcag002/8469544), European Sociological Review, 2026.

### Shared financial planning is valued

An ING international survey of 6,138 people reported that 75% of Europeans in couples considered regular household finance meetings useful for their finances and 69% considered them beneficial for their relationship. This supports the value of a shared planning surface, although it does not prove demand for Wollie specifically.

Source: [ING International Survey Savings](https://think.ing.com/uploads/reports/ING_International_Survey_Savings_2018_FINAL.pdf), ING, February 2018.

### A joint account is a serious substitute

A longitudinal field experiment published in the Journal of Consumer Research randomly assigned newlywed couples to merge finances, keep separate accounts, or receive no instruction. Couples assigned to a joint account were buffered against declines in relationship quality, partly through improved financial harmony. Wollie should therefore never imply that keeping accounts separate is inherently better. Its value must be coordination across whichever account structure the couple already chooses.

Source: [Common Cents: Bank Account Structure and Couples' Relationship Dynamics](https://academic.oup.com/jcr/article/50/4/704/7077142), Journal of Consumer Research, 2023.

### Current tools create visible workarounds

Public user reports describe spreadsheets, Splitwise reconciliation, shared logins, duplicate budgeting apps, and difficulty assigning shared costs across separate accounts. These reports are anecdotal and cannot establish prevalence, but they provide concrete workflows to test in interviews.

Sources:

- [Budgeting apps for couples without joint accounts](https://www.reddit.com/r/BEFire/comments/1p07rcy/just_me_or_do_budgeting_apps_suck_for_couples/), Reddit, anecdotal.
- [Multiple Accounts & Multiple Household Budget](https://forums.goodbudget.com/t/multiple-accounts-multiple-household-budget/3151), Goodbudget forum, anecdotal.

## What repository evidence supports

The complete automated suite passed on 1 September 2026: **19 test files and 97 tests**.

Covered cases include:

- Proportional allocation when income is insufficient.
- Exact minor-unit rounding and remainder handling.
- Pending and cleared spending.
- Unmapped spending reducing the Extra amount.
- Transfers excluded from spending totals.
- Reserve and goal contributions separated from everyday spending.
- Stable provider identifiers and basic bank-payload normalization.

Material trust cases still lacking explicit end-to-end proof include:

- Refunds reversing the correct original spending category.
- Matching both sides of card repayments across different accounts.
- Currency conversion with a stored rate and conversion date.
- A second identical sync producing no duplicate database records.
- Provider-removed transactions appearing in an audit history.
- Actual Home totals keeping future bills separate from completed cash flow.

## Disconfirming evidence and risks

1. Many couples consider a joint household account simpler than a coordination app.
2. A couples-first value proposition may appeal only to the financially engaged partner, leaving the invited partner inactive.
3. Proportional contribution logic may be perceived as fair by some couples and intrusive by others.
4. Selective privacy can reduce anxiety, but can also conflict with expectations of full household transparency.
5. More planning detail can recreate the complexity users dislike in Monarch and YNAB.

These risks must be tested directly. They cannot be resolved through interface opinion or competitor comparison.

## Evidence gap matrix

| Claim | Current support | Confidence | Missing evidence | Next test |
| --- | --- | --- | --- | --- |
| Couples use varied account structures | Census and UKHLS data | High | Belgium/EU target interviews | Problem interviews |
| Couples value joint financial decisions | UKHLS and ING | Medium-high | Behavior inside a product | Workflow test |
| Existing apps poorly support mixed structures | Competitor docs and anecdotes | Medium | Prevalence and severity | Problem interviews |
| Wollie's proportional plan is understandable | Internal logic only | Low | Unassisted comprehension | Concept test |
| Users will connect both partners' accounts | None | Low | Completion behavior | Workflow test |
| Users will pay | None | Very low | A real commitment | Pilot or deposit test |
| Financial calculations are trustworthy | 97 automated tests | Medium-high | Missing end-to-end cases | Reconciliation dataset |

## Stop condition

Further public research is unlikely to change the product direction. It cannot close the remaining behavioral gaps. The next evidence must come from real couples completing the tests in the user-research kit.

## Claim-to-source ledger

| Claim | Source | Publisher | Date | Access |
| --- | --- | --- | --- | --- |
| Joint-only account use has declined and mixed structures have grown | Almost a Quarter of Married Couples Didn't Have Joint Accounts in 2023 | United States Census Bureau | 2025 | Public web page |
| 49% of sampled UK couples pooled money and 17% managed partly or fully independently | Empowerment and individualization | European Sociological Review | 2026 | Public article |
| Most surveyed European couples value regular finance discussions | ING International Survey Savings | ING | 2018 | Public PDF |
| Joint-account assignment improved relationship outcomes in a field experiment | Common Cents | Journal of Consumer Research | 2023 | Public article |
| Couples report manual workarounds across separate accounts | BEFire discussion | Reddit users | 2025 | Anecdotal public discussion |
| Users request private personal and shared household budgeting | Multiple Accounts & Multiple Household Budget | Goodbudget forum users | 2025 | Anecdotal public discussion |

