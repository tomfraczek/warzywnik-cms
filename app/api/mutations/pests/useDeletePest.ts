import { useMutation } from "@tanstack/react-query";
import { deleteManyPests, deletePest } from "@/app/api/api.requests";

type DeletePestByIdInput = {
  id: string;
};

type DeletePestsManyInput = {
  ids: string[];
};

type DeletePestInput = DeletePestByIdInput | DeletePestsManyInput;

const deletePestMutation = async (input: DeletePestInput) => {
  if ("ids" in input) {
    await deleteManyPests({ ids: [...new Set(input.ids)] });
    return;
  }

  await deletePest(input.id);
};

export const useDeletePest = () => {
  return useMutation<void, unknown, DeletePestInput>({
    mutationFn: deletePestMutation,
  });
};
