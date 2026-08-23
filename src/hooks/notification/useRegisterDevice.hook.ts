import { HY } from "@/constants/hy";
import { notificationApi } from "@/services/notification";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useRegisterDevice = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  return useMutation({
    mutationFn: notificationApi.registerDevice,
    mutationKey: ["register-device"],
    onSuccess: (data) => {
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Սարքը գրանցել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
