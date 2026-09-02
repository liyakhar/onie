import { createFileRoute } from "@tanstack/react-router";
import { getPublicDemoBudgetData } from "#/lib/public-demo";
import { BudgetContent } from "#/routes/app/budgets";

export const Route = createFileRoute("/demo/budgets")({
  loader: () => getPublicDemoBudgetData(),
  component: DemoBudgetPage,
});

function DemoBudgetPage() {
  return <BudgetContent data={Route.useLoaderData()} readOnly />;
}
