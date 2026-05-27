import type { HallZoneType } from "@prisma/client";

/** RU-подписи типов зон для dashboard и форм. */
export const HALL_ZONE_LABELS: Record<HallZoneType, string> = {
  STEAM_ROOM: "Парная",
  VIP_SUITE: "VIP",
  HAMMAM: "Хамам",
  HAY_LOFT: "Сеновал",
  THERMAL: "Термы",
  POOL: "Бассейн",
};

/** Краткий badge для строки загрузки зала. */
export function formatHallZoneLabel(zoneType: HallZoneType): string {
  return HALL_ZONE_LABELS[zoneType];
}

/** White-label: подпись пресета комплекса (seed / демо). */
export const VENUE_PRESET_LABELS = {
  banya: "Премиум-баня",
  "urban-spa": "Urban SPA",
} as const;

export type VenueSeedPreset = keyof typeof VENUE_PRESET_LABELS;

export function resolveVenueSeedPreset(): VenueSeedPreset {
  const raw = process.env.SEED_PRESET?.toLowerCase().trim();
  if (raw === "urban-spa" || raw === "urban_spa" || raw === "urban") {
    return "urban-spa";
  }
  return "banya";
}
