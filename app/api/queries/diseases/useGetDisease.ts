import { useQuery } from "@tanstack/react-query";
import { getDisease } from "@/app/api/api.requests";
import { diseaseKeys } from "@/app/api/queries/diseases/useGetDiseases";

const fetchDisease = (id: string) => async () => {
  return getDisease(id);
};

export const useGetDisease = (id?: string) => {
  return useQuery({
    queryKey: diseaseKeys.detail(id || ""),
    queryFn: fetchDisease(id || ""),
    enabled: Boolean(id),
  });
};
