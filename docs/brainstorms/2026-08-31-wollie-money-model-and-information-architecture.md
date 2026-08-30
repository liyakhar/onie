# Wollie money model and information architecture

Date: 2026-08-31

## The simple model

Wollie should answer four different questions. Each question gets one clear home.

1. **Accounts:** Where is the real money now?
2. **Transactions:** What actually happened?
3. **Money plan:** What should this month's income be used for?
4. **Bills & subscriptions:** What repeating payment is expected next, and when?

Wollie's Money plan is a virtual planning layer. Assigning income in Wollie never transfers or locks money at the bank. Transactions are the source of truth for actual spending, saving, and investing.

## Ten product decisions

### 1. Is a transaction category the same as a plan item?

**No.** A category labels what happened: Groceries, Health, Rent, Salary, Transfer. A plan item says what part of income is intended for: Food this month, Tax reserve, Pension, Holiday. One plan item may watch several categories. A category may also remain tracking-only with no budget.

### 2. Does every category need a monthly budget?

**No.** Health, gifts, or repairs can be tracked without a target. The Transactions page should still total them. If a user later wants a limit, they can connect the category to a Money plan item.

### 3. Is assigning income the same as moving money?

**No.** Wollie assigns income on-screen only. Use the word **assigned**, never “moved”, “transferred”, or “funded”, unless a real bank transaction occurred.

### 4. How should income be divided when it is lower than the plan?

**Proportionally across all amount and percentage targets.** This matches the household's stated preference and avoids a hidden priority order. An optional “whatever is left” item receives only the remainder.

### 5. What kinds of plan items do users need?

Use four plain-language choices in one field:

- Monthly bill
- Everyday spending
- Set money aside
- Save for a goal

These map to the existing internal group and purpose fields. Users should not have to understand both fields.

### 6. Is pension or savings “spending”?

**No.** A real outgoing pension, investment, or savings transfer is shown as **saved / invested** or **contributed**. It is excluded from “spent this month”. A virtual assignment alone is only “assigned in plan”.

### 7. Why keep Bills if rent is already in the Money plan?

They do different jobs. The Money plan says “keep €300 for rent”; Bills says “€300 to Landlord is expected on 1 September”; the imported transaction confirms that it happened. Bills should be described as a forecast, not another budget.

### 8. What should colors communicate?

Neutral or emerald shows normal assignment/progress. Amber means a spending amount is nearly used. Red means actual overspending or an overdue shortfall. Partial income assignment is not an error and must not be red.

### 9. What belongs on Transactions?

The period total, spending by category, saved/invested separately, filters, and the transaction list. Category bars show share of actual period activity—not budget health. The plan connection is secondary context such as “Food plan · €800 left”.

### 10. What is the primary number on Overview?

**Available to spend** after card debt and upcoming confirmed bills, constrained by the current spending plan. “Spent” and “Saved / invested” must remain separate. Long-term goal progress is secondary and should not distort monthly spend.

## Market patterns worth adopting

- Revolut's Analytics separates spending/income analysis from Income Sorter, which can distribute salary into Pockets, savings, joint, and investment accounts. Wollie can copy the clear separation, but must explain that its own assignment is virtual. [Revolut Income Sorter](https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/using-the-income-sorter-feature/) and [Budgeting & Analytics](https://help.revolut.com/en-BE/help/accounts/budget-and-analytics/)
- Monzo separates Trends (spending totals, category breakdowns, targets), Pots (real separated money), and Salary Sorter. It also lets users pay bills from Pots. This is a strong information architecture, but Wollie cannot claim Pot-like protection across external banks. [Monzo Trends](https://monzo.com/help/budgeting-overdrafts-savings/trends-spending-and-balance-web), [Pots](https://monzo.com/help/budgeting-overdrafts-savings/what-is-a-pot), and [Salary Sorter](https://monzo.com/help/budgeting-overdrafts-savings/web-salary-sorter)
- Wise Jars are real separated balances for goals, bills, and budgeting, while recurring card payments live under Payments. Again, Wollie should borrow the clarity, not imply custody or movement. [Wise Jars](https://wise.com/help/articles/2978074/what-are-jars-and-how-can-i-keep-money-in-them) and [recurring card payments](https://wise.com/help/articles/1CoZht05rHDEJcycXU2RMh/what-are-recurring-wise-card-payments)
- YNAB distinguishes assigned, activity, and available amounts, and combines targets with scheduled transactions. Its model is powerful but its vocabulary is dense; Wollie should keep the same accounting separation with fewer controls. [Assigning money](https://support.ynab.com/en_us/assigning-your-money-a-guide-SypgkrNJi), [targets](https://support.ynab.com/how-to-use-targets-rk5kkI9ks), and [Auto-Assign](https://support.ynab.com/en_us/auto-assign-a-guide-r1gBNbBJo)
- Monarch explicitly separates category budgeting, flexible spending, goals, and transfers. It allows categories to exist without a budget. Wollie should adopt that optional-budget rule and its treatment of transfers/credit-card payments as neither income nor expense. [Monarch budgets](https://help.monarchmoney.com/hc/en-us/articles/360048883631-Budgets)

## App vocabulary

| Internal concept | User-facing term |
| --- | --- |
| Budget bucket / envelope | Plan item |
| Funded amount | Assigned this month |
| Budget allocation rule | Income rule |
| Fixed rule | Amount each month |
| Percentage rule | Percentage of income |
| Remainder rule | Whatever is left |
| SPENDING + FIXED | Monthly bill |
| SPENDING + FLEXIBLE | Everyday spending |
| RESERVE | Set money aside |
| GOAL | Save for a goal |
| Recurring payment | Bill or subscription |
| Unmapped plan category | Tracked without a budget |

## Critical self-critique

The biggest remaining product risk is that Wollie combines balances from external banks but cannot protect assigned money from being spent. The interface must repeat this limitation at the point where a plan is created, then stay quiet elsewhere. A future account-backed goal can show whether the real balance exists, but the current system must not manufacture certainty.

The second risk is double logic: the legacy fixed/flexible/future budget engine still exists beside the envelope engine. The new Money plan must become the single user-facing model; legacy calculations should be removed after production data has been migrated and verified.

