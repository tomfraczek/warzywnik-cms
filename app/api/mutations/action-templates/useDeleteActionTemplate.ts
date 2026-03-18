import { useMutation } from "@tanstack/react-query";
import {
  deleteActionTemplate,
  deleteManyActionTemplates,
} from "@/app/api/api.requests";

type DeleteActionTemplateByIdInput = {
  id: string;
};

type DeleteActionTemplatesManyInput = {
  ids: string[];
};

type DeleteActionTemplateInput =
  | DeleteActionTemplateByIdInput
  | DeleteActionTemplatesManyInput;

const deleteActionTemplateMutation = async (
  input: DeleteActionTemplateInput,
) => {
  if ("ids" in input) {
    await deleteManyActionTemplates({ ids: [...new Set(input.ids)] });
    return;
  }

  await deleteActionTemplate(input.id);
};

export const useDeleteActionTemplate = () => {
  return useMutation<void, unknown, DeleteActionTemplateInput>({
    mutationFn: deleteActionTemplateMutation,
  });
};
