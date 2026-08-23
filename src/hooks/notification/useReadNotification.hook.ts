import { HY } from "@/constants/hy";
import { notificationApi } from "@/services/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useReadNotification = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.readNotification,
    mutationKey: ["read-notification"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.refetchQueries({
        queryKey: ["notifications-unread-count"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Ծանուցումը կարդացված նշել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
