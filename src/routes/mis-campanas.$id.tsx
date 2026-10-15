import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Copy, Download, FileText, Plus, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, PlatformIcon } from "@/components/ProfileCard";
import { ProposalDoc, proposalPlain } from "@/components/ProposalDoc";
import { capitalize, formatFollowers, type Influencer } from "@/lib/influencers";
import { formatEur, shortlistCost, type Brief, type RankItem } from "@/lib/campaigns";
import { generateProposal } from "@/lib/proposal.functions";

export const Route = createFileRoute("/mis-campanas/$id")({
  head: () => ({
    meta: [
      { title: "Detalle de campaña · Matchmaker" },
      { name: "description", content: "Brief, shortlist y propuesta para el cliente de tu campaña con influencers." },
      { property: "og:title", content: "Detalle de campaña · Matchmaker" },
      { property: "og:description", content: "Brief, shortlist y propuesta para el cliente de tu campaña con influencers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detalle,
});

type Campaign = { id: string; name: string; brief: Brief; ranking: RankItem[]; shortlist: string[]; proposal: string | null; created_at: string };

function RankRow({ r, p, on, onToggle }: { r: RankItem; p: Influencer; on: boolean; onToggle: () => void }) {
  return (
    <li className={`rounded-2xl border bg-card p-5 ${on ? "border-primary" : "border-border"}`}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-display text-lg text-accent-foreground">{r.score}</span>
        <Avatar name={p.name} size="h-11 w-11 text-base" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{p.name} <span className="font-normal text-muted-foreground">{p.handle}</span></p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <PlatformIcon platform={p.platform} className="h-3.5 w-3.5" /> {p.platform} · {capitalize(p.main_niche)} · {formatFollowers(p.followers)}
          </p>
        </div>
        <p className="font-display text-xl">{formatEur(p.fee)}</p>
        <Button variant={on ? "default" : "outline"} size="sm" onClick={onToggle}>
          {on ? <><Check /> En shortlist</> : <><Plus /> Añadir</>}
        </Button>
      </div>
      <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
        <ul className="space-y-1.5 text-sm">{r.reasons.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>)}</ul>
        <ul className="space-y-1.5 text-sm">{r.risks.map((x) => <li key={x} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />{x}</li>)}</ul>
      </div>
    </li>
  );
}

function Detalle() {
  const { id } = Route.useParams();
  const [c, setC] = useState<Campaign | null | undefined>(undefined);
  const [profiles, setProfiles] = useState<Influencer[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [gen, setGen] = useState<"idle" | "loading" | "error">("idle");
  const [genError, setGenError] = useState("");
  const generate = useServerFn(generateProposal);

  useEffect(() => {
    supabase.from("campaigns").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setC(data as unknown as Campaign | null);
      setSelected(data?.shortlist ?? []);
    });
    supabase.from("influencers").select("*").then(({ data }) => setProfiles(data ?? []));
  }, [id]);

  const byId = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const fees = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p.fee])), [profiles]);

  if (c === undefined) return <div className="p-10 text-muted-foreground">Cargando…</div>;
  if (c === null) return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-3xl">Campaña no encontrada</h1>
      <Button asChild variant="outline" className="mt-6"><Link to="/mis-campanas"><ArrowLeft /> Volver</Link></Button>
    </div>
  );

  const b = c.brief;
  const cost = shortlistCost(fees, selected, b.budget);
  const dirty = [...selected].sort().join() !== [...c.shortlist].sort().join();
  const toggle = (pid: string) => setSelected((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]));
  const shortRanks = c.ranking.filter((r) => selected.includes(r.id));
  const rest = c.ranking.filter((r) => !selected.includes(r.id));

  const saveShortlist = async () => {
    setSaving(true);
    const { error } = await supabase.from("campaigns").update({ shortlist: selected }).eq("id", c.id);
    setSaving(false);
    if (error) { toast.error("No se pudieron guardar los cambios."); return; }
    setC({ ...c, shortlist: selected });
    toast.success("Shortlist actualizada");
  };

  const runGenerate = async () => {
    if (dirty) await saveShortlist();
    setGen("loading"); setGenError("");
    setTimeout(() => document.getElementById("propuesta")?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await generate({ data: { id: c.id } });
      if ("error" in res) { setGenError(res.error); setGen("error"); return; }
      setC((prev) => (prev ? { ...prev, proposal: res.proposal } : prev));
      setGen("idle");
    } catch {
      setGenError("No se ha podido conectar con la IA."); setGen("error");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(proposalPlain(c.proposal ?? ""));
    toast.success("Texto copiado");
  };

  const facts: [string, string][] = [
    ["Marca", b.brand], ["Sector", b.sector], ["Objetivo", b.objective],
    ["Público", [b.audience_gender, b.audience_age, b.audience_interests].filter(Boolean).join(" · ")],
    ["Plataformas", b.platforms.join(", ") || "Sin preferencia"], ["Presupuesto", formatEur(b.budget)],
    ["Valores", b.values], ["Tono", b.tone], ["Qué evitar", b.avoid],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-40 pt-10">
      <Link to="/mis-campanas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mis campañas</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">{c.proposal ? "Propuesta lista" : "Borrador"}</p>
          <h1 className="mt-1 text-4xl md:text-5xl">{c.name}</h1>
        </div>
        {!c.proposal && <Button size="lg" onClick={runGenerate} disabled={gen === "loading" || !selected.length}><Sparkles /> Generar propuesta</Button>}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl">Resumen del brief</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 text-sm">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl">Shortlist</h2>
        {shortRanks.length === 0 && <p className="mt-3 text-muted-foreground">No hay perfiles en la shortlist. Añádelos desde el resto del ranking.</p>}
        <ol className="mt-4 space-y-4">
          {shortRanks.map((r) => byId[r.id] && <RankRow key={r.id} r={r} p={byId[r.id]!} on onToggle={() => toggle(r.id)} />)}
        </ol>
      </section>

      {rest.length > 0 && (
        <Collapsible className="mt-8">
          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left">
            <span className="font-medium">Resto del ranking ({rest.length})</span>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ol className="mt-4 space-y-4">
              {rest.map((r) => byId[r.id] && <RankRow key={r.id} r={r} p={byId[r.id]!} on={false} onToggle={() => toggle(r.id)} />)}
            </ol>
          </CollapsibleContent>
        </Collapsible>
      )}

      <section id="propuesta" className="mt-14 scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Propuesta para el cliente</h2>
          {c.proposal && gen !== "loading" && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copy}><Copy /> Copiar texto</Button>
              <Button variant="outline" onClick={() => window.print()}><Download /> Descargar PDF</Button>
              <Button variant="outline" onClick={runGenerate}><RotateCcw /> Regenerar</Button>
            </div>
          )}
        </div>

        {gen === "loading" && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><FileText className="h-5 w-5" /></span>
            </span>
            <p className="mt-6 font-display text-2xl">Redactando la propuesta…</p>
            <p className="mt-2 text-sm text-muted-foreground">Puede tardar un minuto.</p>
          </div>
        )}

        {gen === "error" && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-destructive/40 bg-card px-6 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="mt-4 font-semibold">{genError}</p>
            <Button className="mt-5" variant="outline" onClick={runGenerate}><RotateCcw /> Reintentar</Button>
          </div>
        )}

        {gen === "idle" && !c.proposal && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-muted-foreground">Todavía no hay propuesta. La IA la redactará a partir del brief y la shortlist.</p>
            <Button className="mt-5" onClick={runGenerate} disabled={!selected.length}><Sparkles /> Generar propuesta</Button>
          </div>
        )}

        {gen === "idle" && c.proposal && (
          <article className="print-doc mt-6 rounded-2xl border border-border bg-card px-8 py-10 shadow-sm md:px-14">
            <header className="mb-8 border-b border-border pb-6">
              <p className="text-sm font-medium text-primary">Propuesta de campaña con influencers</p>
              <h1 className="mt-1 text-4xl">{c.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{b.brand} · {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
            </header>
            <ProposalDoc text={c.proposal} />
          </article>
        )}
      </section>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm">
              <span className="font-semibold">{selected.length}</span> seleccionados ·{" "}
              <span className={`font-display text-lg ${cost.over ? "text-destructive" : ""}`}>{formatEur(cost.total)}</span>
              <span className="text-muted-foreground"> de {formatEur(b.budget)}</span>
              {cost.over && <span className="ml-2 text-destructive">Supera el presupuesto</span>}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(c.shortlist)}>Descartar</Button>
              <Button onClick={saveShortlist} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
