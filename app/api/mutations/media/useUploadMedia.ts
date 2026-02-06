import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "@/app/api/api.requests";
import type { MediaItem } from "@/app/api/api.types";

type UploadMediaInput = {
  file: File;
};

const uploadMediaMutation = async ({ file }: UploadMediaInput) => {
  return uploadMedia(file);
};

export const useUploadMedia = () => {
  return useMutation<MediaItem, unknown, UploadMediaInput>({
    mutationFn: uploadMediaMutation,
  });
};
