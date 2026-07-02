import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVegetableSuggestion } from "@/app/api/api.requests";
import { vegetableSuggestionKeys } from "@/app/api/queries/vegetable-suggestions/useGetVegetableSuggestions";

export const useDeleteVegetableSuggestion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: deleteVegetableSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vegetableSuggestionKeys.all });
    },
  });
};
