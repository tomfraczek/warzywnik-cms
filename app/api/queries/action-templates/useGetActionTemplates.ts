import { useQuery } from "@tanstack/react-query";
import { getActionTemplates } from "@/app/api/api.requests";
import type {
  ActionTemplateEnvironment,
  ActionTemplateScope,
  ActionTemplateTarget,
  ActionTemplateType,
} from "@/app/api/api.types";

export const actionTemplateKeys = {
  all: ["action-templates"] as const,
  list: (params: {
    page?: number;
    limit?: number;
    q?: string;
    scope?: ActionTemplateScope;
    target?: ActionTemplateTarget;
    environment?: ActionTemplateEnvironment;
    type?: ActionTemplateType;
  }) => [...actionTemplateKeys.all, params] as const,
  detail: (id: string) => [...actionTemplateKeys.all, "detail", id] as const,
};

const fetchActionTemplates =
  (params: {
    page?: number;
    limit?: number;
    q?: string;
    scope?: ActionTemplateScope;
    target?: ActionTemplateTarget;
    environment?: ActionTemplateEnvironment;
    type?: ActionTemplateType;
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
    target?: ActionTemplateTarget;
    environment?: ActionTemplateEnvironment;
    type?: ActionTemplateType;
  } = {},
) => {
  return useQuery({
    queryKey: actionTemplateKeys.list(params),
    queryFn: fetchActionTemplates(params),
  });
};
