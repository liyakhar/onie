import { createFileRoute } from "@tanstack/react-router";
import { getPublicDemoFinanceDashboard } from "#/lib/public-demo";
import { MoneyDashboardContent } from "#/routes/app/index";

export const Route = createFileRoute("/demo/")({
  loader: () => getPublicDemoFinanceDashboard(),
  component: DemoHomePage,
});

function DemoHomePage() {
  return <MoneyDashboardContent dashboard={Route.useLoaderData()} demo />;
}
