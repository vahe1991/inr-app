import { HY } from "@/constants/hy";
import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useReadAllChatNotifications = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.readAllChatNotifications,
    mutationKey: ["read-all-chat-notifications"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: chatKeys.notifications,
      });
      await queryClient.refetchQueries({
        queryKey: chatKeys.unreadCount,
      });
      onSuccessCallback(data);
    },
    onError: (error) => {
      Alert.alert(HY.error, HY.readAllChatFailed);
      onErrorCallback(error);
    },
  });
};
