import { useQuery } from "@tanstack/react-query";
import { getFertilizers } from "@/app/fertilizers/api/api.requests";
import type { GetFertilizersParams } from "@/app/fertilizers/api/api.requests";

export const fertilizerKeys = {
  all: ["fertilizers"] as const,
  list: (params: GetFertilizersParams) =>
    [...fertilizerKeys.all, params] as const,
  detail: (idOrSlug: string) =>
    [...fertilizerKeys.all, "detail", idOrSlug] as const,
};

const fetchFertilizers = (params: GetFertilizersParams) => async () => {
  return getFertilizers(params);
};

export const useGetFertilizers = (params: GetFertilizersParams = {}) => {
  return useQuery({
    queryKey: fertilizerKeys.list(params),
    queryFn: fetchFertilizers(params),
  });
};
