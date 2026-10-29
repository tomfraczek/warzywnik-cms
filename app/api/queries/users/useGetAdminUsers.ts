import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/app/api/api.requests";
import type { AdminUsersQuery } from "@/app/api/api.types";

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  list: (params: AdminUsersQuery) =>
    [...adminUserKeys.all, "list", params] as const,
  detail: (id: string) => [...adminUserKeys.all, "detail", id] as const,
};

export const useGetAdminUsers = (params: AdminUsersQuery = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => getAdminUsers(params),
  });
};
