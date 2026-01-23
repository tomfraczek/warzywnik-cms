import { useMutation } from "@tanstack/react-query";
import { createVegetable } from "@/app/api/api.requests";
import type { CreateVegetablePayload, Vegetable } from "@/app/api/api.types";

const createVegetableMutation = async (payload: CreateVegetablePayload) => {
  return createVegetable(payload);
};

export const useCreateVegetable = () => {
  return useMutation<Vegetable, unknown, CreateVegetablePayload>({
    mutationFn: createVegetableMutation,
  });
};
