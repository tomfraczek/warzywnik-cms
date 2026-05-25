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
export type SunExposure = "full_sun" | "partial_shade" | "full_shade";
export type BotanicalFamily =
  | "SOLANACEAE"
  | "CUCURBITACEAE"
  | "BRASSICACEAE"
  | "AMARYLLIDACEAE"
  | "APIACEAE"
  | "FABACEAE"
  | "AMARANTHACEAE"
  | "ASTERACEAE"
  | "ASPARAGACEAE"
  | "POLYGONACEAE"
  | "MALVACEAE"
  | "POACEAE";
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
export type NutrientNeeds = "LOW" | "MEDIUM" | "HIGH";
export type RotationGroup =
  | "HEAVY_FEEDER"
  | "LIGHT_FEEDER"
  | "LEGUME"
  | "ROOT"
  | "LEAF"
  | "FRUITING"
  | "OTHER";
export type CultivationEnvironment =
  | "GROUND_OUTDOOR"
  | "RAISED_BED_OUTDOOR"
  | "POT_OUTDOOR"
  | "POT_INDOOR"
  | "GREENHOUSE"
  | "TUNNEL";

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
  slug: string | null;
};

export type ActionTemplateTarget = "bed" | "planting" | "space";
export type ActionTemplateEnvironment =
  | "any"
  | "outdoor"
  | "tunnel"
  | "greenhouse";
export type ActionTemplateGenerationMode =
  | "AUTO"
  | "ROUTINE"
  | "SUGGESTION"
  | "MANUAL_ONLY"
  | "POST_HARVEST_PROMPT"
  | "WEATHER_TRIGGERED"
  | "SEASONAL";
export type ActionTemplatePriority = "low" | "medium" | "high" | "critical";
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
  | "climate_control"
  | "ventilation"
  | "humidity_reduction"
  | "shading"
  | "structure_inspection"
  | "structure_repair"
  | "space_hygiene"
  | "seasonal_preparation"
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
  actionTemplateSlug: string;
  trigger: ActionRuleTrigger;
  offsetDays: number;
  schedule: ActionRuleSchedule;
  everyNDays: number | null;
  occurrencesLimit: number | null;
  applyIfStartMethod: PlantingStartMethod[] | null;
  isEnabled: boolean;
};

export type ActionTemplateRef = {
  id: string;
  name: string;
  slug: string | null;
  type: ActionTemplateType;
};

export type ActionTemplateListItem = {
  id: string;
  name: string;
  slug: string | null;
  target: ActionTemplateTarget;
  environment: ActionTemplateEnvironment;
  type: ActionTemplateType;
  generationMode?: ActionTemplateGenerationMode;
  priority?: ActionTemplatePriority;
  maxAutoOccurrencesPerPlanting?: number | null;
  minDaysBetweenOccurrences?: number | null;
  requiresUserConfirmation?: boolean;
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
  slug: string | null;
  botanicalFamily?: BotanicalFamily | null;
  family: BotanicalFamily | null;
  latinName: string | null;
  nutrientNeeds: NutrientNeeds | null;
  rotationGroup: RotationGroup | null;
  imageUrl: string | null;
  description: string;
  sunExposure: SunExposure | null;
  waterDemand: DemandLevel | null;
  nutrientDemand: DemandLevel | null;
  recommendedSoilSlugs: string[];
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
  actionRules: VegetableActionRule[];
  rulesVersion: number;
  commonPestSlugs?: string[];
  commonDiseaseSlugs?: string[];
  goodCompanionSlugs?: string[];
  badCompanionSlugs?: string[];
  commonPests: MiniRef[];
  commonDiseases: MiniRef[];
  goodCompanions: MiniRef[];
  badCompanions: MiniRef[];
  isCustomized: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VegetableListItem = {
  id: string;
  name: string;
  slug: string | null;
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
  slug: string | null;
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
  slug: string | null;
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

export type DeleteManyDto = {
  ids: string[];
};

export type CreateVegetablePayload = {
  name: string;
  slug?: string | null;
  description: string;
  latinName?: string | null;
  botanicalFamily?: BotanicalFamily | null;
  family?: BotanicalFamily | null;
  nutrientNeeds?: NutrientNeeds | null;
  rotationGroup?: RotationGroup | null;
  imageUrl?: string | null;
  sunExposure?: SunExposure | null;
  waterDemand?: DemandLevel | null;
  nutrientDemand?: DemandLevel | null;
  recommendedSoilSlugs?: string[];
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
  actionRules?: VegetableActionRule[];
  commonPestSlugs?: string[];
  commonDiseaseSlugs?: string[];
  goodCompanionSlugs?: string[];
  badCompanionSlugs?: string[];
};

export type UpdateVegetablePayload = Partial<CreateVegetablePayload>;

export type CreatePestPayload = {
  name: string;
  slug?: string | null;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
  recommendedActionTemplateIds?: string[];
};

export type UpdatePestPayload = Partial<CreatePestPayload>;

export type CreateDiseasePayload = {
  name: string;
  slug?: string | null;
  description: string;
  symptoms?: string | null;
  prevention?: string | null;
  treatment?: string | null;
  recommendedActionTemplateIds?: string[];
};

export type CreateActionTemplatePayload = {
  name: string;
  slug?: string | null;
  target: ActionTemplateTarget;
  environment: ActionTemplateEnvironment;
  type: ActionTemplateType;
  generationMode?: ActionTemplateGenerationMode;
  priority?: ActionTemplatePriority;
  maxAutoOccurrencesPerPlanting?: number | null;
  minDaysBetweenOccurrences?: number | null;
  requiresUserConfirmation?: boolean;
  defaultDueOffsetDays?: number | null;
  description?: string | null;
};

export type UpdateActionTemplatePayload = Partial<CreateActionTemplatePayload>;

export type ActionAutomationCoverage = {
  templatesCount: number;
  rulesCount: number;
  vegetablesWithoutRulesCount: number;
  unusedTemplateSlugs: string[];
  skippedRulesByMissingDateOrLimitCount: number;
  [key: string]: unknown;
};

export type TaskGenerationPreview = {
  tasks: unknown[];
  suggestions: unknown[];
  skippedRules: Array<{
    ruleId?: string;
    reason?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export type RecomputePlantingActionsResponse = {
  ok?: boolean;
  message?: string;
  [key: string]: unknown;
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
  "full_shade",
];
export const botanicalFamilyOptions: BotanicalFamily[] = [
  "SOLANACEAE",
  "CUCURBITACEAE",
  "BRASSICACEAE",
  "AMARYLLIDACEAE",
  "APIACEAE",
  "FABACEAE",
  "AMARANTHACEAE",
  "ASTERACEAE",
  "ASPARAGACEAE",
  "POLYGONACEAE",
  "MALVACEAE",
  "POACEAE",
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
export const nutrientNeedsOptions: NutrientNeeds[] = ["LOW", "MEDIUM", "HIGH"];
export const rotationGroupOptions: RotationGroup[] = [
  "HEAVY_FEEDER",
  "LIGHT_FEEDER",
  "LEGUME",
  "ROOT",
  "LEAF",
  "FRUITING",
  "OTHER",
];
export const cultivationEnvironmentOptions: CultivationEnvironment[] = [
  "GROUND_OUTDOOR",
  "RAISED_BED_OUTDOOR",
  "POT_OUTDOOR",
  "POT_INDOOR",
  "GREENHOUSE",
  "TUNNEL",
];

export const actionTemplateTargetOptions: ActionTemplateTarget[] = [
  "bed",
  "planting",
  "space",
];

export const actionTemplateEnvironmentOptions: ActionTemplateEnvironment[] = [
  "any",
  "outdoor",
  "tunnel",
  "greenhouse",
];

export const actionTemplateGenerationModeOptions: ActionTemplateGenerationMode[] =
  [
    "AUTO",
    "ROUTINE",
    "SUGGESTION",
    "MANUAL_ONLY",
    "POST_HARVEST_PROMPT",
    "WEATHER_TRIGGERED",
    "SEASONAL",
  ];

export const actionTemplatePriorityOptions: ActionTemplatePriority[] = [
  "low",
  "medium",
  "high",
  "critical",
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
  "climate_control",
  "ventilation",
  "humidity_reduction",
  "shading",
  "structure_inspection",
  "structure_repair",
  "space_hygiene",
  "seasonal_preparation",
  "manual_custom",
];

export type ActionTemplateTypeGroup = {
  label:
    | "Uprawa"
    | "Ochrona"
    | "Gleba i grządka"
    | "Monitoring i planowanie"
    | "Klimat i przestrzeń"
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
    label: "Klimat i przestrzeń",
    options: [
      "climate_control",
      "ventilation",
      "humidity_reduction",
      "shading",
      "structure_inspection",
      "structure_repair",
      "space_hygiene",
      "seasonal_preparation",
    ],
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

export const actionTemplateDefaultTypeByTarget: Record<
  ActionTemplateTarget,
  ActionTemplateType
> = {
  planting: "monitoring",
  bed: "soil_preparation",
  space: "monitoring",
};

export const normalizeActionTemplateTarget = (
  target: string | null | undefined,
): ActionTemplateTarget => {
  const normalizedTarget = String(target ?? "")
    .trim()
    .toLowerCase();

  if ((actionTemplateTargetOptions as string[]).includes(normalizedTarget)) {
    return normalizedTarget as ActionTemplateTarget;
  }

  if (normalizedTarget === "bed") return "bed";
  if (normalizedTarget === "planting") return "planting";
  if (normalizedTarget === "space") return "space";

  return "bed";
};

export const normalizeActionTemplateEnvironment = (
  environment: string | null | undefined,
): ActionTemplateEnvironment => {
  const normalizedEnvironment = String(environment ?? "")
    .trim()
    .toLowerCase();

  if (
    (actionTemplateEnvironmentOptions as string[]).includes(
      normalizedEnvironment,
    )
  ) {
    return normalizedEnvironment as ActionTemplateEnvironment;
  }

  return "any";
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
  target: ActionTemplateTarget,
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

  return actionTemplateDefaultTypeByTarget[target];
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
  relatedVegetableSlugs: string[];
  relatedSoilSlugs: string[];
  relatedFertilizerSlugs: string[];
  relatedDiseaseSlugs: string[];
  relatedPestSlugs: string[];
  relatedVegetableIds?: string[];
  relatedSoilIds?: string[];
  relatedFertilizerIds?: string[];
  relatedDiseaseIds?: string[];
  relatedPestIds?: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateArticlePayload = {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  status: ArticleStatus;
  priority: number;
  months?: number[];
  seasons?: ArticleSeason[];
  contexts: ArticleContext[];
  relatedVegetableSlugs?: string[];
  relatedSoilSlugs?: string[];
  relatedFertilizerSlugs?: string[];
  relatedDiseaseSlugs?: string[];
  relatedPestSlugs?: string[];
  publishedAt?: string | null;
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

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsTotals = {
  articleViewsTotal: number;
  articleEngagedSecondsTotal: number;
  articleScroll50Total: number;
  articleScroll90Total: number;
  articleFavoritesTotal: number;
  vegetableAddsTotal: number;
  vegetableFavoritesTotal: number;
};

export type AnalyticsLast30Days = {
  articleViews: number;
  vegetableAdds: number;
};

export type AnalyticsVegetableTopItem = {
  vegetableSlug: string;
  addCountTotal: number;
  favoriteCount: number;
  lastAddedAt: string | null;
  vegetable: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type AnalyticsArticleTopItem = {
  articleSlug: string;
  viewsTotal: number;
  engagedSecondsTotal: number;
  scroll50Count: number;
  scroll90Count: number;
  favoriteCount: number;
  article: {
    id: string;
    title: string;
    excerpt: string;
    coverImageUrl: string | null;
    publishedAt: string | null;
  };
};

export type AnalyticsDashboard = {
  generatedAt: string;
  totals: AnalyticsTotals;
  last30Days: AnalyticsLast30Days;
  top: {
    vegetablesByAdds: AnalyticsVegetableTopItem[];
    articlesByViews: AnalyticsArticleTopItem[];
  };
};

export type AnalyticsVegetablesPopularSort = "adds" | "favorites";

export type AnalyticsArticlesPopularSort = "views" | "engagedSeconds";

export type AnalyticsVegetablesPopularResponse = {
  items: AnalyticsVegetableTopItem[];
  total: number;
};

export type AnalyticsArticlesPopularResponse = {
  items: AnalyticsArticleTopItem[];
  total: number;
};
