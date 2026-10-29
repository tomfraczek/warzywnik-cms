import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminUser } from "@/app/api/api.requests";
import { adminUserKeys } from "@/app/api/queries/users/useGetAdminUsers";

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};
