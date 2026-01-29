import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePest } from "@/app/api/api.requests";
import type { UpdatePestPayload, Pest } from "@/app/api/api.types";
import { pestKeys } from "@/app/api/queries/pests/useGetPests";

type UpdatePestInput = {
  id: string;
  payload: UpdatePestPayload;
};

const updatePestMutation = async ({ id, payload }: UpdatePestInput) => {
  return updatePest(id, payload);
};

export const useUpdatePest = () => {
  const queryClient = useQueryClient();

  return useMutation<Pest, unknown, UpdatePestInput>({
    mutationFn: updatePestMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pestKeys.all,
      });
    },
  });
};
