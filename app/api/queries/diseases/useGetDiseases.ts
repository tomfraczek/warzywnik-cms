import { useQuery } from "@tanstack/react-query";
import { getDiseases } from "@/app/api/api.requests";

export const diseaseKeys = {
  all: ["diseases"] as const,
  list: (params: { page?: number; limit?: number; q?: string }) =>
    [...diseaseKeys.all, params] as const,
  detail: (idOrSlug: string) => [...diseaseKeys.all, "detail", idOrSlug] as const,
};

const fetchDiseases = (params: { page?: number; limit?: number; q?: string }) =>
  async () => {
    return getDiseases(params);
  };

export const useGetDiseases = (
  params: { page?: number; limit?: number; q?: string } = {},
) => {
  return useQuery({
    queryKey: diseaseKeys.list(params),
    queryFn: fetchDiseases(params),
  });
};
