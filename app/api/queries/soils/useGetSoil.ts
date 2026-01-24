import { useQuery } from "@tanstack/react-query";
import { getSoil } from "@/app/soils/api/api.requests";
import { soilKeys } from "@/app/api/queries/soils/useGetSoils";

const fetchSoil = (id: string) => async () => {
  return getSoil(id);
};

export const useGetSoil = (id?: string) => {
  return useQuery({
    queryKey: soilKeys.detail(id || ""),
    queryFn: fetchSoil(id || ""),
    enabled: Boolean(id),
  });
};
