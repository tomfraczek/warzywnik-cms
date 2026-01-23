import { useMutation } from "@tanstack/react-query";
import { createDisease } from "@/app/api/api.requests";
import type { CreateDiseasePayload, Disease } from "@/app/api/api.types";

const createDiseaseMutation = async (payload: CreateDiseasePayload) => {
  return createDisease(payload);
};

export const useCreateDisease = () => {
  return useMutation<Disease, unknown, CreateDiseasePayload>({
    mutationFn: createDiseaseMutation,
  });
};
