import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getActionTemplate } from "@/app/api/api.requests";
import { actionTemplateKeys } from "@/app/api/queries/action-templates/useGetActionTemplates";

export const useGetActionTemplatesByIds = (ids: string[]) => {
  const uniqueIds = useMemo(
    () => Array.from(new Set(ids)).filter(Boolean),
    [ids],
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: actionTemplateKeys.detail(id),
      queryFn: () => getActionTemplate(id),
      enabled: Boolean(id),
    })),
  });

  const data = queries
    .map((query) => query.data)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);

  return {
    data,
    isLoading,
    isFetching,
  };
};
