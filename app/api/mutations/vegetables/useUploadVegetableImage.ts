import { useMutation } from "@tanstack/react-query";
import { uploadVegetableImage } from "@/app/api/api.requests";
import type { Vegetable } from "@/app/api/api.types";

type UploadVegetableImageInput = {
  id: string;
  file: File;
};

const uploadVegetableImageMutation = async ({
  id,
  file,
}: UploadVegetableImageInput) => {
  return uploadVegetableImage(id, file);
};

export const useUploadVegetableImage = () => {
  return useMutation<Vegetable, unknown, UploadVegetableImageInput>({
    mutationFn: uploadVegetableImageMutation,
  });
};
