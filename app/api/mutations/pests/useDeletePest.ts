import { useMutation } from "@tanstack/react-query";
import { deletePest } from "@/app/api/api.requests";

type DeletePestInput = {
  id: string;
};

const deletePestMutation = async ({ id }: DeletePestInput) => {
  await deletePest(id);
};

export const useDeletePest = () => {
  return useMutation<void, unknown, DeletePestInput>({
    mutationFn: deletePestMutation,
  });
};
