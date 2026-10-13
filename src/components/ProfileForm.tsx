import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AGE_RANGES, NICHES, PLATFORMS, TONES, capitalize,
  type Influencer, type InfluencerInput,
} from "@/lib/influencers";

const toList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function ProfileForm({
  initial, onSubmit, saving,
}: {
  initial?: Influencer | null;
  onSubmit: (data: InfluencerInput) => void;
  saving?: boolean;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    handle: initial?.handle ?? "@",
    platform: initial?.platform ?? "Instagram",
    main_niche: initial?.main_niche ?? "lifestyle",
    secondary_niches: initial?.secondary_niches ?? [],
    city: initial?.city ?? "",
    followers: String(initial?.followers ?? ""),
    engagement: String(initial?.engagement ?? ""),
    audience_female_pct: String(initial?.audience_female_pct ?? 50),
    audience_age: initial?.audience_age ?? "25-34",
    audience_country: initial?.audience_country ?? "España",
    values: (initial?.values ?? []).join(", "),
    tone: initial?.tone ?? "cercano",
    collaborations: (initial?.collaborations ?? []).join(", "),
    fee: String(initial?.fee ?? ""),
    alert: initial?.alert ?? "",
    bio: initial?.bio ?? "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const toggleSecondary = (n: string) =>
    setF((p) => ({
      ...p,
      secondary_niches: p.secondary_niches.includes(n)
        ? p.secondary_niches.filter((x) => x !== n)
        : [...p.secondary_niches, n],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = f.handle.trim().startsWith("@") ? f.handle.trim() : `@${f.handle.trim()}`;
    onSubmit({
      name: f.name.trim(),
      handle,
      platform: f.platform,
      main_niche: f.main_niche,
      secondary_niches: f.secondary_niches.filter((n) => n !== f.main_niche),
      city: f.city.trim(),
      followers: Number(f.followers) || 0,
      engagement: Number(f.engagement.replace(",", ".")) || 0,
      audience_female_pct: Math.min(100, Math.max(0, Number(f.audience_female_pct) || 0)),
      audience_age: f.audience_age,
      audience_country: f.audience_country.trim(),
      values: toList(f.values),
      tone: f.tone,
      collaborations: toList(f.collaborations),
      fee: Number(f.fee) || 0,
      alert: f.alert.trim() || null,
      bio: f.bio.trim(),
    });
  };

  const field = (label: string, el: React.ReactNode, full = false) => (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {el}
    </div>
  );

  const sel = (k: "platform" | "main_niche" | "tone" | "audience_age", opts: readonly string[]) => (
    <Select value={f[k]} onValueChange={set(k)}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {opts.map((o) => <SelectItem key={o} value={o}>{capitalize(o)}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {field("Nombre", <Input required value={f.name} onChange={(e) => set("name")(e.target.value)} />)}
      {field("Handle", <Input required value={f.handle} onChange={(e) => set("handle")(e.target.value)} />)}
      {field("Plataforma principal", sel("platform", PLATFORMS))}
      {field("Nicho principal", sel("main_niche", NICHES))}
      {field("Nichos secundarios", (
        <div className="flex flex-wrap gap-2">
          {NICHES.filter((n) => n !== f.main_niche).map((n) => {
            const on = f.secondary_niches.includes(n);
            return (
              <button type="button" key={n} onClick={() => toggleSecondary(n)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}>
                {capitalize(n)}
              </button>
            );
          })}
        </div>
      ), true)}
      {field("Ciudad", <Input required value={f.city} onChange={(e) => set("city")(e.target.value)} />)}
      {field("Seguidores", <Input required type="number" min={0} value={f.followers} onChange={(e) => set("followers")(e.target.value)} />)}
      {field("Engagement medio (%)", <Input required inputMode="decimal" value={f.engagement} onChange={(e) => set("engagement")(e.target.value)} />)}
      {field("Tarifa por publicación (€)", <Input type="number" min={0} value={f.fee} onChange={(e) => set("fee")(e.target.value)} />)}
      {field("Audiencia: % mujeres", <Input type="number" min={0} max={100} value={f.audience_female_pct} onChange={(e) => set("audience_female_pct")(e.target.value)} />)}
      {field("Audiencia: edad principal", sel("audience_age", AGE_RANGES))}
      {field("Audiencia: país principal", <Input value={f.audience_country} onChange={(e) => set("audience_country")(e.target.value)} />)}
      {field("Tono de comunicación", sel("tone", TONES))}
      {field("Valores y temas (separados por comas)", <Input value={f.values} onChange={(e) => set("values")(e.target.value)} />, true)}
      {field("Colaboraciones previas (separadas por comas)", <Input value={f.collaborations} onChange={(e) => set("collaborations")(e.target.value)} />, true)}
      {field("Alertas reputacionales (opcional)", <Textarea rows={2} value={f.alert} onChange={(e) => set("alert")(e.target.value)} />, true)}
      {field("Bio breve", <Textarea rows={3} value={f.bio} onChange={(e) => set("bio")(e.target.value)} />, true)}
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar perfil"}</Button>
      </div>
    </form>
  );
}
