import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteFertilizer,
  deleteManyFertilizers,
} from "@/app/fertilizers/api/api.requests";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

type DeleteFertilizerByIdInput = {
  id: string;
};

type DeleteFertilizersManyInput = {
  ids: string[];
};

type DeleteFertilizerInput =
  | DeleteFertilizerByIdInput
  | DeleteFertilizersManyInput;

const deleteFertilizerMutation = async (input: DeleteFertilizerInput) => {
  if ("ids" in input) {
    await deleteManyFertilizers({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteFertilizer(input.id);
};

export const useDeleteFertilizer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DeleteFertilizerInput>({
    mutationFn: deleteFertilizerMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fertilizerKeys.all });
      if ("ids" in variables) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: fertilizerKeys.detail(variables.id),
      });
    },
  });
};
