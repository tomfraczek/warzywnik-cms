import { useMutation } from "@tanstack/react-query";
import { updateSoil } from "@/app/soils/api/api.requests";
import type { UpdateSoilPayload, Soil } from "@/app/soils/api/api.types";

type UpdateSoilInput = {
  id: string;
  payload: UpdateSoilPayload;
};

const updateSoilMutation = async ({ id, payload }: UpdateSoilInput) => {
  return updateSoil(id, payload);
};

export const useUpdateSoil = () => {
  return useMutation<Soil, unknown, UpdateSoilInput>({
    mutationFn: updateSoilMutation,
  });
};
