import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderOpen, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatEur, shortlistCost, type Brief } from "@/lib/campaigns";

export const Route = createFileRoute("/_authenticated/mis-campanas/")({
  head: () => ({
    meta: [
      { title: "Mis campañas · Matchmaker" },
      { name: "description", content: "Consulta tus campañas guardadas y genera propuestas para el cliente." },
      { property: "og:title", content: "Mis campañas · Matchmaker" },
      { property: "og:description", content: "Consulta tus campañas guardadas y genera propuestas para el cliente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MisCampanas,
});

type Row = { id: string; name: string; brief: Brief; created_at: string; shortlist: string[]; proposal: string | null };

function MisCampanas() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fees, setFees] = useState<Record<string, number>>({});
  const [toDelete, setToDelete] = useState<Row | null>(null);

  useEffect(() => {
    supabase.from("campaigns").select("id,name,brief,created_at,shortlist,proposal").order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]));
    supabase.from("influencers").select("id,fee").then(({ data }) =>
      setFees(Object.fromEntries((data ?? []).map((p) => [p.id, p.fee]))));
  }, []);

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", toDelete.id);
    if (error) { toast.error("No se pudo eliminar la campaña."); return; }
    setRows((r) => r?.filter((x) => x.id !== toDelete.id) ?? null);
    toast.success("Campaña eliminada");
    setToDelete(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10">
      <p className="text-sm font-medium text-primary">Tu trabajo</p>
      <h1 className="mt-1 text-4xl md:text-5xl">Mis campañas</h1>

      {rows && rows.length === 0 && (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl">Aún no tienes campañas</p>
          <p className="mt-2 text-muted-foreground">Crea un brief y guarda tu primera shortlist.</p>
          <Button asChild className="mt-6"><Link to="/nueva-campana"><Sparkles /> Nueva campaña</Link></Button>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows?.map((c) => {
          const cost = shortlistCost(fees, c.shortlist, c.brief.budget);
          return (
            <div key={c.id} className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
              <Link to="/mis-campanas/$id" params={{ id: c.id }} className="absolute inset-0 rounded-2xl" aria-label={c.name} />
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.proposal ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {c.proposal ? "Propuesta lista" : "Borrador"}
                </span>
                <Button variant="ghost" size="icon" className="relative z-10 -mr-2 -mt-2" aria-label="Eliminar campaña" onClick={() => setToDelete(c)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="mt-3 text-2xl leading-tight">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.brief.brand} · {c.brief.objective}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4 text-sm">
                <span>{c.shortlist.length} perfiles</span>
                <span className="text-right">
                  <span className={`font-display text-lg ${cost.over ? "text-destructive" : ""}`}>{formatEur(cost.total)}</span>
                  <span className="text-muted-foreground"> / {formatEur(c.brief.budget)}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta campaña?</AlertDialogTitle>
            <AlertDialogDescription>Se borrarán «{toDelete?.name}», su shortlist y su propuesta. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
