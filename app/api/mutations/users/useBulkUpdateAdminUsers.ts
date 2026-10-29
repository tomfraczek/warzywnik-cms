import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateAdminUsers } from "@/app/api/api.requests";
import type { BulkUpdateAdminUsersPayload } from "@/app/api/api.types";
import { adminUserKeys } from "@/app/api/queries/users/useGetAdminUsers";

export const useBulkUpdateAdminUsers = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { updated: number },
    unknown,
    BulkUpdateAdminUsersPayload
  >({
    mutationFn: bulkUpdateAdminUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
};
