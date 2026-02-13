import { useMutation } from "@tanstack/react-query";
import { deleteVegetableImage } from "@/app/api/api.requests";

type DeleteVegetableImageInput = {
  id: string;
};

const deleteVegetableImageMutation = async ({
  id,
}: DeleteVegetableImageInput) => {
  await deleteVegetableImage(id);
};

export const useDeleteVegetableImage = () => {
  return useMutation<void, unknown, DeleteVegetableImageInput>({
    mutationFn: deleteVegetableImageMutation,
  });
};
