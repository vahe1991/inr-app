import { HY } from "@/constants/hy";
import { notificationApi } from "@/services/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useReadAllNotifications = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.readAllNotifications,
    mutationKey: ["read-all-notifications"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.refetchQueries({
        queryKey: ["notifications-unread-count"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Ծանուցումները կարդացված նշել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
