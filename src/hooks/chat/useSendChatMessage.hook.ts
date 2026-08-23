import { HY } from "@/constants/hy";
import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useSendChatMessage = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.sendChatsMessage,
    mutationKey: ["send-chat-message"],
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.patient_id),
      });
      await queryClient.invalidateQueries({
        queryKey: chatKeys.notifications,
      });
      await queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount,
      });
      onSuccessCallback(data);
    },
    onError: (error) => {
      Alert.alert(HY.error, HY.sendMessageFailed);
      onErrorCallback(error);
    },
  });
};
