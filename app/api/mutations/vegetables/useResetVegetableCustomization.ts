import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetVegetableCustomization } from "@/app/api/api.requests";
import type { Vegetable } from "@/app/api/api.types";
import { vegetableKeys } from "@/app/api/queries/vegetables/useGetVegetables";

export const useResetVegetableCustomization = () => {
  const queryClient = useQueryClient();

  return useMutation<Vegetable, unknown, string>({
    mutationFn: (id: string) => resetVegetableCustomization(id),
    onSuccess: (updated, id) => {
      queryClient.setQueryData(vegetableKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: vegetableKeys.all });
    },
  });
};
