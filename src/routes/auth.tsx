import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder · Matchmaker" },
      { name: "description", content: "Inicia sesión en Matchmaker para gestionar perfiles y campañas." },
      { property: "og:title", content: "Acceder · Matchmaker" },
      { property: "og:description", content: "Inicia sesión en Matchmaker para gestionar perfiles y campañas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("Correo o contraseña incorrectos."); return; }
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) { toast.error("No se pudo crear la cuenta."); return; }
      toast.success("Revisa tu correo para confirmar la cuenta.");
      setMode("in");
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-4xl">{mode === "in" ? "Iniciar sesión" : "Crear cuenta"}</h1>
      <p className="mt-2 text-muted-foreground">Accede para ver perfiles y campañas del equipo.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <Input type="email" required placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={busy}>{mode === "in" ? "Entrar" : "Crear cuenta"}</Button>
      </form>
      <button type="button" className="mt-4 text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
