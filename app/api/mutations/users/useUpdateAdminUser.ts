import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminUser } from "@/app/api/api.requests";
import type {
  AdminUserDetails,
  UpdateAdminUserPayload,
} from "@/app/api/api.types";
import { adminUserKeys } from "@/app/api/queries/users/useGetAdminUsers";

type UpdateAdminUserParams = {
  id: string;
  payload: UpdateAdminUserPayload;
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUserDetails, unknown, UpdateAdminUserParams>({
    mutationFn: ({ id, payload }) => updateAdminUser(id, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(adminUserKeys.detail(user.id), user);
      queryClient.invalidateQueries({
        queryKey: [...adminUserKeys.all, "list"],
      });
    },
  });
};
