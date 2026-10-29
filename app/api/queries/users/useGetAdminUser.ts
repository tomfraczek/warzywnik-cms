import { useQuery } from "@tanstack/react-query";
import { getAdminUser } from "@/app/api/api.requests";
import { adminUserKeys } from "@/app/api/queries/users/useGetAdminUsers";

const fetchAdminUser = (id: string) => async () => {
  return getAdminUser(id);
};

export const useGetAdminUser = (id?: string) => {
  return useQuery({
    queryKey: adminUserKeys.detail(id || ""),
    queryFn: fetchAdminUser(id || ""),
    enabled: Boolean(id),
  });
};
