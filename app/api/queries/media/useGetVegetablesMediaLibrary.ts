import {
  useInfiniteQuery,
  type QueryFunctionContext,
} from "@tanstack/react-query";
import { getVegetablesMediaLibrary } from "@/app/api/api.requests";
import type { GetMediaLibraryParams } from "@/app/api/api.requests";
import type { MediaLibraryResponse } from "@/app/api/api.types";

export const mediaLibraryKeys = {
  vegetables: ["media-library", "vegetables"] as const,
  articles: ["media-library", "articles"] as const,
  vegetablesList: (params: GetMediaLibraryParams) =>
    [...mediaLibraryKeys.vegetables, params] as const,
  articlesList: (params: GetMediaLibraryParams) =>
    [...mediaLibraryKeys.articles, params] as const,
};

const fetchVegetablesMediaLibrary =
  (params: GetMediaLibraryParams) =>
  async ({ pageParam }: QueryFunctionContext) => {
    const cursor = typeof pageParam === "string" ? pageParam : null;
    return getVegetablesMediaLibrary({ ...params, cursor });
  };

export const useGetVegetablesMediaLibrary = (params: GetMediaLibraryParams) => {
  return useInfiniteQuery<MediaLibraryResponse>({
    queryKey: mediaLibraryKeys.vegetablesList(params),
    queryFn: fetchVegetablesMediaLibrary(params),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  });
};
