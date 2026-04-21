import { useQuery } from "@tanstack/react-query";
import type { GetAnalyticsVegetablesPopularParams } from "@/app/api/api.requests";
import { getAnalyticsVegetablesPopular } from "@/app/api/api.requests";
import { analyticsKeys } from "./useGetAnalyticsDashboard";

export const useGetAnalyticsVegetablesPopular = (
  params: GetAnalyticsVegetablesPopularParams = {},
) => {
  return useQuery({
    queryKey: analyticsKeys.vegetablesPopular(params),
    queryFn: () => getAnalyticsVegetablesPopular(params),
  });
};
