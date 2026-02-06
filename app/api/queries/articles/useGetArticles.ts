import { useQuery } from "@tanstack/react-query";
import type { GetArticlesParams } from "@/app/api/api.requests";
import { getArticles } from "@/app/api/api.requests";

export const articleKeys = {
  all: ["articles"] as const,
  list: (params: GetArticlesParams) => [...articleKeys.all, params] as const,
  detail: (idOrSlug: string) =>
    [...articleKeys.all, "detail", idOrSlug] as const,
};

const fetchArticles = (params: GetArticlesParams) => async () => {
  return getArticles(params);
};

export const useGetArticles = (params: GetArticlesParams = {}) => {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: fetchArticles(params),
  });
};
