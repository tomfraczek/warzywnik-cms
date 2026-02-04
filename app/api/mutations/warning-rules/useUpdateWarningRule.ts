import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWarningRule } from "@/app/warning-rules/api/api.requests";
import type {
  UpdateWarningRulePayload,
  WarningRule,
} from "@/app/warning-rules/api/api.types";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

type UpdateWarningRuleInput = {
  id: string;
  payload: UpdateWarningRulePayload;
};

const updateWarningRuleMutation = async ({
  id,
  payload,
}: UpdateWarningRuleInput) => {
  return updateWarningRule(id, payload);
};

export const useUpdateWarningRule = () => {
  const queryClient = useQueryClient();

  return useMutation<WarningRule, unknown, UpdateWarningRuleInput>({
    mutationFn: updateWarningRuleMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: warningRuleKeys.all });
      queryClient.invalidateQueries({
        queryKey: warningRuleKeys.detail(variables.id),
      });
    },
  });
};
