import { useQuery } from "@tanstack/react-query";
import { getWarningRules } from "@/app/warning-rules/api/api.requests";
import type { GetWarningRulesParams } from "@/app/warning-rules/api/api.requests";

export const warningRuleKeys = {
  all: ["warning-rules"] as const,
  list: (params: GetWarningRulesParams) =>
    [...warningRuleKeys.all, params] as const,
  detail: (idOrCode: string) =>
    [...warningRuleKeys.all, "detail", idOrCode] as const,
};

const fetchWarningRules = (params: GetWarningRulesParams) => async () => {
  return getWarningRules(params);
};

export const useGetWarningRules = (params: GetWarningRulesParams = {}) => {
  return useQuery({
    queryKey: warningRuleKeys.list(params),
    queryFn: fetchWarningRules(params),
  });
};
