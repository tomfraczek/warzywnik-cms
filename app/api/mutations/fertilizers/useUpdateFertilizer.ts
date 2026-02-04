import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFertilizer } from "@/app/fertilizers/api/api.requests";
import type {
  FertilizerType,
  UpdateFertilizerTypePayload,
} from "@/app/fertilizers/api/api.types";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

type UpdateFertilizerInput = {
  id: string;
  payload: UpdateFertilizerTypePayload;
};

const updateFertilizerMutation = async ({
  id,
  payload,
}: UpdateFertilizerInput) => {
  return updateFertilizer(id, payload);
};

export const useUpdateFertilizer = () => {
  const queryClient = useQueryClient();

  return useMutation<FertilizerType, unknown, UpdateFertilizerInput>({
    mutationFn: updateFertilizerMutation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fertilizerKeys.all });
      queryClient.invalidateQueries({
        queryKey: fertilizerKeys.detail(variables.id),
      });
    },
  });
};
