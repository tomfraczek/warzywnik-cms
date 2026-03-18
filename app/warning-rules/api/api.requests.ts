import { apiClient } from "@/app/api/axios";
import type {
  CreateWarningRulePayload,
  ListResponse,
  UpdateWarningRulePayload,
  WarningCode,
  WarningRuleHorizon,
  WarningRule,
  WarningRuleCategory,
  WarningRuleListItem,
  WarningSeverity,
} from "@/app/warning-rules/api/api.types";

export type GetWarningRulesParams = {
  page?: number;
  limit?: number;
  q?: string;
  enabled?: boolean;
  severity?: WarningSeverity;
  horizon?: WarningRuleHorizon;
  category?: WarningRuleCategory;
  generatesTask?: boolean;
};

type DeleteManyDto = {
  ids: string[];
};

type WarningCodesResponse =
  | WarningCode[]
  | {
      codes?: WarningCode[];
      items?: WarningCode[];
    };

export const getWarningRules = async (
  params: GetWarningRulesParams = {},
): Promise<ListResponse<WarningRuleListItem>> => {
  const { data } = await apiClient.get<ListResponse<WarningRuleListItem>>(
    "/warning-rules",
    { params },
  );
  return data;
};

export const getWarningRuleCodes = async (): Promise<WarningCode[]> => {
  const { data } = await apiClient.get<WarningCodesResponse>(
    "/warning-rules/codes",
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.codes)) {
    return data.codes;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

export const getWarningRule = async (
  idOrCode: string,
): Promise<WarningRule> => {
  const { data } = await apiClient.get<WarningRule>(
    `/warning-rules/${idOrCode}`,
  );
  return data;
};

export const createWarningRule = async (
  payload: CreateWarningRulePayload,
): Promise<WarningRule> => {
  const { data } = await apiClient.post<WarningRule>("/warning-rules", payload);
  return data;
};

export const updateWarningRule = async (
  id: string,
  payload: UpdateWarningRulePayload,
): Promise<WarningRule> => {
  const { data } = await apiClient.patch<WarningRule>(
    `/warning-rules/${id}`,
    payload,
  );
  return data;
};

export const deleteWarningRule = async (id: string): Promise<void> => {
  await apiClient.delete(`/warning-rules/${id}`);
};

export const deleteManyWarningRules = async (
  payload: DeleteManyDto,
): Promise<void> => {
  await apiClient.delete("/warning-rules", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
