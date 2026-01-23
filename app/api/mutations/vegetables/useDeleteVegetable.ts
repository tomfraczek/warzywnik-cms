import { useMutation } from "@tanstack/react-query";
import { deleteVegetable } from "@/app/api/api.requests";

type DeleteVegetableInput = {
  id: string;
};

const deleteVegetableMutation = async ({ id }: DeleteVegetableInput) => {
  await deleteVegetable(id);
};

export const useDeleteVegetable = () => {
  return useMutation<void, unknown, DeleteVegetableInput>({
    mutationFn: deleteVegetableMutation,
  });
};
