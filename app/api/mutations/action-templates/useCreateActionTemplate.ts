import { useMutation } from "@tanstack/react-query";
import { createActionTemplate } from "@/app/api/api.requests";
import type {
  ActionTemplate,
  CreateActionTemplatePayload,
} from "@/app/api/api.types";

const createActionTemplateMutation = async (
  payload: CreateActionTemplatePayload,
) => {
  return createActionTemplate(payload);
};

export const useCreateActionTemplate = () => {
  return useMutation<ActionTemplate, unknown, CreateActionTemplatePayload>({
    mutationFn: createActionTemplateMutation,
  });
};
