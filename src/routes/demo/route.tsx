import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "#/components/AppShell";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Interactive demo · Wollie" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoRoute,
});

function DemoRoute() {
  return <AppShell demo />;
}
