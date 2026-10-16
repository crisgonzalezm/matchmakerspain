import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => {
    if (typeof d?.id !== "string" || !/^[0-9a-f-]{36}$/i.test(d.id)) throw new Error("Invalid id");
    return { id: d.id };
  })
  .handler(async ({ data, context }): Promise<{ proposal: string } | { error: string }> => {
    const sb = context.supabase;
    const { data: c } = await sb.from("campaigns").select("*").eq("id", data.id).maybeSingle();
    if (!c) return { error: "No se ha encontrado la campaña." };
    if (!c.shortlist.length) return { error: "Añade al menos un perfil a la shortlist antes de generar la propuesta." };
    const { data: profiles } = await sb.from("influencers").select("*").in("id", c.shortlist);
    const ranking = (c.ranking as { id: string; score: number; reasons: string[]; risks: string[] }[]) ?? [];
    const perfiles = (profiles ?? []).map((p) => {
      const r = ranking.find((x) => x.id === p.id);
      return {
        nombre: p.name, usuario: p.handle, plataforma: p.platform, nicho: p.main_niche, ciudad: p.city,
        seguidores: p.followers, engagement: p.engagement, tono: p.tone, valores: p.values,
        tarifa_eur: p.fee, alerta: p.alert, puntuacion: r?.score, razones: r?.reasons, riesgos: r?.risks,
      };
    });

    const instructions = `Eres director/a de cuentas de una agencia de comunicación y PR española. Redacta una propuesta profesional de campaña con influencers lista para presentar al cliente, en español, con tono de agencia: claro, seguro, cálido y concreto.
Formato: Markdown sencillo. Usa solo encabezados "## " y "### ", párrafos, listas con "- " y **negritas**. No uses tablas ni emojis.
Usa exactamente estos seis encabezados ## (solo el texto indicado, sin añadir nada entre paréntesis):
## Resumen ejecutivo — 3-4 líneas.
## Objetivo y enfoque estratégico
## Perfiles recomendados — un ### por perfil con nombre y usuario; por qué encaja con la marca y qué contenido proponemos (reel de rutina, unboxing, tutorial, carrusel…).
## Riesgos identificados y cómo los gestionaremos
## Presupuesto — lista con el desglose por perfil en euros, total y margen frente al presupuesto disponible; si se supera, indícalo y propón cómo ajustarlo.
## Próximos pasos y calendario orientativo — por semanas.
El texto tras el guion es una instrucción para ti: no lo copies en el encabezado.
No inventes datos de los perfiles distintos de los proporcionados. No incluyas título principal ni firma.`;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "La IA no está configurada." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input: `BRIEF:\n${JSON.stringify(c.brief)}\n\nPERFILES DE LA SHORTLIST:\n${JSON.stringify(perfiles)}`,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Demasiadas solicitudes. Espera un momento y reinténtalo." };
      if (res.status === 402) return { error: "Se han agotado los créditos de IA del espacio de trabajo." };
      return { error: `La IA no ha podido redactar la propuesta (${res.status}).` };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(line.slice(5));
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") return { error: "La IA ha devuelto un error." };
        } catch { /* ignore partial */ }
      }
    }
    text = text.trim();
    if (!text) return { error: "La IA no ha devuelto ningún texto." };
    const { error } = await sb.from("campaigns").update({ proposal: text, proposal_at: new Date().toISOString() }).eq("id", c.id);
    if (error) return { error: "La propuesta se ha redactado pero no se pudo guardar." };
    return { proposal: text };
  });
