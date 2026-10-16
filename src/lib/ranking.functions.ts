import { createServerFn } from "@tanstack/react-start";
import type { Brief, RankItem } from "./campaigns";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "reasons", "risks"],
        properties: {
          id: { type: "string" },
          score: { type: "integer" },
          reasons: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export const rankInfluencers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { brief: Brief }) => d)
  .handler(async ({ data, context }): Promise<{ results: RankItem[] } | { error: string }> => {
    const sb = context.supabase;
    const { data: profiles, error } = await sb.from("influencers").select("*");
    if (error || !profiles) return { error: "No se pudieron cargar los perfiles." };

    const compact = profiles.map((p) => ({
      id: p.id, nombre: p.name, plataforma: p.platform, nicho: p.main_niche, secundarios: p.secondary_niches,
      ciudad: p.city, seguidores: p.followers, engagement: p.engagement,
      audiencia: { mujeres_pct: p.audience_female_pct, edad: p.audience_age, pais: p.audience_country },
      valores: p.values, tono: p.tone, colaboraciones: p.collaborations, tarifa: p.fee,
      alerta: p.alert, bio: p.bio,
    }));

    const instructions = `Eres un estratega senior de influencer marketing en una agencia de PR española.
Analiza el brief frente a los perfiles y devuelve los 10 perfiles que mejor encajan, ordenados de mayor a menor puntuación (0-100).
Para cada uno: 2-3 razones concretas (audiencia, valores, tono, nicho, engagement) y riesgos o puntos de atención.
Penaliza con fuerza las alertas reputacionales y las colaboraciones con marcas que puedan ser competencia del sector del brief; menciónalas siempre en riesgos.
Si no hay riesgos relevantes, indica uno menor o "Sin riesgos destacables". Considera las plataformas preferidas y el presupuesto por perfil. Escribe en español. Usa los id exactos.`;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "La IA no está configurada." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input: `BRIEF:\n${JSON.stringify(data.brief)}\n\nPERFILES:\n${JSON.stringify(compact)}`,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        text: { format: { type: "json_schema", name: "ranking", strict: true, schema: SCHEMA } },
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Demasiadas solicitudes. Espera un momento y reinténtalo." };
      if (res.status === 402) return { error: "Se han agotado los créditos de IA del espacio de trabajo." };
      return { error: `La IA no ha podido completar el análisis (${res.status}).` };
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
    try {
      const ids = new Set(profiles.map((p) => p.id));
      const parsed = JSON.parse(text) as { results: RankItem[] };
      const results = parsed.results
        .filter((r) => ids.has(r.id))
        .map((r) => ({ ...r, score: Math.max(0, Math.min(100, Math.round(r.score))) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      if (!results.length) return { error: "La IA no ha devuelto resultados." };
      return { results };
    } catch {
      return { error: "No se pudo interpretar la respuesta de la IA." };
    }
  });
