import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/AppShell";

export const Route = createFileRoute("/mis-campanas")({
  head: () => ({
    meta: [
      { title: "Mis campañas · Matchmaker" },
      { name: "description", content: "Consulta y gestiona tus campañas con influencers." },
      { property: "og:title", content: "Mis campañas · Matchmaker" },
      { property: "og:description", content: "Consulta y gestiona tus campañas con influencers." },
    ],
  }),
  component: () => <ComingSoon title="Mis campañas" />,
});
