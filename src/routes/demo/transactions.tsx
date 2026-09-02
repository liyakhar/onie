import { createFileRoute } from "@tanstack/react-router";
import { getPublicDemoTransactionsData } from "#/lib/public-demo";
import { TransactionsContent } from "#/routes/app/transactions";

export const Route = createFileRoute("/demo/transactions")({
  loader: () => getPublicDemoTransactionsData(),
  component: DemoTransactionsPage,
});

function DemoTransactionsPage() {
  return <TransactionsContent data={Route.useLoaderData()} readOnly />;
}
