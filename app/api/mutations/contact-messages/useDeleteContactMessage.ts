import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContactMessage } from "@/app/api/api.requests";
import { contactMessageKeys } from "@/app/api/queries/contact-messages/useGetContactMessages";

export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactMessageKeys.all });
    },
  });
};
