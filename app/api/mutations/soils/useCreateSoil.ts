import { useMutation } from "@tanstack/react-query";
import { createSoil } from "@/app/soils/api/api.requests";
import type { CreateSoilPayload, Soil } from "@/app/soils/api/api.types";

const createSoilMutation = async (payload: CreateSoilPayload) => {
  return createSoil(payload);
};

export const useCreateSoil = () => {
  return useMutation<Soil, unknown, CreateSoilPayload>({
    mutationFn: createSoilMutation,
  });
};
