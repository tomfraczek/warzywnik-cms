import { useQuery } from "@tanstack/react-query";
import { getActionTemplate } from "@/app/api/api.requests";
import { actionTemplateKeys } from "@/app/api/queries/action-templates/useGetActionTemplates";

const fetchActionTemplate = (id: string) => async () => {
  return getActionTemplate(id);
};

export const useGetActionTemplate = (id?: string) => {
  return useQuery({
    queryKey: actionTemplateKeys.detail(id || ""),
    queryFn: fetchActionTemplate(id || ""),
    enabled: Boolean(id),
  });
};
