import { useMutation } from "@tanstack/react-query";
import { updateVegetable } from "@/app/api/api.requests";
import type { UpdateVegetablePayload, Vegetable } from "@/app/api/api.types";

type UpdateVegetableInput = {
  id: string;
  payload: UpdateVegetablePayload;
};

const updateVegetableMutation = async ({ id, payload }: UpdateVegetableInput) => {
  return updateVegetable(id, payload);
};

export const useUpdateVegetable = () => {
  return useMutation<Vegetable, unknown, UpdateVegetableInput>({
    mutationFn: updateVegetableMutation,
  });
};
