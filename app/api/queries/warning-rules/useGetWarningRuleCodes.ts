import { useQuery } from "@tanstack/react-query";
import { getWarningRuleCodes } from "@/app/warning-rules/api/api.requests";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

export const useGetWarningRuleCodes = () => {
  return useQuery({
    queryKey: [...warningRuleKeys.all, "codes"],
    queryFn: getWarningRuleCodes,
  });
};
