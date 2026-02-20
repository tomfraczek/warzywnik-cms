import { useQuery } from "@tanstack/react-query";
import { getActionTemplates } from "@/app/api/api.requests";

export const actionTemplateKeys = {
  all: ["action-templates"] as const,
  list: (params: { page?: number; limit?: number; q?: string }) =>
    [...actionTemplateKeys.all, params] as const,
  detail: (idOrSlug: string) =>
    [...actionTemplateKeys.all, "detail", idOrSlug] as const,
};

const fetchActionTemplates =
  (params: { page?: number; limit?: number; q?: string }) => async () => {
    return getActionTemplates(params);
  };

export const useGetActionTemplates = (
  params: { page?: number; limit?: number; q?: string } = {},
) => {
  return useQuery({
    queryKey: actionTemplateKeys.list(params),
    queryFn: fetchActionTemplates(params),
  });
};
