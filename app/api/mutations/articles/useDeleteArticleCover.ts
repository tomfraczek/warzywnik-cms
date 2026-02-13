import { useMutation } from "@tanstack/react-query";
import { deleteArticleCover } from "@/app/api/api.requests";

type DeleteArticleCoverInput = {
  id: string;
};

const deleteArticleCoverMutation = async ({ id }: DeleteArticleCoverInput) => {
  await deleteArticleCover(id);
};

export const useDeleteArticleCover = () => {
  return useMutation<void, unknown, DeleteArticleCoverInput>({
    mutationFn: deleteArticleCoverMutation,
  });
};
