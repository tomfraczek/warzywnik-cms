import { useMutation } from "@tanstack/react-query";
import { updateArticle } from "@/app/api/api.requests";
import type { Article, UpdateArticlePayload } from "@/app/api/api.types";

type UpdateArticleParams = {
  id: string;
  payload: UpdateArticlePayload;
};

const updateArticleMutation = async ({ id, payload }: UpdateArticleParams) => {
  return updateArticle(id, payload);
};

export const useUpdateArticle = () => {
  return useMutation<Article, unknown, UpdateArticleParams>({
    mutationFn: updateArticleMutation,
  });
};
