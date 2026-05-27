/**
 * White-label lite: имя и подпись бренда из env (пилот «Термы» и др.).
 */
export type BrandConfig = {
  name: string;
  tagline: string;
  description: string;
};

const DEFAULT_NAME = "Дегтярные Бани";
const DEFAULT_TAGLINE = "Петербургские парные";

/** Публичный бренд для sidebar и metadata (NEXT_PUBLIC_*). */
export function getBrandConfig(): BrandConfig {
  const name =
    process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || DEFAULT_NAME;
  const tagline =
    process.env.NEXT_PUBLIC_BRAND_TAGLINE?.trim() || DEFAULT_TAGLINE;

  return {
    name,
    tagline,
    description: `ERP/CRM для премиального банного комплекса — ${name}`,
  };
}
