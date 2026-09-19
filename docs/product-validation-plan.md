# Wollie product validation gate

**Status:** Product changes paused until the pre-build gates below pass.  
**Current strategic confidence:** 82/100.  
**Purpose:** Replace confidence based on competitor research and founder intuition with evidence from real couples.

Supporting materials:

- [Pre-build validation evidence](./validation/report-source.md)
- [User-research kit](./validation/user-research-kit.md)

## Honest limit

Wollie cannot reach 100/100 confidence before people use it. A score of 100 would mean proven retention, willingness to pay, dependable bank data, and evidence that Wollie is better than alternatives in normal use.

The realistic pre-build target is **92/100**. We proceed only when the problem, product model, language, and core workflow pass the gates below. Confidence beyond that requires a live pilot.

## The five assumptions that can still break the product

| Assumption | Why it matters | Current evidence | Risk |
| --- | --- | --- | --- |
| Couples struggle to understand shared money across joint, separate, or mixed accounts | This is the core problem | Competitor gaps and anecdotal reports | Fatal if false |
| Couples want one plan without combining all their money | This is Wollie's main promise | Competitive whitespace, not direct behavior | Fatal if false |
| Proportional income allocation feels fair and understandable | This is the differentiating planning mechanism | Founder preference and product logic | Major |
| Users understand planned, available, spent, reserved, and contributed | Confusion destroys trust | Current UI discussion exposed confusion | Fatal |
| Couples will connect accounts and invite a partner | Without both actions, the couples advantage is not experienced | Technical flow exists, behavioral proof missing | Fatal |

## Gate 1: problem discovery

Interview **10 couples** who manage money together. Include joint-account, separate-account, and mixed-account households. Interview partners separately when possible so one person does not answer for both.

Do not show Wollie during this round.

Ask:

1. Walk me through the last month of managing money together.
2. What was difficult, unclear, or caused disagreement?
3. How do you decide what each person contributes?
4. How do you know what is safe to spend and what must be saved?
5. What tools have you tried, and why did you keep or stop using them?

**Pass only if:**

- At least 7 of 10 couples describe the shared-money problem without being led.
- The average severity is at least 7/10.
- At least 5 already use spreadsheets, multiple banking apps, budgeting tools, or manual calculations.
- At least 3 are actively dissatisfied enough to try an alternative.

If this gate fails, do not build more features. Reconsider the target customer or problem.

## Gate 2: concept comprehension

Show the current Wollie product to **5 to 8 couples**. Give no explanation before the tasks.

Ask each person to find:

1. How much the household can spend on everyday purchases.
2. How much has actually been spent on food.
3. How much is planned for pension versus actually contributed.
4. Which bills are coming next.
5. Which money belongs to each person and which is shared.

**Pass only if:**

- At least 80% answer four of five questions correctly without help.
- At least 80% correctly explain the difference between planned and actually moved money.
- No more than one person mistakes savings or pension contributions for spending.
- The median time to answer the first question is under 10 seconds.

Record the screen and note every hesitation. Change wording or hierarchy only when the same problem appears in at least two sessions.

## Gate 3: core workflow

Ask the same users to complete the complete Wollie loop:

1. Create an account and connect a bank.
2. Invite a partner or join an existing household.
3. Confirm account ownership.
4. Create a monthly plan.
5. Correct one transaction category and review the result.

**Pass only if:**

- At least 4 of 5 couples finish without assistance.
- The median completion time is under 10 minutes, excluding bank consent screens.
- No one creates duplicate households or loses access during invitation acceptance.
- Every correction visibly updates the correct spending or savings amount.

## Gate 4: financial trust

Run a fixed test dataset covering income, card purchases, pending charges, refunds, transfers, card repayments, savings transfers, pension payments, multiple currencies, duplicate imports, and removed provider transactions.

**Pass only if:**

- Every displayed total reconciles to its source transactions.
- Transfers and card repayments are never counted as spending.
- Planned assignments are never reported as actual saving or movement.
- Upcoming bills are never counted as already spent.
- Re-running bank sync produces no duplicate transactions.

Any failure in this gate blocks public launch.

## Gate 5: commitment and retention

After the first four gates pass, invite **10 qualified couples** into a four-week pilot.

**Initial commitment passes if:**

- At least 5 connect an account and invite their partner.
- At least 3 agree to pay a stated price after the free period or leave a refundable deposit.

**Early retention passes if:**

- At least 6 return in week two.
- At least 5 review the following month's plan.
- At least 4 say they would be very disappointed if Wollie disappeared.

This is the first point at which confidence can rise above 95. Longer retention and paid conversion are required before claiming market leadership.

## Decision rule

- **Any fatal gate fails:** stop and revise the product assumption.
- **Problem passes, comprehension fails:** simplify vocabulary and information structure.
- **Comprehension passes, workflow fails:** fix onboarding and partner collaboration.
- **Workflow passes, trust fails:** do not launch until accounting and sync are correct.
- **All five pass:** implement the focused roadmap and expand the pilot.

## Evidence log

For every interview or test, record only observed evidence:

| Date | Participant type | Problem evidence | Task failures | Exact confusing words | Commitment | Decision |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
