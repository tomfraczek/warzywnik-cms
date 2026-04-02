export type WarningCode = string;

export type WarningSeverity = "INFO" | "WARNING" | "CRITICAL";
export type WarningRuleHorizon = "RADAR" | "OPERATIONAL" | (string & {});
export type WarningRuleDayPart = "DAY" | "NIGHT" | "ANY" | (string & {});
export type WarningRuleCategory = string;

export type WarningRule = {
  id: string;
  slug: string | null;
  code: WarningCode;
  enabled: boolean;
  severity: WarningSeverity;
  category: WarningRuleCategory | null;
  horizon: WarningRuleHorizon | null;
  dayPart: WarningRuleDayPart | null;
  generatesTask: boolean | null;
  title: string;
  messageTemplate: string;
  hintTemplate?: string | null;
  blocking: boolean;
  cooldownDays?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type WarningRuleListItem = {
  id: string;
  slug: string | null;
  code: WarningCode;
  title: string;
  severity: WarningSeverity;
  enabled: boolean;
  category: WarningRuleCategory | null;
  horizon: WarningRuleHorizon | null;
  dayPart: WarningRuleDayPart | null;
  generatesTask: boolean | null;
  updatedAt: string;
};

export type ListResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type CreateWarningRulePayload = Omit<
  WarningRule,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateWarningRulePayload = Partial<CreateWarningRulePayload>;

export const warningCodeOptions: WarningCode[] = [
  "SOIL_NOT_RECOMMENDED",
  "PH_OUT_OF_RANGE",
  "DEPTH_TOO_SMALL",
  "NPK_TOO_LOW",
  "ROTATION_RISK",
  "WATER_RETENTION_MISMATCH",
  "DRAINAGE_MISMATCH",
  "FAMILY_REPETITION",
  "HARVEST_WINDOW_MISSED",
  "SUBOPTIMAL_SOWING_TIME",
  "EXPERIMENTAL_SETUP",
];

export const warningRuleHorizonOptions: WarningRuleHorizon[] = [
  "RADAR",
  "OPERATIONAL",
];

export const warningRuleDayPartOptions: WarningRuleDayPart[] = [
  "ANY",
  "DAY",
  "NIGHT",
];

export const warningSeverityOptions: WarningSeverity[] = [
  "INFO",
  "WARNING",
  "CRITICAL",
];
