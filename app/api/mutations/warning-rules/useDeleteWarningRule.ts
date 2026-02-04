import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWarningRule } from "@/app/warning-rules/api/api.requests";
import { warningRuleKeys } from "@/app/api/queries/warning-rules/useGetWarningRules";

type DeleteWarningRuleInput = {
  id: string;
};

const deleteWarningRuleMutation = async ({ id }: DeleteWarningRuleInput) => {
  await deleteWarningRule(id);
};

export const useDeleteWarningRule = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DeleteWarningRuleInput>({
    mutationFn: deleteWarningRuleMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: warningRuleKeys.all });
      queryClient.invalidateQueries({
        queryKey: warningRuleKeys.detail(variables.id),
      });
    },
  });
};
