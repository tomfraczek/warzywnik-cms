export type SoilType = "light" | "medium" | "heavy";
export type SoilStructure = "loose" | "crumbly" | "compact";
export type DemandLevel = "low" | "medium" | "high";
export type DrainageLevel = "poor" | "medium" | "good";

export type Soil = {
  id: string;
  slug: string;
  name: string;
  description: string;
  soilType: SoilType;
  structure: SoilStructure;
  waterRetention: DemandLevel;
  drainage: DrainageLevel;
  phMin: number | null;
  phMax: number | null;
  fertilityLevel: DemandLevel;
  advantages: string[];
  disadvantages: string[];
  improvementTips: string[];
  createdAt: string;
  updatedAt: string;
};

export type SoilListItem = {
  id: string;
  slug: string;
  name: string;
  soilType: SoilType;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type CreateSoilPayload = {
  slug: string;
  name: string;
  description: string;
  soilType: SoilType;
  structure: SoilStructure;
  waterRetention: DemandLevel;
  drainage: DrainageLevel;
  fertilityLevel: DemandLevel;
  phMin?: number | null;
  phMax?: number | null;
  advantages: string[];
  disadvantages: string[];
  improvementTips: string[];
};

export type UpdateSoilPayload = Partial<CreateSoilPayload>;

export const soilTypeOptions: SoilType[] = ["light", "medium", "heavy"];
export const soilStructureOptions: SoilStructure[] = [
  "loose",
  "crumbly",
  "compact",
];
export const demandLevelOptions: DemandLevel[] = ["low", "medium", "high"];
export const drainageLevelOptions: DrainageLevel[] = ["poor", "medium", "good"];
