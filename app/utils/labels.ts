import type {
  CreateVegetablePayload,
  DemandLevel,
  Month,
  SoilType,
  SowingMethodType,
} from "@/app/api/api.types";
import { DrainageLevel, SoilStructure } from "../soils/api/api.types";
import type {
  FertilizerApplicationMethod,
  FertilizerCategory,
  FertilizerEffectLevel,
  FertilizerForm,
  FertilizerPhEffect,
  FertilizerRecommendedFrequency,
  FertilizerRetentionEffect,
  FertilizerRiskLevel,
  FertilizerSoilStructureEffect,
} from "../fertilizers/api/api.types";

// ---------- wspólne enumy (jedna definicja) ----------
export const demandLevelLabels: Record<DemandLevel, string> = {
  low: "Niskie",
  medium: "Średnie",
  high: "Wysokie",
};

// Alias zamiast powtarzania (to ten sam obiekt w pamięci)
export const soilWaterRetentionLabels = demandLevelLabels;
export const soilFertilityLabels = demandLevelLabels;

// Jeśli chcesz inne formy gramatyczne (np. "Niska/Niska/Niska") — wtedy robisz drugi słownik.
// W przeciwnym razie alias wystarczy.

// ---------- vegetable ----------
export const sunExposureLabels: Record<
  NonNullable<CreateVegetablePayload["sunExposure"]>,
  string
> = {
  full_sun: "Pełne słońce",
  partial_shade: "Półcień",
  shade: "Cień",
};

export const sowingMethodLabels: Record<SowingMethodType, string> = {
  direct_sow: "Siew do gruntu",
  seedlings: "Rozsada",
};

export const monthLabels: Record<Month, string> = {
  january: "Styczeń",
  february: "Luty",
  march: "Marzec",
  april: "Kwiecień",
  may: "Maj",
  june: "Czerwiec",
  july: "Lipiec",
  august: "Sierpień",
  september: "Wrzesień",
  october: "Październik",
  november: "Listopad",
  december: "Grudzień",
};

// ---------- soil ----------
export const soilTypeLabels: Record<SoilType, string> = {
  SANDY: "Piaszczysta",
  LOAMY: "Gliniasta",
  CLAY: "Ilasta",
  SILT: "Pyłowa",
  PEAT: "Torfowa",
  CHALK: "Wapienna",
  COMPOST_RICH: "Kompostowa",
  OTHER: "Inna",
};

export const soilStructureLabels: Record<SoilStructure, string> = {
  loose: "Luźna",
  crumbly: "Grudkowata",
  compact: "Zbita",
};

export const soilDrainageLabels: Record<DrainageLevel, string> = {
  poor: "Słaby",
  medium: "Średni",
  good: "Dobry",
};

// ---------- fertilizer ----------
export const fertilizerCategoryLabels: Record<FertilizerCategory, string> = {
  ORGANIC: "Organiczny",
  MINERAL: "Mineralny",
  BIO_STIMULANT: "Biostymulator",
  SOIL_AMENDMENT: "Polepszacz gleby",
  PH_ADJUSTER: "Regulator pH",
};

export const fertilizerFormLabels: Record<FertilizerForm, string> = {
  SOLID: "Stały",
  LIQUID: "Płynny",
};

export const fertilizerApplicationMethodLabels: Record<
  FertilizerApplicationMethod,
  string
> = {
  TOP_DRESS: "Podsypowo",
  INCORPORATE: "Wymieszanie z glebą",
  WATERING: "Podlewanie",
  FOLIAR: "Dolistnie",
  COMPOST_TEA: "Herbata kompostowa",
};

export const fertilizerRiskLevelLabels: Record<FertilizerRiskLevel, string> = {
  LOW: "Niskie",
  MEDIUM: "Średnie",
  HIGH: "Wysokie",
};

export const fertilizerEffectLevelLabels: Record<
  FertilizerEffectLevel,
  string
> = {
  NONE: "Brak",
  LOW: "Niski",
  MEDIUM: "Średni",
  HIGH: "Wysoki",
  VARIABLE: "Zmienny",
};

export const fertilizerPhEffectLabels: Record<FertilizerPhEffect, string> = {
  LOWERS: "Obniża",
  RAISES: "Podnosi",
  NEUTRAL: "Neutralny",
  VARIABLE: "Zmienny",
};

export const fertilizerSoilStructureEffectLabels: Record<
  FertilizerSoilStructureEffect,
  string
> = {
  IMPROVES: "Poprawia",
  NEUTRAL: "Neutralny",
  MAY_WORSEN: "Może pogorszyć",
};

export const fertilizerRetentionEffectLabels: Record<
  FertilizerRetentionEffect,
  string
> = {
  DECREASES: "Zmniejsza",
  NEUTRAL: "Neutralny",
  INCREASES: "Zwiększa",
};

export const fertilizerRecommendedFrequencyLabels: Record<
  FertilizerRecommendedFrequency,
  string
> = {
  ONE_TIME: "Jednorazowo",
  WEEKLY: "Co tydzień",
  BIWEEKLY: "Co 2 tygodnie",
  MONTHLY: "Co miesiąc",
  SEASONAL: "Sezonowo",
  AS_NEEDED: "W razie potrzeby",
};

// ---------- helper ----------
export const labelOrDash = <K extends string>(
  value: K | null | undefined,
  labels: Partial<Record<K, string>>,
): string => {
  if (!value) return "-";
  return labels[value] ?? value;
};
