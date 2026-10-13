export type Brief = {
  name: string;
  brand: string;
  sector: string;
  objective: string;
  audience_age: string;
  audience_gender: string;
  audience_interests: string;
  platforms: string[];
  budget: number;
  count: number;
  values: string;
  tone: string;
  avoid: string;
  notes: string;
};

export type RankItem = { id: string; score: number; reasons: string[]; risks: string[] };

export const OBJECTIVES = ["Notoriedad", "Lanzamiento de producto", "Ventas", "Cambio de imagen", "Fidelización"];

export const EMPTY_BRIEF: Brief = {
  name: "", brand: "", sector: "", objective: "Notoriedad",
  audience_age: "", audience_gender: "Mixto", audience_interests: "",
  platforms: [], budget: 0, count: 5, values: "", tone: "", avoid: "", notes: "",
};

export const EXAMPLE_BRIEF: Brief = {
  name: "Lanzamiento Sérum Brote",
  brand: "Lumbre",
  sector: "Cosmética natural y sostenible",
  objective: "Lanzamiento de producto",
  audience_age: "25-40",
  audience_gender: "Mujeres",
  audience_interests: "Cuidado de la piel, belleza limpia, sostenibilidad, bienestar",
  platforms: ["Instagram", "TikTok"],
  budget: 15000,
  count: 5,
  values: "Ingredientes naturales, sostenibilidad, transparencia, belleza real",
  tone: "Cercano, honesto y experto, nada aspiracional",
  avoid: "Polémicas, colaboraciones recientes con marcas de cosmética de la competencia, tono demasiado aspiracional",
  notes: "Lanzamiento de un sérum facial con vitamina C de origen vegetal. Preferimos perfiles con audiencia mayoritariamente española.",
};

/** Total cost of the selected profiles and whether it exceeds the budget. */
export function shortlistCost(fees: Record<string, number>, selected: string[], budget: number) {
  const total = selected.reduce((s, id) => s + (fees[id] ?? 0), 0);
  return { total, over: budget > 0 && total > budget };
}

export const formatEur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
