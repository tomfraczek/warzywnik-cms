import { useMutation } from "@tanstack/react-query";
import { uploadVegetableImage } from "@/app/api/api.requests";
import type { Vegetable } from "@/app/api/api.types";

type UploadVegetableImageInput = {
  id: string;
  file: File;
  adminToken?: string;
};

const uploadVegetableImageMutation = async ({
  id,
  file,
  adminToken,
}: UploadVegetableImageInput) => {
  return uploadVegetableImage(id, file, adminToken);
};

export const useUploadVegetableImage = () => {
  return useMutation<Vegetable, unknown, UploadVegetableImageInput>({
    mutationFn: uploadVegetableImageMutation,
  });
};
