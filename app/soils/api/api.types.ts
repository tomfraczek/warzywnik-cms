export type SoilStructure = "loose" | "crumbly" | "compact";
export type DemandLevel = "low" | "medium" | "high";
export type DrainageLevel = "poor" | "medium" | "good";

export type Soil = {
  id: string;
  name: string;
  description: string;
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
  name: string;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type CreateSoilPayload = {
  name: string;
  description: string;
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
export const soilStructureOptions: SoilStructure[] = [
  "loose",
  "crumbly",
  "compact",
];
export const demandLevelOptions: DemandLevel[] = ["low", "medium", "high"];
export const drainageLevelOptions: DrainageLevel[] = ["poor", "medium", "good"];
