import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recomputePlantingActions } from "@/app/api/api.requests";
import type { RecomputePlantingActionsResponse } from "@/app/api/api.types";
import { actionAutomationKeys } from "@/app/api/queries/action-automation/useGetActionAutomationCoverage";

type RecomputePlantingActionsInput = {
  plantingId: string;
};

const recomputePlantingActionsMutation = async ({
  plantingId,
}: RecomputePlantingActionsInput) => {
  return recomputePlantingActions(plantingId);
};

export const useRecomputePlantingActions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RecomputePlantingActionsResponse,
    unknown,
    RecomputePlantingActionsInput
  >({
    mutationFn: recomputePlantingActionsMutation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: actionAutomationKeys.all });
      queryClient.invalidateQueries({
        queryKey: actionAutomationKeys.preview(variables.plantingId),
      });
    },
  });
};
