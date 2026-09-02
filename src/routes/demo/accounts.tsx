import { createFileRoute } from "@tanstack/react-router";
import { PublicDemoAccountsPage } from "#/components/PublicDemoPages";
import { getPublicDemoFinanceDashboard } from "#/lib/public-demo";

export const Route = createFileRoute("/demo/accounts")({
  loader: () => getPublicDemoFinanceDashboard(),
  component: DemoAccountsPage,
});

function DemoAccountsPage() {
  return <PublicDemoAccountsPage accounts={Route.useLoaderData().accounts} />;
}
