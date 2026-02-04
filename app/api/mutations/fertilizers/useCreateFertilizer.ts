import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFertilizer } from "@/app/fertilizers/api/api.requests";
import type {
  CreateFertilizerTypePayload,
  FertilizerType,
} from "@/app/fertilizers/api/api.types";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

const createFertilizerMutation = async (
  payload: CreateFertilizerTypePayload,
) => {
  return createFertilizer(payload);
};

export const useCreateFertilizer = () => {
  const queryClient = useQueryClient();

  return useMutation<FertilizerType, unknown, CreateFertilizerTypePayload>({
    mutationFn: createFertilizerMutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fertilizerKeys.all });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: fertilizerKeys.detail(data.id),
        });
      }
    },
  });
};
