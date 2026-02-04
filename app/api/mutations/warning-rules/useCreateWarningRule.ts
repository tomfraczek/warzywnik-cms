import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWarningRule } from "@/app/warning-rules/api/api.requests";
import type {
  CreateWarningRulePayload,
  WarningRule,
} from "@/app/warning-rules/api/api.types";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

const createWarningRuleMutation = async (payload: CreateWarningRulePayload) => {
  return createWarningRule(payload);
};

export const useCreateWarningRule = () => {
  const queryClient = useQueryClient();

  return useMutation<WarningRule, unknown, CreateWarningRulePayload>({
    mutationFn: createWarningRuleMutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: warningRuleKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: warningRuleKeys.detail(data.id),
        });
      }
    },
  });
};
