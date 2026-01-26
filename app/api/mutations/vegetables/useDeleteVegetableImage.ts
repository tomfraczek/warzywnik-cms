import { useMutation } from "@tanstack/react-query";
import { deleteVegetableImage } from "@/app/api/api.requests";

type DeleteVegetableImageInput = {
  id: string;
  adminToken?: string;
};

const deleteVegetableImageMutation = async ({
  id,
  adminToken,
}: DeleteVegetableImageInput) => {
  await deleteVegetableImage(id, adminToken);
};

export const useDeleteVegetableImage = () => {
  return useMutation<void, unknown, DeleteVegetableImageInput>({
    mutationFn: deleteVegetableImageMutation,
  });
};
