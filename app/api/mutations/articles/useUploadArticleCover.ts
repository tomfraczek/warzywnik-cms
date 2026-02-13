import { useMutation } from "@tanstack/react-query";
import { uploadArticleCover } from "@/app/api/api.requests";
import type { Article } from "@/app/api/api.types";

type UploadArticleCoverInput = {
  id: string;
  file: File;
};

const uploadArticleCoverMutation = async ({
  id,
  file,
}: UploadArticleCoverInput) => {
  return uploadArticleCover(id, file);
};

export const useUploadArticleCover = () => {
  return useMutation<Article, unknown, UploadArticleCoverInput>({
    mutationFn: uploadArticleCoverMutation,
  });
};
