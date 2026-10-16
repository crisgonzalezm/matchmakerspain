import { Link } from "@tanstack/react-router";
import { Users, Sparkles, FolderOpen, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Perfiles", icon: Users },
  { to: "/nueva-campana", label: "Nueva campaña", icon: Sparkles },
  { to: "/mis-campanas", label: "Mis campañas", icon: FolderOpen },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
        M
      </span>
      <span className="font-display text-2xl">Matchmaker</span>
    </div>
  );
}

function SignOut() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!signedIn) return null;
  return (
    <button
      type="button"
      className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
      onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}
    >
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-10 flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-5 md:block">
        <Brand />
        <NavLinks />
        <p className="absolute bottom-6 left-7 right-5 text-xs text-muted-foreground">
          Encuentra el influencer perfecto para cada marca.
        </p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <Brand />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Menu />
          </Button>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <Brand />
            <NavLinks onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Sparkles className="h-6 w-6" />
      </span>
      <h1 className="text-4xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">Próximamente</p>
    </div>
  );
}
