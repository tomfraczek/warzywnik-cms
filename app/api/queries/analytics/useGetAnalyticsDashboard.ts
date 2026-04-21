import { useQuery } from "@tanstack/react-query";
import { getAnalyticsDashboard } from "@/app/api/api.requests";

export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: (top: number) => [...analyticsKeys.all, "dashboard", top] as const,
  vegetablesPopular: (params: object) =>
    [...analyticsKeys.all, "vegetables-popular", params] as const,
  articlesPopular: (params: object) =>
    [...analyticsKeys.all, "articles-popular", params] as const,
};

export const useGetAnalyticsDashboard = (top = 10) => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(top),
    queryFn: () => getAnalyticsDashboard(top),
  });
};
