import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActionTemplate } from "@/app/api/api.requests";
import type {
  ActionTemplate,
  UpdateActionTemplatePayload,
} from "@/app/api/api.types";
import { actionTemplateKeys } from "@/app/api/queries/action-templates/useGetActionTemplates";

type UpdateActionTemplateInput = {
  id: string;
  payload: UpdateActionTemplatePayload;
};

const updateActionTemplateMutation = async ({
  id,
  payload,
}: UpdateActionTemplateInput) => {
  return updateActionTemplate(id, payload);
};

export const useUpdateActionTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation<ActionTemplate, unknown, UpdateActionTemplateInput>({
    mutationFn: updateActionTemplateMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: actionTemplateKeys.all,
      });
    },
  });
};
