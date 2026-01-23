import { useQuery } from "@tanstack/react-query";
import type { GetVegetablesParams } from "@/app/api/api.requests";
import { getVegetables } from "@/app/api/api.requests";

export const vegetableKeys = {
  all: ["vegetables"] as const,
  list: (params: GetVegetablesParams) => [...vegetableKeys.all, params] as const,
  detail: (idOrSlug: string) => [...vegetableKeys.all, "detail", idOrSlug] as const,
};

const fetchVegetables = (params: GetVegetablesParams) => async () => {
  return getVegetables(params);
};

export const useGetVegetables = (params: GetVegetablesParams = {}) => {
  return useQuery({
    queryKey: vegetableKeys.list(params),
    queryFn: fetchVegetables(params),
  });
};
