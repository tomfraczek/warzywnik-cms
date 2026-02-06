export type Month =
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december";

export type DemandLevel = "low" | "medium" | "high";
export type SunExposure = "full_sun" | "partial_shade" | "shade";
export type SoilType =
  | "SANDY"
  | "LOAMY"
  | "CLAY"
  | "SILT"
  | "PEAT"
  | "CHALK"
  | "COMPOST_RICH"
  | "OTHER";
export type SowingMethodType = "direct_sow" | "seedlings";
export type DominantNutrientDemand = "N" | "P" | "K" | "BALANCED";

export type SowingMethod = {
  method: SowingMethodType;
  startMonth: Month;
  endMonth: Month;
  underCover: boolean;
  germinationDaysMin: number | null;
  germinationDaysMax: number | null;
  seedDepthCm: number | null;
  rowSpacingCm: number | null;
  plantSpacingCm: number | null;
  transplantingStartMonth: Month | null;
  transplantingEndMonth: Month | null;
};

export type FertilizationStage = {
  name: string;
  timing: string | null;
  description: string;
};

export type MiniRef = {
  id: string;
  slug: string;
  name: string;
};

export type Vegetable = {
  id: string;
  slug: string;
  name: string;
  latinName: string | null;
  imageUrl: string | null;
  description: string;
  sunExposure: SunExposure | null;
  waterDemand: DemandLevel | null;
  nutrientDemand: DemandLevel | null;
  recommendedSoilIds: string[];
  minSoilDepthCm: number | null;
  dominantNutrientDemand: DominantNutrientDemand | null;
  sowingMethods: SowingMethod[] | null;
  timeToHarvestDaysMin: number | null;
  timeToHarvestDaysMax: number | null;
  successionSowing: boolean;
  successionIntervalDays: number | null;
  harvestStartMonth: Month | null;
  harvestEndMonth: Month | null;
  harvestSigns: string | null;
  fertilizationStages: FertilizationStage[] | null;
  commonPests: MiniRef[];
  commonDiseases: MiniRef[];
  goodCompanions: MiniRef[];
  badCompanions: MiniRef[];
  createdAt: string;
  updatedAt: string;
};

export type VegetableListItem = {
  id: string;
  slug: string;
  name: string;
  latinName: string | null;
  imageUrl: string | null;
};

export type VegetableListResponse = {
  items: VegetableListItem[];
  page: number;
  limit: number;
  total: number;
};

export type PestListItem = MiniRef;
export type DiseaseListItem = MiniRef;

export type Pest = {
  id: string;
  slug: string;
  name: string;
  description: string;
  symptoms: string | null;
  prevention: string | null;
  treatment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Disease = {
  id: string;
  slug: string;
  name: string;
  description: string;
  symptoms: string | null;
  prevention: string | null;
  treatment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type CreateVegetablePayload = {
  slug: string;
  name: string;
  description: string;
  latinName?: string | null;
  imageUrl?: string | null;
  sunExposure?: SunExposure | null;
  waterDemand?: DemandLevel | null;
  nutrientDemand?: DemandLevel | null;
  recommendedSoilIds?: string[];
  minSoilDepthCm?: number | null;
  dominantNutrientDemand?: DominantNutrientDemand | null;
  sowingMethods?: SowingMethod[] | null;
  timeToHarvestDaysMin?: number | null;
  timeToHarvestDaysMax?: number | null;
  successionSowing?: boolean;
  successionIntervalDays?: number | null;
  harvestStartMonth?: Month | null;
  harvestEndMonth?: Month | null;
  harvestSigns?: string | null;
  fertilizationStages?: FertilizationStage[] | null;
  commonPestIds?: string[];
  commonDiseaseIds?: string[];
  goodCompanionIds?: string[];
  badCompanionIds?: string[];
};

export type UpdateVegetablePayload = Partial<CreateVegetablePayload>;

export type CreatePestPayload = {
  slug: string;
  name: string;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
};

export type UpdatePestPayload = Partial<CreatePestPayload>;

export type CreateDiseasePayload = {
  slug: string;
  name: string;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
};

export type UpdateDiseasePayload = Partial<CreateDiseasePayload>;

export const monthOptions: Month[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export const demandLevelOptions: DemandLevel[] = ["low", "medium", "high"];
export const sunExposureOptions: SunExposure[] = [
  "full_sun",
  "partial_shade",
  "shade",
];
export const soilTypeOptions: SoilType[] = [
  "SANDY",
  "LOAMY",
  "CLAY",
  "SILT",
  "PEAT",
  "CHALK",
  "COMPOST_RICH",
  "OTHER",
];
export const sowingMethodOptions: SowingMethodType[] = [
  "direct_sow",
  "seedlings",
];
export const dominantNutrientDemandOptions: DominantNutrientDemand[] = [
  "N",
  "P",
  "K",
  "BALANCED",
];

export type ArticleStatus = "DRAFT" | "PUBLISHED";
export type ArticleSeason = "winter" | "spring" | "summer" | "autumn";
export type ArticleContext =
  | "planning"
  | "soil_preparation"
  | "sowing"
  | "harvest"
  | "problem_solving"
  | "learning";

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  priority: number;
  publishedAt: string | null;
  updatedAt: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  priority: number;
  months: number[];
  seasons: ArticleSeason[];
  contexts: ArticleContext[];
  relatedVegetableIds: string[];
  relatedSoilIds: string[];
  relatedFertilizerIds: string[];
  relatedDiseaseIds: string[];
  relatedPestIds: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateArticlePayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  status: ArticleStatus;
  priority: number;
  months?: number[];
  seasons?: ArticleSeason[];
  contexts: ArticleContext[];
  relatedVegetableIds?: string[];
  relatedSoilIds?: string[];
  relatedFertilizerIds?: string[];
  relatedDiseaseIds?: string[];
  relatedPestIds?: string[];
};

export type UpdateArticlePayload = Partial<CreateArticlePayload>;

export type MediaItem = {
  id: string;
  url?: string;
  publicUrl?: string;
  cdnUrl?: string;
  fileName?: string;
  name?: string;
  createdAt?: string;
};

export const articleStatusOptions: ArticleStatus[] = ["DRAFT", "PUBLISHED"];
export const articleSeasonOptions: ArticleSeason[] = [
  "winter",
  "spring",
  "summer",
  "autumn",
];
export const articleContextOptions: ArticleContext[] = [
  "planning",
  "soil_preparation",
  "sowing",
  "harvest",
  "problem_solving",
  "learning",
];
