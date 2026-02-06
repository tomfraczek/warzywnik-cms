import { useQuery } from "@tanstack/react-query";
import type { GetMediaLibraryParams } from "@/app/api/api.requests";
import { getMediaLibrary } from "@/app/api/api.requests";

export const mediaKeys = {
  all: ["media-library"] as const,
  list: (params: GetMediaLibraryParams) => [...mediaKeys.all, params] as const,
};

const fetchMediaLibrary = (params: GetMediaLibraryParams) => async () => {
  return getMediaLibrary(params);
};

export const useGetMediaLibrary = (params: GetMediaLibraryParams = {}) => {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: fetchMediaLibrary(params),
  });
};
