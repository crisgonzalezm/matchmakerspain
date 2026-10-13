import type { Database } from "@/integrations/supabase/types";

export type Influencer = Database["public"]["Tables"]["influencers"]["Row"];
export type InfluencerInput = Database["public"]["Tables"]["influencers"]["Insert"];

export const PLATFORMS = ["Instagram", "TikTok", "YouTube"] as const;
export const NICHES = [
  "belleza", "moda", "gastronomía", "fitness", "viajes",
  "maternidad", "decoración", "sostenibilidad", "lifestyle",
] as const;
export const TONES = ["cercano", "aspiracional", "divertido", "experto"] as const;
export const AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"] as const;

export const FOLLOWER_RANGES = {
  all: { label: "Todos", min: 0, max: Infinity },
  micro: { label: "Micro (10K–50K)", min: 0, max: 50000 },
  mid: { label: "Medianos (50K–300K)", min: 50000, max: 300000 },
  macro: { label: "Macro (+300K)", min: 300000, max: Infinity },
} as const;

export const ENGAGEMENT_RANGES = {
  all: { label: "Todos", min: 0, max: Infinity },
  low: { label: "Menos del 3%", min: 0, max: 3 },
  mid: { label: "3% – 6%", min: 3, max: 6 },
  high: { label: "Más del 6%", min: 6, max: Infinity },
} as const;

export function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 1000) return `${Math.round(n / 1000)} K`;
  return String(n);
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
