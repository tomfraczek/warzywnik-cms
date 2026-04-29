import type {
  ActionRuleSchedule,
  ActionRuleTrigger,
  ActionTemplateType,
  ActionTemplateGenerationMode,
  ActionTemplatePriority,
  ActionTemplateEnvironment,
  ActionTemplateTarget,
  BotanicalFamily,
  CultivationEnvironment,
  CreateVegetablePayload,
  DemandLevel,
  DominantNutrientDemand,
  Month,
  NutrientNeeds,
  PlantingStartMethod,
  RotationGroup,
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
  full_shade: "Cień",
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

export const botanicalFamilyLabels: Record<BotanicalFamily, string> = {
  SOLANACEAE: "Psiankowate",
  CUCURBITACEAE: "Dyniowate",
  BRASSICACEAE: "Kapustowate",
  AMARYLLIDACEAE: "Amarylkowate",
  APIACEAE: "Selerowate",
  FABACEAE: "Bobowate",
  AMARANTHACEAE: "Szarłatowate",
  ASTERACEAE: "Astrowate",
  ASPARAGACEAE: "Szparagowate",
  POLYGONACEAE: "Rdestowate",
  MALVACEAE: "ślazowate",
  POACEAE: "Wiechlinowate",
};

export const nutrientNeedsLabels: Record<NutrientNeeds, string> = {
  LOW: "Niskie",
  MEDIUM: "Średnie",
  HIGH: "Wysokie",
};

export const rotationGroupLabels: Record<RotationGroup, string> = {
  HEAVY_FEEDER: "Silny biornik",
  LIGHT_FEEDER: "Słaby biornik",
  LEGUME: "Rośliny strączkowe",
  ROOT: "Warzywa korzeniowe",
  LEAF: "Warzywa liściowe",
  FRUITING: "Owocujące",
  OTHER: "Inne",
};

export const dominantNutrientDemandLabels: Record<
  DominantNutrientDemand,
  string
> = {
  N: "Azot (N)",
  P: "Fosfor (P)",
  K: "Potas (K)",
  BALANCED: "Zrównoważone",
};

export const actionRuleTriggerLabels: Record<ActionRuleTrigger, string> = {
  ON_SOWED: "W dniu siewu",
  AFTER_SOWING_DAYS: "X dni po siewie",
  BEFORE_TRANSPLANT_DAYS: "X dni przed przesadzeniem",
  ON_TRANSPLANTED: "W dniu przesadzenia",
  AFTER_TRANSPLANT_DAYS: "X dni po przesadzeniu",
  ON_HARVEST_WINDOW_START: "Na początku okna zbioru",
  BEFORE_HARVEST_WINDOW_START_DAYS: "X dni przed początkiem okna zbioru",
  ON_HARVEST_CONFIRMED: "Po potwierdzeniu zbioru",
  AFTER_HARVEST_DAYS: "X dni po zbiorze",
};

export const actionRuleScheduleLabels: Record<ActionRuleSchedule, string> = {
  ONCE: "Jednorazowo",
  EVERY_N_DAYS: "Cyklicznie co X dni",
};

export const plantingStartMethodLabels: Record<PlantingStartMethod, string> = {
  DIRECT_SOW: "Siew bezpośredni",
  TRANSPLANT: "Rozsada / przesadzanie",
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

// ---------- bed ----------
export const cultivationEnvironmentLabels: Record<
  CultivationEnvironment,
  string
> = {
  GROUND_OUTDOOR: "Grunt (na zewnątrz)",
  RAISED_BED_OUTDOOR: "Podwyższona grządka (na zewnątrz)",
  POT_OUTDOOR: "Donica (na zewnątrz)",
  POT_INDOOR: "Donica (wewnątrz)",
  GREENHOUSE: "Szklarnia",
  TUNNEL: "Tunel",
};

export const actionTemplateTargetLabels: Record<ActionTemplateTarget, string> =
  {
    bed: "Grządka",
    planting: "Nasadzenie",
    space: "Przestrzeń uprawowa",
  };

export const actionTemplateEnvironmentLabels: Record<
  ActionTemplateEnvironment,
  string
> = {
  any: "Dowolne",
  outdoor: "Uprawa zewnętrzna",
  tunnel: "Tunel",
  greenhouse: "Szklarnia",
};

export const actionTemplateTypeLabels: Record<ActionTemplateType, string> = {
  sowing: "Siew",
  transplanting: "Przesadzanie",
  thinning: "Przerywanie",
  hardening: "Hartowanie",
  watering: "Podlewanie",
  fertilization: "Nawożenie",
  pruning: "Przycinanie",
  weeding: "Odchwaszczanie",
  staking: "Palikowanie i podpieranie",
  harvest: "Zbiór",
  pest_control: "Zwalczanie szkodników",
  disease_control: "Zwalczanie chorób",
  spraying: "Opryski",
  physical_protection: "Ochrona fizyczna",
  trap_setup: "Zakładanie pułapek",
  soil_preparation: "Przygotowanie gleby",
  soil_amendment: "Ulepszanie gleby",
  mulching: "Ściółkowanie",
  soil_testing: "Badanie gleby",
  soil_regeneration: "Regeneracja gleby",
  irrigation_setup: "Przygotowanie nawadniania",
  monitoring: "Monitoring",
  rotation_planning: "Planowanie zmianowania",
  bed_ready: "Grządka gotowa",
  climate_control: "Kontrola klimatu",
  ventilation: "Wentylacja",
  humidity_reduction: "Redukcja wilgotności",
  shading: "Cieniowanie",
  structure_inspection: "Kontrola konstrukcji",
  structure_repair: "Naprawa konstrukcji",
  space_hygiene: "Higiena przestrzeni",
  seasonal_preparation: "Przygotowanie sezonowe",
  manual_custom: "Ręczny (własny)",
};

export const actionTemplateGenerationModeLabels: Record<
  ActionTemplateGenerationMode,
  string
> = {
  AUTO: "Automatyczne",
  ROUTINE: "Rutynowe",
  SUGGESTION: "Sugestia",
  MANUAL_ONLY: "Tylko ręczne",
  POST_HARVEST_PROMPT: "Po zbiorze",
  WEATHER_TRIGGERED: "Zależne od pogody",
  SEASONAL: "Sezonowe",
};

export const actionTemplatePriorityLabels: Record<
  ActionTemplatePriority,
  string
> = {
  low: "Niski",
  medium: "Średni",
  high: "Wysoki",
  critical: "Krytyczny",
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
