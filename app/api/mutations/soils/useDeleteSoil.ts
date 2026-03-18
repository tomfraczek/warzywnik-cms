import { useMutation } from "@tanstack/react-query";
import { deleteManySoils, deleteSoil } from "@/app/soils/api/api.requests";

type DeleteSoilByIdInput = {
  id: string;
};

type DeleteSoilsManyInput = {
  ids: string[];
};

type DeleteSoilInput = DeleteSoilByIdInput | DeleteSoilsManyInput;

const deleteSoilMutation = async (input: DeleteSoilInput) => {
  if ("ids" in input) {
    await deleteManySoils({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteSoil(input.id);
};

export const useDeleteSoil = () => {
  return useMutation<void, unknown, DeleteSoilInput>({
    mutationFn: deleteSoilMutation,
  });
};
