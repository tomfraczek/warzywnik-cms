import { useMutation } from "@tanstack/react-query";
import { createArticle } from "@/app/api/api.requests";
import type { Article, CreateArticlePayload } from "@/app/api/api.types";

const createArticleMutation = async (payload: CreateArticlePayload) => {
  return createArticle(payload);
};

export const useCreateArticle = () => {
  return useMutation<Article, unknown, CreateArticlePayload>({
    mutationFn: createArticleMutation,
  });
};
