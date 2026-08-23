import { HY } from "@/constants/hy";
import { notificationApi } from "@/services/notification";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useUnregisterDevice = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  return useMutation({
    mutationFn: notificationApi.unregisterDevice,
    mutationKey: ["unregister-device"],
    onSuccess: (data) => {
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Սարքը հեռացնել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
