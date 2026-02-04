import { useQuery } from "@tanstack/react-query";
import { getWarningRule } from "@/app/warning-rules/api/api.requests";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

const fetchWarningRule = (idOrCode: string) => async () => {
  return getWarningRule(idOrCode);
};

export const useGetWarningRule = (idOrCode?: string) => {
  return useQuery({
    queryKey: warningRuleKeys.detail(idOrCode || ""),
    queryFn: fetchWarningRule(idOrCode || ""),
    enabled: Boolean(idOrCode),
  });
};
