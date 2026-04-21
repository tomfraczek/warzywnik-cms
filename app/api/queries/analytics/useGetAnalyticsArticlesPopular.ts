import { useQuery } from "@tanstack/react-query";
import type { GetAnalyticsArticlesPopularParams } from "@/app/api/api.requests";
import { getAnalyticsArticlesPopular } from "@/app/api/api.requests";
import { analyticsKeys } from "./useGetAnalyticsDashboard";

export const useGetAnalyticsArticlesPopular = (
  params: GetAnalyticsArticlesPopularParams = {},
) => {
  return useQuery({
    queryKey: analyticsKeys.articlesPopular(params),
    queryFn: () => getAnalyticsArticlesPopular(params),
  });
};
