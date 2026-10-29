import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkDeleteAdminUsers } from "@/app/api/api.requests";
import type { DeleteManyDto } from "@/app/api/api.types";
import { adminUserKeys } from "@/app/api/queries/users/useGetAdminUsers";

export const useBulkDeleteAdminUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: number }, unknown, DeleteManyDto>({
    mutationFn: bulkDeleteAdminUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};
