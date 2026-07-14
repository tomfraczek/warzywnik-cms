import { useQuery } from "@tanstack/react-query";
import { getContactMessage } from "@/app/api/api.requests";
import { contactMessageKeys } from "@/app/api/queries/contact-messages/useGetContactMessages";

const fetchContactMessage = (id: string) => async () => {
  return getContactMessage(id);
};

export const useGetContactMessage = (id?: string) => {
  return useQuery({
    queryKey: contactMessageKeys.detail(id || ""),
    queryFn: fetchContactMessage(id || ""),
    enabled: Boolean(id),
  });
};
