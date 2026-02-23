import { useQuery } from "@tanstack/react-query";
import { getArticle } from "@/app/api/api.requests";
import { articleKeys } from "@/app/api/queries/articles/useGetArticles";

const fetchArticle = (id: string) => async () => {
  return getArticle(id);
};

export const useGetArticle = (id?: string) => {
  return useQuery({
    queryKey: id ? articleKeys.detail(id) : articleKeys.all,
    queryFn: id ? fetchArticle(id) : undefined,
    enabled: Boolean(id),
  });
};
