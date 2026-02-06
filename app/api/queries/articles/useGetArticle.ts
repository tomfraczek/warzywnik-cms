import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/app/api/api.requests";
import { articleKeys } from "@/app/api/queries/articles/useGetArticles";

const fetchArticle = (idOrSlug: string) => async () => {
  return getArticle(idOrSlug);
};

export const useGetArticle = (idOrSlug?: string) => {
  return useQuery({
    queryKey: idOrSlug ? articleKeys.detail(idOrSlug) : articleKeys.all,
    queryFn: idOrSlug ? fetchArticle(idOrSlug) : undefined,
    enabled: Boolean(idOrSlug),
  });
};
