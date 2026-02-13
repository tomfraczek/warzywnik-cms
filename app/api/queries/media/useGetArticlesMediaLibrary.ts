import {
  useInfiniteQuery,
  type QueryFunctionContext,
} from "@tanstack/react-query";
import { getArticlesMediaLibrary } from "@/app/api/api.requests";
import type { GetMediaLibraryParams } from "@/app/api/api.requests";
import type { MediaLibraryResponse } from "@/app/api/api.types";
import { mediaLibraryKeys } from "@/app/api/queries/media/useGetVegetablesMediaLibrary";

const fetchArticlesMediaLibrary =
  (params: GetMediaLibraryParams) =>
  async ({ pageParam }: QueryFunctionContext) => {
    const cursor = typeof pageParam === "string" ? pageParam : null;
    return getArticlesMediaLibrary({ ...params, cursor });
  };

export const useGetArticlesMediaLibrary = (params: GetMediaLibraryParams) => {
  return useInfiniteQuery<MediaLibraryResponse>({
    queryKey: mediaLibraryKeys.articlesList(params),
    queryFn: fetchArticlesMediaLibrary(params),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
  });
};
