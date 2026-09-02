import { describe, expect, it } from "vitest";
import {
  getPublicDemoBudgetData,
  getPublicDemoFinanceDashboard,
  getPublicDemoTransactionsData,
} from "./public-demo";

describe("public workspace demo", () => {
  it("uses an enabled EUR money plan with example data", () => {
    const dashboard = getPublicDemoFinanceDashboard();

    expect(dashboard.syncStatus).toMatchObject({
      mode: "demo",
      canConnectLive: false,
    });
    expect(dashboard.envelopeBudget).toMatchObject({
      enabled: true,
      currency: "EUR",
      incomeMinor: 868_026,
    });
    expect(dashboard.envelopeBudget?.buckets.map((bucket) => bucket.name)).toEqual(
      ["Rent", "Food", "Travel", "Pension", "Savings", "Tax", "Extra"],
    );
  });

  it("serves the same data shapes used by real transaction and plan screens", () => {
    expect(getPublicDemoTransactionsData()).toMatchObject({
      canAddManual: false,
      categoryOptions: expect.arrayContaining(["Groceries", "Transport"]),
    });
    expect(getPublicDemoBudgetData()).toMatchObject({
      currency: "EUR",
      canChangeCurrency: false,
    });
  });
});
