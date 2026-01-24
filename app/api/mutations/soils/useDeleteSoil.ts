import { useMutation } from "@tanstack/react-query";
import { deleteSoil } from "@/app/soils/api/api.requests";

type DeleteSoilInput = {
  id: string;
};

const deleteSoilMutation = async ({ id }: DeleteSoilInput) => {
  await deleteSoil(id);
};

export const useDeleteSoil = () => {
  return useMutation<void, unknown, DeleteSoilInput>({
    mutationFn: deleteSoilMutation,
  });
};
