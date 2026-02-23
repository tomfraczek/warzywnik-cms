import { useQuery } from "@tanstack/react-query";
import { getActionTemplates } from "@/app/api/api.requests";
import type { ActionTemplateScope } from "@/app/api/api.types";

export const actionTemplateKeys = {
  all: ["action-templates"] as const,
  list: (params: {
    page?: number;
    limit?: number;
    q?: string;
    scope?: ActionTemplateScope;
  }) => [...actionTemplateKeys.all, params] as const,
  detail: (idOrSlug: string) =>
    [...actionTemplateKeys.all, "detail", idOrSlug] as const,
};

const fetchActionTemplates =
  (params: {
    page?: number;
    limit?: number;
    q?: string;
    scope?: ActionTemplateScope;
  }) =>
  async () => {
    return getActionTemplates(params);
  };

export const useGetActionTemplates = (
  params: {
    page?: number;
    limit?: number;
    q?: string;
    scope?: ActionTemplateScope;
  } = {},
) => {
  return useQuery({
    queryKey: actionTemplateKeys.list(params),
    queryFn: fetchActionTemplates(params),
  });
};
