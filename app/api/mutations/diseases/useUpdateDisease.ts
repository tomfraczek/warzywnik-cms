import { useMutation } from "@tanstack/react-query";
import { updateDisease } from "@/app/api/api.requests";
import type { UpdateDiseasePayload, Disease } from "@/app/api/api.types";

type UpdateDiseaseInput = {
  id: string;
  payload: UpdateDiseasePayload;
};

const updateDiseaseMutation = async ({ id, payload }: UpdateDiseaseInput) => {
  return updateDisease(id, payload);
};

export const useUpdateDisease = () => {
  return useMutation<Disease, unknown, UpdateDiseaseInput>({
    mutationFn: updateDiseaseMutation,
  });
};
