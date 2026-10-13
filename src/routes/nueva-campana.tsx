import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/nueva-campana")({
  head: () => ({
    meta: [
      { title: "Nueva campaña · Matchmaker" },
      { name: "description", content: "Crea un brief de campaña y encuentra influencers afines." },
      { property: "og:title", content: "Nueva campaña · Matchmaker" },
      { property: "og:description", content: "Crea un brief de campaña y encuentra influencers afines." },
    ],
  }),
  component: () => <ComingSoon title="Nueva campaña" />,
});
