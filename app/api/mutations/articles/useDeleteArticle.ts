import { useMutation } from "@tanstack/react-query";
import { deleteArticle, deleteManyArticles } from "@/app/api/api.requests";

type DeleteArticleByIdParams = {
  id: string;
};

type DeleteArticlesManyParams = {
  ids: string[];
};

type DeleteArticleParams = DeleteArticleByIdParams | DeleteArticlesManyParams;

const deleteArticleMutation = async (input: DeleteArticleParams) => {
  if ("ids" in input) {
    await deleteManyArticles({ ids: [...new Set(input.ids)] });
    return;
  }

  return deleteArticle(input.id);
};

export const useDeleteArticle = () => {
  return useMutation<void, unknown, DeleteArticleParams>({
    mutationFn: deleteArticleMutation,
  });
};
