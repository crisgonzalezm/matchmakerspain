import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, Plus, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, PlatformIcon } from "@/components/ProfileCard";
import { PLATFORMS, capitalize, formatFollowers, type Influencer } from "@/lib/influencers";
import { EMPTY_BRIEF, EXAMPLE_BRIEF, OBJECTIVES, formatEur, shortlistCost, type Brief, type RankItem } from "@/lib/campaigns";
import { rankInfluencers } from "@/lib/ranking.functions";

export const Route = createFileRoute("/nueva-campana")({
  head: () => ({
    meta: [
      { title: "Nueva campaña · Matchmaker" },
      { name: "description", content: "Crea un brief de campaña y encuentra influencers afines con IA." },
      { property: "og:title", content: "Nueva campaña · Matchmaker" },
      { property: "og:description", content: "Crea un brief de campaña y encuentra influencers afines con IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NuevaCampana,
});

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-5 flex items-center gap-3 text-xl">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent font-sans text-sm text-accent-foreground">{n}</span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function F({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-muted" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} className="fill-none stroke-primary" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg">{score}</span>
    </div>
  );
}

function NuevaCampana() {
  const [b, setB] = useState<Brief>(EMPTY_BRIEF);
  const [profiles, setProfiles] = useState<Influencer[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const rank = useServerFn(rankInfluencers);

  useEffect(() => {
    supabase.from("influencers").select("*").then(({ data }) => setProfiles(data ?? []));
  }, []);

  const byId = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const fees = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p.fee])), [profiles]);
  const cost = shortlistCost(fees, selected, b.budget);
  const top10Cost = ranking.reduce((s, r) => s + (fees[r.id] ?? 0), 0);

  const set = <K extends keyof Brief>(k: K) => (v: Brief[K]) => setB((p) => ({ ...p, [k]: v }));
  const togglePlatform = (pl: string) =>
    set("platforms")(b.platforms.includes(pl) ? b.platforms.filter((x) => x !== pl) : [...b.platforms, pl]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setStatus("loading"); setError(""); setSaved(false); setSelected([]);
    setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const res = await rank({ data: { brief: b } });
      if ("error" in res) { setError(res.error); setStatus("error"); return; }
      setRanking(res.results); setStatus("done");
    } catch {
      setError("No se ha podido conectar con la IA."); setStatus("error");
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("campaigns").insert({
      name: b.name || `${b.brand} · campaña`,
      brief: b as never,
      ranking: ranking.map((r) => ({ ...r, fee: fees[r.id] ?? 0, name: byId[r.id]?.name })) as never,
      shortlist: selected,
    });
    setSaving(false);
    if (error) { toast.error("No se pudo guardar la campaña."); return; }
    setSaved(true);
    toast.success("Campaña guardada", { description: "Podrás consultarla en Mis campañas." });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-40 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Brief de campaña</p>
          <h1 className="mt-1 text-4xl md:text-5xl">Nueva campaña</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Cuéntanos qué busca la marca y la IA encontrará los perfiles con mejor encaje.</p>
        </div>
        <Button variant="outline" onClick={() => setB(EXAMPLE_BRIEF)}><Wand2 /> Rellenar con un ejemplo</Button>
      </div>

      <form onSubmit={search} className="mt-8 space-y-5">
        <Section n={1} title="La campaña">
          <F label="Nombre de la campaña"><Input required value={b.name} onChange={(e) => set("name")(e.target.value)} /></F>
          <F label="Objetivo">
            <Select value={b.objective} onValueChange={set("objective")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{OBJECTIVES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Marca"><Input required value={b.brand} onChange={(e) => set("brand")(e.target.value)} /></F>
          <F label="Sector"><Input required value={b.sector} onChange={(e) => set("sector")(e.target.value)} /></F>
        </Section>

        <Section n={2} title="Público y plataformas">
          <F label="Edad"><Input placeholder="p. ej. 25-40" value={b.audience_age} onChange={(e) => set("audience_age")(e.target.value)} /></F>
          <F label="Género">
            <Select value={b.audience_gender} onValueChange={set("audience_gender")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Mujeres", "Hombres", "Mixto"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Intereses" full><Input value={b.audience_interests} onChange={(e) => set("audience_interests")(e.target.value)} /></F>
          <F label="Plataformas preferidas" full>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((pl) => {
                const on = b.platforms.includes(pl);
                return (
                  <button type="button" key={pl} onClick={() => togglePlatform(pl)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
                    <PlatformIcon platform={pl} /> {pl}
                  </button>
                );
              })}
            </div>
          </F>
        </Section>

        <Section n={3} title="Presupuesto">
          <F label="Presupuesto total para influencers (€)"><Input required type="number" min={0} value={b.budget || ""} onChange={(e) => set("budget")(Number(e.target.value))} /></F>
          <F label="Número aproximado de influencers"><Input type="number" min={1} value={b.count || ""} onChange={(e) => set("count")(Number(e.target.value))} /></F>
        </Section>

        <Section n={4} title="Marca, tono y límites">
          <F label="Valores de la marca" full><Textarea rows={2} value={b.values} onChange={(e) => set("values")(e.target.value)} /></F>
          <F label="Tono deseado" full><Input value={b.tone} onChange={(e) => set("tone")(e.target.value)} /></F>
          <F label="Qué hay que evitar" full><Textarea rows={2} value={b.avoid} onChange={(e) => set("avoid")(e.target.value)} /></F>
          <F label="Notas adicionales" full><Textarea rows={3} value={b.notes} onChange={(e) => set("notes")(e.target.value)} /></F>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={status === "loading"}><Sparkles /> Buscar influencers</Button>
        </div>
      </form>

      <div id="resultados" className="scroll-mt-6">
        {status === "loading" && (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></span>
            </span>
            <p className="mt-6 font-display text-2xl">Analizando {profiles.length || ""} perfiles…</p>
            <p className="mt-2 text-sm text-muted-foreground">Comparando audiencia, valores, tono y riesgos con tu brief.</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-destructive/40 bg-card px-6 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="mt-4 font-semibold">{error}</p>
            <Button className="mt-5" variant="outline" onClick={() => search()}><RotateCcw /> Reintentar</Button>
          </div>
        )}

        {status === "done" && (
          <div className="mt-12">
            <h2 className="text-3xl">Ranking recomendado</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Presupuesto", formatEur(b.budget)],
                ["Coste del top 10", formatEur(top10Cost)],
                ["Seleccionados", `${formatEur(cost.total)} · ${selected.length} perfiles`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className={`mt-1 font-display text-xl ${k === "Seleccionados" && cost.over ? "text-destructive" : ""}`}>{v}</p>
                </div>
              ))}
            </div>

            <ol className="mt-6 space-y-4">
              {ranking.map((r, i) => {
                const p = byId[r.id];
                if (!p) return null;
                const on = selected.includes(r.id);
                return (
                  <li key={r.id} className={`rounded-2xl border bg-card p-5 transition-colors ${on ? "border-primary" : "border-border"}`}>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="w-6 font-display text-xl text-muted-foreground">{i + 1}</span>
                      <ScoreRing score={r.score} />
                      <Avatar name={p.name} size="h-11 w-11 text-base" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.name} <span className="font-normal text-muted-foreground">{p.handle}</span></p>
                        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <PlatformIcon platform={p.platform} className="h-3.5 w-3.5" /> {p.platform} · {capitalize(p.main_niche)} · {formatFollowers(p.followers)} · {Number(p.engagement).toFixed(1).replace(".", ",")}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl">{formatEur(p.fee)}</p>
                        <p className="text-xs text-muted-foreground">coste estimado</p>
                      </div>
                      <Button variant={on ? "default" : "outline"} onClick={() => toggle(r.id)}>
                        {on ? <><Check /> En shortlist</> : <><Plus /> Añadir</>}
                      </Button>
                    </div>
                    <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Por qué encaja</p>
                        <ul className="mt-2 space-y-1.5 text-sm">{r.reasons.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-warning-foreground">Riesgos y puntos de atención</p>
                        <ul className="mt-2 space-y-1.5 text-sm">{r.risks.map((x) => <li key={x} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />{x}</li>)}</ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      {status === "done" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm">
              <span className="font-semibold">{selected.length}</span> seleccionados ·{" "}
              <span className={`font-display text-lg ${cost.over ? "text-destructive" : ""}`}>{formatEur(cost.total)}</span>
              <span className="text-muted-foreground"> de {formatEur(b.budget)}</span>
              {cost.over && <span className="ml-2 text-destructive">Supera el presupuesto</span>}
            </p>
            {saved ? (
              <p className="flex items-center gap-2 text-sm text-primary"><Check className="h-4 w-4" /> Campaña guardada · <Link to="/mis-campanas" className="underline">Mis campañas</Link></p>
            ) : (
              <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar campaña"}</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
