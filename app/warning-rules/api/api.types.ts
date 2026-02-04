export type WarningCode =
  | "SOIL_NOT_RECOMMENDED"
  | "PH_OUT_OF_RANGE"
  | "DEPTH_TOO_SMALL"
  | "NPK_TOO_LOW"
  | "ROTATION_RISK"
  | "WATER_RETENTION_MISMATCH"
  | "DRAINAGE_MISMATCH";

export type WarningSeverity = "INFO" | "WARNING" | "CRITICAL";

export type WarningRule = {
  id: string;
  code: WarningCode;
  enabled: boolean;
  severity: WarningSeverity;
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
  code: WarningCode;
  title: string;
  severity: WarningSeverity;
  enabled: boolean;
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
];

export const warningSeverityOptions: WarningSeverity[] = [
  "INFO",
  "WARNING",
  "CRITICAL",
];
