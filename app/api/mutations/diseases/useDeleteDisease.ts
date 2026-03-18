import { useMutation } from "@tanstack/react-query";
import { deleteDisease, deleteManyDiseases } from "@/app/api/api.requests";

type DeleteDiseaseByIdInput = {
  id: string;
};

type DeleteDiseasesManyInput = {
  ids: string[];
};

type DeleteDiseaseInput = DeleteDiseaseByIdInput | DeleteDiseasesManyInput;

const deleteDiseaseMutation = async (input: DeleteDiseaseInput) => {
  if ("ids" in input) {
    await deleteManyDiseases({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteDisease(input.id);
};

export const useDeleteDisease = () => {
  return useMutation<void, unknown, DeleteDiseaseInput>({
    mutationFn: deleteDiseaseMutation,
  });
};
