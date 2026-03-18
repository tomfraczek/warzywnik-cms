import { useMutation } from "@tanstack/react-query";
import { deleteManyVegetables, deleteVegetable } from "@/app/api/api.requests";

type DeleteVegetableByIdInput = {
  id: string;
};

type DeleteVegetablesManyInput = {
  ids: string[];
};

type DeleteVegetableInput =
  | DeleteVegetableByIdInput
  | DeleteVegetablesManyInput;

const deleteVegetableMutation = async (input: DeleteVegetableInput) => {
  if ("ids" in input) {
    await deleteManyVegetables({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteVegetable(input.id);
};

export const useDeleteVegetable = () => {
  return useMutation<void, unknown, DeleteVegetableInput>({
    mutationFn: deleteVegetableMutation,
  });
};
