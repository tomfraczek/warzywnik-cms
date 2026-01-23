import { useQuery } from "@tanstack/react-query";
import { getPests } from "@/app/api/api.requests";

export const pestKeys = {
  all: ["pests"] as const,
  list: (params: { page?: number; limit?: number; q?: string }) =>
    [...pestKeys.all, params] as const,
  detail: (idOrSlug: string) => [...pestKeys.all, "detail", idOrSlug] as const,
};

const fetchPests = (params: { page?: number; limit?: number; q?: string }) =>
  async () => {
    return getPests(params);
  };

export const useGetPests = (params: { page?: number; limit?: number; q?: string } = {}) => {
  return useQuery({
    queryKey: pestKeys.list(params),
    queryFn: fetchPests(params),
  });
};
