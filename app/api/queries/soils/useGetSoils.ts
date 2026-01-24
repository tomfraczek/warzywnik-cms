import { useQuery } from "@tanstack/react-query";
import { getSoils } from "@/app/soils/api/api.requests";
import type { GetSoilsParams } from "@/app/soils/api/api.requests";

export const soilKeys = {
  all: ["soils"] as const,
  list: (params: GetSoilsParams) => [...soilKeys.all, params] as const,
  detail: (id: string) => [...soilKeys.all, "detail", id] as const,
};

const fetchSoils = (params: GetSoilsParams) => async () => {
  return getSoils(params);
};

export const useGetSoils = (params: GetSoilsParams = {}) => {
  return useQuery({
    queryKey: soilKeys.list(params),
    queryFn: fetchSoils(params),
  });
};
