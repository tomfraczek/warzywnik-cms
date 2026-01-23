import { useMutation } from "@tanstack/react-query";
import { deleteDisease } from "@/app/api/api.requests";

type DeleteDiseaseInput = {
  id: string;
};

const deleteDiseaseMutation = async ({ id }: DeleteDiseaseInput) => {
  await deleteDisease(id);
};

export const useDeleteDisease = () => {
  return useMutation<void, unknown, DeleteDiseaseInput>({
    mutationFn: deleteDiseaseMutation,
  });
};
