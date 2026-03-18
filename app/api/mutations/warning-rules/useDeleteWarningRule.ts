import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteManyWarningRules,
  deleteWarningRule,
} from "@/app/warning-rules/api/api.requests";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

type DeleteWarningRuleByIdInput = {
  id: string;
};

type DeleteWarningRulesManyInput = {
  ids: string[];
};

type DeleteWarningRuleInput =
  | DeleteWarningRuleByIdInput
  | DeleteWarningRulesManyInput;

const deleteWarningRuleMutation = async (input: DeleteWarningRuleInput) => {
  if ("ids" in input) {
    await deleteManyWarningRules({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteWarningRule(input.id);
};

export const useDeleteWarningRule = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DeleteWarningRuleInput>({
    mutationFn: deleteWarningRuleMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: warningRuleKeys.all });
      if ("ids" in variables) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: warningRuleKeys.detail(variables.id),
      });
    },
  });
};
