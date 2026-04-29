import { useQuery } from "@tanstack/react-query";
import { getPlantingTaskGenerationPreview } from "@/app/api/api.requests";
import { actionAutomationKeys } from "./useGetActionAutomationCoverage";

export const useGetPlantingTaskGenerationPreview = (plantingId?: string) => {
  return useQuery({
    queryKey: actionAutomationKeys.preview(plantingId ?? ""),
    queryFn: () => getPlantingTaskGenerationPreview(plantingId ?? ""),
    enabled: Boolean(plantingId),
  });
};
