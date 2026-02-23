import { useQuery } from "@tanstack/react-query";
import { getFertilizer } from "@/app/fertilizers/api/api.requests";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

const fetchFertilizer = (id: string) => async () => {
  return getFertilizer(id);
};

export const useGetFertilizer = (id?: string) => {
  return useQuery({
    queryKey: fertilizerKeys.detail(id || ""),
    queryFn: fetchFertilizer(id || ""),
    enabled: Boolean(id),
  });
};
