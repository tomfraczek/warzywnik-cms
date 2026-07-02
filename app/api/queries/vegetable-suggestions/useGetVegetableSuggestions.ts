import { useQuery } from "@tanstack/react-query";
import { getVegetableSuggestions } from "@/app/api/api.requests";
import type { VegetableSuggestionsAdminQuery } from "@/app/api/api.types";

export const vegetableSuggestionKeys = {
  all: ["admin", "vegetable-suggestions"] as const,
  list: (params: VegetableSuggestionsAdminQuery) =>
    [...vegetableSuggestionKeys.all, params] as const,
};

export const useGetVegetableSuggestions = (
  params: VegetableSuggestionsAdminQuery = {},
) => {
  return useQuery({
    queryKey: vegetableSuggestionKeys.list(params),
    queryFn: () => getVegetableSuggestions(params),
  });
};
