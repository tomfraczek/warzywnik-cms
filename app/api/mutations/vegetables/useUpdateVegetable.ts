import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVegetable } from "@/app/api/api.requests";
import type { UpdateVegetablePayload, Vegetable } from "@/app/api/api.types";
import { vegetableKeys } from "@/app/api/queries/vegetables/useGetVegetables";

type UpdateVegetableInput = {
  id: string;
  payload: UpdateVegetablePayload;
};

const updateVegetableMutation = async ({
  id,
  payload,
}: UpdateVegetableInput) => {
  return updateVegetable(id, payload);
};

export const useUpdateVegetable = () => {
  const queryClient = useQueryClient();

  return useMutation<Vegetable, unknown, UpdateVegetableInput>({
    mutationFn: updateVegetableMutation,
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(vegetableKeys.detail(variables.id), updated);
      queryClient.invalidateQueries({ queryKey: vegetableKeys.all });
    },
  });
};
