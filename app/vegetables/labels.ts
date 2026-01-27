import type {
  CreateVegetablePayload,
  Month,
  SowingMethodType,
} from "@/app/api/api.types";

/* =======================
   VEGETABLE
======================= */

export const sunExposureLabels: Record<
  NonNullable<CreateVegetablePayload["sunExposure"]>,
  string
> = {
  full_sun: "Pełne słońce",
  partial_shade: "Półcień",
  shade: "Cień",
};

export const demandLevelLabels: Record<
  NonNullable<CreateVegetablePayload["waterDemand"]>,
  string
> = {
  low: "Niskie",
  medium: "Średnie",
  high: "Wysokie",
};

export const sowingMethodLabels: Record<
  NonNullable<SowingMethodType>,
  string
> = {
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

/* =======================
   SOIL
======================= */

export const soilTypeLabels: Record<string, string> = {
  sandy: "Piaszczysta",
  loamy: "Gliniasta",
  clay: "Ilasta",
  peat: "Torfowa",
  silty: "Pyłowa",
  chalky: "Wapienna",
};

export const soilStructureLabels: Record<string, string> = {
  crumbly: "Krucha",
  compact: "Zbita",
  loose: "Luźna",
};

export const soilWaterRetentionLabels: Record<string, string> = {
  low: "Niska",
  medium: "Średnia",
  high: "Wysoka",
};

export const soilDrainageLabels: Record<string, string> = {
  low: "Niski",
  medium: "Średni",
  high: "Wysoki",
};

export const soilFertilityLabels: Record<string, string> = {
  low: "Niska",
  medium: "Średnia",
  high: "Wysoka",
};

/* =======================
   HELPERS
======================= */

export const labelOrDash = (
  value?: string | null,
  map?: Record<string, string>,
) => {
  if (!value) return "-";
  return map?.[value] ?? value;
};
