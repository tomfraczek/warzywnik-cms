import { useQuery } from "@tanstack/react-query";
import { getActionAutomationCoverage } from "@/app/api/api.requests";

export const actionAutomationKeys = {
  all: ["action-automation"] as const,
  coverage: () => [...actionAutomationKeys.all, "coverage"] as const,
  preview: (plantingId: string) =>
    [...actionAutomationKeys.all, "preview", plantingId] as const,
};

export const useGetActionAutomationCoverage = () => {
  return useQuery({
    queryKey: actionAutomationKeys.coverage(),
    queryFn: () => getActionAutomationCoverage(),
  });
};
