import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, PlatformIcon, ProfileCard } from "@/components/ProfileCard";
import { ProfileForm } from "@/components/ProfileForm";
import {
  ENGAGEMENT_RANGES, FOLLOWER_RANGES, NICHES, PLATFORMS, capitalize, formatFollowers,
  type Influencer, type InfluencerInput,
} from "@/lib/influencers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Perfiles · Matchmaker" },
      { name: "description", content: "Base de perfiles de influencers para agencias de comunicación y PR." },
      { property: "og:title", content: "Perfiles · Matchmaker" },
      { property: "og:description", content: "Base de perfiles de influencers para agencias de comunicación y PR." },
    ],
  }),
  component: Perfiles,
});

const KEY = ["influencers"];

function Perfiles() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("influencers").select("*").order("name");
      if (error) throw error;
      return data as Influencer[];
    },
  });

  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("all");
  const [niche, setNiche] = useState("all");
  const [fr, setFr] = useState<keyof typeof FOLLOWER_RANGES>("all");
  const [er, setEr] = useState<keyof typeof ENGAGEMENT_RANGES>("all");
  const [city, setCity] = useState("all");
  const [noAlerts, setNoAlerts] = useState(false);

  const [detail, setDetail] = useState<Influencer | null>(null);
  const [editing, setEditing] = useState<Influencer | null | "new">(null);
  const [deleting, setDeleting] = useState<Influencer | null>(null);

  const cities = useMemo(() => [...new Set(data.map((d) => d.city))].sort(), [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const F = FOLLOWER_RANGES[fr], E = ENGAGEMENT_RANGES[er];
    return data.filter((p) =>
      (!term || p.name.toLowerCase().includes(term) || p.handle.toLowerCase().includes(term)) &&
      (platform === "all" || p.platform === platform) &&
      (niche === "all" || p.main_niche === niche || p.secondary_niches.includes(niche)) &&
      p.followers >= F.min && p.followers < F.max &&
      Number(p.engagement) >= E.min && Number(p.engagement) < E.max &&
      (city === "all" || p.city === city) &&
      (!noAlerts || !p.alert),
    );
  }, [data, q, platform, niche, fr, er, city, noAlerts]);

  const save = useMutation({
    mutationFn: async (input: InfluencerInput) => {
      if (editing && editing !== "new") {
        const { error } = await supabase.from("influencers").update(input).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("influencers").insert(input);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing === "new" ? "Perfil creado" : "Perfil actualizado");
      setEditing(null);
      setDetail(null);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("No se pudo guardar el perfil"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("influencers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil eliminado");
      setDeleting(null);
      setDetail(null);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: () => toast.error("No se pudo eliminar el perfil"),
  });

  const reset = () => {
    setQ(""); setPlatform("all"); setNiche("all"); setFr("all"); setEr("all"); setCity("all"); setNoAlerts(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Base de perfiles</p>
          <h1 className="mt-2 text-4xl md:text-5xl">Perfiles</h1>
          <p className="mt-2 text-muted-foreground">{filtered.length} de {data.length} influencers</p>
        </div>
        <Button size="lg" onClick={() => setEditing("new")}><Plus /> Añadir perfil</Button>
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nombre o @handle" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <FilterSelect label="Plataforma" value={platform} onChange={setPlatform}
            options={[["all", "Todas"], ...PLATFORMS.map((p) => [p, p] as [string, string])]} />
          <FilterSelect label="Nicho" value={niche} onChange={setNiche}
            options={[["all", "Todos"], ...NICHES.map((n) => [n, capitalize(n)] as [string, string])]} />
          <FilterSelect label="Seguidores" value={fr} onChange={(v) => setFr(v as typeof fr)}
            options={Object.entries(FOLLOWER_RANGES).map(([k, v]) => [k, v.label])} />
          <FilterSelect label="Engagement" value={er} onChange={(v) => setEr(v as typeof er)}
            options={Object.entries(ENGAGEMENT_RANGES).map(([k, v]) => [k, v.label])} />
          <FilterSelect label="Ciudad" value={city} onChange={setCity}
            options={[["all", "Todas"], ...cities.map((c) => [c, c] as [string, string])]} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch id="noalerts" checked={noAlerts} onCheckedChange={setNoAlerts} />
            <Label htmlFor="noalerts">Solo sin alertas</Label>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>Limpiar filtros</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-12 text-center text-muted-foreground">Cargando perfiles…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">No hay perfiles que coincidan con los filtros.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => <ProfileCard key={p.id} p={p} onClick={() => setDetail(p)} />)}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {detail && (
            <Detail p={detail} onEdit={() => setEditing(detail)} onDelete={() => setDeleting(detail)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">
              {editing === "new" ? "Nuevo perfil" : "Editar perfil"}
            </DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <ProfileForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? null : editing}
              saving={save.isPending}
              onSubmit={(d) => save.mutate(d)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-0.5 text-sm">{capitalize(i)}</span>)}
    </div>
  );
}

function Detail({ p, onEdit, onDelete }: { p: Influencer; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-4 text-left">
          <Avatar name={p.name} size="h-16 w-16 text-xl" />
          <div>
            <DialogTitle className="font-display text-3xl font-normal">{p.name}</DialogTitle>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <PlatformIcon platform={p.platform} /> {p.handle} · {p.platform} · {p.city}
            </p>
          </div>
        </div>
      </DialogHeader>

      {p.alert && (
        <div className="flex gap-3 rounded-xl border border-warning bg-warning/15 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning-foreground" />
          <div><p className="font-semibold">Alerta reputacional</p><p className="mt-0.5">{p.alert}</p></div>
        </div>
      )}

      <p className="leading-relaxed">{p.bio}</p>

      <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-4 text-center">
        <div><p className="font-display text-2xl">{formatFollowers(p.followers)}</p><p className="text-xs text-muted-foreground">seguidores</p></div>
        <div><p className="font-display text-2xl">{Number(p.engagement).toFixed(1).replace(".", ",")}%</p><p className="text-xs text-muted-foreground">engagement</p></div>
        <div><p className="font-display text-2xl">{p.fee.toLocaleString("es-ES")} €</p><p className="text-xs text-muted-foreground">por publicación</p></div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Nicho principal"><Chips items={[p.main_niche]} /></Row>
        <Row label="Nichos secundarios"><Chips items={p.secondary_niches} /></Row>
        <Row label="Audiencia">
          <p>{p.audience_female_pct}% mujeres · {100 - p.audience_female_pct}% hombres</p>
          <p className="text-sm text-muted-foreground">Edad principal {p.audience_age} · {p.audience_country}</p>
        </Row>
        <Row label="Tono"><p>{capitalize(p.tone)}</p></Row>
        <Row label="Valores y temas"><Chips items={p.values} /></Row>
        <Row label="Colaboraciones previas"><Chips items={p.collaborations} /></Row>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="outline" onClick={onDelete}><Trash2 /> Eliminar</Button>
        <Button onClick={onEdit}><Pencil /> Editar</Button>
      </div>
    </div>
  );
}
