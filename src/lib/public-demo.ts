import {
  buildIncomeEnvelopeProjection,
  type IncomeAllocationRule,
  type IncomeEnvelopePlan,
} from "./income-allocation-engine";
import {
  getFinanceSummary,
  type BudgetCategory,
  type FinanceDashboardData,
  type FinanceTransaction,
  type FinancialAccount,
  type RecurringPayment,
} from "./finance-demo";

type DemoRule = IncomeAllocationRule & { categoryNames: string[] };

const categoryOptions = [
  "Income",
  "Housing",
  "Groceries",
  "Dining",
  "Transport",
  "Tax",
  "Pension",
  "Savings",
  "Health",
  "Shopping",
  "Subscriptions",
] as const;

const rules: DemoRule[] = [
  {
    id: "rent",
    bucketId: "rent",
    bucketName: "Rent",
    group: "FIXED",
    purpose: "SPENDING",
    type: "FIXED",
    fixedMinor: 30_000,
    priority: 0,
    categoryNames: ["Housing"],
  },
  {
    id: "food",
    bucketId: "food",
    bucketName: "Food",
    group: "FLEXIBLE",
    purpose: "SPENDING",
    type: "FIXED",
    fixedMinor: 100_000,
    priority: 1,
    categoryNames: ["Groceries", "Dining"],
  },
  {
    id: "travel",
    bucketId: "travel",
    bucketName: "Travel",
    group: "FLEXIBLE",
    purpose: "SPENDING",
    type: "FIXED",
    fixedMinor: 100_000,
    priority: 2,
    categoryNames: ["Transport"],
  },
  {
    id: "pension",
    bucketId: "pension",
    bucketName: "Pension",
    group: "FUTURE",
    purpose: "GOAL",
    type: "FIXED",
    fixedMinor: 500_000,
    priority: 3,
    categoryNames: ["Pension"],
  },
  {
    id: "savings",
    bucketId: "savings",
    bucketName: "Savings",
    group: "FUTURE",
    purpose: "GOAL",
    type: "FIXED",
    fixedMinor: 500_000,
    priority: 4,
    categoryNames: ["Savings"],
  },
  {
    id: "tax",
    bucketId: "tax",
    bucketName: "Tax",
    group: "FUTURE",
    purpose: "RESERVE",
    type: "FIXED",
    fixedMinor: 700_000,
    priority: 5,
    categoryNames: ["Tax"],
  },
  {
    id: "extra",
    bucketId: "extra",
    bucketName: "Extra",
    group: "FLEXIBLE",
    purpose: "SPENDING",
    type: "REMAINDER",
    priority: 6,
    categoryNames: ["Health", "Shopping", "Subscriptions"],
  },
];

function dateForDemo(daysAgo: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() - daysAgo);
  return value.toISOString();
}

function futureDate(daysAhead: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + daysAhead);
  return value.toISOString().slice(0, 10);
}

export function getPublicDemoFinanceDashboard(): FinanceDashboardData {
  const accounts: FinancialAccount[] = [
    {
      id: "demo-everyday",
      name: "Everyday account",
      type: "Checking",
      balance: 5_734.48,
      currency: "EUR",
      institution: "Example Bank",
      lastSynced: "Just now",
    },
    {
      id: "demo-card",
      name: "Everyday card",
      type: "Credit card",
      balance: -320.4,
      currency: "EUR",
      institution: "Example Bank",
      lastSynced: "Just now",
    },
  ];
  const transactions: FinanceTransaction[] = [
    {
      id: "demo-income-one",
      accountId: "demo-everyday",
      account: "Everyday account",
      date: dateForDemo(7),
      merchant: "Income",
      category: "Income",
      amount: 5_000,
      currency: "EUR",
      status: "cleared",
    },
    {
      id: "demo-income-two",
      accountId: "demo-everyday",
      account: "Everyday account",
      date: dateForDemo(5),
      merchant: "Income",
      category: "Income",
      amount: 3_680.26,
      currency: "EUR",
      status: "cleared",
    },
    {
      id: "demo-rent",
      accountId: "demo-everyday",
      account: "Everyday account",
      date: dateForDemo(4),
      merchant: "Rent",
      category: "Housing",
      amount: -17.9,
      currency: "EUR",
      status: "cleared",
      recurring: true,
    },
    {
      id: "demo-market",
      accountId: "demo-card",
      account: "Everyday card",
      date: dateForDemo(3),
      merchant: "Fresh Market",
      category: "Groceries",
      amount: -200,
      currency: "EUR",
      status: "cleared",
    },
    {
      id: "demo-rail",
      accountId: "demo-card",
      account: "Everyday card",
      date: dateForDemo(2),
      merchant: "City Rail",
      category: "Transport",
      amount: -306.93,
      currency: "EUR",
      status: "cleared",
    },
    {
      id: "demo-health",
      accountId: "demo-card",
      account: "Everyday card",
      date: dateForDemo(1),
      merchant: "Pharmacy",
      category: "Health",
      amount: -52.89,
      currency: "EUR",
      status: "cleared",
    },
    {
      id: "demo-subscription",
      accountId: "demo-card",
      account: "Everyday card",
      date: dateForDemo(0),
      merchant: "Streaming service",
      category: "Subscriptions",
      amount: -6.69,
      currency: "EUR",
      status: "pending",
      recurring: true,
    },
  ];
  const recurringPayments: RecurringPayment[] = [
    {
      id: "demo-rent-bill",
      merchant: "Rent",
      amount: 300,
      cadence: "monthly",
      nextDate: futureDate(45),
      category: "Housing",
      currency: "EUR",
      confirmed: true,
      source: "confirmed",
    },
  ];
  const projection = buildIncomeEnvelopeProjection({
    incomeMinor: 868_026,
    rules,
    spendingByBucket: {
      rent: { clearedMinor: 1_790 },
      food: { clearedMinor: 20_000 },
      travel: { clearedMinor: 30_693 },
      extra: { clearedMinor: 5_289, pendingMinor: 669 },
    },
  });
  const ruleByBucketId = new Map(rules.map((rule) => [rule.bucketId, rule]));
  const envelopeBudget: IncomeEnvelopePlan = {
    enabled: true,
    currency: "EUR",
    incomeMinor: projection.incomeMinor,
    excludedIncomeMinor: 0,
    unallocatedMinor: projection.unallocatedMinor,
    shortfallMinor: projection.shortfallMinor,
    unassignedSpendMinor: 0,
    excludedSpendMinor: 0,
    clearedSpendMinor: projection.clearedSpendMinor,
    pendingSpendMinor: projection.pendingSpendMinor,
    flexibleAvailableMinor: projection.flexibleAvailableMinor,
    reservedInPlanMinor: projection.reservedInPlanMinor,
    contributedMinor: projection.contributedMinor,
    pendingContributionMinor: projection.pendingContributionMinor,
    categoryOptions: [...categoryOptions],
    buckets: projection.buckets.map((bucket) => {
      const rule = ruleByBucketId.get(bucket.id)!;
      return {
        ...bucket,
        categoryNames: rule.categoryNames,
        fixedMinor: rule.fixedMinor ?? undefined,
        percentageBasisPoints: rule.percentageBasisPoints ?? undefined,
      };
    }),
  };
  const budget: BudgetCategory[] = envelopeBudget.buckets.map((bucket) => ({
    name: bucket.name,
    group:
      bucket.group === "FIXED"
        ? "Fixed"
        : bucket.group === "FLEXIBLE"
          ? "Flexible"
          : "Future",
    allocated: bucket.fundedMinor / 100,
    spent: bucket.spentMinor / 100,
  }));
  const summary = getFinanceSummary({
    accounts,
    transactions,
    budget,
    recurringPayments,
    rules: [],
  });

  return {
    month: new Intl.DateTimeFormat("en", { month: "long" }).format(
      new Date(),
    ),
    accounts,
    transactions,
    budget,
    budgetPlan: summary.budgetPlan,
    rules: [],
    recurringPayments,
    insights: [],
    summary,
    syncStatus: {
      mode: "demo",
      label: "Example data",
      description: "This workspace uses example data only.",
      lastSynced: "Just now",
      canConnectLive: false,
    },
    envelopeBudget,
  };
}

export function getPublicDemoTransactionsData() {
  const dashboard = getPublicDemoFinanceDashboard();
  return {
    transactions: dashboard.transactions,
    canAddManual: false,
    categoryOptions: dashboard.envelopeBudget?.categoryOptions ?? [],
    envelopeBudget: dashboard.envelopeBudget,
  };
}

export function getPublicDemoBudgetData() {
  const dashboard = getPublicDemoFinanceDashboard();
  return {
    month: dashboard.month,
    budget: dashboard.budget,
    budgetPlan: dashboard.budgetPlan,
    summary: dashboard.summary,
    syncStatus: dashboard.syncStatus,
    currency: "EUR",
    envelopeBudget: dashboard.envelopeBudget,
    canChangeCurrency: false,
    availableCurrencies: ["EUR"],
  };
}
