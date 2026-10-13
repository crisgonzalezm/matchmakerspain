import { AlertTriangle, Instagram, Youtube, Music2 } from "lucide-react";
import { capitalize, formatFollowers, initials, type Influencer } from "@/lib/influencers";

export function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
  if (platform === "Instagram") return <Instagram className={className} />;
  if (platform === "YouTube") return <Youtube className={className} />;
  return <Music2 className={className} />;
}

export function Avatar({ name, size = "h-14 w-14 text-lg" }: { name: string; size?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-display text-accent-foreground ${size}`}>
      {initials(name)}
    </span>
  );
}

export function ProfileCard({ p, onClick }: { p: Influencer; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative flex w-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      {p.alert && (
        <span title="Tiene alertas reputacionales"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-warning text-warning-foreground">
          <AlertTriangle className="h-4 w-4" />
        </span>
      )}
      <div className="flex items-center gap-4">
        <Avatar name={p.name} />
        <div className="min-w-0 pr-8">
          <p className="truncate font-semibold">{p.name}</p>
          <p className="truncate text-sm text-muted-foreground">{p.handle}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
          <PlatformIcon platform={p.platform} className="h-3.5 w-3.5" /> {p.platform}
        </span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">{capitalize(p.main_niche)}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
        <div>
          <p className="font-display text-2xl">{formatFollowers(p.followers)}</p>
          <p className="text-xs text-muted-foreground">seguidores</p>
        </div>
        <div>
          <p className="font-display text-2xl">{Number(p.engagement).toFixed(1).replace(".", ",")}%</p>
          <p className="text-xs text-muted-foreground">engagement</p>
        </div>
      </div>
    </button>
  );
}
