import { useMutation } from "@tanstack/react-query";
import { deleteActionTemplate } from "@/app/api/api.requests";

type DeleteActionTemplateInput = {
  id: string;
};

const deleteActionTemplateMutation = async ({
  id,
}: DeleteActionTemplateInput) => {
  await deleteActionTemplate(id);
};

export const useDeleteActionTemplate = () => {
  return useMutation<void, unknown, DeleteActionTemplateInput>({
    mutationFn: deleteActionTemplateMutation,
  });
};
