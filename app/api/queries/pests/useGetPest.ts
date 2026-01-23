import { useQuery } from "@tanstack/react-query";
import { getPest } from "@/app/api/api.requests";
import { pestKeys } from "@/app/api/queries/pests/useGetPests";

const fetchPest = (id: string) => async () => {
  return getPest(id);
};

export const useGetPest = (id?: string) => {
  return useQuery({
    queryKey: pestKeys.detail(id || ""),
    queryFn: fetchPest(id || ""),
    enabled: Boolean(id),
  });
};
