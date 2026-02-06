import { useMutation } from "@tanstack/react-query";
import { deleteArticle } from "@/app/api/api.requests";

type DeleteArticleParams = {
  id: string;
};

const deleteArticleMutation = async ({ id }: DeleteArticleParams) => {
  return deleteArticle(id);
};

export const useDeleteArticle = () => {
  return useMutation<void, unknown, DeleteArticleParams>({
    mutationFn: deleteArticleMutation,
  });
};
