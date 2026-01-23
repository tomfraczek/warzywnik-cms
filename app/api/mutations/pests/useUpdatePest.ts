import { useMutation } from "@tanstack/react-query";
import { updatePest } from "@/app/api/api.requests";
import type { UpdatePestPayload, Pest } from "@/app/api/api.types";

type UpdatePestInput = {
  id: string;
  payload: UpdatePestPayload;
};

const updatePestMutation = async ({ id, payload }: UpdatePestInput) => {
  return updatePest(id, payload);
};

export const useUpdatePest = () => {
  return useMutation<Pest, unknown, UpdatePestInput>({
    mutationFn: updatePestMutation,
  });
};
