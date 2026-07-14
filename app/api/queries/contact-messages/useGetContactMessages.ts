import { useQuery } from "@tanstack/react-query";
import { getContactMessages } from "@/app/api/api.requests";
import type { ContactMessagesAdminQuery } from "@/app/api/api.types";

export const contactMessageKeys = {
  all: ["admin", "contact-messages"] as const,
  list: (params: ContactMessagesAdminQuery) =>
    [...contactMessageKeys.all, "list", params] as const,
  detail: (id: string) => [...contactMessageKeys.all, "detail", id] as const,
};

export const useGetContactMessages = (
  params: ContactMessagesAdminQuery = {},
) => {
  return useQuery({
    queryKey: contactMessageKeys.list(params),
    queryFn: () => getContactMessages(params),
  });
};
