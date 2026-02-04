import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFertilizer } from "@/app/fertilizers/api/api.requests";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

type DeleteFertilizerInput = {
  id: string;
};

const deleteFertilizerMutation = async ({ id }: DeleteFertilizerInput) => {
  await deleteFertilizer(id);
};

export const useDeleteFertilizer = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, DeleteFertilizerInput>({
    mutationFn: deleteFertilizerMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fertilizerKeys.all });
      queryClient.invalidateQueries({
        queryKey: fertilizerKeys.detail(variables.id),
      });
    },
  });
};
