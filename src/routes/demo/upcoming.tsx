import { createFileRoute } from "@tanstack/react-router";
import { PublicDemoUpcomingPage } from "#/components/PublicDemoPages";
import { getPublicDemoFinanceDashboard } from "#/lib/public-demo";

export const Route = createFileRoute("/demo/upcoming")({
  loader: () => getPublicDemoFinanceDashboard(),
  component: DemoUpcomingPage,
});

function DemoUpcomingPage() {
  return (
    <PublicDemoUpcomingPage
      recurringPayments={Route.useLoaderData().recurringPayments}
    />
  );
}
