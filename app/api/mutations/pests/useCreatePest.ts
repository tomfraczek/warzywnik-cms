import { useMutation } from "@tanstack/react-query";
import { createPest } from "@/app/api/api.requests";
import type { CreatePestPayload, Pest } from "@/app/api/api.types";

const createPestMutation = async (payload: CreatePestPayload) => {
  return createPest(payload);
};

export const useCreatePest = () => {
  return useMutation<Pest, unknown, CreatePestPayload>({
    mutationFn: createPestMutation,
  });
};
