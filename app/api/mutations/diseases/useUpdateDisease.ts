import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDisease } from "@/app/api/api.requests";
import type { UpdateDiseasePayload, Disease } from "@/app/api/api.types";
import { diseaseKeys } from "../../queries/diseases/useGetDiseases";

type UpdateDiseaseInput = {
  id: string;
  payload: UpdateDiseasePayload;
};

const updateDiseaseMutation = async ({ id, payload }: UpdateDiseaseInput) => {
  return updateDisease(id, payload);
};

export const useUpdateDisease = () => {
  const queryClient = useQueryClient();
  return useMutation<Disease, unknown, UpdateDiseaseInput>({
    mutationFn: updateDiseaseMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: diseaseKeys.all,
      });
    },
  });
};
