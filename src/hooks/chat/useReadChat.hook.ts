import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useReadChat = (
  onSuccessCallback: (data: unknown) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient_id: string | number) => chatApi.readAsChat(patient_id),
    mutationKey: ["read-chat"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: chatKeys.notifications,
      });
      await queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount,
      });
      onSuccessCallback(data);
    },
  });
};
