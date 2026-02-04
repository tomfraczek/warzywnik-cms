import { useQuery } from "@tanstack/react-query";
import { getFertilizer } from "@/app/fertilizers/api/api.requests";
import { fertilizerKeys } from "@/app/api/queries/fertilizers/useGetFertilizers";

const fetchFertilizer = (idOrSlug: string) => async () => {
  return getFertilizer(idOrSlug);
};

export const useGetFertilizer = (idOrSlug?: string) => {
  return useQuery({
    queryKey: fertilizerKeys.detail(idOrSlug || ""),
    queryFn: fetchFertilizer(idOrSlug || ""),
    enabled: Boolean(idOrSlug),
  });
};
