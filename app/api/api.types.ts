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
  name: string;
};

export type ActionTemplateScope = "bed" | "planting";
export type ActionTemplateType =
  | "sowing"
  | "transplanting"
  | "thinning"
  | "hardening"
  | "watering"
  | "fertilization"
  | "pruning"
  | "weeding"
  | "staking"
  | "harvest"
  | "pest_control"
  | "disease_control"
  | "spraying"
  | "physical_protection"
  | "trap_setup"
  | "soil_preparation"
  | "soil_amendment"
  | "mulching"
  | "soil_testing"
  | "soil_regeneration"
  | "irrigation_setup"
  | "monitoring"
  | "rotation_planning"
  | "bed_ready"
  | "manual_custom";

export type ActionRuleTrigger =
  | "ON_SOWED"
  | "AFTER_SOWING_DAYS"
  | "BEFORE_TRANSPLANT_DAYS"
  | "ON_TRANSPLANTED"
  | "AFTER_TRANSPLANT_DAYS"
  | "ON_HARVEST_WINDOW_START"
  | "BEFORE_HARVEST_WINDOW_START_DAYS"
  | "ON_HARVEST_CONFIRMED"
  | "AFTER_HARVEST_DAYS";

export type ActionRuleSchedule = "ONCE" | "EVERY_N_DAYS";
export type PlantingStartMethod = "DIRECT_SOW" | "TRANSPLANT";

export type VegetableActionRule = {
  id?: string;
  actionTemplateId: string;
  trigger: ActionRuleTrigger;
  offsetDays: number;
  schedule: ActionRuleSchedule;
  everyNDays: number | null;
  occurrencesLimit: number | null;
  applyIfStartMethod: PlantingStartMethod[];
  enabled: boolean;
};

export type ActionTemplateRef = {
  id: string;
  name: string;
  type: ActionTemplateType;
};

export type ActionTemplateListItem = {
  id: string;
  name: string;
  scope?: ActionTemplateScope;
  target: ActionTemplateScope;
  type: ActionTemplateType;
  defaultDueOffsetDays?: number | null;
  updatedAt: string;
};

export type ActionTemplate = ActionTemplateListItem & {
  description: string | null;
  createdAt: string;
};

export type Vegetable = {
  id: string;
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
  postHarvestActions: ActionTemplateRef[];
  postHarvestActionTemplateIds?: string[];
  actionRules: VegetableActionRule[];
  rulesVersion: number;
  commonPests: MiniRef[];
  commonDiseases: MiniRef[];
  goodCompanions: MiniRef[];
  badCompanions: MiniRef[];
  createdAt: string;
  updatedAt: string;
};

export type VegetableListItem = {
  id: string;
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
  name: string;
  description: string;
  symptoms: string | null;
  prevention: string | null;
  treatment: string | null;
  recommendedActions: ActionTemplateRef[];
  recommendedActionTemplateIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Disease = {
  id: string;
  name: string;
  description: string;
  symptoms: string | null;
  prevention: string | null;
  treatment: string | null;
  recommendedActions: ActionTemplateRef[];
  recommendedActionTemplateIds?: string[];
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
  postHarvestActionTemplateIds?: string[];
  actionRules?: VegetableActionRule[];
  commonPestIds?: string[];
  commonDiseaseIds?: string[];
  goodCompanionIds?: string[];
  badCompanionIds?: string[];
};

export type UpdateVegetablePayload = Partial<CreateVegetablePayload>;

export type CreatePestPayload = {
  name: string;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
  recommendedActionTemplateIds?: string[];
};

export type UpdatePestPayload = Partial<CreatePestPayload>;

export type CreateDiseasePayload = {
  name: string;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
  recommendedActionTemplateIds?: string[];
};

export type CreateActionTemplatePayload = {
  name: string;
  target: ActionTemplateScope;
  type: ActionTemplateType;
  defaultDueOffsetDays?: number | null;
  description?: string;
};

export type UpdateActionTemplatePayload = Partial<CreateActionTemplatePayload>;

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

export const actionTemplateScopeOptions: ActionTemplateScope[] = [
  "bed",
  "planting",
];

export const actionRuleTriggerOptions: ActionRuleTrigger[] = [
  "ON_SOWED",
  "AFTER_SOWING_DAYS",
  "BEFORE_TRANSPLANT_DAYS",
  "ON_TRANSPLANTED",
  "AFTER_TRANSPLANT_DAYS",
  "ON_HARVEST_WINDOW_START",
  "BEFORE_HARVEST_WINDOW_START_DAYS",
  "ON_HARVEST_CONFIRMED",
  "AFTER_HARVEST_DAYS",
];

export const actionRuleScheduleOptions: ActionRuleSchedule[] = [
  "ONCE",
  "EVERY_N_DAYS",
];

export const plantingStartMethodOptions: PlantingStartMethod[] = [
  "DIRECT_SOW",
  "TRANSPLANT",
];

export const actionTemplateTypeOptions: ActionTemplateType[] = [
  "sowing",
  "transplanting",
  "thinning",
  "hardening",
  "watering",
  "fertilization",
  "pruning",
  "weeding",
  "staking",
  "harvest",
  "pest_control",
  "disease_control",
  "spraying",
  "physical_protection",
  "trap_setup",
  "soil_preparation",
  "soil_amendment",
  "mulching",
  "soil_testing",
  "soil_regeneration",
  "irrigation_setup",
  "monitoring",
  "rotation_planning",
  "bed_ready",
  "manual_custom",
];

export type ActionTemplateTypeGroup = {
  label:
    | "Uprawa"
    | "Ochrona"
    | "Gleba i grządka"
    | "Monitoring i planowanie"
    | "Systemowe"
    | "Ręczne";
  options: ActionTemplateType[];
};

export const actionTemplateTypeGroups: ActionTemplateTypeGroup[] = [
  {
    label: "Uprawa",
    options: [
      "sowing",
      "transplanting",
      "thinning",
      "hardening",
      "watering",
      "fertilization",
      "pruning",
      "weeding",
      "staking",
      "harvest",
    ],
  },
  {
    label: "Ochrona",
    options: [
      "pest_control",
      "disease_control",
      "spraying",
      "physical_protection",
      "trap_setup",
    ],
  },
  {
    label: "Gleba i grządka",
    options: [
      "soil_preparation",
      "soil_amendment",
      "mulching",
      "soil_testing",
      "soil_regeneration",
      "irrigation_setup",
    ],
  },
  {
    label: "Monitoring i planowanie",
    options: ["monitoring", "rotation_planning"],
  },
  {
    label: "Systemowe",
    options: ["bed_ready"],
  },
  {
    label: "Ręczne",
    options: ["manual_custom"],
  },
];

export const actionTemplateDefaultTypeByScope: Record<
  ActionTemplateScope,
  ActionTemplateType
> = {
  planting: "monitoring",
  bed: "soil_preparation",
};

export const legacyActionTemplateTypeToNewType: Record<
  string,
  ActionTemplateType
> = {
  water: "watering",
  watering: "watering",
  fertilize: "fertilization",
  fertilization: "fertilization",
  spray: "spraying",
  weed: "weeding",
  soil_prep: "soil_preparation",
  monitoring: "monitoring",
  manual: "manual_custom",
  other: "manual_custom",
  system: "bed_ready",
};

export const mapActionTemplateType = (
  type: string | null | undefined,
  scope: ActionTemplateScope,
): ActionTemplateType => {
  const normalizedType = String(type ?? "")
    .trim()
    .toLowerCase();

  if ((actionTemplateTypeOptions as string[]).includes(normalizedType)) {
    return normalizedType as ActionTemplateType;
  }

  const mappedLegacy = legacyActionTemplateTypeToNewType[normalizedType];
  if (mappedLegacy) {
    return mappedLegacy;
  }

  return actionTemplateDefaultTypeByScope[scope];
};

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
  title: string;
  status: ArticleStatus;
  priority: number;
  publishedAt: string | null;
  updatedAt: string;
};

export type Article = {
  id: string;
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

export type MediaLibraryItem = {
  key: string;
  publicUrl: string;
  fileName: string;
  size?: number;
  lastModified?: string;
};

export type MediaLibraryResponse = {
  items: MediaLibraryItem[];
  limit: number;
  nextCursor?: string | null;
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
