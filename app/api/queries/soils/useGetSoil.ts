import { useQuery } from "@tanstack/react-query";
import { getSoil } from "@/app/soils/api/api.requests";
import { soilKeys } from "@/app/api/queries/soils/useGetSoils";

const fetchSoil = (id: string) => async () => getSoil(id);

export const useGetSoil = (id?: string) => {
  return useQuery({
    queryKey: id ? soilKeys.detail(id) : [...soilKeys.all, "detail", "none"],
    queryFn: id
      ? fetchSoil(id)
      : async () => Promise.reject(new Error("Missing id")),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};
