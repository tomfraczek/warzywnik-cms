import { useQuery } from "@tanstack/react-query";
import { getVegetable } from "@/app/api/api.requests";
import { vegetableKeys } from "@/app/api/queries/vegetables/useGetVegetables";

const fetchVegetable = (id: string) => async () => {
  return getVegetable(id);
};

export const useGetVegetable = (id?: string) => {
  return useQuery({
    queryKey: vegetableKeys.detail(id || ""),
    queryFn: fetchVegetable(id || ""),
    enabled: Boolean(id),
  });
};
