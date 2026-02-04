export type FertilizerCategory =
  | "ORGANIC"
  | "MINERAL"
  | "BIO_STIMULANT"
  | "SOIL_AMENDMENT"
  | "PH_ADJUSTER";

export type FertilizerForm = "SOLID" | "LIQUID";

export type FertilizerApplicationMethod =
  | "TOP_DRESS"
  | "INCORPORATE"
  | "WATERING"
  | "FOLIAR"
  | "COMPOST_TEA";

export type FertilizerRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type FertilizerEffectLevel =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VARIABLE";

export type FertilizerPhEffect = "LOWERS" | "RAISES" | "NEUTRAL" | "VARIABLE";

export type FertilizerSoilStructureEffect =
  | "IMPROVES"
  | "NEUTRAL"
  | "MAY_WORSEN";

export type FertilizerRetentionEffect = "DECREASES" | "NEUTRAL" | "INCREASES";

export type FertilizerRecommendedFrequency =
  | "ONE_TIME"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "SEASONAL"
  | "AS_NEEDED";

export type FertilizerType = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: FertilizerCategory;
  form: FertilizerForm;
  applicationMethod: FertilizerApplicationMethod;
  riskLevel: FertilizerRiskLevel;
  nitrogenEffect: FertilizerEffectLevel;
  phosphorusEffect: FertilizerEffectLevel;
  potassiumEffect: FertilizerEffectLevel;
  phEffect: FertilizerPhEffect;
  soilStructureEffect: FertilizerSoilStructureEffect;
  waterRetentionEffect: FertilizerRetentionEffect;
  drainageEffect: FertilizerRetentionEffect;
  recommendedFrequency: FertilizerRecommendedFrequency;
  dosageGuidance?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FertilizerListItem = {
  id: string;
  slug: string;
  name: string;
  category: FertilizerCategory;
  isActive: boolean;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type CreateFertilizerTypePayload = Omit<
  FertilizerType,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateFertilizerTypePayload = Partial<CreateFertilizerTypePayload>;

export const fertilizerCategoryOptions: FertilizerCategory[] = [
  "ORGANIC",
  "MINERAL",
  "BIO_STIMULANT",
  "SOIL_AMENDMENT",
  "PH_ADJUSTER",
];

export const fertilizerFormOptions: FertilizerForm[] = ["SOLID", "LIQUID"];

export const fertilizerApplicationMethodOptions: FertilizerApplicationMethod[] =
  ["TOP_DRESS", "INCORPORATE", "WATERING", "FOLIAR", "COMPOST_TEA"];

export const fertilizerRiskLevelOptions: FertilizerRiskLevel[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

export const fertilizerEffectLevelOptions: FertilizerEffectLevel[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VARIABLE",
];

export const fertilizerPhEffectOptions: FertilizerPhEffect[] = [
  "LOWERS",
  "RAISES",
  "NEUTRAL",
  "VARIABLE",
];

export const fertilizerSoilStructureEffectOptions: FertilizerSoilStructureEffect[] =
  ["IMPROVES", "NEUTRAL", "MAY_WORSEN"];

export const fertilizerRetentionEffectOptions: FertilizerRetentionEffect[] = [
  "DECREASES",
  "NEUTRAL",
  "INCREASES",
];

export const fertilizerRecommendedFrequencyOptions: FertilizerRecommendedFrequency[] =
  ["ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY", "SEASONAL", "AS_NEEDED"];
